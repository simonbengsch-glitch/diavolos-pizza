/**
 * Prompt-Builder fuer Pizza-Belag-Layer.
 * Erzeugt Prompts die isolierte Zutaten auf REINWEISSEM Hintergrund generieren.
 * Der weiße Hintergrund wird danach per sharp zu Transparenz konvertiert.
 */

const ABSOLUTE_RULES = [
  "CRITICAL RULES — VIOLATING ANY OF THESE RUINS THE IMAGE:",
  "- PURE WHITE BACKGROUND (#FFFFFF) — nothing else behind the food",
  "- ONLY show the single specified topping ingredient, absolutely nothing else",
  "- NO pizza dough, NO sauce, NO cheese, NO plate, NO table, NO surface",
  "- NO shadows on the background — only very subtle shadows between food pieces",
  "- NO decorations, NO herbs as garnish, NO oil drizzle, NO extra ingredients",
  "- NO mixed toppings — show ONLY the one ingredient specified",
  "- The food pieces float on a perfectly clean pure white void",
  "- NO circular outline or pizza shape — just the food pieces arranged in a circle"
].join("\n");

const CAMERA_RULES = [
  "CAMERA AND LIGHTING:",
  "- Perfectly top-down overhead view (exactly 90 degrees, birds-eye)",
  "- Bright, even, shadowless studio lighting",
  "- Pure white background with zero texture or gradient",
  "- Sharp focus, high detail on every piece",
  "- Commercial food photography quality, 8K resolution"
].join("\n");

const LAYER_RULES = {
  under_cheese: [
    "COOKING STATE:",
    "This ingredient has been baked in a pizza oven.",
    "Show realistic heat effects: slight browning, oil release, edges curling.",
    "The pieces look like they came out of a 400°C wood-fired oven.",
    "Realistic cooked appearance, not raw."
  ].join("\n"),

  over_cheese: [
    "COOKING STATE:",
    "This ingredient is placed on the pizza AFTER baking — it is fresh and uncooked.",
    "Vivid, fresh colors. No heat effects. No browning.",
    "Looks like it was just placed by the chef moments ago."
  ].join("\n")
};

const PLACEMENT_DESCRIPTIONS = {
  scattered_circular: "Arrange pieces in a roughly circular pattern (~25cm diameter) as if placed on an invisible round pizza. Slightly denser toward center. Natural, irregular spacing.",
  scattered_random: "Scatter pieces randomly across a circular area. No two pieces identical. Casual, hand-placed appearance.",
  draped_loose: "Drape large thin pieces loosely across the circular area with natural folds and wrinkles. Elegant and casual.",
  crumbled_even: "Scatter many small crumbles relatively evenly across a circular area. Natural variation in density.",
  small_mounds: "Place in small separated mounds within a circular area. Space between each mound.",
  sparse_radial: "Place very few pieces loosely radiating from center. Very sparse — lots of white space.",
  placed_elegant: "Place pieces deliberately with artistic spacing. Each piece distinct and visible.",
  scattered_even: "Scatter evenly across a circular area. Consistent but natural spacing.",
  scattered_sparse: "Scatter with generous white space between pieces. Less is more.",
  scattered_colorful: "Scatter to show color variety. Mix colors across the area.",
  rings_scattered: "Scatter ring shapes naturally, some overlapping, some isolated.",
  sparse_scattered: "Very few pieces with large gaps. Accent topping.",
  wilted_clusters: "Form small wilted clusters rather than even spread.",
  fresh_piled: "Pile loosely with height and volume. Fresh and alive looking.",
  scattered_casual: "Scatter as if tossed by hand. Natural and unforced.",
  placed_casual: "Place casually but visibly. Each piece clear.",
  placed_central: "Place in center area. Deliberate focal placement.",
  crumbled_scattered: "Scatter crumbled pieces loosely. Mix of sizes.",
  dolloped: "Place small dollops with space between each.",
  shaved_scattered: "Scatter thin shavings and curled flakes loosely."
};

/**
 * Baut den Prompt fuer eine Zutat.
 */
function buildPrompt(ingredient) {
  const layerRule = LAYER_RULES[ingredient.render_layer] || LAYER_RULES.under_cheese;
  const placementDesc = PLACEMENT_DESCRIPTIONS[ingredient.placement_style] || PLACEMENT_DESCRIPTIONS.scattered_even;

  const parts = [
    `Professional commercial food photography on a PURE WHITE background:`,
    `${ingredient.name} pizza topping, isolated, top-down view.`,
    "",
    `SUBJECT: ${ingredient.piece_count} pieces of ${ingredient.name}`,
    `Cut: ${ingredient.cut_style}`,
    `Appearance: ${ingredient.realism_notes}`,
    "",
    `ARRANGEMENT: ${placementDesc}`,
    "",
    layerRule,
    "",
    ABSOLUTE_RULES,
    "",
    CAMERA_RULES,
    "",
    "The background MUST be perfectly pure white (#FFFFFF). This is non-negotiable."
  ];

  return parts.join("\n");
}

function buildDebugSummary(ingredient) {
  return [
    `[${ingredient.id}] ${ingredient.name}`,
    `  Layer: ${ingredient.render_layer} | Category: ${ingredient.category}`,
    `  Pieces: ${ingredient.piece_count} | Density: ${ingredient.density}`
  ].join("\n");
}

module.exports = { buildPrompt, buildDebugSummary };
