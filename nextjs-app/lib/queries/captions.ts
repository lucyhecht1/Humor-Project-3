import "server-only";

import { createClient } from "@/lib/supabase/server";

export type CaptionEntry = {
  id: string;
  content: string;
  createdAt: string;
};

export type ImageWithCaptions = {
  imageId: string;
  imageUrl: string;
  captions: CaptionEntry[];
};

export async function getCaptionsForFlavor(
  flavorId: number
): Promise<ImageWithCaptions[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("captions")
    .select("id, content, created_datetime_utc, image_id, images(id, url)")
    .eq("humor_flavor_id", flavorId)
    .order("created_datetime_utc", { ascending: false });

  if (error) throw new Error(error.message);

  const map = new Map<string, ImageWithCaptions>();

  for (const row of data ?? []) {
    const img = row.images as { id: string; url: string } | null;
    if (!img?.url) continue;

    if (!map.has(img.id)) {
      map.set(img.id, { imageId: img.id, imageUrl: img.url, captions: [] });
    }
    map.get(img.id)!.captions.push({
      id: row.id,
      content: row.content ?? "",
      createdAt: row.created_datetime_utc,
    });
  }

  return Array.from(map.values());
}
