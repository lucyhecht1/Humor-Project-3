import "server-only";

/**
 * lib/api/runPipeline.ts
 *
 * Two-step caption pipeline against https://api.almostcrackd.ai:
 *
 *   1. registerImageUrl  — POST /pipeline/upload-image-from-url
 *                          Body: { imageUrl, isCommonUse: false }
 *                          Returns: { imageId }
 *
 *   2. generateCaptions  — POST /pipeline/generate-captions
 *                          Body: { imageId, humorFlavorId? }
 *                          Returns: array of caption objects
 *
 * Auth: Bearer <supabase_access_token> on every request.
 */

const BASE_URL = "https://api.almostcrackd.ai";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Caption record returned by POST /pipeline/generate-captions. */
export type Caption = {
  id?: string;
  content?: string;  // primary field
  caption?: string;
  text?: string;
  humor_flavor_id?: number;
  image_id?: string;
  created_at?: string;
  [key: string]: unknown;
};

export interface RegisterImageResult {
  imageId: string;
  now: number;
}

export interface RunPipelineResult {
  imageId: string;
  captions: string[];
  raw: Caption[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class PipelineError extends Error {
  constructor(public readonly stage: string, message: string) {
    super(`[${stage}] ${message}`);
    this.name = "PipelineError";
  }
}

async function post<T>(path: string, body: unknown, accessToken: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    redirect: "manual",
  });

  if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) {
    const location = res.headers.get("location") ?? "(no location)";
    throw new Error(`Unexpected redirect to ${location} — check BASE_URL`);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${detail}`);
  }

  return res.json() as Promise<T>;
}

/** Extracts the caption string from an API response object, handling shape variations. */
export function extractCaptionText(c: Caption): string | null {
  return c.content ?? c.caption ?? c.text ?? null;
}

// ---------------------------------------------------------------------------
// Step 1 — Register image URL
// ---------------------------------------------------------------------------

export async function registerImageUrl(
  imageUrl: string,
  accessToken: string
): Promise<RegisterImageResult> {
  try {
    return await post<RegisterImageResult>(
      "/pipeline/upload-image-from-url",
      { imageUrl, isCommonUse: false },
      accessToken
    );
  } catch (e) {
    throw new PipelineError(
      "upload-image-from-url",
      e instanceof Error ? e.message : String(e)
    );
  }
}

// ---------------------------------------------------------------------------
// Step 2 — Generate captions
// ---------------------------------------------------------------------------

export async function generateCaptions(
  imageId: string,
  humorFlavorId: number,
  accessToken: string
): Promise<Caption[]> {
  try {
    return await post<Caption[]>(
      "/pipeline/generate-captions",
      { imageId, humorFlavorId },
      accessToken
    );
  } catch (e) {
    throw new PipelineError(
      "generate-captions",
      e instanceof Error ? e.message : String(e)
    );
  }
}

// ---------------------------------------------------------------------------
// All-in-one convenience wrapper
// ---------------------------------------------------------------------------

export async function runPipeline(input: {
  imageUrl: string;
  humorFlavorId: number;
  accessToken: string;
}): Promise<RunPipelineResult> {
  const { imageUrl, humorFlavorId, accessToken } = input;

  const { imageId } = await registerImageUrl(imageUrl, accessToken);
  const raw = await generateCaptions(imageId, humorFlavorId, accessToken);
  const captions = raw.map(extractCaptionText).filter((t): t is string => t !== null);

  return { imageId, captions, raw };
}
