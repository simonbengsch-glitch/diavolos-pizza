#!/usr/bin/env node

/**
 * generate-layers.js
 *
 * Liest ingredients.json, erzeugt fuer jede Zutat einen transparenten
 * Belag-Layer via OpenAI DALL-E und speichert die Ergebnisse.
 * Optional: remove.bg Cleanup.
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const https = require("https");
const { buildPrompt, buildDebugSummary } = require("./prompts");

// ─── Konfiguration ───────────────────────────────────────────────

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY || "";
const IMAGE_SIZE = process.env.IMAGE_SIZE || "1024x1024";
const IMAGE_MODEL = process.env.IMAGE_MODEL || "dall-e-3";
const IMAGE_QUALITY = process.env.IMAGE_QUALITY || "hd";

const DIR_RAW = path.join(__dirname, "generated", "raw");
const DIR_CLEAN = path.join(__dirname, "generated", "clean");
const DIR_DEBUG = path.join(__dirname, "generated", "debug");

const INGREDIENTS_FILE = path.join(__dirname, "ingredients.json");

// Rate-Limit: Pause zwischen API-Aufrufen (ms)
const DELAY_BETWEEN_CALLS = 12000;

// ─── Validierung ─────────────────────────────────────────────────

if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-...") {
  console.error("\n✗ OPENAI_API_KEY fehlt oder ist ein Platzhalter.");
  console.error("  Kopiere .env.example nach .env und trage deinen Key ein.\n");
  process.exit(1);
}

// ─── Hilfsfunktionen ─────────────────────────────────────────────

function ensureDirs() {
  [DIR_RAW, DIR_CLEAN, DIR_DEBUG].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadIngredients() {
  const raw = fs.readFileSync(INGREDIENTS_FILE, "utf-8");
  const data = JSON.parse(raw);
  return data.ingredients;
}

/**
 * Laedt ein Bild von einer URL und speichert es als Datei.
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Redirect folgen
        https.get(response.headers.location, (redirected) => {
          redirected.pipe(file);
          file.on("finish", () => { file.close(); resolve(); });
        }).on("error", reject);
        return;
      }
      response.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Ruft die OpenAI Images API auf.
 */
