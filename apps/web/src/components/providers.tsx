"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { OutboxSync } from "@/components/outbox-sync";
import { ChunkLoadRecovery } from "@/components/dev/chunk-load-recovery";
import { DevServiceWorkerCleanup } from "@/components/dev/dev-service-worker-cleanup";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { ThemeProvider } from "@/lib/theme/theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <DevServiceWorkerCleanup />
          <ChunkLoadRecovery />
          <OutboxSync />
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
