# PEasy — session generator (real, hosted version)

This is the same tool as the Claude prototype, rebuilt as a real website anyone can
use without needing their own Claude account. It has its own server-side code that
calls Claude using an API key you control.

No coding experience needed to get this live — the steps below use web forms only,
no terminal. Total time: about 20 minutes, most of it waiting for signups.

---

## What you'll need

- An email address for two free signups (GitHub, Vercel)
- A card for one pay-as-you-go signup (Anthropic) — there's no monthly fee, you're
  billed only for what you actually generate
- About 20 minutes

**Rough running cost:** each generated session card costs a fraction of a cent to
about 1–2 US cents in Claude API usage, depending on length. Testing this yourself
a few dozen times will cost well under a dollar. The real cost question is what
happens once this is a public link — see "Before you share this widely" below.

---

## Step 1 — Get an Anthropic API key

1. Go to **platform.claude.com** and sign up (or sign in if you already use Claude).
2. Add a payment method — this is a separate, pay-as-you-go account from any
   claude.ai subscription you have.
3. Find **API Keys** in the console and create a new key. Copy it somewhere safe —
   you'll paste it once into Vercel in Step 3 and won't need to touch it again.

---

## Step 2 — Put this code on GitHub (no terminal required)

1. Go to **github.com** and create a free account if you don't have one.
2. Click **New repository**. Name it `peasy-app`. Leave it private or public, your
   choice. Click **Create repository**.
3. On the new (empty) repository page, click **uploading an existing file**.
4. Open the `peasy-app` folder you downloaded from this chat, select every file and
   folder inside it, and drag them all into the GitHub upload box. (Modern browsers
   keep the folder structure — `app/api/generate/route.js` should still show up as
   nested inside `app`.)
5. Scroll down and click **Commit changes**.

---

## Step 3 — Deploy it on Vercel

1. Go to **vercel.com** and sign up using your GitHub account (this links the two
   automatically).
2. Click **Add New… → Project**, then find and **Import** the `peasy-app` repo.
3. Before clicking Deploy, open **Environment Variables** and add:
   - `ANTHROPIC_API_KEY` → paste the key from Step 1
   - `ANTHROPIC_MODEL` → `claude-sonnet-5` (optional — this is already the default)
4. Click **Deploy**. Wait about a minute.
5. You'll get a live link like `peasy-app-yourname.vercel.app` — open it and try
   generating a session.

That's it — it's live on the internet, hosted for free on Vercel's free tier.

---

## Step 4 (optional) — a proper domain

If you own or buy a domain (e.g. `peasy.app`, from any registrar like Namecheap or
GoDaddy): in the Vercel project, go to **Settings → Domains**, add it, and follow
the DNS instructions Vercel shows you. Takes a few minutes to a few hours to
propagate.

---

## Before you share this widely

This build is deliberately minimal — it's built for you to keep running the
Section 9 validation (15–20 real scenarios, then a handful of real PE leads), not
for a public launch. Specifically, it does **not** yet have:

- **Accounts, logins, or payments** — anyone with the link can generate sessions
  for free, on your API bill.
- **Real rate limiting** — there's a basic 20-requests-per-10-minutes-per-visitor
  guard in `app/api/generate/route.js`, but it resets whenever the server restarts
  and won't stop someone determined to run up costs. Fine for a small pilot group;
  not a defence for a public link.
- **A database** — nothing is saved. Every generated session disappears on refresh.
- **The planning-pack library, school admin seats, or anything from Sections 4–6**
  of the strategy doc — this is the Phase 0/1 tool only.

Once the offer is validated and you're ready to actually take payment and onboard
schools, that's the point to add a login system, Stripe, and a database — either by
learning enough to extend this yourself, briefing a developer with this codebase as
the starting point, or asking Claude to build that next layer.

---

## Making changes later

- `app/page.js` — the page itself (the form and how session cards are displayed)
- `app/api/generate/route.js` — the server logic that calls Claude
- `app/lib/prompt.js` — the instructions sent to Claude (edit this to change what
  kind of sessions it generates)
- `app/globals.css` — colours, fonts, spacing

If you make changes on GitHub's website (click a file → pencil icon → edit → commit),
Vercel automatically redeploys the live site within about a minute — no extra steps.
