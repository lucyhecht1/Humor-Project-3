import "server-only";

import { createClient } from "@/lib/supabase/server";

export type LlmInputType = {
  id: number;
  slug: string;
  description: string | null;
};

export type LlmOutputType = {
  id: number;
  slug: string;
  description: string | null;
};

export type LlmModel = {
  id: number;
  name: string;
};

// Fallbacks used when RLS blocks reads on these reference tables.
// Update if new types are added to the DB.
const INPUT_TYPE_FALLBACK: LlmInputType[] = [
  { id: 1, slug: "image-and-text", description: "Image and text input" },
  { id: 2, slug: "text-only", description: "Text only input" },
];

const OUTPUT_TYPE_FALLBACK: LlmOutputType[] = [
  { id: 1, slug: "string", description: "String" },
  { id: 2, slug: "array", description: "Array" },
];

export async function listInputTypes(): Promise<LlmInputType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("llm_input_types")
    .select("id, slug, description")
    .order("id", { ascending: true });
  if (error || !data?.length) return INPUT_TYPE_FALLBACK;
  return data as LlmInputType[];
}

export async function listOutputTypes(): Promise<LlmOutputType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("llm_output_types")
    .select("id, slug, description")
    .order("id", { ascending: true });
  if (error || !data?.length) return OUTPUT_TYPE_FALLBACK;
  return data as LlmOutputType[];
}

// Fallback used when RLS blocks reads on llm_models.
const MODEL_FALLBACK: LlmModel[] = [
  { id: 1, name: "GPT-4.1" },
  { id: 2, name: "GPT-4.1-mini" },
  { id: 3, name: "GPT-4.1-nano" },
  { id: 4, name: "GPT-4.5-preview" },
  { id: 5, name: "GPT-4o" },
  { id: 6, name: "GPT-4o-mini" },
  { id: 7, name: "o1" },
  { id: 8, name: "Grok-2-vision" },
  { id: 9, name: "Grok-3" },
  { id: 10, name: "Grok-4" },
  { id: 11, name: "Gemini 2.5 Pro (was 1.5 Pro)" },
  { id: 12, name: "Gemini 2.5 Flash (was 1.5 Flash)" },
  { id: 13, name: "Gemini 2.5 Pro" },
  { id: 14, name: "Gemini 2.5 Flash" },
  { id: 15, name: "Gemini 2.5 Flash Lite" },
  { id: 16, name: "GPT 5" },
  { id: 17, name: "GPT 5 Mini" },
  { id: 18, name: "GPT 5 Nano" },
  { id: 19, name: "OpenAI" },
  { id: 54, name: "Amdin model update" },
  { id: 80, name: "1" },
  { id: 86, name: "gpt-4.1" },
];

export async function listModels(): Promise<LlmModel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("llm_models")
    .select("id, name")
    .order("id", { ascending: true });
  if (error || !data?.length) return MODEL_FALLBACK;
  return data as LlmModel[];
}
