import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isAdminPath, isAdminUser, isLearnerStudyPath } from "@/lib/auth/roles";
import { applySecurityHeaders } from "@/lib/security/headers";

const IS_DEV = process.env.NODE_ENV === "development";

function secure(response: NextResponse): NextResponse {
  return applySecurityHeaders(response, IS_DEV);
}

const PUBLIC_EXACT = new Set([
  "/",
  "/login",
  "/privacy",
  "/terms",
  "/cookies",
  "/about",
  "/contact",
  "/install",
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (pathname.startsWith("/auth/")) return true;
  return false;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return secure(supabaseResponse);
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && !isPublicPath(pathname)) {
    if (isLearnerStudyPath(pathname) || isAdminPath(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return secure(NextResponse.redirect(loginUrl));
    }
  }

  if (user && isAdminPath(pathname) && !isAdminUser(user)) {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    return secure(NextResponse.redirect(home));
  }

  return secure(supabaseResponse);
}
