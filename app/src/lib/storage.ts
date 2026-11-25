import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "./types";

// Sessies blijven alleen op het toestel.
const KEY = "nlpeter.sessions.v1";
const MAX = 50;

export async function listSessions(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

export async function getSession(id: string): Promise<Session | undefined> {
  return (await listSessions()).find((s) => s.id === id);
}

export async function saveSession(s: Session): Promise<void> {
  const all = await listSessions();
  await AsyncStorage.setItem(KEY, JSON.stringify([s, ...all].slice(0, MAX)));
}

export async function clearSessions(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
