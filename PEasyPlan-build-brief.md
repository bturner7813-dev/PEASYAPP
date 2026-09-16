# PEasyPlan v1 — Build Brief

**Owner:** Ben (founder)
**Purpose of this document:** everything a developer, or Claude Code, needs to build the first paid version of PEasyPlan: a website where UK primary teachers create an account, subscribe, and generate games-based PE session cards.

**How to use it with Claude Code:** put this file in an empty project folder, open the folder in Claude Code, and say: *"Read PEasyPlan-build-brief.md. Build it milestone by milestone, starting with Milestone 1. Stop at the end of each milestone so I can test it."*

---

## 1. What PEasyPlan is

A UK primary class teacher, often not a PE specialist, enters their lesson (sport or theme, a description of the lesson, the learning objective and lesson outcomes) plus their setup (year group, class size, space, time, weather, kit) and gets a ready-to-teach, **games-based** session card in under a minute, **built around their objective and outcomes**: warm-up, three main games with add-ons, easier and harder progressions, three open questions to ask mid-game, and kit and safety notes.

**Product principles for v1**

- One job done brilliantly: generate, save, print. No extra tools.
- Built for a non-specialist teacher with seven minutes before the lesson. Plain English, fast, works well on a phone and a school laptop.
- **No pupil personal data.** Teachers only enter class-level details. The form must never ask for names, and the privacy policy says so.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Hosting | Vercel |
| Auth + database | Supabase (Postgres with Row Level Security) |
| Payments | Stripe Billing: Checkout, Customer Portal, Invoicing, webhooks |
| AI | Anthropic Messages API, called **only from the server** |
| Styling | Tailwind CSS using the PEasyPlan brand tokens (section 12) |
| Email | Supabase Auth emails for v1 (custom SMTP later) |

**Sign-in methods:** email + password, Google, and Microsoft (Azure provider in Supabase), because many schools use Microsoft 365.

---

## 3. Plans and pricing

All prices in GBP.

| Plan | Stripe product | Stripe price | Billing | Payment methods |
|---|---|---|---|---|
| Teacher (individual) | `PEasyPlan Teacher` | £49 / year | Annual only | Card |
| School monthly | `PEasyPlan School` | £39 / month | Monthly | Card, Bacs Direct Debit |
| School annual | `PEasyPlan School` | £390 / year | Annual | Card, Bacs Direct Debit, or pay by invoice |

A **school licence** covers every teacher at one school for one flat price.

### Founding-member tier (first 10 schools and first 50 teachers)

A launch tier shown **above the standard prices** on the pricing page while places remain.

| Founding tier | Normal price | Founding price | Places | Price lock |
|---|---|---|---|---|
| Founding Teacher | £49 / year | **£29.40 / year** | First **50** teachers | Keeps founding price for as long as the subscription stays active |
| Founding School | £390 / year | **£234 / year** | First **10** schools | Keeps founding price for as long as the subscription stays active |

**Rules**

- Founding prices are **annual plans only**. School monthly stays at £39/month.
- If a founding member cancels and later rejoins, they pay the normal price.
- Invoice-paying schools count towards the 10 school places and get the founding price on their invoice.
- When places run out, that founding card disappears automatically and the standard price shows instead.

**How to build it**

- Two Stripe coupons: 40% off, `duration: forever`. `FOUNDING-TEACHER` (applies to PEasyPlan Teacher, `max_redemptions: 50`) and `FOUNDING-SCHOOL` (applies to PEasyPlan School, `max_redemptions: 10`).
- The server applies the coupon when creating the Checkout Session or invoice subscription, only for annual plans, and only if places remain. Customers never type a code.
- Mark `founding = true` on the subscription row.

**Pricing page display**

- A highlighted "Founding member" card for each tier showing the normal price crossed out, the founding price, and **"X of 50 teacher places left"** / **"X of 10 school places left"**, calculated live from remaining redemptions.
- Short line under each: "Lock in this price for as long as you stay subscribed."
- Landing page banner while any places remain: "Founding member pricing: first 10 schools and 50 teachers."

### Pay by invoice (School annual)

