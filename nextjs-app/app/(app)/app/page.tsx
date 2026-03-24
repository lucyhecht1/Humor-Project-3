import { requireAdmin } from "@/lib/auth/requireAdmin";
import { redirect } from "next/navigation";

export default async function AppPage() {
  const session = await requireAdmin();
  if (!session) return null;

  // Sidebar provides navigation; default to Flavors
  redirect("/flavors");
}
