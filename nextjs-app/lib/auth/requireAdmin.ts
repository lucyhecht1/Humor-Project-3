import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string | undefined;
  isSuperAdmin: boolean;
  isMatrixAdmin: boolean;
};

/**
 * Server-side auth guard. Call this in any Server Component or Server Action
 * that lives under a protected route.
 *
 * - Not logged in  → redirects to /login
 * - Not authorized → returns null  (caller should render "Not authorized")
 * - Authorized     → returns AdminSession
 *
 * Wrapped in React cache() so multiple calls in the same render tree
 * share a single Supabase round-trip.
 */
export const requireAdmin = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin, is_matrix_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin || !profile?.is_matrix_admin) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    isSuperAdmin: profile.is_superadmin ?? false,
    isMatrixAdmin: profile.is_matrix_admin ?? false,
  };
});
