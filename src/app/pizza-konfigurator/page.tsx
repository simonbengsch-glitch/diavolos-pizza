"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Extra, PizzaSize } from "@/types";
import PizzaVisual from "@/components/PizzaVisual";

const SAUCES = ["Tomatensauce", "Ohne Sauce", "Pesto", "Frischkäse"];
const BASE_PRICE = 9.00;

export default function PizzaKonfiguratorPage() {
  const [sizes, setSizes] = useState<PizzaSize[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(null);
  const [selectedSauce, setSelectedSauce] = useState("Tomatensauce");
  const [selectedCheese, setSelectedCheese] = useState("Mozzarella");
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [halfHalfMode, setHalfHalfMode] = useState(false);
  const [leftExtras, setLeftExtras] = useState<Extra[]>([]);
  const [rightExtras, setRightExtras] = useState<Extra[]>([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/pizza-sizes").then((r) => r.json()),
      fetch("/api/extras").then((r) => r.json()),
    ]).then(([sizeData, extraData]) => {
      const sizeList = sizeData.sizes || [];
      setSizes(sizeList);
      setSelectedSize(sizeList[0] || null);
      setExtras(extraData.extras || []);
    });
  }, []);

  const isFamilySize = selectedSize?.label?.toLowerCase().includes("famili") ?? false;

  const handleSizeChange = (size: PizzaSize) => {
    setSelectedSize(size);
    if (!size.label.toLowerCase().includes("famili")) {
      setHalfHalfMode(false);
      setLeftExtras([]);
      setRightExtras([]);
    }
  };

  const toggleExtra = (extra: Extra) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) return prev.filter((e) => e.id !== extra.id);
      return [...prev, extra];
    });
  };

  const toggleHalfExtra = (extra: Extra, half: "left" | "right") => {
    const setter = half === "left" ? setLeftExtras : setRightExtras;
    setter((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) return prev.filter((e) => e.id !== extra.id);
      return [...prev, extra];
    });
  };

  // Alle einzigartigen Extras für Preisberechnung
  const activeExtras = halfHalfMode
    ? [...leftExtras, ...rightExtras.filter((re) => !leftExtras.some((le) => le.id === re.id))]
    : selectedExtras;

  const extrasPrice = activeExtras.reduce((s, e) => s + e.price, 0);
  const sizeExtraPrice = selectedSize?.extra_price ?? 0;
  const totalPrice = BASE_PRICE + sizeExtraPrice + extrasPrice;

  const buildName = () => {
    if (halfHalfMode) {
      const leftStr = leftExtras.length > 0 ? leftExtras.map((e) => e.name).join(", ") : "Keine";
      const rightStr = rightExtras.length > 0 ? rightExtras.map((e) => e.name).join(", ") : "Keine";
      return `Pizza nach Wahl (${selectedSize?.label ?? "Familienpizza"}) | ${selectedSauce}, ${selectedCheese} | ½ Links: ${leftStr} | ½ Rechts: ${rightStr}`;
    }
    let name = `Pizza nach Wahl (${selectedSize?.label ?? "Ø 30 cm"}) | ${selectedSauce}, ${selectedCheese}`;
    if (selectedExtras.length > 0) name += ` | ${selectedExtras.map((e) => e.name).join(", ")}`;
    return name;
  };

  const handleAddToCart = () => {
    const existing = JSON.parse(sessionStorage.getItem("pizza_cart") || "[]");
    existing.push({
      cartKey: `konfigurator-${Date.now()}`,
      productId: "konfigurator",
      name: "Pizza nach Wahl",
      displayName: buildName(),
      basePrice: BASE_PRICE,
      size: selectedSize ? { id: selectedSize.id, label: selectedSize.label, extraPrice: selectedSize.extra_price } : null,
      extras: activeExtras.map((e) => ({ id: e.id, name: e.name, price: e.price })),
      halfHalf: halfHalfMode
        ? { left: leftExtras.map((e) => ({ id: e.id, name: e.name, price: e.price })), right: rightExtras.map((e) => ({ id: e.id, name: e.name, price: e.price })) }
        : null,
      unitPrice: totalPrice,
      quantity: 1,
    });
    sessionStorage.setItem("pizza_cart", JSON.stringify(existing));
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  // Visual-Props für PizzaVisual
  const visualExtras = halfHalfMode ? [] : selectedExtras;
  const visualHalfHalf = halfHalfMode
    ? { left: leftExtras, right: rightExtras }
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-dark text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <a href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Diavolo's Pizza" width={160} height={48} className="object-contain h-12 w-auto brightness-0 invert" />
        </a>
        <a href="/" className="text-gray-300 hover:text-white text-sm transition-colors">← Zur Speisekarte</a>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-dark mb-2">
            🍕 Bau deine eigene Pizza
          </h1>
          <p className="text-gray-500">Wähle Größe, Sauce, Käse und Beläge — und sieh deine Pizza live entstehen!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* LINKE SEITE: Konfiguration */}
          <div className="space-y-5">

            {/* Größe */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-heading font-bold text-lg text-dark mb-3 flex items-center gap-2">
                <span className="bg-diavolored text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
                Größe
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => handleSizeChange(size)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedSize?.id === size.id
                        ? "border-diavolored bg-diavolored/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-bold text-dark block text-xs">{size.label}</span>
                    <span className="text-gray-500 text-xs">
                      {size.extra_price === 0
                        ? `${BASE_PRICE.toFixed(2).replace(".", ",")} €`
                        : `+${size.extra_price.toFixed(2).replace(".", ",")} €`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sauce */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-heading font-bold text-lg text-dark mb-3 flex items-center gap-2">
                <span className="bg-diavolored text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                Sauce
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {SAUCES.map((sauce) => (
                  <button
                    key={sauce}
                    onClick={() => setSelectedSauce(sauce)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all flex items-center gap-2 ${
                      selectedSauce === sauce
                        ? "border-diavolored bg-diavolored/5 text-diavolored"
                        : "border-gray-200 text-dark hover:border-gray-300"
                    }`}
                  >
                    <span className="text-base">
                      {sauce === "Tomatensauce" ? "🍅" : sauce === "Pesto" ? "🌿" : sauce === "Frischkäse" ? "🧀" : "⬜"}
                    </span>
                    {sauce}
                  </button>
                ))}
              </div>
            </div>

            {/* Käse */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-heading font-bold text-lg text-dark mb-3 flex items-center gap-2">
                <span className="bg-diavolored text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
                Käse
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[{label:"Mozzarella",emoji:"🧀"},{label:"Käse, vegan",emoji:"🌱"}].map(({label,emoji}) => (
                  <button
                    key={label}
                    onClick={() => setSelectedCheese(label)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all flex items-center gap-2 ${
                      selectedCheese === label
                        ? "border-diavologreen bg-diavologreen/5 text-diavologreen"
                        : "border-gray-200 text-dark hover:border-gray-300"
                    }`}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Halb-Halb Toggle (nur Familienpizza) */}
            {isFamilySize && (
              <div
                onClick={() => { setHalfHalfMode((v) => !v); setSelectedExtras([]); setLeftExtras([]); setRightExtras([]); }}
                className={`bg-white rounded-2xl p-5 shadow-sm border-2 cursor-pointer transition-all ${
                  halfHalfMode ? "border-diavolored" : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-6 rounded-full flex items-center transition-all shrink-0 ${halfHalfMode ? "bg-diavolored" : "bg-gray-300"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-all mx-1 ${halfHalfMode ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                  <div>
                    <p className="font-bold text-dark">🍕 Halb-Halb Pizza</p>
                    <p className="text-xs text-gray-500">Linke und rechte Hälfte mit verschiedenen Belägen</p>
                  </div>
                </div>
              </div>
            )}

            {/* Beläge */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-heading font-bold text-lg text-dark mb-1 flex items-center gap-2">
                <span className="bg-diavolored text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">4</span>
                Beläge
                {!halfHalfMode && selectedExtras.length > 0 && (
                  <span className="ml-auto bg-diavolored text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {selectedExtras.length} gewählt
                  </span>
                )}
              </h2>

              {halfHalfMode ? (
                <div className="space-y-5 mt-3">
                  {(["left", "right"] as const).map((half) => {
                    const halfExtras = half === "left" ? leftExtras : rightExtras;
                    const label = half === "left" ? "½ Linke Hälfte" : "½ Rechte Hälfte";
                    const color = half === "left" ? "text-diavolored" : "text-diavologreen";
                    const borderActive = half === "left" ? "border-diavolored bg-diavolored/5" : "border-diavologreen bg-diavologreen/5";
                    return (
                      <div key={half}>
                        <p className={`font-bold text-sm mb-2 ${color}`}>{label}
                          {halfExtras.length > 0 && (
                            <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${half === "left" ? "bg-diavolored text-white" : "bg-diavologreen text-white"}`}>
                              {halfExtras.length}
                            </span>
                          )}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                          {extras.map((extra) => {
                            const selected = halfExtras.some((e) => e.id === extra.id);
                            return (
                              <button
                                key={extra.id}
                                onClick={() => toggleHalfExtra(extra, half)}
                                className={`p-2.5 rounded-xl border-2 text-xs transition-all flex justify-between items-center ${
                                  selected ? borderActive : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <span className={`font-semibold ${selected ? (half === "left" ? "text-diavolored" : "text-diavologreen") : "text-dark"}`}>
                                  {selected ? "✓ " : ""}{extra.name}
                                </span>
                                <span className="text-gray-400 ml-1">+{extra.price.toFixed(2).replace(".", ",")}€</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-3 ml-9">Mehrere auswählbar — erscheinen live auf der Pizza</p>
                  <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {extras.map((extra) => {
                      const selected = selectedExtras.some((e) => e.id === extra.id);
                      return (
                        <button
                          key={extra.id}
                          onClick={() => toggleExtra(extra)}
                          className={`p-2.5 rounded-xl border-2 text-xs transition-all flex justify-between items-center ${
                            selected
                              ? "border-diavologreen bg-diavologreen/5 shadow-sm"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className={`font-semibold ${selected ? "text-diavologreen" : "text-dark"}`}>
                            {selected ? "✓ " : ""}{extra.name}
                          </span>
                          <span className="text-gray-400 ml-1">+{extra.price.toFixed(2).replace(".", ",")}€</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RECHTE SEITE: Pizza-Vorschau + Bestellung */}
          <div className="lg:sticky lg:top-24">
            {/* Pizza Live-Vorschau */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-5">
              <h2 className="font-heading font-bold text-lg text-dark mb-4 text-center">
                Deine Pizza — Live Vorschau
              </h2>
              <div className="pt-6">
                <PizzaVisual
                  sauce={selectedSauce}
                  cheese={selectedCheese}
                  selectedExtras={visualExtras}
                  size={selectedSize?.label ?? "Ø 30 cm (Standard)"}
                  halfHalf={visualHalfHalf}
                />
              </div>

              {/* Gewählte Zutaten als Tags */}
              {!halfHalfMode && selectedExtras.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                  {selectedExtras.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => toggleExtra(e)}
                      className="bg-diavologreen/10 text-diavologreen text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                      {e.name} ✕
                    </button>
                  ))}
                </div>
              )}

              {halfHalfMode && (leftExtras.length > 0 || rightExtras.length > 0) && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-bold text-diavolored mb-1 text-center">½ Links</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {leftExtras.map((e) => (
                        <button key={e.id} onClick={() => toggleHalfExtra(e, "left")}
                          className="bg-diavolored/10 text-diavolored text-xs font-semibold px-2 py-0.5 rounded-full hover:bg-red-100 transition-colors">
                          {e.name} ✕
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-diavologreen mb-1 text-center">½ Rechts</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {rightExtras.map((e) => (
                        <button key={e.id} onClick={() => toggleHalfExtra(e, "right")}
                          className="bg-diavologreen/10 text-diavologreen text-xs font-semibold px-2 py-0.5 rounded-full hover:bg-green-100 transition-colors">
                          {e.name} ✕
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preis & Bestellung */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Grundpreis</span>
                  <span>{BASE_PRICE.toFixed(2).replace(".", ",")} €</span>
                </div>
                {sizeExtraPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{selectedSize?.label}</span>
                    <span>+{sizeExtraPrice.toFixed(2).replace(".", ",")} €</span>
                  </div>
                )}
                {activeExtras.map((e) => (
                  <div key={e.id} className="flex justify-between text-sm">
                    <span className="text-gray-500">{e.name}</span>
                    <span>+{e.price.toFixed(2).replace(".", ",")} €</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-xl mb-4">
                <span>Gesamt</span>
                <span className="text-diavologreen">{totalPrice.toFixed(2).replace(".", ",")} €</span>
              </div>

              {added ? (
                <div className="w-full bg-diavologreen text-white font-bold py-4 rounded-xl text-center">
                  ✅ Zum Warenkorb hinzugefügt!
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-diavolored text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg text-lg"
                >
                  🛒 In den Warenkorb — {totalPrice.toFixed(2).replace(".", ",")} €
                </button>
              )}

              <a href="/" className="block text-center text-sm text-gray-400 hover:text-diavolored mt-3 transition-colors">
                Zur Speisekarte & weiter bestellen →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
