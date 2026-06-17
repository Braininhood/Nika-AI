"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/auth-provider";
import { isAdminUser } from "@/lib/auth/roles";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (!isAdminUser(session.user)) {
      router.replace("/");
      return;
    }

    setAllowed(true);
  }, [loading, session, router]);

  if (loading || !allowed) {
    return (
      <p className="px-4 py-12 text-center text-sm text-ink-soft" role="status">
        Loading…
      </p>
    );
  }

  return <>{children}</>;
}
