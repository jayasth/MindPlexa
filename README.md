<div align="center">
  <img src="public/logo.svg" alt="MindPlexa Logo" width="80" />
  <h1>MindPlexa</h1>
  <p><strong>AI-Powered Infinite Canvas — Open Source</strong></p>
  <p>
    Transform any idea into a visual diagram using AI. Built with React Flow, Next.js, Supabase, Stripe, and GPT-4o/Claude.
  </p>

  <p>
    <a href="https://mindplexa.vercel.app"><strong>🚀 Live Demo</strong></a> ·
    <a href="#quick-start"><strong>Quick Start</strong></a> ·
    <a href="#architecture"><strong>Architecture</strong></a> ·
    <a href="#contributing"><strong>Contributing</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs" alt="Next.js 14" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React_Flow-11-orange?style=flat-square" alt="React Flow" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Stripe-Billing-blueviolet?style=flat-square&logo=stripe" alt="Stripe" />
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="MIT License" />
  </p>

  ![MindPlexa Demo](public/demo.png)
</div>

---

> **Project Status: 🟡 Community-Maintained**
> Open-sourced after a 9-month solo build. No longer under active development, but PRs and community contributions are very welcome. [Read the full story →](#the-story)

---

## What is MindPlexa?

MindPlexa is a full-stack SaaS application where users type a concept (e.g. _"Create a book outline about stoicism"_) and the AI generates a fully interactive visual canvas with connected nodes — like a mind map, but smarter.

**Key interactions:**
- Type any topic → AI generates a structured node diagram
- Drag, resize, and connect nodes freely on an infinite canvas
- Switch between AI models (GPT-4o and Claude) mid-session
- Multiple node types: notes, tasks, tables, calendar events, drawings
- Real-time save to Supabase; each canvas persists across sessions

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 14 (App Router) | Server components, edge runtime, file-based routing |
| **Canvas Engine** | React Flow 11 | Infinite zoomable canvas with node/edge primitives |
| **State** | Zustand (domain-split stores) | Performant, non-re-rendering state for canvas operations |
| **Database** | Supabase (PostgreSQL + RLS) | Real-time sync, Row Level Security per user |
| **Auth** | Supabase Auth | Email, GitHub, and Google OAuth out of the box |
| **AI** | OpenAI GPT-4o + Anthropic Claude | Versioned prompt templates for structured JSON output |
| **Payments** | Stripe (subscriptions + one-time) | Full webhook sync to Supabase subscription table |
| **Styling** | Tailwind CSS + Framer Motion | Utility-first + smooth micro-animations |
| **Deployment** | Vercel (edge-optimized) | Zero-config Next.js deployment |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js 14 App                   │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────┐ │
│  │  /home   │  │ /workspace │  │ /canvasEditor    │ │
│  │ (Landing)│  │(Dashboard) │  │ (React Flow UI)  │ │
│  └──────────┘  └────────────┘  └────────┬─────────┘ │
│                                          │           │
│         ┌────────────────────────────────▼──────┐   │
│         │           Zustand Stores               │   │
│         │  useNodeStore  useEdgeStore            │   │
│         │  useCanvasStore  useUIStore            │   │
│         └────────────────────────────────┬──────┘   │
│                                          │           │
│  ┌─────────────────┐   ┌────────────────▼────────┐  │
│  │  /api/completion│   │      Supabase Client    │  │
│  │  (Edge Runtime) │   │  nodes / edges / canvas │  │
│  │  OpenAI / Claude│   │  users / subscriptions  │  │
│  └─────────────────┘   └─────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

The Zustand state is **split by domain** intentionally — node operations, edge operations, canvas metadata, and UI state each live in their own slice to prevent unnecessary re-renders across a large canvas with potentially hundreds of nodes.

AI responses come back as structured JSON, which is parsed into React Flow `Node[]` objects and pushed directly into the Zustand node store.

---

## Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- An [OpenAI](https://platform.openai.com) API key (or [Anthropic](https://console.anthropic.com))
- A [Stripe](https://stripe.com) account (use test mode)

### 1. Clone & Install

```bash
git clone https://github.com/jayasth/MindPlexa.git
cd MindPlexa
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your keys. See `.env.example` for all required values and links to each service's dashboard.

### 3. Set Up Supabase

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. Copy your **Project URL** and **anon key** into `.env.local`
3. Open the Supabase **SQL Editor** and run the contents of `schema.sql`

### 4. Set Up Stripe (optional — skip if not testing payments)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
npm run stripe:login
npm run stripe:fixtures   # Creates products/prices in your Stripe account
npm run stripe:listen     # Forward webhooks to localhost
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the landing page. Sign up to access the canvas.

---

## Node Types

MindPlexa supports 5 custom node types on the canvas, each rendered via a polymorphic `NodeRenderer` component:

| Node Type | Description |
|-----------|-------------|
| `note` | Rich text editor (Quill.js) for freeform writing |
| `task` | Actionable item with status tracking |
| `table` | AG Grid-powered data table embedded in a node |
| `calendar` | React Big Calendar for scheduling within a node |
| `draw` | Freehand drawing canvas within a node |

---

## AI Generation

The AI endpoint at `/api/completion` runs on the **Vercel Edge Runtime** and supports:

- **Multiple models:** GPT-4o and Anthropic Claude (selectable per request)
- **Versioned prompts:** 4 prompt versions (`v1`→`v3`) capturing the evolution of structured output strategies
- **Follow-up questions:** The v2/v3 prompts support iterative refinement of an existing diagram
- **Structured output:** AI returns JSON that maps directly to React Flow node/edge schemas

---

## Database Schema

```sql
users          -- linked to Supabase auth.users
customers      -- Stripe customer ID mapping
products       -- synced from Stripe via webhooks
prices         -- synced from Stripe via webhooks
subscriptions  -- synced from Stripe via webhooks
```

All tables have Row Level Security (RLS) enabled. Users can only read/write their own data.

---

## The Story

I built MindPlexa as a solo developer over 9 months in 2024. The original idea was simple: let users type a concept and see it visualized as a mind map using AI.

Feature creep turned a 30-day MVP into a 700-component monster. By the time it launched, it was competing against Miro, Notion, and Figma simultaneously — without an audience or a marketing strategy.

MindPlexa made $0. It taught me everything.

**Key lessons:**
- Build the audience before the product, not after
- "One more feature" is the most dangerous phrase in a solo founder's vocabulary
- A complex, working full-stack codebase is valuable — even if the business fails

I'm open-sourcing it so that other developers can learn from the architecture, skip the boilerplate pain, and hopefully pick up where I left off.

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

Areas that would most benefit from community help:
- **Dependency upgrades:** Next.js 15, React 19, latest React Flow
- **Docker Compose:** Easy local dev without Supabase account
- **Test coverage:** The `jest.config.js` is there — specs are not
- **Mobile responsiveness:** The canvas degrades on small screens

---

## License

[MIT](LICENSE) — free to use, fork, and build upon commercially.

---

## Author

Built by **Jayasth** — a full-stack developer with 20+ years of experience in web development, digital marketing, and AI-powered applications.

- 🌐 [mindplexa.vercel.app](https://mindplexa.vercel.app)
- 💼 [LinkedIn](https://linkedin.com/in/jayasth) *(update with your real URL)*
- 📧 Available for consulting and contract work — reach out via LinkedIn

---

<div align="center">
  <sub>Built with ❤️ and too many late nights. Give it a ⭐ if the codebase helped you!</sub>
</div>
