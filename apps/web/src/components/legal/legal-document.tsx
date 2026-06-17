import Link from "next/link";
import type { ReactNode } from "react";

export type LegalSection = {
  id: string;
  title: string;
  body: string[];
};

type LegalDocumentProps = {
  title: string;
  subtitle?: string;
  sections: LegalSection[];
  children?: ReactNode;
};

export function LegalDocument({ title, subtitle, sections, children }: LegalDocumentProps) {
  return (
    <article className="legal-prose mx-auto w-full min-w-0 max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 border-b border-border pb-8">
        <p className="text-sm font-medium text-brand-primary">Legal</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-base text-ink-soft">{subtitle}</p>}
      </header>

      <div className="flex flex-col gap-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-ink">{section.title}</h2>
            <div className="mt-3 flex flex-col gap-3 text-base leading-relaxed text-ink-soft">
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {children}

      <footer className="mt-12 rounded-2xl border border-border bg-surface p-5 text-sm text-ink-soft">
        <p>
          Questions?{" "}
          <Link href="/contact" className="font-medium text-brand-primary hover:underline">
            Contact us
          </Link>{" "}
          or read our{" "}
          <Link href="/privacy" className="font-medium text-brand-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </footer>
    </article>
  );
}
