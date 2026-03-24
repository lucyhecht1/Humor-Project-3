"use client";

import { useState } from "react";
import { StepsClient } from "./steps-client";
import type { HumorFlavor, HumorFlavorStep, HumorFlavorStepType } from "@/lib/schema";
import type { LlmInputType, LlmOutputType, LlmModel } from "@/lib/queries/llmTypes";
import type { ImageWithCaptions } from "@/lib/queries/captions";

interface Props {
  flavor: HumorFlavor;
  steps: HumorFlavorStep[];
  stepTypes: HumorFlavorStepType[];
  inputTypes: LlmInputType[];
  outputTypes: LlmOutputType[];
  models: LlmModel[];
  captionsData: ImageWithCaptions[];
}

type Tab = "steps" | "captions";

export function FlavorDetailTabs({
  flavor,
  steps,
  stepTypes,
  inputTypes,
  outputTypes,
  models,
  captionsData,
}: Props) {
  const [tab, setTab] = useState<Tab>("steps");

  return (
    <div className="mt-6">
      {/* ── Tab bar ───────────────────────────────────────── */}
      <div className="flex gap-0 border-b border-zinc-200 dark:border-zinc-800">
        <TabButton active={tab === "steps"} onClick={() => setTab("steps")}>
          Steps
        </TabButton>
        <TabButton active={tab === "captions"} onClick={() => setTab("captions")}>
          Captions
          {captionsData.length > 0 && (
            <span className="ml-2 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {captionsData.reduce((n, img) => n + img.captions.length, 0)}
            </span>
          )}
        </TabButton>
      </div>

      {/* ── Tab content ───────────────────────────────────── */}
      {tab === "steps" && (
        <div className="mt-6">
          <StepsClient
            flavor={flavor}
            steps={steps}
            stepTypes={stepTypes}
            inputTypes={inputTypes}
            outputTypes={outputTypes}
            models={models}
          />
        </div>
      )}

      {tab === "captions" && (
        <div className="mt-6">
          <CaptionsView data={captionsData} />
        </div>
      )}
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
          : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ── Captions view ─────────────────────────────────────────────

function CaptionsView({ data }: { data: ImageWithCaptions[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-sm text-zinc-400">No captions generated for this flavor yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {data.map((img) => (
        <ImageCaptionCard key={img.imageId} img={img} />
      ))}
    </div>
  );
}

function ImageCaptionCard({ img }: { img: ImageWithCaptions }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-0 sm:flex-row">
        {/* Image */}
        <div className="shrink-0 sm:w-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.imageUrl}
            alt=""
            className="h-48 w-full object-cover sm:h-full sm:rounded-none"
          />
        </div>

        {/* Captions */}
        <div className="min-w-0 flex-1 divide-y divide-zinc-100 dark:divide-zinc-800">
          {img.captions.map((c, i) => (
            <div key={c.id} className="flex gap-3 px-4 py-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
