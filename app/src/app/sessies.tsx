import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { clearSessions, listSessions } from "../lib/storage";
import { useTheme } from "../lib/theme";
import type { Session } from "../lib/types";
import { Button, P } from "../components/ui";

export default function SessionsScreen() {
  const t = useTheme();
  const [items, setItems] = useState<Session[]>([]);
  const [confirm, setConfirm] = useState(false);

  useFocusEffect(useCallback(() => { listSessions().then(setItems); }, []));

  return (
    <FlatList
      data={items}
      keyExtractor={(s) => s.id}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      ListEmptyComponent={<P muted>Nog geen sessies. Je analyses verschijnen hier en blijven alleen op dit toestel.</P>}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: "/analyse/[id]", params: { id: item.id } })}
          style={({ pressed }) => ({
            backgroundColor: t.surface, borderColor: t.line, borderWidth: 1, borderRadius: 12, padding: 14, gap: 4,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: t.muted, fontSize: 12 }}>
            {new Date(item.at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
          </Text>
          <Text style={{ color: t.ink, fontSize: 15, fontWeight: "600" }} numberOfLines={2}>
            {item.analysis.kernshift}
          </Text>
        </Pressable>
      )}
      ListFooterComponent={
        items.length ? (
          <View style={{ marginTop: 16, gap: 8 }}>
            {confirm ? (
              <>
                <P>Alle sessies op dit toestel wissen? Dit kan niet ongedaan worden.</P>
                <Button title="Ja, wis alles" onPress={async () => { await clearSessions(); setItems([]); setConfirm(false); }} />
                <Button title="Annuleer" variant="secondary" onPress={() => setConfirm(false)} />
              </>
            ) : (
              <Button title="Wis alle sessies" variant="secondary" onPress={() => setConfirm(true)} />
            )}
          </View>
        ) : undefined
      }
    />
  );
}
