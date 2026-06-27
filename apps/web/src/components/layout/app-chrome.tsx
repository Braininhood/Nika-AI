"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteFooter, CompactLegalFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CookieConsent } from "@/components/legal";
import { RoleRouteGuard } from "@/components/auth/role-route-guard";
import { NikaCompanion } from "@/components/nika/nika-companion";
import { isStudyRoute } from "@/lib/navigation/study-routes";
import { isAdminPath } from "@/lib/auth/roles";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const study = isStudyRoute(pathname);
  const admin = isAdminPath(pathname);
  const showMarketingFooter = !study && !admin && pathname !== "/login" && !pathname.startsWith("/auth/");

  return (
    <>
      {!admin && <SiteHeader />}
      <RoleRouteGuard />
      {children}
      {showMarketingFooter ? (
        <SiteFooter />
      ) : study ? (
        <div className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
          <CompactLegalFooter />
        </div>
      ) : null}
      {!admin && !pathname.startsWith("/login") && !pathname.startsWith("/auth/") && (
        <NikaCompanion />
      )}
      {!admin && <CookieConsent />}
    </>
  );
}
