import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  tables,
  cols,
  toHumorFlavor,
  toHumorFlavorStep,
  type HumorFlavor,
  type HumorFlavorStep,
  type HumorFlavorRow,
  type HumorFlavorStepRow,
} from "@/lib/schema";

// HumorFlavor extended with a pre-computed step count from the list query
export type HumorFlavorSummary = HumorFlavor & { stepCount: number };

type HumorFlavorWithCountRow = HumorFlavorRow & {
  // Supabase returns embedded counts as [{ count: number }]
  humor_flavor_steps: Array<{ count: number }>;
};

export async function listFlavors(): Promise<HumorFlavorSummary[]> {
  const supabase = await createClient();
  const c = cols.humorFlavors;

  const { data, error } = await supabase
    .from(tables.humorFlavors)
    .select(`*, ${tables.humorFlavorSteps}(count)`)
    .order(c.createdAt, { ascending: false });

  if (error) throw new Error(error.message);

  return (data as HumorFlavorWithCountRow[]).map((row) => ({
    ...toHumorFlavor(row),
    stepCount: row.humor_flavor_steps?.[0]?.count ?? 0,
  }));
}

export async function getFlavor(id: number): Promise<HumorFlavor | null> {
  const supabase = await createClient();
  const c = cols.humorFlavors;

  const { data, error } = await supabase
    .from(tables.humorFlavors)
    .select("*")
    .eq(c.id, id)
    .single();

  if (error) return null;
  return toHumorFlavor(data as HumorFlavorRow);
}

// Step row returned when fetching all steps with the parent flavor's slug
type StepWithFlavorRow = HumorFlavorStepRow & {
  humor_flavors: { slug: string } | null;
};

export type HumorFlavorStepWithFlavor = HumorFlavorStep & {
  flavorSlug: string | null;
};

export type PaginatedSteps = {
  steps: HumorFlavorStepWithFlavor[];
  total: number;
};

export async function listAllSteps(
  page = 1,
  pageSize = 50
): Promise<PaginatedSteps> {
  const supabase = await createClient();
  const c = cols.humorFlavorSteps;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from(tables.humorFlavorSteps)
    .select(`*, ${tables.humorFlavors}(${cols.humorFlavors.slug})`, { count: "exact" })
    .order(c.humorFlavorId, { ascending: true })
    .order(c.orderBy, { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    steps: (data as StepWithFlavorRow[]).map((row) => ({
      ...toHumorFlavorStep(row),
      flavorSlug: row.humor_flavors?.slug ?? null,
    })),
    total: count ?? 0,
  };
}

export async function getFlavorSteps(
  flavorId: number
): Promise<HumorFlavorStep[]> {
  const supabase = await createClient();
  const c = cols.humorFlavorSteps;

  const { data, error } = await supabase
    .from(tables.humorFlavorSteps)
    .select("*")
    .eq(c.humorFlavorId, flavorId)
    .order(c.orderBy, { ascending: true });

  if (error) throw new Error(error.message);
  return (data as HumorFlavorStepRow[]).map(toHumorFlavorStep);
}