async function generateImage(prompt) {
  const body = JSON.stringify({
    model: IMAGE_MODEL,
    prompt: prompt,
    n: 1,
    size: IMAGE_SIZE,
    quality: IMAGE_QUALITY,
    response_format: "url"
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.openai.com",
      path: "/v1/images/generations",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Length": Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message));
            return;
          }
          if (parsed.data && parsed.data[0]) {
            resolve(parsed.data[0].url);
          } else {
            reject(new Error("Keine Bild-URL in der Antwort"));
          }
        } catch (e) {
          reject(new Error(`JSON-Parse-Fehler: ${e.message}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/**
 * Sendet ein Bild an remove.bg zum Cleanup (optional).
 */
async function cleanWithRemoveBg(inputPath, outputPath) {
  if (!REMOVEBG_API_KEY) return false;

  const imageData = fs.readFileSync(inputPath);
  const boundary = "----FormBoundary" + Date.now();

  const bodyParts = [
    `--${boundary}\r\n`,
    'Content-Disposition: form-data; name="image_file"; filename="image.png"\r\n',
    "Content-Type: image/png\r\n\r\n",
    imageData,
    `\r\n--${boundary}\r\n`,
    'Content-Disposition: form-data; name="size"\r\n\r\nfull',
    `\r\n--${boundary}--\r\n`
  ];

  const bodyBuffer = Buffer.concat(bodyParts.map((p) =>
    typeof p === "string" ? Buffer.from(p) : p
  ));

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.remove.bg",
      path: "/v1.0/removebg",
      method: "POST",
      headers: {
        "X-Api-Key": REMOVEBG_API_KEY,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": bodyBuffer.length
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          fs.writeFileSync(outputPath, Buffer.concat(chunks));
          resolve(true);
        } else {
          const errBody = Buffer.concat(chunks).toString();
          console.warn(`  ⚠ remove.bg Fehler (${res.statusCode}): ${errBody.slice(0, 120)}`);
          resolve(false);
        }
      });
    });

    req.on("error", (err) => {
      console.warn(`  ⚠ remove.bg Netzwerkfehler: ${err.message}`);
      resolve(false);
    });

    req.write(bodyBuffer);
    req.end();
  });
}

/**
 * Speichert Debug-Informationen (Prompt + Metadaten).
 */
function saveDebugInfo(ingredient, prompt, imageUrl, duration) {
  const debugFile = path.join(DIR_DEBUG, `${ingredient.id}.json`);
  const info = {
    id: ingredient.id,
    name: ingredient.name,
    category: ingredient.category,
    render_layer: ingredient.render_layer,
    placement_style: ingredient.placement_style,
    density: ingredient.density,
    coverage: ingredient.coverage,
    bake_state: ingredient.bake_state,
    prompt: prompt,
    model: IMAGE_MODEL,
    size: IMAGE_SIZE,
    quality: IMAGE_QUALITY,
    imageUrl: imageUrl,
    generatedAt: new Date().toISOString(),
    durationMs: duration,
    removeBgUsed: !!REMOVEBG_API_KEY
  };
  fs.writeFileSync(debugFile, JSON.stringify(info, null, 2));
}

// ─── Hauptlogik ──────────────────────────────────────────────────

async function processIngredient(ingredient, index, total) {
  const tag = `[${index + 1}/${total}]`;
  const rawPath = path.join(DIR_RAW, `${ingredient.id}.png`);
  const cleanPath = path.join(DIR_CLEAN, `${ingredient.id}.png`);

  // Bereits generiert? Ueberspringen.
  if (fs.existsSync(rawPath)) {
    console.log(`${tag} ⏭  ${ingredient.name} — bereits vorhanden, ueberspringe`);
    return { id: ingredient.id, status: "skipped" };
  }

  const layerIcon = ingredient.render_layer === "over_cheese" ? "🔝" : "🧀";
  console.log(`${tag} 🎨 ${ingredient.name} ${layerIcon} ${ingredient.render_layer}`);
  console.log(buildDebugSummary(ingredient).split("\n").map(l => `     ${l}`).join("\n"));

  const prompt = buildPrompt(ingredient);
  const startTime = Date.now();

  try {
    const imageUrl = await generateImage(prompt);
    const duration = Date.now() - startTime;

    console.log(`     ✓ Bild erhalten (${(duration / 1000).toFixed(1)}s)`);

    // Raw speichern
    await downloadImage(imageUrl, rawPath);
    console.log(`     ✓ Gespeichert: raw/${ingredient.id}.png`);

    // Optional: remove.bg Cleanup
    if (REMOVEBG_API_KEY) {
      console.log(`     🧹 remove.bg Cleanup...`);
      const cleaned = await cleanWithRemoveBg(rawPath, cleanPath);
      if (cleaned) {
        console.log(`     ✓ Gespeichert: clean/${ingredient.id}.png`);
      } else {
        // Fallback: Raw als Clean kopieren
        fs.copyFileSync(rawPath, cleanPath);
        console.log(`     ⚠ Fallback: Raw als Clean kopiert`);
      }
    } else {
      // Ohne remove.bg: Raw nach Clean kopieren
      fs.copyFileSync(rawPath, cleanPath);
    }

    // Debug-Info
    saveDebugInfo(ingredient, prompt, imageUrl, duration);

    return { id: ingredient.id, status: "ok", duration };
  } catch (err) {
    console.error(`     ✗ Fehler: ${err.message}`);
    return { id: ingredient.id, status: "error", error: err.message };
  }
}

async function main() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   Pizza Layer Generator                  ║");
  console.log("║   Transparente Belag-Layer via DALL-E     ║");
  console.log("╚══════════════════════════════════════════╝\n");

  ensureDirs();

  const ingredients = loadIngredients();
  console.log(`📋 ${ingredients.length} Zutaten geladen`);
  console.log(`🤖 Modell: ${IMAGE_MODEL} | Groesse: ${IMAGE_SIZE} | Qualitaet: ${IMAGE_QUALITY}`);
  console.log(`🧹 remove.bg: ${REMOVEBG_API_KEY ? "aktiv" : "deaktiviert"}`);
  console.log(`⏱  Pause zwischen Aufrufen: ${DELAY_BETWEEN_CALLS / 1000}s`);
  console.log("─".repeat(50));

  const results = [];

  for (let i = 0; i < ingredients.length; i++) {
    const result = await processIngredient(ingredients[i], i, ingredients.length);
    results.push(result);

    // Pause zwischen API-Aufrufen (nicht nach dem letzten)
    if (i < ingredients.length - 1 && result.status === "ok") {
      console.log(`     ⏳ Warte ${DELAY_BETWEEN_CALLS / 1000}s...\n`);
      await sleep(DELAY_BETWEEN_CALLS);
    } else {
      console.log("");
    }
  }

  // Zusammenfassung
  console.log("─".repeat(50));
  const ok = results.filter((r) => r.status === "ok").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const errors = results.filter((r) => r.status === "error").length;

  console.log(`\n✅ Fertig: ${ok} generiert, ${skipped} uebersprungen, ${errors} Fehler`);

  if (errors > 0) {
    console.log("\nFehlgeschlagene Zutaten:");
    results
      .filter((r) => r.status === "error")
      .forEach((r) => console.log(`  ✗ ${r.id}: ${r.error}`));
  }

  console.log("\n→ Fuehre jetzt 'npm run manifest' aus, um das Layer-Manifest zu bauen.\n");

  // Ergebnis-Report speichern
  const reportPath = path.join(DIR_DEBUG, "_generation-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    model: IMAGE_MODEL,
    size: IMAGE_SIZE,
    quality: IMAGE_QUALITY,
    results: results
  }, null, 2));
}

main().catch((err) => {
  console.error("\nFataler Fehler:", err.message);
  process.exit(1);
});
