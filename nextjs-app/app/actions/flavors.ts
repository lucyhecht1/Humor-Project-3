"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { tables, cols } from "@/lib/schema";

export type FlavorActionResult = { error: string } | undefined;

export async function createFlavor(
  formData: FormData
): Promise<FlavorActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const slug = (formData.get("slug") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!slug) return { error: "Name is required" };

  const supabase = await createClient();
  const c = cols.humorFlavors;

  const { data, error } = await supabase
    .from(tables.humorFlavors)
    .insert({
      [c.slug]: slug,
      [c.description]: description,
      [c.createdByUserId]: session.userId,
    })
    .select(c.id)
    .single();

  if (error) return { error: error.message };

  revalidatePath("/flavors");
  redirect(`/flavors/${data.id}`);
}

export async function updateFlavor(
  id: number,
  formData: FormData
): Promise<FlavorActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const slug = (formData.get("slug") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!slug) return { error: "Name is required" };

  const supabase = await createClient();
  const c = cols.humorFlavors;

  const { error } = await supabase
    .from(tables.humorFlavors)
    .update({
      [c.slug]: slug,
      [c.description]: description,
      [c.modifiedByUserId]: session.userId,
      [c.modifiedAt]: new Date().toISOString(),
    })
    .eq(c.id, id);

  if (error) return { error: error.message };

  revalidatePath("/flavors");
  revalidatePath(`/flavors/${id}`);
}

export async function deleteFlavor(id: number): Promise<FlavorActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const supabase = await createClient();
  const c = cols.humorFlavors;

  const { error } = await supabase
    .from(tables.humorFlavors)
    .delete()
    .eq(c.id, id);

  if (error) return { error: error.message };

  revalidatePath("/flavors");
}

export async function duplicateFlavor(
  sourceId: number,
  newSlug: string
): Promise<FlavorActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const slug = newSlug.trim();
  if (!slug) return { error: "Name is required" };

  const supabase = await createClient();
  const cf = cols.humorFlavors;
  const cs = cols.humorFlavorSteps;

  // Fetch source flavor
  const { data: sourceFlavor, error: fetchFlavorErr } = await supabase
    .from(tables.humorFlavors)
    .select("*")
    .eq(cf.id, sourceId)
    .single();

  if (fetchFlavorErr || !sourceFlavor) return { error: "Source flavor not found" };

  // Fetch source steps
  const { data: sourceSteps, error: fetchStepsErr } = await supabase
    .from(tables.humorFlavorSteps)
    .select("*")
    .eq(cs.humorFlavorId, sourceId)
    .order(cs.orderBy, { ascending: true });

  if (fetchStepsErr) return { error: fetchStepsErr.message };

  // Insert new flavor
  const { data: newFlavor, error: insertFlavorErr } = await supabase
    .from(tables.humorFlavors)
    .insert({
      [cf.slug]: slug,
      [cf.description]: sourceFlavor.description,
      [cf.createdByUserId]: session.userId,
    })
    .select(cf.id)
    .single();

  if (insertFlavorErr || !newFlavor) return { error: insertFlavorErr?.message ?? "Failed to create flavor" };

  // Insert copied steps
  if (sourceSteps && sourceSteps.length > 0) {
    const stepRows = sourceSteps.map((s: Record<string, unknown>) => ({
      [cs.humorFlavorId]: newFlavor.id,
      [cs.orderBy]: s.order_by,
      [cs.llmTemperature]: s.llm_temperature,
      [cs.llmInputTypeId]: s.llm_input_type_id,
      [cs.llmOutputTypeId]: s.llm_output_type_id,
      [cs.llmModelId]: s.llm_model_id,
      [cs.humorFlavorStepTypeId]: s.humor_flavor_step_type_id,
      [cs.llmSystemPrompt]: s.llm_system_prompt,
      [cs.llmUserPrompt]: s.llm_user_prompt,
      [cs.description]: s.description,
      [cs.createdByUserId]: session.userId,
    }));

    const { error: insertStepsErr } = await supabase
      .from(tables.humorFlavorSteps)
      .insert(stepRows);

    if (insertStepsErr) return { error: insertStepsErr.message };
  }

  revalidatePath("/flavors");
  redirect(`/flavors/${newFlavor.id}`);
}
