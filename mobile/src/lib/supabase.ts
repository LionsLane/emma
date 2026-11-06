// Supabase client for the app. Session persisted with expo-sqlite's
// localStorage (as recommended in Expo's Supabase guide); only the
// publishable key ships in the app, RLS protects the data.
import "expo-sqlite/localStorage/install";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const configured = Boolean(url && key);

export const supabase = createClient(url || "http://localhost", key || "missing", {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Only refresh tokens while the app is in the foreground.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
