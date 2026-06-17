"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";
import {
  hasSkillMap,
  isProfileComplete,
  loadUserProfile,
} from "@/lib/profile/service";

interface OnboardingGuardProps {
  children: ReactNode;
  requireDiagnostic?: boolean;
}

export function OnboardingGuard({
  children,
  requireDiagnostic = false,
}: OnboardingGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading: authLoading, session, localUser } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    // Wait until cloud profile is pulled into Dexie on this device.
    if (localUser === null) return;

    void loadUserProfile(session.user.id).then((profile) => {
      if (!isProfileComplete(profile) && pathname !== "/onboarding") {
        router.replace("/onboarding");
        return;
      }

      if (
        requireDiagnostic &&
        isProfileComplete(profile) &&
        !hasSkillMap(profile) &&
        !pathname.startsWith("/diagnostic")
      ) {
        router.replace("/diagnostic");
        return;
      }

      setChecking(false);
    });
  }, [authLoading, localUser, pathname, requireDiagnostic, router, session?.user]);

  if (authLoading || checking || (session?.user && localUser === null)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink-soft">
        Loading your profile…
      </div>
    );
  }

  return <>{children}</>;
}
