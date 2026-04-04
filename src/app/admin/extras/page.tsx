"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Extra } from "@/types";

const EMPTY: Partial<Extra> = { name: "", price: 0, is_available: true, sort_order: 0 };

export default function AdminExtrasPage() {
  const [extras, setExtras] = useState<Extra[]>([]);
  const [editExtra, setEditExtra] = useState<Partial<Extra> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const fetchExtras = useCallback(async () => {
    const res = await fetch("/api/admin/extras");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const data = await res.json();
    setExtras(data.extras || []);
  }, [router]);

  useEffect(() => { fetchExtras(); }, [fetchExtras]);

  const handleSave = async () => {
    setSaving(true);
    if (isNew) {
      await fetch("/api/admin/extras", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editExtra),
      });
    } else {
      await fetch(`/api/admin/extras/${editExtra!.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editExtra),
      });
    }
    setSaving(false);
    setEditExtra(null);
    fetchExtras();
  };

  const handleToggle = async (extra: Extra) => {
    await fetch(`/api/admin/extras/${extra.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !extra.is_available }),
    });
    fetchExtras();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧀</span>
          <h1 className="font-heading font-bold text-xl">Extras / Beläge</h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">← Bestellungen</a>
          <a href="/admin/sizes" className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl text-sm transition-colors">📏 Größen</a>
          <button
            onClick={() => { setIsNew(true); setEditExtra({ ...EMPTY }); }}
            className="bg-diavologreen text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
          >
            + Neuer Belag
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <p className="text-sm text-gray-500">{extras.length} Beläge insgesamt</p>
            <p className="text-xs text-gray-400">Klicke auf einen Belag zum Bearbeiten</p>
          </div>
          <div className="divide-y divide-gray-100">
            {extras.length === 0 ? (
              <p className="text-center py-12 text-gray-400">Keine Extras gefunden.</p>
            ) : extras.map((extra) => (
              <div key={extra.id} className={`flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors ${!extra.is_available ? "opacity-50" : ""}`}>
                <div className="flex-1">
                  <span className="font-semibold text-dark">{extra.name}</span>
                  {!extra.is_available && <span className="ml-2 text-xs text-red-500 font-medium">inaktiv</span>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-diavologreen w-16 text-right">
                    +{Number(extra.price).toFixed(2).replace(".", ",")} €
                  </span>
                  <button
                    onClick={() => handleToggle(extra)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${extra.is_available ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700" : "bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700"}`}
                  >
                    {extra.is_available ? "Aktiv" : "Inaktiv"}
                  </button>
                  <button
                    onClick={() => { setIsNew(false); setEditExtra({ ...extra }); }}
                    className="bg-gray-100 hover:bg-gray-200 text-dark px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                  >
                    Bearbeiten
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {editExtra && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 80 }}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditExtra(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-heading font-bold text-xl text-dark">{isNew ? "Neuer Belag" : "Belag bearbeiten"}</h2>
              <button onClick={() => setEditExtra(null)} className="text-gray-400 hover:text-diavolored text-2xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Name *</label>
                <input
                  type="text"
                  value={editExtra.name ?? ""}
                  onChange={(e) => setEditExtra({ ...editExtra, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored"
                  placeholder="z.B. Salami"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Aufpreis (€) *</label>
                <input
                  type="number"
                  step="0.50"
                  value={editExtra.price ?? ""}
                  onChange={(e) => setEditExtra({ ...editExtra, price: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Sortierung</label>
                <input
                  type="number"
                  value={editExtra.sort_order ?? 0}
                  onChange={(e) => setEditExtra({ ...editExtra, sort_order: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !editExtra.name}
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
