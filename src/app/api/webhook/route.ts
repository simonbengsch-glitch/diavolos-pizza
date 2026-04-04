import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Fehlende Stripe-Signatur", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook Signatur-Fehler:", err);
    return new Response("Ungültige Signatur", { status: 400 });
  }

  // Zahlung erfolgreich abgeschlossen
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const supabase = createAdminClient();

    // Bestellstatus auf "paid" aktualisieren
    const { error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("stripe_session_id", session.id);

    if (error) {
      console.error("Supabase Update Error:", error);
      return new Response("Datenbankfehler", { status: 500 });
    }

    console.log(`✅ Bestellung bezahlt: ${session.id}`);
  }

  // Zahlung fehlgeschlagen / abgebrochen
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createAdminClient();

    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("stripe_session_id", session.id);
  }

  return new Response("OK", { status: 200 });
}
