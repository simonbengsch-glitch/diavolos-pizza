import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const attempts: Map<string, { count: number; resetAt: number }> = new Map();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 5;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return new Response("Zu viele Versuche. Bitte warte eine Minute.", { status: 429 });
  }

  const { email, password } = await request.json();
  if (!email || !password) {
    return new Response("E-Mail und Passwort erforderlich", { status: 400 });
  }

  // Login via Supabase Auth
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return new Response("Ungültige Zugangsdaten", { status: 401 });
  }

  const role = data.user.user_metadata?.role as string;
  if (role !== "admin" && role !== "driver") {
    return new Response("Kein Zugriff", { status: 403 });
  }

  const adminToken = process.env.ADMIN_SESSION_TOKEN || "authenticated";
  const driverToken = process.env.DRIVER_SESSION_TOKEN || "driver";
  const sessionToken = role === "admin" ? adminToken : driverToken;

  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 8,
    path: "/",
  };

  cookieStore.set("admin_session", sessionToken, cookieOpts);
  cookieStore.set("admin_role", role, { ...cookieOpts, httpOnly: false });

  return Response.json({ role });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  cookieStore.delete("admin_role");
  return new Response("OK", { status: 200 });
}
