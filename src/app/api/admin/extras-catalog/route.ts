import { createAdminClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("extras_catalog_config")
    .select("catalog, updated_at")
    .eq("id", 1)
    .single();
  return Response.json({ catalog: data?.catalog ?? null, updated_at: data?.updated_at ?? null });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });

  const { catalog, email, password } = await request.json();
  if (!catalog || !email || !password) {
    return Response.json({ error: "Katalog, E-Mail und Passwort erforderlich" }, { status: 400 });
  }

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: authData, error: authError } = await authClient.auth.signInWithPassword({ email, password });
  if (authError || !authData.user || authData.user.user_metadata?.role !== "admin") {
    return Response.json({ error: "Passwort falsch oder kein Admin" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("extras_catalog_config")
    .upsert({ id: 1, catalog, updated_at: new Date().toISOString() });

  if (error) return Response.json({ error: "Datenbankfehler" }, { status: 500 });
  return Response.json({ success: true });
}
