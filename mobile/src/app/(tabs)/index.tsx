import { useRef, useState } from "react";
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Button, Card, Chip, Orb, P } from "@/components/ui";
import { api, safeUrl, streamBrief, type AgentEvent, type Proposal } from "@/lib/api";
import { useSession, type WorkspaceDoc } from "@/lib/session";
import { T } from "@/lib/theme";

type Part = { type: "text"; text: string } | { type: "status"; label: string } | { type: "proposal"; id: string } | { type: "error"; message: string } | { type: "source"; title: string; url: string };
interface Msg { id: string; role: "user" | "emma"; parts: Part[] }

const QUICK = [
  { label: "Plan my week", prompt: "Plan my posts for this week across my channels, with the copy written." },
  { label: "Follow up leads", prompt: "Draft the next follow-up for each of my hot and warm leads." },
  { label: "Write a post", prompt: "Write one strong post for today about my best-selling offer." },
];

const push = (parts: Part[], p: Part): Part[] => {
  const last = parts[parts.length - 1];
  if (p.type === "text" && last?.type === "text") return [...parts.slice(0, -1), { type: "text", text: last.text + p.text }];
  return [...parts, p];
};

export default function Emma() {
  const { workspaceId, account, setWs, refresh } = useSession();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [proposals, setProposals] = useState<Record<string, Proposal>>({});
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [conv, setConv] = useState<string | undefined>();
  const scroll = useRef<ScrollView>(null);

  const send = async (brief: string) => {
    const t = brief.trim();
    if (!t || busy || !workspaceId) return;
    setText("");
    const emmaId = `e${Date.now()}`;
    setMsgs((m) => [...m, { id: `u${Date.now()}`, role: "user", parts: [{ type: "text", text: t }] }, { id: emmaId, role: "emma", parts: [] }]);
    setBusy(true);
    const add = (p: Part) => setMsgs((m) => m.map((x) => (x.id === emmaId ? { ...x, parts: push(x.parts, p) } : x)));
    try {
      await streamBrief({ workspaceId, conversationId: conv, text: t }, (ev: AgentEvent) => {
        if (ev.type === "text") add({ type: "text", text: ev.text });
        else if (ev.type === "status") add({ type: "status", label: ev.label });
        else if (ev.type === "source") add({ type: "source", title: ev.title, url: ev.url });
        else if (ev.type === "error") add({ type: "error", message: ev.message });
        else if (ev.type === "conversation") setConv(ev.id);
        else if (ev.type === "proposal") { setProposals((p) => ({ ...p, [ev.proposal.id]: ev.proposal })); add({ type: "proposal", id: ev.proposal.id }); }
      });
      void refresh();
    } catch (e) {
      add({ type: "error", message: e instanceof Error ? e.message : "Connection lost." });
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  const decide = async (id: string, action: "approve" | "discard") => {
    try {
      const r = await api<{ status: string; data?: WorkspaceDoc }>(`/api/proposals/${id}`, { method: "POST", body: { action } });
      setProposals((p) => ({ ...p, [id]: { ...p[id], status: r.status as Proposal["status"] } }));
      if (r.data) setWs(r.data);
    } catch (e) {
      setMsgs((m) => [...m, { id: `x${Date.now()}`, role: "emma", parts: [{ type: "error", message: e instanceof Error ? e.message : "Couldn't do that." }] }]);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: T.bg }} keyboardVerticalOffset={90}>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, gap: 14, flexGrow: 1 }} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
        {msgs.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingVertical: 40 }}>
            <Orb size={64} />
            <Text style={{ color: T.text, fontSize: 22, fontWeight: "800", textAlign: "center" }}>What are we making happen?</Text>
            {account && <Chip label={`${account.plan.name} · ${account.usage.briefs}/${account.limits.briefs} briefs`} tone="accent" />}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {QUICK.map((q) => (
                <Pressable key={q.label} onPress={() => send(q.prompt)} accessibilityRole="button" style={{ borderWidth: 1, borderColor: T.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}>
                  <Text style={{ color: T.text2, fontSize: 13 }}>{q.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : msgs.map((m) =>
          m.role === "user" ? (
            <View key={m.id} style={{ alignSelf: "flex-end", maxWidth: "85%", backgroundColor: T.primary + "38", borderColor: T.primary + "59", borderWidth: 1, borderRadius: 16, borderBottomRightRadius: 4, padding: 12 }}>
              <Text style={{ color: T.text, fontSize: 15 }}>{(m.parts[0] as { text: string }).text}</Text>
            </View>
          ) : (
            <View key={m.id} style={{ flexDirection: "row", gap: 10 }}>
              <Orb size={26} />
              <View style={{ flex: 1, gap: 8 }}>
                {m.parts.length === 0 && <P muted small>Thinking…</P>}
                {m.parts.map((p, i) => {
                  if (p.type === "text") return <Text key={i} style={{ color: T.text, fontSize: 15, lineHeight: 22 }}>{p.text.replace(/\*\*/g, "")}</Text>;
                  if (p.type === "status") return <P key={i} muted small>✦ {p.label}</P>;
                  if (p.type === "error") return <Text key={i} accessibilityRole="alert" style={{ color: T.risk }}>{p.message}</Text>;
                  if (p.type === "source") { const u = safeUrl(p.url); return u ? <Text key={i} onPress={() => Linking.openURL(u)} style={{ color: T.accent, fontSize: 12.5 }} accessibilityRole="link">{p.title || u}</Text> : null; }
                  const pr = proposals[p.id];
                  if (!pr) return null;
                  return (
                    <Card key={i} accent={pr.status === "pending"}>
                      <Text style={{ color: T.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>EMMA proposes · {pr.items.length} item{pr.items.length === 1 ? "" : "s"}</Text>
                      <Text style={{ color: T.text, fontWeight: "700", fontSize: 15 }}>{pr.title}</Text>
                      <P small>{pr.summary}</P>
                      {pr.reviewNote ? <Text style={{ color: T.warn, fontSize: 12.5 }}>Check first: {pr.reviewNote}</Text> : null}
                      {pr.status === "pending" ? (
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <View style={{ flex: 1 }}><Button label="Approve & add" kind="ai" onPress={() => decide(pr.id, "approve")} /></View>
                          <Button label="Discard" kind="ghost" onPress={() => decide(pr.id, "discard")} />
                        </View>
                      ) : <Chip label={pr.status === "approved" ? "Approved" : "Discarded"} tone={pr.status === "approved" ? "ok" : "neutral"} />}
                    </Card>
                  );
                })}
              </View>
            </View>
          ),
        )}
      </ScrollView>
      <View style={{ flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: T.line, backgroundColor: "#060b1a" }}>
        <TextInput
          value={text} onChangeText={setText} placeholder="Brief EMMA…" placeholderTextColor={T.faint} multiline accessibilityLabel="Brief EMMA"
          style={{ flex: 1, minHeight: 46, maxHeight: 120, color: T.text, fontSize: 15, borderRadius: 12, borderWidth: 1, borderColor: T.line, paddingHorizontal: 12, paddingVertical: 10 }}
        />
        <Button label="Send" kind="ai" onPress={() => send(text)} busy={busy} disabled={!text.trim() || !workspaceId} />
      </View>
    </KeyboardAvoidingView>
  );
}
