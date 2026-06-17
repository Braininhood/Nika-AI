"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/listening", label: "Hub" },
  { href: "/listening/part-a", label: "Part A" },
  { href: "/listening/part-b", label: "Part B" },
  { href: "/listening/part-c", label: "Part C" },
  { href: "/listening/import", label: "Import" },
  { href: "/listening/packs", label: "Packs" },
];

export function ListeningNav() {
  const pathname = usePathname();

  return (
    <nav
      className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto pb-1 text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Listening sections"
    >
      {LINKS.map((link) => {
        const active =
          link.href === "/listening"
            ? pathname === "/listening"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-full px-3 py-2 min-h-11 inline-flex items-center ${
              active
                ? "bg-brand-accent font-semibold text-ink"
                : "bg-surface-muted text-ink-soft hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
