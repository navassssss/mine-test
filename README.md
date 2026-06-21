# Mine Kimi API Developer Portal & Gateway

A production-grade, self-healing developer API gateway and management portal built for orchestrating high-concurrency access to Kimi's advanced LLMs. 

## 🚀 Key Features

*   **Premium Space-Grade Design**: A unified visual language utilizing dark modes, subtle gradients, and glassmorphism across all pages (Home, Documentation, Models, About, Dashboard, and Profile).
*   **Interactive API Sandbox**: A dedicated, interactive playground (`/sandbox`) allowing developers to customize parameters, preview auto-generated Fetch/cURL snippets, and stream completions in real-time.
*   **Single Unified Navbar**: Session-aware header navigation driven client-side by Supabase authorization states.
*   **Secure API Keys**: Masked-by-default credential management with reveal toggles and automated populate integrations for the sandbox.
*   **Self-Healing Session Manager**: Headless Puppeteer orchestrators that rotate active session cookies in the background, resolving expired credentials without pipeline interruption.
*   **Zero-Latency Cache**: Custom in-memory context tracking that caches parent message IDs to guarantee lightning-fast stream start-times.

---

## 🛠️ Technology Stack

*   **Frontend**: Vanilla HTML5, premium custom CSS, Supabase JS Client, and custom JavaScript.
*   **Gateway Backend**: Node.js & Express.js.
*   **Network Transport**: Undici (high-throughput request client).
*   **Session Engine**: Headless Puppeteer browser workers.
*   **Database & Auth**: Supabase (PostgreSQL with RLS & OAuth/Email signup).

---

## 📂 Repository Structure

```bash
kimi/
├── api/                   # API Gateway & Developer Auth Portal
│   ├── supabase_auth/     # Static auth portal pages (publicly served)
│   │   ├── css/           # Design system stylesheets
│   │   ├── js/            # Client-side session and auth scripts
│   │   ├── index.html     # Portal landing page
│   │   ├── docs.html      # Developer reference documentation
│   │   ├── sandbox.html   # Dedicated interactive sandbox page
│   │   ├── models.html    # Model comparison matrix
│   │   ├── about.html     # Pillars of operation & Vision
│   │   └── dashboard.html # Developer metrics & API keys console
│   ├── config.js          # Gateway variables & keys configuration
│   ├── supabaseDb.js      # Supabase connection & quota validation
│   └── server.js          # Main Express router & SSE Stream pipeline
└── kindle/                # Standalone Client applications
```

---

## ⚙️ Setup and Installation

### 1. Install Dependencies
Run from the repository root:
```powershell
npm install
```

### 2. Configure Environment Variables
Create an `.env` file inside the `api/` directory with the following variables:
```env
PORT=3001
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
LIVE_API_CHAT_ID=your-stateful-kimi-chat-id
```

### 3. Run the Servers

Start the developer portal and gateway:
```powershell
npm run start-api
```

The portal will be live at:
*   **Developer Console**: [http://localhost:3001](http://localhost:3001)
*   **Interactive Docs**: [http://localhost:3001/docs](http://localhost:3001/docs)
*   **Playground Sandbox**: [http://localhost:3001/sandbox](http://localhost:3001/sandbox)
*   **API Chat Gateway**: `POST http://localhost:3001/api/chat`

---

## ☁️ Deployment (Render)

This project is fully containerized and production-ready for seamless deployment on [Render](https://render.com/).

### One-Click Deploy (Render.yaml)
A `render.yaml` infrastructure-as-code file is included in the root directory. To deploy:
1. Push this repository to GitHub/GitLab.
2. In your Render Dashboard, select **Blueprints** -> **New Blueprint Instance**.
3. Connect the repository. Render will automatically detect the `render.yaml` and configure the Web Service with Docker to ensure Puppeteer runs flawlessly in a headless Chrome environment.

### Environment Setup on Render
After deployment, make sure to add your secrets to the Render Environment dashboard:
*   `SUPABASE_URL`
*   `SUPABASE_ANON_KEY`
*   `SUPABASE_SERVICE_ROLE_KEY`
*   `LIVE_API_CHAT_ID`

---

## 💡 Developer Guidelines

### Unified Header
All future portal page additions must include:
1. The shared CSS reference: `<link rel="stylesheet" href="/css/style.css">`.
2. The dynamic session script at the bottom of the body:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="/js/supabase-client.js"></script>
   <script src="/js/navbar.js"></script>
   ```
3. A blank `<header>` element inside `<body>` to allow the client to dynamically inject the navigation bar.
