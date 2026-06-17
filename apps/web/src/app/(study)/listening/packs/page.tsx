"use client";

import Link from "next/link";

import { MyImportPacksList } from "@/components/listening/import-pack-flow";
import { OfflinePacksPanel } from "@/components/listening/offline-packs-panel";

export default function ListeningPacksPage() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <header>
        <Link href="/listening" className="text-sm text-ink-soft hover:text-ink">
          ← Listening hub
        </Link>
        <h1 className="mt-4 text-xl font-bold text-ink">Offline packs</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Download bundled practice audio or manage your imported official materials.
        </p>
      </header>
      <OfflinePacksPanel />
      <MyImportPacksList />
    </div>
  );
}
