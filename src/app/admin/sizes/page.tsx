"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PizzaSize } from "@/types";

const EMPTY: Partial<PizzaSize> = { label: "", extra_price: 0, sort_order: 0 };

export default function AdminSizesPage() {
  const [sizes, setSizes] = useState<PizzaSize[]>([]);
  const [editSize, setEditSize] = useState<Partial<PizzaSize> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const fetchSizes = useCallback(async () => {
    const res = await fetch("/api/admin/sizes");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const data = await res.json();
    setSizes(data.sizes || []);
  }, [router]);

  useEffect(() => { fetchSizes(); }, [fetchSizes]);

  const handleSave = async () => {
    setSaving(true);
    if (isNew) {
      await fetch("/api/admin/sizes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSize),
      });
    } else {
      await fetch(`/api/admin/sizes/${editSize!.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSize),
      });
    }
    setSaving(false);
    setEditSize(null);
    fetchSizes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Größe wirklich löschen?")) return;
    await fetch(`/api/admin/sizes/${id}`, { method: "DELETE" });
    fetchSizes();
  };

  const BASE_PRICE = 10.00;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📏</span>
          <h1 className="font-heading font-bold text-xl">Pizza-Größen</h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">← Bestellungen</a>
          <a href="/admin/extras" className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl text-sm transition-colors">🧀 Extras</a>
          <button
            onClick={() => { setIsNew(true); setEditSize({ ...EMPTY }); }}
            className="bg-diavologreen text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
          >
            + Neue Größe
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-sm text-blue-800">
          <strong>Grundpreis:</strong> {BASE_PRICE.toFixed(2).replace(".", ",")} € · Der Aufpreis wird zum Grundpreis addiert.
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {sizes.length === 0 ? (
              <p className="text-center py-12 text-gray-400">Keine Größen gefunden.</p>
            ) : sizes.map((size) => (
              <div key={size.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-bold text-dark">{size.label}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-diavologreen">
                      {(BASE_PRICE + size.extra_price).toFixed(2).replace(".", ",")} €
                    </p>
                    {size.extra_price > 0 && (
                      <p className="text-xs text-gray-400">+{Number(size.extra_price).toFixed(2).replace(".", ",")} € Aufpreis</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setIsNew(false); setEditSize({ ...size }); }}
                    className="bg-gray-100 hover:bg-gray-200 text-dark px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDelete(size.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {editSize && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 80 }}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditSize(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-heading font-bold text-xl text-dark">{isNew ? "Neue Größe" : "Größe bearbeiten"}</h2>
              <button onClick={() => setEditSize(null)} className="text-gray-400 hover:text-diavolored text-2xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Bezeichnung *</label>
                <input
                  type="text"
                  value={editSize.label ?? ""}
                  onChange={(e) => setEditSize({ ...editSize, label: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored"
                  placeholder="z.B. Ø 40 cm (Groß)"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Aufpreis (€)</label>
                <input
                  type="number"
                  step="0.50"
                  value={editSize.extra_price ?? 0}
                  onChange={(e) => setEditSize({ ...editSize, extra_price: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Gesamtpreis: {(BASE_PRICE + (editSize.extra_price ?? 0)).toFixed(2).replace(".", ",")} €
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Sortierung</label>
                <input
                  type="number"
                  value={editSize.sort_order ?? 0}
                  onChange={(e) => setEditSize({ ...editSize, sort_order: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !editSize.label}
                className="w-full bg-diavolored text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
