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

// Alle 20 möglichen Positionen auf der Pizza (cx, cy in einem 400x400 Overlay)
const POSITIONS: [number, number][] = [
  [200, 105], [278, 132], [318, 202], [282, 272],
  [208, 308], [128, 278], [86, 205],  [122, 132],
  [200, 162], [252, 178], [260, 240], [200, 258],
  [148, 240], [144, 178], [200, 210], [232, 148],
  [168, 148], [268, 212], [132, 212], [228, 262],
];

// Halb-Halb Positionen für runde Pizza (gespiegelt um x=200)
const LEFT_POSITIONS: [number, number][] = [
  [155, 100], [118, 142], [88, 200], [118, 258], [155, 300],
  [138, 168], [162, 232], [104, 172], [104, 228], [155, 200],
];
const RIGHT_POSITIONS: [number, number][] = [
  [245, 100], [282, 142], [312, 200], [282, 258], [245, 300],
  [262, 168], [238, 232], [296, 172], [296, 228], [245, 200],
];

// Topping-Positionen für Familienpizza (verteilt über 600x400 ViewBox)
const FAMILY_POSITIONS: [number, number][] = [
  [100, 100], [200, 80],  [300, 100], [400, 80],  [500, 100],
  [80,  200], [180, 180], [300, 200], [420, 180], [520, 200],
  [100, 300], [200, 320], [300, 300], [400, 320], [500, 300],
  [150, 150], [300, 280], [450, 150], [150, 250], [450, 250],
];

// Halb-Halb Positionen für Familienpizza (Mitte bei x=300)
const FAMILY_LEFT_POSITIONS: [number, number][] = [
  [80, 80],  [140, 120], [210, 200], [140, 280], [80, 320],
  [100, 160], [180, 240], [60, 200], [210, 120], [130, 200],
];
const FAMILY_RIGHT_POSITIONS: [number, number][] = [
  [520, 80],  [460, 120], [390, 200], [460, 280], [520, 320],
  [500, 160], [420, 240], [540, 200], [390, 120], [470, 200],
];

