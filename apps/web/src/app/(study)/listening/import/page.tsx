"use client";

import Link from "next/link";

import { ImportPackFlow, ImportPackExtras, MyImportPacksList } from "@/components/listening/import-pack-flow";
import { OfficialImportGuide } from "@/components/listening/official-import-guide";
import { StudyMediaPanel } from "@/components/listening/study-media-panel";
import { OetProfessionSamplesPanel } from "@/components/media/oet-profession-samples-panel";

export default function ListeningImportPage() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <header>
        <Link href="/listening" className="text-sm text-ink-soft hover:text-ink">
          ← Listening hub
        </Link>
        <h1 className="mt-4 text-xl font-bold text-ink">Import materials</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Personal Local Vault — MP3 audio, question PDFs, and answer keys for offline practice.
        </p>
      </header>
      <OfficialImportGuide />
      <OetProfessionSamplesPanel filterByProfile />
      <ImportPackFlow />
      <ImportPackExtras />
      <MyImportPacksList />
      <StudyMediaPanel skill="listening" />
    </div>
  );
}