Schools can choose "Pay by invoice" instead of Checkout:

1. They fill in a short form: school name, billing contact name and email, purchase order number (optional), billing address.
2. The server creates a Stripe customer and a subscription with `collection_method: send_invoice` and `days_until_due: 30`. The PO number goes on the invoice.
3. **Access starts straight away**, so the school isn't waiting on their finance team. If the invoice is still unpaid 14 days after its due date, access is paused until it's paid.

### VAT

Show prices as "£49/year". Ben to confirm his VAT position with an accountant before launch. Build so Stripe Tax can be switched on later without code changes.

---

## 4. Free taster

- Anyone can create an account and generate **3 sessions free**, with no card.
- After 3, the generator shows the pricing options instead of the form.
- Free-taster sessions are saved to the library like any other session, and stay viewable after the taster ends, so a teacher never loses what they made.

---

## 5. Usage limits (cost protection)

Store limits in environment variables so they can be changed without a redeploy.

| Account type | Limit |
|---|---|
| Free taster | 3 generations total |
| Teacher subscriber | 60 generations per calendar month |
| School member | 60 generations per member per calendar month |

When a limit is reached, show a friendly message with the reset date. Log every generation with its token usage, so Ben can see real cost per user.

---

## 6. User types and the school join flow

**Roles**

- `teacher`: individual account (free taster or Teacher subscriber).
- `school_admin`: the person who bought the school licence (usually PE lead or school business manager). Also gets full generator access.
- `school_member`: a teacher who joined through the school's join link.

**Join flow**

1. After a school subscribes, the admin sees their **join link**, e.g. `[yourdomain]/join/ABCD-2345`, and a copy button.
2. A teacher opens the link, signs up or logs in, and is added to that school. They get full access while the school's licence is active.
3. The admin can view members, remove a member, and **reset the join link** (the old link stops working immediately).
4. If a teacher already had an individual Teacher subscription, show a note after they join: "Your school now covers you. You can cancel your own subscription in Account." Do not cancel it automatically.
5. A user belongs to at most one school.

---

## 7. Pages

**Public**

- `/` Landing page: problem, demo of a session card, how it works, pricing summary, sign-up call to action.
- `/pricing` Founding-member tier cards with places left (while available), then the three standard plans, FAQ (including "Can my school pay by invoice?" and "What happens to my founding price?").
- `/login`, `/signup`, `/reset-password`
- `/join/[code]` School join page.
- `/legal/privacy`, `/legal/terms`, `/legal/cookies` Placeholder text, clearly marked **"DRAFT — to be reviewed before launch"**.

**Logged in**

- `/app` Generator: form on the left, newest session card on the right (stacked on mobile). Shows remaining free sessions or monthly usage.
- `/app/library` Saved sessions, newest first. Search by title, sport or objective, filter by year group. Open, copy as text, print, delete.
- `/app/session/[id]` Single session with a clean print layout.
- `/app/account` Name, email, plan, usage, "Manage billing" (opens Stripe Customer Portal), leave school (members only).
- `/app/school` Admin only: plan status, join link, members list, "Manage billing".
- `/app/subscribe` Plan picker. Teacher annual or School (monthly or annual; card/Direct Debit or invoice).

**API routes**

- `POST /api/generate`
- `POST /api/checkout` Creates a Stripe Checkout Session for the chosen plan.
- `POST /api/invoice-subscription` School annual by invoice.
- `POST /api/portal` Creates a Stripe Customer Portal session.
- `POST /api/stripe/webhook`
- `POST /api/school/reset-join-code`, `POST /api/school/remove-member`

---

## 8. Database (Supabase)

Row Level Security **on for every table**. Users can only read and write their own rows; school admins can read members of their own school. Webhooks and generation writes use the service role on the server only.

