import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  if (!sessionId && !orderId) {
    return Response.json({ error: "Keine ID angegeben" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const query = supabase
    .from("orders")
    .select("id, status, customer_name, items, created_at, total_amount, notes, order_type, payment_type");

  const { data, error } = sessionId
    ? await query.eq("stripe_session_id", sessionId).single()
    : await query.eq("id", orderId).single();

  if (error || !data) {
    return Response.json({ error: "Bestellung nicht gefunden" }, { status: 404 });
  }

  return Response.json({ order: data });
}
