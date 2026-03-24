import { verifyAdmin } from "@/lib/dal";
import { logout } from "@/app/actions/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative check: redirects to /login if unauthenticated or not admin
  const session = await verifyAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {session.email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