```
profiles
  id (uuid, = auth.users.id), full_name, email, default_setup (jsonb, nullable), role ('teacher'|'school_admin'|'school_member'),
  school_id (nullable), stripe_customer_id (nullable), created_at

schools
  id, name, join_code (unique), admin_user_id, stripe_customer_id, created_at

subscriptions
  id, stripe_subscription_id (unique), owner_type ('user'|'school'), owner_id,
  plan ('teacher_annual'|'school_monthly'|'school_annual'),
  status (mirrors Stripe: active, past_due, unpaid, canceled, incomplete, trialing),
  collection_method ('charge_automatically'|'send_invoice'),
  current_period_end, invoice_overdue_since (nullable), founding (bool), updated_at

sessions
  id, user_id, title, sport, year_group, objective, inputs (jsonb), card (jsonb), created_at

generation_log
  id, user_id, created_at, input_tokens, output_tokens, model, success (bool), error_code (nullable)
```

Free-taster count and monthly usage are calculated from `generation_log` (successful rows only).

---

## 9. Access rules ("can this user generate?")

Put this in one server-side function, `getEntitlement(userId)`, used by `/api/generate` and the UI.

1. User is a **school member or admin** and the school's subscription is `active` or `past_due` → allowed (subject to monthly limit).
   - Exception: invoice-paid school where `invoice_overdue_since` is more than 14 days ago → not allowed; show "Your school's invoice is overdue."
2. User has their own **Teacher subscription** that is `active` or `past_due` → allowed (monthly limit).
3. Otherwise, fewer than 3 successful lifetime generations → allowed (free taster).
4. Otherwise → not allowed; show plans.

`unpaid`, `canceled` and `incomplete` never grant access. Saved sessions stay viewable in every case.

---

## 10. Stripe webhooks

Verify the signature on every request. Handle idempotently (the same event can arrive twice).

| Event | Action |
|---|---|
| `checkout.session.completed` | Link Stripe customer to user or school. For a school purchase, create the `schools` row, set the buyer as `school_admin`, generate a join code. |
| `customer.subscription.created` / `updated` | Upsert `subscriptions` with status, plan, period end. |
| `customer.subscription.deleted` | Set status `canceled`. |
| `invoice.paid` | Clear `invoice_overdue_since`. |
| `invoice.payment_failed` | Keep status in sync; Stripe's automatic retries and emails handle the rest. |
| `invoice.overdue` | Set `invoice_overdue_since` for invoice-paid schools. |

**Customer Portal settings:** allow cancel (at period end), update payment method, view invoices, and switch between School monthly and School annual. Don't allow switching between Teacher and School in the portal.

**Stripe emails:** turn on receipts, failed payment emails, and upcoming renewal reminders for annual plans (important in the UK for annual subscriptions).

---

## 11. Session generation

### Form fields

The form has two parts. **Part 1 is what the lesson is for**, and the session is built around it. **Part 2 is the practical setup.**

**Part 1: The lesson (the session is built around these)**

- Sport / theme (text, required), placeholder: "e.g. Netball, Invasion games, Dodgeball"
- Lesson description (textarea, optional, max 600 characters), placeholder: "e.g. Lesson 3 of our netball unit. Last week they could pass standing still but struggled to pass while moving and finding space."
- Learning objective (text, optional, max 200 characters), placeholder: "e.g. To pass accurately to a moving teammate"
- Lesson outcomes / success criteria (up to 5 short lines, optional, max 150 characters each), with an "Add outcome" button. Placeholders: "e.g. I can use a chest pass to a teammate 3–5 metres away", "e.g. I can move into space to receive the ball".

Helper text under Part 1: "Add your objective and outcomes and every game will be built to teach them. Leave them blank and PEasyPlan will suggest ones that suit the year group."

**Part 2: The setup (the class, the space and the kit)**

*The class*
- Year group (required): chips for Reception · Year 1 · Year 2 · Year 3 · Year 4 · Year 5 · Year 6. Teachers can tap more than one for mixed-age classes (e.g. Year 3 + Year 4). Shows the key stage automatically (EYFS, KS1, lower KS2, upper KS2).
- Number of children: 1–40
- Class needs (optional, max 300 characters), placeholder: "e.g. a few children lack confidence catching, one wheelchair user. No names please."
- Who's teaching: Class teacher · Cover / non-specialist · PE specialist or coach

