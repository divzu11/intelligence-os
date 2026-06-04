# Intelligence OS — Gap Analysis & Build Status

_Generated against `intelligence-os-spec.md`. The app is substantially more complete than a fresh scaffold — the core pipeline (ingestion → analysis → API → reader UI) is fully implemented. This document maps every spec requirement to its status and lists what still requires you._

---

## Summary

| Area | Status |
|------|--------|
| Backend (Express, routes, jobs, libs) | **Done** — all 6 route files, both cron jobs, all 4 lib modules present and wired |
| Claude integration (4 functions) | **Done** — `generateSummary`, `generateTags`, `generateWeeklyMemo`, `askArchive` |
| Database schema (Supabase) | **Done (design-deviated, internally consistent)** — see notes |
| Frontend (5 pages + all components) | **Done** — Reader, Trend Radar, Archive, Weekly Memo, Source Manager |
| Design system / theming | **Done** — CSS variables, fonts, dark theme, accent colors |
| Empty/loading/error states | **Done** — every page handles them; ErrorBoundary added |
| Mobile responsiveness | **Done** — sidebar collapses to bottom nav < 768px |
| Runtime config (`.env`, Supabase project) | **Missing — needs you** |

The remaining work is **not** code — it is credentials and a hosted Supabase database. Two minor spec deviations were fixed this pass (below).

---

## Feature-by-feature map

### Backend pipeline

| Spec requirement | Status | File / route |
|---|---|---|
| Express app, mount routes, CORS, serve build in prod | Done | `server/index.js` |
| Seed sources on startup if empty | Done | `server/lib/db.js` → `seedSources()`, `server/config/sources.js` (all 19 sources) |
| Initial ingest on boot | Done | `index.js` runs `runIngest()` after 2s |
| RSS fetch/parse, 10s timeout, never throw | Done | `server/lib/rss.js` |
| Paywall detection (2-of-3 signals) | Done | `server/lib/paywall.js` |
| Ingest every 6h, dedupe by URL, health scoring | Done | `server/jobs/ingest.js` (`0 */6 * * *`, batched URL dedupe) |
| Nightly trend analysis (2am), velocity, status | Done | `server/jobs/analyze.js` (`0 2 * * *`) |
| `GET /api/articles`, `/:id` | Done | `server/routes/articles.js` (+ bonus `/:id/read`) |
| `POST /api/summaries/:articleId` (cache-first, paywall flag) | Done | `server/routes/summaries.js` |
| `GET /api/trends`, `/:topic/articles`, `POST /analyze` | Done | `server/routes/trends.js` |
| `GET /api/archive/search`, `POST /ask` | Done | `server/routes/archive.js` |
| `GET /api/memo/latest`, `/all`, `/:id`, `POST /generate` | Done | `server/routes/memo.js` |
| `GET/POST/PATCH/DELETE /api/sources` (+ manual ingest) | Done | `server/routes/sources.js` |

### Frontend

| Spec page/component | Status | File |
|---|---|---|
| Reader (one-story focus, arrow keys, swipe, prefetch, cache) | Done | `components/Reader/Reader.jsx` + `StoryCard`, `FilterPills`, `ProgressBar` |
| Trend Radar (grid, velocity colors, status badges, view stories, run-now) | Done | `components/TrendRadar/TrendRadar.jsx` + `TrendCard.jsx` |
| Knowledge Archive (two-panel search + Ask Archive) | Done | `components/Archive/Archive.jsx` + `AskArchive.jsx` |
| Weekly Memo (section parsing, generate, previous memos) | Done | `components/WeeklyMemo/WeeklyMemo.jsx` |
| Source Manager (table, health dots, add form, toggle, delete) | Done | `components/SourceManager/SourceManager.jsx` |
| Sidebar (icon nav, tooltips, active accent) | Done | `components/Layout/Sidebar.jsx` |
| Topbar (wordmark, filter pills, story count) | Done | `components/Layout/Topbar.jsx` |
| Mobile bottom nav | Done (beyond spec) | `components/Layout/BottomNav.jsx` |
| API client, hooks (`useArticles`/`useTrends`/`useArchive`) | Done | `src/lib/api.js`, `src/hooks/*` |
| Design system (vars, Playfair + Epilogue, dark theme) | Done | `src/index.css`, `tailwind.config.js` |
| ErrorBoundary | Done (beyond spec) | `components/ErrorBoundary.jsx` |

---

## Intentional schema deviations (no action needed)

The implemented `schema.sql` differs from the spec's literal SQL but is **internally consistent** across server, queries, and client. Do **not** "fix" these to match the spec verbatim — that would break working code. Differences:

- `articles` stores `source_name`, `section`, `geo`, `content` (denormalized) instead of `source_id` FK + `raw_content`. Simpler, fewer joins.
- `tags` is one row per article with `TEXT[]` arrays (`topics`, `companies`, …) instead of one row per tag with `tag`/`tag_type`. The analyze job and Archive UI both rely on the array shape.
- Table named `memos` (not `weekly_memos`); `week_start` is unique → regenerating upserts.
- `summaries` has a `paywalled` boolean (spec implied an "isPaywall flag").
- `trends.topic` is unique; no `last_seen` column (analyze upserts on `topic`).

If you ever want the spec's exact normalized schema, it's a deliberate redesign, not a bug fix — flag it and I'll migrate cleanly.

---

## Fixes applied this pass

1. **Trend threshold (`server/jobs/analyze.js`)** — previously any topic seen ≥1 time this week became a trend, flooding the radar with noise. Now requires **≥3 mentions this week**, matching the spec ("for each topic tag with count >= 3 this week").
2. **Memo windowing (`server/routes/memo.js` + `server/lib/db.js`)** — the memo route's comment claimed "past 7 days" but pulled the latest 30 regardless of date. Added a `since` filter to `getArticles()` and scoped the memo to the last 7 days, with a graceful fallback to latest-30 when the week is empty (so the memo is never blank early on).

Both verified to parse cleanly; no other code touched.

---

## Known non-issues (environmental, not code)

- **`npm run build` fails in a Linux sandbox** with a `rollup` native-module error. This is because `node_modules` was installed on Windows (`rollup-win32-x64-*` binaries present) and won't run under Linux. On your Windows machine it builds fine — `client/dist/` is already present and current. If you ever build on Linux/CI, run `rm -rf node_modules && npm install` there.

---

## Open items requiring design decisions (optional, not blockers)

- **Archive search** uses `ILIKE` substring matching, not the Postgres full-text (`tsvector`) indexes that `schema.sql` creates. It works; upgrading to `websearch_to_tsquery` would improve relevance. Low priority.
- **`reading_history`** records a row on every story view (`completed:false`) plus on "read full article" (`completed:true`). Fine for personal use; could dedupe per article if the table grows large.
- **Auth** — there is none (personal single-user app, as the spec implies). Add Supabase Auth + RLS before any multi-user or public deployment.
