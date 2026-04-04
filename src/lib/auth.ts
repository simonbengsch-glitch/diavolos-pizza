import { cookies } from "next/headers";

export type AdminRole = "admin" | "driver" | null;

export async function getSessionRole(): Promise<AdminRole> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const role = cookieStore.get("admin_role")?.value;

  if (!session) return null;

  const adminToken = process.env.ADMIN_SESSION_TOKEN;
  const driverToken = process.env.DRIVER_SESSION_TOKEN;

  if (adminToken && session === adminToken && role === "admin") return "admin";
  if (driverToken && session === driverToken && role === "driver") return "driver";

  // Legacy-Fallback (vor Rolleneinführung)
  if (!adminToken && session === "authenticated") return "admin";

  return null;
}

export async function isAdmin(): Promise<boolean> {
  return (await getSessionRole()) === "admin";
}

export async function isDriverOrAdmin(): Promise<boolean> {
  const role = await getSessionRole();
  return role === "admin" || role === "driver";
}
