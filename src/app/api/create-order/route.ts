import { createAdminClient } from "@/lib/supabase/server";
import { CartItem, CustomerDetails } from "@/types";
import { repriceCart, PricingError } from "@/lib/pricing";

// Für Abholung + Vor-Ort-Zahlung (kein Stripe)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cart: CartItem[] = body.cart;
    const customer: CustomerDetails = body.customer;

    // Preise frisch aus der Datenbank: identische Logik wie bei Stripe-Checkout
    let priced;
    try {
      priced = await repriceCart(cart);
    } catch (err) {
      if (err instanceof PricingError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const total = priced.total;
    const address = customer.orderType === "pickup"
      ? "Abholung – Am Dachsberg 4, 85049 Ingolstadt"
      : `${customer.street}, ${customer.zip} ${customer.city}`;

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("orders").insert({
      stripe_session_id: null,
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
    }).select("id").single();

    if (error) {
      console.error("Order insert error:", error);
      return Response.json({ error: "Datenbankfehler" }, { status: 500 });
    }

    return Response.json({ orderId: data.id });
  } catch (error) {
    console.error("Create order error:", error);
    return Response.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
