import { createAdminClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { isProtectedAdmin } from "@/lib/protectedAdmin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await params;
  const { email, password, role, name } = await request.json();

  const supabase = createAdminClient();

  const { data: existing } = await supabase.auth.admin.getUserById(id);
  if (isProtectedAdmin(existing?.user?.email)) {
    return Response.json(
      { error: "Dieser Admin-Account ist geschützt und kann nicht bearbeitet werden." },
      { status: 403 }
    );
  }

  const updates: { email?: string; password?: string; user_metadata?: Record<string, string> } = {};
  if (email) updates.email = email.toLowerCase().trim();
  if (password) updates.password = password;

  // Metadaten zusammenführen
  if (role || name) {
    updates.user_metadata = {
      ...existing?.user?.user_metadata,
      ...(role ? { role } : {}),
      ...(name ? { name } : {}),
    };
  }

  const { error } = await supabase.auth.admin.updateUserById(id, updates);

  if (error) {
    if (error.message.includes("already")) return Response.json({ error: "E-Mail bereits vergeben" }, { status: 409 });
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: existing } = await supabase.auth.admin.getUserById(id);
  if (isProtectedAdmin(existing?.user?.email)) {
    return Response.json(
      { error: "Dieser Admin-Account ist geschützt und kann nicht gelöscht werden." },
      { status: 403 }
    );
  }

  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
