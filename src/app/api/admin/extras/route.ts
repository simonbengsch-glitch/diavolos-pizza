import { createAdminClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("extras").select("*").order("sort_order");
  if (error) return Response.json({ error: "Datenbankfehler" }, { status: 500 });
  return Response.json({ extras: data });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  const body = await request.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("extras").insert(body).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ extra: data });
}
