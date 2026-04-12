"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { CartItem, CustomerDetails, Product } from "@/types";
import CheckoutModal from "@/components/CheckoutModal";
import ExtrasModal from "@/components/ExtrasModal";

const CATEGORIES = ["Pizza", "Pasta & Mehr", "Vorspeise", "Salate", "Dessert", "Getränke"];
const MIN_ORDER = 15.00;
const SERVICE_FEE = 0.99;

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(sessionStorage.getItem("pizza_cart") || "[]"); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Pizza");
  const [cartBounce, setCartBounce] = useState(false);
  const [extrasProduct, setExtrasProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => { setProducts(d.products || []); setLoadingProducts(false); });
  }, []);

  useEffect(() => {
    sessionStorage.setItem("pizza_cart", JSON.stringify(cart));
  }, [cart]);

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const progressPct = Math.min((total / MIN_ORDER) * 100, 100);
  const missing = Math.max(MIN_ORDER - total, 0);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.cartKey === item.cartKey);
      if (existing) return prev.map((i) => i.cartKey === item.cartKey ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, item];
    });
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 300);
  }, []);

  const addSimpleToCart = useCallback((product: Product) => {
    const cartKey = product.id;
    const item: CartItem = {
      cartKey,
      productId: product.id,
      name: product.name,
      displayName: product.name,
      basePrice: product.base_price,
      size: null,
      extras: [],
      unitPrice: product.base_price,
      quantity: 1,
    };
    setCart((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) return prev.map((i) => i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, item];
    });
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 300);
  }, []);

  const removeFromCart = useCallback((cartKey: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.cartKey === cartKey);
      if (!item) return prev;
      if (item.quantity > 1) return prev.map((i) => i.cartKey === cartKey ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter((i) => i.cartKey !== cartKey);
    });
  }, []);

  const handleCheckout = async (details: CustomerDetails) => {
    // Vor-Ort-Bezahlung: Bestellung direkt anlegen, kein Stripe
    if (details.paymentType === "in_person") {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, customer: details }),
      });
      const data = await res.json();
      if (data.orderId) {
        sessionStorage.removeItem("pizza_cart");
        window.location.href = `/bestellung?order_id=${data.orderId}`;
      } else alert("Fehler beim Aufgeben der Bestellung. Bitte versuche es erneut.");
      return;
    }

    // Online-Bezahlung: Stripe Checkout
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, customer: details }),
      });
      const data = await res.json();
      if (data.url) {
        sessionStorage.removeItem("pizza_cart");
        window.location.href = data.url;
      } else {
        console.error("Stripe Checkout Error:", data.error);
        alert(data.error || "Fehler beim Erstellen der Zahlung. Bitte versuche es erneut.");
      }
    } catch (err) {
      console.error("Checkout fetch error:", err);
      alert("Verbindungsfehler. Bitte versuche es erneut.");
    }
  };

  const filteredProducts = products.filter((p) => p.category === activeCategory);
  const cartItemForProduct = (cartKey: string) => cart.find((i) => i.cartKey === cartKey);

  return (
    <>
      {/* HEADER */}
      <header className="fixed w-full bg-dark/95 backdrop-blur-md shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/logo.png" alt="Diavolo's Pizza" width={140} height={40} priority className="object-contain h-10 w-auto brightness-0 invert" />
          </div>
          <nav className="flex gap-4 md:gap-8 font-medium text-gray-300 text-sm md:text-base">
            <a href="#menu" className="hover:text-white transition-colors">Speisekarte</a>
            <a href="/pizza-konfigurator" className="hover:text-white transition-colors hidden sm:inline">Konfigurator</a>
            <a href="#contact" className="hover:text-white transition-colors hidden sm:inline">Kontakt</a>
          </nav>
          <button
            onClick={() => setCartOpen(true)}
            className={`relative flex items-center gap-2 bg-diavolored text-white px-4 py-2 rounded-full hover:bg-red-700 transition-all shadow-lg text-sm ${cartBounce ? "scale-110" : "scale-100"}`}
          >
            🛒
            <span className="font-medium hidden sm:inline">{total.toFixed(2).replace(".", ",")} €</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-diavolored text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-diavolored">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="parallax-bg h-screen flex items-center justify-center text-center px-4 pt-20">
        <div className="max-w-3xl">
          <h1 className="font-heading text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg">
            Teuflisch gute Pizza.
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 font-medium drop-shadow-md">
            Frisch aus dem Steinofen. Heiß & schnell zu dir nach Ingolstadt geliefert.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#menu" className="inline-block bg-diavolored text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-red-700 transition-transform transform hover:scale-105 shadow-xl">
              Jetzt bestellen
            </a>
            <a href="/pizza-konfigurator" className="inline-block bg-white/20 backdrop-blur text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-white/30 transition-transform transform hover:scale-105 shadow-xl border border-white/30">
              🍕 Pizza gestalten
            </a>
          </div>
          <p className="mt-6 text-gray-300 text-sm font-medium tracking-wide">Mindestbestellwert ab 15,00 €</p>
        </div>
      </section>

      {/* MENÜ */}
      <section id="menu" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl font-extrabold text-dark mb-4">Unsere Speisekarte</h2>
          <div className="h-1 w-20 bg-diavolored mx-auto rounded" />
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Original italienische Rezepturen, frische Zutaten und viel Amore. Allergen-Informationen auf Anfrage. Alle Pizzen Ø 30 cm mit Mozzarella & Tomatensauce.
          </p>
        </div>

        {/* Kategorie-Filter */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                activeCategory === cat ? "bg-diavolored text-white shadow-md" : "bg-white text-dark border border-gray-200 hover:border-diavolored"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loadingProducts ? (
          <div className="text-center py-20 text-gray-400 text-lg">🍕 Speisekarte wird geladen...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const simpleCartItem = cartItemForProduct(product.id);
              return (
                <div key={product.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        {product.number && <span className="text-xs text-gray-400 font-mono">#{product.number} </span>}
                        <h3 className="font-heading font-bold text-lg text-dark inline">
                          {product.name}
                        </h3>
                        {product.is_hot && <span className="ml-1 text-sm">🌶️</span>}
                        {product.is_vegetarian && <span className="ml-1 text-sm">🌿</span>}
                      </div>
                      <span className="text-diavologreen font-bold text-lg whitespace-nowrap ml-2">
                        {product.base_price.toFixed(2).replace(".", ",")} €
                        {product.has_sizes && <span className="text-xs text-gray-400 block text-right">ab</span>}
                      </span>
                    </div>
                    {product.description && <p className="text-gray-500 text-sm mb-2">{product.description}</p>}
                    {product.allergens && (
                      <p className="text-xs text-gray-400 mb-4">Allergene: {product.allergens}</p>
                    )}
                  </div>

                  {/* Wenn Pizza: Extras-Modal öffnen */}
                  {product.has_extras || product.has_sizes ? (
                    <button
                      onClick={() => setExtrasProduct(product)}
                      className="w-full border-2 border-diavolored text-diavolored font-semibold py-2 rounded-xl hover:bg-diavolored hover:text-white transition-colors"
                    >
                      Anpassen & hinzufügen
                    </button>
                  ) : (
                    /* Einfaches Produkt: direkt in den Warenkorb */
                    simpleCartItem ? (
                      <div className="flex items-center justify-between border-2 border-dark rounded-xl overflow-hidden">
                        <button onClick={() => removeFromCart(product.id)} className="px-4 py-2 hover:bg-gray-100 font-bold text-dark">−</button>
                        <span className="font-bold text-dark">{simpleCartItem.quantity}×</span>
                        <button onClick={() => addSimpleToCart(product)} className="px-4 py-2 hover:bg-gray-100 font-bold text-dark">+</button>
                      </div>
                    ) : (
                      <button onClick={() => addSimpleToCart(product)} className="w-full border-2 border-dark text-dark font-semibold py-2 rounded-xl hover:bg-dark hover:text-white transition-colors">
                        Hinzufügen
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ÜBER UNS */}
      <section id="about" className="bg-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-4xl font-extrabold mb-6">Teuflisch lecker seit Tag 1.</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Bei Diavolo&apos;s Pizza steht die Leidenschaft für echte italienische Küche im Mittelpunkt. Unsere Teige ruhen 24 Stunden, unsere Zutaten sind frisch und unser Ofen brennt heiß.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Wir liefern täglich nach Ingolstadt – außer dienstags. Weil auch Teufel mal Pause brauchen. 😈
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ icon: "🔥", label: "Echter Steinofen" }, { icon: "🇮🇹", label: "Ital. Originalrezepte" }, { icon: "⚡", label: "Schnelle Lieferung" }, { icon: "🔒", label: "Sichere Zahlung" }].map((f) => (
              <div key={f.label} className="bg-gray-800 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">{f.icon}</div>
                <p className="font-semibold text-sm">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="mb-6"><Image src="/logo.png" alt="Diavolo's Pizza" width={160} height={60} className="object-contain brightness-0 invert" /></div>
            <p className="mb-2">📍 Am Dachsberg 4, 85049 Ingolstadt</p>
            <p className="mb-2">📞 0841 99352893</p>
            <p>✉️ diavolospizzaingolstadt@gmail.com</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 font-heading">Öffnungszeiten</h4>
            <p className="mb-2 flex justify-between"><span>Montag</span><span>11:30 – 21:00</span></p>
            <p className="mb-2 flex justify-between text-diavolored font-bold"><span>Dienstag</span><span>RUHETAG</span></p>
            <p className="mb-2 flex justify-between"><span>Mittwoch – Sonntag</span><span>11:30 – 21:00</span></p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 font-heading">Sichere Zahlung</h4>
            <p className="text-sm leading-relaxed mb-4">Deine Zahlungsdaten sind sicher. Wir nutzen <strong className="text-white">Stripe</strong>. Wir sehen niemals deine Kartendaten.</p>
            <div className="flex gap-2 flex-wrap items-center">
              {/* Visa */}
              <div className="bg-white rounded-md flex items-center justify-center border border-gray-100" style={{width:54,height:34}}>
                <span style={{fontFamily:"Arial,sans-serif",fontWeight:900,fontSize:16,color:"#1A1F71",letterSpacing:-0.5}}>VISA</span>
              </div>
              {/* Mastercard */}
              <div className="bg-white rounded-md flex items-center justify-center border border-gray-100" style={{width:54,height:34}}>
                <svg viewBox="0 0 38 24" width="36" height="22">
                  <circle cx="14" cy="12" r="11" fill="#EB001B"/>
                  <circle cx="24" cy="12" r="11" fill="#F79E1B"/>
                  <path d="M19 3.6a11 11 0 0 1 0 16.8A11 11 0 0 1 19 3.6z" fill="#FF5F00"/>
                </svg>
              </div>
              {/* Apple Pay */}
              <div className="bg-white rounded-md flex items-center justify-center border border-gray-100" style={{width:54,height:34}}>
                <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif",fontWeight:500,fontSize:12,color:"#000"}}>{"\uF8FF"} Pay</span>
              </div>
              {/* Google Pay */}
              <div className="bg-white rounded-md flex items-center justify-center border border-gray-100" style={{width:64,height:34}}>
                <span style={{fontSize:11,fontWeight:600,letterSpacing:-0.3}}>
                  <span style={{color:"#4285F4"}}>G</span><span style={{color:"#EA4335"}}>o</span><span style={{color:"#FBBC05"}}>o</span><span style={{color:"#4285F4"}}>g</span><span style={{color:"#34A853"}}>l</span><span style={{color:"#EA4335"}}>e</span><span style={{color:"#000"}}> Pay</span>
                </span>
              </div>
              {/* Amex */}
              <div className="rounded-md flex items-center justify-center" style={{width:54,height:34,background:"#016FD0"}}>
                <span style={{fontFamily:"Arial,sans-serif",fontWeight:900,fontSize:11,color:"white",letterSpacing:0.5}}>AMEX</span>
              </div>
            </div>
            <p className="mt-6 text-xs text-gray-600">
              <a href="/impressum" className="hover:text-gray-400">Impressum</a> · <a href="/datenschutz" className="hover:text-gray-400">Datenschutz</a>
            </p>
          </div>
        </div>
      </footer>

      {/* WARENKORB OVERLAY */}
      {cartOpen && <div className="fixed inset-0 bg-black/50" onClick={() => setCartOpen(false)} style={{ zIndex: 60 }} />}

      {/* WARENKORB SIDEBAR */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white flex flex-col shadow-2xl"
        style={{ zIndex: 70, transform: cartOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-heading font-bold text-2xl text-dark">Dein Warenkorb</h2>
          <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-diavolored text-2xl leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 mt-16 text-lg">Dein Warenkorb ist noch leer. 🍕</p>
          ) : (
            cart.map((item) => (
              <div key={item.cartKey} className="flex justify-between items-start bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 mr-3">
                  <h4 className="font-bold text-dark text-sm leading-tight">{item.displayName}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.quantity}× {item.unitPrice.toFixed(2).replace(".", ",")} €</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-diavologreen">{(item.unitPrice * item.quantity).toFixed(2).replace(".", ",")} €</span>
                  <button onClick={() => removeFromCart(item.cartKey)} className="text-red-400 hover:text-red-600 w-7 h-7 rounded-full bg-red-50 flex items-center justify-center font-bold transition-colors">−</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Mindestbestellwert</span>
              <span>{total.toFixed(2).replace(".", ",")} € / 15,00 €</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full transition-all duration-500 ${total >= MIN_ORDER ? "bg-diavologreen" : "bg-diavolored"}`} style={{ width: `${progressPct}%` }} />
            </div>
            {missing > 0 && <p className="text-xs text-diavolored mt-1">Noch {missing.toFixed(2).replace(".", ",")} € bis zum Mindestbestellwert</p>}
          </div>
          {cart.length > 0 && (
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Servicegebühr</span>
              <span>+{SERVICE_FEE.toFixed(2).replace(".", ",")} €</span>
            </div>
          )}
          <div className="flex justify-between items-center mb-5">
            <span className="font-bold text-lg text-dark">Gesamtsumme:</span>
            <span className="font-bold text-2xl text-dark">{(total + (cart.length > 0 ? SERVICE_FEE : 0)).toFixed(2).replace(".", ",")} €</span>
          </div>
          <button
            disabled={total < MIN_ORDER}
            onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
            className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${total >= MIN_ORDER ? "bg-diavologreen text-white hover:bg-green-700 shadow-lg" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            🔒 Sicher zur Kasse
          </button>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {checkoutOpen && <CheckoutModal cart={cart} total={total} onClose={() => setCheckoutOpen(false)} onSubmit={handleCheckout} />}

      {/* EXTRAS MODAL */}
      {extrasProduct && <ExtrasModal product={extrasProduct} onClose={() => setExtrasProduct(null)} onAdd={addToCart} />}
    </>
  );
}
