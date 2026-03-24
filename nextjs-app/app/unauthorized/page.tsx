export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Access denied
        </h1>
        <p className="mt-2 text-zinc-500">
          Your account does not have permission to access this application.
        </p>
        <a
          href="/login"
          className="mt-6 inline-block text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Back to sign in
        </a>
      </div>
    </div>
  );
}
