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

## RAG corpus

`rag_corpus.json` — optional embedded document chunks for tutor RAG (`scripts/ingest_rag.py`).
