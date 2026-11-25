import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { AnalysisSchema, type Analysis } from "./schema.js";
import { SYSTEM_PROMPT } from "./prompt.js";

const client = new Anthropic();

export class AnalyseError extends Error {
  constructor(
    public code: "refusal" | "invalid_output",
    message: string,
  ) {
    super(message);
  }
}

export async function analyseTranscript(transcript: string): Promise<Analysis> {
  const response = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "high",
      format: betaZodOutputFormat(AnalysisSchema),
    },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `<transcript>\n${transcript}\n</transcript>`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new AnalyseError("refusal", "De analyse werd geweigerd.");
  }
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new AnalyseError("invalid_output", "De analyse was onvolledig.");
  }
  return response.parsed_output;
}
