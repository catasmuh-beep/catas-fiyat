import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "./admin-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function isAuthed() {
  const store = cookies();
  return store.get("catas_admin")?.value === "1";
}

export default async function AdminPage() {
  const authed = await isAuthed();

  if (!authed) {
    redirect("/admin/login");
  }

  return <AdminClient initialProducts={[]} />;
}
