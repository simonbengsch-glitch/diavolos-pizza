import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("extras")
    .select("*")
    .eq("is_available", true)
    .order("sort_order");

  if (error) return Response.json({ error: "Datenbankfehler" }, { status: 500 });
  return Response.json({ extras: data });
}
