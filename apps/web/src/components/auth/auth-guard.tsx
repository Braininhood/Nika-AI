"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";

interface AuthGuardProps {
  children: ReactNode;
}

/** Redirect unsigned users to login — guest mode is not supported. */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session?.user) {
      router.replace("/login");
    }
  }, [loading, session?.user, router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink-soft">
        Loading…
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return <>{children}</>;
}
