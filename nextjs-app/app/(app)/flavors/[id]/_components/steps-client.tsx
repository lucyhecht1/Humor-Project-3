"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { createStep, updateStep, deleteStep, reorderStep } from "@/app/actions/steps";
import type { HumorFlavor, HumorFlavorStep, HumorFlavorStepType } from "@/lib/schema";
import type { LlmInputType, LlmOutputType, LlmModel } from "@/lib/queries/llmTypes";

interface Props {
  flavor: HumorFlavor;
  steps: HumorFlavorStep[];
  stepTypes: HumorFlavorStepType[];
  inputTypes: LlmInputType[];
  outputTypes: LlmOutputType[];
  models: LlmModel[];
}

type DialogMode =
  | { type: "create" }
  | { type: "edit"; step: HumorFlavorStep }
  | { type: "delete"; step: HumorFlavorStep }
  | null;

export function StepsClient({ flavor, steps, stepTypes = [], inputTypes = [], outputTypes = [], models = [] }: Props) {
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [isReordering, startReorder] = useTransition();
  const [reorderingId, setReorderingId] = useState<number | null>(null);
  const close = () => setDialog(null);

  const nextOrder =
    steps.length > 0 ? Math.max(...steps.map((s) => s.orderBy)) + 1 : 1;

  function moveStep(stepId: number, direction: "up" | "down") {
    setReorderingId(stepId);
    startReorder(async () => {
      await reorderStep(stepId, flavor.id, direction);
      setReorderingId(null);
    });
  }

  return (
    <>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Steps
            {steps.length > 0 && (
              <span className="ml-2 text-sm font-normal text-zinc-400">
                {steps.length}
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            Executed in order when generating captions.
          </p>
        </div>
        <button
          onClick={() => setDialog({ type: "create" })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <PlusIcon />
          Add Step
        </button>
      </div>

      {/* ── Step list ───────────────────────────────────────── */}
      {steps.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 px-8 py-14 text-center dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <StepsEmptyIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No steps yet</p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Add steps to build the prompt chain for this flavor.
            </p>
          </div>
          <button
            onClick={() => setDialog({ type: "create" })}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <PlusIcon />
            Add the first step
          </button>
        </div>
      ) : (
        <ol className={["mt-5 flex flex-col gap-3", isReordering ? "opacity-60" : ""].join(" ")}>
          {steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              position={index + 1}
              isFirst={index === 0}
              isLast={index === steps.length - 1}
              isReordering={isReordering}
              isThisReordering={reorderingId === step.id}
              onMoveUp={() => moveStep(step.id, "up")}
              onMoveDown={() => moveStep(step.id, "down")}
              onEdit={() => setDialog({ type: "edit", step })}
              onDelete={() => setDialog({ type: "delete", step })}
            />
          ))}
        </ol>
      )}

      {/* ── Dialogs ─────────────────────────────────────────── */}
      {dialog?.type === "create" && (
        <StepFormDialog
          flavorId={flavor.id}
          defaultOrder={nextOrder}
          stepTypes={stepTypes}
          inputTypes={inputTypes}
          outputTypes={outputTypes}
          models={models}
          onClose={close}
        />
      )}
      {dialog?.type === "edit" && (
        <StepFormDialog
          flavorId={flavor.id}
          step={dialog.step}
          stepTypes={stepTypes}
          inputTypes={inputTypes}
          outputTypes={outputTypes}
          models={models}
          onClose={close}
        />
      )}
      {dialog?.type === "delete" && (
        <DeleteDialog step={dialog.step} flavorId={flavor.id} onClose={close} />
      )}
    </>
  );
}

// ── Step card ─────────────────────────────────────────────────

