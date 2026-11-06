// Public Supabase settings. Safe in the browser: RLS protects the data.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

// Cloud mode = real accounts and a database. Without these the app runs as a
// browser-only demo (see docs/Architecture.md §6).
export const CLOUD = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
