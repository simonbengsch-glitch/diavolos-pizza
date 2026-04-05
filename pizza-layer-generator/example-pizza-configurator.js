#!/usr/bin/env node

/**
 * example-pizza-configurator.js
 *
 * Erzeugt eine standalone HTML-Datei mit einem funktionierenden
 * Pizza-Konfigurator, der die generierten Layer nutzt.
 * Oeffne die erzeugte Datei im Browser.
 */

const fs = require("fs");
const path = require("path");

const OUTPUT_FILE = path.join(__dirname, "generated", "pizza-preview.html");
const LAYERS_JSON = path.join(__dirname, "generated", "layers.json");

function main() {
  console.log("\n🍕 Pizza Konfigurator Preview Builder\n");

  // Manifest laden falls vorhanden, sonst Demo-Daten
  let layersData;
  if (fs.existsSync(LAYERS_JSON)) {
    layersData = JSON.parse(fs.readFileSync(LAYERS_JSON, "utf-8"));
    console.log(`✓ ${layersData.totalLayers} Layer aus Manifest geladen`);
  } else {
    console.log("⚠ Kein Manifest gefunden — erzeuge Demo-Version");
    layersData = {
      basePath: "generated/",
      categories: {
        fleisch: ["salami", "schinken"],
        gemuese: ["champignons", "oliven", "paprika"],
        kaese: ["mozzarella_extra"]
      },
      layers: [
        { id: "salami", name: "Salami", category: "fleisch", file: "clean/salami.png" },
        { id: "schinken", name: "Hinterschinken", category: "fleisch", file: "clean/schinken.png" },
        { id: "champignons", name: "Champignons", category: "gemuese", file: "clean/champignons.png" },
        { id: "oliven", name: "Oliven", category: "gemuese", file: "clean/oliven.png" },
        { id: "paprika", name: "Paprika", category: "gemuese", file: "clean/paprika.png" },
        { id: "mozzarella_extra", name: "Mozzarella extra", category: "kaese", file: "clean/mozzarella_extra.png" }
      ]
    };
  }

  const html = buildHTML(layersData);
  fs.writeFileSync(OUTPUT_FILE, html);
  console.log(`\n✓ Vorschau erzeugt: ${OUTPUT_FILE}`);
  console.log("  Oeffne die Datei im Browser!\n");
}

