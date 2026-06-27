import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

export const secondaryActionClassName =
  "inline-flex min-h-9 items-center justify-center rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-semibold text-ink transition hover:bg-surface-muted active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40";

export const secondaryActionCompactClassName =
  "inline-flex min-h-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-brand-primary transition hover:bg-surface-muted active:scale-[0.99]";

export function SecondaryActionButton({
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button type="button" className={`${secondaryActionClassName} ${className}`} {...props}>
      {children}
    </button>
  );
}

type SecondaryActionLinkProps = ComponentProps<typeof Link> & { children: ReactNode };

export function SecondaryActionLink({ className = "", children, ...props }: SecondaryActionLinkProps) {
  return (
    <Link className={`${secondaryActionClassName} ${className}`} {...props}>
      {children}
    </Link>
  );
}

type SecondaryActionAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode };

export function SecondaryActionAnchor({
  className = "",
  children,
  ...props
}: SecondaryActionAnchorProps) {
  return (
    <a className={`${secondaryActionClassName} ${className}`} {...props}>
      {children}
    </a>
  );
}
