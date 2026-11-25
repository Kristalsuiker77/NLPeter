import { z } from "zod";

/**
 * Het analyseformaat dat Claude teruggeeft en dat de app toont.
 * Houd dit gelijk met app/src/lib/types.ts.
 */
export const AnalysisSchema = z.object({
  samenvatting: z.string(),
  huidige_situatie: z.string(),
  gewenste_situatie: z.string(),
  kernshift: z.string(),
  vak: z.object({
    visueel: z.number(),
    auditief: z.number(),
    kinesthetisch: z.number(),
    auditief_digitaal: z.number(),
    voorbeelden: z.array(z.string()),
    toelichting: z.string(),
  }),
  metaprogrammas: z.array(
    z.object({
      naam: z.string(),
      links: z.string(),
      rechts: z.string(),
      positie: z.number(),
      bewijs: z.string(),
    }),
  ),
  waarden: z.array(z.object({ waarde: z.string(), bewijs: z.string() })),
  overtuigingen: z.array(
    z.object({
      citaat: z.string(),
      overtuiging: z.string(),
      type: z.enum(["belemmerend", "versterkend"]),
      categorie: z.enum(["hopeloos", "hulpeloos", "waardeloos", "steun"]),
      herformulering: z.string(),
    }),
  ),
  metamodel: z.array(
    z.object({ citaat: z.string(), patroon: z.string(), vraag: z.string() }),
  ),
  logische_niveaus: z.object({
    omgeving: z.string(),
    gedrag: z.string(),
    vaardigheden: z.string(),
    overtuigingen_waarden: z.string(),
    identiteit: z.string(),
    missie: z.string(),
    knelpunt: z.enum([
      "omgeving",
      "gedrag",
      "vaardigheden",
      "overtuigingen_waarden",
      "identiteit",
      "missie",
    ]),
  }),
  advies: z.object({
    stappen: z.array(
      z.object({ titel: z.string(), uitleg: z.string(), oefening: z.string() }),
    ),
    reflectievragen: z.array(z.string()),
    welgevormd_doel: z.object({
      positief: z.string(),
      zelf_te_beinvloeden: z.string(),
      zintuiglijk_bewijs: z.string(),
      context: z.string(),
      ecologie: z.string(),
    }),
  }),
  veiligheid: z.object({ signaal: z.boolean(), toelichting: z.string() }),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
