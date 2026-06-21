// live_api/api.js
// Client API operations configured with connection retries, dynamic session.json reading, and self-healing token rotation.

import { config } from './config.js';
import { Agent } from 'undici';
import { sessionStore } from './sessionStore.js';

const customAgent = new Agent({
  connect: {
    timeout: 60000 // 60 seconds connection timeout
  }
});

function updateCookieTimestamps(baseCookieStr) {
  if (!baseCookieStr) return '';
  const nowSec = Math.floor(Date.now() / 1000);
  const nowMs = Date.now();

  let cookies = baseCookieStr;
  cookies = cookies.replace(/(Hm_lpvt_[a-f0-9]+=)\d{10}/gi, `$1${nowSec}`);
  cookies = cookies.replace(/(_clsk=[^;]*%5E)\d{13}(%5E)/gi, `$1${nowMs}$2`);
  cookies = cookies.replace(/(\$t)\d{10}/gi, `$1${nowSec}`);
  return cookies;
}

function getBrand() {
  const domain = config.MINE_TEST_DOMAIN.toLowerCase();
  if (domain.includes('kimi')) return 'kimi';
  return 'kimi';
}

async function fetchWithRetry(url, optionsOrFn, retries = 3, delay = 1500) {
  let lastError = null;
  for (let i = 0; i < retries; i++) {
    try {
      // Re-evaluate options function dynamically to pick up fresh credentials from session.json
      const options = typeof optionsOrFn === 'function' ? optionsOrFn() : optionsOrFn;
      
      const res = await fetch(url, {
        ...options,
        dispatcher: customAgent
      });

      if (res.status === 401 || res.status === 403) {
        console.warn(`[API Client] Received HTTP ${res.status} (Expired Session). Triggering dynamic session refresh...`);
        // Single-flight lock handles queuing and token fetch via Web App
        await sessionStore.acquireFreshSession();
        // Continue loop to retry with fresh headers
        continue;
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        const headersObj = {};
        res.headers.forEach((val, key) => { headersObj[key] = val; });
        console.error(`[API HTTP Error] URL: ${url}\nStatus: ${res.status} ${res.statusText}\nHeaders: ${JSON.stringify(headersObj)}\nResponse Text: ${errText}`);
        throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
      }
      return res;
    } catch (err) {
      lastError = err;
      const causeStr = err.cause ? ` (Cause: ${err.cause.message || err.cause})` : '';
      console.warn(`[API Connection Retry ${i + 1}/${retries}] Failed fetching ${url}: ${err.message}${causeStr}`);
      
      // On connection timeouts or socket failures, trigger session refresh to clear gateway block
      if (err.message.includes('fetch failed') || err.message.includes('Timeout') || err.message.includes('timeout')) {
        try {
          console.warn("[API Client] Network error. Triggering background session refresh...");
          await sessionStore.acquireFreshSession();
        } catch (refreshErr) {
          console.error("[API Client] Background session refresh failed:", refreshErr.message);
        }
      }

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

function getCookies() {
  const brand = getBrand();
  const session = sessionStore.readSession();
  const authCookieVal = session.cookies['kimi-auth'] || config.MINE_TEST_AUTH_COOKIE;
  const cfBmVal = session.cookies['__cf_bm'] || config.CF_BM;

  let baseCookie = authCookieVal ? `${brand}-auth=${authCookieVal}` : '';
  if (cfBmVal) {
    baseCookie = baseCookie ? `${baseCookie}; __cf_bm=${cfBmVal}` : `__cf_bm=${cfBmVal}`;
  }
  const extraCookies = `theme=dark; _ga=GA1.1.370269376.1781103784; g_state={"i_l":0,"i_ll":1781103785746,"i_e":{"enable_itp_optimization":0},"i_et":1781103785729}; lang=en-US; _gcl_au=1.1.364708090.1781103785.394713607.1781757945.1781757944; Hm_lvt_358cae4815e85d48f7e8ab7f3680a74b=1781757249,1781885858,1781923647,1781938280; HMACCOUNT=A7A9747C0E06B989; _clck=1pf5a8b%5E2%5Eg72%5E0%5E2362; _ga_Z0ZTEN03PZ=GS2.1.s1781939206$o1$g1$t1781939265$j1$l0$h0; _clsk=ybhoz7%5E1781948346293%5E1%5E1%5Er.clarity.ms%2Fcollect; Hm_lpvt_358cae4815e85d48f7e8ab7f3680a74b=1781956169; _ga_YXD8W70SZP=GS2.1.s1781954688$o17$g1$t1781956170$j46$l0$h0`;
  const fullCookieStr = baseCookie ? `${baseCookie}; ${extraCookies}` : extraCookies;
  return updateCookieTimestamps(fullCookieStr);
}

function getHeaders(isConnect = false, chatId = null) {
  const referer = chatId
    ? `https://${config.MINE_TEST_DOMAIN}/chat/${chatId}?chat_enter_method=history`
    : `https://${config.MINE_TEST_DOMAIN}/?chat_enter_method=new_chat`;

  const session = sessionStore.readSession();
  const shieldDataVal = session.headers['x-msh-shield-data'] || config.X_MSH_SHIELD_DATA;

  return {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "authorization": `Bearer ${config.BEARER_TOKEN}`,
    "connect-protocol-version": "1",
    "content-type": isConnect ? "application/connect+json" : "application/json",
    "priority": "u=1, i",
    "r-timezone": "Asia/Calcutta",
    "sec-ch-ua": "\"Google Chrome\";v=\"149\", \"Chromium\";v=\"149\", \"Not)A;Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-language": "en-US",
    "x-msh-device-id": config.X_MSH_DEVICE_ID,
    "x-msh-platform": "web",
    "x-msh-session-id": config.X_MSH_SESSION_ID,
    "x-msh-version": "1.0.0",
    "x-traffic-id": config.X_TRAFFIC_ID,
    "x-msh-shield-data": shieldDataVal,
    "cookie": getCookies(),
    "Referer": referer
  };
}

function frameMessage(jsonBody) {
  const encoder = new TextEncoder();
  const bodyBytes = encoder.encode(jsonBody);
  const length = bodyBytes.length;

  const buffer = new ArrayBuffer(5 + length);
  const view = new DataView(buffer);

  view.setUint8(0, 0);
  view.setUint32(1, length);

  const uint8View = new Uint8Array(buffer);
  uint8View.set(bodyBytes, 5);

  return Buffer.from(buffer);
}

export async function* parseConnectStream(responseStream) {
  let buffer = Buffer.alloc(0);
  for await (const chunk of responseStream) {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 5) {
      const flag = buffer[0];
      const length = (buffer[1] << 24) | (buffer[2] << 16) | (buffer[3] << 8) | buffer[4];
      if (buffer.length < 5 + length) {
        break; // wait for more data
      }
      const messageBytes = buffer.subarray(5, 5 + length);
      buffer = buffer.subarray(5 + length);

      if (flag === 0) {
        const text = messageBytes.toString('utf8');
        try {
          yield JSON.parse(text);
        } catch (e) {
          console.error('Error parsing JSON chunk:', e, text);
        }
      } else if (flag === 2) {
        const text = messageBytes.toString('utf8');
        console.log('Stream end metadata block received:', text);
        try {
          const meta = JSON.parse(text);
          if (meta && meta.error) {
            let errorMsg = meta.error.message || '';
            if (!errorMsg && meta.error.details && meta.error.details.length > 0) {
              const detail = meta.error.details[0];
              if (detail.debug && detail.debug.localizedMessage && detail.debug.localizedMessage.message) {
                errorMsg = detail.debug.localizedMessage.message;
              }
            }
            if (!errorMsg) {
              errorMsg = meta.error.code || 'Unknown Kimi API Error';
            }
            throw new Error(`Kimi API Error: ${errorMsg}`);
          }
        } catch (e) {
          if (e.message.startsWith('Kimi API Error:')) {
            throw e;
          }
          console.error('Failed to parse metadata block:', e.message);
        }
      }
    }
  }
}

function mapModelToPayload(model, message, chatId, parentId) {
  let scenario = "SCENARIO_K2D5";
  let thinking = false;
  let agentMode = null;
  let minePlusId = null;

  const m = String(model || '').toLowerCase();
  if (m === "k2d6-thinking" || m === "scenario_k2d5_thinking") {
    scenario = "SCENARIO_K2D5";
    thinking = true;
  } else if (m === "k2d6-agent" || m === "scenario_ok_computer_normal") {
    scenario = "SCENARIO_OK_COMPUTER";
    agentMode = "TYPE_NORMAL";
    minePlusId = "ok-computer";
  } else if (m === "k2d6-agent-ultra" || m === "scenario_ok_computer_ultra") {
    scenario = "SCENARIO_OK_COMPUTER";
    agentMode = "TYPE_ULTRA";
    minePlusId = "ok-computer";
  } else if (m === "k2d6") {
    scenario = "SCENARIO_K2D5";
  } else if (model && model.startsWith("SCENARIO_")) {
    scenario = model;
  }

  const payload = {
    scenario: scenario,
    tools: [{ type: "TOOL_TYPE_SEARCH", search: {} }],
    message: {
      role: "user",
      blocks: [{ message_id: "", text: { content: message } }],
      scenario: scenario
    },
    options: {
      thinking: thinking,
      enable_plugin: false
    }
  };

  if (chatId) {
    payload.chat_id = chatId;
  }
  if (parentId) {
    payload.message.parent_id = parentId;
  }

  if (agentMode) {
    payload.agent_mode = agentMode;
    payload.agentMode = agentMode;
    payload.options.agent_mode = agentMode;
  }
  if (minePlusId) {
    payload["kimiPlusId"] = minePlusId;
    payload.mine_plus_id = minePlusId;
    payload.minePlusId = minePlusId;
  }

  return payload;
}

export async function sendChatMessage(message, chatId, parentId, model = 'SCENARIO_K2D5') {
  const brand = getBrand();
  const url = `https://${config.MINE_TEST_DOMAIN}/apiv2/${brand}.gateway.chat.v1.ChatService/Chat`;

  const payload = mapModelToPayload(model, message, chatId, parentId);
  const jsonBody = JSON.stringify(payload);
  const framedBody = frameMessage(jsonBody);

  const res = await fetchWithRetry(url, () => ({
    method: 'POST',
    headers: getHeaders(true, chatId),
    body: framedBody
  }));

  return res.body; // ReadableStream
}

export async function createChatWithSystemInstructions(instructions, model = 'SCENARIO_K2D5') {
  const brand = getBrand();
  const url = `https://${config.MINE_TEST_DOMAIN}/apiv2/${brand}.gateway.chat.v1.ChatService/Chat`;

  let scenario = "SCENARIO_K2D5";
  const m = String(model || '').toLowerCase();
  if (m === "k2d6-thinking" || m === "scenario_k2d5_thinking") {
    scenario = "SCENARIO_K2D5";
  } else if (m === "k2d6-agent" || m === "scenario_ok_computer_normal") {
    scenario = "SCENARIO_OK_COMPUTER";
  } else if (m === "k2d6-agent-ultra" || m === "scenario_ok_computer_ultra") {
    scenario = "SCENARIO_OK_COMPUTER";
  } else if (model && model.startsWith("SCENARIO_")) {
    scenario = model;
  }

  const payload = {
    scenario: scenario,
    tools: [{ type: "TOOL_TYPE_SEARCH", search: {} }],
    message: {
      role: "system",
      blocks: [{ message_id: "", text: { content: instructions } }],
      scenario: scenario
    },
    options: {
      thinking: m.includes("thinking"),
      enable_plugin: false
    }
  };

  if (m === "k2d6-agent") {
    payload.agent_mode = "TYPE_NORMAL";
    payload.agentMode = "TYPE_NORMAL";
    payload.options.agent_mode = "TYPE_NORMAL";
    payload["kimiPlusId"] = "ok-computer";
  } else if (m === "k2d6-agent-ultra") {
    payload.agent_mode = "TYPE_ULTRA";
    payload.agentMode = "TYPE_ULTRA";
    payload.options.agent_mode = "TYPE_ULTRA";
    payload["kimiPlusId"] = "ok-computer";
  }

  const jsonBody = JSON.stringify(payload);
  const framedBody = frameMessage(jsonBody);

  const res = await fetchWithRetry(url, () => ({
    method: 'POST',
    headers: getHeaders(true, null),
    body: framedBody
  }));

  let chatId = null;
  let messageId = null;
  for await (const chunk of parseConnectStream(res.body)) {
    if (chunk.chatId) chatId = chunk.chatId;
    else if (chunk.chat_id) chatId = chunk.chat_id;
    else if (chunk.chat && chunk.chat.id) chatId = chunk.chat.id;
    else if (chunk.message && chunk.message.chatId) chatId = chunk.message.chatId;
    else if (chunk.message && chunk.message.chat_id) chatId = chunk.message.chat_id;

    if (chunk.message && chunk.message.id) {
      messageId = chunk.message.id;
    }
  }

  if (!chatId) {
    throw new Error('Failed to parse chat ID from system message stream.');
  }

  return { chatId, messageId };
}

export async function listMessages(chatId, pageSize = 100) {
  const brand = getBrand();
  const url = `https://${config.MINE_TEST_DOMAIN}/apiv2/${brand}.gateway.chat.v1.ChatService/ListMessages`;
  const res = await fetchWithRetry(url, () => ({
    method: 'POST',
    headers: getHeaders(false, chatId),
    body: JSON.stringify({ chat_id: chatId, page_size: pageSize })
  }));
  return res.json();
}
