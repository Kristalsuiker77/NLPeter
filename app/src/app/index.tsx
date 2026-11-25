import { useRef, useState } from "react";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { router } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { analyse, ApiError } from "../lib/api";
import { saveSession } from "../lib/storage";
import { useTheme } from "../lib/theme";
import { Button, Card, Label, P } from "../components/ui";

const countWords = (s: string) => s.trim().match(/\S+/g)?.length ?? 0;

export default function RecordScreen() {
  const t = useTheme();
  const [text, setText] = useState("");
  const [partial, setPartial] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ msg: string; err?: boolean } | null>(null);
  const ctl = useRef<AbortController | null>(null);

  useSpeechRecognitionEvent("start", () => setListening(true));
  useSpeechRecognitionEvent("end", () => {
    setListening(false);
    setPartial("");
  });
  useSpeechRecognitionEvent("result", (e) => {
    const said = e.results[0]?.transcript ?? "";
    if (e.isFinal) {
      if (said.trim()) setText((prev) => (prev && !/\s$/.test(prev) ? prev + " " : prev) + said.trim());
      setPartial("");
    } else {
      setPartial(said);
    }
  });
  useSpeechRecognitionEvent("error", (e) => {
    if (e.error === "no-speech" || e.error === "aborted") return;
    setStatus({
      msg: e.error === "not-allowed"
        ? "Geen toegang tot microfoon of spraakherkenning. Zet dit aan in de instellingen, of typ je verhaal."
        : "Spraakherkenning stopte onverwacht. Tik opnieuw op de microfoon of typ verder.",
      err: true,
    });
  });

  async function toggleMic() {
    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    setStatus(null);
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setStatus({ msg: "Zonder toegang tot de microfoon kan Peter niet luisteren. Je kunt je verhaal ook typen.", err: true });
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: "nl-NL",
      interimResults: true,
      continuous: true,
      addsPunctuation: true,
      // Liever op het toestel zelf, zodat je stem het toestel niet verlaat.
      requiresOnDeviceRecognition: ExpoSpeechRecognitionModule.supportsOnDeviceRecognition(),
    });
  }

  async function runAnalysis() {
    const transcript = text.trim();
    if (countWords(transcript) < 30) {
      setStatus({ msg: "Vertel iets meer (minimaal 30 woorden), dan heeft Peter genoeg om patronen te herkennen.", err: true });
      return;
    }
    if (listening) ExpoSpeechRecognitionModule.stop();
    ctl.current = new AbortController();
    setBusy(true);
    setStatus({ msg: "Peter luistert naar je woorden en zoekt patronen. Dit duurt meestal 20 tot 60 seconden." });
    try {
      const analysis = await analyse(transcript, ctl.current.signal);
      const id = Date.now().toString(36);
      await saveSession({ id, at: Date.now(), transcript, analysis });
      setStatus(null);
      router.push({ pathname: "/analyse/[id]", params: { id } });
    } catch (e) {
      if (ctl.current?.signal.aborted) setStatus({ msg: "Analyse gestopt." });
      else setStatus({ msg: e instanceof ApiError ? e.message : "Er ging iets mis. Probeer het opnieuw.", err: true });
    } finally {
      setBusy(false);
    }
  }

  const words = countWords(text);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={st.page} keyboardShouldPersistTaps="handled">
        <P muted>Vertel hardop waar je vastloopt. Peter luistert naar hoe je het zegt en laat zien welke patronen je denken sturen.</P>

        <Card>
          <View style={[st.prompt, { backgroundColor: t.sunk }]}>
            <Text style={{ color: t.muted, lineHeight: 21 }}>
              Praat 2 tot 5 minuten vrijuit. Houvast:{" "}
              <Text style={{ color: t.ink, fontWeight: "600" }}>wat is de situatie nu</Text>,{" "}
              <Text style={{ color: t.ink, fontWeight: "600" }}>wat wil je in plaats daarvan</Text>, en{" "}
              <Text style={{ color: t.ink, fontWeight: "600" }}>wat houdt je tegen</Text>?
            </Text>
          </View>

          <View style={st.micRow}>
            <Pressable
              onPress={toggleMic}
              accessibilityRole="button"
              accessibilityLabel={listening ? "Stop opname" : "Start opname"}
              style={({ pressed }) => [
                st.mic,
                { backgroundColor: listening ? t.alert : t.accent, transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              <Text style={{ color: t.accentInk, fontSize: 15, fontWeight: "700" }}>{listening ? "Stop" : "Praat"}</Text>
            </Pressable>
            <Text style={{ color: t.muted, flex: 1, lineHeight: 20 }}>
              {listening ? "Peter luistert..." : "Tik om te praten. Je kunt ook typen of je tekst aanpassen."}
            </Text>
          </View>

          <Label>Transcript</Label>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            placeholder="Bijvoorbeeld: Ik zit al drie jaar in dezelfde baan en ik weet dat ik iets anders wil, maar..."
            placeholderTextColor={t.muted}
            style={[st.input, { color: t.ink, backgroundColor: t.bg, borderColor: t.line }]}
            textAlignVertical="top"
          />
          {!!partial && <Text style={{ color: t.muted, fontStyle: "italic" }}>{partial}</Text>}
          <Text style={{ color: t.muted, fontSize: 13 }}>{words} {words === 1 ? "woord" : "woorden"}</Text>

          {busy ? (
            <View style={{ gap: 10 }}>
              <ActivityIndicator color={t.accent} />
              <Button title="Stop analyse" variant="secondary" onPress={() => ctl.current?.abort()} />
            </View>
          ) : (
            <Button title="Analyseer met Peter" onPress={runAnalysis} />
          )}
          {status && (
            <View style={[st.status, { backgroundColor: status.err ? t.alertSoft : t.sunk }]}>
              <Text style={{ color: status.err ? t.alert : t.ink }}>{status.msg}</Text>
            </View>
          )}
        </Card>

        <Button title="Eerdere sessies" variant="secondary" onPress={() => router.push("/sessies")} />

        <View style={{ gap: 6 }}>
          <P muted>
            Privacy: spraak wordt waar mogelijk op je toestel omgezet naar tekst. Alleen de tekst gaat naar Peter voor
            de analyse en wordt daar niet bewaard. Je sessies blijven op dit toestel.
          </P>
          <P muted>NLPeter is een coachingshulpmiddel, geen therapie of diagnose. Bij een crisis: bel 113 via 0800-0113.</P>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 40 },
  prompt: { borderRadius: 12, padding: 12 },
  micRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  mic: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  input: { minHeight: 180, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16, lineHeight: 23 },
  status: { borderRadius: 10, padding: 12 },
});
