import { requireAdmin } from "@/lib/auth/requireAdmin";
import { listStepTypes } from "@/lib/queries/stepTypes";

export default async function StepTypesPage() {
  const session = await requireAdmin();
  if (!session) return null;

  const stepTypes = await listStepTypes();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Step Types
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Reference data managed in Supabase. Read-only here.
        </p>
      </div>

      {stepTypes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 px-8 py-16 text-center dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <StepTypeIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No step types found</p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Add step types directly in Supabase to see them here.
            </p>
          </div>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
              <th className="pb-3 pr-6 font-medium">Slug</th>
              <th className="pb-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {stepTypes.map((st) => (
              <tr key={st.id}>
                <td className="py-3.5 pr-6 font-mono font-medium text-zinc-900 dark:text-zinc-50">
                  {st.slug}
                </td>
                <td className="py-3.5 text-zinc-500 dark:text-zinc-400">
                  {st.description ?? (
                    <span className="italic text-zinc-300 dark:text-zinc-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StepTypeIcon() {
  return (
    <svg className="size-5 text-zinc-400 dark:text-zinc-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}
