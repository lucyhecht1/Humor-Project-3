/**
 * Schema mapping — single source of truth for table and column names.
 *
 * If the underlying DB schema changes (table rename, column rename),
 * update only this file. All queries import from here rather than
 * hard-coding strings.
 */

// ---------------------------------------------------------------------------
// Table names
// ---------------------------------------------------------------------------

export const tables = {
  humorFlavors: "humor_flavors",
  humorFlavorSteps: "humor_flavor_steps",
  humorThemes: "humor_themes",
  humorFlavorStepTypes: "humor_flavor_step_types",
} as const;

// ---------------------------------------------------------------------------
// Column names per table
// ---------------------------------------------------------------------------

export const cols = {
  humorFlavors: {
    id: "id",
    createdAt: "created_datetime_utc",
    description: "description",
    slug: "slug",
    createdByUserId: "created_by_user_id",
    modifiedByUserId: "modified_by_user_id",
    modifiedAt: "modified_datetime_utc",
  },

  humorFlavorSteps: {
    id: "id",
    createdAt: "created_datetime_utc",
    humorFlavorId: "humor_flavor_id",
    llmTemperature: "llm_temperature",
    orderBy: "order_by",
    llmInputTypeId: "llm_input_type_id",
    llmOutputTypeId: "llm_output_type_id",
    llmModelId: "llm_model_id",
    humorFlavorStepTypeId: "humor_flavor_step_type_id",
    llmSystemPrompt: "llm_system_prompt",
    llmUserPrompt: "llm_user_prompt",
    description: "description",
    createdByUserId: "created_by_user_id",
    modifiedByUserId: "modified_by_user_id",
    modifiedAt: "modified_datetime_utc",
  },

  humorThemes: {
    id: "id",
    createdAt: "created_datetime_utc",
    name: "name",
    description: "description",
    createdByUserId: "created_by_user_id",
    modifiedByUserId: "modified_by_user_id",
    modifiedAt: "modified_datetime_utc",
  },

  humorFlavorStepTypes: {
    id: "id",
    createdAt: "created_at",
    slug: "slug",
    description: "description",
    createdByUserId: "created_by_user_id",
    modifiedByUserId: "modified_by_user_id",
    createdDatetimeUtc: "created_datetime_utc",
    modifiedAt: "modified_datetime_utc",
  },
} as const;

// ---------------------------------------------------------------------------
// Row types — shape returned directly by Supabase (DB column names)
// ---------------------------------------------------------------------------

export type HumorFlavorRow = {
  id: number;
  created_datetime_utc: string;
  description: string;
  slug: string;
  created_by_user_id: string;
  modified_by_user_id: string | null;
  modified_datetime_utc: string | null;
};

export type HumorFlavorStepRow = {
  id: number;
  created_datetime_utc: string;
  humor_flavor_id: number;
  llm_temperature: number | null;
  order_by: number;
  llm_input_type_id: number | null;
  llm_output_type_id: number | null;
  llm_model_id: number | null;
  humor_flavor_step_type_id: number | null;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  description: string | null;
  created_by_user_id: string;
  modified_by_user_id: string | null;
  modified_datetime_utc: string | null;
};

export type HumorThemeRow = {
  id: number;
  created_datetime_utc: string;
  name: string;
  description: string | null;
  created_by_user_id: string;
  modified_by_user_id: string | null;
  modified_datetime_utc: string | null;
};

export type HumorFlavorStepTypeRow = {
  id: number;
  created_at: string;
  slug: string;
  description: string | null;
  created_by_user_id: string | null;
  modified_by_user_id: string | null;
  created_datetime_utc: string | null;
  modified_datetime_utc: string | null;
};

// ---------------------------------------------------------------------------
// Logical model types — camelCase, used throughout the app
// ---------------------------------------------------------------------------

export type HumorFlavor = {
  id: number;
  createdAt: string;
  description: string;
  slug: string;
  createdByUserId: string;
  modifiedByUserId: string | null;
  modifiedAt: string | null;
};

export type HumorFlavorStep = {
  id: number;
  createdAt: string;
  humorFlavorId: number;
  llmTemperature: number | null;
  orderBy: number;
  llmInputTypeId: number | null;
  llmOutputTypeId: number | null;
  llmModelId: number | null;
  humorFlavorStepTypeId: number | null;
  llmSystemPrompt: string | null;
  llmUserPrompt: string | null;
  description: string | null;
  createdByUserId: string;
  modifiedByUserId: string | null;
  modifiedAt: string | null;
};

export type HumorTheme = {
  id: number;
  createdAt: string;
  name: string;
  description: string | null;
  createdByUserId: string;
  modifiedByUserId: string | null;
  modifiedAt: string | null;
};

export type HumorFlavorStepType = {
  id: number;
  createdAt: string;
  slug: string;
  description: string | null;
  createdByUserId: string | null;
  modifiedByUserId: string | null;
  modifiedAt: string | null;
};

// ---------------------------------------------------------------------------
// Mappers — DB row → logical model
// ---------------------------------------------------------------------------

export function toHumorFlavor(row: HumorFlavorRow): HumorFlavor {
  return {
    id: row.id,
    createdAt: row.created_datetime_utc,
    description: row.description,
    slug: row.slug,
    createdByUserId: row.created_by_user_id,
    modifiedByUserId: row.modified_by_user_id,
    modifiedAt: row.modified_datetime_utc,
  };
}

export function toHumorFlavorStep(row: HumorFlavorStepRow): HumorFlavorStep {
  return {
    id: row.id,
    createdAt: row.created_datetime_utc,
    humorFlavorId: row.humor_flavor_id,
    llmTemperature: row.llm_temperature,
    orderBy: row.order_by,
    llmInputTypeId: row.llm_input_type_id,
    llmOutputTypeId: row.llm_output_type_id,
    llmModelId: row.llm_model_id,
    humorFlavorStepTypeId: row.humor_flavor_step_type_id,
    llmSystemPrompt: row.llm_system_prompt,
    llmUserPrompt: row.llm_user_prompt,
    description: row.description,
    createdByUserId: row.created_by_user_id,
    modifiedByUserId: row.modified_by_user_id,
    modifiedAt: row.modified_datetime_utc,
  };
}

export function toHumorTheme(row: HumorThemeRow): HumorTheme {
  return {
    id: row.id,
    createdAt: row.created_datetime_utc,
    name: row.name,
    description: row.description,
    createdByUserId: row.created_by_user_id,
    modifiedByUserId: row.modified_by_user_id,
    modifiedAt: row.modified_datetime_utc,
  };
}

export function toHumorFlavorStepType(
  row: HumorFlavorStepTypeRow
): HumorFlavorStepType {
  return {
    id: row.id,
    createdAt: row.created_at,
    slug: row.slug,
    description: row.description,
    createdByUserId: row.created_by_user_id,
    modifiedByUserId: row.modified_by_user_id,
    modifiedAt: row.modified_datetime_utc,
  };
}
