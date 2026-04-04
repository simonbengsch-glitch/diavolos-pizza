import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pizza_sizes")
    .select("*")
    .order("sort_order");

  if (error) return Response.json({ error: "Datenbankfehler" }, { status: 500 });
  return Response.json({ sizes: data });
}
