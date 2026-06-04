-- Intelligence OS — Supabase Schema
-- Run this SQL in your Supabase project's SQL editor

-- ============================================================
-- SOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  url           TEXT NOT NULL UNIQUE,
  type          TEXT NOT NULL DEFAULT 'rss',
  section       TEXT NOT NULL,
  geo           TEXT NOT NULL DEFAULT 'Global',
  active        BOOLEAN NOT NULL DEFAULT true,
  health_score  INTEGER NOT NULL DEFAULT 80,
  last_fetched  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sources_section_idx ON sources(section);
CREATE INDEX IF NOT EXISTS sources_active_idx ON sources(active);

-- ============================================================
-- ARTICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  url           TEXT NOT NULL UNIQUE,
  source_name   TEXT,
  section       TEXT,
  geo           TEXT DEFAULT 'Global',
  published_at  TIMESTAMPTZ,
  content       TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS articles_section_idx   ON articles(section);
CREATE INDEX IF NOT EXISTS articles_geo_idx        ON articles(geo);
CREATE INDEX IF NOT EXISTS articles_published_idx  ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS articles_title_search   ON articles USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS articles_content_search ON articles USING gin(to_tsvector('english', coalesce(content, '')));

-- ============================================================
-- SUMMARIES
-- ============================================================
CREATE TABLE IF NOT EXISTS summaries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id    UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  summary       TEXT,
  operator_take TEXT,
  investor_take TEXT,
  word_count    INTEGER DEFAULT 0,
  paywalled     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id)
);

CREATE INDEX IF NOT EXISTS summaries_article_idx ON summaries(article_id);

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id    UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  topics        TEXT[] DEFAULT '{}',
  companies     TEXT[] DEFAULT '{}',
  people        TEXT[] DEFAULT '{}',
  policies      TEXT[] DEFAULT '{}',
  technologies  TEXT[] DEFAULT '{}',
  geo           TEXT DEFAULT 'Global',
  sentiment     TEXT DEFAULT 'neutral',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id)
);

CREATE INDEX IF NOT EXISTS tags_article_idx   ON tags(article_id);
CREATE INDEX IF NOT EXISTS tags_topics_idx    ON tags USING gin(topics);
CREATE INDEX IF NOT EXISTS tags_companies_idx ON tags USING gin(companies);
CREATE INDEX IF NOT EXISTS tags_created_idx   ON tags(created_at DESC);

-- ============================================================
-- TRENDS
-- ============================================================
CREATE TABLE IF NOT EXISTS trends (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic                    TEXT NOT NULL UNIQUE,
  velocity                 NUMERIC DEFAULT 0,
  status                   TEXT DEFAULT 'peaked',
  article_count_this_week  INTEGER DEFAULT 0,
  article_count_last_week  INTEGER DEFAULT 0,
  first_seen               TIMESTAMPTZ,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trends_velocity_idx ON trends(velocity DESC);
CREATE INDEX IF NOT EXISTS trends_status_idx   ON trends(status);

-- ============================================================
-- MEMOS
-- ============================================================
CREATE TABLE IF NOT EXISTS memos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start  TIMESTAMPTZ NOT NULL UNIQUE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS memos_week_idx ON memos(week_start DESC);

-- ============================================================
-- READING HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS reading_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  read_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed   BOOLEAN DEFAULT false,
  skipped     BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS rh_article_idx  ON reading_history(article_id);
CREATE INDEX IF NOT EXISTS rh_read_at_idx  ON reading_history(read_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (optional — disable for personal use)
-- ============================================================
-- ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
