import { FlatList, Linking, Pressable, Text, View } from "react-native";
import { Card, Chip, Empty, P, Skeleton } from "@/components/ui";
import { useSession } from "@/lib/session";
import { T } from "@/lib/theme";

const kePhone = (raw: string) => {
  const d = raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const m = /^(?:254|0)?([17]\d{8})$/.exec(d);
  return m ? `254${m[1]}` : null;
};

export default function Leads() {
  const { ws } = useSession();
  if (!ws) return <View style={{ padding: 16, gap: 12 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={96} r={14} />)}</View>;
  const cur = ws.profile.currency;
  const items = ws.leads.filter((l) => l.stage !== "won" && l.stage !== "lost").sort((a, b) => b.score - a.score);
  return (
    <FlatList
      data={items}
      keyExtractor={(l) => l.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      ListEmptyComponent={<Empty text="No open leads yet." />}
      renderItem={({ item: l }) => {
        const wa = kePhone(l.phone);
        const temp = l.score >= 75 ? "hot" : l.score >= 50 ? "warm" : "cold";
        return (
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.text, fontWeight: "700", fontSize: 15 }}>{l.name || l.company}</Text>
                <P muted small>{[l.role, l.company].filter(Boolean).join(", ")}</P>
              </View>
              <Text style={{ color: T.text2, fontVariant: ["tabular-nums"] }}>{cur} {Math.round(l.value / 1000)}k</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              <Chip label={l.stage} />
              <Chip label={`${temp} · ${l.score}`} tone={temp === "hot" ? "ai" : temp === "warm" ? "warn" : "neutral"} />
              {!l.consent && <Chip label="No consent: one-to-one only" tone="risk" />}
              {!l.verified && <Chip label="Unverified" tone="warn" />}
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {l.phone ? <Action label="Call" onPress={() => Linking.openURL(`tel:${l.phone.replace(/\s/g, "")}`)} /> : null}
              {wa ? <Action label="WhatsApp" onPress={() => Linking.openURL(`https://wa.me/${wa}`)} /> : null}
              {l.email ? <Action label="Email" onPress={() => Linking.openURL(`mailto:${l.email}`)} /> : null}
            </View>
          </Card>
        );
      }}
    />
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ minHeight: 44, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: T.line, justifyContent: "center" }}>
      <Text style={{ color: T.accent, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}
