import { isAdmin } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const isClosed = cookieStore.get("shop_closed")?.value === "true";
  return Response.json({ is_closed: isClosed });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  const { is_closed } = await request.json();
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set(
    "Set-Cookie",
    `shop_closed=${is_closed}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
  );
  return new Response(JSON.stringify({ success: true, is_closed }), { status: 200, headers });
}
