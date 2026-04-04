"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";

const CATEGORIES = ["Pizza", "Pasta & Mehr", "Vorspeise", "Salate", "Dessert", "Getränke"];

const EMPTY: Partial<Product> = {
  name: "", description: "", category: "Pizza", base_price: 0,
  is_hot: false, is_vegetarian: false, is_available: true,
  allergens: "", has_extras: false, has_sizes: false, sort_order: 0,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterCat, setFilterCat] = useState("Pizza");
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async () => {
    setSaving(true);
    if (isNew) {
      await fetch("/api/admin/products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProduct),
      });
    } else {
      await fetch(`/api/admin/products/${editProduct!.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProduct),
      });
    }
    setSaving(false);
    setEditProduct(null);
    fetchProducts();
  };

  const handleToggleAvailable = async (product: Product) => {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !product.is_available }),
    });
    fetchProducts();
  };

  const filtered = products.filter((p) => p.category === filterCat);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-dark text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌶️</span>
          <h1 className="font-heading font-bold text-xl">Produkt-Verwaltung</h1>
        </div>
        <div className="flex gap-3">
          <a href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">← Bestellungen</a>
          <button
            onClick={() => { setIsNew(true); setEditProduct({ ...EMPTY }); }}
            className="bg-diavologreen text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
          >
            + Neues Produkt
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Kategorie Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filterCat === cat ? "bg-diavolored text-white" : "bg-white text-dark border border-gray-200"}`}>
              {cat} ({products.filter((p) => p.category === cat).length})
            </button>
          ))}
        </div>

        {/* Produkt-Liste */}
        <div className="space-y-2">
          {filtered.map((product) => (
            <div key={product.id} className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between gap-4 ${!product.is_available ? "opacity-50" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {product.number && <span className="text-xs text-gray-400 font-mono">#{product.number}</span>}
                  <span className="font-bold text-dark truncate">{product.name}</span>
                  {product.is_hot && <span className="text-xs">🌶️</span>}
                  {product.is_vegetarian && <span className="text-xs">🌿</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{product.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-diavologreen">{Number(product.base_price).toFixed(2).replace(".", ",")} €</span>
                <button onClick={() => handleToggleAvailable(product)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${product.is_available ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700" : "bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700"}`}>
                  {product.is_available ? "Aktiv" : "Inaktiv"}
                </button>
                <button onClick={() => { setIsNew(false); setEditProduct({ ...product }); }}
                  className="bg-gray-100 hover:bg-gray-200 text-dark px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                  Bearbeiten
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Create Modal */}
      {editProduct && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 80 }}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditProduct(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl">
              <h2 className="font-heading font-bold text-xl text-dark">{isNew ? "Neues Produkt" : "Produkt bearbeiten"}</h2>
              <button onClick={() => setEditProduct(null)} className="text-gray-400 hover:text-diavolored text-2xl">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nummer</label>
                  <input type="number" value={editProduct.number ?? ""} onChange={(e) => setEditProduct({ ...editProduct, number: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored" placeholder="z.B. 255" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Kategorie</label>
                  <select value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Name *</label>
                <input type="text" value={editProduct.name ?? ""} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored" placeholder="Pizza Margherita" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Beschreibung</label>
                <input type="text" value={editProduct.description ?? ""} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored" placeholder="Mit Mozzarella & Tomatensauce" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Preis (€) *</label>
                  <input type="number" step="0.50" value={editProduct.base_price ?? ""} onChange={(e) => setEditProduct({ ...editProduct, base_price: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Allergene</label>
                  <input type="text" value={editProduct.allergens ?? ""} onChange={(e) => setEditProduct({ ...editProduct, allergens: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-diavolored" placeholder="A,G,C" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "is_hot", label: "🌶️ Scharf" },
                  { key: "is_vegetarian", label: "🌿 Vegetarisch" },
                  { key: "has_extras", label: "🍕 Extras möglich" },
                  { key: "has_sizes", label: "📏 Größen möglich" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!(editProduct as Record<string, unknown>)[key]}
                      onChange={(e) => setEditProduct({ ...editProduct, [key]: e.target.checked })}
                      className="w-4 h-4 accent-diavolored" />
                    <span className="text-sm font-medium text-dark">{label}</span>
                  </label>
                ))}
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full bg-diavolored text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
                {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
