# KindredCare AI — 5-Minute Demo Script

Presentation-ready walkthrough covering all three roles: Senior, Guardian, and Care Center staff. Total runtime ≈ 5 minutes.

---

## Demo Login Accounts

All accounts use the password **`demo1234`**.

| Role | Email | Who |
|---|---|---|
| Senior | `eleanor@kindredcare.demo` | Eleanor Hayes, 78 — high BP watch, cardiology appt today |
| Senior | `robert@kindredcare.demo` | Robert Chen, 82 — diabetic, loneliness signal this week |
| Guardian | `margaret@kindredcare.demo` | Margaret Hayes — Eleanor's daughter |
| Guardian | `david@kindredcare.demo` | David Chen — Robert's son |
| Staff (Nurse) | `sarah@kindredcare.demo` | Sarah Mitchell, RN — Sunny Acres, sees both seniors |

---

## Segment 1 — Senior Experience: Eleanor (90 seconds)

**Sign in as `eleanor@kindredcare.demo` / `demo1234`**

1. **Landing page** → click **Sign In** → enter email + password → submit. Redirected to `/home`.

2. **Home screen** — Large font, time-of-day greeting ("Good morning, Eleanor"), today's date, next reminder card ("Lunch at 12:00 PM"). Four big buttons: Today, Talk, Help, Health.

3. **Tap "Today"** — Today's reminders grouped:
   - Breakfast ✅ done
   - Drink Water ✅ done
   - Lunch (pending)
   - Cardiology – Dr. Webb 2 PM (pending)
   - Dinner (pending)

   Tap **"Read My Day"** — voice briefing plays aloud.

4. **Back → tap "Talk"** — Loading spinner, then Talk screen.
   - Say or type: **"What is on my calendar today?"** → grounded reply lists Lunch, cardiology appointment, Dinner.
   - Say or type: **"I took my morning medicine"** → AI asks: *"Shall I mark your medicine as taken?"* → Tap **Yes** → *"Done!"*

5. **AI safety — say: "What medicine should I take?"** → AI refuses with safe fallback:
   > *"I want to be careful. I do not have enough verified information to answer that. Please contact your guardian, senior care center, or doctor."*

6. **Emergency — say: "I fell and I can't get up"** → Full-screen red overlay (pre-LLM, deterministic). Buttons: **Call 911 Now** (don't tap), **Show Emergency Contacts**. Tap **"I'm okay, go back"** to dismiss.

7. **Tap "Help" tab** — Emergency Card:
   - Margaret Hayes (daughter, 555-0301)
   - Thomas Hayes (son, 555-0303)
   - Sunny Acres (555-0100)
   - Dr. Linda Park (primary, 555-0501)
   - Dr. Marcus Webb (cardiology, 555-0502)

   All entries are tap-to-call.

---

## Segment 2 — Guardian Experience: Margaret (90 seconds)

**Sign out → sign in as `margaret@kindredcare.demo` / `demo1234`**

8. **Guardian Dashboard** — Headline: *"Is my loved one okay today?"* Eleanor's section shows:
   - **Status**: 🟢 Green — "Doing well today" / 1 open alert
   - **Suggested actions**: Call Eleanor / Add reminder / Notify center / Review health
   - **Today Summary**: Medicine 2/3 · Meals 1/3 · Hydration 2/2 · Mood: good · BP: 135/85
   - **Recent Alerts**: 1 medium — *"Blood pressure trending high"* (day-4 reading 145/92)
   - **Care Center Notes**: Staff note about gardening club, reminder about cardiology today
   - **Weekly Progress**: 95% med compliance, AI summary visible

9. **Tap "Health"** in sidebar → BP trend chart (7 readings, day-4 spike at 145/92, then return to normal). Wellness check-ins below.

10. **Tap "Calendar"** → Eleanor's full week including today's cardiology appointment.

11. **Tap "Messages"** → Type: *"Don't forget your cardiology appointment today, Mom — I'll call after!"* → Send.

12. **Tap "Alerts"** → Full list: 1 medium open (BP trend), 1 low acknowledged (refill due).

---

## Segment 3 — Care Center Experience: Sarah (90 seconds)

**Sign out → sign in as `sarah@kindredcare.demo` / `demo1234`**

13. **Monitoring dashboard** — Stats row: **2 seniors** enrolled · **3 open alerts** · today's completed events. Tap **Refresh Status** — green spinner, statuses recompute.

14. **Attention Queue**:
    - Eleanor: 🟢 green, 1 alert
    - Robert: 🟡 yellow, 3 alerts, missed aspirin, loneliness flag

15. **Click into Robert's detail page:**
    - Today's reminders: Breakfast ✅, Metformin ✅, Aspirin ❌ MISSED, sugar check pending, Bingo pending, Dinner pending
    - Medication compliance (7 days): **78%**
    - Recent vitals: last 5 BP (one at 142/88 flagged), last 5 sugar (one at 195 flagged)
    - Mood trend (14 days): 2 sad/lonely days shown in amber
    - Weekly AI Summary: *"Robert had a mixed week… Loneliness reported on two days… Suggest a family call this weekend."* — **Generate** button visible

16. **Activities tab** — 3 upcoming events:
    - Bingo today 2 PM (Robert attending)
    - Gentle Stretch tomorrow 10 AM
    - Music Hour in 2 days

17. **Reports tab** — Weekly table for both seniors:
    - Eleanor: 95% compliance, 0 loneliness logs
    - Robert: 78% compliance, 2 loneliness logs

---

## Segment 4 — AI Safety Pipeline (30 seconds, terminal)

```bash
npm run eval:safety   # 40/40 cases pass
npm run test          # 23/23 unit tests pass
```

**Talking points:**

- **Pre-LLM emergency filter** — phrases like *fell*, *chest pain*, *can't breathe*, *fainting* trigger the red overlay before the LLM is ever called. Deterministic, zero hallucination risk.
- **Confirmation gate on every write** — marking medicine, logging BP/sugar, creating reminders, calling contacts, requesting transport — none touch the database without an explicit senior "Yes".
- **Post-output filter** — blocks diagnosis, dosage advice, "based on your symptoms" phrasing. Replaced with the safe fallback reply.
- **Full audit trail** — every AI turn logged in `voice_conversations`: transcript, intent, action_confirmed, safety_flag, hallucination reason.
- **Row-level security** — seniors see only their own data; guardians see only linked seniors; staff see only their center's seniors. Enforced at the database, not just the UI.

---

## Closing Pitch (30 seconds)

> KindredCare AI is voice-first senior care that families and care centers can actually trust. Seniors get a calm, large-print companion that listens, reminds, and escalates emergencies — without ever guessing at medical advice. Guardians get a single "Is my loved one okay today?" view across medicine, mood, vitals, and alerts. Care centers get a real attention queue grounded in the same data, not a separate silo.
>
> Three connected experiences, one source of truth, and a safety pipeline that's audited on every commit. **That's KindredCare.**
