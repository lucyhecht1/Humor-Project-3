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
