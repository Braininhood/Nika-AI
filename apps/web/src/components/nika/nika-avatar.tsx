"use client";

import Image from "next/image";

import { NIKA_COMPANION_IMAGE } from "@/lib/nika/assets";
import type { NikaState } from "@/lib/nika/stage";

type NikaAvatarProps = {
  state?: NikaState;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  glow?: number;
  className?: string;
  label?: string;
  /** Preload + eager load for above-the-fold / LCP (header, hero). */
  priority?: boolean;
};

const SIZE_MAP = {
  xs: 32,
  sm: 48,
  md: 72,
  lg: 120,
  xl: 180,
} as const;

/** Circular Nika portrait — single companion artwork app-wide. */
export function NikaAvatar({
  state = "idle",
  size = "md",
  glow = 0.4,
  className = "",
  label = "Nika, your OET study companion",
  priority = false,
}: NikaAvatarProps) {
  const px = SIZE_MAP[size];
  const glowOpacity = Math.min(1, 0.2 + glow * 0.8);

  const animClass =
    state === "thinking"
      ? "nika-anim-thinking"
      : state === "celebrating" || state === "proud"
        ? "nika-anim-celebrate"
        : state === "greeting"
          ? "nika-anim-greeting"
          : state === "encouraging"
            ? "nika-anim-encourage"
            : state === "resting"
              ? "nika-anim-resting"
              : "nika-anim-idle";

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      role="img"
      aria-label={label}
    >
      <div
        className="nika-glow pointer-events-none absolute inset-0 rounded-full"
        style={{ opacity: glowOpacity }}
        aria-hidden
      />
      <div
        className={`relative z-10 overflow-hidden rounded-full ${animClass}`}
        style={{ width: px, height: px }}
      >
        <Image
          src={NIKA_COMPANION_IMAGE}
          alt=""
          fill
          sizes={`${px}px`}
          className="object-cover object-center"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
      </div>
    </div>
  );
}
