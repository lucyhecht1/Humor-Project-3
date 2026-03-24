import "server-only";

/**
 * lib/api/runPipeline.ts
 *
 * Helper for the almostcrackd.ai caption pipeline API.
 *
 * Pipeline flow:
 *   1. generatePresignedUrl  — get an S3 upload target + CDN URL
 *   2. uploadImageBytes      — PUT image bytes directly to S3
 *   3. registerImageUrl      — register CDN URL, receive imageId
 *   4. generateCaptions      — run the humor pipeline, receive captions
 *
 * Functions are exported individually so server actions can call stages
 * one at a time and show progress in the UI. `runPipeline` is the
 * all-in-one convenience wrapper.
 */

const BASE_URL = "https://api.almostcrackd.ai";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Caption record returned by POST /pipeline/generate-captions. */
export type Caption = {
  id?: string;
  caption?: string;
  text?: string;
  humor_flavor_id?: number;
  image_id?: string;
  created_at?: string;
  [key: string]: unknown; // API shape not fully documented; keep it open
};

export interface PresignedUrlResult {
  presignedUrl: string;
  cdnUrl: string;
}

export interface RegisterImageResult {
  imageId: string;
  now: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

class PipelineError extends Error {
  constructor(
    public readonly stage: string,
    message: string
  ) {
    super(`[${stage}] ${message}`);
    this.name = "PipelineError";
  }
}

async function post<T>(
  path: string,
  body: unknown,
  accessToken: string
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${detail}`);
  }

  return res.json() as Promise<T>;
}

function guessContentType(url: string): string {
  const path = url.split("?")[0].toLowerCase();
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".gif")) return "image/gif";
  if (path.endsWith(".heic")) return "image/heic";
  return "image/jpeg";
}

// ---------------------------------------------------------------------------
// Stage 1 + 2: Get presigned URL, fetch image, upload to S3
// ---------------------------------------------------------------------------

/**
 * Fetches a presigned S3 upload URL and CDN URL from the API, then
 * fetches the source image and uploads the bytes directly to S3.
 *
 * Returns the cdnUrl to pass to registerImageUrl.
 */
export async function uploadAndRegisterImage(
  imageUrl: string,
  accessToken: string
): Promise<{ imageId: string; cdnUrl: string }> {
  // 1. Get presigned URL
  const contentType = guessContentType(imageUrl);
  let presignedUrl: string;
  let cdnUrl: string;

  try {
    const result = await post<PresignedUrlResult>(
      "/pipeline/generate-presigned-url",
      { contentType },
      accessToken
    );
    presignedUrl = result.presignedUrl;
    cdnUrl = result.cdnUrl;
  } catch (e) {
    throw new PipelineError(
      "generate-presigned-url",
      e instanceof Error ? e.message : String(e)
    );
  }

  // 2. Fetch the source image bytes
  let imageBytes: ArrayBuffer;
  let actualContentType = contentType;

  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      throw new Error(`HTTP ${imgRes.status}`);
    }
    imageBytes = await imgRes.arrayBuffer();
    actualContentType =
      imgRes.headers.get("content-type")?.split(";")[0].trim() ?? contentType;
  } catch (e) {
    throw new PipelineError(
      "fetch-image",
      `Could not fetch image from URL: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  // 3. PUT bytes to S3 presigned URL
  try {
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": actualContentType },
      body: imageBytes,
    });
    if (!uploadRes.ok) {
      throw new Error(`HTTP ${uploadRes.status}`);
    }
  } catch (e) {
    throw new PipelineError(
      "upload-to-s3",
      e instanceof Error ? e.message : String(e)
    );
  }

  // 4. Register CDN URL with the pipeline
  let imageId: string;

  try {
    const result = await post<RegisterImageResult>(
      "/pipeline/upload-image-from-url",
      { imageUrl: cdnUrl, isCommonUse: false },
      accessToken
    );
    imageId = result.imageId;
  } catch (e) {
    throw new PipelineError(
      "upload-image-from-url",
      e instanceof Error ? e.message : String(e)
    );
  }

  return { imageId, cdnUrl };
}

// ---------------------------------------------------------------------------
// Stage 2: Generate captions
// ---------------------------------------------------------------------------

/**
 * Calls POST /pipeline/generate-captions with the registered imageId
 * and a specific humorFlavorId.
 */
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

export interface RunPipelineResult {
  imageId: string;
  cdnUrl: string;
  captions: Caption[];
}

export async function runPipeline(input: {
  imageUrl: string;
  humorFlavorId: number;
  accessToken: string;
}): Promise<RunPipelineResult> {
  const { imageUrl, humorFlavorId, accessToken } = input;

  const { imageId, cdnUrl } = await uploadAndRegisterImage(imageUrl, accessToken);
  const captions = await generateCaptions(imageId, humorFlavorId, accessToken);

  return { imageId, cdnUrl, captions };
}
