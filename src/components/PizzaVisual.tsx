"use client";

import Image from "next/image";

// Pizza-Basis-Bilder je nach Sauce (rund = Standard, rechteckig = Familienpizza)
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

// Echte Käse-Bilder als Overlay (gleich für Mozzarella und veganen Käse)
const CHEESE_IMAGES: Record<string, string> = {
  "Tomatensauce": "/pizza/cheese-tomate.png",
  "Ohne Sauce":   "/pizza/cheese-ohne-sauce.png",
  "Pesto":        "/pizza/cheese-pesto.png",
  "Frischkäse":   "/pizza/cheese-frischkaese.png",
};

// Pseudo-random basierend auf Koordinaten (deterministisch, kein Math.random)
function seededRand(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
  return n - Math.floor(n);
}

// Pizza-Zentrum im Bild liegt bei ca. (200, 215) – leicht unterhalb der geometrischen Mitte
// Innerer Sauce-Bereich hat Radius ~85px (Kruste ist dick)
const CX = 200;
const CY = 215;
const R = 80; // max Abstand vom Zentrum

const POSITIONS: [number, number][] = [
  // Äußerer Ring (8 Positionen, Radius ~75)
  [CX, CY - 75],       [CX + 53, CY - 53],  [CX + 75, CY],       [CX + 53, CY + 53],
  [CX, CY + 75],       [CX - 53, CY + 53],  [CX - 75, CY],       [CX - 53, CY - 53],
  // Mittlerer Ring (6 Positionen, Radius ~45)
  [CX, CY - 45],       [CX + 39, CY - 22],  [CX + 39, CY + 22],
  [CX, CY + 45],       [CX - 39, CY + 22],  [CX - 39, CY - 22],
  // Innerer Ring (4 Positionen, Radius ~22)
  [CX + 22, CY - 12],  [CX + 22, CY + 12],  [CX - 22, CY + 12],  [CX - 22, CY - 12],
  // Zentrum
  [CX, CY],
];

// Halb-Halb Positionen
const LEFT_POSITIONS: [number, number][] = [
  [CX - 20, CY - 70], [CX - 55, CY - 40], [CX - 70, CY],      [CX - 55, CY + 40], [CX - 20, CY + 70],
  [CX - 35, CY - 20], [CX - 40, CY + 20], [CX - 60, CY - 10], [CX - 25, CY],      [CX - 15, CY + 40],
];
const RIGHT_POSITIONS: [number, number][] = [
  [CX + 20, CY - 70], [CX + 55, CY - 40], [CX + 70, CY],      [CX + 55, CY + 40], [CX + 20, CY + 70],
  [CX + 35, CY - 20], [CX + 40, CY + 20], [CX + 60, CY - 10], [CX + 25, CY],      [CX + 15, CY + 40],
];

// Familienpizza Positionen (Zentrum 300,210 in 600x400)
const FCX = 300;
const FCY = 210;
const FAMILY_POSITIONS: [number, number][] = [
  [FCX - 150, FCY - 70], [FCX - 80, FCY - 80], [FCX, FCY - 70],      [FCX + 80, FCY - 80], [FCX + 150, FCY - 70],
  [FCX - 160, FCY],      [FCX - 80, FCY - 20], [FCX, FCY],           [FCX + 80, FCY - 20], [FCX + 160, FCY],
  [FCX - 150, FCY + 70], [FCX - 80, FCY + 70], [FCX, FCY + 70],     [FCX + 80, FCY + 70], [FCX + 150, FCY + 70],
  [FCX - 40, FCY - 45],  [FCX + 40, FCY + 45], [FCX + 120, FCY - 40],[FCX - 120, FCY + 40],[FCX + 40, FCY - 45],
];

const FAMILY_LEFT_POSITIONS: [number, number][] = [
  [FCX - 180, FCY - 60], [FCX - 140, FCY - 30], [FCX - 100, FCY],     [FCX - 140, FCY + 30], [FCX - 180, FCY + 60],
  [FCX - 160, FCY - 10], [FCX - 120, FCY + 50],  [FCX - 200, FCY],     [FCX - 100, FCY - 50], [FCX - 150, FCY],
];
const FAMILY_RIGHT_POSITIONS: [number, number][] = [
  [FCX + 180, FCY - 60], [FCX + 140, FCY - 30], [FCX + 100, FCY],     [FCX + 140, FCY + 30], [FCX + 180, FCY + 60],
  [FCX + 160, FCY - 10], [FCX + 120, FCY + 50],  [FCX + 200, FCY],     [FCX + 100, FCY - 50], [FCX + 150, FCY],
];


