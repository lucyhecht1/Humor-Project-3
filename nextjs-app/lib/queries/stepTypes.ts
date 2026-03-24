import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  tables,
  cols,
  toHumorFlavorStepType,
  type HumorFlavorStepType,
  type HumorFlavorStepTypeRow,
} from "@/lib/schema";

export async function listStepTypes(): Promise<HumorFlavorStepType[]> {
  const supabase = await createClient();
  const c = cols.humorFlavorStepTypes;

  const { data, error } = await supabase
    .from(tables.humorFlavorStepTypes)
    .select(`${c.id}, ${c.slug}, ${c.description}, ${c.createdAt}`)
    .order(c.slug, { ascending: true });

  if (error) throw new Error(error.message);
  return (data as HumorFlavorStepTypeRow[]).map(toHumorFlavorStepType);
}
