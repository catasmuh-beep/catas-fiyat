import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSupabase } from "../lib/supabase";
import AdminClient from "./admin-client";

function isAuthed() {
  const store = cookies();
  return store.get("catas_admin")?.value === "1";
}

export default async function AdminPage() {
  const authed = isAuthed();

  if (!authed) {
    redirect("/admin/login");
  }

  const supabase = getServerSupabase();

  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return <AdminClient initialRows={data || []} />;
}
