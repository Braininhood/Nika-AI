"use client";

import { useEffect, useState } from "react";

import { parseAnswerKeyFromText } from "@/lib/media/pdf-parse";
import { listUserImportPacks } from "@/lib/media/plv";
import type { UserImportPack } from "@/lib/db/types";

function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function compareAnswers(
  userKey: Record<string, string>,
  officialKey: Record<string, string>,
): { id: string; user: string; expected: string; correct: boolean }[] {
  const ids = new Set([...Object.keys(userKey), ...Object.keys(officialKey)]);
  const sortedIds = [...ids].sort((a: string, b: string) => {
    const na = Number(a.replace(/\D/g, "")) || 0;
    const nb = Number(b.replace(/\D/g, "")) || 0;
    return na - nb;
  });
  const rows: { id: string; user: string; expected: string; correct: boolean }[] = [];

  for (const id of sortedIds) {
    const user = userKey[id] ?? "";
    const expected = officialKey[id] ?? "";
    if (!user && !expected) continue;
    rows.push({
      id,
      user,
      expected,
      correct: Boolean(user && expected && normalizeAnswer(user) === normalizeAnswer(expected)),
    });
  }
  return rows;
}

export function AnswerKeyMatcher() {
  const [packs, setPacks] = useState<UserImportPack[]>([]);
  const [packId, setPackId] = useState("");
  const [pasted, setPasted] = useState("");
  const [rows, setRows] = useState<ReturnType<typeof compareAnswers>>([]);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    void listUserImportPacks().then((list) => {
      setPacks(list);
      const withKey = list.find((p) => p.parsed.answerKey && Object.keys(p.parsed.answerKey).length);
      if (withKey) setPackId(withKey.id);
    });
  }, []);

  const selected = packs.find((p) => p.id === packId);
  const officialKey = selected?.parsed.answerKey ?? {};

  const handleCheck = () => {
    const userKey = parseAnswerKeyFromText(pasted);
    setRows(compareAnswers(userKey, officialKey));
    setChecked(true);
  };

  const correctCount = rows.filter((r) => r.correct).length;
  const total = rows.filter((r) => r.user).length;

  return (
    <section id="answer-key-matcher" className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-semibold text-ink">Answer-key matcher</h2>
      <p className="mt-1 text-sm text-ink-soft">
        For computer sample tests, OET does not record your answers — paste them here (one per line:
        e.g. <code className="text-xs">1. hypertension</code>) and compare to your imported official
        key PDF.
      </p>

      {packs.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">Import a pack with an answer-key PDF first.</p>
      ) : (
        <>
          <label className="mt-4 block text-sm">
            <span className="font-medium text-ink">Imported pack</span>
            <select
              value={packId}
              onChange={(e) => {
                setPackId(e.target.value);
                setChecked(false);
                setRows([]);
              }}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              {packs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.parsed.answerKey
                    ? ` (${Object.keys(p.parsed.answerKey).length} key entries)`
                    : " (no parsed key)"}
                </option>
              ))}
            </select>
          </label>

          {!Object.keys(officialKey).length && (
            <p className="mt-2 text-xs text-ink-soft">
              No answer key parsed for this pack — re-import with a file named like{" "}
              <em>answer-key.pdf</em>.
            </p>
          )}

          <label className="mt-4 block text-sm">
            <span className="font-medium text-ink">Your answers</span>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={8}
              placeholder={"1. answer one\n2. answer two\nQ3. answer three"}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
            />
          </label>

          <button
            type="button"
            disabled={!pasted.trim() || !Object.keys(officialKey).length}
            onClick={handleCheck}
            className="mt-3 rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
          >
            Compare to official key
          </button>

          {checked && rows.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-ink">
                {correctCount}/{total} matched
                {total > 0 ? ` (${Math.round((correctCount / total) * 100)}%)` : ""}
              </p>
              <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className={`rounded-lg border px-3 py-2 ${
                      row.correct
                        ? "border-success/40 bg-success/5"
                        : row.user
                          ? "border-danger/30 bg-danger/5"
                          : "border-border"
                    }`}
                  >
                    <span className="font-medium">{row.id}</span>
                    <p className="text-ink-soft">Yours: {row.user || "—"}</p>
                    <p className="text-ink-soft">Key: {row.expected || "—"}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
