import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../lib/theme";

export default function RootLayout() {
  const t = useTheme();
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.ink,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "NLPeter" }} />
        <Stack.Screen name="analyse/[id]" options={{ title: "Analyse" }} />
        <Stack.Screen name="sessies" options={{ title: "Eerdere sessies" }} />
      </Stack>
    </>
  );
}