interface StepCardProps {
  step: HumorFlavorStep;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  isReordering: boolean;
  isThisReordering: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function StepCard({
  step,
  position,
  isFirst,
  isLast,
  isReordering,
  isThisReordering,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: StepCardProps) {
  return (
    <li className="group flex gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Reorder controls + position badge */}
      <div className="flex shrink-0 flex-col items-center gap-1">
        <button
          onClick={onMoveUp}
          disabled={isFirst || isReordering}
          aria-label="Move step up"
          className="rounded p-0.5 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <ChevronUpIcon />
        </button>

        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {isThisReordering ? <MiniSpinner /> : position}
        </div>

        <button
          onClick={onMoveDown}
          disabled={isLast || isReordering}
          aria-label="Move step down"
          className="rounded p-0.5 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <ChevronDownIcon />
        </button>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Step {step.orderBy}
            </p>
            {step.description && (
              <p className="mt-0.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {step.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <IconButton label="Edit step" onClick={onEdit}>
              <PencilIcon />
            </IconButton>
            <IconButton label="Delete step" variant="danger" onClick={onDelete}>
              <TrashIcon />
            </IconButton>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {step.llmSystemPrompt && (
            <PromptSection label="System prompt" content={step.llmSystemPrompt} />
          )}
          {step.llmUserPrompt && (
            <PromptSection label="Prompt template" content={step.llmUserPrompt} />
          )}
          {!step.llmSystemPrompt && !step.llmUserPrompt && (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">No prompts defined</span>
              <button
                onClick={onEdit}
                className="ml-auto text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Add prompts →
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function PromptSection({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <pre className="whitespace-pre-wrap rounded-lg bg-zinc-50 px-3.5 py-3 font-mono text-xs leading-relaxed text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
        {content}
      </pre>
    </div>
  );
}

// ── Create / Edit step dialog ─────────────────────────────────

interface StepFormDialogProps {
  flavorId: number;
  step?: HumorFlavorStep;
  defaultOrder?: number;
  stepTypes: HumorFlavorStepType[];
  inputTypes: LlmInputType[];
  outputTypes: LlmOutputType[];
  models: LlmModel[];
  onClose: () => void;
}

function StepFormDialog({
  flavorId,
  step,
  defaultOrder = 1,
  stepTypes,
  inputTypes,
  outputTypes,
  models,
  onClose,
}: StepFormDialogProps) {
  const isEdit = !!step;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateStep(step.id, flavorId, formData)
        : await createStep(flavorId, formData);

      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Dialog title={isEdit ? "Edit Step" : "Add Step"} onClose={onClose}>
      <form action={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Step order" required>
            <input
              ref={firstFieldRef}
              name="orderBy"
              type="number"
              min={1}
              required
              defaultValue={step?.orderBy ?? defaultOrder}
              className={inputCls}
            />
          </Field>

          <Field label="Step type">
            <select
              name="humorFlavorStepTypeId"
              defaultValue={step?.humorFlavorStepTypeId ?? ""}
              className={inputCls}
            >
              <option value="">— none —</option>
              {stepTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.slug}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Input type" required>
            <select
              name="llmInputTypeId"
              required
              defaultValue={step?.llmInputTypeId ?? ""}
              className={inputCls}
            >
              <option value="" disabled>Select…</option>
              {inputTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.slug} ({t.id})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Output type" required>
            <select
              name="llmOutputTypeId"
              required
              defaultValue={step?.llmOutputTypeId ?? ""}
              className={inputCls}
            >
              <option value="" disabled>Select…</option>
              {outputTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.slug} ({t.id})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Model" required>
            <select
              name="llmModelId"
              required
              defaultValue={step?.llmModelId ?? ""}
              className={inputCls}
            >
              <option value="" disabled>Select…</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id})
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="System prompt" hint="optional — sets model behavior">
          <textarea
            name="llmSystemPrompt"
            rows={3}
            defaultValue={step?.llmSystemPrompt ?? ""}
            placeholder="You are a humorous caption writer…"
            className={inputCls + " resize-y"}
          />
        </Field>

        <Field label="Prompt template" hint="llm_user_prompt">
          <textarea
            name="llmUserPrompt"
            rows={6}
            defaultValue={step?.llmUserPrompt ?? ""}
            placeholder="Write a caption for {{image_url}}…"
            className={inputCls + " resize-y font-mono text-xs"}
          />
        </Field>

        {error && <InlineError message={error} />}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={secondaryBtnCls}>
            Cancel
          </button>
          <button type="submit" disabled={isPending} className={primaryBtnCls}>
            {isPending ? <><Spinner />Saving…</> : isEdit ? "Save changes" : "Add step"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

// ── Delete confirmation dialog ────────────────────────────────

function DeleteDialog({
  step,
  flavorId,
  onClose,
}: {
  step: HumorFlavorStep;
  flavorId: number;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteStep(step.id, flavorId);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Dialog title="Delete Step" onClose={onClose}>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Delete{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-50">
          Step {step.orderBy}
        </span>
        {step.description && (
          <span className="text-zinc-500"> — {step.description}</span>
        )}
        {"? "}
        This cannot be undone.
      </p>

      {error && <InlineError message={error} />}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={secondaryBtnCls}>
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {isPending ? <><Spinner />Deleting…</> : "Delete"}
        </button>
      </div>
    </Dialog>
  );
}

// ── Shared Dialog shell ───────────────────────────────────────

function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Inline error banner ───────────────────────────────────────

function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 dark:border-red-900/40 dark:bg-red-950/30">
      <AlertIcon />
      <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
    </div>
  );
}

// ── Small reusables ───────────────────────────────────────────

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
        {hint && (
          <span className="ml-1.5 font-normal text-zinc-400">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

function IconButton({
  label,
  variant = "default",
  onClick,
  children,
}: {
  label: string;
  variant?: "default" | "danger";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={[
        "rounded-md p-1.5 transition-colors",
        variant === "danger"
          ? "text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800",
      ].join(" ")}
    >
      <span className="block size-3.5">{children}</span>
    </button>
  );
}

// ── Class constants ───────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:bg-zinc-800";

const primaryBtnCls =
  "inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200";

const secondaryBtnCls =
  "inline-flex items-center rounded-lg border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800";

// ── Icons ─────────────────────────────────────────────────────

function ChevronUpIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10l5-5 5 5" />
    </svg>
  );
}
function ChevronDownIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6l5 5 5-5" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 4h11M5.5 4V2.5h5V4M6.5 7v5M9.5 7v5M3.5 4l1 9.5h7l1-9.5" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg className="mt-0.5 size-4 shrink-0 text-red-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.5" strokeWidth="2" />
      <circle cx="8" cy="11" r="0.5" fill="currentColor" strokeWidth="0" />
    </svg>
  );
}
function StepsEmptyIcon() {
  return (
    <svg className="size-5 text-zinc-400 dark:text-zinc-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10M3 8h7M3 12h5" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="size-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function MiniSpinner() {
  return (
    <svg className="size-3 animate-spin" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
