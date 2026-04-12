import { Extra } from "@/types";

type CatalogEntry = {
  id: string;
  name: string;
  p30: number;
  p35: number;
  p40: number;
  p45: number;
  p50: number;
  pFam: number;
};

export type SizeCategory = "30" | "35" | "40" | "45" | "50" | "family";

export function getSizeCategory(label: string): SizeCategory {
  if (label.toLowerCase().includes("famili")) return "family";
  const match = label.match(/(\d+)\s*cm/i);
  if (match) {
    const cm = match[1] as SizeCategory;
    if (["30", "35", "40", "45", "50"].includes(cm)) return cm;
  }
  return "30";
}

// Betreiber-Preisliste je Größe
export const EXTRAS_CATALOG: CatalogEntry[] = [
  //                                                   30    35    40    45    50    Fam
  { id: "ananas",            name: "Ananas",           p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 2.00, pFam: 2.50 },
  { id: "artischocken",      name: "Artischocken",     p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 2.00, pFam: 2.50 },
  { id: "auberginen",        name: "Auberginen",       p30: 1.00, p35: 1.30, p40: 1.50, p45: 1.80, p50: 2.00, pFam: 2.30 },
  { id: "basilikum-pesto",   name: "Basilikum-Pesto",  p30: 1.00, p35: 1.30, p40: 1.50, p45: 2.00, p50: 2.30, pFam: 2.50 },
  { id: "bohnen",            name: "Bohnen",           p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 2.00, pFam: 2.50 },
  { id: "broccoli",          name: "Broccoli",         p30: 1.00, p35: 1.30, p40: 1.50, p45: 1.80, p50: 2.00, pFam: 2.30 },
  { id: "bueffelmozzarella", name: "Büffelmozzarella", p30: 1.50, p35: 2.00, p40: 2.50, p45: 2.80, p50: 3.00, pFam: 3.50 },
  { id: "champignons",       name: "Champignons",      p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 1.80, pFam: 2.30 },
  { id: "ei-gekocht",        name: "Ei, gekocht",      p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 1.80, pFam: 2.00 },
  { id: "frischkaese",       name: "Frischkäse",       p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 1.80, pFam: 2.00 },
  { id: "garnelen",          name: "Garnelen",         p30: 2.00, p35: 2.30, p40: 2.50, p45: 2.80, p50: 3.00, pFam: 3.50 },
  { id: "gorgonzola",        name: "Gorgonzola",       p30: 1.50, p35: 1.80, p40: 2.00, p45: 2.30, p50: 2.50, pFam: 2.80 },
  { id: "hackfleisch",       name: "Hackfleisch",      p30: 1.50, p35: 1.80, p40: 2.00, p45: 2.30, p50: 2.50, pFam: 3.00 },
  { id: "hinterschinken",    name: "Hinterschinken",   p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 2.00, pFam: 2.50 },
  { id: "kapern",            name: "Kapern",           p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 2.00, pFam: 2.50 },
  { id: "kaese-vegan",       name: "Käse, vegan",      p30: 1.00, p35: 1.50, p40: 2.00, p45: 2.50, p50: 2.80, pFam: 3.00 },
  { id: "kirschtomaten",     name: "Kirschtomaten",    p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 1.80, pFam: 2.00 },
  { id: "knoblauch",         name: "Knoblauch",        p30: 0.50, p35: 0.70, p40: 1.30, p45: 1.30, p50: 1.50, pFam: 1.80 },
  { id: "lachs",             name: "Lachs",            p30: 2.00, p35: 2.30, p40: 2.50, p45: 2.80, p50: 3.00, pFam: 3.50 },
  { id: "mais",              name: "Mais",             p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 2.00, pFam: 2.50 },
  { id: "meeresfruechten",   name: "Meeresfrüchten",   p30: 2.00, p35: 2.30, p40: 2.50, p45: 2.80, p50: 3.00, pFam: 3.50 },
  { id: "mozzarella",        name: "Mozzarella",       p30: 1.00, p35: 1.50, p40: 2.00, p45: 2.00, p50: 2.80, pFam: 3.00 },
  { id: "oliven",            name: "Oliven",           p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 2.00, pFam: 2.50 },
  { id: "paprika",           name: "Paprika",          p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 1.80, pFam: 2.00 },
  { id: "parmaschinken",     name: "Parmaschinken",    p30: 2.00, p35: 2.30, p40: 2.50, p45: 2.80, p50: 3.00, pFam: 3.50 },
  { id: "parmesan",          name: "Parmesan",         p30: 1.00, p35: 1.30, p40: 1.50, p45: 1.80, p50: 2.00, pFam: 2.30 },
  { id: "peperoni-mild",     name: "Peperoni, mild",   p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 1.80, pFam: 2.00 },
  { id: "peperoni-scharf",   name: "Peperoni, scharf", p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 1.80, pFam: 2.00 },
  { id: "rucola",            name: "Rucola",           p30: 0.50, p35: 1.50, p40: 1.80, p45: 2.00, p50: 2.30, pFam: 2.50 },
  { id: "salami",            name: "Salami",           p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 2.00, pFam: 2.50 },
  { id: "salami-scharf",     name: "Salami, scharf",   p30: 1.50, p35: 2.00, p40: 2.30, p45: 2.50, p50: 2.80, pFam: 3.50 },
  { id: "sardellen",         name: "Sardellen",        p30: 1.50, p35: 2.00, p40: 2.30, p45: 2.50, p50: 2.80, pFam: 3.30 },
  { id: "schafskaese",       name: "Schafskäse",       p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 1.80, pFam: 2.30 },
  { id: "speck",             name: "Speck",            p30: 1.50, p35: 2.00, p40: 2.30, p45: 2.50, p50: 3.00, pFam: 3.50 },
  { id: "spiegelei",         name: "Spiegelei",        p30: 0.50, p35: 1.00, p40: 1.30, p45: 1.50, p50: 1.80, pFam: 2.00 },
  { id: "spinat",            name: "Spinat",           p30: 1.00, p35: 1.30, p40: 1.30, p45: 2.30, p50: 2.80, pFam: 3.30 },
  { id: "steinpilzen",       name: "Steinpilzen",      p30: 1.50, p35: 2.00, p40: 2.30, p45: 2.50, p50: 3.00, pFam: 3.50 },
  { id: "thunfisch",         name: "Thunfisch",        p30: 1.50, p35: 2.00, p40: 2.30, p45: 2.50, p50: 2.80, pFam: 3.30 },
  { id: "trueffel-pesto",    name: "Trüffel-Pesto",    p30: 2.00, p35: 2.30, p40: 2.50, p45: 2.80, p50: 3.00, pFam: 3.50 },
  { id: "walnuessen",        name: "Walnüssen",        p30: 1.00, p35: 1.50, p40: 1.80, p45: 2.00, p50: 2.30, pFam: 2.50 },
  { id: "zucchini",          name: "Zucchini",         p30: 1.00, p35: 1.30, p40: 1.50, p45: 1.80, p50: 2.00, pFam: 2.30 },
  { id: "zwiebeln",          name: "Zwiebeln",         p30: 0.50, p35: 0.80, p40: 1.30, p45: 1.50, p50: 1.80, pFam: 2.30 },
];

