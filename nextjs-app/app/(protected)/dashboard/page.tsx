import { verifyAdmin } from "@/lib/dal";

export default async function DashboardPage() {
  const session = await verifyAdmin();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Dashboard
      </h1>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">
        Welcome back,{" "}
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {session.email}
        </span>
        .{" "}
        {session.isSuperAdmin && (
          <span className="text-xs text-zinc-400">(superadmin)</span>
        )}
        {session.isMatrixAdmin && (
          <span className="text-xs text-zinc-400">(matrix admin)</span>
        )}
      </p>
    </div>
  );
}
