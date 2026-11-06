// The rendered transcript, shared by server (persisted in conversations.display)
// and client (live stream).

export type ChatPart =
  | { type: "text"; text: string }
  | { type: "status"; label: string }
  | { type: "proposal"; id: string }
  | { type: "source"; title: string; url: string }
  | { type: "error"; message: string };

export interface ChatMessage {
  id: string;
  role: "user" | "emma";
  parts: ChatPart[];
  at: string;
}

// Append a part, merging streamed text into the running text part.
export function pushPart(parts: ChatPart[], part: ChatPart): ChatPart[] {
  const last = parts[parts.length - 1];
  if (part.type === "text" && last?.type === "text") return [...parts.slice(0, -1), { type: "text", text: last.text + part.text }];
  return [...parts, part];
}
