"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { syncSessionToLocalUser } from "@/lib/auth/sync-session-user";
import { isAdminUser } from "@/lib/auth/roles";
import { clearContentCatalogCache, warmContentCatalog } from "@/lib/content/merged-catalog";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { db } from "@/lib/db";
import type { LocalUser } from "@/lib/db/types";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  localUser: LocalUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const supabase = createClient();
    if (!supabase) {
      return () => {
        mountedRef.current = false;
      };
    }

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mountedRef.current) return;
      if (error) {
        setLoading(false);
        return;
      }
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mountedRef.current) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const refreshSession = () => {
      void supabase.auth.getSession().then(({ data }) => {
        if (data.session) setSession(data.session);
      });
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") refreshSession();
    };

    window.addEventListener("focus", refreshSession);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", refreshSession);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    if (loading || !session?.user) return;
    let active = true;

    const runSync = () => {
      void syncSessionToLocalUser(session).then((user) => {
        if (active) setLocalUser(user);
      });
    };

    runSync();

    const onReconnect = () => {
      if (document.visibilityState === "visible" && navigator.onLine) runSync();
    };

    window.addEventListener("online", onReconnect);
    document.addEventListener("visibilitychange", onReconnect);

    return () => {
      active = false;
      window.removeEventListener("online", onReconnect);
      document.removeEventListener("visibilitychange", onReconnect);
    };
  }, [session, loading]);

  useEffect(() => {
    if (!session?.access_token) {
      clearContentCatalogCache();
      return;
    }
    if (isAdminUser(session.user)) return;
    void warmContentCatalog(session.access_token);
  }, [session?.access_token, session?.user]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut({ scope: "local" });
    setSession(null);
    setLocalUser(null);
    clearContentCatalogCache();
    await db.syncOutbox.clear();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      localUser: session?.user ? localUser : null,
      loading,
      signOut,
    }),
    [session, localUser, loading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
