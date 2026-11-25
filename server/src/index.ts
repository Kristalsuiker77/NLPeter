import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { stream } from "hono/streaming";
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

function errorCode(e: unknown): string {
  if (e instanceof AnalyseError) return e.code;
  if (e instanceof Anthropic.RateLimitError) return "busy";
  if (e instanceof Anthropic.APIError) {
    console.error("Claude API-fout", e.status);
    return "upstream";
  }
  console.error("Onverwachte fout", e instanceof Error ? e.name : "onbekend");
  return "server";
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

  // Een analyse duurt vaak langer dan een minuut. iOS breekt een verzoek af als er
  // 60 seconden geen data binnenkomt. Daarom sturen we meteen een 200 en daarna elke
  // 15 seconden een spatie; JSON.parse negeert witruimte vooraan. Fouten komen als
  // {"error": ...} in de body.
  c.header("content-type", "application/json; charset=utf-8");
  c.header("cache-control", "no-store");
  return stream(c, async (s) => {
    const keepalive = setInterval(() => {
      s.write(" ").catch(() => {});
    }, 15_000);
    try {
      await s.write(" ");
      const analysis = await analyseTranscript(transcript);
      await s.write(JSON.stringify({ analysis }));
    } catch (e) {
      // Log nooit het transcript zelf: het is gevoelige persoonlijke informatie.
      await s.write(JSON.stringify({ error: errorCode(e) }));
    } finally {
      clearInterval(keepalive);
    }
  });
});

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.log(`NLPeter API luistert op poort ${port}`);
