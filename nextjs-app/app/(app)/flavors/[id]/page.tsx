import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getFlavor, getFlavorSteps } from "@/lib/queries/flavors";
import { listStepTypes } from "@/lib/queries/stepTypes";
import { listInputTypes, listOutputTypes, listModels } from "@/lib/queries/llmTypes";
import { getCaptionsForFlavor } from "@/lib/queries/captions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FlavorDetailTabs } from "./_components/flavor-detail-tabs";

export default async function FlavorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdmin();
  if (!session) return null;

  const { id } = await params;
  const flavorId = Number(id);

  const [flavor, steps, stepTypes, inputTypes, outputTypes, models, captionsData] = await Promise.all([
    getFlavor(flavorId),
    getFlavorSteps(flavorId),
    listStepTypes(),
    listInputTypes(),
    listOutputTypes(),
    listModels(),
    getCaptionsForFlavor(flavorId),
  ]);

  if (!flavor) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* ── Breadcrumb ────────────────────────────────── */}
      <Link
        href="/flavors"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        <ChevronLeftIcon />
        Flavors
      </Link>

      {/* ── Flavor header ─────────────────────────────── */}
      <div className="mt-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <h1 className="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {flavor.slug}
        </h1>
        {flavor.description && (
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            {flavor.description}
          </p>
        )}
        <p className="mt-3 text-xs text-zinc-400">
          ID {flavor.id} · Created {new Date(flavor.createdAt).toLocaleDateString()}
          {flavor.modifiedAt && (
            <> · Modified {new Date(flavor.modifiedAt).toLocaleDateString()}</>
          )}
        </p>
      </div>

      {/* ── Tabs: Steps + Captions ────────────────────── */}
      <FlavorDetailTabs
        flavor={flavor}
        steps={steps}
        stepTypes={stepTypes}
        inputTypes={inputTypes}
        outputTypes={outputTypes}
        models={models}
        captionsData={captionsData}
      />
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
