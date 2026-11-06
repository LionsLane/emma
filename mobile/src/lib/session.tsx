// Session + account + active workspace, shared by every screen.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { api, type Account } from "./api";

export interface WorkspaceDoc {
  profile: { name: string; currency: string };
  calendar: { id: string; date: string; platform: string; angle: string; contentType: string; status: string; copy?: string }[];
  leads: { id: string; name: string; company: string; role: string; phone: string; email: string; stage: string; score: number; value: number; consent: boolean; verified: boolean }[];
}

interface Ctx {
  session: Session | null;
  loading: boolean;
  account: Account | null;
  workspaceId: string | null;
  ws: WorkspaceDoc | null;
  refresh: () => Promise<void>;
  setWs: (ws: WorkspaceDoc) => void;
}

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [ws, setWs] = useState<WorkspaceDoc | null>(null);

  const refresh = useCallback(async () => {
    try {
      const a = await api<Account>("/api/account");
      setAccount(a);
      const id = a.workspaces[0]?.id ?? null;
      setWorkspaceId(id);
      if (id) {
        const { data } = await supabase.from("workspaces").select("data").eq("id", id).maybeSingle();
        if (data) setWs(data.data as WorkspaceDoc);
      }
    } catch {
      setAccount(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) void refresh();
    else { setAccount(null); setWs(null); setWorkspaceId(null); }
  }, [session, refresh]);

  return <SessionCtx.Provider value={{ session, loading, account, workspaceId, ws, refresh, setWs }}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  const c = useContext(SessionCtx);
  if (!c) throw new Error("useSession outside SessionProvider");
  return c;
}
