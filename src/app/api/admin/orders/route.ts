import { createAdminClient } from "@/lib/supabase/server";
import { isDriverOrAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isDriverOrAdmin())) {
    return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return Response.json({ error: "Datenbankfehler" }, { status: 500 });
  }

  return Response.json({ orders: data });
}
