import { createAdminClient } from "@/lib/supabase/server";
import { CartItem } from "@/types";

export interface PricedItem {
  displayName: string;
  unitPrice: number;
  quantity: number;
  productId: string;
}

export interface PricingResult {
  items: PricedItem[];
  total: number;
}

export class PricingError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
  }
}

// Serverseitige Preisberechnung:
// - liest base_price / extra_price / extras.price frisch aus Supabase
// - ignoriert vom Client geschickte Preise (Schutz gegen Manipulation)
// - stellt sicher, dass Admin-Änderungen sofort in Stripe/Bestellungen landen
export async function repriceCart(cart: CartItem[]): Promise<PricingResult> {
  if (!cart || cart.length === 0) {
    throw new PricingError("Warenkorb ist leer");
  }

  const supabase = createAdminClient();

  const productIds = Array.from(new Set(cart.map((i) => i.productId)));
  const sizeIds = Array.from(new Set(cart.map((i) => i.size?.id).filter((x): x is string => !!x)));
  const extraIds = Array.from(new Set(cart.flatMap((i) => i.extras.map((e) => e.id))));

  const [{ data: products, error: pErr }, { data: sizes, error: sErr }, { data: extras, error: eErr }] = await Promise.all([
    supabase.from("products").select("id, name, base_price, is_available").in("id", productIds),
    sizeIds.length
      ? supabase.from("pizza_sizes").select("id, extra_price").in("id", sizeIds)
      : Promise.resolve({ data: [] as { id: string; extra_price: number }[], error: null }),
    extraIds.length
      ? supabase.from("extras").select("id, price, is_available").in("id", extraIds)
      : Promise.resolve({ data: [] as { id: string; price: number; is_available: boolean }[], error: null }),
  ]);

  if (pErr || sErr || eErr) {
    throw new PricingError("Preise konnten nicht geladen werden", 500);
  }

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const sizeMap = new Map((sizes ?? []).map((s) => [s.id, Number(s.extra_price)]));
  const extraMap = new Map((extras ?? []).map((e) => [e.id, { price: Number(e.price), is_available: e.is_available }]));

  const pricedItems: PricedItem[] = cart.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new PricingError(`Produkt nicht mehr verfügbar: ${item.displayName}`);
    if (!product.is_available) throw new PricingError(`Produkt ausverkauft: ${product.name}`);

    let unitPrice = Number(product.base_price);

    if (item.size?.id) {
      const sizePrice = sizeMap.get(item.size.id);
      if (sizePrice === undefined) throw new PricingError(`Größe nicht mehr verfügbar: ${item.size.label}`);
      unitPrice += sizePrice;
    }

    // Extras: bei Halb-Halb zählen einzigartige Beläge aus beiden Hälften, nicht doppelt
    const uniqueExtraIds = Array.from(new Set(item.extras.map((e) => e.id)));
    for (const exId of uniqueExtraIds) {
      const ex = extraMap.get(exId);
      if (!ex) throw new PricingError(`Belag nicht mehr verfügbar`);
      if (!ex.is_available) throw new PricingError(`Belag ausverkauft`);
      unitPrice += ex.price;
    }

    unitPrice = Math.round(unitPrice * 100) / 100;

    return {
      displayName: item.displayName,
      unitPrice,
      quantity: item.quantity,
      productId: item.productId,
    };
  });

  const total = pricedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return { items: pricedItems, total: Math.round(total * 100) / 100 };
}
