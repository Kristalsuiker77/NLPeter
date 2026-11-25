import { serve } from "@hono/node-server";
import { Hono } from "hono";
import Anthropic from "@anthropic-ai/sdk";
import { analyseTranscript, AnalyseError } from "./analyse.js";

const MIN_WORDS = 30;
const MAX_CHARS = 40_000;

// Eenvoudige limiet per IP, in het geheugen. Vervang door iets duurzaams voor productie.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();
function allow(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));

app.post("/analyse", async (c) => {
  const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "onbekend";
  if (!allow(ip)) return c.json({ error: "rate_limited" }, 429);

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid_request" }, 400);
  }
  const transcript =
    typeof body === "object" && body !== null && "transcript" in body
      ? String((body as { transcript: unknown }).transcript ?? "").trim()
      : "";
  const words = transcript.match(/\S+/g)?.length ?? 0;
  if (words < MIN_WORDS) return c.json({ error: "too_short" }, 400);
  if (transcript.length > MAX_CHARS) return c.json({ error: "too_long" }, 400);

  try {
    const analysis = await analyseTranscript(transcript);
    return c.json({ analysis });
  } catch (e) {
    // Log nooit het transcript zelf: het is gevoelige persoonlijke informatie.
    if (e instanceof AnalyseError) return c.json({ error: e.code }, 422);
    if (e instanceof Anthropic.RateLimitError) return c.json({ error: "busy" }, 503);
    if (e instanceof Anthropic.APIError) {
      console.error("Claude API-fout", e.status);
      return c.json({ error: "upstream" }, 502);
    }
    console.error("Onverwachte fout", e instanceof Error ? e.name : "onbekend");
    return c.json({ error: "server" }, 500);
  }
});

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.log(`NLPeter API luistert op poort ${port}`);
