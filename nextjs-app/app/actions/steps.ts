"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { tables, cols } from "@/lib/schema";

export type StepActionResult = { error: string } | undefined;

export async function createStep(
  flavorId: number,
  formData: FormData
): Promise<StepActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const supabase = await createClient();
  const c = cols.humorFlavorSteps;

  const orderBy = Number(formData.get("orderBy"));
  const llmUserPrompt = (formData.get("llmUserPrompt") as string)?.trim() || null;
  const llmSystemPrompt =
    (formData.get("llmSystemPrompt") as string)?.trim() || null;

  if (!orderBy || orderBy < 1) return { error: "Step order must be a positive number" };

  const { error } = await supabase.from(tables.humorFlavorSteps).insert({
    [c.humorFlavorId]: flavorId,
    [c.orderBy]: orderBy,
    [c.llmUserPrompt]: llmUserPrompt,
    [c.llmSystemPrompt]: llmSystemPrompt,
    [c.createdByUserId]: session.userId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/flavors/${flavorId}`);
}

export async function updateStep(
  stepId: number,
  flavorId: number,
  formData: FormData
): Promise<StepActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const supabase = await createClient();
  const c = cols.humorFlavorSteps;

  const orderBy = Number(formData.get("orderBy"));
  const llmUserPrompt = (formData.get("llmUserPrompt") as string)?.trim() || null;
  const llmSystemPrompt =
    (formData.get("llmSystemPrompt") as string)?.trim() || null;

  if (!orderBy || orderBy < 1) return { error: "Step order must be a positive number" };

  const { error } = await supabase
    .from(tables.humorFlavorSteps)
    .update({
      [c.orderBy]: orderBy,
      [c.llmUserPrompt]: llmUserPrompt,
      [c.llmSystemPrompt]: llmSystemPrompt,
      [c.modifiedByUserId]: session.userId,
      [c.modifiedAt]: new Date().toISOString(),
    })
    .eq(c.id, stepId);

  if (error) return { error: error.message };

  revalidatePath(`/flavors/${flavorId}`);
}

export async function reorderStep(
  stepId: number,
  flavorId: number,
  direction: "up" | "down"
): Promise<StepActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const supabase = await createClient();
  const c = cols.humorFlavorSteps;

  // Fetch the current order for all steps in this flavor
  const { data, error: fetchError } = await supabase
    .from(tables.humorFlavorSteps)
    .select(`${c.id}, ${c.orderBy}`)
    .eq(c.humorFlavorId, flavorId)
    .order(c.orderBy, { ascending: true });

  if (fetchError) return { error: fetchError.message };

  // Supabase returns DB column names, not camelCase
  const rows = data as Array<{ id: number; order_by: number }>;

  const idx = rows.findIndex((r) => r.id === stepId);
  if (idx === -1) return { error: "Step not found" };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= rows.length) return; // already at boundary

  // Swap the two rows
  [rows[idx], rows[swapIdx]] = [rows[swapIdx], rows[idx]];

  // Reassign contiguous order values (1-based) and collect changed rows
  const updates: Array<{ id: number; newOrder: number }> = [];
  rows.forEach((row, i) => {
    const newOrder = i + 1;
    if (row.order_by !== newOrder) {
      updates.push({ id: row.id, newOrder });
    }
  });

  const results = await Promise.all(
    updates.map(({ id, newOrder }) =>
      supabase
        .from(tables.humorFlavorSteps)
        .update({ [c.orderBy]: newOrder })
        .eq(c.id, id)
    )
  );

  const firstError = results.find((r) => r.error)?.error;
  if (firstError) return { error: firstError.message };

  revalidatePath(`/flavors/${flavorId}`);
}

export async function deleteStep(
  stepId: number,
  flavorId: number
): Promise<StepActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const supabase = await createClient();
  const c = cols.humorFlavorSteps;

  const { error } = await supabase
    .from(tables.humorFlavorSteps)
    .delete()
    .eq(c.id, stepId);

  if (error) return { error: error.message };

  revalidatePath(`/flavors/${flavorId}`);
}
