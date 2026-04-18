import { createAdminClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { isProtectedAdmin } from "@/lib/protectedAdmin";

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) return Response.json({ error: "Fehler beim Laden" }, { status: 500 });

  const staff = data.users
    .filter((u) => u.user_metadata?.role === "admin" || u.user_metadata?.role === "driver")
    .map((u) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || "",
      role: u.user_metadata?.role,
      created_at: u.created_at,
      is_protected: isProtectedAdmin(u.email),
    }));

  return Response.json({ staff });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { email, password, role, name } = await request.json();
  if (!email || !password || !role || !name) {
    return Response.json({ error: "Alle Felder erforderlich" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.createUser({
    email: email.toLowerCase().trim(),
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });

  if (error) {
    if (error.message.includes("already")) return Response.json({ error: "E-Mail bereits vergeben" }, { status: 409 });
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
