import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("extras_catalog_config")
    .select("catalog")
    .eq("id", 1)
    .single();
  return Response.json({ catalog: data?.catalog ?? null });
}
