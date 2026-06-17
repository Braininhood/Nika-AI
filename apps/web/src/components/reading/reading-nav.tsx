"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/reading", label: "Hub", match: ["/reading"], exact: true as const },
  { href: "/reading/part-a", label: "Part A", match: ["/reading/part-a"], exact: false as const },
  { href: "/reading/part-b", label: "Part B", match: ["/reading/part-b"], exact: false as const },
  { href: "/reading/part-c", label: "Part C", match: ["/reading/part-c"], exact: false as const },
  { href: "/reading/quiz", label: "Quiz", match: ["/reading/quiz"], exact: false as const },
  { href: "/reading/flashcards", label: "Cards", match: ["/reading/flashcards"], exact: false as const },
  { href: "/reading/exam", label: "Exam", match: ["/reading/exam"], exact: false as const },
] as const;

export function ReadingNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Reading sections" className="-mx-1 flex gap-1 overflow-x-auto border-b border-border pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : link.match.some((m) => pathname.startsWith(m));
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
