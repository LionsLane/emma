import { Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { T } from "@/lib/theme";

// Simple glyph icons keep the app free of an icon dependency.
const glyph = (g: string) => ({ color }: { color: ColorValue }) => <Text style={{ color, fontSize: 18 }} accessible={false}>{g}</Text>;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: T.bg },
        headerTintColor: T.text,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: "#060b1a", borderTopColor: T.line, minHeight: 60 },
        tabBarActiveTintColor: T.accent,
        tabBarInactiveTintColor: T.muted,
        sceneStyle: { backgroundColor: T.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "EMMA", tabBarIcon: glyph("✦") }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar", tabBarIcon: glyph("▦") }} />
      <Tabs.Screen name="leads" options={{ title: "Leads", tabBarIcon: glyph("◎") }} />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: glyph("○") }} />
    </Tabs>
  );
}
