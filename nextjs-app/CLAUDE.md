@AGENTS.md

# Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Auth & Database | Supabase (`@supabase/supabase-js`, `@supabase/ssr`) |
| Linting | ESLint 9 (`eslint-config-next`) |

# Folder Structure

```
nextjs-app/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Public login page
│   ├── (protected)/
│   │   ├── layout.tsx            # Runs verifyAdmin(); wraps all protected routes
│   │   └── dashboard/
│   │       └── page.tsx          # Example protected page
│   ├── actions/
│   │   └── auth.ts               # Server Actions: login(), logout()
│   ├── unauthorized/
│   │   └── page.tsx              # Shown when user is authenticated but not admin
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Root page (redirects to /dashboard if authed)
├── lib/
│   ├── supabase/
│   │   ├── server.ts             # createClient() for Server Components & Actions
│   │   └── client.ts             # createClient() for Client Components
│   └── dal.ts                    # Data Access Layer — verifyAdmin()
├── proxy.ts                      # Route protection (Next.js 16: middleware → proxy)
├── .env.local.example            # Copy to .env.local and fill in values
└── CLAUDE.md                     # This file
```

# Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase project values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

# Security Model

## Who can access the app

**Only users where `profiles.is_superadmin = true` OR `profiles.is_matrix_admin = true` are allowed in.**

All other authenticated users are redirected to `/unauthorized`. Unauthenticated users are redirected to `/login`.

## Two-layer enforcement

1. **`proxy.ts`** — optimistic check on every request. Reads the Supabase session cookie and redirects unauthenticated users to `/login` before any page renders. No database call here (performance).

2. **`lib/dal.ts` → `verifyAdmin()`** — authoritative check. Called in every protected Server Component and Server Action. Queries `profiles` to verify admin flags. Redirects to `/login` or `/unauthorized` as appropriate. This is the real security boundary.

**Always call `verifyAdmin()` in Server Components and Server Actions that handle sensitive data.** The proxy alone is not sufficient — it can be bypassed in edge cases (e.g., direct API calls).

## Do NOT modify Supabase RLS policies

RLS policies are managed outside this codebase (in the Supabase dashboard or migrations). Never add, alter, or drop RLS policies from application code. Authorization is enforced at the application layer via `verifyAdmin()` and relies on RLS remaining as-is in Supabase.

# Next.js 16 Notes

- **Middleware is renamed to Proxy** — use `proxy.ts` at the project root (not `middleware.ts`). The exported function must be named `proxy` or be a default export.
- **Server Components are the default** — add `"use client"` only when you need browser APIs or React state/effects.
- **Server Actions** — mark files or functions with `"use server"`. Import them directly into Server Components or pass them as `action` props to `<form>`.
- Always read `node_modules/next/dist/docs/` before using Next.js APIs — this version has breaking changes from prior releases.
