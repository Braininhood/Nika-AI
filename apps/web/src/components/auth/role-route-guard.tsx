"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";
import {
  ADMIN_HOME_PATH,
  isAdminPath,
  isAdminUser,
  isLearnerStudyPath,
  LEARNER_HOME_PATH,
} from "@/lib/auth/roles";

/**
 * Keeps admin and learner areas separate after sign-in.
 * Admin → /admin only. Learners → never /admin.
 */
export function RoleRouteGuard() {
  const { session, loading } = useAuth();
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session?.user) return;

    const admin = isAdminUser(session.user);

    if (admin && isLearnerStudyPath(pathname)) {
      router.replace(ADMIN_HOME_PATH);
      return;
    }

    if (!admin && isAdminPath(pathname)) {
      router.replace(LEARNER_HOME_PATH);
    }
  }, [loading, session?.user, pathname, router]);

  return null;
}
