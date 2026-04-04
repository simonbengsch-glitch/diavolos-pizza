"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  status: string;
  notes: string | null;
  created_at: string;
};

export default function FahrerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const data = await res.json();
    const relevant = (data.orders || []).filter((o: Order) =>
      ["paid", "preparing", "ready", "out_for_delivery"].includes(o.status)
    );
    setOrders(relevant);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  const onRoute = orders.filter((o) => o.status === "out_for_delivery");
  const waiting = orders.filter((o) => o.status !== "out_for_delivery");

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛵</span>
          <span className="text-white font-bold text-lg">Lieferungen</span>
          {orders.length > 0 && (
            <span className="bg-diavolored text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 text-sm py-2 px-3 rounded-lg active:bg-gray-800"
        >
          Abmelden
        </button>
      </header>

      <div className="px-3 py-4 space-y-3 max-w-lg mx-auto pb-10">
        {loading && (
          <div className="text-center py-20 text-gray-500">Lade...</div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-gray-400 font-medium text-lg">Keine offenen Lieferungen</p>
            <p className="text-gray-600 text-sm mt-1">Aktualisiert alle 30 Sek.</p>
          </div>
        )}

        {/* Unterwegs */}
        {onRoute.map((order) => (
          <OrderCard key={order.id} order={order} onUpdate={updateStatus} isOnRoute />
        ))}

        {/* Wartend */}
        {waiting.map((order) => (
          <OrderCard key={order.id} order={order} onUpdate={updateStatus} isOnRoute={false} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onUpdate,
  isOnRoute,
}: {
  order: Order;
  onUpdate: (id: string, status: string) => void;
  isOnRoute: boolean;
}) {
  const time = new Date(order.created_at).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer_address)}`;

  return (
    <div className={`rounded-2xl overflow-hidden ${isOnRoute ? "border-2 border-orange-500" : "border border-gray-800"} bg-gray-900`}>
      {/* Status-Banner */}
      {isOnRoute && (
        <div className="bg-orange-500 px-4 py-1.5 text-center">
          <span className="text-white text-xs font-bold tracking-wide uppercase">Unterwegs</span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Adresse + Maps */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 bg-gray-800 active:bg-gray-700 rounded-xl p-4 transition-colors"
        >
          <span className="text-2xl mt-0.5">📍</span>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs font-bold uppercase mb-0.5">Lieferadresse</p>
            <p className="text-white font-bold text-lg leading-snug">{order.customer_address}</p>
            <p className="text-blue-400 text-sm mt-1 font-medium">In Google Maps öffnen →</p>
          </div>
        </a>

        {/* Name + Telefon */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase mb-0.5">Kunde</p>
            <p className="text-white font-semibold text-base">{order.customer_name}</p>
          </div>
          <a
            href={`tel:${order.customer_phone}`}
            className="flex items-center gap-2 bg-diavologreen active:bg-green-700 text-white px-4 py-3 rounded-xl font-bold text-sm"
          >
            📞 {order.customer_phone}
          </a>
        </div>

        {/* Uhrzeit */}
        <p className="text-gray-600 text-xs">Bestellung um {time} Uhr</p>

        {/* Hinweis */}
        {order.notes && (
          <div className="bg-yellow-900/40 border border-yellow-600/40 rounded-xl px-3 py-2 text-sm text-yellow-300">
            ⚠️ {order.notes}
          </div>
        )}
      </div>

      {/* Aktions-Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        {!isOnRoute && (
          <button
            onClick={() => onUpdate(order.id, "out_for_delivery")}
            className="flex-1 bg-orange-500 active:bg-orange-600 text-white font-bold py-4 rounded-xl text-base"
          >
            🛵 Rausgefahren
          </button>
        )}
        <button
          onClick={() => onUpdate(order.id, "delivered")}
          className={`font-bold py-4 rounded-xl text-base text-white active:bg-green-700 bg-diavologreen ${isOnRoute ? "flex-1 text-lg" : "px-6"}`}
        >
          ✓ Geliefert
        </button>
      </div>
    </div>
  );
}
