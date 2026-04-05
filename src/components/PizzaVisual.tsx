"use client";

import Image from "next/image";

// ─── Pizza-Basis-Bilder ──────────────────────────────────────────

const SAUCE_IMAGES: Record<string, string> = {
  "Tomatensauce": "/pizza/base-tomate.png",
  "Ohne Sauce":   "/pizza/base-ohne-sauce.png",
  "Pesto":        "/pizza/base-pesto.png",
  "Frischkäse":   "/pizza/base-frischkaese.png",
};

const FAMILY_SAUCE_IMAGES: Record<string, string> = {
  "Tomatensauce": "/pizza/family-tomate.png",
  "Ohne Sauce":   "/pizza/family-ohne-sauce.png",
  "Pesto":        "/pizza/family-pesto.png",
  "Frischkäse":   "/pizza/family-frischkaese.png",
};

const CHEESE_IMAGES: Record<string, string> = {
  "Tomatensauce": "/pizza/cheese-tomate.png",
  "Ohne Sauce":   "/pizza/cheese-ohne-sauce.png",
  "Pesto":        "/pizza/cheese-pesto.png",
  "Frischkäse":   "/pizza/cheese-frischkaese.png",
};

// ─── Topping-Name → Bild-Datei Mapping ──────────────────────────

const TOPPING_IMAGES: Record<string, { file: string; layer: "under" | "over" }> = {
  "Salami":           { file: "/pizza/toppings/salami.png", layer: "under" },
  "Hinterschinken":   { file: "/pizza/toppings/schinken.png", layer: "under" },
  "Parmaschinken":    { file: "/pizza/toppings/parmaschinken.png", layer: "over" },
  "Speck":            { file: "/pizza/toppings/speck.png", layer: "under" },
  "Hackfleisch":      { file: "/pizza/toppings/hackfleisch.png", layer: "under" },
  "Sucuk":            { file: "/pizza/toppings/sucuk.png", layer: "under" },
  "Thunfisch":        { file: "/pizza/toppings/thunfisch.png", layer: "under" },
  "Sardellen":        { file: "/pizza/toppings/sardellen.png", layer: "under" },
  "Lachs":            { file: "/pizza/toppings/lachs.png", layer: "over" },
  "Champignons":      { file: "/pizza/toppings/champignons.png", layer: "under" },
  "Steinpilze":       { file: "/pizza/toppings/steinpilze.png", layer: "under" },
  "Peperoni":         { file: "/pizza/toppings/peperoni.png", layer: "under" },
  "Paprika":          { file: "/pizza/toppings/paprika.png", layer: "under" },
  "Zwiebeln":         { file: "/pizza/toppings/zwiebeln.png", layer: "under" },
  "Knoblauch":        { file: "/pizza/toppings/knoblauch.png", layer: "under" },
  "Oliven":           { file: "/pizza/toppings/oliven.png", layer: "under" },
  "Artischocken":     { file: "/pizza/toppings/artischocken.png", layer: "under" },
  "Spinat":           { file: "/pizza/toppings/spinat.png", layer: "under" },
  "Rucola":           { file: "/pizza/toppings/rucola.png", layer: "over" },
  "Mais":             { file: "/pizza/toppings/mais.png", layer: "under" },
  "Ananas":           { file: "/pizza/toppings/ananas.png", layer: "under" },
  "Tomaten frisch":   { file: "/pizza/toppings/tomaten_frisch.png", layer: "over" },
  "Kirschtomaten":    { file: "/pizza/toppings/kirschtomaten.png", layer: "over" },
  "Broccoli":         { file: "/pizza/toppings/broccoli.png", layer: "under" },
  "Kapern":           { file: "/pizza/toppings/kapern.png", layer: "under" },
  "Gorgonzola":       { file: "/pizza/toppings/gorgonzola.png", layer: "under" },
  "Mozzarella extra": { file: "/pizza/toppings/mozzarella_extra.png", layer: "under" },
  "Frischkäse":       { file: "/pizza/toppings/frischkaese.png", layer: "over" },
  "Ei":               { file: "/pizza/toppings/ei.png", layer: "over" },
  "Parmesan/Grana":   { file: "/pizza/toppings/parmesan.png", layer: "over" },
};

// ─── Typen ───────────────────────────────────────────────────────

interface HalfHalfData {
  left: { id: string; name: string }[];
  right: { id: string; name: string }[];
}

interface Props {
  sauce: string;
  cheese: string;
  selectedExtras: { id: string; name: string }[];
  size: string;
  halfHalf?: HalfHalfData | null;
}

// ─── Topping-Layer Komponente ────────────────────────────────────

