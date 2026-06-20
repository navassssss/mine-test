process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import express from 'express';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import { marked } from 'marked';
import { config } from './config.js';
import * as api from './services/api.js';
import { refreshTokens } from './services/puppeteer.js';
import fs from 'fs';
import path from 'path';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up simple session flash memory
let flash = null;
app.use((req, res, next) => {
  res.locals.flash = flash;
  flash = null; // Clear after reading
  next();
});

// A helper to render views using our ultra-lightweight custom template parser
function render(viewName, data = {}) {
  const viewsDir = path.resolve(process.cwd(), 'src/views');
  const viewPath = path.join(viewsDir, `${viewName}.html`);
  const layoutPath = path.join(viewsDir, 'layout.html');

  if (!fs.existsSync(viewPath)) {
    throw new Error(`View file not found: ${viewPath}`);
  }

  let viewContent = fs.readFileSync(viewPath, 'utf8');
  let layoutContent = fs.readFileSync(layoutPath, 'utf8');

  // Combine flash messages
  const flashData = data.flash || {};

  // Replace simple variables in view
  Object.keys(data).forEach(key => {
    if (key !== 'body' && key !== 'flash') {
      const val = data[key];
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        // Triple brackets for raw HTML, double brackets for escaped
        viewContent = viewContent.replace(new RegExp(`{{{${key}}}}`, 'g'), val);
        const escaped = String(val)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        viewContent = viewContent.replace(new RegExp(`{{${key}}}`, 'g'), escaped);
      }
    }
  });

  // Handle {{#if chats}}...{{else}}...{{/if}}
  const chatsIfRegex = /\{\{#if chats\}\}(.*?)(?:\{\{else\}\}(.*?))?\{\{\/if\}\}/s;
  const chatsMatch = viewContent.match(chatsIfRegex);
  if (chatsMatch) {
    const thenBlock = chatsMatch[1];
    const elseBlock = chatsMatch[2] || '';
    if (data.chats && data.chats.length > 0) {
      viewContent = viewContent.replace(chatsIfRegex, thenBlock);
    } else {
      viewContent = viewContent.replace(chatsIfRegex, elseBlock);
    }
  }

  // Handle {{#if messages}}...{{else}}...{{/if}}
  const messagesIfRegex = /\{\{#if messages\}\}(.*?)(?:\{\{else\}\}(.*?))?\{\{\/if\}\}/s;
  const messagesMatch = viewContent.match(messagesIfRegex);
  if (messagesMatch) {
    const thenBlock = messagesMatch[1];
    const elseBlock = messagesMatch[2] || '';
    if (data.messages && data.messages.length > 0) {
      viewContent = viewContent.replace(messagesIfRegex, thenBlock);
    } else {
      viewContent = viewContent.replace(messagesIfRegex, elseBlock);
    }
  }

  // Render loops like {{#each chats}}...{{/each}}
  if (data.chats && data.chats.length > 0) {
    const eachRegex = /\{\{#each chats\}\}(.*?)\{\{\/each\}\}/s;
    const match = viewContent.match(eachRegex);
    if (match) {
      const template = match[1];
      const itemsHtml = data.chats.map(chat => {
        return template
          .replace(/\{\{id\}\}/g, chat.id)
          .replace(/\{\{name\}\}/g, chat.name || 'Unnamed Conversation')
          .replace(/\{\{updateTime\}\}/g, new Date(chat.updateTime).toLocaleString());
      }).join('\n');
      viewContent = viewContent.replace(eachRegex, itemsHtml);
    }
  }

  // Render messages loop
  if (data.messages && data.messages.length > 0) {
    const eachRegex = /\{\{#each messages\}\}(.*?)\{\{\/each\}\}/s;
    const match = viewContent.match(eachRegex);
    if (match) {
      const template = match[1];
      const itemsHtml = data.messages.map(msg => {
        return template
          .replace(/\{\{role\}\}/g, msg.role)
          .replace(/\{\{\{content\}\}\}/g, msg.content);
      }).join('\n');
      viewContent = viewContent.replace(eachRegex, itemsHtml);
    }
  }

  // Render layout
  let finalContent = layoutContent.replace('{{{body}}}', viewContent);

  // Handle flash messages injection
  if (flashData.message) {
    finalContent = finalContent.replace(/\{\{#if flashMessage\}\}(.*?)\{\{\/if\}\}/s, '$1');
    finalContent = finalContent.replace('{{flashMessage}}', flashData.message);
    finalContent = finalContent.replace('{{flashType}}', flashData.type || 'alert-success');
  } else {
    finalContent = finalContent.replace(/\{\{#if flashMessage\}\}(.*?)\{\{\/if\}\}/s, '');
  }

  // Replace layout level variables
  Object.keys(data).forEach(key => {
    const val = data[key];
    if (typeof val === 'string' || typeof val === 'number') {
      finalContent = finalContent.replace(new RegExp(`{{{${key}}}}`, 'g'), val);
      finalContent = finalContent.replace(new RegExp(`{{${key}}}`, 'g'), String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    }
  });

  // Clean up unused template elements
  finalContent = finalContent.replace(/\{\{#if [^}]+\}\}.*?\{\{\/if\}\}/gs, '');
  finalContent = finalContent.replace(/\{\{[^}]+\}\}/g, '');

  return finalContent;
}

// 1. Dashboard / Chat List Route
app.get('/', async (req, res) => {
  const pageData = {
    title: 'Chat Dashboard',
    userNickname: 'Unknown',
    userId: 'N/A',
    chats: [],
    flash: res.locals.flash
  };

  try {
    // Verify user profile
    const userRes = await api.getCurrentUser();
    if (userRes && userRes.user) {
      pageData.userNickname = userRes.user.nickname || 'Muhammed Navas V P P';
      pageData.userId = userRes.user.id || 'd7makaun3mk3r6v4rgq0';
    }

    // Fetch conversations list
    const chatsRes = await api.listChats(20);
    pageData.chats = chatsRes.chats || [];
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    pageData.flash = {
      message: `Authentication / Connection failed: ${error.message}. Please verify your .env settings or click "Refresh Session".`,
      type: 'alert-error'
    };
  }

  res.send(render('chat_list', pageData));
});

// 2. Refresh Tokens Route
app.get('/refresh', async (req, res) => {
  try {
    const result = await refreshTokens();
    if (result.success) {
      flash = {
        message: 'Session refreshed successfully! Cookies and headers updated.',
        type: 'alert-success'
      };
      res.redirect('/');
    } else {
      flash = {
        message: `Token refresh failed: ${result.reason || result.error || 'Unknown error'}`,
        type: 'alert-error'
      };
      res.redirect('/settings');
    }
  } catch (error) {
    flash = {
      message: `Token refresh error: ${error.message}`,
      type: 'alert-error'
    };
    res.redirect('/settings');
  }
});

// 3. Settings Form Route
app.get('/settings', (req, res) => {
  res.send(render('settings', {
    title: 'Settings',
    MINE_TEST_DOMAIN: config.MINE_TEST_DOMAIN,
    BEARER_TOKEN: config.BEARER_TOKEN,
    MINE_TEST_AUTH_COOKIE: config.MINE_TEST_AUTH_COOKIE,
    X_MSH_SESSION_ID: config.X_MSH_SESSION_ID,
    X_MSH_DEVICE_ID: config.X_MSH_DEVICE_ID,
    X_TRAFFIC_ID: config.X_TRAFFIC_ID,
    CF_BM: config.CF_BM,
    X_MSH_SHIELD_DATA: config.X_MSH_SHIELD_DATA,
    flash: res.locals.flash
  }));
});

// 4. Save Settings Route
app.post('/settings/save', (req, res) => {
  try {
    const updates = {
      MINE_TEST_DOMAIN: req.body.MINE_TEST_DOMAIN,
      BEARER_TOKEN: req.body.BEARER_TOKEN,
      MINE_TEST_AUTH_COOKIE: req.body.MINE_TEST_AUTH_COOKIE,
      X_MSH_SESSION_ID: req.body.X_MSH_SESSION_ID,
      X_MSH_DEVICE_ID: req.body.X_MSH_DEVICE_ID,
      X_TRAFFIC_ID: req.body.X_TRAFFIC_ID,
      CF_BM: req.body.CF_BM,
      X_MSH_SHIELD_DATA: req.body.X_MSH_SHIELD_DATA
    };

    config.update(updates);

    flash = {
      message: 'Configuration saved and written to .env file successfully!',
      type: 'alert-success'
    };
  } catch (error) {
    flash = {
      message: `Failed to save configuration: ${error.message}`,
      type: 'alert-error'
    };
  }
  res.redirect('/settings');
});

// 5. Create a new chat session and send the first message
app.post('/chat/new', async (req, res) => {
  const { message, model } = req.body;
  try {
    console.log('Starting a brand new chat session...');
    const stream = await api.sendChatMessage(message, null, null, 'SCENARIO_K2D5');

    // We must consume the stream fully to write the message on the backend before redirecting
    let fullResponse = '';
    let serverChatId = null;
    for await (const chunk of api.parseConnectStream(stream)) {
      // Try to extract chat ID from the stream chunk
      if (chunk.chatId) serverChatId = chunk.chatId;
      else if (chunk.chat_id) serverChatId = chunk.chat_id;
      else if (chunk.chat && chunk.chat.id) serverChatId = chunk.chat.id;
      else if (chunk.message && chunk.message.chatId) serverChatId = chunk.message.chatId;
      else if (chunk.message && chunk.message.chat_id) serverChatId = chunk.message.chat_id;

      if (chunk.message && chunk.message.blocks) {
        const block = chunk.message.blocks[0];
        if (block && block.text && block.text.content) {
          const content = block.text.content;
          if (content.startsWith(fullResponse)) {
            fullResponse = content;
          } else {
            fullResponse += content;
          }
        }
      }
    }

    // Fallback: If we couldn't parse the chat ID from the stream, fetch the latest chat from the chat list
    if (!serverChatId) {
      try {
        const chatListRes = await api.listChats(5);
        if (chatListRes && chatListRes.chats && chatListRes.chats.length > 0) {
          serverChatId = chatListRes.chats[0].id;
          console.log(`Fallback retrieved latest Chat ID: ${serverChatId}`);
        }
      } catch (listError) {
        console.error('Failed to retrieve chat list for fallback:', listError);
      }
    }

    if (!serverChatId) {
      throw new Error('Could not determine the new Chat ID from the response stream or the conversation list.');
    }

    flash = {
      message: 'Conversation started successfully!',
      type: 'alert-success'
    };
    res.redirect(`/chat/${serverChatId}`);
  } catch (error) {
    console.error('Failed to create new chat:', error);
    flash = {
      message: `Failed to start chat: ${error.message}`,
      type: 'alert-error'
    };
    res.redirect('/');
  }
});

// 6. View Chat Room Route
app.get('/chat/:id', async (req, res) => {
  const chatId = req.params.id;
  const pageData = {
    title: 'Chat Room',
    chatId: chatId,
    chatName: 'Conversation',
    messages: [],
    lastMessageId: '00000000-0000-0000-0000-000000000000',
    flash: res.locals.flash
  };

  try {
    // Get chat metadata name
    try {
      const chatMeta = await api.getChat(chatId);
      if (chatMeta && chatMeta.chat) {
        pageData.chatName = chatMeta.chat.name || 'Conversation';
      }
    } catch (e) {
      console.log('Could not fetch chat metadata, falling back to default name:', e.message);
    }

    // Fetch conversation message list
    try {
      const msgRes = await api.listMessages(chatId, 100);
      const apiMessages = msgRes.messages || [];

      // Format messages in chronological order (oldest first)
      const chronologicalMessages = [...apiMessages].reverse();
      pageData.messages = chronologicalMessages.map(msg => {
        let content = '';
        if (msg.blocks) {
          msg.blocks.forEach(block => {
            if (block.text && block.text.content) {
              content += block.text.content;
            } else if (block.file && block.file.meta) {
              content += `\n*[Attached Document: ${block.file.meta.name}]*`;
            }
          });
        }

        return {
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: marked.parse(content)
        };
      });

      // Find the last assistant message ID in the conversation, fallback to system message ID, or fallback to chatId
      let lastMessageId = chatId;
      const lastAssistant = apiMessages.find(msg => msg.role === 'assistant');
      if (lastAssistant) {
        lastMessageId = lastAssistant.id;
      } else {
        const systemMsg = apiMessages.find(msg => msg.role === 'system');
        if (systemMsg) {
          lastMessageId = systemMsg.id;
        }
      }
      pageData.lastMessageId = lastMessageId;
    } catch (msgError) {
      console.log('Could not load chat messages (likely a new chat session):', msgError.message);
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
    pageData.flash = {
      message: `Failed to load chat history: ${error.message}`,
      type: 'alert-error'
    };
  }

  res.send(render('chat_room', pageData));
});

// 7. Send Message to Chat Route (Supports standard POST and AJAX Streaming)
app.post('/chat/:id/send', async (req, res) => {
  const chatId = req.params.id;
  const { message, parentId } = req.body;
  const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

  try {
    const stream = await api.sendChatMessage(message, chatId, parentId, 'SCENARIO_K2D5');

    if (isAjax) {
      // Stream chunks back directly to client
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      let fullResponseText = '';
      for await (const chunk of api.parseConnectStream(stream)) {
        if (chunk.message && chunk.message.blocks) {
          const block = chunk.message.blocks[0];
          if (block && block.text && block.text.content) {
            const content = block.text.content;
            let delta = content;
            if (content.startsWith(fullResponseText)) {
              delta = content.slice(fullResponseText.length);
            }
            fullResponseText = content;
            res.write(delta);
          }
        }
      }
      res.end();
    } else {
      // Standard HTTP POST: consume stream fully, then reload the page
      let fullResponseText = '';
      for await (const chunk of api.parseConnectStream(stream)) {
        if (chunk.message && chunk.message.blocks) {
          const block = chunk.message.blocks[0];
          if (block && block.text && block.text.content) {
            const content = block.text.content;
            if (content.startsWith(fullResponseText)) {
              fullResponseText = content;
            } else {
              fullResponseText += content;
            }
          }
        }
      }
      res.redirect(`/chat/${chatId}`);
    }

  } catch (error) {
    console.error('Error sending message:', error);
    if (isAjax) {
      res.status(500).send(`Error: ${error.message}`);
    } else {
      flash = {
        message: `Failed to send message: ${error.message}`,
        type: 'alert-error'
      };
      res.redirect(`/chat/${chatId}`);
    }
  }
});

// 8. Delete Chat Route
app.post('/chat/:id/delete', async (req, res) => {
  const chatId = req.params.id;
  try {
    console.log(`Deleting chat session: ${chatId}`);
    await api.deleteChat(chatId);
    flash = {
      message: 'Chat deleted successfully!',
      type: 'alert-success'
    };
  } catch (error) {
    console.error(`Failed to delete chat ${chatId}:`, error);
    flash = {
      message: `Failed to delete chat: ${error.message}`,
      type: 'alert-error'
    };
  }
  res.redirect('/');
});

// 9. Edit Chat Name Route
app.post('/chat/:id/edit', async (req, res) => {
  const chatId = req.params.id;
  const { name } = req.body;
  try {
    console.log(`Updating chat session ${chatId} name to: ${name}`);
    await api.updateChatName(chatId, name);
    flash = {
      message: 'Chat renamed successfully!',
      type: 'alert-success'
    };
  } catch (error) {
    console.error(`Failed to rename chat ${chatId}:`, error);
    flash = {
      message: `Failed to rename chat: ${error.message}`,
      type: 'alert-error'
    };
  }
  res.redirect(`/chat/${chatId}`);
});

// Start the server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`Kindle-friendly mine-test Web App started!`);
  console.log(`Access the client interface locally at:`);
  console.log(`http://localhost:${PORT}`);
  console.log(`=================================================`);
});
