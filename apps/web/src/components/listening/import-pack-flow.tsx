"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PROFESSIONS } from "@/lib/domain/professions";
import {
  daysUntilExpiry,
  importUserPack,
  listUserImportPacks,
} from "@/lib/media/plv";
import type { UserImportPack } from "@/lib/db/types";

import { AnswerKeyMatcher } from "./answer-key-matcher";
import { ImportPostChecklist } from "./import-post-checklist";

interface ImportPackFlowProps {
  onImported?: (pack: UserImportPack) => void;
}

export function ImportPackFlow({ onImported }: ImportPackFlowProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("pharmacy");
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [importing, setImporting] = useState(false);
  const [importedPack, setImportedPack] = useState<UserImportPack | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const classifyFile = (file: File): "pdf" | "mp3" | "m4a" | "key_pdf" => {
    const lower = file.name.toLowerCase();
    if (lower.includes("key") && lower.endsWith(".pdf")) return "key_pdf";
    if (lower.endsWith(".pdf")) return "pdf";
    if (lower.endsWith(".m4a")) return "m4a";
    return "mp3";
  };

  const handleImport = async () => {
    if (!name.trim()) {
      setError("Enter a pack name (e.g. OET sample test 1).");
      return;
    }
    if (!files?.length) {
      setError("Click Browse and select your MP3/PDF files from oet.com downloads.");
      return;
    }
    if (!consent) {
      setError("Tick the consent box to confirm personal use and local-only storage.");
      return;
    }

    setImporting(true);
    setError(null);
    setWarnings([]);

    try {
      const result = await importUserPack({
        name: name.trim(),
        profession,
        consent,
        files: [...files].map((file) => ({ file, kind: classifyFile(file) })),
      });
      setWarnings(result.warnings);
      setImportedPack(result.pack);
      onImported?.(result.pack);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-semibold text-ink">Import official materials</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Download free sample tests from{" "}
        <a
          href="https://oet.com/ready/sample-tests"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary hover:underline"
        >
          oet.com
        </a>
        , then import the MP3 + PDF here. Files stay on this device only. Auto-expires after 90 days.
      </p>

      <label className="mt-4 block text-sm">
        <span className="font-medium text-ink">Pack name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="OET sample test 1"
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </label>

      <label className="mt-3 block text-sm">
        <span className="font-medium text-ink">Profession (for tagging)</span>
        <select
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
        >
          {PROFESSIONS.map((p) => (
            <option key={p.code} value={p.code}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 block text-sm">
        <span className="font-medium text-ink">Files (MP3, PDF, answer key PDF)</span>
        <input
          type="file"
          multiple
          accept=".mp3,.m4a,.pdf,audio/*,application/pdf"
          onChange={(e) => {
            setFiles(e.target.files);
            setError(null);
          }}
          className="mt-1 w-full text-sm"
        />
        {files && files.length > 0 ? (
          <ul className="mt-2 list-inside list-disc text-xs text-ink-soft">
            {[...files].map((f) => (
              <li key={f.name}>{f.name}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-ink-soft">No files selected yet — click Browse above.</p>
        )}
      </label>

      <label className="mt-4 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 accent-brand-primary"
        />
        <span className="text-ink-soft">
          I confirm these are my personal study materials and I agree to local-only storage.
        </span>
      </label>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      {warnings.map((w) => (
        <p key={w} className="mt-2 text-xs text-ink-soft">
          Note: {w}
        </p>
      ))}

      <button
        type="button"
        disabled={importing}
        onClick={() => void handleImport()}
        className="mt-4 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {importing ? "Importing…" : "Import to Personal Local Vault"}
      </button>

      {importedPack && <ImportPostChecklist pack={importedPack} />}
    </section>
  );
}

export function ImportPackExtras() {
  return <AnswerKeyMatcher />;
}

export function MyImportPacksList() {
  const [packs, setPacks] = useState<UserImportPack[]>([]);

  useEffect(() => {
    void listUserImportPacks().then(setPacks);
  }, []);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-semibold text-ink">My offline packs</h2>
      {packs.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">No imports yet.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {packs.map((pack) => (
            <li key={pack.id} className="rounded-lg border border-border px-3 py-2">
              <span className="font-medium text-ink">{pack.name}</span>
              <span className="text-ink-soft">
                {" "}
                · {pack.files.audioIds.length} audio · expires in {daysUntilExpiry(pack)} days
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
