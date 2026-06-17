"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { courseTransparencyLine, generatePersonalCourse } from "@/lib/adaptive/personal-course";
import { loadPersonalCourse } from "@/lib/adaptive/service";
import type { PersonalCourse } from "@/lib/adaptive/types";
import { loadUserProfile } from "@/lib/profile/service";
import { useAuth } from "@/lib/auth/auth-provider";

const STATUS_STYLES = {
  active: "border-brand-primary/50 bg-brand-primary/5",
  maintenance: "border-border bg-surface-muted/50",
  completed: "border-forest/40 bg-forest/5",
  locked: "border-border bg-surface opacity-70",
};

export default function PersonalCoursePage() {
  const { loading, session } = useAuth();
  const [course, setCourse] = useState<PersonalCourse | null>(null);

  useEffect(() => {
    if (loading) return;
    void loadPersonalCourse().then(setCourse);
    const onUpdate = () => void loadPersonalCourse().then(setCourse);
    window.addEventListener("oet-adaptive-updated", onUpdate);
    window.addEventListener("oet-skill-map-updated", onUpdate);
    return () => {
      window.removeEventListener("oet-adaptive-updated", onUpdate);
      window.removeEventListener("oet-skill-map-updated", onUpdate);
    };
  }, [loading, session?.user?.id]);

  useEffect(() => {
    if (loading || course) return;
    void loadUserProfile(session?.user?.id).then((profile) => {
      if (profile?.skillMap) {
        setCourse(generatePersonalCourse(profile, profile.skillMap));
      }
    });
  }, [loading, course, session?.user?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink-soft">Loading…</div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-ink">Personal course</h1>
        <p className="mt-4 text-sm text-ink-soft">
          Complete onboarding and diagnostic to generate your individual course.
        </p>
        <Link href="/diagnostic" className="mt-4 inline-block text-brand-primary hover:underline">
          Start diagnostic
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-ink">Your personal course</h1>
        <p className="mt-2 text-sm text-ink-soft">{course.summary}</p>
        <p className="mt-2 text-xs text-ink-soft">
          Version {course.version} · Updated {new Date(course.generatedAt).toLocaleDateString()}
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4 text-sm text-ink-soft">
        <p className="font-medium text-ink">Why this course?</p>
        <p className="mt-2">{courseTransparencyLine(course).replace(/\*\*/g, "")}</p>
      </section>

      <ol className="space-y-4">
        {course.modules.map((mod) => (
          <li
            key={mod.id}
            className={`rounded-2xl border p-4 ${STATUS_STYLES[mod.status]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-ink-soft">Module {mod.sequence}</p>
                <h2 className="font-semibold text-ink">{mod.title}</h2>
                <p className="mt-1 text-xs text-ink-soft">{mod.rationale}</p>
              </div>
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-bold uppercase text-ink-soft">
                {mod.status}
              </span>
            </div>
            {mod.status !== "locked" && (
              <ul className="mt-3 space-y-2">
                {mod.items.map((item) => (
                  <li key={item.route}>
                    <Link
                      href={item.route}
                      className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm hover:bg-surface-muted"
                    >
                      <span className="text-ink">{item.title}</span>
                      <span className="text-xs text-ink-soft">{item.durationMinutes}m</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <Link href="/dashboard" className="text-center text-sm text-brand-primary hover:underline">
        Back to today&apos;s plan
      </Link>
    </div>
  );
}
