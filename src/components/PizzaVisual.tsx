"use client";

import Image from "next/image";

// ─── Pizza-Basis-Bilder (Sauce + Teig) ───────────────────────────

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

// ─── Deterministischer Pseudo-Random ─────────────────────────────

function srand(a: number, b: number, s: number): number {
  const n = Math.sin(a * 12.9898 + b * 78.233 + s * 43758.5453) * 43758.5453;
  return n - Math.floor(n);
}

// ─── Topping Definitionen ────────────────────────────────────────
// Jede Zutat hat: layer (under/over), pieces, render-Funktion

interface ToppingDef {
  layer: "under" | "over";
  pieces: number;
  render: (cx: number, cy: number, key: string, i: number) => React.ReactNode;
}

const T: Record<string, ToppingDef> = {
  "Salami": {
    layer: "under", pieces: 8,
    render: (cx, cy, k, i) => {
      const r = 10 + srand(cx, cy, i) * 4;
      const rot = srand(cx, cy, i + 1) * 30 - 15;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={r} fill="#9B1B30" />
          <circle cx={cx} cy={cy} r={r * 0.8} fill="#B22234" />
          <circle cx={cx - r * 0.3} cy={cy - r * 0.2} r={r * 0.1} fill="#FFEEDD" opacity={0.5} />
          <circle cx={cx + r * 0.2} cy={cy + r * 0.15} r={r * 0.08} fill="#FFEEDD" opacity={0.4} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#7A1020" strokeWidth={0.6} opacity={0.4} />
        </g>
      );
    },
  },
  "Hinterschinken": {
    layer: "under", pieces: 6,
    render: (cx, cy, k, i) => {
      const rx = 12 + srand(cx, cy, i) * 5;
      const ry = 6 + srand(cx, cy, i + 2) * 3;
      const rot = srand(cx, cy, i + 1) * 180;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#E0A8A0" opacity={0.88} />
          <ellipse cx={cx + 1} cy={cy - 1} rx={rx * 0.6} ry={ry * 0.5} fill="#C89080" opacity={0.4} />
        </g>
      );
    },
  },
  "Parmaschinken": {
    layer: "over", pieces: 4,
    render: (cx, cy, k, i) => {
      const rx = 16 + srand(cx, cy, i) * 6;
      const ry = 8 + srand(cx, cy, i + 2) * 4;
      const rot = srand(cx, cy, i + 1) * 180;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#D4917A" opacity={0.85} />
          <ellipse cx={cx + rx * 0.3} cy={cy} rx={rx * 0.18} ry={ry * 0.7} fill="#F5DDD5" opacity={0.35} />
          <ellipse cx={cx} cy={cy} rx={rx * 0.5} ry={ry * 0.35} fill="#BF7A65" opacity={0.25} />
        </g>
      );
    },
  },
  "Speck": {
    layer: "under", pieces: 7,
    render: (cx, cy, k, i) => {
      const w = 14 + srand(cx, cy, i) * 6;
      const rot = srand(cx, cy, i + 1) * 180 - 90;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <rect x={cx - w / 2} y={cy - 3.5} width={w} height={7} rx={2} fill="#A83020" opacity={0.85} />
          <rect x={cx - w / 2 + 1} y={cy - 1} width={w - 2} height={2.5} rx={1} fill="#F5D0B8" opacity={0.45} />
        </g>
      );
    },
  },
  "Hackfleisch": {
    layer: "under", pieces: 10,
    render: (cx, cy, k, i) => {
      const r = 4 + srand(cx, cy, i) * 3;
      return <circle key={k} cx={cx} cy={cy} r={r} fill={srand(cx, cy, i + 3) > 0.5 ? "#6B3A1F" : "#7B4A2F"} opacity={0.85} />;
    },
  },
  "Sucuk": {
    layer: "under", pieces: 7,
    render: (cx, cy, k, i) => {
      const r = 9 + srand(cx, cy, i) * 3;
      return (
        <g key={k}>
          <circle cx={cx} cy={cy} r={r} fill="#5C1A1A" />
          <circle cx={cx} cy={cy} r={r * 0.75} fill="#7B2A2A" />
          <circle cx={cx - r * 0.2} cy={cy - r * 0.2} r={r * 0.09} fill="#FFEEDD" opacity={0.35} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4A1010" strokeWidth={0.5} opacity={0.3} />
        </g>
      );
    },
  },
  "Thunfisch": {
    layer: "under", pieces: 5,
    render: (cx, cy, k, i) => {
      const rx = 10 + srand(cx, cy, i) * 5;
      const rot = srand(cx, cy, i + 1) * 180;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.55} fill="#C9A87C" opacity={0.82} />
          <line x1={cx - rx * 0.4} y1={cy} x2={cx + rx * 0.4} y2={cy} stroke="#A08050" strokeWidth={0.5} opacity={0.3} />
        </g>
      );
    },
  },
  "Sardellen": {
    layer: "under", pieces: 5,
    render: (cx, cy, k, i) => {
      const rot = srand(cx, cy, i + 1) * 180 - 90;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={14} ry={3} fill="#5A3D28" opacity={0.88} />
          <ellipse cx={cx} cy={cy - 0.5} rx={9} ry={1.3} fill="#7A5D48" opacity={0.35} />
        </g>
      );
    },
  },
  "Lachs": {
    layer: "over", pieces: 5,
    render: (cx, cy, k, i) => {
      const rx = 13 + srand(cx, cy, i) * 4;
      const rot = srand(cx, cy, i + 1) * 180 - 90;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.5} fill="#FA8072" opacity={0.85} />
          <line x1={cx - rx * 0.5} y1={cy - 1.5} x2={cx + rx * 0.5} y2={cy - 1.5} stroke="#FFB0A0" strokeWidth={0.8} opacity={0.45} />
        </g>
      );
    },
  },
  "Champignons": {
    layer: "under", pieces: 9,
    render: (cx, cy, k, i) => {
      const s = 0.75 + srand(cx, cy, i) * 0.35;
      const rot = srand(cx, cy, i + 1) * 360;
      return (
        <g key={k} transform={`translate(${cx},${cy}) scale(${s}) rotate(${rot})`}>
          <ellipse cx={0} cy={0} rx={9} ry={6} fill="#C4A882" />
          <ellipse cx={0} cy={0} rx={5} ry={3} fill="#D4BE9C" opacity={0.6} />
        </g>
      );
    },
  },
  "Steinpilze": {
    layer: "under", pieces: 5,
    render: (cx, cy, k, i) => {
      const s = 0.8 + srand(cx, cy, i) * 0.4;
      const rot = srand(cx, cy, i + 1) * 360;
      return (
        <g key={k} transform={`translate(${cx},${cy}) scale(${s}) rotate(${rot})`}>
          <ellipse cx={0} cy={-3} rx={11} ry={6} fill="#7B5B3A" opacity={0.9} />
          <rect x={-2} y={0} width={4} height={6} rx={2} fill="#8B6B4A" />
        </g>
      );
    },
  },
  "Peperoni": {
    layer: "under", pieces: 8,
    render: (cx, cy, k, i) => {
      const rot = srand(cx, cy, i + 1) * 180;
      const len = 9 + srand(cx, cy, i) * 5;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={len} ry={3.5} fill="#D4380D" opacity={0.88} />
          <circle cx={cx - 2} cy={cy} r={0.7} fill="#FFFDD0" opacity={0.5} />
        </g>
      );
    },
  },
  "Paprika": {
    layer: "under", pieces: 8,
    render: (cx, cy, k, i) => {
      const colors = ["#CC2200", "#E6A800", "#228B22"];
      const color = colors[Math.floor(srand(cx, cy, i) * 3)];
      const rot = srand(cx, cy, i + 1) * 180 - 90;
      const w = 13 + srand(cx, cy, i + 2) * 4;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <rect x={cx - w / 2} y={cy - 3} width={w} height={6} rx={2.5} fill={color} opacity={0.85} />
        </g>
      );
    },
  },
  "Zwiebeln": {
    layer: "under", pieces: 9,
    render: (cx, cy, k, i) => {
      const r = 6 + srand(cx, cy, i) * 3;
      return (
        <g key={k}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8D5C0" strokeWidth={2.2} opacity={0.7} />
          <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#E8D5C0" strokeWidth={1.3} opacity={0.35} />
        </g>
      );
    },
  },
  "Knoblauch": {
    layer: "under", pieces: 6,
    render: (cx, cy, k, i) => {
      const r = 4 + srand(cx, cy, i) * 2;
      const rot = srand(cx, cy, i + 1) * 360;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.7} fill="#F5F0D0" opacity={0.82} />
        </g>
      );
    },
  },
  "Oliven": {
    layer: "under", pieces: 9,
    render: (cx, cy, k, i) => {
      const r = 5 + srand(cx, cy, i) * 2.5;
      return (
        <g key={k}>
          <circle cx={cx} cy={cy} r={r} fill="#2C3E1F" />
          <circle cx={cx} cy={cy} r={r * 0.5} fill="#1A2510" />
          <ellipse cx={cx - r * 0.15} cy={cy - r * 0.15} rx={r * 0.18} ry={r * 0.1} fill="white" opacity={0.1} />
        </g>
      );
    },
  },
  "Artischocken": {
    layer: "under", pieces: 5,
    render: (cx, cy, k, i) => {
      const rot = srand(cx, cy, i + 1) * 360;
      const s = 0.8 + srand(cx, cy, i) * 0.35;
      return (
        <g key={k} transform={`translate(${cx},${cy}) rotate(${rot}) scale(${s})`}>
          <ellipse cx={0} cy={0} rx={9} ry={7} fill="#7A9E40" opacity={0.78} />
          <ellipse cx={0} cy={-2} rx={5} ry={3} fill="#90B850" opacity={0.5} />
        </g>
      );
    },
  },
  "Spinat": {
    layer: "under", pieces: 6,
    render: (cx, cy, k, i) => {
      const rot = srand(cx, cy, i + 1) * 360;
      const s = 0.8 + srand(cx, cy, i) * 0.35;
      return (
        <g key={k} transform={`translate(${cx},${cy}) rotate(${rot}) scale(${s})`}>
          <ellipse cx={0} cy={-2} rx={9} ry={5} fill="#2D6B2D" opacity={0.82} />
          <ellipse cx={0} cy={2} rx={7} ry={3.5} fill="#358535" opacity={0.7} />
          <line x1={0} y1={-6} x2={0} y2={5} stroke="#1D4B1D" strokeWidth={0.5} opacity={0.35} />
        </g>
      );
    },
  },
  "Rucola": {
    layer: "over", pieces: 7,
    render: (cx, cy, k, i) => {
      const rot = srand(cx, cy, i + 1) * 360;
      return (
        <g key={k} transform={`translate(${cx},${cy}) rotate(${rot})`}>
          <ellipse cx={-5} cy={-1} rx={7} ry={3} fill="#4A8E4A" opacity={0.88} transform="rotate(-25)" />
          <ellipse cx={5} cy={-1} rx={7} ry={3} fill="#55A055" opacity={0.85} transform="rotate(25)" />
          <ellipse cx={0} cy={3} rx={5.5} ry={2.5} fill="#3D7D3D" opacity={0.78} />
        </g>
      );
    },
  },
  "Mais": {
    layer: "under", pieces: 14,
    render: (cx, cy, k, i) => {
      const r = 2.5 + srand(cx, cy, i) * 1.5;
      return <ellipse key={k} cx={cx} cy={cy} rx={r} ry={r * 1.3} fill="#FFD700" opacity={0.88} />;
    },
  },
  "Ananas": {
    layer: "under", pieces: 6,
    render: (cx, cy, k, i) => {
      const r = 8 + srand(cx, cy, i) * 3;
      const rot = srand(cx, cy, i + 1) * 360;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.65} fill="#F5D020" opacity={0.82} />
          <ellipse cx={cx} cy={cy} rx={r * 0.5} ry={r * 0.3} fill="#E8C000" opacity={0.35} />
        </g>
      );
    },
  },
  "Tomaten frisch": {
    layer: "over", pieces: 6,
    render: (cx, cy, k, i) => {
      const r = 8 + srand(cx, cy, i) * 3;
      return (
        <g key={k}>
          <circle cx={cx} cy={cy} r={r} fill="#E03020" opacity={0.85} />
          <circle cx={cx} cy={cy} r={r * 0.5} fill="#E84040" opacity={0.35} />
          <line x1={cx - r * 0.3} y1={cy} x2={cx + r * 0.3} y2={cy} stroke="#C02010" strokeWidth={0.7} opacity={0.25} />
          <line x1={cx} y1={cy - r * 0.3} x2={cx} y2={cy + r * 0.3} stroke="#C02010" strokeWidth={0.7} opacity={0.25} />
          <ellipse cx={cx - r * 0.2} cy={cy - r * 0.2} rx={r * 0.18} ry={r * 0.1} fill="white" opacity={0.12} />
        </g>
      );
    },
  },
  "Kirschtomaten": {
    layer: "over", pieces: 7,
    render: (cx, cy, k, i) => {
      const r = 6 + srand(cx, cy, i) * 2;
      return (
        <g key={k}>
          <circle cx={cx} cy={cy} r={r} fill="#CC2200" opacity={0.88} />
          <ellipse cx={cx - r * 0.2} cy={cy - r * 0.2} rx={r * 0.22} ry={r * 0.12} fill="white" opacity={0.18} />
          <circle cx={cx} cy={cy - r + 1} r={1.2} fill="#2D6A2D" opacity={0.6} />
        </g>
      );
    },
  },
  "Broccoli": {
    layer: "under", pieces: 5,
    render: (cx, cy, k, i) => {
      const s = 0.65 + srand(cx, cy, i) * 0.35;
      const rot = srand(cx, cy, i + 1) * 360;
      return (
        <g key={k} transform={`translate(${cx},${cy}) scale(${s}) rotate(${rot})`}>
          <circle cx={-4} cy={-2} r={5} fill="#2E8B2E" opacity={0.82} />
          <circle cx={4} cy={-2} r={5} fill="#348B34" opacity={0.82} />
          <circle cx={0} cy={3} r={5} fill="#288B28" opacity={0.82} />
          <rect x={-1.2} y={5} width={2.5} height={4} rx={1.2} fill="#8B7355" opacity={0.6} />
        </g>
      );
    },
  },
  "Kapern": {
    layer: "under", pieces: 12,
    render: (cx, cy, k, i) => {
      const r = 2.5 + srand(cx, cy, i) * 1.2;
      return <circle key={k} cx={cx} cy={cy} r={r} fill="#5B7A3A" opacity={0.88} />;
    },
  },
  "Gorgonzola": {
    layer: "under", pieces: 5,
    render: (cx, cy, k, i) => {
      const rx = 10 + srand(cx, cy, i) * 4;
      const ry = 6 + srand(cx, cy, i + 2) * 3;
      const rot = srand(cx, cy, i + 1) * 180;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#F0EDD8" opacity={0.82} />
          <circle cx={cx - rx * 0.2} cy={cy - ry * 0.15} r={rx * 0.12} fill="#6080B0" opacity={0.3} />
          <circle cx={cx + rx * 0.18} cy={cy + ry * 0.12} r={rx * 0.09} fill="#5070A0" opacity={0.25} />
        </g>
      );
    },
  },
  "Mozzarella extra": {
    layer: "under", pieces: 5,
    render: (cx, cy, k, i) => {
      const rx = 12 + srand(cx, cy, i) * 5;
      const ry = 8 + srand(cx, cy, i + 2) * 4;
      const rot = srand(cx, cy, i + 1) * 180;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFF8E1" opacity={0.82} />
          <ellipse cx={cx} cy={cy} rx={rx * 0.5} ry={ry * 0.4} fill="#FFFEF5" opacity={0.45} />
        </g>
      );
    },
  },
  "Frischkäse": {
    layer: "over", pieces: 5,
    render: (cx, cy, k, i) => {
      const rx = 10 + srand(cx, cy, i) * 4;
      const ry = 7 + srand(cx, cy, i + 2) * 3;
      const rot = srand(cx, cy, i + 1) * 180;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFF0" opacity={0.8} />
          <ellipse cx={cx} cy={cy} rx={rx * 0.45} ry={ry * 0.35} fill="white" opacity={0.3} />
        </g>
      );
    },
  },
  "Ei": {
    layer: "over", pieces: 2,
    render: (cx, cy, k) => (
      <g key={k}>
        <ellipse cx={cx} cy={cy} rx={16} ry={13} fill="#FFF8E8" opacity={0.88} />
        <circle cx={cx} cy={cy} r={5.5} fill="#F0A500" opacity={0.9} />
        <circle cx={cx} cy={cy} r={3} fill="#FFB800" opacity={0.6} />
        <ellipse cx={cx - 1.5} cy={cy - 1.2} rx={1.2} ry={0.8} fill="white" opacity={0.25} />
      </g>
    ),
  },
  "Parmesan/Grana": {
    layer: "over", pieces: 8,
    render: (cx, cy, k, i) => {
      const rx = 6 + srand(cx, cy, i) * 4;
      const ry = 3 + srand(cx, cy, i + 2) * 2.5;
      const rot = srand(cx, cy, i + 1) * 180;
      return (
        <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFF8D0" opacity={0.72} />
        </g>
      );
    },
  },
};

