# Intelligence OS

A personal intelligence platform that monitors healthcare news, synthesises signal from noise using Claude AI, and delivers targeted briefings for operators and investors. Built on an Inshorts-style reader experience with trend detection, a knowledge archive, and weekly AI-generated memos.

## Prerequisites

- Node.js 18+
- A Supabase account (free tier works)
- An Anthropic API key

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your keys
3. Create a Supabase project and run the SQL schema from `schema.sql`
4. Install dependencies: `npm install && cd server && npm install && cd ../client && npm install`
5. Run: `npm run dev`

## Adding New Sources

Go to the Sources page in the app and use the Add Source form. Provide the RSS feed URL, name, type, section (healthtech/investing/operations/insurance), and geography (US/India/Global).

## Changing the Industry Vertical

1. Update `server/config/sources.js` with sources for your vertical
2. Update the section names in `server/config/sources.js` and match them in the frontend filter pills in `client/src/components/Reader/FilterPills.jsx`
3. Update the Claude prompts in `server/lib/claude.js` to reference your industry
