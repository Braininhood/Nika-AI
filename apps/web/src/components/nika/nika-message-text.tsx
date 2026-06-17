import Link from "next/link";
import type { ReactNode } from "react";

import { resolveSafeHref, trimUrl } from "@/lib/security/safe-href";

/** Markdown links (internal + external), bold, URLs, and bare domains. */
const INLINE_PATTERN =
  /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(https?:\/\/[^\s<>\])]+)|(\b[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z0-9][-a-zA-Z0-9]+)+(?:\/[^\s<>\]),.]*)?)/g;

interface NikaMessageTextProps {
  text: string;
  /** User bubble — lighter link colour on brand background */
  variant?: "user" | "nika";
  onInternalNavigate?: (href: string) => void;
}

export function NikaMessageText({
  text,
  variant = "nika",
  onInternalNavigate,
}: NikaMessageTextProps) {
  const linkClass =
    variant === "user"
      ? "font-medium underline decoration-white/60 underline-offset-2 hover:decoration-white"
      : "font-medium text-brand-primary underline decoration-brand-primary/40 underline-offset-2 hover:decoration-brand-primary";

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    if (match[2] && match[3]) {
      const label = match[2];
      const safe = resolveSafeHref(match[3]);
      if (!safe) {
        nodes.push(label);
      } else if (safe.kind === "internal") {
        if (onInternalNavigate) {
          nodes.push(
            <button
              key={key++}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onInternalNavigate(safe.href);
              }}
              className={linkClass}
            >
              {label}
            </button>,
          );
        } else {
          nodes.push(
            <Link
              key={key++}
              href={safe.href}
              className={linkClass}
              onClick={(e) => e.stopPropagation()}
            >
              {label}
            </Link>,
          );
        }
      } else {
        nodes.push(
          <a
            key={key++}
            href={safe.href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {label}
          </a>,
        );
      }
    } else if (match[5]) {
      nodes.push(
        <strong key={key++} className="font-semibold">
          {match[5]}
        </strong>,
      );
    } else if (match[6]) {
      const safe = resolveSafeHref(match[6]);
      if (safe?.kind === "external") {
        const display = trimUrl(match[6]);
        nodes.push(
          <a
            key={key++}
            href={safe.href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {display}
          </a>,
        );
      } else {
        nodes.push(match[0]);
      }
    } else if (match[7]) {
      const safe = resolveSafeHref(match[7]);
      if (safe?.kind === "external") {
        const display = trimUrl(match[7]);
        nodes.push(
          <a
            key={key++}
            href={safe.href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {display}
          </a>,
        );
      } else {
        nodes.push(match[0]);
      }
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <>{nodes}</>;
}
