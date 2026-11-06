import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { T } from "@/lib/theme";

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[{ flex: 1, backgroundColor: T.bg }, style]}>{children}</View>;
}

export function Card({ children, style, accent }: { children: ReactNode; style?: ViewStyle; accent?: boolean }) {
  return <View style={[s.card, accent && { borderColor: T.aiFrom }, style]}>{children}</View>;
}

export function H({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return <Text style={{ color: T.text, fontSize: size, fontWeight: "700" }} accessibilityRole="header">{children}</Text>;
}

export function P({ children, muted, small }: { children: ReactNode; muted?: boolean; small?: boolean }) {
  return <Text style={{ color: muted ? T.muted : T.text2, fontSize: small ? 12.5 : 14.5, lineHeight: small ? 18 : 21 }}>{children}</Text>;
}

type Tone = "neutral" | "ok" | "warn" | "risk" | "ai" | "accent";
const toneColor: Record<Tone, string> = { neutral: T.text2, ok: T.ok, warn: T.warn, risk: T.risk, ai: T.aiText, accent: T.accent };

export function Chip({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <View style={[s.chip, { borderColor: toneColor[tone] + "66" }]}>
      <Text style={{ color: toneColor[tone], fontSize: 11.5, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

export function Button({ label, onPress, kind = "default", disabled, busy, accessibilityLabel }: { label: string; onPress: () => void; kind?: "default" | "ai" | "primary" | "ghost" | "danger"; disabled?: boolean; busy?: boolean; accessibilityLabel?: string }) {
  const bg = kind === "ai" ? T.aiFrom : kind === "primary" ? T.primaryStrong : kind === "ghost" ? "transparent" : T.surfaceSolid;
  const color = kind === "danger" ? T.risk : kind === "ghost" ? T.text2 : "#fff";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled || busy), busy: Boolean(busy) }}
      style={({ pressed }) => [s.btn, { backgroundColor: bg, borderColor: kind === "default" || kind === "danger" ? T.line : "transparent", opacity: disabled ? 0.45 : pressed ? 0.8 : 1 }]}
    >
      {busy ? <ActivityIndicator color={color} /> : <Text style={{ color, fontWeight: "700", fontSize: 14 }}>{label}</Text>}
    </Pressable>
  );
}

// EMMA's avatar: cyan core, AI-coloured ring.
export function Orb({ size = 32 }: { size?: number }) {
  return (
    <View accessibilityLabel="EMMA" style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: T.aiTo, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: size * 0.62, height: size * 0.62, borderRadius: size, backgroundColor: T.primary, borderWidth: size * 0.08, borderColor: T.accent }} />
    </View>
  );
}

export function Skeleton({ h = 14, w = "100%" as number | `${number}%`, r = 8 }: { h?: number; w?: number | `${number}%`; r?: number }) {
  return <View style={{ height: h, width: w, borderRadius: r, backgroundColor: "rgba(148,170,220,0.10)" }} accessibilityElementsHidden />;
}

export function Empty({ text }: { text: string }) {
  return <Text style={{ color: T.muted, textAlign: "center", padding: 28 }}>{text}</Text>;
}

const s = StyleSheet.create({
  card: { backgroundColor: T.surface, borderColor: T.line, borderWidth: 1, borderRadius: T.radius, padding: 14, gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, alignSelf: "flex-start" },
  btn: { minHeight: 46, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
