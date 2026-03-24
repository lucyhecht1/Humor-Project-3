import { requireAdmin } from "@/lib/auth/requireAdmin";
import { listThemes } from "@/lib/queries/themes";

export default async function ThemesPage() {
  const session = await requireAdmin();
  if (!session) return null;

  const themes = await listThemes();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Themes
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Reference data managed in Supabase. Read-only here.
        </p>
      </div>

      {themes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 px-8 py-16 text-center dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <ThemeIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No themes found</p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Add themes directly in Supabase to see them here.
            </p>
          </div>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
              <th className="pb-3 pr-6 font-medium">Name</th>
              <th className="pb-3 pr-6 font-medium">Description</th>
              <th className="pb-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {themes.map((t) => (
              <tr key={t.id}>
                <td className="py-3.5 pr-6 font-medium text-zinc-900 dark:text-zinc-50">
                  {t.name}
                </td>
                <td className="py-3.5 pr-6 text-zinc-500 dark:text-zinc-400">
                  <span className="line-clamp-1">
                    {t.description ?? (
                      <span className="italic text-zinc-300 dark:text-zinc-600">—</span>
                    )}
                  </span>
                </td>
                <td className="py-3.5 tabular-nums text-zinc-400">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ThemeIcon() {
  return (
    <svg className="size-5 text-zinc-400 dark:text-zinc-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" />
    </svg>
  );
}
