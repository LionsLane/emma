import { FlatList, RefreshControl, Text, View } from "react-native";
import { useState } from "react";
import { Card, Chip, Empty, P, Skeleton } from "@/components/ui";
import { useSession } from "@/lib/session";
import { T } from "@/lib/theme";

const statusTone = (s: string) => (s === "scheduled" || s === "published" ? "ok" : s === "in review" ? "warn" : "neutral") as "ok" | "warn" | "neutral";

export default function Calendar() {
  const { ws, refresh } = useSession();
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  if (!ws) return <View style={{ padding: 16, gap: 12 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={86} r={14} />)}</View>;
  const items = ws.calendar.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <FlatList
      data={items}
      keyExtractor={(e) => e.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={T.accent} onRefresh={async () => { setRefreshing(true); await refresh(); setRefreshing(false); }} />}
      ListEmptyComponent={<Empty text="Nothing scheduled. Ask EMMA to plan your week." />}
      renderItem={({ item: e }) => (
        <Card>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Text style={{ color: T.text2, fontVariant: ["tabular-nums"], fontSize: 12.5 }}>{new Date(e.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</Text>
            <Chip label={e.platform} tone="accent" />
            <Chip label={e.status} tone={statusTone(e.status)} />
          </View>
          <Text style={{ color: T.text, fontWeight: "700", fontSize: 15 }}>{e.angle}</Text>
          <P muted small>{e.contentType}</P>
          {e.copy ? <P small>{e.copy}</P> : null}
        </Card>
      )}
    />
  );
}
