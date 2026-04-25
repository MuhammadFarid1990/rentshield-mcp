import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/role-select", "/signup", "/about"];
const SENIOR_PATHS = ["/home", "/talk", "/today", "/calendar", "/reminders", "/medication", "/health", "/wellness", "/help", "/messages", "/offline-card"];
const GUARDIAN_PATHS = ["/guardian"];
const CENTER_PATHS = ["/center"];
const ADMIN_PATHS = ["/admin"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Allow public routes without auth
  if (isPublic(pathname)) return supabaseResponse;

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Fetch role for authorization
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = userData?.role ?? "senior";

  const isSeniorPath = SENIOR_PATHS.some((p) => pathname.startsWith(p));
  const isGuardianPath = GUARDIAN_PATHS.some((p) => pathname.startsWith(p));
  const isCenterPath = CENTER_PATHS.some((p) => pathname.startsWith(p));
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (isSeniorPath && role !== "senior") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isGuardianPath && !["guardian", "admin"].includes(role)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isCenterPath && !["staff", "admin"].includes(role)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAdminPath && role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest).*)"],
};