// Toppings die ÜBER dem Käse liegen (frisch / nach dem Backen)
const OVER_CHEESE_TOPPINGS = new Set([
  "Rucola", "Tomaten frisch", "Kirschtomaten", "Mozzarella extra",
  "Gorgonzola", "Frischkäse", "Parmesan/Grana", "Ei",
]);

// Echte Bild-Layer für Toppings (erweiterbar für weitere Beläge)
const TOPPING_IMAGES: Record<string, { src: string; layer: "under_cheese" | "over_cheese" }> = {
  // Under-Cheese (vor dem Backen)
  "Salami":          { src: "/pizza/toppings/salami.png",          layer: "under_cheese" },
  "Salami, scharf":  { src: "/pizza/toppings/salami-scharf.png",   layer: "under_cheese" },
  "Speck":           { src: "/pizza/toppings/speck.png",           layer: "under_cheese" },
  "Hinterschinken":  { src: "/pizza/toppings/hinterschinken.png",  layer: "under_cheese" },
  "Parmaschinken":   { src: "/pizza/toppings/parmaschinken.png",   layer: "under_cheese" },
  "Hackfleisch":     { src: "/pizza/toppings/hackfleisch.png",     layer: "under_cheese" },
  "Thunfisch":       { src: "/pizza/toppings/thunfisch.png",       layer: "under_cheese" },
  "Sardellen":       { src: "/pizza/toppings/sardellen.png",       layer: "under_cheese" },
  "Lachs":           { src: "/pizza/toppings/lachs.png",           layer: "under_cheese" },
  "Garnelen":        { src: "/pizza/toppings/garnelen.png",        layer: "under_cheese" },
  "Meeresfrüchten":  { src: "/pizza/toppings/meeresfruechte.png",  layer: "under_cheese" },
  "Champignons":     { src: "/pizza/toppings/champignons.png",     layer: "under_cheese" },
  "Steinpilzen":     { src: "/pizza/toppings/steinpilze.png",      layer: "under_cheese" },
  "Zwiebeln":        { src: "/pizza/toppings/zwiebeln.png",        layer: "under_cheese" },
  "Knoblauch":       { src: "/pizza/toppings/knoblauch.png",       layer: "under_cheese" },
  "Paprika":         { src: "/pizza/toppings/paprika.png",         layer: "under_cheese" },
  "Peperoni, mild":  { src: "/pizza/toppings/peperoni-mild.png",   layer: "under_cheese" },
  "Peperoni, scharf":{ src: "/pizza/toppings/peperoni-scharf.png", layer: "under_cheese" },
  "Oliven":          { src: "/pizza/toppings/oliven.png",          layer: "under_cheese" },
  "Kapern":          { src: "/pizza/toppings/kapern.png",          layer: "under_cheese" },
  "Mais":            { src: "/pizza/toppings/mais.png",            layer: "under_cheese" },
  "Ananas":          { src: "/pizza/toppings/ananas.png",          layer: "under_cheese" },
  "Spinat":          { src: "/pizza/toppings/spinat.png",          layer: "over_cheese" },
  "Broccoli":        { src: "/pizza/toppings/broccoli.png",        layer: "under_cheese" },
  "Artischocken":    { src: "/pizza/toppings/artischocken.png",    layer: "under_cheese" },
  "Auberginen":      { src: "/pizza/toppings/auberginen.png",      layer: "under_cheese" },
  "Zucchini":        { src: "/pizza/toppings/zucchini.png",        layer: "under_cheese" },
  "Bohnen":          { src: "/pizza/toppings/bohnen.png",          layer: "under_cheese" },
  "Spiegelei":       { src: "/pizza/toppings/spiegelei.png",       layer: "under_cheese" },
  "Ei, gekocht":     { src: "/pizza/toppings/ei-gekocht.png",      layer: "under_cheese" },

  // Over-Cheese (frisch / nach dem Backen)
  "Rucola":          { src: "/pizza/toppings/rucola.png",          layer: "over_cheese" },
  "Kirschtomaten":   { src: "/pizza/toppings/kirschtomaten.png",   layer: "over_cheese" },
  "Frischkäse":      { src: "/pizza/toppings/frischkaese.png",     layer: "over_cheese" },
  "Gorgonzola":      { src: "/pizza/toppings/gorgonzola.png",      layer: "over_cheese" },
  "Parmesan":        { src: "/pizza/toppings/parmesan.png",        layer: "over_cheese" },
  "Schafskäse":      { src: "/pizza/toppings/schafskaese.png",     layer: "over_cheese" },
  "Käse, vegan":     { src: "/pizza/toppings/kaese-vegan.png",     layer: "over_cheese" },
  "Büffelmozzarella":{ src: "/pizza/toppings/bueffelmozzarella.png",layer: "over_cheese" },
  "Mozzarella":      { src: "/pizza/toppings/mozzarella-extra.png",layer: "over_cheese" },
  "Basilikum-Pesto": { src: "/pizza/toppings/basilikum-pesto.png", layer: "over_cheese" },
  "Trüffel-Pesto":   { src: "/pizza/toppings/trueffel-pesto.png",  layer: "over_cheese" },
  "Walnüssen":       { src: "/pizza/toppings/walnuesse.png",       layer: "over_cheese" },
};

