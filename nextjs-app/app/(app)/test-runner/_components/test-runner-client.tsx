"use client";

import { useState } from "react";
import { getStepsForRunner, prepareImage, runGenerateCaptions } from "@/app/actions/runner";
import type { HumorFlavorSummary } from "@/lib/queries/flavors";
import type { HumorFlavorStep } from "@/lib/schema";
import type { Caption } from "@/lib/api/runPipeline";

interface Props {
  flavors: HumorFlavorSummary[];
}

type RunStage = "idle" | "loading-steps" | "uploading" | "generating" | "done" | "error";
type StageState = "idle" | "active" | "done" | "error";

interface UploadDetails {
  cdnUrl: string;
  imageId: string;
}

export function TestRunnerClient({ flavors }: Props) {
  const [flavorId, setFlavorId] = useState<number | null>(null);
  const [steps, setSteps] = useState<HumorFlavorStep[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [runStage, setRunStage] = useState<RunStage>("idle");
  const [uploadDetails, setUploadDetails] = useState<UploadDetails | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleFlavorChange(id: number) {
    setFlavorId(id);
    setSteps([]);
    setCaptions([]);
    setUploadDetails(null);
    setRunStage("loading-steps");
    setErrorMsg(null);
    setExpandedSections({});

    const result = await getStepsForRunner(id);
    if ("error" in result) {
      setErrorMsg(result.error);
      setRunStage("error");
    } else {
      setSteps(result);
      setRunStage("idle");
    }
  }

  async function handleRun() {
    if (!flavorId || !imageUrl.trim()) return;

    setCaptions([]);
    setUploadDetails(null);
    setErrorMsg(null);
    setExpandedSections({});

    // Stage 1
    setRunStage("uploading");
    const uploadResult = await prepareImage(imageUrl.trim());
    if ("error" in uploadResult) {
      setErrorMsg(uploadResult.error);
      setRunStage("error");
      return;
    }
    setUploadDetails(uploadResult);
    setExpandedSections({ upload: true });

    // Stage 2
    setRunStage("generating");
    const captionResult = await runGenerateCaptions(uploadResult.imageId, flavorId);
    if ("error" in captionResult) {
      setErrorMsg(captionResult.error);
      setRunStage("error");
      return;
    }

    setCaptions(captionResult.captions);
    setExpandedSections({ upload: false, generate: true });
    setRunStage("done");
  }

  const canRun =
    flavorId !== null &&
    imageUrl.trim().length > 0 &&
    steps.length > 0 &&
    runStage !== "uploading" &&
    runStage !== "generating" &&
    runStage !== "loading-steps";

  const isRunning = runStage === "uploading" || runStage === "generating";

  const uploadState: StageState =
    runStage === "uploading" ? "active"
    : runStage === "generating" || runStage === "done" ? "done"
    : runStage === "error" && !uploadDetails ? "error"
    : "idle";

  const generateState: StageState =
    runStage === "generating" ? "active"
    : runStage === "done" ? "done"
    : runStage === "error" && uploadDetails ? "error"
    : "idle";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Test Runner</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Select a flavor, provide an image, and visualize the pipeline output.
        </p>
      </div>

      {/* ── Config ─────────────────────────────────────────── */}
      <section className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-5">
          {/* Flavor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Humor Flavor
            </label>
            <select
              value={flavorId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val) handleFlavorChange(Number(val));
              }}
              className="w-full max-w-sm rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">Select a flavor…</option>
              {flavors.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.slug}
                  {f.stepCount > 0
                    ? ` (${f.stepCount} step${f.stepCount !== 1 ? "s" : ""})`
                    : " — no steps"}
                </option>
              ))}
            </select>
            {runStage === "loading-steps" && (
              <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Spinner small /> Loading steps…
              </p>
            )}
            {steps.length > 0 && runStage !== "loading-steps" && (
              <p className="text-xs text-zinc-400">
                {steps.length} step{steps.length !== 1 ? "s" : ""} in this flavor
              </p>
            )}
          </div>

          {/* Image URL + preview side by side */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </div>

          {/* Run */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={!canRun}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isRunning ? (
                <>
                  <Spinner />
                  {runStage === "uploading" ? "Uploading…" : "Generating…"}
                </>
              ) : (
                <>
                  <PlayIcon />
                  Run pipeline
                </>
              )}
            </button>
            {runStage === "done" && (
              <span className="text-xs text-zinc-400">
                {captions.length} caption{captions.length !== 1 ? "s" : ""} generated
              </span>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
              <ErrorIcon />
              <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Two-column: image preview + pipeline ────────────── */}
      {(imageUrl || runStage !== "idle") && (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* Image preview */}
          {imageUrl && (
            <div className="shrink-0 lg:w-56">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Input image
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Input"
                className="w-full rounded-xl border border-zinc-200 object-cover shadow-sm dark:border-zinc-800"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              {uploadDetails && (
                <p className="mt-2 truncate text-[11px] text-zinc-400" title={uploadDetails.imageId}>
                  ID: {uploadDetails.imageId}
                </p>
              )}
            </div>
          )}

          {/* Pipeline stages */}
          {(runStage !== "idle" && runStage !== "loading-steps") && (
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Pipeline
              </p>

              {/* Stage 1: Upload */}
              <StageAccordion
                stageNumber={1}
                title="Upload & register image"
                state={uploadState}
                expanded={!!expandedSections["upload"]}
                onToggle={() => toggleSection("upload")}
              >
                {uploadDetails && (
                  <div className="flex flex-col gap-2">
                    <DetailRow label="Image ID" value={uploadDetails.imageId} mono />
                    <DetailRow label="CDN URL" value={uploadDetails.cdnUrl} mono truncate />
                  </div>
                )}
              </StageAccordion>

              {/* Stage 2: Generate captions */}
              <StageAccordion
                stageNumber={2}
                title="Generate captions"
                state={generateState}
                expanded={!!expandedSections["generate"]}
                onToggle={() => toggleSection("generate")}
              >
                <div className="flex flex-col gap-2">
                  {steps.map((step, i) => (
                    <StepRow
                      key={step.id}
                      index={i}
                      step={step}
                      isRunning={runStage === "generating"}
                      isDone={runStage === "done"}
                    />
                  ))}
                </div>
              </StageAccordion>
            </div>
          )}
        </div>
      )}

      {/* ── Captions ────────────────────────────────────────── */}
      {runStage === "done" && captions.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-baseline gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
              Generated captions
            </h2>
            <span className="text-xs text-zinc-300 dark:text-zinc-600">
              {captions.length} result{captions.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {captions.map((c, i) => (
              <CaptionCard key={c.id ?? i} caption={c} index={i} />
            ))}
          </div>
        </div>
      )}

      {runStage === "done" && captions.length === 0 && (
        <div className="mt-10 rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-400">The pipeline completed but returned no captions.</p>
        </div>
      )}
    </div>
  );
}

// ── Stage accordion ──────────────────────────────────────────

interface StageAccordionProps {
  stageNumber: number;
  title: string;
  state: StageState;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function StageAccordion({
  stageNumber,
  title,
  state,
  expanded,
  onToggle,
  children,
}: StageAccordionProps) {
  const hasContent = state === "done" || state === "error" || state === "active";

  return (
    <div
      className={[
        "rounded-xl border transition-colors",
        state === "active"
          ? "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900"
          : state === "done"
          ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          : state === "error"
          ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20"
          : "border-zinc-100 bg-zinc-50 opacity-40 dark:border-zinc-800 dark:bg-zinc-900/50",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={hasContent ? onToggle : undefined}
        disabled={!hasContent}
        className="flex w-full items-center gap-3 px-4 py-3 text-left disabled:cursor-default"
      >
        {/* Stage number bubble */}
        <span
          className={[
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            state === "done"
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : state === "active"
              ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
              : state === "error"
              ? "bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400"
              : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600",
          ].join(" ")}
        >
          {state === "done" ? <MiniCheckIcon /> : String(stageNumber)}
        </span>

        <span
          className={[
            "flex-1 text-sm font-medium",
            state === "idle"
              ? "text-zinc-400 dark:text-zinc-600"
              : "text-zinc-700 dark:text-zinc-300",
          ].join(" ")}
        >
          {title}
        </span>

        {state === "active" && <Spinner small />}
        {state === "done" && hasContent && (
          <ChevronIcon expanded={expanded} />
        )}
      </button>

      {expanded && hasContent && (
        <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Step row (inside generate accordion) ─────────────────────

interface StepRowProps {
  index: number;
  step: HumorFlavorStep;
  isRunning: boolean;
  isDone: boolean;
}

function StepRow({ index, step, isRunning, isDone }: StepRowProps) {
  const [open, setOpen] = useState(false);
  const hasPrompts = !!step.llmSystemPrompt || !!step.llmUserPrompt;

  return (
    <div className="rounded-lg border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
      <button
        type="button"
        onClick={() => hasPrompts && setOpen((v) => !v)}
        disabled={!hasPrompts}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left disabled:cursor-default"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
          {index + 1}
        </span>
        <span className="flex-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {step.description ?? `Step ${step.orderBy}`}
        </span>
        <span className="shrink-0">
          {isRunning ? (
            <Spinner small />
          ) : isDone ? (
            <MiniCheckIcon />
          ) : null}
        </span>
        {hasPrompts && <ChevronIcon expanded={open} />}
      </button>

      {open && hasPrompts && (
        <div className="flex flex-col gap-3 border-t border-zinc-100 px-3 py-3 dark:border-zinc-700">
          {step.llmSystemPrompt && (
            <PromptBlock label="System" content={step.llmSystemPrompt} />
          )}
          {step.llmUserPrompt && (
            <PromptBlock label="User" content={step.llmUserPrompt} />
          )}
        </div>
      )}
    </div>
  );
}

function PromptBlock({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <pre className="whitespace-pre-wrap rounded bg-white px-3 py-2 font-mono text-[11px] leading-relaxed text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
        {content}
      </pre>
    </div>
  );
}

// ── Detail row ────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
      <p
        className={[
          "text-xs text-zinc-600 dark:text-zinc-300",
          mono ? "font-mono" : "",
          truncate ? "truncate" : "break-all",
        ].join(" ")}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

// ── Caption card ──────────────────────────────────────────────

function CaptionCard({ caption, index }: { caption: Caption; index: number }) {
  const text = caption.caption ?? caption.text ?? null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {index + 1}
        </span>
        {caption.humor_flavor_id && (
          <span className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-[11px] text-zinc-400 dark:border-zinc-700">
            flavor {caption.humor_flavor_id}
          </span>
        )}
      </div>

      {text ? (
        <p className="whitespace-pre-wrap text-lg leading-relaxed text-zinc-900 dark:text-zinc-50">
          {text}
        </p>
      ) : (
        <pre className="whitespace-pre-wrap font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {JSON.stringify(caption, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ── Icons & spinner ───────────────────────────────────────────

function PlayIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.5 3.5a.5.5 0 0 1 .765-.424l6 3.5a.5.5 0 0 1 0 .848l-6 3.5A.5.5 0 0 1 5.5 10.5v-7z" />
    </svg>
  );
}

function MiniCheckIcon() {
  return (
    <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l2.5 2.5L10 3" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`size-3.5 shrink-0 text-zinc-400 transition-transform ${expanded ? "rotate-180" : ""}`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="mt-0.5 size-4 shrink-0 text-red-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.5M8 10.5v.5" strokeWidth="2" />
    </svg>
  );
}

function Spinner({ small }: { small?: boolean }) {
  return (
    <svg
      className={`animate-spin ${small ? "size-3" : "size-4"}`}
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
