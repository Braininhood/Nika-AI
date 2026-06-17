"use client";

import Link from "next/link";

import { ContentDisclaimer } from "@/components/legal/content-disclaimer";
import { NikaAvatar } from "@/components/nika/nika-avatar";
import { APP_HOME_PATH } from "@/lib/navigation/home";
import { useAuth } from "@/lib/auth/auth-provider";

const FEATURES = [
  {
    title: "Adaptive study plan",
    description:
      "A diagnostic maps your skills, then Nika builds a daily plan that flexes after every quiz and practice session.",
    icon: "◎",
  },
  {
    title: "All four OET skills",
    description:
      "Writing, Reading, Listening, and Speaking — timed exam modes, graded samples, and profession-specific content.",
    icon: "▤",
  },
  {
    title: "Works offline",
    description:
      "Install as a PWA on any device. Study on the train, import official audio locally — your data stays on your phone.",
    icon: "⬡",
  },
  {
    title: "Nika AI tutor",
    description:
      "Grounded answers from OET criteria and your progress. Writing and speaking feedback tailored to your profession.",
    icon: "✦",
  },
  {
    title: "12 healthcare professions",
    description:
      "Pharmacy, nursing, medicine, dentistry, physiotherapy, and more — scenarios matched to your regulator.",
    icon: "✚",
  },
  {
    title: "Exam readiness gate",
    description:
      "Full mock exams with real timing. Pass two consecutive mocks and Nika confirms you're exam ready.",
    icon: "◆",
  },
] as const;

const STEPS = [
  {
    step: "1",
    title: "Sign in & onboard",
    body: "Pick your profession, country, and regulator. Nika welcomes you and explains what comes next.",
  },
  {
    step: "2",
    title: "Diagnostic placement",
    body: "A short adaptive test across all four skills builds your personal Skill Map and priority focus.",
  },
  {
    step: "3",
    title: "Study & adapt",
    body: "Follow today's plan. Every result silently updates your path — no manual tweaking required.",
  },
  {
    step: "4",
    title: "Mock & certify ready",
    body: "When gates unlock, take full mocks. Two passes in a row means you're ready for the real exam.",
  },
] as const;

export function HomeLanding() {
  const { session, localUser, loading } = useAuth();
  const signedIn = Boolean(session?.user ?? localUser);

  if (loading) {
    return (
      <div className="hero-mesh flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <NikaAvatar size="lg" state="thinking" />
          <p className="text-ink-soft">Loading your account…</p>
        </div>
      </div>
    );
  }

  if (signedIn) {
    return (
      <div className="hero-mesh flex min-h-[60vh] items-center justify-center px-4 py-16">
        <section className="w-full max-w-lg rounded-3xl border border-border bg-surface/90 p-8 text-center shadow-lg backdrop-blur">
          <NikaAvatar size="lg" state="greeting" className="mx-auto" />
          <h1 className="font-display mt-6 text-2xl font-bold text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {session?.user?.email ?? localUser?.email ?? "Your account"}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Continue to your study plan, or use the menu to pick a skill.
          </p>
          <Link
            href={APP_HOME_PATH}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-accent px-6 py-3 text-sm font-semibold text-ink transition hover:bg-brand-accent-glow sm:w-auto"
          >
            Continue to study
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="hero-mesh">
      {/* Hero */}
      <section className="page-container px-4 py-14 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="stagger-in">
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
              Personalised OET prep for{" "}
              <span className="text-brand-primary">healthcare professionals</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              Calm, intelligent, and adaptive — OET Coach builds your individual path from
              diagnostic to exam ready. Study on any device, even offline.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-accent px-8 py-3.5 text-base font-semibold text-ink shadow-md transition hover:bg-brand-accent-glow"
              >
                Get started
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface/80 px-8 py-3.5 text-base font-semibold text-ink transition hover:bg-surface"
              >
                Learn more
              </Link>
            </div>
            <ContentDisclaimer className="mt-4 max-w-xl" />
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <aside
              className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_30px_rgb(0_0_0_/0.06)]"
              aria-label="OET Coach preview"
            >
              <div className="bg-gradient-to-br from-forest-deep to-brand-primary px-6 py-8 text-center">
                <div className="mx-auto inline-flex rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-transparent">
                  <NikaAvatar size="xl" state="idle" glow={0.55} priority />
                </div>
                <p className="font-display mt-5 text-xl font-semibold text-[#F6F1E8]">
                  Meet Nika
                </p>
                <p className="mt-1 text-sm text-[#C9BBA8]">
                  Your OET study companion
                </p>
              </div>
              <div className="space-y-4 px-6 py-6">
                <p className="text-sm leading-relaxed text-ink-soft">
                  Personalised plans from diagnostic to exam ready — Listening, Reading,
                  Writing, and Speaking for all 12 healthcare professions.
                </p>
                <ul className="space-y-2.5 text-sm text-ink">
                  {[
                    "Adaptive daily study plan",
                    "Offline practice on any device",
                    "AI coaching grounded in OET criteria",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-accent-soft text-xs font-bold text-brand-primary"
                        aria-hidden
                      >
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border/80 bg-surface/50 backdrop-blur">
        <div className="page-container grid grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:py-12">
          {[
            { value: "12", label: "Professions" },
            { value: "4", label: "OET skills" },
            { value: "73+", label: "Writing scenarios" },
            { value: "100%", label: "Offline-capable" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-bold text-brand-primary sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="page-container px-4 py-16 sm:py-20" aria-labelledby="features-heading">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="features-heading" className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Everything you need to reach your grade
          </h2>
          <p className="mt-3 text-ink-soft">
            Professional tools designed for busy clinicians — responsive on phone, tablet, and
            desktop at any zoom level.
          </p>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className="feature-card rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-accent-soft/50 text-lg text-brand-primary"
                aria-hidden
              >
                {f.icon}
              </span>
              <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section
        className="border-t border-border bg-surface/60 px-4 py-16 sm:py-20"
        aria-labelledby="how-heading"
      >
        <div className="page-container">
          <h2 id="how-heading" className="font-display text-center text-3xl font-bold text-ink sm:text-4xl">
            How it works
          </h2>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li
                key={s.step}
                className="relative rounded-2xl border border-border bg-surface p-6"
              >
                <span className="font-display text-4xl font-bold text-brand-accent/40">
                  {s.step}
                </span>
                <h3 className="mt-2 font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="page-container px-4 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-forest-deep px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, rgb(255 214 110 / 0.35), transparent 55%)",
            }}
            aria-hidden
          />
          <NikaAvatar
            size="lg"
            state="encouraging"
            glow={0.8}
            className="relative z-10 mx-auto"
          />
          <h2 className="font-display relative z-10 mt-6 text-2xl font-bold text-[#F6F1E8] sm:text-3xl">
            Ready when you are
          </h2>
          <p className="relative z-10 mx-auto mt-3 max-w-lg text-sm text-[#C9BBA8] sm:text-base">
            Join healthcare professionals preparing with calm, personalised guidance from Nika.
          </p>
          <Link
            href="/login"
            className="relative z-10 mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-accent px-8 py-3.5 text-base font-semibold text-ink transition hover:bg-brand-accent-glow"
          >
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
