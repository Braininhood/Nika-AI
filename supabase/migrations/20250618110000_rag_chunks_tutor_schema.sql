-- Tutor RAG schema — matches apps/api rag_corpus.json + rag_sync on API startup.
-- Replaces legacy rag_chunks (UUID + metadata only) which was never used by retrieval.

DROP TABLE IF EXISTS rag_chunks CASCADE;

CREATE TABLE rag_chunks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  skill TEXT NOT NULL DEFAULT 'all',
  profession TEXT NOT NULL DEFAULT 'all',
  source TEXT,
  category TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  embedding vector(384),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_skill ON rag_chunks (skill);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_profession ON rag_chunks (profession);

-- Service role writes via API; no learner RLS needed for tutor corpus
ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service reads rag chunks" ON rag_chunks;
CREATE POLICY "Service reads rag chunks" ON rag_chunks
  FOR SELECT USING (true);