// ─── Positionen (zentriert auf Pizza-Mitte 200,215) ──────────────

const CX = 200, CY = 215;

const POSITIONS: [number, number][] = [
  [CX, CY - 70],      [CX + 50, CY - 50], [CX + 70, CY],      [CX + 50, CY + 50],
  [CX, CY + 70],      [CX - 50, CY + 50], [CX - 70, CY],      [CX - 50, CY - 50],
  [CX, CY - 42],      [CX + 36, CY - 20], [CX + 36, CY + 20],
  [CX, CY + 42],      [CX - 36, CY + 20], [CX - 36, CY - 20],
  [CX + 20, CY - 10], [CX + 20, CY + 10], [CX - 20, CY + 10], [CX - 20, CY - 10],
  [CX, CY],           [CX + 55, CY - 20],
];

const LEFT_POS: [number, number][] = [
  [CX - 18, CY - 65], [CX - 52, CY - 35], [CX - 65, CY],     [CX - 52, CY + 35], [CX - 18, CY + 65],
  [CX - 32, CY - 18], [CX - 38, CY + 18], [CX - 55, CY - 8], [CX - 22, CY],      [CX - 14, CY + 38],
];

const RIGHT_POS: [number, number][] = [
  [CX + 18, CY - 65], [CX + 52, CY - 35], [CX + 65, CY],     [CX + 52, CY + 35], [CX + 18, CY + 65],
  [CX + 32, CY - 18], [CX + 38, CY + 18], [CX + 55, CY - 8], [CX + 22, CY],      [CX + 14, CY + 38],
];

