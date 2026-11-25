// Houd dit gelijk met server/src/schema.ts.
export type Analysis = {
  samenvatting: string;
  huidige_situatie: string;
  gewenste_situatie: string;
  kernshift: string;
  vak: {
    visueel: number;
    auditief: number;
    kinesthetisch: number;
    auditief_digitaal: number;
    voorbeelden: string[];
    toelichting: string;
  };
  metaprogrammas: { naam: string; links: string; rechts: string; positie: number; bewijs: string }[];
  waarden: { waarde: string; bewijs: string }[];
  overtuigingen: {
    citaat: string;
    overtuiging: string;
    type: "belemmerend" | "versterkend";
    categorie: "hopeloos" | "hulpeloos" | "waardeloos" | "steun";
    herformulering: string;
  }[];
  metamodel: { citaat: string; patroon: string; vraag: string }[];
  logische_niveaus: {
    omgeving: string;
    gedrag: string;
    vaardigheden: string;
    overtuigingen_waarden: string;
    identiteit: string;
    missie: string;
    knelpunt: "omgeving" | "gedrag" | "vaardigheden" | "overtuigingen_waarden" | "identiteit" | "missie";
  };
  advies: {
    stappen: { titel: string; uitleg: string; oefening: string }[];
    reflectievragen: string[];
    welgevormd_doel: {
      positief: string;
      zelf_te_beinvloeden: string;
      zintuiglijk_bewijs: string;
      context: string;
      ecologie: string;
    };
  };
  veiligheid: { signaal: boolean; toelichting: string };
};

export type Session = {
  id: string;
  at: number;
  transcript: string;
  analysis: Analysis;
};
