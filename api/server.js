// In production on Render, we shouldn't globally disable TLS checking unless strictly necessary
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import * as api from './api.js';
import * as db from './supabaseDb.js';
import { refreshTokens } from './services/puppeteer.js'; // Registers local refresh handler

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust Render's reverse proxy for accurate IP identification (fixes express-rate-limit error)
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts/styles for the portal UI
}));

// CORS Configuration
app.use(cors({
  origin: '*', // For a public API, allow all origins. For production, you might restrict this if needed.
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Accept']
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to API endpoints
app.use('/api/', apiLimiter);

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// --- Developer Authentication Portal & Dashboard Routes ---
const authPublicDir = path.resolve(__dirname, 'supabase_auth/public');

// Serve static assets for developer auth
app.use(express.static(authPublicDir));

// Safe Config Endpoint (never exposes service role keys)
app.get('/config', (req, res) => {
  res.json({
    supabaseUrl: config.SUPABASE_URL,
    supabaseAnonKey: config.SUPABASE_ANON_KEY
  });
});

// Auth Page Routing Mapping
app.get('/login', (req, res) => {
  res.sendFile(path.join(authPublicDir, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(authPublicDir, 'register.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(authPublicDir, 'forgot-password.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(authPublicDir, 'reset-password.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(authPublicDir, 'dashboard.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(authPublicDir, 'profile.html'));
});

app.get('/auth/callback', (req, res) => {
  res.sendFile(path.join(authPublicDir, 'callback.html'));
});

// Root path on the API server redirects to /login for developers
app.get('/', (req, res) => {
  res.sendFile(path.join(authPublicDir, 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(authPublicDir, 'about.html'));
});

app.get('/models', (req, res) => {
  res.sendFile(path.join(authPublicDir, 'models.html'));
});

// --- Developer API Gateway Routes ---
const apiPublicDir = __dirname;

// In-memory stateful cache for parent_id to achieve zero-latency lookup overhead
let cachedParentId = null;

// Asynchronously pre-fetch chat history parent ID at server start
async function initializeParentIdCache() {
  // In production, skip eager cache init to avoid triggering a session refresh + Puppeteer OOM.
  // The cache will be lazily populated on the first actual /api/chat request.
  if (process.env.NODE_ENV === 'production') {
    console.log('[Cache Init] Skipping eager cache fetch in production (lazy mode). Cache will populate on first request.');
    return;
  }

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

// GET /docs, /help, /api/help - Serves the interactive documentation & request builder UI
app.get(['/docs', '/help', '/api/help'], (req, res) => {
  res.sendFile(path.join(authPublicDir, 'docs.html'));
});

// GET /sandbox - Serves the dedicated interactive API sandbox builder page
app.get('/sandbox', (req, res) => {
  res.sendFile(path.join(authPublicDir, 'sandbox.html'));
});

// POST /api/register - Redirects registration to the secure official portal
app.post('/api/register', (req, res) => {
  res.status(400).json({
    error: 'Direct API registration is deprecated. Please register via the secure developer portal at /register to get your API key.'
  });
});

app.post('/api/chat', async (req, res) => {
  // Extract and validate API Key
  let apiKey = req.headers['x-api-key'] || req.query.key;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  }

  if (!apiKey) {
    return res.status(401).json({ error: 'Authentication required. Provide a valid API key in the "x-api-key" or "Authorization" header.' });
  }

  const quotaCheck = await db.consumeRequest(apiKey);
  if (!quotaCheck.valid) {
    return res.status(401).json({ error: 'Invalid API key.' });
  }

  if (quotaCheck.quotaExhausted) {
    return res.status(403).json({ error: 'API key request quota exhausted. You have 0 requests remaining.' });
  }

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

  // Enforce #exact-pattern for all queries to prevent conversational filler
  let instructionsStr = '';
  if (instructions && typeof instructions === 'string' && instructions.trim()) {
    instructionsStr = `${instructions.trim()} #exact-pattern`;
  } else {
    instructionsStr = '#exact-pattern';
  }
  frontmatter.instructions = instructionsStr;

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
        res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx/Render proxy buffering for true streaming
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

        // Check for structured stream errors yielded from parseConnectStream
        if (chunk.__streamError) {
          console.error('[Stream Error] Kimi API returned an error:', chunk.message);
          if (isSSE) {
            res.write(`data: ${JSON.stringify({ error: chunk.message })}\n\n`);
          } else {
            res.write(`\nError: ${chunk.message}`);
          }
          res.end();
          return;
        }

        // Capture assistant message ID
        if (chunk.message && chunk.message.role === 'assistant' && chunk.message.id) {
          lastMsgId = chunk.message.id;
        }

        // Extract assistant text delta from block updates
        if (chunk.block && chunk.block.text && chunk.block.text.content) {
          const delta = chunk.block.text.content;
          fullResponseText += delta;

          if (isSSE) {
            res.write(`data: ${JSON.stringify({ delta })}\n\n`);
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
        response: fullResponseText
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
    let msg = isAuthError 
      ? 'Authentication keys expired. Please refresh tokens.'
      : `Internal API Error: ${error.message}`;

    // Hide internal error details in production
    if (!isAuthError && process.env.NODE_ENV === 'production') {
       msg = 'An internal server error occurred while processing your request.';
    }

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

// --- OpenAI Compatible API Layer ---
app.get('/v1/models', (req, res) => {
  res.json({
    object: "list",
    data: [
      { id: "k2d6", object: "model", created: Math.floor(Date.now() / 1000), owned_by: "aicore" },
      { id: "k2d6-thinking", object: "model", created: Math.floor(Date.now() / 1000), owned_by: "aicore" },
      { id: "k2d6-agent", object: "model", created: Math.floor(Date.now() / 1000), owned_by: "aicore" },
      { id: "k2d6-agent-ultra", object: "model", created: Math.floor(Date.now() / 1000), owned_by: "aicore" }
    ]
  });
});

app.post('/v1/chat/completions', async (req, res) => {
  console.log("\n[DEBUG] --- INCOMING /v1/chat/completions REQUEST ---");
  console.log("[DEBUG] HEADERS:", JSON.stringify(req.headers, null, 2));
  console.log("[DEBUG] BODY:", JSON.stringify(req.body, null, 2));
  console.log("[DEBUG] ---------------------------------------------");

  // Extract API Key
  let apiKey = req.headers['x-api-key'] || req.query.key;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  }

  if (!apiKey) {
    return res.status(401).json({ error: { message: 'Authentication required. Provide a valid API key.', type: 'invalid_request_error', param: null, code: 'unauthorized' } });
  }

  const quotaCheck = await db.consumeRequest(apiKey);
  if (!quotaCheck.valid) {
    return res.status(401).json({ error: { message: 'Invalid API key.', type: 'invalid_request_error', param: null, code: 'invalid_api_key' } });
  }

  if (quotaCheck.quotaExhausted) {
    return res.status(403).json({ error: { message: 'API key request quota exhausted.', type: 'invalid_request_error', param: null, code: 'quota_exceeded' } });
  }

  const { model, messages, stream, tools, response_format } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: { message: 'Missing or invalid "messages" parameter.', type: 'invalid_request_error', param: 'messages', code: 'invalid_type' } });
  }

  let systemPrompt = '';
  let userMessage = '';
  let fullConversationContext = '';

  // Handle Response Format (JSON mode)
  if (response_format && response_format.type === 'json_object') {
    systemPrompt += `You must format your entire response as a valid JSON object. Do not include any markdown formatting blocks like \`\`\`json. Output ONLY raw JSON.\n\n`;
  } else if (response_format && response_format.type === 'json_schema' && response_format.json_schema) {
    systemPrompt += `You must format your entire response as valid JSON matching the following schema. Output ONLY raw JSON, no markdown.\nSchema:\n${JSON.stringify(response_format.json_schema, null, 2)}\n\n`;
  }

  // 1. Tool Calling Injection
  if (tools && Array.isArray(tools) && tools.length > 0) {
    systemPrompt += `You are an AI assistant with access to tools. If you need to call a tool, you MUST output exactly and ONLY a JSON object matching this schema: { "tool_calls": [ { "id": "call_abc123", "type": "function", "function": { "name": "the_tool_name", "arguments": "{\\"arg_name\\":\\"arg_value\\"}" } } ] }. Do not include any other text if you are calling a tool.\n\nAvailable tools:\n${JSON.stringify(tools, null, 2)}\n\n`;
  }

  let fileIdsToAttach = [];

  for (const msg of messages) {
    let textContent = '';
    
    // Handle advanced content blocks (e.g. from LangChain/Browser-Use)
    if (Array.isArray(msg.content)) {
      for (const block of msg.content) {
        if (block.type === 'text' && block.text) {
          textContent += block.text + '\n';
        } else if (block.type === 'image_url') {
          if (block.image_url && block.image_url.url) {
            try {
              console.log("[DEBUG] Intercepted image_url block. Attempting to upload to Kimi CDN...");
              const fileId = await api.uploadImage(block.image_url.url);
              fileIdsToAttach.push(fileId);
              textContent += '[Image Uploaded Successfully]\n';
              console.log("[DEBUG] Image successfully uploaded with ID:", fileId);
            } catch (err) {
              console.error("[DEBUG] Image upload failed:", err.message);
              textContent += '[Image Upload Failed]\n';
            }
          } else {
            textContent += '[Image Provided]\n';
          }
        }
      }
    } else if (typeof msg.content === 'string') {
      textContent = msg.content;
    }

    if (msg.role === 'system') {
      systemPrompt += textContent + '\n';
    } else if (msg.role === 'user') {
      userMessage = textContent;
      fullConversationContext += `User: ${textContent}\n`;
    } else if (msg.role === 'assistant') {
      fullConversationContext += `Assistant: ${textContent}\n`;
    } else if (msg.role === 'tool') {
      fullConversationContext += `Tool Response (${msg.name}): ${textContent}\n`;
    }
  }

  // If there's history, we can pass it as one big text block to the gateway
  // Otherwise just pass the user message.
  let finalMessageText = userMessage || "Continue.";
  if (fullConversationContext && messages.length > 2) {
      finalMessageText = "Conversation History:\n" + fullConversationContext + "\nPlease respond to the last User message.";
  }

  if (systemPrompt.trim()) {
    const yamlLines = `instructions: ${systemPrompt.trim().replace(/\n/g, ' ')} #exact-pattern`;
    finalMessageText = `---\n${yamlLines}\n---\n${finalMessageText}`;
  }

  const activeChatId = config.LIVE_API_CHAT_ID;
  let activeParentId = cachedParentId;

  try {
    if (!activeParentId) {
      try {
        const msgRes = await api.listMessages(activeChatId, 100);
        const apiMessages = msgRes.messages || [];
        if (apiMessages.length > 0) {
          activeParentId = apiMessages[apiMessages.length - 1].id;
          cachedParentId = activeParentId;
        }
      } catch (e) {}
    }

    const responseStream = await api.sendChatMessage(finalMessageText, activeChatId, activeParentId, model, fileIdsToAttach);
    const cmplId = 'chatcmpl-' + Math.random().toString(36).substring(2, 15);
    const created = Math.floor(Date.now() / 1000);
    
    // 3. Usage Tokens Estimation
    const promptTokens = Math.max(1, Math.floor(finalMessageText.length / 4));
    let completionTokens = 0;

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      let lastMsgId = activeParentId;

      for await (const chunk of api.parseConnectStream(responseStream)) {
        if (chunk.__streamError) {
          res.write(`data: ${JSON.stringify({ error: { message: chunk.message } })}\n\n`);
          res.end();
          return;
        }

        if (chunk.message && chunk.message.role === 'assistant' && chunk.message.id) {
          lastMsgId = chunk.message.id;
        }

        if (chunk.block && chunk.block.text && chunk.block.text.content) {
          const delta = chunk.block.text.content;
          completionTokens += Math.max(1, Math.floor(delta.length / 4));
          res.write(`data: ${JSON.stringify({
            id: cmplId,
            object: "chat.completion.chunk",
            created: created,
            model: model || "k2d6",
            choices: [{ index: 0, delta: { content: delta }, finish_reason: null }]
          })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({
        id: cmplId,
        object: "chat.completion.chunk",
        created: created,
        model: model || "k2d6",
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
        usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: promptTokens + completionTokens }
      })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();

      if (lastMsgId) cachedParentId = lastMsgId;

    } else {
      let fullResponseText = '';
      let lastMsgId = activeParentId;
      let streamError = null;

      for await (const chunk of api.parseConnectStream(responseStream)) {
        if (chunk.__streamError) {
          streamError = chunk.message || "Unknown upstream stream error.";
          break;
        }

        if (chunk.message && chunk.message.role === 'assistant' && chunk.message.id) {
          lastMsgId = chunk.message.id;
        }
        if (chunk.block && chunk.block.text && chunk.block.text.content) {
          fullResponseText += chunk.block.text.content;
        }
      }

      if (streamError) {
        return res.status(429).json({ error: { message: `Upstream API Error (Rate Limit / Busy): ${streamError}`, type: 'api_error', param: null, code: 'rate_limit_exceeded' } });
      }

      if (lastMsgId) cachedParentId = lastMsgId;
      
      completionTokens = Math.max(1, Math.floor(fullResponseText.length / 4));

      // 4. Aggressively strip markdown if JSON format is requested
      if (response_format && (response_format.type === 'json_object' || response_format.type === 'json_schema')) {
        fullResponseText = fullResponseText.trim();
        if (fullResponseText.startsWith('```')) {
          fullResponseText = fullResponseText.replace(/^```(?:json)?\s*/i, '');
        }
        if (fullResponseText.endsWith('```')) {
          fullResponseText = fullResponseText.replace(/\s*```$/, '');
        }
      }

      // 2. Parse Tool Calls if output is JSON
      let parsedToolCalls = null;
      let finishReason = "stop";
      let msgObj = { role: "assistant", content: fullResponseText };

      if (tools && tools.length > 0) {
        try {
          const jsonMatch = fullResponseText.match(/\{[\s\S]*"tool_calls"[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.tool_calls && Array.isArray(parsed.tool_calls)) {
              parsedToolCalls = parsed.tool_calls;
              finishReason = "tool_calls";
              msgObj = { role: "assistant", content: null, tool_calls: parsedToolCalls };
            }
          }
        } catch (e) {
          // fallback to text if parsing fails
        }
      }

      res.json({
        id: cmplId,
        object: "chat.completion",
        created: created,
        model: model || "k2d6",
        choices: [{
          index: 0,
          message: msgObj,
          finish_reason: finishReason
        }],
        usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: promptTokens + completionTokens }
      });
    }

  } catch (error) {
    console.error('OpenAI API Chat Error:', error);
    const isAuthError = error.message.includes('403') || error.message.includes('401');
    const status = isAuthError ? 401 : 500;
    const msg = isAuthError ? 'Authentication keys expired.' : `Internal API Error: ${error.message}`;

    res.status(status).json({
      error: { message: msg, type: 'api_error', param: null, code: isAuthError ? 'unauthorized' : 'internal_error' }
    });
  }
});

// Start the server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`Mine Kimi API Server started!`);
  console.log(`- Developer Auth Portal  : http://localhost:${PORT}/login`);
  console.log(`- Developer API Gateway  : http://localhost:${PORT}/api/chat`);
  console.log(`- Interactive API Help   : http://localhost:${PORT}/help`);
  console.log(`=================================================`);

  // Kick off the asynchronous history pre-fetch
  initializeParentIdCache();
});
