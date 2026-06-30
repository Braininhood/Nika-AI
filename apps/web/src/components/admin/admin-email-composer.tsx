"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { EmailAudience, EmailCampaignResult } from "@/lib/admin/groups-api";
import { previewEmail, sendEmailCampaign } from "@/lib/admin/groups-api";
import { type EmailTemplate, fetchEmailTemplates } from "@/lib/admin/users-api";

const TEMPLATE_DEFAULTS: Record<string, Record<string, string>> = {
  study_reminder: {
    TaskCount: "3",
    Minutes: "15",
    PrioritySkill: "Writing",
    StudyUrl: "/plan",
  },
  study_streak: { StreakDays: "3", StudyUrl: "/plan" },
  weekly_progress: {
    StudyDays: "4",
    Minutes: "120",
    TopSkill: "Reading",
    NikaTip: "Small, consistent sessions beat cramming before exam day.",
    ProgressUrl: "/dashboard",
  },
  custom_message: {
    MessageBody: "We wanted to check in and see how your OET preparation is going.",
  },
};

export interface AdminEmailComposerProps {
  accessToken: string;
  recipientLabel: string;
  audience: EmailAudience;
  sampleUserId?: string;
  sampleEmail?: string;
  onSent?: (result: EmailCampaignResult) => void;
}

export function AdminEmailComposer({
  accessToken,
  recipientLabel,
  audience,
  sampleUserId,
  sampleEmail,
  onSent,
}: AdminEmailComposerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateId, setTemplateId] = useState("study_reminder");
  const [fromAddress, setFromAddress] = useState<"noreply" | "support">("noreply");
  const [subject, setSubject] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewPlain, setPreviewPlain] = useState("");
  const [previewTab, setPreviewTab] = useState<"html" | "text">("html");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId),
    [templates, templateId],
  );

  useEffect(() => {
    void fetchEmailTemplates(accessToken)
      .then((list) => setTemplates(Array.isArray(list) ? list : []))
      .catch(() => setTemplates([]));
  }, [accessToken]);

  useEffect(() => {
    const defaults = TEMPLATE_DEFAULTS[templateId] ?? {};
    setVariables(defaults);
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) setSubject(tpl.subject);
  }, [templateId, templates]);

  const loadPreview = useCallback(async () => {
    setLoadingPreview(true);
    setError(null);
    try {
      const preview = await previewEmail(accessToken, {
        templateId,
        sampleUserId,
        sampleEmail,
        subject: subject.trim() || undefined,
        variables,
      });
      setSubject(preview.subject);
      setPreviewHtml(preview.html);
      setPreviewPlain(preview.plainText);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed");
    } finally {
      setLoadingPreview(false);
    }
  }, [accessToken, templateId, sampleUserId, sampleEmail, subject, variables]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPreview();
    }, 700);
    return () => window.clearTimeout(timer);
  }, [loadPreview]);

  const handleVariableChange = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const handleSend = async (dryRun: boolean) => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await sendEmailCampaign(accessToken, {
        templateId,
        fromAddress,
        subject: subject.trim() || undefined,
        variables,
        dryRun,
        audience,
      });
      if (dryRun) {
        setMessage(`Ready to send to ${result.audienceSize} recipient(s).`);
      } else {
        setMessage(
          `Sent ${result.sent} · failed ${result.failed} · skipped ${result.skipped}` +
            (result.errors.length ? ` — ${result.errors[0]}` : ""),
        );
        onSent?.(result);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setBusy(false);
    }
  };

  const isPersonalized = selectedTemplate?.personalized ?? false;
  const editableVars = (selectedTemplate?.variables ?? []).filter((key) => {
    if (key === "FirstName") return false;
    if (isPersonalized && templateId !== "custom_message") return false;
    return true;
  });

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">Email campaign</h3>
          <p className="mt-1 text-sm text-ink-soft">
            To <strong className="text-ink">{recipientLabel}</strong> · Resend · replies go to
            support@nika-oet.fun
          </p>
        </div>
        <button
          type="button"
          disabled={loadingPreview}
          onClick={() => void loadPreview()}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface-muted"
        >
          Refresh preview
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="block text-sm">
          <span className="text-ink-soft">Template</span>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {selectedTemplate && (
            <p className="mt-1 text-xs text-ink-soft">
              {selectedTemplate.description}
              {selectedTemplate.personalized && (
                <span className="ml-1 font-medium text-brand-primary">
                  · Personalised per recipient
                </span>
              )}
            </p>
          )}
        </label>
        <label className="block text-sm">
          <span className="text-ink-soft">From</span>
          <select
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value as "noreply" | "support")}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
          >
            <option value="noreply">Nika · noreply@nika-oet.fun</option>
            <option value="support">Support · support@nika-oet.fun</option>
          </select>
        </label>
        <label className="block text-sm lg:col-span-2">
          <span className="text-ink-soft">Subject</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 font-medium"
            placeholder="Email subject line"
          />
        </label>
        {editableVars.map((key) => (
          <label key={key} className="block text-sm lg:col-span-2">
            <span className="text-ink-soft">{key}</span>
            {key === "MessageBody" ? (
              <textarea
                value={variables[key] ?? ""}
                onChange={(e) => handleVariableChange(key, e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            ) : (
              <input
                value={variables[key] ?? ""}
                onChange={(e) => handleVariableChange(key, e.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            )}
          </label>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setPreviewTab("html")}
            className={`px-3 py-2 text-sm font-medium ${
              previewTab === "html"
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-ink-soft"
            }`}
          >
            HTML preview
          </button>
          <button
            type="button"
            onClick={() => setPreviewTab("text")}
            className={`px-3 py-2 text-sm font-medium ${
              previewTab === "text"
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-ink-soft"
            }`}
          >
            Plain text
          </button>
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-[#f6f1e8]">
          {loadingPreview && !previewHtml ? (
            <p className="p-6 text-sm text-ink-soft">Generating preview…</p>
          ) : previewTab === "html" && previewHtml ? (
            <iframe
              title="Email preview"
              srcDoc={previewHtml}
              className="h-[420px] w-full bg-white"
              sandbox="allow-same-origin"
            />
          ) : previewTab === "html" ? (
            <p className="p-6 text-sm text-ink-soft">Generating preview…</p>
          ) : (
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap p-4 text-sm text-ink">
              {previewPlain || "No preview yet."}
            </pre>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-soft">
          {isPersonalized
            ? `Preview uses ${sampleUserId ? "one learner's real stats" : "sample data"}. Each recipient gets their own progress when sent.`
            : `Preview uses ${sampleEmail ? `sample: ${sampleEmail}` : "a generic learner name"}.`}
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleSend(false)}
          className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send email"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleSend(true)}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
        >
          Count recipients
        </button>
      </div>
    </section>
  );
}
