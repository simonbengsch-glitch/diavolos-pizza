import { createAdminClient } from "@/lib/supabase/server";
import { isDriverOrAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await isDriverOrAdmin())) {
    return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);
  if (!from && !to) query = query.limit(200);

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: "Datenbankfehler" }, { status: 500 });
  }

  return Response.json({ orders: data });
}
