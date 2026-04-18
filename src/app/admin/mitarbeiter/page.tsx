"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Staff = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "driver";
  created_at: string;
  is_protected?: boolean;
};

type FormData = { name: string; email: string; password: string; role: "admin" | "driver" };
const EMPTY: FormData = { name: "", email: "", password: "", role: "driver" };

export default function MitarbeiterPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [editStaff, setEditStaff] = useState<(Partial<FormData> & { id?: string }) | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchStaff = useCallback(async () => {
    const res = await fetch("/api/admin/staff");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const data = await res.json();
    setStaff(data.staff || []);
  }, [router]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleSave = async () => {
    setSaving(true);
    setError("");

    if (isNew && !editStaff?.password) {
      setError("Passwort ist pflicht für neue Accounts.");
      setSaving(false);
      return;
    }

    const res = isNew
      ? await fetch("/api/admin/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editStaff),
        })
      : await fetch(`/api/admin/staff/${editStaff!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editStaff),
        });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Fehler beim Speichern.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditStaff(null);
    fetchStaff();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} wirklich löschen?`)) return;
    await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    fetchStaff();
  };

  const admins = staff.filter((s) => s.role === "admin");
  const drivers = staff.filter((s) => s.role === "driver");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👤</span>
          <h1 className="font-heading font-bold text-xl">Mitarbeiter</h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">← Dashboard</a>
          <button
            onClick={() => { setIsNew(true); setEditStaff({ ...EMPTY }); setError(""); }}
            className="bg-diavologreen text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
          >
            + Neuer Account
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Admins */}
        <Section title="🍕 Küche / Admin" members={admins} onEdit={(s) => { setIsNew(false); setEditStaff({ id: s.id, name: s.name, email: s.email, role: s.role, password: "" }); setError(""); }} onDelete={handleDelete} />

        {/* Fahrer */}
        <Section title="🛵 Fahrer" members={drivers} onEdit={(s) => { setIsNew(false); setEditStaff({ id: s.id, name: s.name, email: s.email, role: s.role, password: "" }); setError(""); }} onDelete={handleDelete} />
      </div>

      {/* Modal */}
      {editStaff && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 80 }}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditStaff(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-heading font-bold text-xl text-dark">
                {isNew ? "Neuer Account" : "Account bearbeiten"}
              </h2>
              <button onClick={() => setEditStaff(null)} className="text-gray-400 hover:text-diavolored text-2xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Name *</label>
                <input
                  type="text"
                  value={editStaff.name ?? ""}
                  onChange={(e) => setEditStaff({ ...editStaff, name: e.target.value })}
                  placeholder="z.B. Max Mustermann"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">E-Mail *</label>
                <input
                  type="email"
                  value={editStaff.email ?? ""}
                  onChange={(e) => setEditStaff({ ...editStaff, email: e.target.value })}
                  placeholder="name@diavolospizza.de"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Passwort {!isNew && <span className="text-gray-400 normal-case font-normal">(leer lassen = unverändert)</span>}
                </label>
                <input
                  type="password"
                  value={editStaff.password ?? ""}
                  onChange={(e) => setEditStaff({ ...editStaff, password: e.target.value })}
                  placeholder={isNew ? "Passwort eingeben" : "Neues Passwort (optional)"}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Rolle *</label>
                <div className="flex gap-2">
                  {(["admin", "driver"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setEditStaff({ ...editStaff, role: r })}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${editStaff.role === r ? "border-diavolored bg-red-50 text-diavolored" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                    >
                      {r === "admin" ? "🍕 Admin / Küche" : "🛵 Fahrer"}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-diavolored text-sm font-medium bg-red-50 rounded-xl px-3 py-2">{error}</p>
              )}

              <button
                onClick={handleSave}
                disabled={saving || !editStaff.name || !editStaff.email}
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

function Section({
  title,
  members,
  onEdit,
  onDelete,
}: {
  title: string;
  members: Staff[];
  onEdit: (s: Staff) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-bold text-dark">{title}</h2>
      </div>
      {members.length === 0 ? (
        <p className="text-center py-8 text-gray-400 text-sm">Keine Einträge</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {members.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-dark truncate">{s.name}</p>
                  {s.is_protected && (
                    <span
                      className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      title="Haupt-Admin: kann nicht bearbeitet oder gelöscht werden"
                    >
                      🔒 Geschützt
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 truncate">{s.email}</p>
              </div>
              {s.is_protected ? (
                <span className="text-xs text-gray-400 italic">Haupt-Admin</span>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(s)}
                    className="bg-gray-100 hover:bg-gray-200 text-dark px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => onDelete(s.id, s.name)}
                    className="bg-red-100 hover:bg-red-200 text-diavolored px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Löschen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
