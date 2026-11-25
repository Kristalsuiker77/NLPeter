import type { Analysis } from "./types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8787";
// Sleutel die de server verwacht. Staat in de app zelf, dus het is een slot tegen
// toevallige bezoekers, geen echt geheim.
const APP_TOKEN = process.env.EXPO_PUBLIC_APP_TOKEN ?? "";

const MESSAGES: Record<string, string> = {
  too_short: "Vertel iets meer (minimaal 30 woorden), dan heeft Peter genoeg om patronen te herkennen.",
  too_long: "Je verhaal is te lang voor één analyse. Kort het in tot een paar duizend woorden.",
  rate_limited: "Je hebt het afgelopen uur veel analyses gedaan. Probeer het later opnieuw.",
  busy: "Peter is even druk. Probeer het over een minuut opnieuw.",
  refusal: "Peter kon dit verhaal niet analyseren. Probeer het anders te verwoorden.",
  invalid_output: "Peter gaf een onvolledig antwoord. Probeer het nog eens.",
  unauthorized: "Deze versie van de app heeft geen toegang tot de server. Installeer de app opnieuw.",
};

export class ApiError extends Error {}

/**
 * Wekt de server alvast. Een gratis server slaapt na een kwartier zonder verkeer en
 * heeft dan ongeveer een minuut nodig om op te starten. Terwijl jij praat, wordt hij wakker.
 */
export function wakeServer(): void {
  fetch(`${API_URL}/health`).catch(() => {});
}

export async function analyse(transcript: string, signal?: AbortSignal): Promise<Analysis> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/analyse`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(APP_TOKEN ? { authorization: `Bearer ${APP_TOKEN}` } : {}),
      },
      body: JSON.stringify({ transcript }),
      signal,
    });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new ApiError("Geen verbinding met Peter. Controleer je internet en probeer het opnieuw.");
  }
  const data = (await res.json().catch(() => ({}))) as { analysis?: Analysis; error?: string };
  if (!res.ok || !data.analysis) {
    throw new ApiError(MESSAGES[data.error ?? ""] ?? "Er ging iets mis bij de analyse. Probeer het opnieuw.");
  }
  return data.analysis;
}
