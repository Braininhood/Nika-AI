"use client";

import { Suspense } from "react";

import { DiagnosticFlow } from "@/components/diagnostic/diagnostic-flow";

export default function DiagnosticPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-soft">Loading diagnostic…</div>}>
      <DiagnosticFlow />
    </Suspense>
  );
}
