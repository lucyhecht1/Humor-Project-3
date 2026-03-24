import { requireAdmin } from "@/lib/auth/requireAdmin";
import { listFlavors } from "@/lib/queries/flavors";
import { TestRunnerClient } from "./_components/test-runner-client";

export default async function TestRunnerPage() {
  const session = await requireAdmin();
  if (!session) return null;

  const flavors = await listFlavors();

  return <TestRunnerClient flavors={flavors} />;
}
