import { config } from '../config.js';

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
  return domain.includes('kimi') ? 'kimi' : 'kimi';
}

function getCookies() {
  const brand = getBrand();
  let baseCookie = config.MINE_TEST_AUTH_COOKIE ? `${brand}-auth=${config.MINE_TEST_AUTH_COOKIE}` : '';
  if (config.CF_BM) {
    baseCookie = baseCookie ? `${baseCookie}; __cf_bm=${config.CF_BM}` : `__cf_bm=${config.CF_BM}`;
  }
  const extraCookies = `theme=dark; _ga=GA1.1.370269376.1781103784; g_state={"i_l":0,"i_ll":1781103785746,"i_e":{"enable_itp_optimization":0},"i_et":1781103785729}; lang=en-US; _gcl_au=1.1.364708090.1781103785.394713607.1781757945.1781757944; Hm_lvt_358cae4815e85d48f7e8ab7f3680a74b=1781757249,1781885858,1781923647,1781938280; HMACCOUNT=A7A9747C0E06B989; _clck=1pf5a8b%5E2%5Eg72%5E0%5E2362; _ga_Z0ZTEN03PZ=GS2.1.s1781939206$o1$g1$t1781939265$j1$l0$h0; _clsk=ybhoz7%5E1781948346293%5E1%5E1%5Er.clarity.ms%2Fcollect; Hm_lpvt_358cae4815e85d48f7e8ab7f3680a74b=1781956169; _ga_YXD8W70SZP=GS2.1.s1781954688$o17$g1$t1781956170$j46$l0$h0`;
  const fullCookieStr = baseCookie ? `${baseCookie}; ${extraCookies}` : extraCookies;
  return updateCookieTimestamps(fullCookieStr);
}

function getHeaders(isConnect = false, chatId = null) {
  const referer = chatId
    ? `https://${config.MINE_TEST_DOMAIN}/chat/${chatId}?chat_enter_method=history`
    : `https://${config.MINE_TEST_DOMAIN}/?chat_enter_method=new_chat`;

  const headers = {
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
    "x-msh-shield-data": config.X_MSH_SHIELD_DATA,
    "cookie": getCookies(),
    "Referer": referer
  };
  return headers;
}

function frameMessage(jsonString) {
  const encoder = new TextEncoder();
  const bodyBytes = encoder.encode(jsonString);
  const length = bodyBytes.length;

  const header = new Uint8Array(5);
  header[0] = 0; // flag
  header[1] = (length >> 24) & 0xff;
  header[2] = (length >> 16) & 0xff;
  header[3] = (length >> 8) & 0xff;
  header[4] = length & 0xff;

  const framed = new Uint8Array(5 + length);
  framed.set(header, 0);
  framed.set(bodyBytes, 5);
  return framed;
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
        // End of stream metadata
        console.log('Stream end metadata block received:', messageBytes.toString('utf8'));
      }
    }
  }
}

export async function getCurrentUser() {
  const brand = getBrand();
  const url = `https://${config.MINE_TEST_DOMAIN}/apiv2/${brand}.gateway.account.v1.UserService/GetCurrentUser`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(false),
    body: '{}'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function getAvailableModels() {
  const brand = getBrand();
  const url = `https://${config.MINE_TEST_DOMAIN}/apiv2/${brand}.gateway.config.v1.ConfigService/GetAvailableModels`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(false),
    body: '{}'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function listChats(pageSize = 20, pageToken = '', query = '') {
  const brand = getBrand();
  const url = `https://${config.MINE_TEST_DOMAIN}/apiv2/${brand}.chat.v1.ChatService/ListChats`;
  const body = JSON.stringify({
    page_size: pageSize,
    page_token: pageToken,
    query: query
  });
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(false),
    body
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function getChat(chatId) {
  const brand = getBrand();
  const url = `https://${config.MINE_TEST_DOMAIN}/apiv2/${brand}.gateway.chat.v1.ChatService/GetChat`;
  const body = JSON.stringify({ chat_id: chatId });
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(false),
    body
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function listMessages(chatId, pageSize = 100) {
  const brand = getBrand();
  const url = `https://${config.MINE_TEST_DOMAIN}/apiv2/${brand}.gateway.chat.v1.ChatService/ListMessages`;
  const body = JSON.stringify({ chat_id: chatId, page_size: pageSize });
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(false),
    body
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function sendChatMessage(message, chatId, parentId, scenario = 'SCENARIO_K2D5') {
  const brand = getBrand();
  const url = `https://${config.MINE_TEST_DOMAIN}/apiv2/${brand}.gateway.chat.v1.ChatService/Chat`;

  const payload = {
    scenario: scenario,
    tools: [{ type: "TOOL_TYPE_SEARCH", search: {} }],
    message: {
      role: "user",
      blocks: [{ message_id: "", text: { content: message } }],
      scenario: scenario
    },
    options: { thinking: false, enable_plugin: false }
  };

  // Omit chat_id and parent_id for new chats (where chatId is falsy or null)
  if (chatId) {
    payload.chat_id = chatId;
  }
  if (parentId) {
    payload.message.parent_id = parentId;
  }

  const jsonBody = JSON.stringify(payload);
  const framedBody = frameMessage(jsonBody);

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(true, chatId),
    body: framedBody
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
  }

  return res.body; // ReadableStream
}

export async function deleteChat(chatId) {
  const brand = getBrand();
  const url = `https://${config.MINE_TEST_DOMAIN}/apiv2/${brand}.chat.v1.ChatService/DeleteChat`;

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(false, null),
    body: JSON.stringify({ chat_id: chatId })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
  }

  return await res.json();
}

export async function updateChatName(chatId, newName) {
  const brand = getBrand();
  const url = `https://${config.MINE_TEST_DOMAIN}/apiv2/${brand}.chat.v1.ChatService/UpdateChat`;

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(false, null),
    body: JSON.stringify({
      chat: {
        id: chatId,
        name: newName
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
  }

  return await res.json();
}

export async function resolveFileUri(chatId, fileUri) {
  const brand = getBrand();
  const url = `https://${config.MINE_TEST_DOMAIN}/apiv2/${brand}.gateway.mcp.v1.OKCService/ResolveFileURI`;

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(false, chatId),
    body: JSON.stringify({
      chat_id: chatId,
      file_uri: fileUri
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
  }

  return await res.json(); // should return { url: "..." }
}
