import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AnalysisView } from "../../components/AnalysisView";
import { getSession } from "../../lib/storage";
import { useTheme } from "../../lib/theme";
import type { Session } from "../../lib/types";
import { P } from "../../components/ui";

export default function AnalysisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    getSession(String(id)).then((s) => setSession(s ?? null));
  }, [id]);

  if (session === undefined) {
    return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator color={t.accent} /></View>;
  }
  if (session === null) {
    return <View style={{ padding: 16 }}><P>Deze sessie is niet meer op dit toestel te vinden.</P></View>;
  }
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <AnalysisView a={session.analysis} />
    </ScrollView>
  );
}