// Zutaten → visuelle Darstellung (SVG-Elemente als Overlay)
const TOPPING_VISUALS: Record<string, {
  pieces: number;
  render: (cx: number, cy: number, key: string) => React.ReactNode;
}> = {
  "Salami": {
    pieces: 7,
    render: (cx, cy, key) => (
      <g key={key}>
        <circle cx={cx} cy={cy} r={13} fill="#8B1A1A" />
        <circle cx={cx} cy={cy} r={8} fill="#A52A2A" />
        <circle cx={cx - 4} cy={cy - 3} r={2} fill="#6B0000" />
        <circle cx={cx + 3} cy={cy + 2} r={1.5} fill="#6B0000" />
      </g>
    ),
  },
  "Mozzarella extra": {
    pieces: 6,
    render: (cx, cy, key) => (
      <ellipse key={key} cx={cx} cy={cy} rx={14} ry={10} fill="#FFFDE7" opacity={0.9}
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }} />
    ),
  },
  "Hinterschinken": {
    pieces: 5,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy} rx={15} ry={9} fill="#DEB887" transform={`rotate(30 ${cx} ${cy})`} />
        <ellipse cx={cx} cy={cy} rx={10} ry={6} fill="#CD853F" opacity={0.5} transform={`rotate(30 ${cx} ${cy})`} />
      </g>
    ),
  },
  "Parmaschinken": {
    pieces: 4,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy} rx={16} ry={8} fill="#C9956B" transform={`rotate(-20 ${cx} ${cy})`} />
        <ellipse cx={cx} cy={cy} rx={10} ry={5} fill="#A0522D" opacity={0.4} transform={`rotate(-20 ${cx} ${cy})`} />
      </g>
    ),
  },
  "Champignons": {
    pieces: 8,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy - 3} rx={11} ry={7} fill="#A0896A" />
        <rect x={cx - 3} y={cy} width={6} height={7} rx={2} fill="#B8977A" />
        <ellipse cx={cx} cy={cy - 3} rx={7} ry={4} fill="#BDA98A" opacity={0.6} />
      </g>
    ),
  },
  "Oliven": {
    pieces: 9,
    render: (cx, cy, key) => (
      <g key={key}>
        <circle cx={cx} cy={cy} r={9} fill="#2F4F2F" />
        <circle cx={cx} cy={cy} r={4} fill="#1A1A1A" />
        <circle cx={cx} cy={cy} r={2} fill="#C8A850" />
      </g>
    ),
  },
  "Peperoni": {
    pieces: 10,
    render: (cx, cy, key) => (
      <ellipse key={key} cx={cx} cy={cy} rx={14} ry={5} fill="#FF4500"
        transform={`rotate(${(cx * cy) % 180} ${cx} ${cy})`}
        style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }} />
    ),
  },
  "Paprika": {
    pieces: 6,
    render: (cx, cy, key) => (
      <g key={key}>
        <rect x={cx - 8} y={cy - 4} width={16} height={8} rx={3}
          fill={["#FF6347", "#FFD700", "#32CD32"][(Math.round(cx + cy)) % 3]}
          transform={`rotate(${(Math.round(cx)) % 60 - 30} ${cx} ${cy})`} />
      </g>
    ),
  },
  "Zwiebeln": {
    pieces: 8,
    render: (cx, cy, key) => (
      <g key={key}>
        <circle cx={cx} cy={cy} r={9} fill="none" stroke="#DEB887" strokeWidth={3} opacity={0.7} />
        <circle cx={cx} cy={cy} r={4} fill="none" stroke="#DEB887" strokeWidth={2} opacity={0.5} />
      </g>
    ),
  },
  "Spinat": {
    pieces: 6,
    render: (cx, cy, key) => (
      <ellipse key={key} cx={cx} cy={cy} rx={12} ry={7} fill="#2D6A2D" opacity={0.85}
        transform={`rotate(${(Math.round(cx)) % 40} ${cx} ${cy})`} />
    ),
  },
  "Rucola": {
    pieces: 8,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx - 6} cy={cy} rx={7} ry={4} fill="#3A7D3A" opacity={0.9}
          transform={`rotate(-20 ${cx} ${cy})`} />
        <ellipse cx={cx + 6} cy={cy} rx={7} ry={4} fill="#4A8D4A" opacity={0.9}
          transform={`rotate(20 ${cx} ${cy})`} />
      </g>
    ),
  },
  "Thunfisch": {
    pieces: 5,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy} rx={13} ry={8} fill="#F5DEB3" opacity={0.9}
          transform={`rotate(${(Math.round(cx)) % 45} ${cx} ${cy})`} />
        <ellipse cx={cx} cy={cy} rx={8} ry={5} fill="#E8C99A" opacity={0.6}
          transform={`rotate(${(Math.round(cx)) % 45} ${cx} ${cy})`} />
      </g>
    ),
  },
  "Sardellen": {
    pieces: 6,
    render: (cx, cy, key) => (
      <ellipse key={key} cx={cx} cy={cy} rx={16} ry={4} fill="#4A3728" opacity={0.9}
        transform={`rotate(${(Math.round(cx * 0.7)) % 60 - 30} ${cx} ${cy})`} />
    ),
  },
  "Lachs": {
    pieces: 4,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy} rx={15} ry={9} fill="#FA8072" opacity={0.85}
          transform={`rotate(${(Math.round(cy)) % 30} ${cx} ${cy})`} />
        <ellipse cx={cx} cy={cy} rx={9} ry={5} fill="#FF9A8A" opacity={0.5}
          transform={`rotate(${(Math.round(cy)) % 30} ${cx} ${cy})`} />
      </g>
    ),
  },
  "Mais": {
    pieces: 12,
    render: (cx, cy, key) => (
      <ellipse key={key} cx={cx} cy={cy} rx={5} ry={7} fill="#FFD700" opacity={0.9} />
    ),
  },
  "Ananas": {
    pieces: 6,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy} rx={12} ry={8} fill="#FFE135" opacity={0.9} />
        <ellipse cx={cx} cy={cy} rx={7} ry={4} fill="#FFC200" opacity={0.5} />
      </g>
    ),
  },
  "Gorgonzola": {
    pieces: 5,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy} rx={13} ry={9} fill="#F5F5DC" opacity={0.85} />
        <circle cx={cx - 3} cy={cy - 2} r={3} fill="#4169E1" opacity={0.3} />
        <circle cx={cx + 4} cy={cy + 2} r={2} fill="#4169E1" opacity={0.3} />
      </g>
    ),
  },
  "Frischkäse": {
    pieces: 5,
    render: (cx, cy, key) => (
      <ellipse key={key} cx={cx} cy={cy} rx={14} ry={10} fill="#FFFFF0" opacity={0.85}
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }} />
    ),
  },
  "Speck": {
    pieces: 5,
    render: (cx, cy, key) => (
      <g key={key}>
        <rect x={cx - 10} y={cy - 5} width={20} height={10} rx={3} fill="#C0392B"
          transform={`rotate(${(Math.round(cx)) % 50 - 25} ${cx} ${cy})`} />
        <rect x={cx - 10} y={cy - 2} width={20} height={4} rx={1} fill="#F5CBA7" opacity={0.5}
          transform={`rotate(${(Math.round(cx)) % 50 - 25} ${cx} ${cy})`} />
      </g>
    ),
  },
  "Hackfleisch": {
    pieces: 8,
    render: (cx, cy, key) => (
      <circle key={key} cx={cx} cy={cy} r={8} fill="#8B4513" opacity={0.85} />
    ),
  },
  "Artischocken": {
    pieces: 5,
    render: (cx, cy, key) => (
      <g key={key}>
        <circle cx={cx} cy={cy} r={10} fill="#6B8E23" opacity={0.8} />
        <circle cx={cx} cy={cy} r={6} fill="#8FBC45" opacity={0.7} />
        <circle cx={cx} cy={cy} r={3} fill="#FFFACD" opacity={0.8} />
      </g>
    ),
  },
  "Tomaten frisch": {
    pieces: 6,
    render: (cx, cy, key) => (
      <g key={key}>
        <circle cx={cx} cy={cy} r={11} fill="#FF3333" opacity={0.85} />
        <circle cx={cx} cy={cy} r={7} fill="#FF6666" opacity={0.5} />
        <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke="#CC0000" strokeWidth={1} opacity={0.4} />
        <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} stroke="#CC0000" strokeWidth={1} opacity={0.4} />
      </g>
    ),
  },
  "Kirschtomaten": {
    pieces: 7,
    render: (cx, cy, key) => (
      <g key={key}>
        <circle cx={cx} cy={cy} r={9} fill="#CC2200" opacity={0.9} />
        <circle cx={cx - 2} cy={cy - 2} r={3} fill="#FF4444" opacity={0.5} />
        <line x1={cx} y1={cy - 9} x2={cx + 2} y2={cy - 14} stroke="#2D6A2D" strokeWidth={2} />
      </g>
    ),
  },
  "Knoblauch": {
    pieces: 6,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy} rx={8} ry={6} fill="#FFFDD0" opacity={0.9} />
        <ellipse cx={cx} cy={cy} rx={4} ry={3} fill="#F5F0C0" opacity={0.6} />
      </g>
    ),
  },
  "Ei": {
    pieces: 3,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy} rx={20} ry={15} fill="#FFFEF0" opacity={0.85} />
        <circle cx={cx} cy={cy} r={7} fill="#FFB300" opacity={0.9} />
      </g>
    ),
  },
  "Broccoli": {
    pieces: 5,
    render: (cx, cy, key) => (
      <g key={key}>
        <circle cx={cx - 5} cy={cy - 3} r={7} fill="#228B22" opacity={0.85} />
        <circle cx={cx + 5} cy={cy - 3} r={7} fill="#2E8B22" opacity={0.85} />
        <circle cx={cx} cy={cy + 3} r={7} fill="#1E7B1E" opacity={0.85} />
        <rect x={cx - 2} y={cy + 7} width={4} height={7} rx={2} fill="#8B7355" />
      </g>
    ),
  },
  "Kapern": {
    pieces: 12,
    render: (cx, cy, key) => (
      <circle key={key} cx={cx} cy={cy} r={4} fill="#5B7A3A" opacity={0.9} />
    ),
  },
  "Steinpilze": {
    pieces: 4,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy - 4} rx={13} ry={8} fill="#7B5B3A" opacity={0.9} />
        <rect x={cx - 3} y={cy} width={6} height={8} rx={2} fill="#8B6B4A" />
        <ellipse cx={cx} cy={cy - 4} rx={8} ry={4} fill="#9B7B5A" opacity={0.5} />
      </g>
    ),
  },
  "Sucuk": {
    pieces: 6,
    render: (cx, cy, key) => (
      <g key={key}>
        <circle cx={cx} cy={cy} r={12} fill="#5C1A1A" />
        <circle cx={cx} cy={cy} r={8} fill="#7B2A2A" />
        <circle cx={cx - 3} cy={cy - 3} r={2} fill="#4A0000" />
        <circle cx={cx + 3} cy={cy + 3} r={1.5} fill="#4A0000" />
      </g>
    ),
  },
  "Parmesan/Grana": {
    pieces: 7,
    render: (cx, cy, key) => (
      <g key={key}>
        <ellipse cx={cx} cy={cy} rx={10} ry={6} fill="#FFFACD" opacity={0.8}
          transform={`rotate(${(Math.round(cx)) % 40 - 20} ${cx} ${cy})`} />
      </g>
    ),
  },
};

