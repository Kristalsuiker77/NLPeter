import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { AnalysisSchema, type Analysis } from "./schema.js";
import { SYSTEM_PROMPT } from "./prompt.js";

const client = new Anthropic();

// Het schema is te groot voor structured outputs (de API weigert het als te complex).
// Daarom vragen we JSON via de instructies en valideren we het antwoord zelf met Zod.
const JSON_SCHEMA = JSON.stringify(z.toJSONSchema(AnalysisSchema));
const SYSTEM = `${SYSTEM_PROMPT}

Antwoord met uitsluitend één JSON-object, zonder tekst ervoor of erna en zonder codeblok. Het object moet exact voldoen aan dit JSON-schema:
${JSON_SCHEMA}`;

export class AnalyseError extends Error {
  constructor(
    public code: "refusal" | "invalid_output",
    message: string,
  ) {
    super(message);
  }
}

type Turn = Anthropic.Beta.Messages.BetaMessageParam;

async function ask(messages: Turn[]) {
  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "high" },
    system: SYSTEM,
    messages,
  });
  if (response.stop_reason === "refusal") {
    throw new AnalyseError("refusal", "De analyse werd geweigerd.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new AnalyseError("invalid_output", "De analyse was onvolledig.");
  }
  const text = response.content
    .filter((b): b is Anthropic.Beta.Messages.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return { response, text };
}

/** Haalt het JSON-object uit het antwoord, ook als er toch een codeblok omheen staat. */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("geen JSON-object gevonden");
  return JSON.parse(body.slice(start, end + 1));
}

function validate(text: string): { ok: true; data: Analysis } | { ok: false; problem: string } {
  let raw: unknown;
  try {
    raw = extractJson(text);
  } catch (e) {
    return { ok: false, problem: `Het antwoord was geen geldige JSON (${e instanceof Error ? e.message : "onbekend"}).` };
  }
  const parsed = AnalysisSchema.safeParse(raw);
  if (parsed.success) return { ok: true, data: parsed.data };
  const issues = parsed.error.issues
    .slice(0, 10)
    .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("; ");
  return { ok: false, problem: `Het JSON-object voldeed niet aan het schema: ${issues}` };
}

export async function analyseTranscript(transcript: string): Promise<Analysis> {
  const messages: Turn[] = [{ role: "user", content: `<transcript>\n${transcript}\n</transcript>` }];

  const first = await ask(messages);
  const firstCheck = validate(first.text);
  if (firstCheck.ok) return firstCheck.data;

  // Eén herkansing, met de fout erbij.
  messages.push({ role: "assistant", content: first.response.content as Anthropic.Beta.Messages.BetaContentBlockParam[] });
  messages.push({
    role: "user",
    content: `${firstCheck.problem} Geef het volledige, gecorrigeerde JSON-object opnieuw, en alleen dat.`,
  });
  const second = await ask(messages);
  const secondCheck = validate(second.text);
  if (secondCheck.ok) return secondCheck.data;

  console.error("Ongeldige analyse na herkansing:", secondCheck.problem.slice(0, 300));
  throw new AnalyseError("invalid_output", "De analyse had niet het juiste formaat.");
}
