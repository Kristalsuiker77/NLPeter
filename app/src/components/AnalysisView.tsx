import { Linking, StyleSheet, Text, View } from "react-native";
import type { Analysis } from "../lib/types";
import { useTheme } from "../lib/theme";
import { Button, Card, Chip, H2, H3, Label, P, Quote } from "./ui";

const LEVELS = [
  ["missie", "Missie"],
  ["identiteit", "Identiteit"],
  ["overtuigingen_waarden", "Overtuigingen en waarden"],
  ["vaardigheden", "Vaardigheden"],
  ["gedrag", "Gedrag"],
  ["omgeving", "Omgeving"],
] as const;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const SOORT: Record<Analysis["verandertaal"]["uitspraken"][number]["soort"], string> = {
  wens: "Wens",
  vermogen: "Vermogen",
  reden: "Reden",
  noodzaak: "Noodzaak",
  commitment: "Commitment",
  activering: "Bereidheid",
  stappen: "Al gezette stap",
};

function ChangeTalk({ vt }: { vt: Analysis["verandertaal"] }) {
  const t = useTheme();
  const pct = Math.round(clamp(vt.verandering_pct, 0, 100));
  const ready = Math.round(clamp(vt.gereedheid, 1, 10));
  const change = vt.uitspraken.filter((u) => u.richting === "verandering");
  const keep = vt.uitspraken.filter((u) => u.richting === "behoud");
  return (
    <Card>
      <H2>Klaar voor verandering?</H2>
      <View style={st.readyRow}>
        <Text style={[st.readyNum, { color: t.accent }]}>{ready}</Text>
        <View style={{ flex: 1, gap: 2 }}>
          <Label>Gereedheid, schaal 1 tot 10</Label>
          <P>{vt.toelichting}</P>
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <View style={st.ends}>
          <Text style={{ color: t.good, fontSize: 13, fontWeight: "600" }}>Verandertaal {pct}%</Text>
          <Text style={{ color: t.warn, fontSize: 13, fontWeight: "600" }}>Behoudtaal {100 - pct}%</Text>
        </View>
        <View
          style={[st.split, { backgroundColor: t.warnSoft }]}
          accessible
          accessibilityLabel={`${pct} procent verandertaal, ${100 - pct} procent behoudtaal`}
        >
          <View style={{ width: `${pct}%`, height: "100%", backgroundColor: t.good }} />
        </View>
      </View>
      {change.length > 0 && (
        <View style={{ gap: 8 }}>
          <H3>Wat je in beweging brengt</H3>
          {change.map((u, i) => (
            <View key={i} style={{ gap: 4 }}>
              <Chip tone="support">{SOORT[u.soort] ?? u.soort}</Chip>
              <Quote>{u.citaat}</Quote>
            </View>
          ))}
        </View>
      )}
      {keep.length > 0 && (
        <View style={{ gap: 8 }}>
          <H3>Wat je tegenhoudt</H3>
          {keep.map((u, i) => (
            <View key={i} style={{ gap: 4 }}>
              <Chip tone="limit">{SOORT[u.soort] ?? u.soort}</Chip>
              <Quote>{u.citaat}</Quote>
            </View>
          ))}
        </View>
      )}
      {!!vt.vraag && (
        <View style={[st.exercise, { backgroundColor: t.accentSoft }]}>
          <Label>Vraag om over na te denken</Label>
          <Text style={[st.q, { color: t.ink }]}>{vt.vraag}</Text>
        </View>
      )}
    </Card>
  );
}

