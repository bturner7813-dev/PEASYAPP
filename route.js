import Anthropic from "@anthropic-ai/sdk";
import { buildPrompt, extractJson } from "../../lib/prompt";

export const runtime = "nodejs";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Minimal in-memory rate limit: 20 requests per 10 minutes per IP.
// Good enough for a small pilot with a handful of testers. This resets on
// every cold start / new server instance and is NOT a real defence against
// abuse — before sharing this link widely, put proper rate limiting (and
// ideally a login) in front of this route so a stranger with the URL can't
// run up your Anthropic bill.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > MAX_PER_WINDOW;
}

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it in your hosting provider's environment variables." },
      { status: 500 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json(
      { error: "Too many requests from this connection right now — wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }

  const prompt = buildPrompt(body || {});

  try {
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 1600,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content?.find((block) => block.type === "text");
    const data = extractJson(textBlock?.text || "");

    if (!data || !data.title) {
      return Response.json(
        { error: "That didn't come back in a usable format — try generating again." },
        { status: 502 }
      );
    }

    return Response.json(data);
  } catch (err) {
    console.error("PEasy /api/generate error:", err);
    const status = err?.status;
    let message = "Something went wrong generating that session. Try again in a moment.";
    if (status === 401) message = "The Anthropic API key on the server is missing or invalid.";
    if (status === 429) message = "Anthropic rate limit reached — wait a moment and try again.";
    return Response.json({ error: message }, { status: 500 });
  }
}
