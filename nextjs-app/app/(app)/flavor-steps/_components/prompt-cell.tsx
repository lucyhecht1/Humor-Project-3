"use client";

import { useState } from "react";

export function PromptCell({ value }: { value: string | null }) {
  const [expanded, setExpanded] = useState(false);

  if (!value) {
    return (
      <td className="px-4 py-3">
        <span className="text-zinc-300 dark:text-zinc-600">null</span>
      </td>
    );
  }

  return (
    <td className="px-4 py-3 align-top">
      {expanded ? (
        <div className="w-64">
          <span className="block whitespace-pre-wrap break-words font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {value}
          </span>
          <button
            onClick={() => setExpanded(false)}
            className="mt-1 text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            collapse
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="block max-w-[120px] truncate font-mono text-xs text-zinc-400 dark:text-zinc-500">
            {value}
          </span>
          <button
            onClick={() => setExpanded(true)}
            className="shrink-0 text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            expand
          </button>
        </div>
      )}
    </td>
  );
}
