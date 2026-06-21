# High-Speed Stateful Public API Server

This is a standalone, high-performance API server designed for real-world integration. 

## 🧠 Single-Chat Stateful Architecture
To simplify external integrations, the API operates in a **stateful, single-chat mode** tied to a specific chat session configured in your `.env` file (`LIVE_API_CHAT_ID`).

* **Automatic Threading**: Clients do **not** need to pass or track `chat_id` or `parent_id`.
* **Auto-Parent Resolution**: Every request sent to the API automatically queries the target chat's history, extracts the latest message ID, and uses it as the `parent_id` to link the new message.
* **Inline Instructions**: Setting custom system prompts/rules, output formats, and tones will automatically construct and prepend a YAML-style frontmatter block at the top of the user message.

---

## Getting Started

### 1. Configure the Chat Session
Open the `.env` file in the root directory and ensure the target stateful chat ID is set:
```env
LIVE_API_CHAT_ID=19ee81d4-8ac2-8ab2-8000-097002f394c3
```

### 2. Start the API Server
Start the high-speed public API server:
```bash
npm run api
```
By default, the server starts on `http://localhost:3001` (configured via `LIVE_API_PORT` in `.env` if desired).

---

## API Endpoints

### 1. `GET /api/models`
Returns list of supported models.

#### Request Example
```bash
curl -X GET http://localhost:3001/api/models
```

#### Response Example
```json
{
  "models": [
    { "key": "k2d6", "displayName": "K2.6 Instant", "description": "Quick response" },
    { "key": "k2d6-thinking", "displayName": "K2.6 Thinking", "description": "Deep thinking for complex questions" },
    { "key": "k2d6-agent", "displayName": "K2.6 Agent", "description": "Research, slides, sheets" },
    { "key": "k2d6-agent-ultra", "displayName": "K2.6 Agent Swarm", "description": "Large-scale search" }
  ]
}
```

---

### 2. `POST /api/chat`
Sends a message to the stateful chat session. Supports streaming (default) or accumulated JSON responses.

#### Request Schema
```json
{
  "message": "Write a python quicksort script",
  "instructions": "You are a senior python developer. Only output python code, no markdown.",
  "role": "senior software engineer",
  "format": "code_block",
  "stream": true
}
```

#### Streaming Mode (`stream: true`)
By default, it streams back raw text chunks in real-time. If the client header `Accept: text/event-stream` is passed, the server streams standard Server-Sent Events (SSE) format:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"message": "Hello!", "stream": true}'
```
##### SSE Stream Format:
```text
data: {"delta": "Hel", "chat_id": "19ee81d4-8ac2-8ab2-8000-097002f394c3", "parent_id": "..."}

data: {"delta": "lo!", "chat_id": "19ee81d4-8ac2-8ab2-8000-097002f394c3", "parent_id": "..."}

data: [DONE]
```

#### Non-Streaming Mode (`stream: false`)
Accumulates all chunks on the server and returns a single JSON object:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "stream": false}'
```
##### Response Format:
```json
{
  "response": "Hello! How can I help you today?",
  "chat_id": "19ee81d4-8ac2-8ab2-8000-097002f394c3",
  "parent_id": "19ee8542-a9b0-8aa2-8000-0a701f2e10bb"
}
```

---

## Session Resiliency & Token Rotation
This server automatically references the `.env` configuration file in the parent directory.
If you receive a `401 Unauthorized` or `403 Forbidden` response, the underlying cookies/shield tokens have expired. Run the Puppeteer script to refresh them:
```bash
node src/services/puppeteer.js
```
The high-speed API server will dynamically reload the updated variables without needing a restart!
