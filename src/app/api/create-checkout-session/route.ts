import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { CartItem, CustomerDetails } from "@/types";
import { repriceCart, PricingError } from "@/lib/pricing";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY ist nicht gesetzt!");
    return Response.json({ error: "Stripe ist nicht konfiguriert" }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const body = await request.json();
    const cart: CartItem[] = body.cart;
    const customer: CustomerDetails = body.customer;

    // Preise frisch aus der Datenbank: Admin-Änderungen schlagen sofort in Stripe durch
    let priced;
    try {
      priced = await repriceCart(cart);
    } catch (err) {
      if (err instanceof PricingError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").trim();
    const isPickup = customer.orderType === "pickup";
    const address = isPickup
      ? "Abholung – Am Dachsberg 4, 85049 Ingolstadt"
      : `${customer.street}, ${customer.zip} ${customer.city}`;
    const total = priced.total;

    const lineItems = priced.items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: { name: item.displayName },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: customer.email,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      locale: "de",
      metadata: {
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: address,
        notes: customer.notes || "",
      },
      payment_intent_data: {
        description: isPickup
          ? `Diavolo's Pizza – Abholung`
          : `Diavolo's Pizza – Lieferung an ${address}`,
      },
    });

    // Bestellung in Supabase speichern (mit serverseitig validierten Preisen)
    const supabase = createAdminClient();
    const { error: dbError } = await supabase.from("orders").insert({
      stripe_session_id: session.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_address: address,
      items: priced.items.map((item) => ({
        name: item.displayName,
        price: item.unitPrice,
        quantity: item.quantity,
      })),
      total_amount: Math.round(total * 100),
      status: "pending",
      notes: customer.notes || null,
      order_type: customer.orderType,
      payment_type: customer.paymentType,
    });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
    }

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout Session Error:", error);
    const message = error instanceof Error ? error.message : "Interner Serverfehler";
    return Response.json({ error: `Stripe-Fehler: ${message}` }, { status: 500 });
  }
}
