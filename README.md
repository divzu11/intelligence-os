# Intelligence OS

**A personal intelligence platform for healthcare.** Intelligence OS continuously
monitors healthcare news, uses Claude to turn raw articles into operator- and
investor-ready briefings, detects which topics are accelerating, and writes an
automated weekly memo. It packages all of this into an Inshorts-style reader
designed to be read in a few minutes a day.

---

## The Problem

Anyone trying to stay on top of a fast-moving industry faces the same bind: there
is far too much to read, most of it is noise, and the small amount of signal is
buried across dozens of sources. Healthcare is an especially acute case — the news
that matters to a hospital operator (staffing, reimbursement, operations) is
different from the news that matters to an investor (deals, valuations, market
structure), yet both have to wade through the same undifferentiated feed.

Existing readers (RSS aggregators, newsletters) solve *collection* but not
*synthesis*. They hand you more to read, not less. Intelligence OS starts from the
opposite premise: the goal is to read **less**, by having an AI layer do the
summarizing, framing, and trend-spotting that a human analyst would otherwise do.

## What It Does

- **AI-summarized reader.** Every article is condensed to ~100 words and given two
  distinct framings — an **Operator Take** and an **Investor Take** — so the same
  story serves two audiences without re-reading.
- **Trend Radar.** Articles are tagged by topic; the system compares this week's
  volume to last week's to compute a velocity and classify each topic as
  *Emerging, Rising, Peaked,* or *Fading* — surfacing signals early.
- **Knowledge Archive.** A searchable, filterable history of everything ingested,
  plus an "Ask the Archive" interface that answers natural-language questions
  across the corpus.
- **Weekly Memo.** An automatically generated briefing (This Week in Brief, Top 3
  Signals, a Weak Signal to Watch, and a US→India cross-market view) — the thing
  you'd actually forward to a colleague.
- **Source management.** Add, toggle, and health-score RSS sources from the UI.

## Architecture

A clean three-tier design:

| Layer       | Stack                                                        | Responsibility                                              |
|-------------|--------------------------------------------------------------|-------------------------------------------------------------|
| **Frontend**| React 18 + Vite + React Router                               | Reader, Trend Radar, Archive, Memo, Sources; responsive (desktop sidebar / mobile bottom-nav) |
| **Backend** | Node + Express                                               | REST API, scheduled jobs (`node-cron`), RSS ingest, paywall detection |
| **AI**      | Claude (Anthropic API)                                       | Summarization, operator/investor framing, topic tagging, trend narration, weekly memo, archive Q&A |
| **Storage** | Supabase (Postgres)                                          | Articles, summaries, tags, trends, memos, reading history   |

The data pipeline runs end to end automatically: **scheduled RSS ingest →
paywall filter → Claude summarization + tagging → trend analysis → weekly memo**,
all served through the reader. Summaries are generated once and cached.

## Running It

The project ships with a **curated sample dataset** so it runs immediately, with
no external accounts or keys required — ideal for review and evaluation:

```bash
cd client
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173). The app loads fully
populated and every surface is interactive.

To run against **live data** instead — pulling real RSS feeds, generating real
summaries with Claude, and persisting to your own database — set `VITE_DEMO=false`
and complete the setup below.

### Live data setup

1. Copy `.env.example` to `.env` and fill in your keys.
2. Create a Supabase project and run `schema.sql` in its SQL editor.
3. Install dependencies: `npm install && cd server && npm install && cd ../client && npm install`
4. From the project root, run: `npm run dev` (starts API + client together).

**Prerequisites for live mode:** Node.js 18+, a Supabase account (free tier works),
and an Anthropic API key.

## Project Structure

```
intelligence-os/
├── server/                 # Node/Express API + scheduled jobs
│   ├── config/sources.js   # RSS source list (swap to change vertical)
│   ├── jobs/               # ingest.js (RSS) + analyze.js (trends)
│   ├── lib/                # claude.js, db.js, rss.js, paywall.js
│   └── routes/             # articles, summaries, trends, memo, archive, sources
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # Reader, TrendRadar, Archive, WeeklyMemo, SourceManager
│       ├── pages/          # Home, Trends, Archive, Memo, Sources
│       └── lib/            # api.js + sample dataset layer
├── schema.sql              # Postgres schema (7 tables)
└── WALKTHROUGH.md          # Guided tour of the app
```

## Design Decisions & Iteration

- **Two-audience framing.** The core insight is that the *same* article means
  different things to an operator vs. an investor. The summarization prompt
  produces both takes in one pass, which is what makes this more than a reader.
- **Velocity over volume for trends.** Raw article counts favor evergreen topics.
  Comparing week-over-week change surfaces what's *accelerating*, which is the more
  useful signal — hence the Emerging/Rising/Peaked/Fading classification.
- **Outcome-aware pricing of compute.** Summaries are cached per-article and
  paywalled content is detected and skipped before hitting the model, to avoid
  spending API calls on text the model can't actually read.
- **Vertical-swappable by design.** The industry is not hard-coded — changing the
  sources in `server/config/sources.js`, the filter pills, and the Claude prompts
  retargets the entire system to a different domain.

## Validation & Limitations

**How quality is checked.** Summaries are constrained to a target length and a
fixed JSON schema (summary / operator take / investor take), and the curated
dataset doubles as a reproducible fixture for verifying that every surface renders
correctly without depending on live feeds. The production build and the data layer
are verified to compile and return well-formed data for all routes.

**Known limitations (honest):**
- Trend classification is volume/velocity based, not semantic — it can be fooled by
  a single high-output source or by topic-tag granularity.
- Summary quality is bounded by source content; paywalled articles yield only a
  headline-level note rather than a full summary.
- "Ask the Archive" retrieves by keyword match plus recent reads, not vector
  similarity, so recall on paraphrased queries is limited.
- The weekly memo reflects only what was ingested that week; sparse weeks produce
  thinner memos.

**Natural next steps:** semantic (embedding-based) search for the archive,
per-specialty summary evaluation, and source-quality weighting in trend scoring.

## AI Usage & Attribution

This project was built with substantial AI assistance (Anthropic's Claude, via
Claude Code) for scaffolding, prompt design, and the data layer; the problem
framing, architecture, product decisions, and iteration were author-directed. The
application also uses the Claude API at runtime as its core summarization and
analysis engine — that is the point of the project, not a shortcut.

The codebase is original (not forked from an existing repository). RSS content is
ingested from the publicly listed sources in `server/config/sources.js` and is
attributed to its source in the UI. Development history is visible in the
repository's commit log.