function ToppingLayer({
  name,
  isFamily,
  clipStyle,
}: {
  name: string;
  isFamily: boolean;
  clipStyle?: "left" | "right";
}) {
  const topping = TOPPING_IMAGES[name];
  if (!topping) return null;

  // Clip für Halb-Halb
  let clipPath: string | undefined;
  if (clipStyle === "left") {
    clipPath = isFamily ? "inset(0 50% 0 0)" : "inset(0 50% 0 0)";
  } else if (clipStyle === "right") {
    clipPath = isFamily ? "inset(0 0 0 50%)" : "inset(0 0 0 50%)";
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ clipPath }}
    >
      <Image
        src={topping.file}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 384px"
      />
    </div>
  );
}

// ─── Hauptkomponente ─────────────────────────────────────────────

export default function PizzaVisual({ sauce, cheese, selectedExtras, size, halfHalf }: Props) {
  const isFamily = size.toLowerCase().includes("famili");
  const hasCheese = cheese !== "Ohne Käse";

  // Basis-Bild: Käse-Foto für runde Pizza, Sauce-Bild für Familie
  const sauceMap = isFamily ? FAMILY_SAUCE_IMAGES : SAUCE_IMAGES;
  const baseImage = (!isFamily && hasCheese)
    ? (CHEESE_IMAGES[sauce] ?? CHEESE_IMAGES["Tomatensauce"])
    : (sauceMap[sauce] ?? sauceMap["Tomatensauce"]);

  // Größe berechnen
  const cmMatch = size.match(/(\d+)\s*cm/i);
  const cm = cmMatch ? parseInt(cmMatch[1]) : 30;
  const maxPct = isFamily ? 100 : Math.round(45 + ((cm - 30) / 20) * 47);

  // Extras in under/over aufteilen
  const allExtras = halfHalf
    ? [...new Map([...halfHalf.left, ...halfHalf.right].map(e => [e.id, e])).values()]
    : selectedExtras;

  const underCheese = allExtras.filter(e => TOPPING_IMAGES[e.name]?.layer === "under");
  const overCheese = allExtras.filter(e => TOPPING_IMAGES[e.name]?.layer === "over");

  const isEmpty = halfHalf
    ? halfHalf.left.length === 0 && halfHalf.right.length === 0
    : selectedExtras.length === 0;

  // Halb-Halb: welche Seite hat welche Extras?
  const getClipStyle = (extra: { id: string; name: string }): "left" | "right" | undefined => {
    if (!halfHalf) return undefined;
    const inLeft = halfHalf.left.some(e => e.id === extra.id);
    const inRight = halfHalf.right.some(e => e.id === extra.id);
    if (inLeft && inRight) return undefined; // auf beiden Seiten
    if (inLeft) return "left";
    if (inRight) return "right";
    return undefined;
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Größen-Label */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-7 bg-dark text-white text-xs font-bold px-3 py-1 rounded-full z-10">
        {size}
      </div>

      {/* Pizza-Container */}
      <div
        className={`relative transition-all duration-500 ${isFamily ? "aspect-video" : "aspect-square"} ${isFamily ? "rounded-2xl" : "rounded-full"} overflow-hidden`}
        style={{ width: `${maxPct}%`, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.30))" }}
      >
        {/* 1. Basis-Bild (Sauce oder Sauce+Käse) */}
        <Image
          src={baseImage}
          alt={`Pizza mit ${sauce}`}
          fill
          className="object-cover transition-all duration-500"
          sizes="(max-width: 768px) 100vw, 384px"
          priority
        />

        {/* 2. Under-Cheese Toppings */}
        {underCheese.map((extra) => (
          <div key={extra.id} className="absolute inset-0 z-[1]">
            <ToppingLayer
              name={extra.name}
              isFamily={isFamily}
              clipStyle={getClipStyle(extra)}
            />
          </div>
        ))}

        {/* 3. Over-Cheese Toppings */}
        {overCheese.map((extra) => (
          <div key={extra.id} className="absolute inset-0 z-[3]">
            <ToppingLayer
              name={extra.name}
              isFamily={isFamily}
              clipStyle={getClipStyle(extra)}
            />
          </div>
        ))}

        {/* Halb-Halb Trennlinie */}
        {halfHalf && (
          <div className="absolute inset-0 z-[5] pointer-events-none flex items-center justify-center">
            <div className={`${isFamily ? "w-px h-full" : "w-px h-full"} border-l-2 border-dashed border-white/80`}
              style={{ filter: "drop-shadow(0 0 3px rgba(0,0,0,0.5))" }} />
          </div>
        )}
      </div>

      {/* Leere Pizza Hinweis */}
      {isEmpty && (
        <p className="mt-3 text-dark/40 text-xs font-medium text-center">
          {halfHalf ? "Wähle Beläge für jede Hälfte!" : "Wähle Beläge und sieh sie hier erscheinen!"}
        </p>
      )}
    </div>
  );
}
