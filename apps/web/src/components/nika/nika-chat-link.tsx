"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface NikaChatLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  /** When set (companion panel), use explicit navigation so routes work from the portal. */
  onNavigate?: (href: string) => void;
}

export function NikaChatLink({ href, className, children, onNavigate }: NikaChatLinkProps) {
  if (onNavigate) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onNavigate(href);
        }}
        className={`${className ?? ""} cursor-pointer text-left underline-offset-2 hover:underline`}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={className} onClick={(e) => e.stopPropagation()}>
      {children}
    </Link>
  );
}
