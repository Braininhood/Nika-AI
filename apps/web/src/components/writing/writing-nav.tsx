"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/writing/learn", label: "Learn", match: ["/writing/learn"] },
  { href: "/writing/guided", label: "Guided", match: ["/writing/guided"] },
  { href: "/writing/practice", label: "Practice", match: ["/writing/practice"] },
  { href: "/writing/exam", label: "Exam", match: ["/writing/exam"] },
] as const;

export function WritingNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Writing sections" className="-mx-1 flex gap-1 overflow-x-auto border-b border-border pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {LINKS.map((link) => {
        const active = link.match.some((m) => pathname.startsWith(m));
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium min-h-11 inline-flex items-center ${
              active ? "bg-brand-accent-soft text-brand-primary" : "text-ink-soft hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
