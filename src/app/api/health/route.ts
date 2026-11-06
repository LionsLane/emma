// Tells the UI what this server can do. Never returns secrets or model names.
import { CLOUD } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ connected: Boolean(process.env.ANTHROPIC_API_KEY), cloud: CLOUD }, { headers: { "Cache-Control": "no-store" } });
}
