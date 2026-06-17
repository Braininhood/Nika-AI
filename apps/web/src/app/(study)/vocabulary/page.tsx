import Link from "next/link";

import { VocabularyPanel } from "@/components/vocabulary/vocabulary-panel";

export default function VocabularyPage() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-ink">Vocabulary</h1>
        <p className="mt-2 text-sm text-ink-soft">
          OET healthcare words and phrases — explain, translate, and practise pronunciation with Nika.
        </p>
        <Link href="/study/clever/vocab" className="mt-3 inline-flex text-sm text-brand-primary hover:underline">
          Take vocabulary clever quiz →
        </Link>
      </header>
      <VocabularyPanel />
    </div>
  );
}
