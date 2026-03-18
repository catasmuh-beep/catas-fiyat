
import { createClient } from "@supabase/supabase-js";

export function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase ortam değişkenleri eksik.");
  return createClient(url, key);
}

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Server Supabase ortam değişkenleri eksik.");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
