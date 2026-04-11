"use client";

import { useState, useEffect } from "react";
import { Product, Extra, PizzaSize, SelectedExtra, CartItem } from "@/types";
import { buildExtras, priceForExtraId } from "@/lib/extrasCatalog";

interface Props {
  product: Product;
  onClose: () => void;
  onAdd: (item: CartItem) => void;
}

export default function ExtrasModal({ product, onClose, onAdd }: Props) {
  const [sizes, setSizes] = useState<PizzaSize[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
  const [halfHalfMode, setHalfHalfMode] = useState(false);
  const [leftExtras, setLeftExtras] = useState<SelectedExtra[]>([]);
  const [rightExtras, setRightExtras] = useState<SelectedExtra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pizza-sizes").then((r) => r.json()).then((sizeData) => {
      const sizeList: PizzaSize[] = (sizeData.sizes || []).map((s: PizzaSize) => ({
        ...s,
        label: s.label.replace("60×40", "40/60"),
      }));
      setSizes(sizeList);
      setSelectedSize(sizeList[0] || null);
      setLoading(false);
    });
  }, []);

  const isFamilySize = selectedSize?.label?.toLowerCase().includes("famili") ?? false;

  useEffect(() => {
    setExtras(buildExtras(isFamilySize));
    const reprice = (list: SelectedExtra[]): SelectedExtra[] =>
      list.map((e) => ({ ...e, price: priceForExtraId(e.id, isFamilySize) }));
    setSelectedExtras(reprice);
    setLeftExtras(reprice);
    setRightExtras(reprice);
  }, [isFamilySize]);

  // Wenn von Familienpizza auf Normal gewechselt: Halb-Halb zurücksetzen
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
      return [...prev, { id: extra.id, name: extra.name, price: extra.price }];
    });
  };

  const toggleHalfExtra = (extra: Extra, half: "left" | "right") => {
    const setter = half === "left" ? setLeftExtras : setRightExtras;
    setter((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) return prev.filter((e) => e.id !== extra.id);
      return [...prev, { id: extra.id, name: extra.name, price: extra.price }];
    });
  };

  // Preis: bei Halb-Halb alle einzigartigen Extras aus beiden Hälften
  const activeExtras = halfHalfMode
    ? [...leftExtras, ...rightExtras.filter((re) => !leftExtras.some((le) => le.id === re.id))]
    : selectedExtras;

  const extrasPrice = activeExtras.reduce((s, e) => s + e.price, 0);
  const sizeExtraPrice = selectedSize?.extra_price ?? 0;
  const unitPrice = product.base_price + sizeExtraPrice + extrasPrice;

  const buildDisplayName = () => {
    if (halfHalfMode) {
      const leftStr = leftExtras.length > 0 ? leftExtras.map((e) => e.name).join(", ") : "Keine";
      const rightStr = rightExtras.length > 0 ? rightExtras.map((e) => e.name).join(", ") : "Keine";
      return `${product.name} (${selectedSize?.label}) | ½ Links: ${leftStr} | ½ Rechts: ${rightStr}`;
    }
    let n = product.name;
    if (selectedSize && selectedSize.extra_price > 0) n += ` (${selectedSize.label})`;
    if (selectedExtras.length > 0) n += ` + ${selectedExtras.map((e) => e.name).join(", ")}`;
    return n;
  };

  const handleAdd = () => {
    const displayName = buildDisplayName();
    const cartKey = halfHalfMode
      ? `${product.id}|${selectedSize?.id ?? ""}|L:${leftExtras.map((e) => e.id).sort().join(",")}|R:${rightExtras.map((e) => e.id).sort().join(",")}`
      : `${product.id}|${selectedSize?.id ?? ""}|${selectedExtras.map((e) => e.id).sort().join(",")}`;

    onAdd({
      cartKey,
      productId: product.id,
      name: product.name,
      displayName,
      basePrice: product.base_price,
      size: selectedSize ? { id: selectedSize.id, label: selectedSize.label, extraPrice: selectedSize.extra_price } : null,
      extras: activeExtras,
      halfHalf: halfHalfMode ? { left: leftExtras, right: rightExtras } : null,
      unitPrice,
      quantity: 1,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 90 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h2 className="font-heading font-bold text-xl text-dark">{product.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{product.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-diavolored text-2xl leading-none ml-4">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Lade Optionen...</p>
          ) : (
            <>
              {/* Größenauswahl */}
              {product.has_sizes && sizes.length > 0 && (
                <div>
                  <p className="font-bold text-dark mb-3">Größe wählen</p>
                  <div className="grid grid-cols-2 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => handleSizeChange(size)}
                        className={`p-3 rounded-xl border-2 text-sm text-left transition-all ${
                          selectedSize?.id === size.id
                            ? "border-diavolored bg-diavolored/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="font-semibold text-dark block">{size.label}</span>
                        <span className="text-gray-500">
                          {size.extra_price === 0
                            ? `${product.base_price.toFixed(2).replace(".", ",")} €`
                            : `+${size.extra_price.toFixed(2).replace(".", ",")} € → ${(product.base_price + size.extra_price).toFixed(2).replace(".", ",")} €`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Halb-Halb Toggle — nur bei Familienpizza */}
              {product.has_extras && isFamilySize && (
                <div
                  onClick={() => { setHalfHalfMode((v) => !v); setSelectedExtras([]); setLeftExtras([]); setRightExtras([]); }}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    halfHalfMode
                      ? "border-diavolored bg-diavolored/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-10 h-6 rounded-full flex items-center transition-all ${halfHalfMode ? "bg-diavolored" : "bg-gray-300"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-all mx-1 ${halfHalfMode ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                  <div>
                    <p className="font-bold text-dark text-sm">🍕 Halb-Halb Pizza</p>
                    <p className="text-xs text-gray-500">Verschiedene Beläge für jede Hälfte</p>
                  </div>
                </div>
              )}

              {/* Normale Extras */}
              {product.has_extras && extras.length > 0 && !halfHalfMode && (
                <div>
                  <p className="font-bold text-dark mb-3">Extras hinzufügen <span className="font-normal text-gray-500 text-sm">(optional)</span></p>
                  <div className="grid grid-cols-2 gap-2">
                    {extras.map((extra) => {
                      const selected = selectedExtras.some((e) => e.id === extra.id);
                      return (
                        <button
                          key={extra.id}
                          onClick={() => toggleExtra(extra)}
                          className={`p-3 rounded-xl border-2 text-sm text-left transition-all flex justify-between items-center ${
                            selected ? "border-diavologreen bg-diavologreen/5" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="font-medium text-dark">{extra.name}</span>
                          <span className={`text-xs font-bold ${selected ? "text-diavologreen" : "text-gray-500"}`}>
                            +{extra.price.toFixed(2).replace(".", ",")} €
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Halb-Halb Extras */}
              {product.has_extras && halfHalfMode && (
                <div className="space-y-4">
                  {(["left", "right"] as const).map((half) => {
                    const halfExtras = half === "left" ? leftExtras : rightExtras;
                    const label = half === "left" ? "½ Linke Hälfte" : "½ Rechte Hälfte";
                    const color = half === "left" ? "text-diavolored" : "text-diavologreen";
                    const borderActive = half === "left" ? "border-diavolored bg-diavolored/5" : "border-diavologreen bg-diavologreen/5";
                    return (
                      <div key={half}>
                        <p className={`font-bold text-sm mb-2 ${color}`}>{label}</p>
                        <div className="grid grid-cols-2 gap-1.5">
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
                                <span className={`font-medium ${selected ? (half === "left" ? "text-diavolored" : "text-diavologreen") : "text-dark"}`}>
                                  {selected ? "✓ " : ""}{extra.name}
                                </span>
                                <span className="text-gray-400 text-xs ml-1">+{extra.price.toFixed(2).replace(".", ",")}€</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Preis-Zusammenfassung */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Grundpreis ({product.name})</span>
                  <span>{product.base_price.toFixed(2).replace(".", ",")} €</span>
                </div>
                {sizeExtraPrice > 0 && (
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Größe ({selectedSize?.label})</span>
                    <span>+{sizeExtraPrice.toFixed(2).replace(".", ",")} €</span>
                  </div>
                )}
                {activeExtras.map((e) => (
                  <div key={e.id} className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>{e.name}</span>
                    <span>+{e.price.toFixed(2).replace(".", ",")} €</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
                  <span>Gesamtpreis</span>
                  <span className="text-diavologreen text-lg">{unitPrice.toFixed(2).replace(".", ",")} €</span>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="w-full bg-diavolored text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg"
              >
                In den Warenkorb — {unitPrice.toFixed(2).replace(".", ",")} €
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
