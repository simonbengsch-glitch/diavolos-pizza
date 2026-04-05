"use client";

import Image from "next/image";

// ─── Sauce-Basis-Bilder (Teig + Sauce, kein Käse) ────────────────

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

// ─── Käse-Overlay-Bilder (Sauce+Käse kombiniert) ─────────────────

const CHEESE_IMAGES: Record<string, string> = {
  "Tomatensauce": "/pizza/cheese-tomate.png",
  "Ohne Sauce":   "/pizza/cheese-ohne-sauce.png",
  "Pesto":        "/pizza/cheese-pesto.png",
  "Frischkäse":   "/pizza/cheese-frischkaese.png",
};

// ─── Topping-Bilder: Name → Datei + Layer-Position ───────────────
// Jedes Bild ist ein vorgefertigter Layer in gleicher Größe.
// Die Verteilung der Zutaten steckt IM BILD, nicht im Code.

const TOPPINGS: Record<string, { file: string; layer: "under" | "over" }> = {
  "Salami":           { file: "/pizza/toppings/salami.png",           layer: "under" },
  "Hinterschinken":   { file: "/pizza/toppings/schinken.png",         layer: "under" },
  "Parmaschinken":    { file: "/pizza/toppings/parmaschinken.png",     layer: "over"  },
  "Speck":            { file: "/pizza/toppings/speck.png",             layer: "under" },
  "Hackfleisch":      { file: "/pizza/toppings/hackfleisch.png",       layer: "under" },
  "Sucuk":            { file: "/pizza/toppings/sucuk.png",             layer: "under" },
  "Thunfisch":        { file: "/pizza/toppings/thunfisch.png",         layer: "under" },
  "Sardellen":        { file: "/pizza/toppings/sardellen.png",         layer: "under" },
  "Lachs":            { file: "/pizza/toppings/lachs.png",             layer: "over"  },
  "Champignons":      { file: "/pizza/toppings/champignons.png",       layer: "under" },
  "Steinpilze":       { file: "/pizza/toppings/steinpilze.png",        layer: "under" },
  "Peperoni":         { file: "/pizza/toppings/peperoni.png",          layer: "under" },
  "Paprika":          { file: "/pizza/toppings/paprika.png",           layer: "under" },
  "Zwiebeln":         { file: "/pizza/toppings/zwiebeln.png",          layer: "under" },
  "Knoblauch":        { file: "/pizza/toppings/knoblauch.png",         layer: "under" },
  "Oliven":           { file: "/pizza/toppings/oliven.png",            layer: "under" },
  "Artischocken":     { file: "/pizza/toppings/artischocken.png",      layer: "under" },
  "Spinat":           { file: "/pizza/toppings/spinat.png",            layer: "under" },
  "Rucola":           { file: "/pizza/toppings/rucola.png",            layer: "over"  },
  "Mais":             { file: "/pizza/toppings/mais.png",              layer: "under" },
  "Ananas":           { file: "/pizza/toppings/ananas.png",            layer: "under" },
  "Tomaten frisch":   { file: "/pizza/toppings/tomaten_frisch.png",    layer: "over"  },
  "Kirschtomaten":    { file: "/pizza/toppings/kirschtomaten.png",     layer: "over"  },
  "Broccoli":         { file: "/pizza/toppings/broccoli.png",          layer: "under" },
  "Kapern":           { file: "/pizza/toppings/kapern.png",            layer: "under" },
  "Gorgonzola":       { file: "/pizza/toppings/gorgonzola.png",       layer: "under" },
  "Mozzarella extra": { file: "/pizza/toppings/mozzarella_extra.png",  layer: "under" },
  "Frischkäse":       { file: "/pizza/toppings/frischkaese.png",       layer: "over"  },
  "Ei":               { file: "/pizza/toppings/ei.png",                layer: "over"  },
  "Parmesan/Grana":   { file: "/pizza/toppings/parmesan.png",          layer: "over"  },
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

// ─── Einzelner Bild-Layer ────────────────────────────────────────

function ToppingLayer({ src, alt, z, clip }: {
  src: string;
  alt: string;
  z: number;
  clip?: "left" | "right";
}) {
  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
      style={{
        zIndex: z,
        clipPath: clip === "left" ? "inset(0 50% 0 0)" : clip === "right" ? "inset(0 0 0 50%)" : undefined,
      }}
    >
      <Image
        src={src}
        alt={alt}
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

  // Basis-Bild: immer das Sauce-Bild (Pizza verändert sich NIE)
  const sauceMap = isFamily ? FAMILY_SAUCE_IMAGES : SAUCE_IMAGES;
  const baseImage = sauceMap[sauce] ?? sauceMap["Tomatensauce"];

  // Käse-Overlay
  const cheeseImage = CHEESE_IMAGES[sauce] ?? CHEESE_IMAGES["Tomatensauce"];

  // Größe
  const cmMatch = size.match(/(\d+)\s*cm/i);
  const cm = cmMatch ? parseInt(cmMatch[1]) : 30;
  const maxPct = isFamily ? 100 : Math.round(45 + ((cm - 30) / 20) * 47);

  // Extras nach Layer sortieren
  const extras = halfHalf ? [] : selectedExtras;
  const underExtras = extras.filter(e => TOPPINGS[e.name]?.layer === "under");
  const overExtras = extras.filter(e => TOPPINGS[e.name]?.layer === "over");

  // Halb-Halb Aufteilung
  const halfLeftUnder = halfHalf?.left.filter(e => TOPPINGS[e.name]?.layer === "under") ?? [];
  const halfLeftOver = halfHalf?.left.filter(e => TOPPINGS[e.name]?.layer === "over") ?? [];
  const halfRightUnder = halfHalf?.right.filter(e => TOPPINGS[e.name]?.layer === "under") ?? [];
  const halfRightOver = halfHalf?.right.filter(e => TOPPINGS[e.name]?.layer === "over") ?? [];

  const isEmpty = halfHalf
    ? halfHalf.left.length === 0 && halfHalf.right.length === 0
    : selectedExtras.length === 0;

  return (
    <div className="relative flex items-center justify-center">
      {/* Größen-Label */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-7 bg-dark text-white text-xs font-bold px-3 py-1 rounded-full z-10">
        {size}
      </div>

      {/* Pizza-Container — rund zugeschnitten, alle Layer gleiche Größe */}
      <div
        className={`relative transition-all duration-500 ${isFamily ? "aspect-video" : "aspect-square"} ${isFamily ? "rounded-2xl" : "rounded-full"} overflow-hidden`}
        style={{ width: `${maxPct}%`, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.30))" }}
      >
        {/* ── LAYER 1: Sauce-Basis (Teig + Sauce, immer gleich) ── */}
        <Image
          src={baseImage}
          alt={`Pizza mit ${sauce}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 384px"
          priority
          style={{ zIndex: 0 }}
        />

        {/* ── LAYER 2: Under-Cheese Toppings ── */}
        {halfHalf ? (
          <>
            {halfLeftUnder.map(e => TOPPINGS[e.name] && (
              <ToppingLayer key={`lu-${e.id}`} src={TOPPINGS[e.name].file} alt={e.name} z={1} clip="left" />
            ))}
            {halfRightUnder.map(e => TOPPINGS[e.name] && (
              <ToppingLayer key={`ru-${e.id}`} src={TOPPINGS[e.name].file} alt={e.name} z={1} clip="right" />
            ))}
          </>
        ) : (
          underExtras.map(e => TOPPINGS[e.name] && (
            <ToppingLayer key={`u-${e.id}`} src={TOPPINGS[e.name].file} alt={e.name} z={1} />
          ))
        )}

        {/* ── LAYER 3: Käse-Overlay ── */}
        {hasCheese && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, opacity: 0.7 }}>
            <Image
              src={cheeseImage}
              alt="Käse"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
        )}

        {/* ── LAYER 4: Over-Cheese Toppings ── */}
        {halfHalf ? (
          <>
            {halfLeftOver.map(e => TOPPINGS[e.name] && (
              <ToppingLayer key={`lo-${e.id}`} src={TOPPINGS[e.name].file} alt={e.name} z={3} clip="left" />
            ))}
            {halfRightOver.map(e => TOPPINGS[e.name] && (
              <ToppingLayer key={`ro-${e.id}`} src={TOPPINGS[e.name].file} alt={e.name} z={3} clip="right" />
            ))}
          </>
        ) : (
          overExtras.map(e => TOPPINGS[e.name] && (
            <ToppingLayer key={`o-${e.id}`} src={TOPPINGS[e.name].file} alt={e.name} z={3} />
          ))
        )}

        {/* ── Halb-Halb Trennlinie ── */}
        {halfHalf && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 4 }}>
            <div className="w-px h-full border-l-2 border-dashed border-white/80"
              style={{ filter: "drop-shadow(0 0 3px rgba(0,0,0,0.5))" }} />
          </div>
        )}
      </div>

      {isEmpty && (
        <p className="mt-3 text-dark/40 text-xs font-medium text-center">
          {halfHalf ? "Wähle Beläge für jede Hälfte!" : "Wähle Beläge und sieh sie hier erscheinen!"}
        </p>
      )}
    </div>
  );
}
