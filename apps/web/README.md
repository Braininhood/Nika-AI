# OET Coach — Web app (`apps/web`)

Next.js 16 PWA for OET study: dashboard, adaptive plans, skill practice (Listening, Reading, Writing, Speaking), vocabulary, and Nika AI tutor.

## Run locally

From repo root:

```bash
pnpm install
pnpm dev          # web only (API at localhost:8000 via proxy or NEXT_PUBLIC_API_URL)
pnpm dev:all      # web + FastAPI together
```

Open [http://localhost:3000](http://localhost:3000). Copy env from root `.env.example` → `apps/web/.env.local`.

## Key routes

| Route | Purpose |
| ----- | ------- |
| `/dashboard` | Home — today's study plan, **Today's tip** button, skill shortcuts |
| `/today-tip` | Daily profession tip (term, speaking/writing phrases, add to vocabulary) |
| `/vocabulary` | Healthcare vocabulary — manual add, common OET phrases, today's tip phrases |
| `/study` | Study hub |
| `/reading`, `/listening`, `/writing`, `/speaking` | Skill hubs and sessions |

Study session pages use `StudyPageHeader` / `StudyBackLink` for consistent back navigation and titles.

## Vocabulary flow

1. **Today's tip** (`/today-tip`) — fetches `GET /api/v1/vocabulary/today-tip`, caches in localStorage (`oet-today-tip-cache`).
2. **Vocabulary page** (`/vocabulary`) — `VocabularyPanel` loads saved entries from IndexedDB and today's tip when online.
3. **Add to my list** — one-click save on tip phrases and **Common OET phrases**:
   - Calls Nika explain + DeepL translate (when signed in)
   - Saves via `saveVocabularyEntry` in `src/lib/vocabulary/service.ts`
   - Button states: Add → Saving… → In your list ✓
4. **Sources** — `VocabularyEntry.source`: `manual`, `today_tip`, `reading`, `quiz`, `nika`.

Starter phrases: `src/content/assessment/vocab-bank.ts` (`VOCAB_PHRASES`).

## UI patterns

| Component | Location | Use |
| --------- | -------- | --- |
| `SecondaryActionButton` / `SecondaryActionLink` | `components/ui/secondary-action-button.tsx` | In-card actions (not link-styled text) |
| `CollapsibleSection` | `components/ui/collapsible-section.tsx` | Reference content (passages, examples, OET phrases) |
| `StudyPageHeader` | `components/study/study-page-header.tsx` | Session pages — back link, title, description |
| `SkillHubHeader` | `components/study/skill-hub-header.tsx` | Skill list hubs |

Reference panels (model letters, lesson examples, quiz answer review, etc.) default **collapsed** so prompts stay primary on mobile.

## Offline & storage

- **Dexie / IndexedDB** — profile, vocabulary, progress, plans (`src/lib/db/`)
- **Serwist** — service worker for offline shell
- Vocabulary works offline for saved entries; explain/translate/today-tip need network + auth

## Build

```bash
pnpm build
pnpm start
```

Typecheck: `pnpm exec tsc --noEmit`

## See also

- Root [README.md](../../README.md) — full stack, API, deploy, daily tips data
- Private docs (local): `docs/` — design, AI tutor, deployment (not committed to git)
