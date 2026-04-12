"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Order } from "@/types";

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  pending:          { label: "Neu – Annehmen!",      color: "bg-blue-100 text-blue-800",     emoji: "🔔" },
  paid:             { label: "Neu – Annehmen!",      color: "bg-blue-100 text-blue-800",     emoji: "🔔" },
  preparing:        { label: "In Zubereitung",       color: "bg-orange-100 text-orange-800", emoji: "👨‍🍳" },
  ready:            { label: "Fertig",               color: "bg-purple-100 text-purple-800", emoji: "✅" },
  out_for_delivery: { label: "Unterwegs",            color: "bg-indigo-100 text-indigo-800", emoji: "🛵" },
  delivered:        { label: "Geliefert",            color: "bg-green-100 text-green-800",   emoji: "✅" },
  cancelled:        { label: "Storniert",            color: "bg-red-100 text-red-800",       emoji: "❌" },
};

function getNextStatus(order: Order): { status: string; label: string } | null {
  const isPickup = order.order_type === "pickup";
  if (order.status === "pending" || order.status === "paid") {
    return { status: "preparing", label: "👨‍🍳 Annehmen & Zubereiten" };
  }
  if (order.status === "preparing") {
    return isPickup
      ? { status: "ready", label: "✅ Fertig – Kunde kann abholen" }
      : { status: "ready", label: "✅ Fertig – An Fahrer übergeben" };
  }
  if (order.status === "ready" && isPickup) {
    return { status: "delivered", label: "✓ Abgeholt" };
  }
  return null;
}

const WEEKDAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const DEFAULT_SCHEDULE: Record<number, string> = {
  0: "11:30 – 21:00",
  1: "11:30 – 21:00",
  2: "Ruhetag",
  3: "11:30 – 21:00",
  4: "11:30 – 21:00",
  5: "11:30 – 21:00",
  6: "11:30 – 21:00",
};

function playKitchenBell() {
  try {
    const ctx = new AudioContext();
    [0, 0.25, 0.5].forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(1046, ctx.currentTime + t);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + t + 0.3);
      gain.gain.setValueAtTime(0, ctx.currentTime + t);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 1.2);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 1.2);
    });
  } catch { /* ignore */ }
}

