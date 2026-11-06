import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SessionProvider, useSession } from "@/lib/session";
import { T } from "@/lib/theme";

function Gate() {
  const { session, loading } = useSession();
  const segments = useSegments();
  if (loading) {
    return <View style={{ flex: 1, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={T.accent} /></View>;
  }
  const onSignIn = segments[0] === "signin";
  if (!session && !onSignIn) return <Redirect href="/signin" />;
  if (session && onSignIn) return <Redirect href="/" />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: T.bg } }} />
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <Gate />
    </SessionProvider>
  );
}
