
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSupabase } from "../lib/supabase";
import AdminClient from "./admin-client";

async function isAuthed() {
  const store = cookies();
  return store.get("catas_admin")?.value === "1";
}

export default async function AdminPage() {
  const authed = await isAuthed();
  if (!authed) {
    redirect("/admin/login");
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("kategori", { ascending: true })
    .order("marka", { ascending: true })
    .order("model", { ascending: true })
    .order("alt_model", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return <AdminClient initialRows={data || []} />;
}
