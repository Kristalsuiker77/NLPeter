import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useTheme } from "../lib/theme";

export function Card({ children, lead, style }: { children: ReactNode; lead?: boolean; style?: ViewStyle }) {
  const t = useTheme();
  return (
    <View
      style={[
        s.card,
        { backgroundColor: lead ? t.accentSoft : t.surface, borderColor: lead ? t.accent : t.line },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function H2({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[s.h2, { color: t.ink }]} accessibilityRole="header">{children}</Text>;
}

export function H3({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[s.h3, { color: t.ink }]}>{children}</Text>;
}

export function P({ children, muted }: { children: ReactNode; muted?: boolean }) {
  const t = useTheme();
  return <Text style={[s.p, { color: muted ? t.muted : t.ink }]}>{children}</Text>;
}

export function Label({ children }: { children: string }) {
  const t = useTheme();
  return <Text style={[s.label, { color: t.muted }]}>{children.toUpperCase()}</Text>;
}

export function Quote({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[s.quote, { backgroundColor: t.sunk }]}>
      <Text style={[s.quoteText, { color: t.ink }]}>“{children}”</Text>
    </View>
  );
}

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "limit" | "support" }) {
  const t = useTheme();
  const bg = tone === "limit" ? t.warnSoft : tone === "support" ? t.goodSoft : t.sunk;
  const fg = tone === "limit" ? t.warn : tone === "support" ? t.good : t.muted;
  return (
    <View style={[s.chip, { backgroundColor: bg }]}>
      <Text style={[s.chipText, { color: fg }]}>{children}</Text>
    </View>
  );
}

export function Button({
  title, onPress, variant = "primary", disabled,
}: { title: string; onPress: () => void; variant?: "primary" | "secondary"; disabled?: boolean }) {
  const t = useTheme();
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.btn,
        {
          backgroundColor: primary ? t.accent : t.surface,
          borderColor: primary ? t.accent : t.line,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[s.btnText, { color: primary ? t.accentInk : t.ink }]}>{title}</Text>
    </Pressable>
  );
}

export const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 18, gap: 12 },
  h2: { fontSize: 19, fontWeight: "700" },
  h3: { fontSize: 15, fontWeight: "600" },
  p: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8 },
  quote: { borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  quoteText: { fontSize: 14, fontStyle: "italic", lineHeight: 20 },
  chip: { alignSelf: "flex-start", borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  chipText: { fontSize: 12, fontWeight: "600" },
  btn: { borderWidth: 1, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 18, alignItems: "center" },
  btnText: { fontSize: 16, fontWeight: "600" },
});
