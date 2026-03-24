"use client";

import { useState } from "react";
import { logout } from "@/app/actions/auth";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

const primaryNav = [
  { href: "/flavors", label: "Flavors", icon: <FlavorsIcon /> },
  { href: "/test-runner", label: "Test Runner", icon: <TestRunnerIcon /> },
];

const referenceNav = [
  { href: "/themes", label: "Themes", icon: <ThemesIcon /> },
  { href: "/step-types", label: "Step Types", icon: <StepTypesIcon /> },
  { href: "/flavor-steps", label: "Flavor Steps", icon: <FlavorStepsIcon /> },
];

interface ShellProps {
  email: string | undefined;
  children: React.ReactNode;
}

export function Shell({ email, children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const close = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={close}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 dark:border-zinc-800 dark:bg-zinc-900",
          "lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center border-b border-zinc-100 px-4 dark:border-zinc-800">
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Humor Studio
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {primaryNav.map((item) => (
              <NavLink key={item.href} href={item.href} icon={item.icon} onClick={close}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-6">
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Reference
            </p>
            <div className="space-y-0.5">
              {referenceNav.map((item) => (
                <NavLink key={item.href} href={item.href} icon={item.icon} onClick={close}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Settings footer */}
        <div className="shrink-0 border-t border-zinc-100 px-3 py-4 dark:border-zinc-800">
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            Settings
          </p>
          <ThemeToggle />
        </div>
      </aside>

      {/* ── Main column ──────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 lg:hidden"
            aria-label="Open sidebar"
          >
            <HamburgerIcon />
          </button>

          {/* Spacer on desktop so right side stays right */}
          <span className="hidden lg:block" />

          {/* User + sign-out */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────

function FlavorsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
    </svg>
  );
}

function TestRunnerIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.5 3.5a.5.5 0 0 1 .765-.424l6 3.5a.5.5 0 0 1 0 .848l-6 3.5A.5.5 0 0 1 5.5 10.5v-7z" />
    </svg>
  );
}

function ThemesIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" strokeLinecap="round" />
    </svg>
  );
}

function StepTypesIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}

function FlavorStepsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10M3 8h7M3 12h5" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
      <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
    </svg>
  );
}
