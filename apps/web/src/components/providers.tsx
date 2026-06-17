"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { OutboxSync } from "@/components/outbox-sync";
import { ChunkLoadRecovery } from "@/components/dev/chunk-load-recovery";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { persistLocalUser } from "@/lib/profile/service";
import { ThemeProvider } from "@/lib/theme/theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ChunkLoadRecovery />
          <OutboxSync />
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

/** @deprecated Use persistLocalUser from @/lib/profile/service */
export async function persistAuthedUser(
  userId: string,
  email?: string,
): Promise<void> {
  const { db } = await import("@/lib/db");
  const existing = await db.users.get(userId);
  await persistLocalUser({
    id: userId,
    email: email ?? existing?.email,
    profession: existing?.profession,
    targetCountry: existing?.targetCountry,
    targetRegulator: existing?.targetRegulator,
    targetGrades: existing?.targetGrades,
    onboardingComplete: existing?.onboardingComplete,
    studyGoal: existing?.studyGoal,
    examDate: existing?.examDate,
    isGuest: false,
    updatedAt: Date.now(),
  });
}

export { getPendingOutboxCount } from "@/lib/sync/outbox";
