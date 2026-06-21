import express from 'express';
import bodyParser from 'body-parser';
import { config } from './config.js';
import * as api from './api.js';

const app = express();

// In-memory stateful cache for parent_id to achieve zero-latency lookup overhead
let cachedParentId = null;

// Asynchronously pre-fetch chat history parent ID at server start
async function initializeParentIdCache() {
  try {
    console.log(`[Cache Init] Pre-fetching latest parent_id for chat: ${config.LIVE_API_CHAT_ID}`);
    const msgRes = await api.listMessages(config.LIVE_API_CHAT_ID, 50);
    const apiMessages = msgRes.messages || [];
    if (apiMessages.length > 0) {
      cachedParentId = apiMessages[apiMessages.length - 1].id;
      console.log(`[Cache Init] Successfully populated cachedParentId: ${cachedParentId}`);
    } else {
      console.log(`[Cache Init] Chat history is empty. cachedParentId remains null.`);
    }
  } catch (error) {
    console.error(`[Cache Init] Warning: Failed to pre-fetch chat history:`, error.message);
  }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simple logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// GET /api/models - Returns list of supported model keys
app.get('/api/models', (req, res) => {
  res.json({
    models: [
      { key: "k2d6", displayName: "K2.6 Instant", description: "Quick response" },
      { key: "k2d6-thinking", displayName: "K2.6 Thinking", description: "Deep thinking for complex questions" },
      { key: "k2d6-agent", displayName: "K2.6 Agent", description: "Research, slides, sheets" },
      { key: "k2d6-agent-ultra", displayName: "K2.6 Agent Swarm", description: "Large-scale search" }
    ]
  });
});

app.post('/api/chat', async (req, res) => {
  const {
    message,
    instructions,
    model,
    stream,
    format,
    tone,
    audience,
    role,
    language,
    structure,
    max_words,
    no_emojis,
    bullets_only
  } = req.body;
  const wantStream = stream !== false; // default to true

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "message" parameter in request body.' });
  }

  // Load stateful chat ID from environment configuration
  const activeChatId = config.LIVE_API_CHAT_ID;
  let activeParentId = cachedParentId;
  let finalMessageText = message;

  // Build YAML frontmatter block for formatting and styling instructions
  const frontmatter = {};
  if (instructions && typeof instructions === 'string' && instructions.trim()) frontmatter.instructions = instructions.trim();
  if (format && typeof format === 'string' && format.trim()) frontmatter.format = format.trim();
  if (tone && typeof tone === 'string' && tone.trim()) frontmatter.tone = tone.trim();
  if (audience && typeof audience === 'string' && audience.trim()) frontmatter.audience = audience.trim();
  if (role && typeof role === 'string' && role.trim()) frontmatter.role = role.trim();
  if (language && typeof language === 'string' && language.trim()) frontmatter.language = language.trim();
  if (structure && typeof structure === 'string' && structure.trim()) frontmatter.structure = structure.trim();
  if (max_words) frontmatter.max_words = max_words;
  if (no_emojis !== undefined) frontmatter.no_emojis = no_emojis;
  if (bullets_only !== undefined) frontmatter.bullets_only = bullets_only;

  if (Object.keys(frontmatter).length > 0) {
    const yamlLines = Object.entries(frontmatter)
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');
    finalMessageText = `---\n${yamlLines}\n---\n${message}`;
  }

  try {
    // Automatically retrieve the last message ID from history to set as the parent_id if cache is empty
    if (!activeParentId) {
      try {
        console.log(`Cache is empty. Fetching latest message ID from chat ${activeChatId} to use as parent_id...`);
        const msgRes = await api.listMessages(activeChatId, 100);
        const apiMessages = msgRes.messages || [];
        if (apiMessages.length > 0) {
          activeParentId = apiMessages[apiMessages.length - 1].id;
          cachedParentId = activeParentId;
          console.log(`Resolved and cached parent_id: ${activeParentId}`);
        }
      } catch (e) {
        console.error(`Failed to retrieve parent_id fallback for chat ${activeChatId}:`, e.message);
      }
    } else {
      console.log(`Using cached parent_id: ${activeParentId} (Zero Latency Lookup)`);
    }

    // Phase 2: Send the user message
    console.log(`Sending message to model: ${model || 'k2d6'}, chat: ${activeChatId || 'new'}, parent: ${activeParentId || 'root'}`);
    const responseStream = await api.sendChatMessage(finalMessageText, activeChatId, activeParentId, model);

    if (wantStream) {
      // Set headers for event stream or chunked text transfer
      const acceptHeader = req.headers['accept'] || '';
      const isSSE = acceptHeader.includes('text/event-stream');

      if (isSSE) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
      } else {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
      }

      let fullResponseText = '';
      let serverChatId = activeChatId;
      let lastMsgId = activeParentId;

      for await (const chunk of api.parseConnectStream(responseStream)) {
        if (chunk.chatId) serverChatId = chunk.chatId;
        else if (chunk.chat_id) serverChatId = chunk.chat_id;
        else if (chunk.chat && chunk.chat.id) serverChatId = chunk.chat.id;
        else if (chunk.message && chunk.message.chatId) serverChatId = chunk.message.chatId;

        // Capture assistant message ID
        if (chunk.message && chunk.message.role === 'assistant' && chunk.message.id) {
          lastMsgId = chunk.message.id;
        }

        // Extract assistant text delta from block updates
        if (chunk.block && chunk.block.text && chunk.block.text.content) {
          const delta = chunk.block.text.content;
          fullResponseText += delta;

          if (isSSE) {
            res.write(`data: ${JSON.stringify({ delta, chat_id: serverChatId, parent_id: lastMsgId })}\n\n`);
          } else {
            res.write(delta);
          }
        }
      }

      if (isSSE) {
        res.write('data: [DONE]\n\n');
      }
      res.end();

      if (lastMsgId) {
        cachedParentId = lastMsgId;
        console.log(`[Cache Sync] Updated cachedParentId for next request: ${cachedParentId}`);
      }

    } else {
      // Non-streaming response: accumulate and return final JSON
      let fullResponseText = '';
      let serverChatId = activeChatId;
      let lastMsgId = activeParentId;

      for await (const chunk of api.parseConnectStream(responseStream)) {
        if (chunk.chatId) serverChatId = chunk.chatId;
        else if (chunk.chat_id) serverChatId = chunk.chat_id;
        else if (chunk.chat && chunk.chat.id) serverChatId = chunk.chat.id;

        // Capture assistant message ID
        if (chunk.message && chunk.message.role === 'assistant' && chunk.message.id) {
          lastMsgId = chunk.message.id;
        }

        // Extract assistant text delta from block updates
        if (chunk.block && chunk.block.text && chunk.block.text.content) {
          const delta = chunk.block.text.content;
          fullResponseText += delta;
        }
      }

      res.json({
        response: fullResponseText,
        chat_id: serverChatId,
        parent_id: lastMsgId
      });

      if (lastMsgId) {
        cachedParentId = lastMsgId;
        console.log(`[Cache Sync] Updated cachedParentId for next request: ${cachedParentId}`);
      }
    }

  } catch (error) {
    console.error('API Chat Error:', error);
    const isAuthError = error.message.includes('403') || error.message.includes('401');
    const status = isAuthError ? 401 : 500;
    const msg = isAuthError 
      ? 'Authentication keys expired. Please refresh tokens by running the Puppeteer automation script.'
      : `Internal API Error: ${error.message}`;

    if (res.headersSent) {
      if (req.headers['accept'] && req.headers['accept'].includes('text/event-stream')) {
        res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      } else {
        res.write(`\nError: ${msg}`);
      }
      res.end();
    } else {
      res.status(status).json({ error: msg });
    }
  }
});

// Start the high speed api server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`High-Speed Public API Server started!`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`POST /api/chat accepts JSON body.`);
  console.log(`=================================================`);
  
  // Kick off the asynchronous history pre-fetch
  initializeParentIdCache();
});
