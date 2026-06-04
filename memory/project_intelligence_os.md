---
name: project-intelligence-os
description: Intelligence OS — healthcare intelligence web app built for Divyansh. Current state and known issues.
metadata:
  type: project
---

Intelligence OS is a fully-scaffolded, fully-built web app. Every file specified in the product spec exists and works.

**Why:** Built as a personal healthcare intelligence OS for an operator/investor lens. Spec lives at ../intelligence-os-spec.md (28KB).

**Stack:** Node/Express + Anthropic SDK + Supabase (server), React + Vite + Tailwind (client).

**Architecture divergences from spec (intentional, consistent throughout):**
- Articles use `source_name TEXT` instead of `source_id UUID FK` — simpler
- Tags use array columns (`topics TEXT[]` etc.) not row-per-tag — more efficient
- Table is `memos` not `weekly_memos`
- `paywalled` lives on `summaries` not `articles`

**Fixes applied 2026-06-04:**
- `getTrendArticles` in db.js: fixed to filter by `articles.published_at` instead of `tags.created_at`
- `analyze.js` `< 3` threshold and batch `first_seen` query were already implemented
- `memo.js` `since` date filter was already implemented

**Remaining blockers (user must provide):**
1. ANTHROPIC_API_KEY
2. Supabase project URL + anon key (run schema.sql to create tables)
3. Copy .env.example → .env and fill in values

**How to apply:** When user asks to run the app or test anything, remind them of the .env setup first.
