import { requireAdmin } from "@/lib/auth/requireAdmin";
import { Shell } from "./_components/shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <svg className="size-5 text-zinc-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="6" r="2.5" />
              <path d="M2.5 14c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" />
              <path d="M12 1l1 1-5 5-2-2 1-1 1 1 4-4z" strokeWidth="1" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Access denied</p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Your account doesn&apos;t have permission to access this tool.
            </p>
          </div>
          <a
            href="/login"
            className="text-sm font-medium text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            Sign in with a different account
          </a>
        </div>
      </div>
    );
  }

  return <Shell email={session.email}>{children}</Shell>;
}
