// Public Supabase settings. Safe in the browser: RLS protects the data.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

// Cloud mode = real accounts and a database. Without these the app runs as a
// browser-only demo (see docs/Architecture.md §6).
export const CLOUD = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Google sign-in client id (public, it appears in every Google sign-in URL).
// With it, sign-in uses Google's own button on our domain, so Google's screen
// names emma.lionslane.co.ke instead of the Supabase project address.
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
