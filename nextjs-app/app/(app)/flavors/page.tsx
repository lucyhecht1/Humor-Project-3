import { requireAdmin } from "@/lib/auth/requireAdmin";
import { listFlavors } from "@/lib/queries/flavors";
import { FlavorsClient } from "./_components/flavors-client";

export default async function FlavorsPage() {
  const session = await requireAdmin();
  if (!session) return null;

  const flavors = await listFlavors();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <FlavorsClient flavors={flavors} />
    </div>
  );
}
