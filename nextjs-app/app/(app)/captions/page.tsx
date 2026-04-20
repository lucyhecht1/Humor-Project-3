import { requireAdmin } from "@/lib/auth/requireAdmin";
import { listCaptions } from "@/lib/queries/captions";
import Link from "next/link";

const PAGE_SIZE = 50;

export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireAdmin();
  if (!session) return null;

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { captions, total } = await listCaptions(page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Captions</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          All rows in <code className="font-mono text-xs">captions</code>, newest first.
        </p>
      </div>

      {total === 0 ? (
        <p className="text-sm text-zinc-400">No captions yet.</p>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-xs text-zinc-400">
              {from}–{to} of {total.toLocaleString()} row{total !== 1 ? "s" : ""}
            </p>
            <Pagination page={page} totalPages={totalPages} />
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left dark:border-zinc-800 dark:bg-zinc-900">
                  {["id", "image", "flavor", "content", "created"].map((col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {captions.map((c) => (
                  <tr key={c.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 align-top">
                      <span className="font-mono text-xs text-zinc-400" title={c.id}>
                        {c.id.slice(0, 8)}…
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top">
                      {c.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={c.imageUrl}
                          alt=""
                          className="h-12 w-12 rounded-md border border-zinc-200 object-cover dark:border-zinc-700"
                        />
                      ) : (
                        <Null />
                      )}
                    </td>

                    <td className="px-4 py-3 align-top">
                      {c.humorFlavorId ? (
                        <Link
                          href={`/flavors/${c.humorFlavorId}`}
                          className="flex flex-col hover:underline"
                        >
                          <span className="font-mono text-xs font-medium text-zinc-900 dark:text-zinc-50">
                            {c.flavorSlug ?? c.humorFlavorId}
                          </span>
                          {c.flavorSlug && (
                            <span className="font-mono text-[11px] text-zinc-400">
                              id {c.humorFlavorId}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <Null />
                      )}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span className="block max-w-lg whitespace-pre-wrap break-words text-zinc-700 dark:text-zinc-300">
                        {c.content ?? <Null />}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 align-top tabular-nums text-zinc-400">
                      {formatDate(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <Pagination page={page} totalPages={totalPages} />
          </div>
        </>
      )}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      <PageLink href={`?page=${page - 1}`} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeftIcon />
      </PageLink>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
        .reduce<(number | "…")[]>((acc, p, i, arr) => {
          if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
          acc.push(p);
          return acc;
        }, [])
        .map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-zinc-400">…</span>
          ) : (
            <PageLink key={p} href={`?page=${p}`} active={p === page}>
              {p}
            </PageLink>
          )
        )}

      <PageLink href={`?page=${page + 1}`} disabled={page >= totalPages} aria-label="Next page">
        <ChevronRightIcon />
      </PageLink>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  active,
  children,
  "aria-label": ariaLabel,
}: {
  href: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  const base = "inline-flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs font-medium transition-colors";
  const cls = disabled
    ? `${base} cursor-not-allowed text-zinc-300 dark:text-zinc-600`
    : active
    ? `${base} bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900`
    : `${base} text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800`;

  if (disabled) return <span className={cls} aria-label={ariaLabel}>{children}</span>;
  return <Link href={href} className={cls} aria-label={ariaLabel}>{children}</Link>;
}

// ── Misc ──────────────────────────────────────────────────────

function Null() {
  return <span className="text-zinc-300 dark:text-zinc-600">null</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChevronLeftIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}
