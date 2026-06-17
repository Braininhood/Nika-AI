"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  formatAuthError,
  formatCooldown,
  getOtpCooldownRemainingMs,
  isEmailRateLimitError,
  setOtpCooldown,
} from "@/lib/auth/errors";
import { resolvePostAuthRedirect } from "@/lib/auth/callback-utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-provider";
import { NikaAvatar } from "@/components/nika/nika-avatar";
import { SIGNUP_DISCLAIMER } from "@/content/legal/constants";
import {
  isKnownAdminEmail,
} from "@/lib/auth/roles";
import { signInNotConfiguredMessage } from "@/lib/messages/user-facing";

function authErrorFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const authError = new URLSearchParams(window.location.search).get("error");
  if (!authError) return null;
  if (authError === "signin_failed") {
    return "Sign-in failed. Please try Google again or use a fresh magic link.";
  }
  if (authError === "signin_timeout") {
    return "Sign-in timed out. Please try again.";
  }
  if (authError === "admin_magic_link_only") {
    return "This sign-in method isn't available for this account. Use the email magic link instead.";
  }
  return "Sign-in failed. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAi, setAcceptedAi] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    setMounted(true);
    setError(authErrorFromUrl());
  }, []);

  useEffect(() => {
    if (authLoading || !session) return;
    void resolvePostAuthRedirect(session).then((dest) => {
      router.replace(dest);
    });
  }, [authLoading, session, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!new URLSearchParams(window.location.search).get("error")) return;
    window.history.replaceState({}, "", "/login");
  }, []);

  useEffect(() => {
    const tick = () => {
      const remaining = getOtpCooldownRemainingMs(email);
      setCooldownSeconds(Math.ceil(remaining / 1000));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [email]);

  const magicLinkDisabled = loading || cooldownSeconds > 0 || !acceptedTerms;
  const oauthDisabled = loading || !acceptedTerms;
  const adminEmailLogin = mounted && isKnownAdminEmail(email);
  const showGoogleSignIn = mounted && !adminEmailLogin;

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Please accept the Terms and Privacy Policy to continue.");
      return;
    }
    if (!configured) {
      setError(signInNotConfiguredMessage());
      return;
    }
    if (cooldownSeconds > 0) {
      setError(`Please wait ${formatCooldown(cooldownSeconds)} before requesting another magic link.`);
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      if (!supabase) return;
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signInError) throw signInError;
      if (acceptedAi) {
        try {
          sessionStorage.setItem("oet-coach-pending-ai-consent", "1");
        } catch {
          /* ignore */
        }
      }
      setOtpCooldown(email);
      setMessage(
        "We sent a sign-in link to your email. Open it on this device — the link expires in a few minutes.",
      );
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Sign-in failed";
      setError(formatAuthError(raw, { suggestGoogle: !isKnownAdminEmail(email) }));
      if (isEmailRateLimitError(raw)) {
        setOtpCooldown(email, 60 * 60 * 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!acceptedTerms) {
      setError("Please accept the Terms and Privacy Policy to continue.");
      return;
    }
    if (!configured) {
      setError(signInNotConfiguredMessage());
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createClient();
      if (!supabase) return;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) throw oauthError;
      if (acceptedAi) {
        try {
          sessionStorage.setItem("oet-coach-pending-ai-consent", "1");
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-md flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <NikaAvatar size="md" state="greeting" className="mb-4 sm:hidden" priority />
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          ← Back
        </Link>
        <h1 className="font-display mt-4 text-2xl font-bold text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Magic link or Google — no password required.
        </p>
      </div>

      {!configured && process.env.NODE_ENV === "development" && (
        <p className="rounded-xl bg-warning/10 px-4 py-3 text-sm text-ink">
          {signInNotConfiguredMessage()}
        </p>
      )}
      {!configured && process.env.NODE_ENV !== "development" && (
        <p className="rounded-xl bg-warning/10 px-4 py-3 text-sm text-ink">
          Sign-in is temporarily unavailable. Please try again later.
        </p>
      )}

      <label className="flex gap-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-ink-soft">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 rounded border-border accent-brand-primary"
          required
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="font-medium text-brand-primary hover:underline">
            Terms of Service
          </Link>
          ,{" "}
          <Link href="/privacy" className="font-medium text-brand-primary hover:underline">
            Privacy Policy
          </Link>
          , and understand that {SIGNUP_DISCLAIMER.slice(0, 80)}…
        </span>
      </label>

      <label className="flex gap-3 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-ink-soft">
        <input
          type="checkbox"
          checked={acceptedAi}
          onChange={(e) => setAcceptedAi(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 rounded border-border accent-brand-primary"
        />
        <span>
          I consent to AI processing of my practice text for Nika tutor and writing/speaking
          feedback (see{" "}
          <Link href="/privacy" className="font-medium text-brand-primary hover:underline">
            Privacy Policy
          </Link>
          ). You can change this later in Profile.
        </span>
      </label>

      <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand-accent"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
        <button
          type="submit"
          disabled={magicLinkDisabled}
          className="min-h-11 w-full rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink transition hover:bg-brand-accent-glow disabled:opacity-50"
        >
          {loading
            ? "Sending…"
            : cooldownSeconds > 0
              ? `Wait ${formatCooldown(cooldownSeconds)}`
              : "Send magic link"}
        </button>
        {cooldownSeconds > 0 && cooldownSeconds >= 60 && (
          <p className="text-xs text-ink-soft">
            {adminEmailLogin
              ? "Too many sign-in emails were sent recently. Wait about an hour, then try again."
              : "Too many sign-in emails were sent recently. Wait about an hour, then try again — or use Continue with Google below."}
          </p>
        )}
      </form>

      {showGoogleSignIn && (
        <>
          <div className="flex items-center gap-3 text-xs text-ink-soft">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={() => void handleGoogle()}
            disabled={oauthDisabled}
            className="min-h-11 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:opacity-50"
          >
            Continue with Google
          </button>
        </>
      )}

      {message && (
        <p className="rounded-xl bg-success/10 px-4 py-3 text-sm text-forest-deep">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <p className="text-center text-xs text-ink-soft">
        <Link href="/privacy" className="hover:text-brand-primary hover:underline">
          Privacy
        </Link>
        {" · "}
        <Link href="/terms" className="hover:text-brand-primary hover:underline">
          Terms
        </Link>
      </p>
    </div>
  );
}
