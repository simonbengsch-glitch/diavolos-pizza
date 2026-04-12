"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EXTRAS_CATALOG } from "@/lib/extrasCatalog";

type SizeKey = "p30" | "p35" | "p40" | "p45" | "p50" | "pFam";
type CatalogRow = { id: string; name: string; p30: number; p35: number; p40: number; p45: number; p50: number; pFam: number };

const SIZE_LABELS: { key: SizeKey; label: string }[] = [
  { key: "p30",  label: "ø30" },
  { key: "p35",  label: "ø35" },
  { key: "p40",  label: "ø40" },
  { key: "p45",  label: "ø45" },
  { key: "p50",  label: "ø50" },
  { key: "pFam", label: "Familie" },
];

export default function AdminExtrasPage() {
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  const [original, setOriginal] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const router = useRouter();

  const setupSql = `CREATE TABLE IF NOT EXISTS extras_catalog_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  catalog JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`;

  const loadCatalog = useCallback(async () => {
    const res = await fetch("/api/admin/extras-catalog");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const data = await res.json();
    if (data.needsSetup) setNeedsSetup(true);
    if (data.catalog && Array.isArray(data.catalog) && data.catalog.length > 0) {
      setCatalog(data.catalog);
      setOriginal(JSON.stringify(data.catalog));
      if (data.updated_at) setLastSaved(new Date(data.updated_at).toLocaleString("de-DE"));
    } else {
      const fallback = EXTRAS_CATALOG.map((e) => ({ ...e }));
      setCatalog(fallback);
      setOriginal(JSON.stringify(fallback));
    }
  }, [router]);

  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  const hasChanges = JSON.stringify(catalog) !== original;

  const updatePrice = (idx: number, key: SizeKey, value: number) => {
    setCatalog((prev) => prev.map((row, i) => i === idx ? { ...row, [key]: value } : row));
  };

  const handleSaveClick = () => {
    setError("");
    setShowPasswordModal(true);
  };

  const handleConfirmSave = async () => {
    if (!email || !password) { setError("E-Mail und Passwort erforderlich"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/extras-catalog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ catalog, email, password }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      if (data.needsSetup) setNeedsSetup(true);
      setError(data.error || "Fehler beim Speichern");
      return;
    }
    setOriginal(JSON.stringify(catalog));
    setShowPasswordModal(false);
    setPassword("");
    setSuccess(true);
    setLastSaved(new Date().toLocaleString("de-DE"));
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧀</span>
          <h1 className="font-heading font-bold text-xl">Belag-Preise je Größe</h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">← Bestellungen</a>
          <a href="/admin/sizes" className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl text-sm transition-colors">📏 Größen</a>
          <a href="/admin/products" className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl text-sm transition-colors">🍕 Speisekarte</a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {lastSaved && (
          <p className="text-xs text-gray-400 mb-2">Zuletzt gespeichert: {lastSaved}</p>
        )}

        {needsSetup && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-5 mb-4">
            <p className="font-bold text-yellow-800 mb-2">⚠️ Datenbank-Tabelle fehlt</p>
            <p className="text-sm text-yellow-700 mb-3">Damit du Preise speichern kannst, muss einmalig folgendes SQL im <strong>Supabase SQL Editor</strong> ausgeführt werden:</p>
            <pre className="bg-yellow-100 rounded-xl p-3 text-xs text-yellow-900 overflow-x-auto mb-3 select-all">{setupSql}</pre>
            <p className="text-xs text-yellow-600">Nach dem Ausführen diese Seite neu laden.</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 text-sm text-green-800 font-bold">
            ✅ Preise erfolgreich gespeichert! Änderungen sind sofort auf der Hauptseite sichtbar.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-bold text-dark sticky left-0 bg-gray-50 z-10 min-w-[160px]">Belag</th>
                {SIZE_LABELS.map((s) => (
                  <th key={s.key} className="text-center px-2 py-3 font-bold text-dark min-w-[80px]">{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {catalog.map((row, idx) => (
                <tr key={row.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                  <td className="px-4 py-2 font-semibold text-dark sticky left-0 bg-white z-10">{row.name}</td>
                  {SIZE_LABELS.map((s) => (
                    <td key={s.key} className="px-1 py-1 text-center">
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={row[s.key]}
                        onChange={(e) => updatePrice(idx, s.key, Number(e.target.value))}
                        className="w-full text-center border border-gray-200 rounded-lg px-1 py-1.5 text-sm focus:outline-none focus:border-diavolored focus:ring-1 focus:ring-diavolored/20 transition-all"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleSaveClick}
            disabled={!hasChanges}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
              hasChanges
                ? "bg-diavolored text-white hover:bg-red-700 shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            💾 Preise speichern
          </button>
          {hasChanges && (
            <span className="text-sm text-orange-600 font-medium">⚠️ Ungespeicherte Änderungen</span>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 80 }}>
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowPasswordModal(false); setError(""); }} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-heading font-bold text-xl text-dark">🔒 Admin-Bestätigung</h2>
              <p className="text-sm text-gray-500 mt-1">Bitte bestätige die Preisänderung mit deinem Admin-Passwort.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">E-Mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored"
                  placeholder="admin@diavolos-pizza.de"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Passwort</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConfirmSave()}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
              <button
                onClick={handleConfirmSave}
                disabled={saving}
                className="w-full bg-diavolored text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Speichern..." : "✓ Bestätigen & Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