function priceOf(entry: CatalogEntry, cat: SizeCategory): number {
  const map: Record<SizeCategory, number> = {
    "30": entry.p30, "35": entry.p35, "40": entry.p40,
    "45": entry.p45, "50": entry.p50, "family": entry.pFam,
  };
  return map[cat];
}

export function buildExtras(cat: SizeCategory): Extra[] {
  return EXTRAS_CATALOG.map((e, i) => ({
    id: e.id,
    name: e.name,
    price: priceOf(e, cat),
    is_available: true,
    sort_order: i + 1,
  }));
}

export function priceForExtraId(id: string, cat: SizeCategory): number {
  const entry = EXTRAS_CATALOG.find((e) => e.id === id);
  if (!entry) return 0;
  return priceOf(entry, cat);
}

type DbCatalogRow = Record<string, unknown>;

function dbPriceOf(row: DbCatalogRow, cat: SizeCategory): number {
  const map: Record<SizeCategory, string> = {
    "30": "p30", "35": "p35", "40": "p40", "45": "p45", "50": "p50", "family": "pFam",
  };
  return Number(row[map[cat]]) || 0;
}

export function buildExtrasFromDb(catalog: DbCatalogRow[], cat: SizeCategory): Extra[] {
  return catalog.map((e, i) => ({
    id: String(e.id),
    name: String(e.name),
    price: dbPriceOf(e, cat),
    is_available: true,
    sort_order: i + 1,
  }));
}

export function priceForExtraIdFromDb(catalog: DbCatalogRow[], id: string, cat: SizeCategory): number {
  const entry = catalog.find((e) => String(e.id) === id);
  if (!entry) return 0;
  return dbPriceOf(entry, cat);
}
