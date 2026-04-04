import { createAdminClient } from "@/lib/supabase/server";
import { isDriverOrAdmin } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isDriverOrAdmin())) {
    return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const validStatuses = ["paid", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return Response.json({ error: "Ungültiger Status" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    return Response.json({ error: "Datenbankfehler" }, { status: 500 });
  }

  return Response.json({ success: true });
}
