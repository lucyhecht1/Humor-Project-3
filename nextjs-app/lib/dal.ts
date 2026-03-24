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
 * Verifies the current user is authenticated AND is either a superadmin
 * or matrix admin (profiles.is_superadmin OR profiles.is_matrix_admin).
 *
 * Redirects to /login if not authenticated or not authorized.
 * Use this in every Server Component and Server Action that requires access.
 */
export const verifyAdmin = cache(async (): Promise<AdminSession> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_superadmin, is_matrix_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/login");
  }

  if (!profile.is_superadmin && !profile.is_matrix_admin) {
    redirect("/unauthorized");
  }

  return {
    userId: user.id,
    email: user.email,
    isSuperAdmin: profile.is_superadmin ?? false,
    isMatrixAdmin: profile.is_matrix_admin ?? false,
  };
});
