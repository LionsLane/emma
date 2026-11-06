import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Workspace } from "@/lib/types";

export interface LoadedWorkspace {
  id: string;
  name: string;
  ownerId: string;
  data: Workspace;
  version: number;
  role: "owner" | "editor" | "viewer";
}

// Load through the user's own client so RLS proves membership. Returns null
// if the user can't see it (we don't reveal whether it exists).
export async function loadWorkspace(db: SupabaseClient, userId: string, workspaceId: string): Promise<LoadedWorkspace | null> {
  const [{ data: ws }, { data: member }] = await Promise.all([
    db.from("workspaces").select("id,name,owner_id,data,version").eq("id", workspaceId).maybeSingle(),
    db.from("workspace_members").select("role").eq("workspace_id", workspaceId).eq("user_id", userId).maybeSingle(),
  ]);
  if (!ws || !member) return null;
  return { id: ws.id, name: ws.name, ownerId: ws.owner_id, data: ws.data as Workspace, version: ws.version, role: member.role };
}

// After a downgrade, workspaces beyond the plan's allowance turn read-only
// (oldest stay active). Nothing is deleted.
export async function isWithinAllowance(admin: SupabaseClient, ownerId: string, workspaceId: string, allowance: number): Promise<boolean> {
  const { data } = await admin.from("workspaces").select("id").eq("owner_id", ownerId).order("created_at", { ascending: true });
  const idx = (data ?? []).findIndex((w) => w.id === workspaceId);
  return idx >= 0 && idx < allowance;
}