*The space*
- Indoor or outdoor: toggle (Indoor · Outdoor)
- Area: options change with the toggle.
  - Indoor: Sports hall · School hall (small) · Classroom · Other
  - Outdoor: Playground · Field · MUGA / court · Other
- Size of area: Small · Medium · Large (with a hint, e.g. "Small = half a hall or a small playground")
- Space notes (optional, max 200 characters), placeholder: "e.g. hall has a stage at one end, dinner tables stacked on one side"
- Weather (outdoor only): Dry · Wet ground · Windy · Hot
- Duration: 10–90 minutes, steps of 5

*The equipment*
- Equipment choice (radio):
  - **"Use only what I have"**: shows the equipment picker below, and the session must only use listed kit.
  - **"Suggest equipment for me"**: the session uses standard primary PE cupboard kit and lists what's needed.
- Equipment picker (when "Use only what I have"): quick-tap chips with a quantity box that appears when a chip is selected. Chips: Cones / markers · Bibs · Hoops · Beanbags · Foam balls · Size 4/5 footballs · Netballs · Tennis balls · Tag belts · Rugby balls · Skipping ropes · Benches · Mats · Throwing targets · Whistle · Stopwatch
- "Anything else you've got?" (textarea, max 300 characters), placeholder: "e.g. 2 old basketballs, a parachute, chalk for the playground"
- Toggle (default on): "Also suggest a few optional extras that would make it even better"
- Helper text under the equipment section: "You can also mention kit in your lesson description, e.g. 'we've only got 6 netballs'. We'll use that too."

Under the form, small text: "Don't include pupils' names or personal details."

**Remember my setup:** save each user's last year group, class size, space and equipment list to their profile (`profiles.default_setup`, jsonb) and pre-fill the form next time, with a "Clear" link. Most teachers use the same hall and PE cupboard every week, so they shouldn't have to re-enter it.

### `POST /api/generate`