function buildHTML(manifest) {
  const layersJSON = JSON.stringify(manifest.layers, null, 2);

  const categoryLabels = {
    fleisch: "Fleisch",
    fisch: "Fisch",
    gemuese: "Gemuese",
    kaese: "Kaese",
    sonstiges: "Sonstiges"
  };

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pizza Konfigurator — Layer Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #1a1a1a;
      min-height: 100vh;
    }

    .header {
      background: #1a1a1a;
      color: white;
      padding: 16px 20px;
      text-align: center;
    }
    .header h1 { font-size: 20px; font-weight: 700; }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    @media (min-width: 640px) {
      .container {
        grid-template-columns: 1fr 1fr;
        align-items: start;
      }
    }

    /* Pizza Vorschau */
    .pizza-preview {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      position: sticky;
      top: 20px;
    }

    .pizza-preview h2 {
      font-size: 16px;
      margin-bottom: 16px;
      text-align: center;
    }

    .pizza-canvas {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      border-radius: 50%;
      overflow: hidden;
      background: radial-gradient(circle,
        #c0392b 0%,
        #c0392b 65%,
        #d4a054 66%,
        #c4903a 80%,
        #b8842e 100%
      );
      margin: 0 auto;
      max-width: 350px;
    }

    .pizza-canvas .layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .pizza-canvas .cheese-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: radial-gradient(circle,
        rgba(255,248,220,0.5) 0%,
        rgba(255,240,200,0.35) 50%,
        rgba(255,235,180,0.2) 75%,
        transparent 100%
      );
      pointer-events: none;
      z-index: 10;
    }

    .active-toppings {
      text-align: center;
      margin-top: 12px;
      min-height: 28px;
    }
    .active-toppings .tag {
      display: inline-block;
      background: #e8f5e9;
      color: #2e7d32;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 12px;
      margin: 2px;
    }

    /* Belag-Auswahl */
    .toppings-panel {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .toppings-panel h2 {
      font-size: 16px;
      margin-bottom: 4px;
    }
    .toppings-panel .subtitle {
      font-size: 12px;
      color: #888;
      margin-bottom: 16px;
    }

    .category-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #999;
      margin: 16px 0 8px;
    }
    .category-label:first-of-type { margin-top: 0; }

    .topping-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .topping-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border: 2px solid #e5e5e5;
      border-radius: 10px;
      background: white;
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 13px;
      font-weight: 500;
    }
    .topping-btn:hover { border-color: #ccc; }
    .topping-btn.active {
      border-color: #2e7d32;
      background: #f1f8e9;
      color: #2e7d32;
    }
    .topping-btn .check {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 2px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
    }
    .topping-btn.active .check {
      background: #2e7d32;
      border-color: #2e7d32;
      color: white;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Pizza Konfigurator — Layer Preview</h1>
  </div>

  <div class="container">
    <!-- Pizza Vorschau -->
    <div class="pizza-preview">
      <h2>Deine Pizza</h2>
      <div class="pizza-canvas" id="pizzaCanvas">
        <!-- Kaese-Overlay (liegt ueber den Toppings) -->
        <div class="cheese-overlay"></div>
      </div>
      <div class="active-toppings" id="activeToppings"></div>
    </div>

    <!-- Belag-Auswahl -->
    <div class="toppings-panel">
      <h2>Belaege</h2>
      <p class="subtitle">Klicke zum Ein-/Ausblenden</p>
      <div id="toppingsList"></div>
    </div>
  </div>

  <script>
    const LAYERS = ${layersJSON};

    const state = {};
    LAYERS.forEach(l => { state[l.id] = false; });

    const canvas = document.getElementById('pizzaCanvas');
    const list = document.getElementById('toppingsList');
    const activeToppings = document.getElementById('activeToppings');

    // Layer-Images vorab erzeugen
    const layerImages = {};
    LAYERS.forEach(layer => {
      const img = document.createElement('img');
      img.src = layer.file;
      img.alt = layer.name;
      img.className = 'layer';
      img.style.opacity = '0';
      img.style.zIndex = '5'; // unter dem Kaese-Overlay (z-index: 10)
      canvas.appendChild(img);
      layerImages[layer.id] = img;
    });

    // Buttons nach Kategorie gruppiert erzeugen
    const categoryLabels = ${JSON.stringify(categoryLabels)};
    const grouped = {};
    LAYERS.forEach(l => {
      if (!grouped[l.category]) grouped[l.category] = [];
      grouped[l.category].push(l);
    });

    Object.entries(grouped).forEach(([cat, layers]) => {
      const label = document.createElement('div');
      label.className = 'category-label';
      label.textContent = categoryLabels[cat] || cat;
      list.appendChild(label);

      const grid = document.createElement('div');
      grid.className = 'topping-grid';

      layers.forEach(layer => {
        const btn = document.createElement('button');
        btn.className = 'topping-btn';
        btn.innerHTML = '<span class="check"></span>' + layer.name;
        btn.addEventListener('click', () => toggleTopping(layer.id, btn));
        grid.appendChild(btn);
      });

      list.appendChild(grid);
    });

    function toggleTopping(id, btn) {
      state[id] = !state[id];
      btn.classList.toggle('active', state[id]);
      btn.querySelector('.check').textContent = state[id] ? '✓' : '';

      // Layer ein-/ausblenden
      layerImages[id].style.opacity = state[id] ? '1' : '0';

      // Aktive Tags aktualisieren
      const active = LAYERS.filter(l => state[l.id]);
      activeToppings.innerHTML = active.length
        ? active.map(l => '<span class="tag">' + l.name + '</span>').join('')
        : '<span style="color:#aaa;font-size:12px">Waehle Belaege...</span>';
    }

    // Initial
    activeToppings.innerHTML = '<span style="color:#aaa;font-size:12px">Waehle Belaege...</span>';
  </script>
</body>
</html>`;
}

main();
