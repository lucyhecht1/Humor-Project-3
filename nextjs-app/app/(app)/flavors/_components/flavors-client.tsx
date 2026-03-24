"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  createFlavor,
  updateFlavor,
  deleteFlavor,
} from "@/app/actions/flavors";
import type { HumorFlavorSummary } from "@/lib/queries/flavors";
import type { HumorFlavor } from "@/lib/schema";

interface Props {
  flavors: HumorFlavorSummary[];
}

type DialogMode =
  | { type: "create" }
  | { type: "edit"; flavor: HumorFlavor }
  | { type: "delete"; flavor: HumorFlavor }
  | null;

export function FlavorsClient({ flavors }: Props) {
  const [dialog, setDialog] = useState<DialogMode>(null);
  const close = () => setDialog(null);

  return (
    <>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Flavors
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Prompt chains that define how captions are generated.
          </p>
        </div>
        <button
          onClick={() => setDialog({ type: "create" })}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <PlusIcon />
          New Flavor
        </button>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      {flavors.length === 0 ? (
        <EmptyState
          title="No flavors yet"
          description="Create a flavor to define a prompt chain for generating captions."
          action={
            <button
              onClick={() => setDialog({ type: "create" })}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <PlusIcon />
              Create your first flavor
            </button>
          }
        />
      ) : (
        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Description</th>
              <th className="pb-3 pr-4 text-right">Steps</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {flavors.map((f) => (
              <tr key={f.id} className="group">
                <td className="py-3.5 pr-4">
                  <Link
                    href={`/flavors/${f.id}`}
                    className="font-mono font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    {f.slug}
                  </Link>
                </td>
                <td className="py-3.5 pr-4 text-zinc-500 dark:text-zinc-400">
                  <span className="line-clamp-1 max-w-sm">
                    {f.description ?? <span className="italic text-zinc-300 dark:text-zinc-600">No description</span>}
                  </span>
                </td>
                <td className="py-3.5 pr-4 text-right tabular-nums text-zinc-400">
                  {f.stepCount === 0 ? (
                    <span className="text-zinc-300 dark:text-zinc-600">—</span>
                  ) : (
                    f.stepCount
                  )}
                </td>
                <td className="py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <IconButton
                      label="Edit"
                      onClick={() => setDialog({ type: "edit", flavor: f })}
                    >
                      <PencilIcon />
                    </IconButton>
                    <IconButton
                      label="Delete"
                      variant="danger"
                      onClick={() => setDialog({ type: "delete", flavor: f })}
                    >
                      <TrashIcon />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Dialogs ─────────────────────────────────────────── */}
      {dialog?.type === "create" && <FlavorFormDialog onClose={close} />}
      {dialog?.type === "edit" && (
        <FlavorFormDialog flavor={dialog.flavor} onClose={close} />
      )}
      {dialog?.type === "delete" && (
        <DeleteDialog flavor={dialog.flavor} onClose={close} />
      )}
    </>
  );
}

// ── Create / Edit dialog ─────────────────────────────────────

interface FlavorFormDialogProps {
  flavor?: HumorFlavor;
  onClose: () => void;
}

function FlavorFormDialog({ flavor, onClose }: FlavorFormDialogProps) {
  const isEdit = !!flavor;
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
        ? await updateFlavor(flavor.id, formData)
        : await createFlavor(formData);

      if (result?.error) {
        setError(result.error);
      } else if (isEdit) {
        onClose();
      }
    });
  }

  return (
    <Dialog title={isEdit ? "Edit Flavor" : "New Flavor"} onClose={onClose}>
      <form action={handleSubmit} className="flex flex-col gap-4">
        <Field label="Name" hint="Used as the slug identifier" required>
          <input
            ref={firstFieldRef}
            name="slug"
            type="text"
            required
            defaultValue={flavor?.slug ?? ""}
            placeholder="e.g. dry-wit"
            className={inputCls}
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            rows={3}
            defaultValue={flavor?.description ?? ""}
            placeholder="What makes this flavor distinct?"
            className={inputCls + " resize-none"}
          />
        </Field>

        {error && <InlineError message={error} />}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={secondaryBtnCls}>
            Cancel
          </button>
          <button type="submit" disabled={isPending} className={primaryBtnCls}>
            {isPending ? <><Spinner />Saving…</> : isEdit ? "Save changes" : "Create flavor"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

// ── Delete confirmation dialog ────────────────────────────────

function DeleteDialog({
  flavor,
  onClose,
}: {
  flavor: HumorFlavor;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteFlavor(flavor.id);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Dialog title="Delete Flavor" onClose={onClose}>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Delete{" "}
        <span className="font-mono font-medium text-zinc-900 dark:text-zinc-50">
          {flavor.slug}
        </span>
        {"? "}
        This will also delete all its steps and cannot be undone.
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
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
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

// ── Empty state ───────────────────────────────────────────────

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-12 flex flex-col items-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <EmptyIcon />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">{description}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
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

// ── Small reusable pieces ─────────────────────────────────────

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
function EmptyIcon() {
  return (
    <svg className="size-5 text-zinc-400 dark:text-zinc-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <path d="M5 6h6M5 9h4" />
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
