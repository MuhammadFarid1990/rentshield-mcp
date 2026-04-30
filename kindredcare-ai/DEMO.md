# KindredCare AI — Demo Walkthrough

A 5-minute scripted demo covering all three user roles: senior, guardian, and care center staff.

## Setup

1. Apply database migrations: `supabase db reset` (or `psql ... < supabase/migrations/*.sql`)
2. Seed demo data: `psql $SUPABASE_DB_URL < supabase/seed/seed.sql`
3. Start the app: `npm run dev`
4. Open http://localhost:3000

## Demo Accounts

All passwords are `demo1234`.

| Role | Email | Notes |
|---|---|---|
| Senior | `eleanor@kindredcare.demo` | Eleanor Hayes, 78. High BP watch. |
| Senior | `robert@kindredcare.demo` | Robert Chen, 82. Diabetic. Loneliness signal. |
| Guardian | `margaret@kindredcare.demo` | Eleanor's daughter. |
| Guardian | `david@kindredcare.demo` | Robert's son. |
| Staff | `sarah@kindredcare.demo` | Nurse at Sunny Acres. Sees both seniors. |

---

## Walkthrough (5 minutes)

### 1. Senior Experience — Eleanor (90 sec)

Sign in as `eleanor@kindredcare.demo`.

- **Home** — large buttons, time-of-day greeting, next reminder card.
- **Today** — tap to see today's reminders grouped by type. Tap "Read my day" — voice briefing plays.
- **Talk** — tap mic, say or type "What is on my calendar today?" — AI grounded answer (lunch, cardiology appt, dinner).
- **Mark medicine taken** — say "I took my morning medicine" — confirmation prompt appears, tap Yes.
- **AI safety** — say "What medicine should I take?" — AI refuses with safe fallback ("I want to be careful…").
- **Emergency** — say "I fell and can't get up" — full-screen red overlay with Call 911 button (do NOT tap). Tap "I'm okay" to dismiss.
- **Help** tab — emergency contacts, doctors, care center phone, all one-tap dial.

### 2. Guardian Experience — Margaret (90 sec)

Sign out, sign in as `margaret@kindredcare.demo`.

- **Dashboard** — "Is my loved one okay today?" headline. Eleanor's status card shows green with one yellow flag (BP trend). Today summary: medicine 2/3, meals 1/3, mood great, BP 135/85. Suggested action grid (call / reminder / notify center / review health).
- **Recent Alerts** card — 1 medium alert about BP trending high.
- **Care Center Notes** — staff note about Eleanor's gardening club visit.
- **Weekly Progress** — 95% med compliance, AI summary visible.
- Tap **Health** in nav — BP trend chart shows the day-4 spike then return to normal.
- Tap **Calendar** — see Eleanor's full week.
- Tap **Messages** — send Eleanor a quick "Don't forget your appointment".

### 3. Care Center Experience — Sarah (90 sec)

Sign out, sign in as `sarah@kindredcare.demo`.

- **Monitoring** dashboard — 5-tile stats: 2 seniors, 3 open alerts, today's mood per senior, completed/missed counts. Tap "Refresh status" — green spinner.
- **Attention Queue** — Robert flagged with loneliness + missed Aspirin. Eleanor flagged for BP trend.
- Tap into **Robert's detail page** — full view: today's reminders (1 missed), medication compliance 7-day chart, recent vitals (last 5 BP + sugar), mood trend (Recharts bar chart showing 2 sad days), wellness check-ins, weekly AI summary with Generate button.
- **Activities** — 3 upcoming center events (Bingo today, stretch class tomorrow, music hour).
- **Reports** — weekly progress reports for both seniors.

### 4. AI Safety + Eval Demo (30 sec)

Back in terminal:

```bash
npm run eval:safety   # 40/40 cases pass
npm run test          # 23/23 unit tests pass
```

Highlights:
- Emergency phrase coverage: 11 cases (fell, chest pain, fainting, can't get up, etc.).
- Forbidden output filter: catches "you should take 500mg", diagnosis attempts, "based on your symptoms".
- Action confirmation: every write intent (BP, sugar, reminder, medicine, visit, transport, call) requires confirm.
- Conversation logging: `voice_conversations` table records intent, action_confirmed, safety_flag, and hallucination reason for every AI turn.

---

## Talking points

- **Voice-first, but typing always works** — built for seniors with mobility, vision, or speech variability.
- **Three connected experiences** — senior, guardian, care center. Real-time visibility across the care circle.
- **Grounded AI** — every answer is anchored to the senior's actual schedule, medications, and contacts. No hallucinated readings or appointments.
- **Safety first** — high-risk phrases trigger emergency overlay before reaching the LLM. Forbidden output filter blocks diagnosis or dosage advice. Eval pipeline runs 50 test cases on every change.
- **Privacy** — RLS-enforced row-level access. Seniors, guardians, and staff each only see what their role permits. No data sharing with third parties.
