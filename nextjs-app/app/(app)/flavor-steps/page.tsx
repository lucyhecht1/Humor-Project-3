import { requireAdmin } from "@/lib/auth/requireAdmin";
import { listAllSteps } from "@/lib/queries/flavors";
import Link from "next/link";
import { PromptCell } from "./_components/prompt-cell";

const PAGE_SIZE = 50;

export default async function FlavorStepsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireAdmin();
  if (!session) return null;

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { steps, total } = await listAllSteps(page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Flavor Steps
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          All rows in <code className="font-mono text-xs text-zinc-600 dark:text-zinc-400">humor_flavor_steps</code>.
          Edit steps from the <Link href="/flavors" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-200">Flavors</Link> page.
        </p>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 px-8 py-16 text-center dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <StepsIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No steps found</p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Create a flavor and add steps to see them here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-xs text-zinc-400">
              {from}–{to} of {total} row{total !== 1 ? "s" : ""}
            </p>
            <Pagination page={page} totalPages={totalPages} />
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left dark:border-zinc-800 dark:bg-zinc-900">
                  {[
                    "id",
                    "humor_flavor_id",
                    "order_by",
                    "description",
                    "llm_system_prompt",
                    "llm_user_prompt",
                    "llm_model_id",
                    "llm_temperature",
                    "llm_input_type_id",
                    "llm_output_type_id",
                    "humor_flavor_step_type_id",
                    "created_datetime_utc",
                    "modified_datetime_utc",
                  ].map((col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-zinc-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {steps.map((step) => (
                  <tr key={step.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 tabular-nums text-zinc-400">{step.id}</td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/flavors/${step.humorFlavorId}`}
                        className="group/link flex flex-col hover:underline"
                      >
                        <span className="font-mono font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
                          {step.humorFlavorId}
                        </span>
                        {step.flavorSlug && (
                          <span className="font-mono text-xs text-zinc-400">
                            {step.flavorSlug}
                          </span>
                        )}
                      </Link>
                    </td>

                    <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                      {step.orderBy}
                    </td>

                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {step.description ?? <Null />}
                    </td>

                    <PromptCell value={step.llmSystemPrompt} />
                    <PromptCell value={step.llmUserPrompt} />

                    <td className="px-4 py-3 tabular-nums text-zinc-500 dark:text-zinc-400">
                      {step.llmModelId ?? <Null />}
                    </td>

                    <td className="px-4 py-3 tabular-nums text-zinc-500 dark:text-zinc-400">
                      {step.llmTemperature ?? <Null />}
                    </td>

                    <td className="px-4 py-3 tabular-nums text-zinc-500 dark:text-zinc-400">
                      {step.llmInputTypeId ?? <Null />}
                    </td>

                    <td className="px-4 py-3 tabular-nums text-zinc-500 dark:text-zinc-400">
                      {step.llmOutputTypeId ?? <Null />}
                    </td>

                    <td className="px-4 py-3 tabular-nums text-zinc-500 dark:text-zinc-400">
                      {step.humorFlavorStepTypeId ?? <Null />}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-400">
                      {formatDate(step.createdAt)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-400">
                      {step.modifiedAt ? formatDate(step.modifiedAt) : <Null />}
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

  const prev = page - 1;
  const next = page + 1;

  return (
    <div className="flex items-center gap-1">
      <PageLink href={`?page=${prev}`} disabled={page <= 1} aria-label="Previous page">
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

      <PageLink href={`?page=${next}`} disabled={page >= totalPages} aria-label="Next page">
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
  const base =
    "inline-flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs font-medium transition-colors";
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

function StepsIcon() {
  return (
    <svg className="size-5 text-zinc-400 dark:text-zinc-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10M3 8h7M3 12h5" />
    </svg>
  );
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
