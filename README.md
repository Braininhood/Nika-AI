# OET Coach

**OET Coach** is a professional [Occupational English Test (OET)](https://www.oet.com/) preparation platform for healthcare professionals. It combines an offline-capable PWA, adaptive study plans, practice across all four skills, and **Nika** — an AI study companion for grounded feedback and exam guidance.

**Product site:** deployed instance TBD · **Support:** braininhood@gmail.com

---

## Features

- Sign-in with magic link or Google (Supabase Auth)
- Diagnostic placement and adaptive daily study plans
- Listening, Reading, Writing, and Speaking practice
- Nika AI tutor with topic guardrails and daily usage quota
- **Nika knowledge brain** — healthcare vocabulary for all 12 OET professions (auto-sync on API startup)
- Offline PWA (IndexedDB + service worker)
- GDPR tooling: data export, account deletion, AI processing consent
- Optional local LLM via Ollama; cloud fallback (Gemini / Groq)

---

## Stack

| Layer | Technology |
| ----- | ---------- |
| Frontend | Next.js 16 PWA, React, Dexie, Serwist |
| API | FastAPI (Python 3.12) |
| Auth & DB | Supabase (Postgres, Auth, Storage) |
| Production TLS | Caddy + Let's Encrypt (EC2) |

---

## Quick start (local development)

### Prerequisites

- **Node.js 20+** and **pnpm**
- **Python 3.12+**
- A **Supabase** project ([supabase.com](https://supabase.com)) with migrations applied from `supabase/migrations/`
- Optional: **Docker** for local Postgres/Redis (`docker compose`)
- Optional: **Ollama** for free on-device LLM (`pnpm setup:ollama`)

### 1. Install dependencies

```bash
pnpm install
cd apps/api
python -m venv .venv
# Windows
.venv\Scripts\pip install -r requirements.txt
# macOS / Linux
.venv/bin/pip install -r requirements.txt
```

### 2. Environment

```bash
cp .env.example .env
cp .env.example apps/web/.env.local
```

Fill in **Supabase URL**, **anon key**, **service role key**, and **JWT secret** from your project dashboard. See `.env.example` for all variables.

Apply database migrations:

```bash
supabase db push
# or run each file in supabase/migrations/ via the Supabase SQL editor
```

### 3. Run

**Option A — API via Docker, web via pnpm (common)**

```bash
docker compose up -d
pnpm dev
```

**Option B — Both without Docker**

```bash
pnpm dev:all
# or separately: pnpm dev:api  +  pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Optional: Ollama (local LLM)

```bash
pnpm setup:ollama
pnpm setup:ollama:check
```

### 5. Verify

```bash
pnpm verify:phase0
curl http://localhost:8000/health
# → includes nika_knowledge stats (glossary, harvested phrases, profession_packs: 12)
```

---

## Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | Next.js dev server |
| `pnpm dev:api` | FastAPI (uvicorn) |
| `pnpm dev:all` | Web + API together |
| `pnpm build` / `pnpm start` | Production build |
| `pnpm setup:ollama` | Install Ollama + pull default model |
| `pnpm pack:sync` | Upload content packs to Supabase Storage |
| `pnpm verify:phase0` | Phase 0 smoke checks |
| `./scripts/deploy-ec2.sh` | Redeploy on EC2 (production; restarts API → Nika auto-sync) |
| `python scripts/harvest_oet_vocabulary.py` | Optional: manual vocabulary harvest (dev/CI) |
| `python scripts/ingest_rag.py` | Optional: embed docs into pgvector RAG |

---

## Project structure

```
apps/web/       Next.js PWA (auth, study UI, Nika, offline storage)
apps/api/       FastAPI (AI, diagnostic scoring, profile, Nika knowledge sync)
                └── app/data/  glossary, profession_phrases/, oet_phrases_index.json
content/        Original scenario JSON (not official OET materials)
deploy/         Caddy, systemd units for EC2
scripts/        Setup, deploy, and verification scripts
supabase/       SQL migrations and auth email templates
docs/           OET research, AI tutor, AWS deploy guides
```

---

## Production deployment

Production runs on a single **EC2** instance (Caddy HTTPS → Next.js → FastAPI on localhost). **Supabase** hosts auth, Postgres, and content-pack storage. **No Docker on the server** — same as local: pnpm + Python venv + systemd.

**Nika knowledge** re-syncs automatically when the API restarts (`./scripts/deploy-ec2.sh` or `systemctl restart Nika-AI-api`). See [docs/04-AI-TUTOR/09-nika-knowledge-brain.md](docs/04-AI-TUTOR/09-nika-knowledge-brain.md) and [docs/07-IMPLEMENTATION/04-aws-free-tier-deploy.md](docs/07-IMPLEMENTATION/04-aws-free-tier-deploy.md).

Key production env vars:

```env
ENVIRONMENT=production
CORS_ORIGINS=https://yourdomain.com
```

Systemd units: `deploy/systemd/`. Hardening script: `scripts/setup-ec2-hardening.sh`.

---

## Security & privacy

- HTTPS-only in production (valid TLS certificates via Caddy)
- API rate limiting, JWT auth on all `/api/v1` routes, RLS on Supabase tables
- Security headers in Next.js and Caddy
- AI processing requires explicit user consent
- Account export and deletion from Profile settings

Do **not** commit `.env`, `apps/web/.env.local`, or AWS `.pem` keys.

---

## Legal notices & disclaimers

**Copyright © 2026 Wisdomwave Hub Ltd.** See [LICENSE](./LICENSE).

### Independence from OET

OET Coach is an **independent** educational product. It is **not** affiliated with, endorsed by, or connected to **OET** or **Cambridge Boxhill Language Assessment**. For official exam information, use [oet.com](https://www.oet.com/).

### Not medical advice

OET Coach is an **English exam preparation** tool only. It does **not** provide medical advice, diagnosis, or treatment. All clinical scenarios are **fictional**. Do not enter real patient identifiable information into practice tasks or AI chat.

### AI-generated content

Nika and automated writing/speaking feedback may contain errors. Always cross-check with official OET materials, your regulator’s requirements, and qualified tutors. **Mock scores and grade estimates are approximate** — only official OET results count for registration.

### Copyrighted OET materials

Do **not** upload official OET test papers or audio to our servers. Users may import materials **locally on their own device** at their own responsibility. The app does not host copyrighted OET content.

### In-app policies

When using the live product, see also:

- `/privacy` — Privacy Policy (UK GDPR / EU GDPR)
- `/terms` — Terms of Service
- `/cookies` — Cookie Policy
- `/about` — Full disclaimers

**Contact:** braininhood@gmail.com

---

## License

Proprietary — all rights reserved. See [LICENSE](./LICENSE). Unauthorized copying, distribution, or commercial use is prohibited without written permission from Wisdomwave Hub Ltd.
