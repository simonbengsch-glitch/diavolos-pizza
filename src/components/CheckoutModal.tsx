"use client";

import { useState, FormEvent } from "react";
import { CartItem, CustomerDetails } from "@/types";

interface Props {
  cart: CartItem[];
  total: number;
  onClose: () => void;
  onSubmit: (details: CustomerDetails) => Promise<void>;
}

export default function CheckoutModal({ cart, total, onClose, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [paymentType, setPaymentType] = useState<"online" | "in_person">("online");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", street: "", city: "Ingolstadt", zip: "", notes: "", wunschzeit: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ ...form, orderType, paymentType });
    } finally {
      setLoading(false);
    }
  };

  const isDelivery = orderType === "delivery";

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 80 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="font-heading font-bold text-2xl text-dark">Bestellung aufgeben</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-diavolored text-2xl leading-none transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Bestellübersicht */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Deine Bestellung</p>
            {cart.map((item) => (
              <div key={item.cartKey} className="flex justify-between text-sm py-1">
                <span className="text-dark">{item.quantity}× {item.displayName}</span>
                <span className="font-semibold text-dark">{(item.unitPrice * item.quantity).toFixed(2).replace(".", ",")} €</span>
              </div>
            ))}
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold">
              <span>Gesamt</span>
              <span className="text-diavologreen">{total.toFixed(2).replace(".", ",")} €</span>
            </div>
          </div>

          {/* Lieferung / Abholung Toggle */}
          <div>
            <p className="text-sm font-semibold text-dark mb-2">Wie möchtest du bestellen?</p>
            <div className="grid grid-cols-2 gap-2">
              {(["delivery", "pickup"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`flex flex-col items-center gap-1 py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                    orderType === type
                      ? "border-diavolored bg-red-50 text-diavolored"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl">{type === "delivery" ? "🛵" : "🏃"}</span>
                  {type === "delivery" ? "Lieferung" : "Selbst abholen"}
                </button>
              ))}
            </div>
          </div>

          {/* Abholung Info */}
          {!isDelivery && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
              <strong>Abholung:</strong> Am Dachsberg 4, 85049 Ingolstadt<br />
              <span className="text-blue-600 text-xs">Mo, Mi–So 11:30–21:00 · Di Ruhetag</span>
            </div>
          )}

          {/* Kontaktdaten */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-dark">Deine Kontaktdaten</p>

            <div>
              <label className="block text-sm font-semibold text-dark mb-1">Vollständiger Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Max Mustermann"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-diavolored focus:ring-2 focus:ring-diavolored/10 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-1">E-Mail-Adresse *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="max@beispiel.de"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-diavolored focus:ring-2 focus:ring-diavolored/10 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-1">Telefonnummer *</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="0841 123456"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-diavolored focus:ring-2 focus:ring-diavolored/10 transition-all" />
            </div>
          </div>

          {/* Lieferadresse (nur bei Lieferung) */}
          {isDelivery && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-dark">Lieferadresse</p>
              <div>
                <label className="block text-sm font-semibold text-dark mb-1">Straße & Hausnummer *</label>
                <input type="text" name="street" value={form.street} onChange={handleChange} required placeholder="Musterstraße 12"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-diavolored focus:ring-2 focus:ring-diavolored/10 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1">PLZ *</label>
                  <input type="text" name="zip" value={form.zip} onChange={handleChange} required placeholder="85049" maxLength={5} pattern="[0-9]{5}"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-diavolored focus:ring-2 focus:ring-diavolored/10 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1">Stadt *</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-diavolored focus:ring-2 focus:ring-diavolored/10 transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* Bezahlmethode */}
          <div>
            <p className="text-sm font-semibold text-dark mb-2">Bezahlmethode</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType("online")}
                className={`flex flex-col items-center gap-1 py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                  paymentType === "online"
                    ? "border-diavolored bg-red-50 text-diavolored"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">💳</span>
                Online bezahlen
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("in_person")}
                className={`flex flex-col items-center gap-1 py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                  paymentType === "in_person"
                    ? "border-diavolored bg-red-50 text-diavolored"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">💵</span>
                Barzahlung
              </button>
            </div>
            {paymentType === "in_person" && (
              <p className="text-xs text-gray-400 mt-2 text-center">Bar oder Karte beim {isDelivery ? "Fahrer" : "Abholen"}</p>
            )}
          </div>

          {/* Wunschzeit */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1">Wunschzeit (optional)</label>
            <input
              type="datetime-local"
              name="wunschzeit"
              value={form.wunschzeit}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-diavolored focus:ring-2 focus:ring-diavolored/10 transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">Leer lassen = schnellstmöglich</p>
          </div>

          {/* Anmerkungen */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1">Anmerkungen (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              placeholder={isDelivery ? "z.B. 2. Etage, kein Aufzug, extra scharf..." : "z.B. Abholzeit, Sonderwünsche..."}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-diavolored focus:ring-2 focus:ring-diavolored/10 transition-all resize-none" />
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            🔒 Deine Daten werden ausschließlich für die Bestellabwicklung genutzt.
            {paymentType === "online" && " Zahlungsabwicklung verschlüsselt über Stripe."}
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-diavolored text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <><span className="animate-spin">⏳</span> Wird bearbeitet...</>
            ) : paymentType === "online" ? (
              <>💳 Jetzt sicher bezahlen</>
            ) : (
              <>✓ Bestellung aufgeben</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
