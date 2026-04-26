# KindredCare AI

A voice and typing-based senior care companion that connects seniors, family guardians, doctors, and senior care centers. KindredCare AI helps seniors live safely and independently while giving guardians and senior care centers real-time visibility into reminders, check-ins, health logs, risk alerts, visit requests, and weekly progress.

## Roles

- **Senior** — voice + typing companion, simple Talk / Today / Help home
- **Guardian** — dashboard answering "is my loved one okay today?", calendar/medication management
- **Care Center Staff** — monitoring portal, "Who Needs Attention?" queue, activities, visits, transportation
- **Admin** — platform-wide oversight, audit logs

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Auth + DB**: Supabase (Postgres, Auth, Realtime, Storage, Row Level Security)
- **AI**: Anthropic Claude (`claude-opus-4-7`) via `@anthropic-ai/sdk`
- **Voice**: Web Speech API (STT + SpeechSynthesis TTS) — zero-infra MVP, swappable for Deepgram/ElevenLabs
- **Charts**: Recharts
- **Validation**: Zod
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel (Next.js) + Supabase (DB + Edge Functions)

## Quick Start

### Prerequisites

- Node.js 20+ and pnpm 9+
- A Supabase project ([create one free](https://supabase.com))
- An Anthropic API key ([get one](https://console.anthropic.com))

### 1. Install

```bash
cd kindredcare-ai
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings (server-only, never expose)
- `ANTHROPIC_API_KEY` — from Anthropic console
- `CRON_SECRET` — any long random string (used by edge functions)

### 3. Run migrations

In the Supabase dashboard SQL editor, run each file in `supabase/migrations/` in order:

```
0001_init_users_roles.sql
0002_seniors_guardians_centers.sql
0003_links_and_circle.sql
0004_preferences_contacts.sql
0005_calendar_reminders.sql
0006_medications.sql
0007_health_records.sql
0008_alerts_notes.sql
0009_activities_transport_visits.sql
0010_progress_audit.sql
0011_indexes.sql
```

Then optionally run `supabase/seed/seed.sql` for demo data.

### 4. Deploy edge functions (optional, for cron jobs)

```bash
supabase functions deploy nightly-care-status
supabase functions deploy missed-reminder-sweeper
supabase functions deploy weekly-progress-report
```

Schedule them in Supabase dashboard → Database → Cron Jobs:
- `nightly-care-status` — `0 4 * * *`
- `missed-reminder-sweeper` — `*/15 * * * *`
- `weekly-progress-report` — `0 5 * * 1`

### 5. Run dev server

```bash
pnpm dev
```

Open http://localhost:3000.

### 6. Sign up

Visit `/role-select` and pick a role. Senior signup uses voice prompts (Web Speech API — works best in Chrome/Edge). Guardian and Staff use typed forms.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run `tsc --noEmit` |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:e2e` | Run Playwright e2e tests |
| `pnpm eval` | Run all eval cases (safety + voice actions) |
| `pnpm eval:safety` | Run safety/hallucination eval suite only |
| `pnpm eval:voice-actions` | Run voice action confirmation eval suite |

## AI Safety

KindredCare AI is **not** a doctor and is not for medical diagnosis or treatment. The AI orchestrator (`src/lib/ai/orchestrator.ts`) enforces multiple layers of safety:

1. **High-risk phrase pre-filter** — deterministic regex scan of user input for "I fell", "chest pain", "cannot breathe", etc. Triggers an emergency UI bypass without involving the LLM.
2. **Grounded context** — the system prompt is built from real Supabase data; the model is instructed to use only that context and to reply "I do not have that information yet" when something is missing.
3. **Forbidden output filter** — post-processes the LLM reply to reject medical diagnosis, dosage advice, "you should take X mg", etc.
4. **Mandatory confirmation** — every mutating action (logging health data, marking medicine taken, creating appointments) goes through `<ConfirmAction>` requiring explicit Yes/No.

Run `pnpm eval:safety` to verify these guarantees. The eval suite **fails CI** if regressions are detected.

## Deployment

### Vercel (frontend)

1. Push to GitHub
2. Import the repo in Vercel
3. Set the **Root Directory** to `kindredcare-ai`
4. Add the same environment variables from `.env.local` (Vercel → Project Settings → Environment Variables)
5. Deploy

### Supabase (DB + Edge Functions)

Already covered in the Quick Start. Once edge functions are deployed and scheduled, the platform runs autonomously.

## Architecture

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # role-select, login, signup/{senior|guardian|staff}
│   ├── (senior)/         # home, talk, today, calendar, medication, health, wellness, help, messages, offline-card
│   ├── (guardian)/       # dashboard, calendar, medication, health, alerts, messages, settings
│   ├── (center)/         # monitoring, attention, seniors, calendar, activities, visits, transportation, alerts, reports
│   ├── (admin)/          # dashboard, centers, users, audit-logs
│   └── api/              # AI chat, intents, reminders, medications, health, wellness, alerts, visits, etc.
├── components/           # ui, senior, voice, calendar, medication, health, guardian, center, layout, shared
├── hooks/                # useSpeechRecognition, useSpeechSynthesis, useVoiceConversation, useRole
├── lib/
│   ├── ai/               # provider, orchestrator, prompts, grounding, safety
│   ├── intents/          # rules-first classifier, handlers, router
│   ├── care-status/      # green/yellow/red engine
│   ├── supabase/         # browser, server, service-role clients
│   └── utils/            # cn, date, env validation
└── types/                # domain.ts, intents.ts, api.ts
```

## License

Proprietary. © KindredCare AI.
