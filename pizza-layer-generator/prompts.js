/**
 * Prompt-Builder fuer Pizza-Belag-Layer.
 * Erzeugt praezise DALL-E Prompts mit zutatspezifischen visuellen Regeln.
 */

// ─── Basis-Regeln (gelten fuer ALLE Zutaten) ─────────────────────

const ABSOLUTE_RULES = [
  "CRITICAL RULES — MUST FOLLOW:",
  "- ONLY the topping itself is visible, nothing else",
  "- Completely transparent background (PNG alpha channel)",
  "- ABSOLUTELY NO: dough, sauce, cheese base, plate, table, surface, shadows on ground",
  "- ABSOLUTELY NO: decorations, herbs as garnish, extra ingredients, oil drizzle",
  "- ABSOLUTELY NO: mixed toppings — show ONLY the single specified ingredient",
  "- The toppings float on pure transparent nothingness",
  "- No circular pizza shape outline — just scattered pieces in a roughly circular area"
].join("\n");

const CAMERA_RULES = [
  "CAMERA AND LIGHTING:",
  "- Perfectly top-down overhead view (90 degrees, birds-eye)",
  "- Soft, even studio lighting from above",
  "- No harsh shadows — only very subtle contact shadows between pieces",
  "- Sharp focus on every piece",
  "- Photorealistic food photography quality"
].join("\n");

// ─── Layer-spezifische Regeln ─────────────────────────────────────

const LAYER_RULES = {
  under_cheese: [
    "LAYER CONTEXT:",
    "This topping will be placed UNDER a separate cheese overlay in the final composite.",
    "It should look like it was placed on pizza dough/sauce BEFORE cheese was added.",
    "The topping should look like it has been baked in an oven.",
    "Show appropriate heat effects: slight shrinkage, color changes, oil release.",
    "The pieces should be distributed as a pizzaiolo would place them."
  ].join("\n"),

  over_cheese: [
    "LAYER CONTEXT:",
    "This topping will be placed ON TOP of cheese in the final composite.",
    "It should look like it was added AFTER baking — fresh and uncooked appearance.",
    "No baking effects on this topping — it should look freshly placed.",
    "Colors should be vivid and fresh, not heat-affected.",
    "The pieces should look like they were just placed by the chef moments ago."
  ].join("\n")
};

// ─── Placement-Stil Beschreibungen ────────────────────────────────

const PLACEMENT_DESCRIPTIONS = {
  scattered_circular: "Distribute pieces in a roughly circular area (like a 30cm pizza), slightly denser toward center, naturally irregular spacing. Not a perfect circle — organic distribution.",
  torn_scattered: "Scatter torn/broken pieces randomly across the circular area. No two pieces the same shape. Casual, hand-placed look.",
  draped_loose: "Loosely drape large thin pieces across the area. They should have natural folds and wrinkles, not laid flat. Elegant and casual at the same time.",
  scattered_random: "Scatter small pieces randomly with natural clustering. Some areas slightly denser, some sparser. Not a grid pattern.",
  crumbled_even: "Scatter many small crumbles relatively evenly but with natural variation. Denser in center, slightly sparser at edges.",
  small_mounds: "Place in small separated mounds or clusters, each mound a few centimeters across. Space between mounds.",
  sparse_radial: "Place few pieces arranged loosely radiating from center. Very sparse — lots of empty space between pieces.",
  placed_elegant: "Place pieces deliberately with artistic intent. Each piece visible and distinct. Premium presentation.",
  scattered_even: "Scatter pieces evenly across the circular area with consistent spacing. Natural but well-distributed.",
  scattered_sparse: "Scatter pieces with generous empty space between them. Less is more. Each piece should breathe.",
  scattered_colorful: "Scatter pieces to maximize color variety across the area. Mix colors evenly.",
  rings_scattered: "Scatter ring shapes and half-rings naturally across the area, some overlapping, some isolated.",
  sparse_scattered: "Very few pieces scattered with large gaps between them. Accent topping, not main coverage.",
  wilted_clusters: "Form small wilted clusters rather than even spread. Natural clustering from cooking. Some areas bare.",
  fresh_piled: "Pile loosely and airily on top. Should have height and volume, not flat. Fresh and alive looking.",
  scattered_casual: "Scatter casually as if tossed by hand. Natural and unforced. Some clustering, some singles.",
  placed_casual: "Place casually but with intent. Each piece visible. Relaxed but appetizing arrangement.",
  placed_central: "Place centrally or slightly off-center. Not scattered — deliberately placed. Focal point.",
  crumbled_scattered: "Scatter crumbled pieces loosely. Mix of sizes. Some more intact, some broken down.",
  dolloped: "Place small dollops with space between each. Each dollop has a natural rounded shape.",
  shaved_scattered: "Scatter thin shavings and curled flakes loosely across the surface. Light and airy."
};

// ─── Prompt-Builder ───────────────────────────────────────────────

/**
 * Baut den vollstaendigen Prompt fuer eine Zutat mit allen visuellen Regeln.
 * @param {Object} ingredient - Objekt aus ingredients.json
 * @returns {string} Fertiger Prompt fuer DALL-E
 */
function buildPrompt(ingredient) {
  const layerRule = LAYER_RULES[ingredient.render_layer] || LAYER_RULES.under_cheese;
  const placementDesc = PLACEMENT_DESCRIPTIONS[ingredient.placement_style] || PLACEMENT_DESCRIPTIONS.scattered_even;

  const parts = [
    `Professional food photography: Top-down view of ${ingredient.name} pizza topping.`,
    "",
    "═══ SUBJECT ═══",
    `Ingredient: ${ingredient.name}`,
    `Show: ${ingredient.piece_count} pieces`,
    `Cut style: ${ingredient.cut_style}`,
    `Coverage: ${ingredient.coverage} of a ~30cm circular area`,
    `Density: ${ingredient.density}`,
    "",
    "═══ APPEARANCE ═══",
    `Bake state: ${ingredient.bake_state}`,
    `Moisture: ${ingredient.moisture_level}`,
    `Visual details: ${ingredient.realism_notes}`,
    "",
    "═══ ARRANGEMENT ═══",
    placementDesc,
    "",
    layerRule,
    "",
    ABSOLUTE_RULES,
    "",
    CAMERA_RULES,
    "",
    "OUTPUT: Photorealistic 8K food photography, transparent PNG background, isolated topping only."
  ];

  return parts.join("\n");
}

/**
 * Baut einen vereinfachten Debug-Text fuer Logging.
 * @param {Object} ingredient
 * @returns {string}
 */
function buildDebugSummary(ingredient) {
  return [
    `[${ingredient.id}] ${ingredient.name}`,
    `  Layer: ${ingredient.render_layer} | Category: ${ingredient.category}`,
    `  Cut: ${ingredient.cut_style}`,
    `  Density: ${ingredient.density} | Coverage: ${ingredient.coverage}`,
    `  Bake: ${ingredient.bake_state}`
  ].join("\n");
}

module.exports = { buildPrompt, buildDebugSummary };