const DEFAULT_VISUAL = {
  pieces: 5,
  render: (cx: number, cy: number, key: string) => (
    <circle key={key} cx={cx} cy={cy} r={8} fill="#D2691E" opacity={0.8} />
  ),
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

export default function PizzaVisual({ sauce, selectedExtras, size, halfHalf }: Props) {
  const isFamily = size.toLowerCase().includes("famili");
  const imageMap = isFamily ? FAMILY_SAUCE_IMAGES : SAUCE_IMAGES;
  const baseImage = imageMap[sauce] ?? imageMap["Tomatensauce"];

  // Durchmesser aus Label parsen (z.B. "Ø 30 cm" → 30)
  const cmMatch = size.match(/(\d+)\s*cm/i);
  const cm = cmMatch ? parseInt(cmMatch[1]) : 30;

  // Proportionale Breite: 30cm→45%, 35cm→57%, 40cm→69%, 45cm→80%, 50cm→92%, Familie→100%
  const maxPct = isFamily ? 100 : Math.round(45 + ((cm - 30) / 20) * 47);

  // Toppings aufbauen
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
        elements.push(visual.render(cx, cy, `${extra.id}-${i}`));
      }
    });
    return elements;
  };

  let toppingElements: React.ReactNode[] = [];
  let leftToppingElements: React.ReactNode[] = [];
  let rightToppingElements: React.ReactNode[] = [];

  if (halfHalf) {
    leftToppingElements  = buildToppings(halfHalf.left,  isFamily ? FAMILY_LEFT_POSITIONS  : LEFT_POSITIONS);
    rightToppingElements = buildToppings(halfHalf.right, isFamily ? FAMILY_RIGHT_POSITIONS : RIGHT_POSITIONS);
  } else {
    toppingElements = buildToppings(selectedExtras, isFamily ? FAMILY_POSITIONS : POSITIONS);
  }

  const isEmpty = halfHalf
    ? halfHalf.left.length === 0 && halfHalf.right.length === 0
    : selectedExtras.length === 0;

  return (
    <div className="relative flex items-center justify-center">
      {/* Größen-Label */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-7 bg-dark text-white text-xs font-bold px-3 py-1 rounded-full z-10">
        {size}
      </div>

      {/* Pizza-Container */}
      <div
        className={`relative transition-all duration-500 ${isFamily ? "aspect-video" : "aspect-square"}`}
        style={{ width: `${maxPct}%`, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.30))" }}
      >

        {/* Echtes Pizza-Basisbild */}
        <Image
          src={baseImage}
          alt={`Pizza mit ${sauce}`}
          fill
          className="object-contain transition-all duration-500"
          sizes="(max-width: 768px) 100vw, 384px"
          priority
        />

        {/* SVG Toppings-Overlay */}
        <svg
          viewBox={isFamily ? "0 0 600 400" : "0 0 400 400"}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: "none" }}
        >
          <defs>
            {isFamily ? (
              <>
                <clipPath id="leftHalfClip">
                  <rect x="0" y="0" width="300" height="400" />
                </clipPath>
                <clipPath id="rightHalfClip">
                  <rect x="300" y="0" width="300" height="400" />
                </clipPath>
              </>
            ) : (
              <>
                <clipPath id="leftHalfClip">
                  <rect x="0" y="0" width="200" height="400" />
                </clipPath>
                <clipPath id="rightHalfClip">
                  <rect x="200" y="0" width="200" height="400" />
                </clipPath>
              </>
            )}
          </defs>

          {halfHalf ? (
            <>
              <g clipPath="url(#leftHalfClip)">{leftToppingElements}</g>
              <g clipPath="url(#rightHalfClip)">{rightToppingElements}</g>
              {/* Halb-Halb Trennlinie – Mitte je nach Form */}
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
            </>
          ) : (
            <g>{toppingElements}</g>
          )}
        </svg>
      </div>

      {/* Leere Pizza Hinweis – unterhalb des Bildes */}
      {isEmpty && (
        <p className="mt-3 text-dark/40 text-xs font-medium text-center">
          {halfHalf ? "Wähle Beläge für jede Hälfte!" : "Wähle Beläge und sieh sie hier erscheinen!"}
        </p>
      )}
    </div>
  );
}
