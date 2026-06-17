"use client";

import { Suspense } from "react";

import { ContentManager } from "@/components/admin/content-manager";

export default function AdminContentPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-soft">Loading content manager…</p>}>
      <ContentManager />
    </Suspense>
  );
}
