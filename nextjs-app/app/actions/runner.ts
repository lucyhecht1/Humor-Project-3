"use server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getFlavorSteps } from "@/lib/queries/flavors";
import { createClient } from "@/lib/supabase/server";
import { uploadAndRegisterImage, generateCaptions } from "@/lib/api/runPipeline";
import type { HumorFlavorStep } from "@/lib/schema";
import type { Caption } from "@/lib/api/runPipeline";

// ---------------------------------------------------------------------------
// Fetch steps for the runner (reuses existing query)
// ---------------------------------------------------------------------------

export async function getStepsForRunner(
  flavorId: number
): Promise<HumorFlavorStep[] | { error: string }> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  try {
    return await getFlavorSteps(flavorId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to load steps" };
  }
}

// ---------------------------------------------------------------------------
// Stage 1: Upload image to S3 and register with the pipeline
// ---------------------------------------------------------------------------

export type PrepareImageResult =
  | { imageId: string; cdnUrl: string }
  | { error: string };

export async function prepareImage(imageUrl: string): Promise<PrepareImageResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { data: { session: authSession } } = await supabase.auth.getSession();
  if (!authSession?.access_token) return { error: "No active session" };

  try {
    const result = await uploadAndRegisterImage(imageUrl, authSession.access_token);
    return result;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to upload image" };
  }
}

// ---------------------------------------------------------------------------
// Stage 2: Generate captions for a registered image
// ---------------------------------------------------------------------------

export type GenerateCaptionsResult =
  | { captions: Caption[] }
  | { error: string };

export async function runGenerateCaptions(
  imageId: string,
  humorFlavorId: number
): Promise<GenerateCaptionsResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { data: { session: authSession } } = await supabase.auth.getSession();
  if (!authSession?.access_token) return { error: "No active session" };

  try {
    const captions = await generateCaptions(imageId, humorFlavorId, authSession.access_token);
    return { captions };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to generate captions" };
  }
}
