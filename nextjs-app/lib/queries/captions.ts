import "server-only";

import { createClient } from "@/lib/supabase/server";

export type CaptionRow = {
  id: string;
  content: string | null;
  createdAt: string;
  imageId: string | null;
  imageUrl: string | null;
  humorFlavorId: number | null;
  flavorSlug: string | null;
};

export type PaginatedCaptions = {
  captions: CaptionRow[];
  total: number;
};

export async function listCaptions(
  page = 1,
  pageSize = 50
): Promise<PaginatedCaptions> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("captions")
    .select(
      "id, content, created_datetime_utc, image_id, humor_flavor_id, images(url), humor_flavors(slug)",
      { count: "exact" }
    )
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const captions: CaptionRow[] = (data ?? []).map((row) => {
    const img = row.images as unknown as { url: string } | null;
    const flavor = row.humor_flavors as unknown as { slug: string } | null;
    return {
      id: row.id,
      content: row.content ?? null,
      createdAt: row.created_datetime_utc,
      imageId: row.image_id ?? null,
      imageUrl: img?.url ?? null,
      humorFlavorId: row.humor_flavor_id ?? null,
      flavorSlug: flavor?.slug ?? null,
    };
  });

  return { captions, total: count ?? 0 };
}

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
    const img = (row.images as unknown) as { id: string; url: string } | null;
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
