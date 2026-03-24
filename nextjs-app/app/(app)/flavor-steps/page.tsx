import { requireAdmin } from "@/lib/auth/requireAdmin";
import { listAllSteps } from "@/lib/queries/flavors";
import Link from "next/link";

export default async function FlavorStepsPage() {
  const session = await requireAdmin();
  if (!session) return null;

  const steps = await listAllSteps();

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

      {steps.length === 0 ? (
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
          <p className="mb-3 text-xs text-zinc-400">{steps.length} row{steps.length !== 1 ? "s" : ""}</p>
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

                    {/* humor_flavor_id — linked to flavor detail */}
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

                    {/* Prompt columns — moved next to description */}
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
        </>
      )}
    </div>
  );
}

function PromptCell({ value }: { value: string | null }) {
  if (!value) return <td className="px-4 py-3"><Null /></td>;
  return (
    <td className="px-4 py-3" title={value}>
      <span className="block max-w-xs truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {value}
      </span>
    </td>
  );
}

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