// Zutaten → visuelle Darstellung – realistischer mit Variation
const TOPPING_VISUALS: Record<string, {
  pieces: number;
  render: (cx: number, cy: number, key: string, idx: number) => React.ReactNode;
}> = {
  "Salami": {
    pieces: 7,
    render: (cx, cy, key, idx) => {
      const r = 11 + seededRand(cx, cy, idx) * 4;
      const rot = seededRand(cx, cy, idx + 1) * 360;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={r} fill="#9B1B30" />
          <circle cx={cx} cy={cy} r={r * 0.78} fill="#B22234" />
          {/* Fettflecken */}
          <circle cx={cx - r * 0.3} cy={cy - r * 0.25} r={r * 0.12} fill="#FFEEDD" opacity={0.6} />
          <circle cx={cx + r * 0.25} cy={cy + r * 0.15} r={r * 0.09} fill="#FFEEDD" opacity={0.5} />
          <circle cx={cx - r * 0.1} cy={cy + r * 0.3} r={r * 0.08} fill="#FFEEDD" opacity={0.4} />
          <circle cx={cx + r * 0.35} cy={cy - r * 0.2} r={r * 0.07} fill="#FFEEDD" opacity={0.45} />
          {/* Rand-Dunkelheit */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#7A1020" strokeWidth={0.8} opacity={0.5} />
        </g>
      );
    },
  },
  "Mozzarella extra": {
    pieces: 6,
    render: (cx, cy, key, idx) => {
      const rx = 12 + seededRand(cx, cy, idx) * 6;
      const ry = 8 + seededRand(cx, cy, idx + 2) * 4;
      const rot = seededRand(cx, cy, idx + 1) * 180;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFF8E1" opacity={0.85} />
          <ellipse cx={cx} cy={cy} rx={rx * 0.6} ry={ry * 0.5} fill="#FFFEF5" opacity={0.6} />
        </g>
      );
    },
  },
  "Hinterschinken": {
    pieces: 5,
    render: (cx, cy, key, idx) => {
      const rx = 13 + seededRand(cx, cy, idx) * 5;
      const ry = 7 + seededRand(cx, cy, idx + 2) * 4;
      const rot = seededRand(cx, cy, idx + 1) * 180 - 90;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#E8B4A0" opacity={0.9} />
          <ellipse cx={cx + 2} cy={cy - 1} rx={rx * 0.7} ry={ry * 0.6} fill="#D49880" opacity={0.5} />
          <ellipse cx={cx - 3} cy={cy + 1} rx={rx * 0.4} ry={ry * 0.35} fill="#C28870" opacity={0.3} />
        </g>
      );
    },
  },
  "Parmaschinken": {
    pieces: 4,
    render: (cx, cy, key, idx) => {
      const rx = 15 + seededRand(cx, cy, idx) * 5;
      const ry = 7 + seededRand(cx, cy, idx + 2) * 4;
      const rot = seededRand(cx, cy, idx + 1) * 180 - 90;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#D4917A" opacity={0.85} />
          <ellipse cx={cx} cy={cy} rx={rx * 0.5} ry={ry * 0.4} fill="#BF7A65" opacity={0.3} />
          {/* Fettstreifen */}
          <ellipse cx={cx + rx * 0.3} cy={cy} rx={rx * 0.2} ry={ry * 0.8} fill="#F5DDD5" opacity={0.4} />
        </g>
      );
    },
  },
  "Champignons": {
    pieces: 8,
    render: (cx, cy, key, idx) => {
      const scale = 0.8 + seededRand(cx, cy, idx) * 0.4;
      const rot = seededRand(cx, cy, idx + 1) * 360;
      return (
        <g key={key} transform={`translate(${cx},${cy}) scale(${scale}) rotate(${rot})`}>
          {/* Pilzkopf von oben – Scheibe */}
          <ellipse cx={0} cy={0} rx={10} ry={7} fill="#C4A882" />
          <ellipse cx={0} cy={0} rx={6} ry={4} fill="#D4BE9C" opacity={0.7} />
          {/* Lamellen */}
          <line x1={-5} y1={1} x2={5} y2={1} stroke="#A08060" strokeWidth={0.5} opacity={0.4} />
          <line x1={-4} y1={3} x2={4} y2={3} stroke="#A08060" strokeWidth={0.5} opacity={0.3} />
        </g>
      );
    },
  },
  "Oliven": {
    pieces: 9,
    render: (cx, cy, key, idx) => {
      const r = 6 + seededRand(cx, cy, idx) * 3;
      return (
        <g key={key}>
          {/* Olivenring von oben */}
          <circle cx={cx} cy={cy} r={r} fill="#2C3E1F" />
          <circle cx={cx} cy={cy} r={r * 0.55} fill="#1A2510" />
          <circle cx={cx} cy={cy} r={r * 0.3} fill="#8B1A1A" opacity={0.3} />
          {/* Glanz */}
          <ellipse cx={cx - r * 0.2} cy={cy - r * 0.2} rx={r * 0.2} ry={r * 0.12} fill="white" opacity={0.15} />
        </g>
      );
    },
  },
  "Peperoni": {
    pieces: 10,
    render: (cx, cy, key, idx) => {
      const rot = seededRand(cx, cy, idx + 1) * 180;
      const len = 10 + seededRand(cx, cy, idx) * 6;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={len} ry={4} fill="#D4380D" />
          <ellipse cx={cx} cy={cy} rx={len * 0.7} ry={2.5} fill="#E85D3A" opacity={0.5} />
          {/* Samen */}
          <circle cx={cx - 3} cy={cy} r={0.8} fill="#FFFDD0" opacity={0.6} />
          <circle cx={cx + 2} cy={cy - 0.5} r={0.7} fill="#FFFDD0" opacity={0.5} />
        </g>
      );
    },
  },
  "Paprika": {
    pieces: 6,
    render: (cx, cy, key, idx) => {
      const colors = ["#CC2200", "#E6A800", "#228B22"];
      const color = colors[Math.floor(seededRand(cx, cy, idx) * 3)];
      const rot = seededRand(cx, cy, idx + 1) * 180 - 90;
      const w = 14 + seededRand(cx, cy, idx + 2) * 4;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          {/* Paprikastreifen */}
          <rect x={cx - w / 2} y={cy - 3.5} width={w} height={7} rx={3} fill={color} opacity={0.85} />
          <rect x={cx - w / 2 + 1} y={cy - 2} width={w - 2} height={3} rx={1.5} fill="white" opacity={0.12} />
        </g>
      );
    },
  },
  "Zwiebeln": {
    pieces: 8,
    render: (cx, cy, key, idx) => {
      const r = 7 + seededRand(cx, cy, idx) * 3;
      const rot = seededRand(cx, cy, idx + 1) * 180;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          {/* Zwiebelring */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8D5C0" strokeWidth={2.5} opacity={0.8} />
          <circle cx={cx} cy={cy} r={r * 0.6} fill="none" stroke="#E8D5C0" strokeWidth={1.5} opacity={0.4} />
          {/* Leichter Glanz */}
          <ellipse cx={cx} cy={cy - r * 0.3} rx={r * 0.5} ry={r * 0.15} fill="white" opacity={0.1} />
        </g>
      );
    },
  },
  "Spinat": {
    pieces: 6,
    render: (cx, cy, key, idx) => {
      const rot = seededRand(cx, cy, idx + 1) * 360;
      const scale = 0.8 + seededRand(cx, cy, idx) * 0.4;
      return (
        <g key={key} transform={`translate(${cx},${cy}) rotate(${rot}) scale(${scale})`}>
          {/* Blattwellig */}
          <ellipse cx={0} cy={-3} rx={9} ry={5} fill="#2D6B2D" opacity={0.85} />
          <ellipse cx={0} cy={3} rx={7} ry={4} fill="#358535" opacity={0.75} />
          {/* Blattader */}
          <line x1={0} y1={-7} x2={0} y2={6} stroke="#1D4B1D" strokeWidth={0.6} opacity={0.4} />
        </g>
      );
    },
  },
  "Rucola": {
    pieces: 8,
    render: (cx, cy, key, idx) => {
      const rot = seededRand(cx, cy, idx + 1) * 360;
      return (
        <g key={key} transform={`translate(${cx},${cy}) rotate(${rot})`}>
          <ellipse cx={-5} cy={-2} rx={7} ry={3} fill="#4A8E4A" opacity={0.9} transform="rotate(-25)" />
          <ellipse cx={5} cy={-2} rx={7} ry={3} fill="#55A055" opacity={0.85} transform="rotate(25)" />
          <ellipse cx={0} cy={3} rx={6} ry={2.5} fill="#3D7D3D" opacity={0.8} transform="rotate(5)" />
        </g>
      );
    },
  },
  "Thunfisch": {
    pieces: 5,
    render: (cx, cy, key, idx) => {
      const rot = seededRand(cx, cy, idx + 1) * 180;
      const rx = 11 + seededRand(cx, cy, idx) * 5;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.6} fill="#C9A87C" opacity={0.85} />
          <ellipse cx={cx + 2} cy={cy - 1} rx={rx * 0.6} ry={rx * 0.3} fill="#B8956A" opacity={0.4} />
          {/* Faserige Textur */}
          <line x1={cx - rx * 0.5} y1={cy} x2={cx + rx * 0.5} y2={cy} stroke="#A08050" strokeWidth={0.5} opacity={0.3} />
          <line x1={cx - rx * 0.4} y1={cy + 2} x2={cx + rx * 0.4} y2={cy + 2} stroke="#A08050" strokeWidth={0.4} opacity={0.2} />
        </g>
      );
    },
  },
  "Sardellen": {
    pieces: 6,
    render: (cx, cy, key, idx) => {
      const rot = seededRand(cx, cy, idx + 1) * 180 - 90;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={14} ry={3} fill="#5A3D28" opacity={0.9} />
          <ellipse cx={cx} cy={cy - 0.5} rx={10} ry={1.5} fill="#7A5D48" opacity={0.4} />
        </g>
      );
    },
  },
  "Lachs": {
    pieces: 4,
    render: (cx, cy, key, idx) => {
      const rot = seededRand(cx, cy, idx + 1) * 180 - 90;
      const rx = 14 + seededRand(cx, cy, idx) * 4;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.55} fill="#FA8072" opacity={0.85} />
          {/* Fettlinien */}
          <line x1={cx - rx * 0.6} y1={cy - 2} x2={cx + rx * 0.6} y2={cy - 2} stroke="#FFB0A0" strokeWidth={1} opacity={0.5} />
          <line x1={cx - rx * 0.5} y1={cy + 1.5} x2={cx + rx * 0.5} y2={cy + 1.5} stroke="#FFB0A0" strokeWidth={0.8} opacity={0.4} />
        </g>
      );
    },
  },
  "Mais": {
    pieces: 12,
    render: (cx, cy, key, idx) => {
      const r = 3 + seededRand(cx, cy, idx) * 2;
      return (
        <g key={key}>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 1.3} fill="#FFD700" opacity={0.9} />
          <ellipse cx={cx} cy={cy} rx={r * 0.5} ry={r * 0.7} fill="#FFC000" opacity={0.4} />
        </g>
      );
    },
  },
  "Ananas": {
    pieces: 6,
    render: (cx, cy, key, idx) => {
      const rot = seededRand(cx, cy, idx + 1) * 360;
      const r = 10 + seededRand(cx, cy, idx) * 3;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.7} fill="#F5D020" opacity={0.85} />
          <ellipse cx={cx} cy={cy} rx={r * 0.6} ry={r * 0.4} fill="#E8C000" opacity={0.4} />
          {/* Textur */}
          <circle cx={cx - 3} cy={cy - 1} r={1} fill="#C8A000" opacity={0.3} />
          <circle cx={cx + 2} cy={cy + 1} r={1} fill="#C8A000" opacity={0.3} />
        </g>
      );
    },
  },
  "Gorgonzola": {
    pieces: 5,
    render: (cx, cy, key, idx) => {
      const rx = 11 + seededRand(cx, cy, idx) * 5;
      const ry = 7 + seededRand(cx, cy, idx + 2) * 4;
      const rot = seededRand(cx, cy, idx + 1) * 180;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#F0EDD8" opacity={0.85} />
          {/* Blauschimmel-Adern */}
          <circle cx={cx - rx * 0.25} cy={cy - ry * 0.2} r={rx * 0.15} fill="#6080B0" opacity={0.35} />
          <circle cx={cx + rx * 0.2} cy={cy + ry * 0.15} r={rx * 0.12} fill="#5070A0" opacity={0.3} />
          <circle cx={cx + rx * 0.35} cy={cy - ry * 0.1} r={rx * 0.08} fill="#5878A8" opacity={0.25} />
        </g>
      );
    },
  },
  "Frischkäse": {
    pieces: 5,
    render: (cx, cy, key, idx) => {
      const rx = 12 + seededRand(cx, cy, idx) * 5;
      const ry = 8 + seededRand(cx, cy, idx + 2) * 4;
      const rot = seededRand(cx, cy, idx + 1) * 180;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFF0" opacity={0.8} />
          <ellipse cx={cx} cy={cy} rx={rx * 0.5} ry={ry * 0.4} fill="white" opacity={0.3} />
        </g>
      );
    },
  },
  "Speck": {
    pieces: 5,
    render: (cx, cy, key, idx) => {
      const rot = seededRand(cx, cy, idx + 1) * 180 - 90;
      const w = 18 + seededRand(cx, cy, idx) * 6;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <rect x={cx - w / 2} y={cy - 4} width={w} height={8} rx={2} fill="#A83020" opacity={0.85} />
          {/* Fettstreifen */}
          <rect x={cx - w / 2 + 1} y={cy - 1.5} width={w - 2} height={3} rx={1} fill="#F5D0B8" opacity={0.5} />
          <rect x={cx - w / 2 + 2} y={cy + 2} width={w * 0.4} height={1.5} rx={0.5} fill="#F5D0B8" opacity={0.3} />
        </g>
      );
    },
  },
  "Hackfleisch": {
    pieces: 8,
    render: (cx, cy, key, idx) => {
      const r = 5 + seededRand(cx, cy, idx) * 4;
      return (
        <g key={key}>
          <circle cx={cx} cy={cy} r={r} fill="#6B3A1F" opacity={0.85} />
          <circle cx={cx - r * 0.2} cy={cy - r * 0.2} r={r * 0.3} fill="#8B5A3F" opacity={0.4} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#5A2A10" strokeWidth={0.5} opacity={0.3} />
        </g>
      );
    },
  },
  "Artischocken": {
    pieces: 5,
    render: (cx, cy, key, idx) => {
      const rot = seededRand(cx, cy, idx + 1) * 360;
      const scale = 0.8 + seededRand(cx, cy, idx) * 0.4;
      return (
        <g key={key} transform={`translate(${cx},${cy}) rotate(${rot}) scale(${scale})`}>
          {/* Artischockenherz von oben */}
          <ellipse cx={0} cy={0} rx={9} ry={7} fill="#7A9E40" opacity={0.8} />
          <ellipse cx={0} cy={-2} rx={6} ry={4} fill="#90B850" opacity={0.6} />
          <ellipse cx={0} cy={1} rx={4} ry={2.5} fill="#A0C860" opacity={0.5} />
        </g>
      );
    },
  },
  "Tomaten frisch": {
    pieces: 6,
    render: (cx, cy, key, idx) => {
      const r = 9 + seededRand(cx, cy, idx) * 3;
      return (
        <g key={key}>
          <circle cx={cx} cy={cy} r={r} fill="#E03020" opacity={0.85} />
          {/* Kammern */}
          <circle cx={cx} cy={cy} r={r * 0.55} fill="#E84040" opacity={0.4} />
          <line x1={cx - r * 0.35} y1={cy} x2={cx + r * 0.35} y2={cy} stroke="#C02010" strokeWidth={0.8} opacity={0.3} />
          <line x1={cx} y1={cy - r * 0.35} x2={cx} y2={cy + r * 0.35} stroke="#C02010" strokeWidth={0.8} opacity={0.3} />
          {/* Glanz */}
          <ellipse cx={cx - r * 0.2} cy={cy - r * 0.25} rx={r * 0.2} ry={r * 0.12} fill="white" opacity={0.15} />
        </g>
      );
    },
  },
  "Kirschtomaten": {
    pieces: 7,
    render: (cx, cy, key, idx) => {
      const r = 7 + seededRand(cx, cy, idx) * 2;
      return (
        <g key={key}>
          <circle cx={cx} cy={cy} r={r} fill="#CC2200" opacity={0.9} />
          <ellipse cx={cx - r * 0.2} cy={cy - r * 0.25} rx={r * 0.25} ry={r * 0.15} fill="white" opacity={0.2} />
          {/* Stielansatz */}
          <circle cx={cx} cy={cy - r + 1} r={1.5} fill="#2D6A2D" opacity={0.7} />
        </g>
      );
    },
  },
  "Knoblauch": {
    pieces: 6,
    render: (cx, cy, key, idx) => {
      const rot = seededRand(cx, cy, idx + 1) * 360;
      const r = 5 + seededRand(cx, cy, idx) * 3;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.7} fill="#F5F0D0" opacity={0.85} />
          <ellipse cx={cx} cy={cy} rx={r * 0.5} ry={r * 0.3} fill="#EBE5C0" opacity={0.5} />
        </g>
      );
    },
  },
  "Ei": {
    pieces: 3,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy} rx={16} ry={13} fill="#FFF8E8" opacity={0.9} />
        <circle cx={cx} cy={cy} r={6} fill="#F0A500" opacity={0.9} />
        <circle cx={cx} cy={cy} r={3.5} fill="#FFB800" opacity={0.7} />
        {/* Glanz */}
        <ellipse cx={cx - 1.5} cy={cy - 1.5} rx={1.5} ry={1} fill="white" opacity={0.3} />
      </g>
    ),
  },
  "Broccoli": {
    pieces: 5,
    render: (cx, cy, key, idx) => {
      const scale = 0.7 + seededRand(cx, cy, idx) * 0.4;
      const rot = seededRand(cx, cy, idx + 1) * 360;
      return (
        <g key={key} transform={`translate(${cx},${cy}) scale(${scale}) rotate(${rot})`}>
          <circle cx={-4} cy={-3} r={5} fill="#2E8B2E" opacity={0.85} />
          <circle cx={4} cy={-3} r={5} fill="#348B34" opacity={0.85} />
          <circle cx={0} cy={2} r={5} fill="#288B28" opacity={0.85} />
          <circle cx={0} cy={-5} r={4} fill="#3A9B3A" opacity={0.75} />
          <rect x={-1.5} y={4} width={3} height={5} rx={1.5} fill="#8B7355" opacity={0.7} />
        </g>
      );
    },
  },
  "Kapern": {
    pieces: 12,
    render: (cx, cy, key, idx) => {
      const r = 3 + seededRand(cx, cy, idx) * 1.5;
      return (
        <g key={key}>
          <circle cx={cx} cy={cy} r={r} fill="#5B7A3A" opacity={0.9} />
          <ellipse cx={cx - r * 0.2} cy={cy - r * 0.2} rx={r * 0.3} ry={r * 0.2} fill="#6B8A4A" opacity={0.4} />
        </g>
      );
    },
  },
  "Steinpilze": {
    pieces: 4,
    render: (cx, cy, key, idx) => {
      const scale = 0.8 + seededRand(cx, cy, idx) * 0.4;
      const rot = seededRand(cx, cy, idx + 1) * 360;
      return (
        <g key={key} transform={`translate(${cx},${cy}) scale(${scale}) rotate(${rot})`}>
          <ellipse cx={0} cy={-3} rx={11} ry={6} fill="#7B5B3A" opacity={0.9} />
          <rect x={-2.5} y={0} width={5} height={7} rx={2} fill="#8B6B4A" />
          <ellipse cx={0} cy={-3} rx={7} ry={3} fill="#9B7B5A" opacity={0.4} />
        </g>
      );
    },
  },
  "Sucuk": {
    pieces: 6,
    render: (cx, cy, key, idx) => {
      const r = 10 + seededRand(cx, cy, idx) * 3;
      return (
        <g key={key}>
          <circle cx={cx} cy={cy} r={r} fill="#5C1A1A" />
          <circle cx={cx} cy={cy} r={r * 0.75} fill="#7B2A2A" />
          <circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.1} fill="#FFEEDD" opacity={0.4} />
          <circle cx={cx + r * 0.2} cy={cy + r * 0.15} r={r * 0.08} fill="#FFEEDD" opacity={0.35} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4A1010" strokeWidth={0.7} opacity={0.4} />
        </g>
      );
    },
  },
  "Parmesan/Grana": {
    pieces: 7,
    render: (cx, cy, key, idx) => {
      const rot = seededRand(cx, cy, idx + 1) * 180;
      const rx = 7 + seededRand(cx, cy, idx) * 5;
      const ry = 4 + seededRand(cx, cy, idx + 2) * 3;
      return (
        <g key={key} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFF8D0" opacity={0.75} />
          <ellipse cx={cx} cy={cy} rx={rx * 0.4} ry={ry * 0.3} fill="#FFE8A0" opacity={0.3} />
        </g>
      );
    },
  },
};

