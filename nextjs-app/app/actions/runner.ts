"use server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getFlavorSteps } from "@/lib/queries/flavors";
import { createClient } from "@/lib/supabase/server";
import { generatePresignedUrl, registerImageUrl, generateCaptions, extractCaptionText } from "@/lib/api/runPipeline";
import type { HumorFlavorStep } from "@/lib/schema";
import type { Caption } from "@/lib/api/runPipeline";

// ---------------------------------------------------------------------------
// Fetch steps for the runner
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
// Step 0 — Get presigned upload URL
// ---------------------------------------------------------------------------

export type GetPresignedUrlResult =
  | { presignedUrl: string; cdnUrl: string }
  | { error: string };

export async function runGetPresignedUrl(contentType: string): Promise<GetPresignedUrlResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { data: { session: authSession } } = await supabase.auth.getSession();
  if (!authSession?.access_token) return { error: "No active session" };

  try {
    return await generatePresignedUrl(contentType, authSession.access_token);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to get presigned URL" };
  }
}

// ---------------------------------------------------------------------------
// Step 1 — Register image URL
// ---------------------------------------------------------------------------

export type RegisterImageActionResult =
  | { imageId: string }
  | { error: string };

export async function runRegisterImage(imageUrl: string): Promise<RegisterImageActionResult> {
  const session = await requireAdmin();
  if (!session) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { data: { session: authSession } } = await supabase.auth.getSession();
  if (!authSession?.access_token) return { error: "No active session" };

  try {
    const { imageId } = await registerImageUrl(imageUrl, authSession.access_token);
    return { imageId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to register image" };
  }
}

// ---------------------------------------------------------------------------
// Step 2 — Generate captions
// ---------------------------------------------------------------------------

export type GenerateCaptionsResult =
  | { captions: string[]; raw: Caption[] }
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
    const raw = await generateCaptions(imageId, humorFlavorId, authSession.access_token);
    const captions = raw.map(extractCaptionText).filter((t): t is string => t !== null);
    return { captions, raw };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to generate captions" };
  }
}
