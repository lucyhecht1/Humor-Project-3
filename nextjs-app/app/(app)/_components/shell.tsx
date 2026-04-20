"use client";

import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions/auth";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

const primaryNav = [
  { href: "/flavors", label: "Flavors", icon: <FlavorsIcon /> },
  { href: "/test-runner", label: "Test Runner", icon: <TestRunnerIcon /> },
];

const referenceNav = [
  { href: "/captions", label: "Captions", icon: <CaptionsIcon /> },
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

          {/* User avatar */}
          <UserMenu email={email} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

// ── User menu ─────────────────────────────────────────────────

function UserMenu({ email }: { email: string | undefined }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const initial = email ? email[0].toUpperCase() : "?";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white transition-opacity hover:opacity-80 dark:bg-zinc-50 dark:text-zinc-900"
        aria-label="User menu"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {email && (
            <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-700">
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{email}</p>
            </div>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center px-4 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-50"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
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

function CaptionsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="9" rx="1.5" />
      <path d="M5 7h6M5 10h4" />
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
