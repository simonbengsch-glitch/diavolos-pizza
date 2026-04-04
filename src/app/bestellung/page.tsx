"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

type Order = {
  id: string;
  status: string;
  customer_name: string;
  items: { name: string; quantity: number; price: number }[];
  total_amount: number;
  notes: string | null;
  created_at: string;
  order_type: "delivery" | "pickup";
  payment_type: "online" | "in_person";
};

const DELIVERY_STEPS = [
  { key: ["pending", "paid"],           icon: "✓",  label: "Bestätigt",        sub: "Deine Bestellung ist eingegangen" },
  { key: ["preparing"],                 icon: "🍕", label: "In Zubereitung",   sub: "Frisch für dich zubereitet" },
  { key: ["ready", "out_for_delivery"], icon: "🛵", label: "Unterwegs",        sub: "Dein Fahrer ist auf dem Weg" },
  { key: ["delivered"],                 icon: "🏠", label: "Geliefert",        sub: "Guten Appetit!" },
];

const PICKUP_STEPS = [
  { key: ["pending", "paid"],  icon: "✓",  label: "Bestätigt",          sub: "Deine Bestellung ist eingegangen" },
  { key: ["preparing"],        icon: "🍕", label: "In Zubereitung",     sub: "Frisch für dich zubereitet" },
  { key: ["ready"],            icon: "🏪", label: "Bereit zur Abholung", sub: "Komm vorbei – Am Dachsberg 4" },
  { key: ["delivered"],        icon: "✅", label: "Abgeholt",            sub: "Guten Appetit!" },
];

function getStepIndex(status: string, steps: typeof DELIVERY_STEPS): number {
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].key.includes(status)) return i;
  }
  return 0;
}

const EST_DELIVERY: Record<string, string> = {
  paid: "ca. 35–45 Min", preparing: "ca. 20–30 Min",
  ready: "ca. 10–20 Min", out_for_delivery: "ca. 5–15 Min", delivered: "",
};
const EST_PICKUP: Record<string, string> = {
  pending: "ca. 15–25 Min", preparing: "ca. 10–20 Min", ready: "Jetzt abholen!", delivered: "",
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchOrder = useCallback(async () => {
    const param = sessionId ? `session_id=${sessionId}` : `order_id=${orderId}`;
    if (!param) return;
    const res = await fetch(`/api/tracking?${param}`);
    if (res.ok) {
      const data = await res.json();
      setOrder(data.order);
    } else {
      setNotFound(true);
    }
  }, [sessionId, orderId]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10_000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if ((!sessionId && !orderId) || notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 font-medium">Bestellung nicht gefunden.</p>
          <a href="/" className="mt-4 inline-block text-diavolored font-bold">← Zur Startseite</a>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-spin">🌶️</div>
          <p className="text-gray-400">Lade Bestellstatus...</p>
        </div>
      </div>
    );
  }

  if (order.status === "cancelled") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="font-heading font-bold text-2xl text-dark mb-2">Bestellung storniert</h1>
          <p className="text-gray-500 mb-4">Deine Bestellung wurde storniert. Bitte ruf uns an.</p>
          <a href="tel:084199352893" className="text-diavolored font-bold text-lg">📞 0841 99352893</a>
        </div>
      </div>
    );
  }

  const isPickup = order.order_type === "pickup";
  const steps = isPickup ? PICKUP_STEPS : DELIVERY_STEPS;
  const stepIndex = getStepIndex(order.status, steps);
  const isDelivered = order.status === "delivered";
  const estMap = isPickup ? EST_PICKUP : EST_DELIVERY;
  const estTime = estMap[order.status] || "";
  const orderTime = new Date(order.created_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-dark px-6 py-4 flex items-center justify-center">
        <Image src="/logo.png" alt="Diavolo's Pizza" width={130} height={48} className="object-contain brightness-0 invert h-10 w-auto" />
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
        {/* Haupt-Status */}
        <div className={`rounded-3xl text-white p-8 text-center shadow-xl ${isDelivered ? "bg-diavologreen" : "bg-diavolored"}`}>
          <div className="text-5xl mb-3">{isDelivered ? "🎉" : steps[stepIndex].icon}</div>
          <h1 className="font-heading font-extrabold text-2xl mb-1">{steps[stepIndex].label}</h1>
          <p className="text-white/80 text-sm">{steps[stepIndex].sub}</p>
          {estTime && (
            <div className="mt-4 bg-white/20 rounded-2xl px-4 py-2 inline-block">
              <p className="text-sm font-bold">⏱ {estTime}</p>
            </div>
          )}
          {/* Badges */}
          <div className="flex justify-center gap-2 mt-4">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
              {isPickup ? "🏪 Abholung" : "🛵 Lieferung"}
            </span>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
              {order.payment_type === "in_person" ? "💵 Vor Ort" : "💳 Online bezahlt"}
            </span>
          </div>
        </div>

        {/* Fortschritts-Schritte */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-diavolored transition-all duration-700"
              style={{ width: `${(stepIndex / (steps.length - 1)) * (100 - (10 / steps.length))}%` }}
            />
            {steps.map((step, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div key={i} className="flex flex-col items-center gap-2 z-10 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all duration-500 ${
                    done  ? "bg-diavolored border-diavolored text-white" :
                    active ? "bg-white border-diavolored text-diavolored ring-4 ring-diavolored/20" :
                             "bg-white border-gray-200 text-gray-300"
                  }`}>
                    {done ? "✓" : step.icon}
                  </div>
                  <span className={`text-xs text-center font-semibold leading-tight ${active ? "text-diavolored" : done ? "text-gray-600" : "text-gray-300"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Abholung Adresse */}
        {isPickup && order.status === "ready" && (
          <a
            href="https://www.google.com/maps/search/?api=1&query=Am+Dachsberg+4+85049+Ingolstadt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-diavologreen text-white rounded-2xl px-5 py-4 shadow-sm"
          >
            <span className="text-2xl">📍</span>
            <div>
              <p className="font-bold">Am Dachsberg 4, 85049 Ingolstadt</p>
              <p className="text-white/80 text-sm">In Google Maps öffnen →</p>
            </div>
          </a>
        )}

        {/* Bestellübersicht */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <p className="font-bold text-dark">Deine Bestellung</p>
              <p className="text-xs text-gray-400">Aufgegeben um {orderTime} Uhr</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg font-mono">
              #{order.id.slice(-6).toUpperCase()}
            </span>
          </div>
          <div className="px-5 py-4 space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.quantity}× {item.name}</span>
                <span className="font-semibold text-dark">{(item.price * item.quantity).toFixed(2).replace(".", ",")} €</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-dark">
              <span>Gesamt</span>
              <span className="text-diavologreen">{(order.total_amount / 100).toFixed(2).replace(".", ",")} €</span>
            </div>
          </div>
          {order.notes && (
            <div className="px-5 pb-4">
              <p className="text-xs text-gray-400 bg-yellow-50 rounded-xl px-3 py-2">
                💬 <strong>Dein Hinweis:</strong> {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Kontakt */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-dark text-sm">Fragen zur Bestellung?</p>
            <p className="text-xs text-gray-400">Diavolo&apos;s Pizza · Ingolstadt</p>
          </div>
          <a href="tel:084199352893" className="bg-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
            📞 Anrufen
          </a>
        </div>

        <p className="text-center text-xs text-gray-400">Aktualisiert automatisch alle 10 Sekunden</p>
      </div>
    </div>
  );
}

export default function BestellungPage() {
  return (
    <Suspense>
      <TrackingContent />
    </Suspense>
  );
}