const DEFAULT_VISUAL = {
  pieces: 5,
  render: (cx: number, cy: number, key: string, idx: number) => {
    const r = 6 + seededRand(cx, cy, idx) * 4;
    return <circle key={key} cx={cx} cy={cy} r={r} fill="#D2691E" opacity={0.8} />;
  },
};

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

export default function PizzaVisual({ sauce, cheese, selectedExtras, size, halfHalf }: Props) {
  const isFamily = size.toLowerCase().includes("famili");
  const hasCheese = cheese !== "Ohne Käse";

  // Immer Sauce-Bild als Basis verwenden (Käse-Bilder haben Artefakte)
  const sauceMap = isFamily ? FAMILY_SAUCE_IMAGES : SAUCE_IMAGES;
  const baseImage = sauceMap[sauce] ?? sauceMap["Tomatensauce"];

  const cmMatch = size.match(/(\d+)\s*cm/i);
  const cm = cmMatch ? parseInt(cmMatch[1]) : 30;
  const maxPct = isFamily ? 100 : Math.round(45 + ((cm - 30) / 20) * 47);

  const buildToppings = (
    extrasArr: { id: string; name: string }[],
    posArr: [number, number][]
  ): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    extrasArr.forEach((extra, extraIndex) => {
      const visual = TOPPING_VISUALS[extra.name] ?? DEFAULT_VISUAL;
      const count = Math.min(visual.pieces, posArr.length);
      for (let i = 0; i < count; i++) {
        const posIndex = (extraIndex * 3 + i * Math.floor(posArr.length / count)) % posArr.length;
        const [cx, cy] = posArr[posIndex];
        // Leichte zufällige Verschiebung für natürlicheren Look
        const offsetX = (seededRand(cx, cy, i + extraIndex * 7) - 0.5) * 8;
        const offsetY = (seededRand(cy, cx, i + extraIndex * 7) - 0.5) * 8;
        elements.push(visual.render(cx + offsetX, cy + offsetY, `${extra.id}-${i}`, i));
      }
    });
    return elements;
  };

  // Extras zu Bild-Layern (ohne Bild → nicht angezeigt)
  const splitExtras = (extras: { id: string; name: string }[]) => {
    const underImages: string[] = [];
    const overImages: string[] = [];
    extras.forEach(e => {
      const img = TOPPING_IMAGES[e.name];
      if (!img) return;
      if (img.layer === "under_cheese") underImages.push(img.src);
      else overImages.push(img.src);
    });
    return { underImages, overImages };
  };

  let underImageLayers: string[] = [];
  let overImageLayers: string[] = [];

  if (halfHalf) {
    const leftSplit  = splitExtras(halfHalf.left);
    const rightSplit = splitExtras(halfHalf.right);
    underImageLayers = [...leftSplit.underImages, ...rightSplit.underImages];
    overImageLayers = [...leftSplit.overImages, ...rightSplit.overImages];
  } else {
    const split = splitExtras(selectedExtras);
    underImageLayers = split.underImages;
    overImageLayers = split.overImages;
  }

  const isEmpty = halfHalf
    ? halfHalf.left.length === 0 && halfHalf.right.length === 0
    : selectedExtras.length === 0;

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-7 bg-dark text-white text-xs font-bold px-3 py-1 rounded-full z-10">
        {size}
      </div>

      <div
        className={`relative transition-all duration-500 ${isFamily ? "aspect-video" : "aspect-square"} ${isFamily ? "rounded-2xl" : "rounded-full"} overflow-hidden`}
        style={{ width: `${maxPct}%`, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.30))" }}
      >
        <Image
          src={baseImage}
          alt={`Pizza mit ${sauce}`}
          fill
          className="object-cover transition-all duration-500"
          sizes="(max-width: 768px) 100vw, 384px"
          priority
        />

        {/* Layer 1: Under-Cheese Bild-Toppings */}
        {underImageLayers.map((src) => (
          <div key={src} className="absolute inset-[12%] z-[1] pointer-events-none rounded-full overflow-hidden">
            <Image
              src={src}
              alt="Topping"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
        ))}

        {/* Layer 2: Käse-Overlay – auf Sauce-Bereich begrenzt (ohne Kruste) */}
        {hasCheese && (
          <div className="absolute inset-[12%] z-[2] pointer-events-none">
            <Image
              src="/pizza/cheese-overlay.png"
              alt="Käse"
              fill
              className="object-contain transition-opacity duration-500"
              style={{ opacity: 0.55, mixBlendMode: "multiply", filter: "contrast(1.08) brightness(0.96)" }}
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
        )}

        {/* Layer 3: Over-Cheese Bild-Toppings */}
        {overImageLayers.map((src) => (
          <div key={src} className="absolute inset-[12%] z-[3] pointer-events-none rounded-full overflow-hidden">
            <Image
              src={src}
              alt="Topping"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
        ))}

        {/* Layer 4: Halb-Halb Trennlinie */}
        {halfHalf && (
          <svg
            viewBox={isFamily ? "0 0 600 400" : "0 0 400 400"}
            className="absolute inset-0 w-full h-full z-[4]"
            style={{ pointerEvents: "none" }}
          >
            {isFamily ? (
              <>
                <line x1="300" y1="20" x2="300" y2="380" stroke="white" strokeWidth="3"
                  strokeDasharray="12,6" opacity="0.85"
                  style={{ filter: "drop-shadow(0 0 3px rgba(0,0,0,0.4))" }} />
                <text x="150" y="390" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }}>½ Links</text>
                <text x="450" y="390" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }}>½ Rechts</text>
              </>
            ) : (
              <>
                <line x1="200" y1="20" x2="200" y2="380" stroke="white" strokeWidth="3"
                  strokeDasharray="12,6" opacity="0.85"
                  style={{ filter: "drop-shadow(0 0 3px rgba(0,0,0,0.4))" }} />
                <text x="105" y="390" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }}>½ Links</text>
                <text x="295" y="390" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }}>½ Rechts</text>
              </>
            )}
          </svg>
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