export function AnalysisView({ a }: { a: Analysis }) {
  const t = useTheme();
  const vak = [
    ["Visueel", a.vak.visueel, t.v],
    ["Auditief", a.vak.auditief, t.a],
    ["Kinesthetisch", a.vak.kinesthetisch, t.k],
    ["Auditief-digitaal", a.vak.auditief_digitaal, t.ad],
  ] as const;
  const goal = a.advies.welgevormd_doel;

  return (
    <View style={{ gap: 16 }}>
      {a.veiligheid.signaal && (
        <Card style={{ backgroundColor: t.alertSoft, borderColor: t.alert }}>
          <H2>Even stilstaan</H2>
          <P>
            {a.veiligheid.toelichting || "In wat je vertelt hoor ik dat het je zwaar valt."} Je hoeft dit niet
            alleen te dragen. Praat met iemand: 113 Zelfmoordpreventie is gratis en dag en nacht bereikbaar via
            0800-0113. Je kunt ook je huisarts bellen. Bij direct gevaar: 112.
          </P>
          <Button title="Bel 0800-0113" onPress={() => Linking.openURL("tel:08000113")} />
        </Card>
      )}

      <Card lead>
        <Label>De shift</Label>
        <Text style={[st.kern, { color: t.ink }]}>{a.kernshift}</Text>
        <View style={[st.state, { backgroundColor: t.surface, borderColor: t.line }]}>
          <Label>Nu</Label>
          <P>{a.huidige_situatie}</P>
        </View>
        <View style={[st.state, { backgroundColor: t.surface, borderColor: t.line }]}>
          <Label>Gewenst</Label>
          <P>{a.gewenste_situatie}</P>
        </View>
        <P>{a.samenvatting}</P>
      </Card>

      {a.verandertaal && <ChangeTalk vt={a.verandertaal} />}

      <Card>
        <H2>Overtuigingen</H2>
        {a.overtuigingen.map((o, i) => (
          <View key={i} style={[st.item, i > 0 && { borderTopColor: t.line, borderTopWidth: 1, paddingTop: 12 }]}>
            <Chip tone={o.type === "belemmerend" ? "limit" : "support"}>
              {o.type === "belemmerend" ? `Belemmerend · ${o.categorie}` : "Versterkend"}
            </Chip>
            <Quote>{o.citaat}</Quote>
            <P>{o.overtuiging}</P>
            {!!o.herformulering && (
              <View style={[st.reframe, { borderLeftColor: t.good }]}>
                <Label>Herformulering</Label>
                <P>{o.herformulering}</P>
              </View>
            )}
          </View>
        ))}
      </Card>

      <Card>
        <H2>Denkfouten en taalpatronen</H2>
        <P muted>Hoe je gedachten de situatie kleuren, en waar je taal informatie weglaat, generaliseert of vervormt.</P>
        {(a.denkfouten ?? []).map((d, i) => (
          <View key={`d${i}`} style={[st.item, i > 0 && { borderTopColor: t.line, borderTopWidth: 1, paddingTop: 12 }]}>
            <Chip tone="limit">{cap(d.denkfout)}</Chip>
            <Quote>{d.citaat}</Quote>
            <P>{d.uitleg}</P>
            {!!d.alternatief && (
              <View style={[st.reframe, { borderLeftColor: t.good }]}>
                <Label>Andere gedachte</Label>
                <P>{d.alternatief}</P>
              </View>
            )}
          </View>
        ))}
        {a.metamodel.map((m, i) => (
          <View
            key={`m${i}`}
            style={[st.item, (i > 0 || (a.denkfouten ?? []).length > 0) && { borderTopColor: t.line, borderTopWidth: 1, paddingTop: 12 }]}
          >
            <Chip>{m.patroon}</Chip>
            <Quote>{m.citaat}</Quote>
            <Text style={[st.q, { color: t.accent }]}>{m.vraag}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <H2>Interne voorstellingen</H2>
        {vak.map(([label, n, color]) => {
          const pct = Math.round(clamp(n, 0, 100));
          return (
            <View key={label} style={st.bar}>
              <Text style={[st.barLabel, { color: t.ink }]}>{label}</Text>
              <View style={[st.track, { backgroundColor: t.sunk }]}>
                <View style={{ width: `${pct}%`, height: "100%", borderRadius: 999, backgroundColor: color }} />
              </View>
              <Text style={[st.num, { color: t.muted }]}>{pct}%</Text>
            </View>
          );
        })}
        <P>{a.vak.toelichting}</P>
        {a.vak.voorbeelden.map((v, i) => <Quote key={i}>{v}</Quote>)}
      </Card>

      <Card>
        <H2>Waarden</H2>
        <View style={st.wrap}>
          {a.waarden.map((w, i) => (
            <View key={i} style={[st.val, { backgroundColor: t.accentSoft }]}>
              <Text style={{ color: t.ink, fontWeight: "600" }}>{w.waarde}</Text>
              <Text style={{ color: t.muted, fontSize: 13 }}>“{w.bewijs}”</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <H2>Metaprogramma's</H2>
        <P muted>Hoe je informatie filtert en waar je door gemotiveerd raakt.</P>
        {a.metaprogrammas.map((m, i) => (
          <View key={i} style={[st.scale, { backgroundColor: t.bg, borderColor: t.line }]}>
            <H3>{m.naam}</H3>
            <View style={st.ends}>
              <Text style={{ color: t.muted, fontSize: 12 }}>{m.links}</Text>
              <Text style={{ color: t.muted, fontSize: 12 }}>{m.rechts}</Text>
            </View>
            <View style={[st.rail, { backgroundColor: t.sunk }]}>
              <View
                style={[st.dot, { left: `${clamp(m.positie, 0, 1) * 100}%`, backgroundColor: t.accent, borderColor: t.surface }]}
              />
            </View>
            <P muted>“{m.bewijs}”</P>
          </View>
        ))}
      </Card>

      <Card>
        <H2>Logische niveaus</H2>
        <P muted>Het gemarkeerde niveau is waar het knelpunt zit. Verandering daar werkt door naar de niveaus eronder.</P>
        {LEVELS.map(([k, label]) => {
          const hot = a.logische_niveaus.knelpunt === k;
          return (
            <View key={k} style={[st.lvl, { backgroundColor: hot ? t.warnSoft : t.bg }]}>
              <Label>{hot ? `${label} · knelpunt` : label}</Label>
              <P>{a.logische_niveaus[k] || "–"}</P>
            </View>
          );
        })}
      </Card>

      <Card lead>
        <H2>Peters advies</H2>
        {a.advies.stappen.map((stap, i) => (
          <View key={i} style={st.step}>
            <View style={[st.stepNum, { backgroundColor: t.accent }]}>
              <Text style={{ color: t.accentInk, fontWeight: "700" }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <H3>{stap.titel}</H3>
              <P>{stap.uitleg}</P>
              <View style={[st.exercise, { backgroundColor: t.surface }]}>
                <Label>Oefening</Label>
                <P>{stap.oefening}</P>
              </View>
            </View>
          </View>
        ))}
      </Card>

      <Card>
        <H2>Je doel, welgevormd</H2>
        {(
          [
            ["Positief geformuleerd", goal.positief],
            ["Zelf te beïnvloeden", goal.zelf_te_beinvloeden],
            ["Zintuiglijk bewijs", goal.zintuiglijk_bewijs],
            ["Context", goal.context],
            ["Ecologie", goal.ecologie],
          ] as const
        ).map(([label, v]) => (
          <View key={label} style={[st.lvl, { backgroundColor: t.bg }]}>
            <Label>{label}</Label>
            <P>{v}</P>
          </View>
        ))}
        <H3>Vragen om mee te nemen</H3>
        {a.advies.reflectievragen.map((q, i) => <P key={i}>• {q}</P>)}
      </Card>
    </View>
  );
}

const st = StyleSheet.create({
  kern: { fontSize: 21, fontWeight: "700", lineHeight: 28 },
  state: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 4 },
  item: { gap: 8 },
  reframe: { borderLeftWidth: 3, paddingLeft: 10, gap: 2 },
  q: { fontSize: 15, fontWeight: "500", lineHeight: 22 },
  bar: { flexDirection: "row", alignItems: "center", gap: 10 },
  barLabel: { width: 120, fontSize: 14 },
  track: { flex: 1, height: 10, borderRadius: 999, overflow: "hidden" },
  num: { width: 40, textAlign: "right", fontVariant: ["tabular-nums"] },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  val: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, gap: 2, maxWidth: "100%" },
  scale: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 },
  ends: { flexDirection: "row", justifyContent: "space-between" },
  rail: { height: 6, borderRadius: 999, marginVertical: 6 },
  dot: { position: "absolute", top: -4, width: 14, height: 14, marginLeft: -7, borderRadius: 7, borderWidth: 2 },
  lvl: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, gap: 2 },
  step: { flexDirection: "row", gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  readyRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  readyNum: { fontSize: 44, fontWeight: "700", fontVariant: ["tabular-nums"], minWidth: 52, textAlign: "center" },
  split: { height: 12, borderRadius: 999, overflow: "hidden", flexDirection: "row" },
  exercise: { borderRadius: 10, padding: 10, gap: 2, marginTop: 4 },
});
