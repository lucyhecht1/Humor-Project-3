import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  tables,
  cols,
  toHumorTheme,
  type HumorTheme,
  type HumorThemeRow,
} from "@/lib/schema";

export async function listThemes(): Promise<HumorTheme[]> {
  const supabase = await createClient();
  const c = cols.humorThemes;

  const { data, error } = await supabase
    .from(tables.humorThemes)
    .select(`${c.id}, ${c.name}, ${c.description}, ${c.createdAt}, ${c.modifiedAt}`)
    .order(c.name, { ascending: true });

  if (error) throw new Error(error.message);
  return (data as HumorThemeRow[]).map(toHumorTheme);
}

export async function getTheme(id: number): Promise<HumorTheme | null> {
  const supabase = await createClient();
  const c = cols.humorThemes;

  const { data, error } = await supabase
    .from(tables.humorThemes)
    .select("*")
    .eq(c.id, id)
    .single();

  if (error) return null;
  return toHumorTheme(data as HumorThemeRow);
}
