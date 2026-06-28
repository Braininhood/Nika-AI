# API data files (`apps/api/app/data`)

Static JSON consumed by FastAPI services. Committed to git unless noted.

## Daily tips — `daily_tips.json`

Curated **Today's tip** content for the web app and `GET /api/v1/vocabulary/today-tip`.

### Schema (each object in `tips[]`)

| Field | Required | Description |
| ----- | -------- | ----------- |
| `id` | yes | Stable slug, e.g. `dentistry-gingival-bleeding` |
| `professions` | yes | OET profession codes and/or `"all"` for fallback pool |
| `headline` | no | Override headline; generic tips use profession label |
| `term` | yes | Main vocabulary term |
| `phonetic` | no | IPA string |
| `definition` | yes | Plain English definition |
| `example` | yes | Example sentence |
| `speaking` | no | `{ opening, clinical_questions, empathy, explanation, advice }` — string arrays |
| `writing_clinical` | no | Clinical note phrases |
| `writing_key_phrases` | no | Letter/report phrases |
| `exam_tip_use` / `exam_tip_avoid` | no | Do / don't lists |
| `grade_a_phrase` | no | High-band example phrase |
| `vocabulary_phrases` | no | `{ phrase, meaning, example }[]` for **Add to my list** |

### Profession codes

`medicine`, `nursing`, `pharmacy`, `dentistry`, `physiotherapy`, `radiography`,
`occupational_therapy`, `optometry`, `podiatry`, `veterinary_science`,
`speech_pathology`, `dietetics`.

If no tip matches the user's profession, entries with `"all"` in `professions` are used.

### Selection logic

Implemented in `app/services/daily_tip.py` — one tip per profession per calendar day (stable until midnight UTC date roll).

After editing, restart the API or redeploy; no migration required.

---

## Nika knowledge brain

| File / dir | Purpose |
| ---------- | ------- |
| `healthcare_vocabulary.json` | Curated glossary (all professions) |
| `oet_phrases_index.json` | Auto-harvested phrase index |
| `profession_phrases/*.json` | Per-profession phrase packs (12 OET professions) |
| `.nika_knowledge_sync_state.json` | Last sync metadata (may be local-only) |

Regenerated on API startup when `NIKA_AUTO_SYNC=true` (see root `.env.example`).
Manual harvest: `python scripts/harvest_oet_vocabulary.py` from repo root.

---

## RAG — `rag_corpus.json` vs Supabase `rag_chunks`

| Layer | When it fills | Used by |
| ----- | ------------- | ------- |
| **`rag_corpus.json`** | Loaded in-memory on every API start | Nika tutor RAG (always) |
| **`rag_chunks` (Postgres)** | **Auto on API startup** when `DATABASE_URL` + `RAG_AUTO_SYNC=true`; optional extra markdown via `ingest_rag.py` | Nika tutor RAG (merged with in-memory at query time) |

Both layers are **searched together** — best matches from Postgres + `rag_corpus.json`.

Set `DATABASE_URL` to Supabase direct Postgres (Settings → Database → connection string, use `postgresql+asyncpg://` for the API).

**Optional:** `python scripts/ingest_rag.py` adds markdown from `docs/` on top of the bundled corpus.

---

## Supabase tables — what fills them

| Table | Filled by | Cross-device? |
| ----- | --------- | ------------- |
| `profiles` | Sign-in / onboarding | Yes |
| `user_skill_snapshots` | Skill map save | Yes |
| `diagnostic_sessions` | Diagnostic complete (online) | Yes |
| `attempts` | `POST /api/v1/progress/sync` after quizzes/practice | Yes (after migration `20250618000000`) |
| `writing_attempts` | Same sync (writing letter + feedback) | Yes |
| `speaking_attempts` | Same sync (transcript + scores) | Yes |
| `vocabulary_entries` | Same sync | Yes |
| `user_study_blobs` | Same sync (drafts, flashcards, mock progress) | Yes |
| `content_items` | **Admin CMS** `/admin/content` — not learners | N/A (shared content) |
| `ml_training_samples` | Mock exam outcomes API | Analytics |
| `rag_chunks` | Auto API startup (`rag_corpus.json`) + optional `ingest_rag.py` | N/A (server knowledge) |

**Removed:** `content_scenarios` — unused; admin uses `content_items` instead. Bundled scenarios stay in `apps/web/src/content/`.

