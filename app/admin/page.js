import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get("catas_admin")?.value === "1";

  if (!authed) {
    redirect("/admin/login");
  }

  return <AdminClient />;
}
