"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NikaAvatar } from "@/components/nika/nika-avatar";
import { logoHref } from "@/lib/navigation/home";

type AppLogoProps = {
  /** Study chrome — compact; marketing — full wordmark */
  variant?: "marketing" | "study";
  className?: string;
};

/** OET Coach branding — always links to / (welcome-back if signed in, marketing if not). */
export function AppLogo({ variant = "marketing", className = "" }: AppLogoProps) {
  const pathname = usePathname() ?? "/";
  const href = logoHref();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === href) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const baseClass =
    variant === "study"
      ? "flex min-h-11 items-center gap-2 rounded-lg transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
      : "flex min-h-11 items-center gap-2.5";

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`${baseClass} min-w-0 ${className}`}
      aria-label="OET Coach home"
      title="OET Coach"
    >
      <NikaAvatar
        size="sm"
        state="idle"
        glow={variant === "study" ? 0.3 : 0.35}
        priority
      />
      {variant === "marketing" ? (
        <span className="font-display text-lg font-bold leading-tight text-brand-primary">
          OET Coach
        </span>
      ) : (
        <span className="truncate text-sm font-semibold text-brand-primary sm:text-base">
          OET Coach
        </span>
      )}
    </Link>
  );
}