function printOrder(order: Order) {
  const date = new Date(order.created_at);
  const dateStr = date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  const itemsHtml = order.items.map((item) => {
    const up = item.price ?? item.unitPrice ?? 0;
    const lineTotal = (up * item.quantity).toFixed(2).replace(".", ",");
    const unitStr = up.toFixed(2).replace(".", ",");
    const name = item.name || item.displayName;
    const lines = name.match(/.{1,38}/g) ?? [name];
    return `
      <div class="item-row"><span>${item.quantity}x ${lines[0]}</span><span>${lineTotal} &euro;</span></div>
      ${lines.slice(1).map((l: string) => `<div class="item-sub">${l}</div>`).join("")}
      <div class="item-sub">${item.quantity} x ${unitStr} &euro;</div>`;
  }).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bon #${order.id.slice(0, 8)}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;width:300px;padding:8px}.center{text-align:center}.bold{font-weight:bold}.big{font-size:15px}.logo{font-size:17px;font-weight:900;letter-spacing:1px}.divider{border-top:1px dashed #000;margin:6px 0}.divider-solid{border-top:2px solid #000;margin:6px 0}.row{display:flex;justify-content:space-between;margin-bottom:2px}.item-row{display:flex;justify-content:space-between;margin-bottom:1px;font-weight:bold}.item-sub{color:#555;font-size:11px;margin-bottom:3px;padding-left:8px}.total-row{display:flex;justify-content:space-between;font-size:15px;font-weight:900;margin-top:4px}.address-block{margin:4px 0}.section-title{font-weight:bold;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#333;margin-bottom:3px}.cut{border-top:2px dashed #000;margin:14px 0 8px;text-align:center;font-size:10px;color:#888}@media print{body{width:100%}}</style>
</head><body>
<div class="center"><div class="logo">🌶️ DIAVOLO'S PIZZA</div><div>Am Dachsberg 4 · 85049 Ingolstadt</div><div>Tel: 0841 99352893</div></div>
<div class="divider-solid"></div>
<div class="row"><span class="section-title">KÜCHEN-BON</span><span>${dateStr} ${timeStr}</span></div>
<div class="row bold big"><span>Bestellung #${order.id.slice(0, 8).toUpperCase()}</span></div>
<div class="divider"></div>${itemsHtml}<div class="divider"></div>
<div class="total-row"><span>GESAMT</span><span>${(order.total_amount / 100).toFixed(2).replace(".", ",")} &euro;</span></div>
<div class="divider"></div>
${order.notes ? `<div class="section-title">ANMERKUNGEN:</div><div style="margin-bottom:4px">${order.notes}</div><div class="divider"></div>` : ""}
<div class="center" style="font-size:10px;color:#666;margin-top:4px">Bezahlt per Online-Zahlung</div>
<div class="cut">✂ ---- FAHRER-ABSCHNITT ----</div>
<div class="center bold">LIEFERADRESSE</div><div class="divider"></div>
<div class="address-block"><div class="bold big">${order.customer_name}</div><div>${order.customer_address}</div><div>📞 ${order.customer_phone}</div></div>
<div class="divider"></div>
<div class="row"><span class="bold">BETRAG:</span><span class="bold big">${(order.total_amount / 100).toFixed(2).replace(".", ",")} &euro;</span></div>
<div style="font-size:10px;color:#888;text-align:center;margin-top:6px">Online bezahlt ✓</div>
${order.notes ? `<div class="divider"></div><div><b>Hinweis:</b> ${order.notes}</div>` : ""}
<div class="divider"></div>
<div class="center" style="font-size:10px">#${order.id.slice(0, 8).toUpperCase()} · ${dateStr} ${timeStr}</div>
</body></html>`;
  const win = window.open("", "_blank", "width=380,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("today");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [closedToggling, setClosedToggling] = useState(false);
  const knownOrderIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  const router = useRouter();

  const getDateParams = useCallback((range: string) => {
    const now = new Date();
    const startOfDay = (d: Date) => { d.setHours(0, 0, 0, 0); return d; };
    let from: Date | null = null;
    if (range === "today") from = startOfDay(new Date());
    else if (range === "yesterday") { from = startOfDay(new Date()); from.setDate(from.getDate() - 1); }
    else if (range === "week") { from = startOfDay(new Date()); from.setDate(from.getDate() - 7); }
    else if (range === "month") { from = startOfDay(new Date()); from.setMonth(from.getMonth() - 1); }
    else if (range === "year") { from = startOfDay(new Date()); from.setFullYear(from.getFullYear() - 1); }
    const params = new URLSearchParams();
    if (from) params.set("from", from.toISOString());
    if (range === "yesterday") {
      const to = startOfDay(new Date());
      params.set("to", to.toISOString());
    }
    return params.toString() ? `?${params.toString()}` : "";
  }, []);

  const fetchOrders = useCallback(async () => {
    const params = getDateParams(dateRange);
    const res = await fetch(`/api/admin/orders${params}`);
    if (res.status === 401) { router.push("/admin/login"); return; }
    const data = await res.json();
    const newOrders: Order[] = data.orders || [];
    if (isFirstLoad.current) {
      newOrders.forEach((o) => knownOrderIds.current.add(o.id));
      isFirstLoad.current = false;
    } else {
      const incoming = newOrders.filter((o) => !knownOrderIds.current.has(o.id));
      if (incoming.length > 0) {
        incoming.forEach((o) => knownOrderIds.current.add(o.id));
        playKitchenBell();
        setNewOrderAlert(true);
        setTimeout(() => setNewOrderAlert(false), 5000);
      }
    }
    setOrders(newOrders);
    setLoading(false);
  }, [router, dateRange, getDateParams]);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const data = await res.json();
      setIsClosed(data.is_closed ?? false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchSettings();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchSettings]);

  const toggleClosed = async () => {
    setClosedToggling(true);
    const next = !isClosed;
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_closed: next }),
    });
    setIsClosed(next);
    setClosedToggling(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchOrders();
  };

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts = {
    all:       orders.length,
    paid:      orders.filter((o) => o.status === "paid").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const isToday = (d: string) => new Date(d).toDateString() === new Date().toDateString();
  const isYesterday = (d: string) => {
    const y = new Date(); y.setDate(y.getDate() - 1);
    return new Date(d).toDateString() === y.toDateString();
  };

  const todayOrders = orders.filter((o) => isToday(o.created_at) && o.status !== "cancelled");
  const yesterdayOrders = orders.filter((o) => isYesterday(o.created_at) && o.status !== "cancelled");
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total_amount / 100, 0);
  const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + o.total_amount / 100, 0);

  // Stündliche Verteilung der heutigen Bestellungen
  const hourlyData: number[] = Array(14).fill(0); // 10–23 Uhr = 14 Stunden
  todayOrders.forEach((o) => {
    const h = new Date(o.created_at).getHours();
    const idx = h - 10;
    if (idx >= 0 && idx < 14) hourlyData[idx]++;
  });
  const maxHourly = Math.max(...hourlyData, 1);

  // Top-Produkte heute
  const productCounts: Record<string, number> = {};
  todayOrders.forEach((o) => {
    o.items.forEach((item) => {
      const key = item.name;
      productCounts[key] = (productCounts[key] ?? 0) + item.quantity;
    });
  });
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const today = new Date();
  const todayWeekday = today.getDay();
  const schedule = DEFAULT_SCHEDULE[todayWeekday];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">🌶️</div>
          <p className="text-gray-500 font-medium">Lade Bestellungen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-dark text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Diavolo's Pizza" width={140} height={42} className="object-contain brightness-0 invert h-10 w-auto" />
          <span className="text-gray-400 text-xs hidden sm:block">Admin-Dashboard</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="text-right hidden sm:block mr-2">
            <p className="text-xs text-gray-400">Umsatz heute</p>
            <p className="font-bold text-diavologreen text-lg">{todayRevenue.toFixed(2).replace(".", ",")} €</p>
          </div>
          <a href="/admin/products" className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl text-sm transition-colors" title="Speisekarte bearbeiten & Preise anpassen">🍕 Speisekarte & Preise</a>
          <a href="/admin/extras" className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl text-sm transition-colors" title="Beläge verwalten & als ausverkauft markieren">🧀 Beläge</a>
          <a href="/admin/sizes" className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl text-sm transition-colors" title="Pizzagrößen & Aufpreise">📏 Größen</a>
          <a href="/admin/mitarbeiter" className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl text-sm transition-colors">👤 Mitarbeiter</a>
          <button onClick={fetchOrders} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl text-sm transition-colors" title="Aktualisieren">🔄</button>
          <button onClick={logout} className="bg-diavolored hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Abmelden</button>
        </div>
      </header>

      {/* Neue Bestellung Banner */}
      {newOrderAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-diavologreen text-white font-bold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          🔔 Neue Bestellung eingegangen!
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Öffnungszeiten + Tagesübersicht */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Öffnungszeiten-Toggle */}
          <div className={`rounded-2xl p-5 shadow-sm border-2 transition-all ${isClosed ? "bg-red-50 border-diavolored" : "bg-green-50 border-diavologreen"}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-dark">Shop-Status</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${isClosed ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {isClosed ? "GESCHLOSSEN" : "GEÖFFNET"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">
              {WEEKDAY_LABELS[todayWeekday]} · {schedule}
            </p>
            {schedule === "Ruhetag" && (
              <p className="text-xs text-orange-600 font-medium mb-3">Heute ist regulärer Ruhetag</p>
            )}
            <button
              onClick={toggleClosed}
              disabled={closedToggling}
              className={`w-full mt-3 font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 ${
                isClosed
                  ? "bg-diavologreen text-white hover:bg-green-700"
                  : "bg-diavolored text-white hover:bg-red-700"
              }`}
            >
              {closedToggling ? "..." : isClosed ? "🟢 Shop öffnen" : "🔴 Shop schließen"}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">Überschreibt den regulären Plan</p>
          </div>

          {/* Heutiger Umsatz */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-heading font-bold text-dark mb-3">Heute</h3>
            <p className="text-3xl font-extrabold text-diavologreen">{todayRevenue.toFixed(2).replace(".", ",")} €</p>
            <p className="text-sm text-gray-500 mt-1">{todayOrders.length} Bestellung{todayOrders.length !== 1 ? "en" : ""}</p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Gestern: {yesterdayRevenue.toFixed(2).replace(".", ",")} € · {yesterdayOrders.length} Bestellungen</p>
              {yesterdayRevenue > 0 && (
                <p className={`text-xs font-bold mt-0.5 ${todayRevenue >= yesterdayRevenue ? "text-diavologreen" : "text-diavolored"}`}>
                  {todayRevenue >= yesterdayRevenue ? "▲" : "▼"} {Math.abs(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(0)}% vs. gestern
                </p>
              )}
            </div>
          </div>

          {/* Top-Produkte */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-heading font-bold text-dark mb-3">Top heute</h3>
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-400">Noch keine Bestellungen.</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map(([name, count], i) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}.</span>
                      <span className="text-dark truncate">{name}</span>
                    </div>
                    <span className="font-bold text-dark shrink-0 ml-2">{count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stündliche Verteilung */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-heading font-bold text-dark mb-4">Bestellungen heute nach Uhrzeit</h3>
          {todayOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Noch keine Bestellungen heute.</p>
          ) : (
            <div className="flex items-end gap-1.5 h-24">
              {hourlyData.map((count, i) => {
                const hour = i + 10;
                const pct = (count / maxHourly) * 100;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 font-medium">{count > 0 ? count : ""}</span>
                    <div className="w-full rounded-t-md bg-diavolored/20 relative" style={{ height: "60px" }}>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-diavolored rounded-t-md transition-all duration-500"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{hour}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Zeitraum-Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-dark mr-2">📅 Zeitraum:</span>
            {[
              { key: "today",     label: "Heute" },
              { key: "yesterday", label: "Gestern" },
              { key: "week",      label: "7 Tage" },
              { key: "month",     label: "30 Tage" },
              { key: "year",      label: "1 Jahr" },
              { key: "all",       label: "Alle" },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => { setDateRange(r.key); setLoading(true); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dateRange === r.key
                    ? "bg-diavolored text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistik-Karten */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Alle",           value: counts.all,       emoji: "📋", key: "all" },
            { label: "Neu / Bezahlt",  value: counts.paid,      emoji: "💳", key: "paid" },
            { label: "In Zubereitung", value: counts.preparing, emoji: "👨‍🍳", key: "preparing" },
            { label: "Geliefert",      value: counts.delivered, emoji: "✅", key: "delivered" },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => setFilter(stat.key)}
              className={`bg-white rounded-2xl p-4 text-left shadow-sm border-2 transition-all ${filter === stat.key ? "border-diavolored" : "border-transparent"}`}
            >
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="font-bold text-2xl text-dark">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Bestellliste */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="text-5xl mb-4">🍕</div>
              <p className="text-gray-500 font-medium">Keine Bestellungen gefunden.</p>
            </div>
          ) : filteredOrders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
            const isExpanded = expandedId === order.id;
            const date = new Date(order.created_at);
            const dateStr = date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
            const timeStr = date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                          {statusInfo.emoji} {statusInfo.label}
                        </span>
                        {order.order_type === "pickup" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">🏪 Abholung</span>
                        )}
                        {order.payment_type === "in_person" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">💵 Vor Ort</span>
                        )}
                        <span className="text-xs text-gray-400">{dateStr} um {timeStr} Uhr</span>
                      </div>
                      <h3 className="font-bold text-dark text-lg truncate">{order.customer_name}</h3>
                      <p className="text-sm text-gray-500 truncate">📍 {order.customer_address}</p>
                      <p className="text-sm text-gray-500">📞 {order.customer_phone}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-xl text-diavologreen">{(order.total_amount / 100).toFixed(2).replace(".", ",")} €</p>
                      <p className="text-xs text-gray-400">{order.items.length} Position(en)</p>
                      <p className="text-xs text-gray-400 mt-1">{isExpanded ? "▲" : "▼"}</p>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50">
                    <div className="mb-5">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Bestellte Artikel</p>
                      <div className="bg-white rounded-xl p-4 space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-dark">{item.quantity}× {item.name}</span>
                            <span className="font-semibold text-dark">{((item.price ?? item.unitPrice ?? 0) * item.quantity).toFixed(2).replace(".", ",")} €</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
                          <span>Gesamt</span>
                          <span className="text-diavologreen">{(order.total_amount / 100).toFixed(2).replace(".", ",")} €</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">E-Mail</p>
                        <p className="text-sm text-dark">{order.customer_email}</p>
                      </div>
                      {order.notes && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Anmerkungen</p>
                          <p className="text-sm text-dark italic">&quot;{order.notes}&quot;</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      {getNextStatus(order) && (
                        <button
                          onClick={() => updateStatus(order.id, getNextStatus(order)!.status)}
                          className="bg-diavologreen text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                        >
                          {getNextStatus(order)!.label}
                        </button>
                      )}
                      <button
                        onClick={() => printOrder(order)}
                        className="bg-gray-800 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors flex items-center gap-2"
                      >
                        🖨️ Bon drucken
                      </button>
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <button
                          onClick={() => updateStatus(order.id, "cancelled")}
                          className="bg-red-100 text-red-700 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors"
                        >
                          ❌ Stornieren
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
