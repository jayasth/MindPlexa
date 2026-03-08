# Contributing to MindPlexa

First off, thank you for taking the time to contribute! 🎉

> **Note:** MindPlexa is in **archive/community-maintained** status. The original author is not actively adding new features but welcomes bug fixes, dependency upgrades, and improvements via Pull Requests.

## Table of Contents
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Code Style](#code-style)
- [Reporting Bugs](#reporting-bugs)

---

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- A [Supabase](https://supabase.com) account (free tier works)
- A [Stripe](https://stripe.com) account for payment features
- An [OpenAI](https://openai.com) or [Anthropic](https://anthropic.com) API key for AI features

### Setup
1. **Fork** this repository to your own GitHub account
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/MindPlexa.git
   cd MindPlexa
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your own API keys
   ```
5. **Set up Supabase:**
   - Create a project at [app.supabase.com](https://app.supabase.com)
   - Run the SQL from `schema.sql` in the Supabase SQL editor
6. **Run the dev server:**
   ```bash
   npm run dev
   ```

---

## How to Contribute

### Branch naming convention
- Bug fixes: `fix/short-description`
- Features: `feat/short-description`
- Documentation: `docs/short-description`
- Dependency updates: `chore/update-dependencies`

### Submitting a Pull Request
1. Create a branch from `master`
2. Make your changes
3. Run `npm run lint` to ensure no lint errors
4. Commit with a clear message (e.g., `fix: correct canvas node z-index on drag`)
5. Push and open a PR against `master`
6. Describe **what** you changed and **why** in the PR description

### Good First Issues
Look for issues tagged `good first issue` — these are well-scoped tasks ideal for first-time contributors.

---

## Code Style

- **TypeScript** is used throughout — please maintain type safety
- **ESLint + Prettier** are configured — run `npm run prettier-fix` before committing
- Follow the existing file/folder structure (domain-separated stores, co-located UI components)

---

## Reporting Bugs

Use the [GitHub Issues](https://github.com/jayasth/MindPlexa/issues) tab.

Please include:
- Your Node.js and npm version
- Steps to reproduce the bug
- What you expected vs. what happened
- Any relevant console errors

---

## Questions?

Open a [GitHub Discussion](https://github.com/jayasth/MindPlexa/discussions) — that's the best place for general questions and ideas.