// ─── Käse-Overlay (SVG, halbtransparent) ─────────────────────────

function CheeseOverlay({ isVegan }: { isVegan: boolean }) {
  const c1 = isVegan ? "#F5E6B8" : "#FFF5D0";
  const c2 = isVegan ? "#E8D8A0" : "#FFFBE8";
  const blobs = [
    { cx: 200, cy: 185, rx: 52, ry: 30, rot: 10 },
    { cx: 165, cy: 218, rx: 42, ry: 26, rot: -15 },
    { cx: 238, cy: 212, rx: 48, ry: 28, rot: 20 },
    { cx: 195, cy: 248, rx: 44, ry: 24, rot: -5 },
    { cx: 220, cy: 178, rx: 38, ry: 23, rot: 35 },
    { cx: 175, cy: 170, rx: 32, ry: 20, rot: -25 },
    { cx: 248, cy: 242, rx: 35, ry: 22, rot: 15 },
    { cx: 150, cy: 198, rx: 30, ry: 20, rot: -10 },
    { cx: 252, cy: 192, rx: 32, ry: 18, rot: 30 },
    { cx: 200, cy: 218, rx: 56, ry: 32, rot: 0 },
    { cx: 158, cy: 248, rx: 28, ry: 18, rot: -20 },
    { cx: 242, cy: 168, rx: 28, ry: 16, rot: 25 },
  ];
  return (
    <g opacity={0.5}>
      {blobs.map((b, i) => (
        <g key={i}>
          <ellipse cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={c1}
            transform={`rotate(${b.rot} ${b.cx} ${b.cy})`} />
          <ellipse cx={b.cx + b.rx * 0.08} cy={b.cy - b.ry * 0.12} rx={b.rx * 0.45} ry={b.ry * 0.35}
            fill={c2} opacity={0.35} transform={`rotate(${b.rot} ${b.cx} ${b.cy})`} />
        </g>
      ))}
    </g>
  );
}

