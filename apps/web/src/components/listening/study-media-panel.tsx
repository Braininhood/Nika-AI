"use client";

import { useState } from "react";

import {
  listeningAccentResources,
  masterclassResources,
  mediaForSkill,
  officialDownloadResources,
  type StudyMediaItem,
} from "@/content/media/study-resources";
import { OetProfessionSamplesPanel } from "@/components/media/oet-profession-samples-panel";

function MediaCard({ item }: { item: StudyMediaItem }) {
  const external = item.href.startsWith("http");
  const href = item.href;

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase text-brand-primary">
            {item.kind.replace("_", " ")}
            {item.accent ? ` · ${item.accent}` : ""}
          </p>
          <h3 className="mt-1 font-semibold text-ink">{item.title}</h3>
          {item.description && (
            <p className="mt-1 text-sm text-ink-soft">{item.description}</p>
          )}
          {item.locale && (
            <p className="mt-1 text-xs text-ink-soft">{item.locale}</p>
          )}
        </div>
        {item.durationMinutes && (
          <span className="shrink-0 text-xs text-ink-soft">{item.durationMinutes} min</span>
        )}
      </div>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="mt-3 inline-flex text-sm font-medium text-brand-primary hover:underline"
      >
        {item.kind === "oet_download" ? "Download from oet.com →" : "Open →"}
      </a>
      {item.youtubeId && (
        <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-border">
          <iframe
            title={item.title}
            src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </li>
  );
}

interface StudyMediaPanelProps {
  skill?: "listening" | "reading" | "writing" | "speaking" | "all";
  showAccentPodcasts?: boolean;
}

export function StudyMediaPanel({
  skill = "listening",
  showAccentPodcasts = true,
}: StudyMediaPanelProps) {
  const [tab, setTab] = useState<"professions" | "guides" | "oet" | "video" | "accent">("professions");
  const items = mediaForSkill(skill);
  const oetItems = items.filter(
    (i) => i.kind === "oet_article" || (i.kind === "oet_download" && i.id === "oet-sample-tests"),
  );
  const videoItems = items.filter((i) => i.kind === "youtube");
  const accentItems = showAccentPodcasts ? listeningAccentResources() : [];

  const guideItems = masterclassResources();
  const list =
    tab === "guides"
      ? guideItems
      : tab === "oet"
      ? [...oetItems, ...officialDownloadResources().slice(0, 6)]
      : tab === "video"
        ? videoItems
        : accentItems;

  return (
    <section className="rounded-2xl border border-border bg-surface-muted/30 p-5">
      <h2 className="font-semibold text-ink">Study resources</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Official OET links and videos — we link or embed only, never re-host copyrighted files.
        Practice audio in the app is original content for daily drills.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {(
          [
            ["professions", "All 12 professions"],
            ["guides", "OET Ready hubs"],
            ["oet", "Criteria & PDFs"],
            ["video", "YouTube"],
            ["accent", "Accent podcasts"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 ${
              tab === id
                ? "bg-brand-accent font-semibold text-ink"
                : "bg-surface text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "professions" ? (
        <div className="mt-4">
          <OetProfessionSamplesPanel filterByProfile />
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
