#!/usr/bin/env node

/**
 * build-layer-manifest.js
 *
 * Scannt den generated/clean Ordner und erzeugt ein layers.js Manifest,
 * das direkt im Frontend genutzt werden kann.
 */

const fs = require("fs");
const path = require("path");

const DIR_CLEAN = path.join(__dirname, "generated", "clean");
const INGREDIENTS_FILE = path.join(__dirname, "ingredients.json");
const OUTPUT_JS = path.join(__dirname, "generated", "layers.js");
const OUTPUT_JSON = path.join(__dirname, "generated", "layers.json");

function main() {
  console.log("\n📦 Layer-Manifest Builder\n");

  // Ingredients laden fuer Metadaten
  const ingredientsData = JSON.parse(
    fs.readFileSync(INGREDIENTS_FILE, "utf-8")
  );
  const ingredientMap = {};
  ingredientsData.ingredients.forEach((ing) => {
    ingredientMap[ing.id] = ing;
  });

  // Clean-Ordner scannen
  if (!fs.existsSync(DIR_CLEAN)) {
    console.error("✗ generated/clean Ordner existiert nicht.");
    console.error("  Fuehre zuerst 'npm run generate' aus.");
    process.exit(1);
  }

  const files = fs.readdirSync(DIR_CLEAN).filter((f) => f.endsWith(".png"));

  if (files.length === 0) {
    console.error("✗ Keine PNG-Dateien in generated/clean gefunden.");
    console.error("  Fuehre zuerst 'npm run generate' aus.");
    process.exit(1);
  }

  console.log(`✓ ${files.length} Layer gefunden\n`);

  // Manifest bauen
  const layers = files.map((file) => {
    const id = path.basename(file, ".png");
    const meta = ingredientMap[id] || {};
    const stats = fs.statSync(path.join(DIR_CLEAN, file));

    const entry = {
      id: id,
      name: meta.name || id,
      category: meta.category || "sonstiges",
      renderLayer: meta.render_layer || "under_cheese",
      file: `clean/${file}`,
      fileSize: stats.size,
      density: meta.density || "medium",
      coverage: meta.coverage || "50%"
    };

    const layerIcon = entry.renderLayer === "over_cheese" ? "🔝" : "🧀";
    console.log(`  ✓ ${entry.name} ${layerIcon} ${entry.renderLayer} (${(stats.size / 1024).toFixed(0)} KB)`);
    return entry;
  });

  // Nach Kategorie sortieren
  const categoryOrder = ["fleisch", "fisch", "gemuese", "kaese", "sonstiges"];
  layers.sort((a, b) => {
    const ai = categoryOrder.indexOf(a.category);
    const bi = categoryOrder.indexOf(b.category);
    if (ai !== bi) return ai - bi;
    return a.name.localeCompare(b.name, "de");
  });

  // Kategorien zusammenfassen
  const categories = {};
  layers.forEach((layer) => {
    if (!categories[layer.category]) {
      categories[layer.category] = [];
    }
    categories[layer.category].push(layer.id);
  });

  const manifest = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    basePath: "generated/",
    totalLayers: layers.length,
    categories: categories,
    layers: layers
  };

  // JSON-Version speichern
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ ${OUTPUT_JSON}`);

  // JS-Version speichern (direkt im Browser nutzbar)
  const jsContent = [
    "/**",
    " * Pizza Layer Manifest",
    ` * Generiert am: ${manifest.generatedAt}`,
    ` * Anzahl Layer: ${manifest.totalLayers}`,
    " *",
    " * Nutzung im Browser:",
    " *   <script src=\"layers.js\"></script>",
    " *   console.log(PIZZA_LAYERS.layers);",
    " *",
    " * Nutzung als ES-Modul:",
    " *   import { PIZZA_LAYERS } from './layers.js';",
    " */",
    "",
    `const PIZZA_LAYERS = ${JSON.stringify(manifest, null, 2)};`,
    "",
    "// CommonJS Export (Node.js)",
    "if (typeof module !== 'undefined' && module.exports) {",
    "  module.exports = { PIZZA_LAYERS };",
    "}",
    "",
    "// ES Module Export",
    "if (typeof window !== 'undefined') {",
    "  window.PIZZA_LAYERS = PIZZA_LAYERS;",
    "}",
    ""
  ].join("\n");

  fs.writeFileSync(OUTPUT_JS, jsContent);
  console.log(`✓ ${OUTPUT_JS}`);

  console.log(`\n📊 Zusammenfassung:`);
  Object.entries(categories).forEach(([cat, ids]) => {
    console.log(`   ${cat}: ${ids.length} Layer`);
  });

  console.log(`\n✅ Manifest fertig. Nutze layers.js in deinem Frontend.\n`);
}

main();
