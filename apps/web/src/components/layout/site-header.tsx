"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppLogo } from "@/components/layout/app-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AuthStatus } from "@/components/auth-status";
import { OnlineStatus } from "@/components/online-status";
import { SyncBadge } from "@/components/sync-badge";
import { APP_HOME_PATH } from "@/lib/navigation/home";
import { isStudyRoute } from "@/lib/navigation/study-routes";
import { useAuth } from "@/lib/auth/auth-provider";

const MARKETING_LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const study = isStudyRoute(pathname);
  const { session, loading, localUser } = useAuth();
  const signedIn = Boolean(session?.user ?? localUser);

  if (study) {
    return (
      <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur">
        <div className="flex min-w-0 items-center justify-between gap-2 px-4 py-2.5 sm:gap-3 sm:px-6">
          <div className="min-w-0 shrink">
            <AppLogo variant="study" />
          </div>
          <div className="flex max-w-[55%] shrink-0 items-center justify-end gap-1 sm:max-w-none sm:gap-3">
            <AuthStatus />
            <SyncBadge />
            <OnlineStatus compact />
            <ThemeToggle compact />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <AppLogo variant="marketing" className="min-w-0 shrink" />

        <nav aria-label="Site" className="hidden items-center gap-6 md:flex">
          {MARKETING_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition hover:text-brand-primary ${
                pathname === link.href ? "text-brand-primary" : "text-ink-soft"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle compact />
          {!loading && (
            <Link
              href={signedIn ? APP_HOME_PATH : "/login"}
              prefetch={signedIn ? false : undefined}
              className="inline-flex min-h-11 max-w-[10rem] items-center justify-center truncate rounded-xl bg-brand-accent px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-accent-glow sm:max-w-none sm:px-4"
            >
              {signedIn ? "Continue study" : "Get started"}
            </Link>
          )}
        </div>
      </div>

      <nav
        aria-label="Mobile site links"
        className="flex gap-4 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden"
      >
        {MARKETING_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 text-sm font-medium whitespace-nowrap ${
              pathname === link.href ? "text-brand-primary" : "text-ink-soft"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
