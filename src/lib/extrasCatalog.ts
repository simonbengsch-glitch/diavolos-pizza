import { Extra } from "@/types";

type CatalogEntry = {
  id: string;
  name: string;
  price30: number;
  priceRegular: number;
  priceFamily: number;
};

export type SizeCategory = "30" | "regular" | "family";

export function getSizeCategory(label: string): SizeCategory {
  if (label.toLowerCase().includes("famili")) return "family";
  const match = label.match(/(\d+)\s*cm/i);
  if (match && match[1] === "30") return "30";
  return "regular";
}

// Betreiber-Preisliste:
// price30     = ø 30 cm
// priceRegular = ø 35–50 cm
// priceFamily  = Familienpizza 40/60 cm
export const EXTRAS_CATALOG: CatalogEntry[] = [
  { id: "ananas",            name: "Ananas",           price30: 0.50, priceRegular: 1.50, priceFamily: 2.50 },
  { id: "artischocken",      name: "Artischocken",     price30: 0.50, priceRegular: 1.50, priceFamily: 2.50 },
  { id: "auberginen",        name: "Auberginen",       price30: 1.00, priceRegular: 1.80, priceFamily: 2.30 },
  { id: "basilikum-pesto",   name: "Basilikum-Pesto",  price30: 1.00, priceRegular: 2.00, priceFamily: 2.50 },
  { id: "bohnen",            name: "Bohnen",           price30: 0.50, priceRegular: 1.50, priceFamily: 2.50 },
  { id: "broccoli",          name: "Broccoli",         price30: 1.00, priceRegular: 1.80, priceFamily: 2.30 },
  { id: "bueffelmozzarella", name: "Büffelmozzarella", price30: 1.50, priceRegular: 2.80, priceFamily: 3.50 },
  { id: "champignons",       name: "Champignons",      price30: 0.50, priceRegular: 1.50, priceFamily: 2.30 },
  { id: "ei-gekocht",        name: "Ei, gekocht",      price30: 0.50, priceRegular: 1.50, priceFamily: 2.00 },
  { id: "frischkaese",       name: "Frischkäse",       price30: 0.50, priceRegular: 1.50, priceFamily: 2.00 },
  { id: "garnelen",          name: "Garnelen",         price30: 2.00, priceRegular: 2.80, priceFamily: 3.50 },
  { id: "gorgonzola",        name: "Gorgonzola",       price30: 1.50, priceRegular: 2.30, priceFamily: 2.80 },
  { id: "hackfleisch",       name: "Hackfleisch",      price30: 1.50, priceRegular: 2.30, priceFamily: 3.00 },
  { id: "hinterschinken",    name: "Hinterschinken",   price30: 0.50, priceRegular: 1.50, priceFamily: 2.50 },
  { id: "kapern",            name: "Kapern",           price30: 0.50, priceRegular: 1.50, priceFamily: 2.50 },
  { id: "kaese-vegan",       name: "Käse, vegan",      price30: 1.00, priceRegular: 2.50, priceFamily: 3.00 },
  { id: "kirschtomaten",     name: "Kirschtomaten",    price30: 0.50, priceRegular: 1.50, priceFamily: 2.00 },
  { id: "knoblauch",         name: "Knoblauch",        price30: 0.50, priceRegular: 1.30, priceFamily: 1.80 },
  { id: "lachs",             name: "Lachs",            price30: 2.00, priceRegular: 2.80, priceFamily: 3.50 },
  { id: "mais",              name: "Mais",             price30: 0.50, priceRegular: 1.50, priceFamily: 2.50 },
  { id: "meeresfruechten",   name: "Meeresfrüchten",   price30: 2.00, priceRegular: 2.80, priceFamily: 3.50 },
  { id: "mozzarella",        name: "Mozzarella",       price30: 1.00, priceRegular: 2.00, priceFamily: 3.00 },
  { id: "oliven",            name: "Oliven",           price30: 0.50, priceRegular: 1.50, priceFamily: 2.50 },
  { id: "paprika",           name: "Paprika",          price30: 0.50, priceRegular: 1.50, priceFamily: 2.00 },
  { id: "parmaschinken",     name: "Parmaschinken",    price30: 2.00, priceRegular: 2.80, priceFamily: 3.50 },
  { id: "parmesan",          name: "Parmesan",         price30: 1.00, priceRegular: 1.80, priceFamily: 2.30 },
  { id: "peperoni-mild",     name: "Peperoni, mild",   price30: 0.50, priceRegular: 1.50, priceFamily: 2.00 },
  { id: "peperoni-scharf",   name: "Peperoni, scharf", price30: 0.50, priceRegular: 1.50, priceFamily: 2.00 },
  { id: "rucola",            name: "Rucola",           price30: 0.50, priceRegular: 2.00, priceFamily: 2.50 },
  { id: "salami",            name: "Salami",           price30: 0.50, priceRegular: 1.50, priceFamily: 2.50 },
  { id: "salami-scharf",     name: "Salami, scharf",   price30: 1.50, priceRegular: 2.50, priceFamily: 3.50 },
  { id: "sardellen",         name: "Sardellen",        price30: 1.50, priceRegular: 2.50, priceFamily: 3.30 },
  { id: "schafskaese",       name: "Schafskäse",       price30: 0.50, priceRegular: 1.50, priceFamily: 2.30 },
  { id: "speck",             name: "Speck",            price30: 1.50, priceRegular: 2.50, priceFamily: 3.50 },
  { id: "spiegelei",         name: "Spiegelei",        price30: 0.50, priceRegular: 1.50, priceFamily: 2.00 },
  { id: "spinat",            name: "Spinat",           price30: 1.00, priceRegular: 2.30, priceFamily: 3.30 },
  { id: "steinpilzen",       name: "Steinpilzen",      price30: 1.50, priceRegular: 2.50, priceFamily: 3.50 },
  { id: "thunfisch",         name: "Thunfisch",        price30: 1.50, priceRegular: 2.50, priceFamily: 3.30 },
  { id: "trueffel-pesto",    name: "Trüffel-Pesto",    price30: 2.00, priceRegular: 2.80, priceFamily: 3.50 },
  { id: "walnuessen",        name: "Walnüssen",        price30: 1.00, priceRegular: 2.00, priceFamily: 2.50 },
  { id: "zucchini",          name: "Zucchini",         price30: 1.00, priceRegular: 1.80, priceFamily: 2.30 },
  { id: "zwiebeln",          name: "Zwiebeln",         price30: 0.50, priceRegular: 1.50, priceFamily: 2.30 },
];

function priceOf(entry: CatalogEntry, cat: SizeCategory): number {
  if (cat === "30") return entry.price30;
  if (cat === "family") return entry.priceFamily;
  return entry.priceRegular;
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