1. Check the user is logged in, then `getEntitlement`.
2. Validate inputs (lengths, allowed values): sport max 100 characters, description max 600, objective max 200, up to 5 outcomes at max 150 each, class needs max 300, space notes max 200, equipment quantities 0–100, other equipment max 300. Trim blank outcomes. Area options must match the indoor/outdoor toggle; weather is ignored for indoor sessions.
3. Call the Anthropic Messages API from the server:
   - Model from env `ANTHROPIC_MODEL` (check Anthropic's docs for the current recommended Sonnet model when building).
   - `max_tokens` around 3000.
   - System prompt = the pedagogy instructions in **Appendix A**.
   - User message = the scenario built from the form.
4. Parse the reply as JSON (strip code fences if present). Validate it against the schema in Appendix A, and also check: if the teacher gave outcomes, they appear unchanged and in order; every outcome id is used by at least one main game; in "Use only what I have" mode, no chip-listed item exceeds its quantity (items from the free-text note can't be checked automatically, so skip those). If it fails, retry **once**, then return a friendly error. Failed attempts don't count towards usage.
5. Save to `sessions`, write `generation_log`, return the card.
6. Rate limit: max 1 in-flight generation and 10 per minute per user.

### Session card display

Title, meta line (year group, pupils, space), then:

1. **Objective and outcomes** at the top of the card. Each outcome has a numbered badge (O1, O2…) and a short "What to look for" line. If the teacher left these blank, show a small "Suggested by PEasyPlan" label.
2. **Warm-up**, tagged with the outcomes it prepares for.
3. **Main games.** Each game card shows:
   - A **setup strip** at the top: groups or teams (e.g. "4 teams of 5"), area layout (e.g. "Half the hall, 3 channels marked with cones"), and the equipment for that game with quantities (e.g. "20 cones, 10 bibs, 4 foam balls").
   - The rules, the add-on, outcome badges and the "How this teaches it" line.
   - If the game uses a class need (e.g. a wheelchair user), a short "Adapt it" line.
4. **Progression** (easier / harder).
5. **Open questions to ask mid-game**, each tagged with the outcome it checks.
6. **Kit and safety.**
   - **"You'll need"**: the total kit for the whole session. If the teacher chose "Use only what I have", everything here comes from their list, with quantities.
   - **"Optional extras"** (if suggested): each item says why it helps and what to use instead if they don't have it (e.g. "Tag belts: makes tagging fairer. No tag belts? Tuck a bib into the waistband.").
   - **Safety** notes for this space, group size and weather.

Tapping an outcome badge highlights every part of the session that teaches it.
Buttons: **Copy as text**, **Print**, **Generate another**.

---

## 12. Brand

| Token | Value |
|---|---|
| Pitch Blue (primary) | `#1D4E89` |
| Whistle Orange (action buttons) | `#FF6B35` |
| Turf Green (questions, success) | `#2F9E44` |
| Background | `#F6F3EC` |
| Surface | `#FFFFFF` |
| Ink | `#1B2430` |
| Display font | Baloo 2 |
| Body font | Manrope |
| Utility font | JetBrains Mono (small labels and numbers only) |

Wordmark: "PE" in Pitch Blue, "asy" in Ink, "Plan" in Whistle Orange, so "PE" stands out and the name reads as PE + easy + plan. Support dark mode. Must be accessible: keyboard focus visible, colour contrast AA, works at 360px wide.

---

## 13. Security checklist

- Anthropic API key, Stripe secret key and Supabase service role key live **only** in server environment variables. Never in client code.
- RLS enabled and tested on every table.
- Stripe webhook signature verification.
- All entitlement checks happen on the server, not just by hiding buttons.
- Security headers via Next.js config; no third-party trackers in v1.

---

## 14. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_TEACHER_ANNUAL
STRIPE_PRICE_SCHOOL_MONTHLY
STRIPE_PRICE_SCHOOL_ANNUAL
STRIPE_COUPON_FOUNDING_TEACHER
STRIPE_COUPON_FOUNDING_SCHOOL
ANTHROPIC_API_KEY
ANTHROPIC_MODEL
FREE_TASTER_LIMIT=3
MONTHLY_GENERATION_LIMIT=60
INVOICE_GRACE_DAYS=14
NEXT_PUBLIC_SITE_URL
```

---

## 15. Build milestones

Stop after each one so Ben can test before moving on.

1. **Skeleton and brand.** Next.js project, Tailwind with brand tokens, landing page, pricing page, legal placeholders. Deployed to Vercel.
2. **Accounts.** Supabase auth (email, Google, Microsoft), profiles table, login/signup/reset, protected `/app` routes.
3. **Generator.** Form, `/api/generate`, Anthropic call, JSON validation, session card, library, print view, generation log, free taster limit.
4. **Teacher subscriptions.** Stripe products and prices (test mode), Checkout, webhook, subscriptions table, entitlement function, Customer Portal, founding coupon.
5. **School licences.** School Checkout (monthly and annual, card and Direct Debit), schools table, join link flow, admin page, member management, pay-by-invoice flow and overdue rule.
6. **Polish and hardening.** Usage display, monthly limits, rate limiting, error states, empty states, mobile check, accessibility pass, security checklist.

---

## 16. Test plan (Stripe test mode)

- [ ] Sign up with email, Google and Microsoft.
- [ ] Generate 3 free sessions; 4th attempt shows plans.
- [ ] Subscribe to Teacher annual with a test card; generation works; founding price applied and "places left" count drops.
- [ ] Set founding redemptions to their limit; founding cards disappear and standard prices show.
- [ ] Invoice-paying school gets the founding price and uses one of the 10 school places.
- [ ] Cancel in Customer Portal; access continues until period end, then stops.
- [ ] Failed payment test card; status updates correctly.
- [ ] Buy School monthly; buyer becomes admin; join link works for a second test account.
- [ ] Reset join link; old link fails. Remove member; they lose access.
- [ ] School annual by invoice; access starts immediately; simulate overdue past 14 days; access pauses; mark invoice paid; access returns.
- [ ] Hitting 60 generations in a month shows the limit message.
- [ ] Session with objective and 3 outcomes: every outcome is taught by at least one main game, games show the right badges, and outcomes appear unchanged at the top of the card.
- [ ] Session with objective and outcomes left blank: suggested objective and outcomes appear with the "Suggested" label.
- [ ] Lesson description mentioning what went wrong last lesson: the session clearly responds to it.
- [ ] "Use only what I have" with a small list (e.g. 10 cones, 6 bibs, 3 foam balls): no game uses equipment outside that list or more than the quantity given.
- [ ] "Suggest equipment for me": each game lists its kit and "You'll need" totals it correctly.
- [ ] "Use only what I have" with kit mentioned only in the lesson description (e.g. "we've got a parachute"): the session can use it.
- [ ] Optional extras toggle off: no extras section. Toggle on: extras each have a "use instead" swap.
- [ ] 32 children in a small hall: groups, area layout and safety notes reflect the tight space.
- [ ] Outdoor on wet ground: games and safety notes avoid slipping risks.
- [ ] Class needs mentioning a wheelchair user: games include realistic "Adapt it" lines.
- [ ] Setup is pre-filled on the next visit and "Clear" resets it.
- [ ] Same scenario for Year 1 and Year 6: the Year 1 session has noticeably simpler rules and movement skills; the Year 6 session has more tactics and decisions.
- [ ] Mixed Year 3 + Year 4: session pitched to Year 3, with stretch in the add-ons and harder progression.
- [ ] Logged-out user can't reach `/app` or call `/api/generate`.
- [ ] One user can't see another user's sessions (check RLS directly).
- [ ] Works on a phone at 360px wide.

---

## 17. Not in v1

Unit / multi-week planner, planning product shop, team-shared session libraries, school-wide usage reports, curriculum mapping reports, native apps, assessment tracking. Build these only after paying customers ask for them.

---

## Appendix A — Generation prompt (system prompt)

Based on the working prototype, extended so sessions are built around the teacher's objective and outcomes.

```
You are the session-planning engine behind PEasyPlan, a tool that helps UK primary school teachers deliver confident, games-based PE.

Core principle: the session must be GAMES-BASED, not drill-based — children should have to read the game and make decisions, not just repeat a technique in isolation. This matters most for upper KS2 (Year 5/6), where sessions default to drills far too often.

BUILD THE SESSION AROUND THE TEACHER'S LESSON. The teacher may give a lesson description, a learning objective and lesson outcomes (success criteria). These are the most important inputs:
- If an objective and/or outcomes are given, every part of the session must teach towards them. Use the teacher's objective and outcome wording exactly as written; do not rewrite or replace them.
- Every outcome must be taught by at least one main game. For each main game, list which outcomes it teaches and explain in one sentence how the game's rules make children practise them (for example, a rule that only moving players can receive a pass).
- The warm-up must prepare the movement or decision behind the outcomes.
- Each open question must help the teacher check or deepen one outcome.
- Use the lesson description for context: where the class is in the unit, what they can and can't do yet, and anything that went wrong before. Pitch the session to respond to it.
- If no objective or outcomes are given, write one clear objective and 2 or 3 child-friendly outcomes ("I can...") that suit the sport and year group, and set "suggested" to true.
- For every outcome, give a short "look_for": what the teacher will see children doing when they've achieved it.

FIT THE SESSION TO THE CLASS, SPACE AND KIT.
- Year group: pitch everything to the age given. Reception and KS1: fundamental movement skills (running, dodging, throwing, catching, balancing), very simple rules, lots of turns, instructions a 5-to-7-year-old can follow in under a minute. Lower KS2 (Years 3–4): simple team games, basic tactics like finding space. Upper KS2 (Years 5–6): more decision-making, tactics, roles and scoring systems. For mixed-age classes, pitch to the younger year group and put the stretch for older children in the add-ons and the harder progression.
- Number of children: organise every game for the exact number given. State the groups or teams (e.g. "4 teams of 5, 1 child as a rotating referee") and avoid long queues or children waiting to be "out" for long.
- Space: design every game for the area type and size given, and describe how to lay it out. Respect the indoor/outdoor choice, the space notes and the weather.
- Class needs: include simple, dignified adaptations so every child plays the same game, not a separate activity.
- Who's teaching: for a cover or non-specialist teacher, keep rules and setup especially simple.
- Equipment, when the teacher chose "Use only what I have": use ONLY items from their list, their "anything else" note, and any equipment they mention in the lesson description, and never more than the quantity they gave. If the lesson description gives a different quantity from the list, use the lower number. If an ideal item isn't available, design the game around what they do have.
- Equipment, when the teacher chose "Suggest equipment for me": use common primary PE cupboard kit and give quantities.
- For every main game, give the setup: groups, area layout and the equipment with quantities.
- If optional extras are requested, suggest up to 3 items not on their list that would genuinely improve the session, each with why it helps and a swap using kit they already have.

Always include: a short warm-up that primes the main game's movement pattern; THREE distinct main games with clear rules (genuinely different games, not the same game renamed — vary the mechanic, not just the theme) so the teacher has real choice or can chain them across a session; for EACH main game, one add-on — a twist or extra rule to introduce once the class has grasped the base game, to keep it evolving rather than repeating; an easier and a harder overall progression/variant for differentiation across ability; exactly three open-ended coaching questions a non-specialist teacher can ask mid-game to make children think (not yes/no questions); a kit list; and any safety notes relevant to the space and group size given.

Write for a teacher who may not be a PE specialist and has only a couple of minutes to read this before teaching it. Be concrete and specific, never vague ('play a fun game') — name real rules. Use UK English.

Reply with ONLY a single JSON object, no other text, matching exactly this shape:
{"title": string, "objective": string, "suggested": boolean, "outcomes": [{"id": "O1", "text": string, "look_for": string}], "warmup": {"title": string, "description": string, "outcome_ids": [string]}, "main_games": [{"title": string, "setup": {"groups": string, "area": string, "equipment": [{"item": string, "quantity": number}]}, "description": string, "add_on": string, "adapt_it": string or null, "outcome_ids": [string], "how_it_teaches": string}, (3 games in total, same shape)], "progression": {"easier": string, "harder": string}, "open_questions": [{"question": string, "outcome_id": string}, {"question": string, "outcome_id": string}, {"question": string, "outcome_id": string}], "kit": {"you_need": [{"item": string, "quantity": number}], "optional_extras": [{"item": string, "why": string, "swap_if_not": string}]}, "safety": [string]}

"outcomes" has 1 to 5 items with ids O1, O2, O3... in order. Every outcome id must appear in at least one main game's "outcome_ids". "main_games" has exactly 3 items. "optional_extras" is an empty array if extras were not requested. "you_need" totals the kit for the whole session.
```

**User message template**

```
SCENARIO:
Sport/theme: {sport}
Lesson description: {description or "None given"}
Learning objective: {objective or "None given"}
Lesson outcomes:
{each outcome on its own line as "- ...", or "None given"}
Year group(s): {year_groups, e.g. "Year 3 and Year 4 (mixed-age class)"}
Number of children: {children}
Class needs: {class_needs or "None given"}
Who's teaching: {teacher_type}
Indoor or outdoor: {indoor_outdoor}
Area: {area}, size {area_size}
Space notes: {space_notes or "None given"}
Weather: {weather, or "Not applicable (indoors)"}
Session length: {duration} minutes
Equipment mode: {"Use only what I have" or "Suggest equipment for me"}
Equipment available: {each item as "- item x quantity", plus the "anything else" note, or "Not applicable"}
Suggest optional extras: {yes/no}
```

---

## Appendix B — Ben's setup checklist (before or during Milestone 1)

- [ ] UK IPO trademark search for "PEasyPlan" (classes 9, 41, 42)
- [ ] Buy domain
- [ ] Business email
- [ ] Stripe account (business details, bank account, identity verification)
- [ ] Anthropic Console account, API key, monthly spend limit
- [ ] Supabase, Vercel and GitHub accounts
- [ ] Google and Microsoft OAuth apps (Claude Code can walk through this in Milestone 2)
- [ ] Accountant: sole trader vs Ltd, VAT position
- [ ] ICO data protection fee
- [ ] Privacy policy, terms and cookie policy reviewed before going live
