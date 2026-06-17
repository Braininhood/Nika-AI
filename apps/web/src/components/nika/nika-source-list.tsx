import Link from "next/link";

import type { NikaSource } from "@/lib/nika/chat";
import { isExternalNikaHref, resolveNikaSourceHref } from "@/lib/nika/source-links";

function SourceLink({ source }: { source: NikaSource }) {
  const href = resolveNikaSourceHref(source);
  const label = source.title;

  if (!href) {
    return <span>{label}</span>;
  }

  const className = "font-medium text-brand-primary hover:underline";

  if (isExternalNikaHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function NikaSourceList({ sources }: { sources: NikaSource[] }) {
  const visible = sources.filter(
    (s) => s.id !== "content-catalog" && s.title && s.title !== s.id,
  );
  if (!visible.length) return null;

  return (
    <ul className="mt-2 space-y-1.5 border-t border-border/50 pt-2 text-xs text-ink-soft">
      <li className="font-medium text-ink">Sources</li>
      {visible.map((s) => (
        <li key={`${s.id}-${s.title}`}>
          · <SourceLink source={s} />
        </li>
      ))}
    </ul>
  );
}