// ─── Topping-Builder ─────────────────────────────────────────────

function buildToppings(
  extras: { id: string; name: string }[],
  positions: [number, number][]
): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  extras.forEach((extra, ei) => {
    const def = T[extra.name];
    if (!def) return;
    const count = Math.min(def.pieces, positions.length);
    for (let i = 0; i < count; i++) {
      const pi = (ei * 3 + i * Math.floor(positions.length / count)) % positions.length;
      const [px, py] = positions[pi];
      const ox = (srand(px, py, i + ei * 7) - 0.5) * 8;
      const oy = (srand(py, px, i + ei * 7) - 0.5) * 8;
      elements.push(def.render(px + ox, py + oy, `${extra.id}-${i}`, i));
    }
  });
  return elements;
}

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

// ─── Hauptkomponente ─────────────────────────────────────────────

export default function PizzaVisual({ sauce, cheese, selectedExtras, size, halfHalf }: Props) {
  const isFamily = size.toLowerCase().includes("famili");
  const hasCheese = cheese !== "Ohne Käse";
  const isVegan = cheese.toLowerCase().includes("vegan");

  // Immer das Sauce-Basis-Bild (NICHT das Käse-Bild)
  const sauceMap = isFamily ? FAMILY_SAUCE_IMAGES : SAUCE_IMAGES;
  const baseImage = sauceMap[sauce] ?? sauceMap["Tomatensauce"];

  const cmMatch = size.match(/(\d+)\s*cm/i);
  const cm = cmMatch ? parseInt(cmMatch[1]) : 30;
  const maxPct = isFamily ? 100 : Math.round(45 + ((cm - 30) / 20) * 47);

  // Extras aufteilen nach under/over cheese
  const allExtras = halfHalf ? [] : selectedExtras;
  const underExtras = allExtras.filter(e => T[e.name]?.layer === "under");
  const overExtras = allExtras.filter(e => T[e.name]?.layer === "over");

  // Halb-Halb
  let leftUnder: React.ReactNode[] = [];
  let leftOver: React.ReactNode[] = [];
  let rightUnder: React.ReactNode[] = [];
  let rightOver: React.ReactNode[] = [];

  if (halfHalf) {
    const lu = halfHalf.left.filter(e => T[e.name]?.layer === "under");
    const lo = halfHalf.left.filter(e => T[e.name]?.layer === "over");
    const ru = halfHalf.right.filter(e => T[e.name]?.layer === "under");
    const ro = halfHalf.right.filter(e => T[e.name]?.layer === "over");
    leftUnder = buildToppings(lu, LEFT_POS);
    leftOver = buildToppings(lo, LEFT_POS);
    rightUnder = buildToppings(ru, RIGHT_POS);
    rightOver = buildToppings(ro, RIGHT_POS);
  }

  const underElements = halfHalf ? [] : buildToppings(underExtras, POSITIONS);
  const overElements = halfHalf ? [] : buildToppings(overExtras, POSITIONS);

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
        {/* LAYER 1: Sauce-Basis (immer gleich) */}
        <Image
          src={baseImage}
          alt={`Pizza mit ${sauce}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 384px"
          priority
        />

        {/* SVG Layer-Stack */}
        <svg
          viewBox="0 0 400 430"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <clipPath id="pc">
              <circle cx={CX} cy={CY} r={100} />
            </clipPath>
            <clipPath id="lh">
              <rect x="0" y="0" width={CX} height="430" />
            </clipPath>
            <clipPath id="rh">
              <rect x={CX} y="0" width={CX} height="430" />
            </clipPath>
          </defs>

          <g clipPath="url(#pc)">
            {/* LAYER 2: Under-Cheese Toppings */}
            {halfHalf ? (
              <>
                <g clipPath="url(#lh)">{leftUnder}</g>
                <g clipPath="url(#rh)">{rightUnder}</g>
              </>
            ) : (
              <g>{underElements}</g>
            )}

            {/* LAYER 3: Käse-Overlay */}
            {hasCheese && <CheeseOverlay isVegan={isVegan} />}

            {/* LAYER 4: Over-Cheese Toppings */}
            {halfHalf ? (
              <>
                <g clipPath="url(#lh)">{leftOver}</g>
                <g clipPath="url(#rh)">{rightOver}</g>
              </>
            ) : (
              <g>{overElements}</g>
            )}
          </g>

          {/* Halb-Halb Trennlinie */}
          {halfHalf && (
            <>
              <line x1={CX} y1={CY - 100} x2={CX} y2={CY + 100} stroke="white" strokeWidth="2.5"
                strokeDasharray="10,5" opacity="0.8" style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }} />
              <text x={CX - 50} y={CY + 110} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold"
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }}>½ Links</text>
              <text x={CX + 50} y={CY + 110} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold"
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }}>½ Rechts</text>
            </>
          )}
        </svg>
      </div>

      {isEmpty && (
        <p className="mt-3 text-dark/40 text-xs font-medium text-center">
          {halfHalf ? "Wähle Beläge für jede Hälfte!" : "Wähle Beläge und sieh sie hier erscheinen!"}
        </p>
      )}
    </div>
  );
}
