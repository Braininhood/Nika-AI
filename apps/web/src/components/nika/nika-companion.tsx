"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";

import { NikaChat } from "@/components/nika/nika-chat";
import { NIKA_COMPANION_IMAGE } from "@/lib/nika/assets";
import { useAuth } from "@/lib/auth/auth-provider";
import type { UserProfile } from "@/lib/domain/types";
import { loadUserProfile } from "@/lib/profile/service";

const STUDY_PREFIXES = [
  "/dashboard",
  "/study",
  "/nika",
  "/progress",
  "/profile",
  "/diagnostic",
  "/onboarding",
  "/writing",
  "/reading",
  "/listening",
  "/speaking",
  "/mock",
  "/course",
  "/materials",
  "/vocabulary",
  "/study",
];

function isStudyRoute(pathname: string): boolean {
  return STUDY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function shouldHideCompanion(pathname: string): boolean {
  return (
    pathname === "/nika" ||
    pathname === "/login" ||
    pathname.startsWith("/auth/")
  );
}

export function NikaCompanion() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { session, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const study = isStudyRoute(pathname);
  const navLockRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then(setProfile);
  }, [loading, session?.user?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navigateFromPanel = useCallback(
    (href: string) => {
      if (navLockRef.current) return;
      navLockRef.current = true;
      setOpen(false);
      const target = href.split("?")[0] ?? href;
      if (pathname !== target) {
        router.push(href);
      }
      window.setTimeout(() => {
        navLockRef.current = false;
      }, 400);
    },
    [router, pathname],
  );

  if (!mounted || shouldHideCompanion(pathname)) return null;

  const fabBottom = study
    ? "bottom-[calc(5.25rem+env(safe-area-inset-bottom))]"
    : "bottom-[calc(1.25rem+env(safe-area-inset-bottom))]";

  return createPortal(
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`nika-companion-fab ${fabBottom}`}
          aria-label="Ask Nika — open study coach"
          title="Ask Nika"
        >
          <span className="nika-companion-ring" aria-hidden />
          <span className="relative z-10 block h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full">
            <Image
              src={NIKA_COMPANION_IMAGE}
              alt=""
              fill
              sizes="72px"
              className="nika-medallion-float object-cover object-center"
              loading="eager"
              fetchPriority="high"
            />
          </span>
          <span className="nika-companion-sparkle" aria-hidden />
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-stretch sm:justify-end sm:p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-labelledby="nika-companion-title"
            aria-modal="true"
            className="nika-companion-panel flex h-[min(88dvh,640px)] w-full max-w-lg flex-col border border-border bg-surface shadow-2xl sm:h-[min(92dvh,720px)] sm:max-w-md sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center gap-3 border-b border-border px-4 py-3">
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={NIKA_COMPANION_IMAGE}
                  alt=""
                  fill
                  sizes="48px"
                  className="nika-medallion-idle object-cover object-center"
                />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="nika-companion-title" className="font-display text-base font-bold text-ink">
                  Ask Nika
                </h2>
                <p className="truncate text-xs text-ink-soft">
                  OET study coach — here on every page
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="touch-target rounded-xl border border-border px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-surface-muted hover:text-ink"
                aria-label="Close Nika"
              >
                Close
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
              <NikaChat
                profile={profile}
                accessToken={session?.access_token}
                variant="panel"
                onNavigate={navigateFromPanel}
              />
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
