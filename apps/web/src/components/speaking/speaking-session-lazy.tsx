"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { SpeakingSessionProps } from "@/components/speaking/speaking-session";

export const SpeakingSessionLazy: ComponentType<SpeakingSessionProps> = dynamic(
  () =>
    import("@/components/speaking/speaking-session").then((mod) => ({
      default: mod.SpeakingSession,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-sm text-ink-soft">
        Loading role-play…
      </div>
    ),
  },
);
