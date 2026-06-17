"use client";

import { useEffect, useRef, useState } from "react";

import {
  clearHandledAuthCode,
  markAuthCodeHandled,
  readHandledAuthCode,
  resolvePostAuthRedirect,
  stripAuthCallbackParams,
} from "@/lib/auth/callback-utils";
import { signInNotConfiguredMessage } from "@/lib/messages/user-facing";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const startedRef = useRef(false);
  const [status, setStatus] = useState(() =>
    isSupabaseConfigured()
      ? "Completing sign-in…"
      : signInNotConfiguredMessage(),
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const supabase = createClient();
    if (!supabase) return;

    const url = new URL(window.location.href);
    const oauthError =
      url.searchParams.get("error_description") ??
      url.searchParams.get("error");

    const code = stripAuthCallbackParams();

    if (oauthError) {
      window.location.replace("/login?error=signin_failed");
      return;
    }

    void (async () => {
      try {
        if (code && readHandledAuthCode() !== code) {
          markAuthCodeHandled(code);
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            clearHandledAuthCode();
            setStatus("Sign-in failed. Redirecting…");
            window.location.replace("/login?error=signin_failed");
            return;
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setStatus("Sign-in timed out. Redirecting…");
          window.location.replace("/login?error=signin_timeout");
          return;
        }

        setStatus("Signed in. Redirecting…");

        try {
          const pendingAi = sessionStorage.getItem("oet-coach-pending-ai-consent");
          if (pendingAi === "1" && session.access_token) {
            sessionStorage.removeItem("oet-coach-pending-ai-consent");
            await fetch("/api/v1/profile/me", {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ai_consent: true }),
            });
          }
        } catch {
          /* best-effort */
        }

        const destination = await resolvePostAuthRedirect(session);
        if (destination.includes("admin_magic_link_only")) {
          await supabase.auth.signOut({ scope: "local" });
        }
        window.location.replace(destination);
      } catch {
        clearHandledAuthCode();
        window.location.replace("/login?error=signin_failed");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <p className="text-ink-soft">{status}</p>
    </div>
  );
}
