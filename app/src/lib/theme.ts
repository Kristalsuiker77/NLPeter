import { useColorScheme } from "react-native";

const light = {
  bg: "#F3F5F4", surface: "#FFFFFF", sunk: "#E8ECEA", ink: "#15201D", muted: "#5A6B66", line: "#D5DDDA",
  accent: "#2F5D50", accentInk: "#FFFFFF", accentSoft: "#DCE9E4",
  warn: "#9A5B12", warnSoft: "#F6E9D6", good: "#2E6B3A", goodSoft: "#DDEEDC", alert: "#9B2C2C", alertSoft: "#F7DEDE",
  v: "#3B6FB6", a: "#8A4FB0", k: "#C0612B", ad: "#5A6B66",
};
const dark: typeof light = {
  bg: "#0F1614", surface: "#17211E", sunk: "#1E2A27", ink: "#E6EEEB", muted: "#9AADA7", line: "#2B3A36",
  accent: "#7FC2AE", accentInk: "#0F1614", accentSoft: "#1F3631",
  warn: "#E5B26B", warnSoft: "#3A2D1A", good: "#8FD19B", goodSoft: "#1C3322", alert: "#F0A0A0", alertSoft: "#3D1F1F",
  v: "#7FA8E6", a: "#C49BE0", k: "#EE9A66", ad: "#9AADA7",
};

export type Theme = typeof light;
export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}
