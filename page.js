"use client";

import { useState } from "react";

const WEATHER_OPTIONS = [
  { label: "Dry", value: "Dry, can go outdoors" },
  { label: "Raining", value: "Raining, must stay indoors" },
  { label: "Indoors anyway", value: "Indoors regardless of weather" },
];

const KIT_OPTIONS = [
  { label: "No specialist kit", value: "No specialist kit — improvise with what's in the PE cupboard" },
  { label: "Cover teacher", value: "Non-specialist / cover teacher will be delivering this" },
];

const YEAR_OPTIONS = ["Reception", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const SPACE_OPTIONS = ["Sports hall", "Playground", "Field", "Classroom"];

const ERROR_COPY = {
  429: "Too many requests right now — wait a moment and try again.",
  500: "Something went wrong generating that session — try again in a moment.",
  502: "That didn't come back in a usable format — try generating again.",
};

const EXAMPLE_CARD = {
  meta: "YEAR 5 · 18 STUDENTS · SPORTS HALL",
  data: {
    title: "Wet-Weather Dodgeball",
    warmup: {
      title: "Traffic Lights Tag",
      description:
        "Free movement inside the hall lines; on \"red\" everyone freezes in a balanced dodge stance, on \"green\" they move again. Builds the ready position they'll need in the main game.",
    },
    main_games: [
      {
        title: "Capture the Kingpins",
        description:
          "Two teams, six cones (\"kingpins\") per side. Hit an opponent to send them to the bench; they re-enter by naming which kingpin their team should protect next round.",
        add_on: "A \"medic\" per team can free one benched player per round by tagging them — forces a protect-or-attack decision.",
      },
      {
        title: "Endzone Dodge",
        description:
          "Hall split into three zones; attackers must cross the middle \"no-catch\" zone without being hit to score in the far endzone, defenders can only throw from inside the middle zone.",
        add_on: "Defenders may pass the ball to a teammate before throwing, rewarding movement off the ball.",
      },
      {
        title: "Last Kingpin Standing",
        description:
          "Every player defends one cone in their own hoop while trying to knock down everyone else's; last cone standing wins the round.",
        add_on: "Players may block a throw with a handheld foam shield, adding a save option.",
      },
    ],
    progression: {
      easier: "Larger target cones, softer/slower balls, allow two hits before someone's out.",
      harder: "Add a second ball in play, require a catch to send a thrower off instead of just a hit.",
    },
    open_questions: [
      "What made that catch possible?",
      "Where's the safest place to stand right now?",
      "How could your team protect the kingpins better?",
    ],
    kit: ["6 foam balls, 12 cones — no specialist kit"],
    safety: ["Mark a clear halfway line; no head-height throws"],
  },
};

function cardToText(data, meta) {
  let t = `${data.title || "Session"}\n${meta}\n\n`;
  if (data.warmup) t += `WARM-UP — ${data.warmup.title}\n${data.warmup.description}\n\n`;
  t += "MAIN GAMES\n";
  (data.main_games || []).forEach((g) => {
    t += `- ${g.title}: ${g.description}\n`;
    if (g.add_on) t += `  Add-on: ${g.add_on}\n`;
  });
  if (data.progression) {
    t += `\nPROGRESSION\nEasier: ${data.progression.easier}\nHarder: ${data.progression.harder}\n`;
  }
  t += "\nOPEN QUESTIONS\n";
  (data.open_questions || []).forEach((q) => (t += `- ${q}\n`));
  t += "\nKIT & SAFETY\n";
  (data.kit || []).forEach((k) => (t += `- ${k}\n`));
  (data.safety || []).forEach((s) => (t += `- ${s}\n`));
  return t;
}

function SessionCard({ data, meta, isExample }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cardToText(data, meta));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      /* clipboard unavailable — silently ignore */
    }
  }

  return (
    <div className={`session-card${isExample ? " example" : ""}`}>
      <div className="session-head">
        <div>
          <h3>{data.title}</h3>
          <span>{meta}</span>
        </div>
        <div className={`session-tag${isExample ? " example-tag" : ""}`}>
          {isExample ? "EXAMPLE OUTPUT" : "READY TO TEACH"}
        </div>
      </div>
      <div className="session-body">
        {data.warmup && (
          <div className="session-section">
            <div className="session-section-label">Warm-up — {data.warmup.title}</div>
            <p>{data.warmup.description}</p>
          </div>
        )}
        <div className="session-section">
          <div className="session-section-label">Main games</div>
          {(data.main_games || []).map((g, i) => (
            <p key={i}>
              <strong>{g.title}.</strong> {g.description}
              {g.add_on && (
                <>
                  <br />
                  <span className="add-on">Add-on once they&rsquo;ve got it: {g.add_on}</span>
                </>
              )}
            </p>
          ))}
        </div>
        {data.progression && (
          <div className="session-section">
            <div className="session-section-label">Progression</div>
            <p>
              <strong>Easier:</strong> {data.progression.easier}
            </p>
            <p>
              <strong>Harder:</strong> {data.progression.harder}
            </p>
          </div>
        )}
        <div className="session-section">
          <div className="session-section-label">Open questions to ask mid-game</div>
          {(data.open_questions || []).map((q, i) => (
            <span className="question-chip" key={i}>
              &ldquo;{q}&rdquo;
            </span>
          ))}
        </div>
        <div className="session-section">
          <div className="session-section-label">Kit &amp; safety</div>
          <ul>
            {(data.kit || []).map((k, i) => (
              <li key={`kit-${i}`}>{k}</li>
            ))}
            {(data.safety || []).map((s, i) => (
              <li key={`safety-${i}`}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
      {!isExample && (
        <div className="session-foot">
          <button type="button" className="mini-btn" onClick={handleCopy}>
            {copied ? "Copied" : "Copy as text"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [sport, setSport] = useState("Dodgeball");
  const [objective, setObjective] = useState(
    "Games-based session — children have to read the game and make decisions, not just follow a drill"
  );
  const [year, setYear] = useState("Year 5");
  const [students, setStudents] = useState(18);
  const [space, setSpace] = useState("Sports hall");
  const [duration, setDuration] = useState(30);
  const [weather, setWeather] = useState(WEATHER_OPTIONS[1].value);
  const [kit, setKit] = useState(KIT_OPTIONS[0].value);

  const [results, setResults] = useState([]); // [{ data, meta }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const meta = `${year.toUpperCase()} · ${students} STUDENTS · ${space.toUpperCase()}`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, objective, year, students, space, duration, weather, kit }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(ERROR_COPY[res.status] || payload.error || "Something went wrong.");
      }
      setResults((prev) => [{ data: payload, meta }, ...prev]);
    } catch (err) {
      setError(err.message || "Something went wrong generating that session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">PEasy</div>
        <div className="wordmark">
          <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="64" height="64" rx="18" fill="var(--pitch)" />
            <path d="M19 33.5L28 42.5L45 22.5" stroke="var(--orange)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="wordmark-text">
            <span className="pe">PE</span>
            <span className="asy">asy</span>
          </div>
        </div>
        <p>Type in the situation, get a ready-to-teach, games-based session card.</p>
      </header>

      <div className="layout">
        <form className="panel" onSubmit={handleSubmit}>
          <h2>Build a session</h2>

          <div className="field">
            <label htmlFor="sport">Sport / theme</label>
            <input id="sport" type="text" value={sport} onChange={(e) => setSport(e.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="objective">Objective (optional)</label>
            <textarea id="objective" value={objective} onChange={(e) => setObjective(e.target.value)} />
          </div>

          <div className="two-col">
            <div className="field">
              <label htmlFor="year">Year group</label>
              <select id="year" value={year} onChange={(e) => setYear(e.target.value)}>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="students">Students</label>
              <input
                id="students"
                type="number"
                min={1}
                max={40}
                value={students}
                onChange={(e) => setStudents(e.target.value)}
              />
            </div>
          </div>

          <div className="two-col">
            <div className="field">
              <label htmlFor="space">Space</label>
              <select id="space" value={space} onChange={(e) => setSpace(e.target.value)}>
                {SPACE_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="duration">Duration (min)</label>
              <input
                id="duration"
                type="number"
                min={10}
                max={90}
                step={5}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Weather / setting</label>
            <div className="chip-row">
              {WEATHER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`chip-toggle${weather === opt.value ? " active" : ""}`}
                  onClick={() => setWeather(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Equipment</label>
            <div className="chip-row">
              {KIT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`chip-toggle${kit === opt.value ? " active" : ""}`}
                  onClick={() => setKit(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="generate-btn" disabled={loading}>
            {loading ? "Generating…" : "Generate session card"}
          </button>
          <div className="hint">Usually takes 10–30 seconds.</div>

          {loading && <div className="status-msg thinking">Thinking — this usually takes 10–30 seconds…</div>}
          {error && <div className="status-msg error">{error}</div>}
        </form>

        <div className="results">
          <h2>Session cards</h2>
          <div className="results-sub">Newest first — scroll down for the worked example.</div>

          {results.map((r, i) => (
            <SessionCard key={i} data={r.data} meta={r.meta} />
          ))}

          <SessionCard data={EXAMPLE_CARD.data} meta={EXAMPLE_CARD.meta} isExample />
        </div>
      </div>

      <footer>PEasy — early build. Not yet for wide public release (see README for what&rsquo;s still missing).</footer>
    </div>
  );
}
