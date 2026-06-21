# testing the High-Speed Public API (Windows CMD & PowerShell)

Below are the exact commands to test the public API server from your Windows terminal.

> [!IMPORTANT]
> Make sure the API server is running first!
> Start it by executing: `npm run api`

---

## 🚀 Easy Mode: Node.js Test Runner (Recommended)
This runs a native Javascript request script that streams output instantly to your terminal. It is 100% immune to Windows Command Line quoting / escaping issues:
```bash
npm run test-api
```

---

## 💻 Manual Mode: curl.exe Commands

### 1. Get List of Supported Models
```powershell
curl.exe -X GET http://localhost:3001/api/models
```

---

### 2. Start a Chat Session (Non-Streaming / Simple JSON)
- **PowerShell**:
  ```powershell
  curl.exe -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d '{"message": "hello, introduce yourself in one sentence", "stream": false}'
  ```
- **CMD**:
  ```cmd
  curl.exe -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d "{\"message\": \"hello, introduce yourself in one sentence\", \"stream\": false}"
  ```

---

### 3. Streaming Chat (Server-Sent Events)
- **PowerShell**:
  ```powershell
  curl.exe -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -H "Accept: text/event-stream" -d '{"message": "count from 1 to 5 slowly", "stream": true}'
  ```
- **CMD**:
  ```cmd
  curl.exe -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -H "Accept: text/event-stream" -d "{\"message\": \"count from 1 to 5 slowly\", \"stream\": true}"
  ```

---

### 4. Advanced: Combining Custom Persona, Formats & Constraints
You can pass various instructions and formatting parameters directly in the JSON payload (no `chat_id` or `parent_id` parameters needed - the backend manages thread states automatically):

| Parameter | Type | Description |
|-----------|------|-------------|
| `instructions` | String | Standard system/persona prompt |
| `format` | String | Response output format (e.g., `json`, `markdown`, `table`, `code_block`, `csv`, `yaml`) |
| `tone` | String | Adjust tone (e.g., `technical`, `casual`, `formal`, `concise`, `detailed`) |
| `audience` | String | Target audience level (e.g., `beginner`, `expert`, `child`) |
| `role` | String | Roleplay/Persona to adopt (e.g., `senior software engineer`, `lawyer`, `doctor`) |
| `language` | String | Output language (e.g., `Spanish`, `French`, `Japanese`) |
| `structure` | String | Document structure format (e.g., `step-by-step`, `pros_cons`, `faq`) |
| `max_words` | Integer | Word count constraint |
| `no_emojis` | Boolean | Exclude emoji usage |
| `bullets_only` | Boolean | Respond using only bullet points |

#### Test Example:
- **PowerShell**:
  ```powershell
  curl.exe -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d '{"message": "Should I use React or Vue?", "role": "senior software engineer", "format": "table", "structure": "pros_cons", "stream": false}'
  ```
- **CMD**:
  ```cmd
  curl.exe -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d "{\"message\": \"Should I use React or Vue?\", \"role\": \"senior software engineer\", \"format\": \"table\", \"structure\": \"pros_cons\", \"stream\": false}"
  ```
