import { Extra } from "@/types";

type CatalogEntry = {
  id: string;
  name: string;
  priceRegular: number;
  priceFamily: number;
};

// Betreiber-Preisliste:
// priceRegular = runde Pizzen (ø 30–50 cm)
// priceFamily  = Familienpizza 40/60 cm
export const EXTRAS_CATALOG: CatalogEntry[] = [
  { id: "ananas",            name: "Ananas",           priceRegular: 1.50, priceFamily: 2.50 },
  { id: "artischocken",      name: "Artischocken",     priceRegular: 1.50, priceFamily: 2.50 },
  { id: "auberginen",        name: "Auberginen",       priceRegular: 1.80, priceFamily: 2.30 },
  { id: "basilikum-pesto",   name: "Basilikum-Pesto",  priceRegular: 2.00, priceFamily: 2.50 },
  { id: "bohnen",            name: "Bohnen",           priceRegular: 1.50, priceFamily: 2.50 },
  { id: "broccoli",          name: "Broccoli",         priceRegular: 1.80, priceFamily: 2.30 },
  { id: "bueffelmozzarella", name: "Büffelmozzarella", priceRegular: 2.80, priceFamily: 3.50 },
  { id: "champignons",       name: "Champignons",      priceRegular: 1.50, priceFamily: 2.30 },
  { id: "ei-gekocht",        name: "Ei, gekocht",      priceRegular: 1.50, priceFamily: 2.00 },
  { id: "frischkaese",       name: "Frischkäse",       priceRegular: 1.50, priceFamily: 2.00 },
  { id: "garnelen",          name: "Garnelen",         priceRegular: 2.80, priceFamily: 3.50 },
  { id: "gorgonzola",        name: "Gorgonzola",       priceRegular: 2.30, priceFamily: 2.80 },
  { id: "hackfleisch",       name: "Hackfleisch",      priceRegular: 2.30, priceFamily: 3.00 },
  { id: "hinterschinken",    name: "Hinterschinken",   priceRegular: 1.50, priceFamily: 2.50 },
  { id: "kapern",            name: "Kapern",           priceRegular: 1.50, priceFamily: 2.50 },
  { id: "kaese-vegan",       name: "Käse, vegan",      priceRegular: 2.50, priceFamily: 3.00 },
  { id: "kirschtomaten",     name: "Kirschtomaten",    priceRegular: 1.50, priceFamily: 2.00 },
  { id: "knoblauch",         name: "Knoblauch",        priceRegular: 1.30, priceFamily: 1.80 },
  { id: "lachs",             name: "Lachs",            priceRegular: 2.80, priceFamily: 3.50 },
  { id: "mais",              name: "Mais",             priceRegular: 1.50, priceFamily: 2.50 },
  { id: "meeresfruechten",   name: "Meeresfrüchten",   priceRegular: 2.80, priceFamily: 3.50 },
  { id: "mozzarella",        name: "Mozzarella",       priceRegular: 2.00, priceFamily: 3.00 },
  { id: "oliven",            name: "Oliven",           priceRegular: 1.50, priceFamily: 2.50 },
  { id: "paprika",           name: "Paprika",          priceRegular: 1.50, priceFamily: 2.00 },
  { id: "parmaschinken",     name: "Parmaschinken",    priceRegular: 2.80, priceFamily: 3.50 },
  { id: "parmesan",          name: "Parmesan",         priceRegular: 1.80, priceFamily: 2.30 },
  { id: "peperoni-mild",     name: "Peperoni, mild",   priceRegular: 1.50, priceFamily: 2.00 },
  { id: "peperoni-scharf",   name: "Peperoni, scharf", priceRegular: 1.50, priceFamily: 2.00 },
  { id: "rucola",            name: "Rucola",           priceRegular: 2.00, priceFamily: 2.50 },
  { id: "salami",            name: "Salami",           priceRegular: 1.50, priceFamily: 2.50 },
  { id: "salami-scharf",     name: "Salami, scharf",   priceRegular: 2.50, priceFamily: 3.50 },
  { id: "sardellen",         name: "Sardellen",        priceRegular: 2.50, priceFamily: 3.30 },
  { id: "schafskaese",       name: "Schafskäse",       priceRegular: 1.50, priceFamily: 2.30 },
  { id: "speck",             name: "Speck",            priceRegular: 2.50, priceFamily: 3.50 },
  { id: "spiegelei",         name: "Spiegelei",        priceRegular: 1.50, priceFamily: 2.00 },
  { id: "spinat",            name: "Spinat",           priceRegular: 2.30, priceFamily: 3.30 },
  { id: "steinpilzen",       name: "Steinpilzen",      priceRegular: 2.50, priceFamily: 3.50 },
  { id: "thunfisch",         name: "Thunfisch",        priceRegular: 2.50, priceFamily: 3.30 },
  { id: "trueffel-pesto",    name: "Trüffel-Pesto",    priceRegular: 2.80, priceFamily: 3.50 },
  { id: "walnuessen",        name: "Walnüssen",        priceRegular: 2.00, priceFamily: 2.50 },
  { id: "zucchini",          name: "Zucchini",         priceRegular: 1.80, priceFamily: 2.30 },
  { id: "zwiebeln",          name: "Zwiebeln",         priceRegular: 1.50, priceFamily: 2.30 },
];

export function buildExtras(isFamily: boolean): Extra[] {
  return EXTRAS_CATALOG.map((e, i) => ({
    id: e.id,
    name: e.name,
    price: isFamily ? e.priceFamily : e.priceRegular,
    is_available: true,
    sort_order: i + 1,
  }));
}

export function priceForExtraId(id: string, isFamily: boolean): number {
  const entry = EXTRAS_CATALOG.find((e) => e.id === id);
  if (!entry) return 0;
  return isFamily ? entry.priceFamily : entry.priceRegular;
}
