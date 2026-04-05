#!/usr/bin/env node

/**
 * generate-layers.js
 *
 * Generiert transparente Pizza-Belag-Layer:
 * 1. DALL-E erzeugt Zutaten auf weißem Hintergrund
 * 2. sharp entfernt den weißen Hintergrund → transparentes PNG
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

const DELAY_BETWEEN_CALLS = 12000;

// Schwellenwert für "weiß" — Pixel mit R,G,B alle über diesem Wert werden transparent
const WHITE_THRESHOLD = 235;

// ─── Validierung ─────────────────────────────────────────────────

if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-...") {
  console.error("\n✗ OPENAI_API_KEY fehlt.");
  process.exit(1);
}

let sharp;
try {
  sharp = require("sharp");
  console.log("✓ sharp geladen — Post-Processing aktiv\n");
} catch {
  console.warn("⚠ sharp nicht installiert — kein Background-Removal möglich");
  console.warn("  Installiere mit: npm install sharp\n");
  sharp = null;
}

// ─── Hilfsfunktionen ─────────────────────────────────────────────

function ensureDirs() {
  [DIR_RAW, DIR_CLEAN, DIR_DEBUG].forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadIngredients() {
  return JSON.parse(fs.readFileSync(INGREDIENTS_FILE, "utf-8")).ingredients;
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const get = (u) => {
      https.get(u, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          get(res.headers.location);
          return;
        }
        const file = fs.createWriteStream(filepath);
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(); });
      }).on("error", reject);
    };
    get(url);
  });
}

function generateImage(prompt) {
  const body = JSON.stringify({
    model: IMAGE_MODEL,
    prompt: prompt,
    n: 1,
    size: IMAGE_SIZE,
    quality: IMAGE_QUALITY,
    response_format: "url"
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.openai.com",
      path: "/v1/images/generations",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Length": Buffer.byteLength(body)
      }
    }, (res) => {
      let data = "";
      res.on("data", (c) => { data += c; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          if (parsed.data?.[0]?.url) return resolve(parsed.data[0].url);
          reject(new Error("Keine Bild-URL in Antwort"));
        } catch (e) {
          reject(new Error(`JSON-Parse: ${e.message}`));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/**
 * Entfernt weißen Hintergrund mit sharp.
 * Alle Pixel die "nah an weiß" sind werden transparent.
 */
async function removeWhiteBackground(inputPath, outputPath) {
  if (!sharp) {
    fs.copyFileSync(inputPath, outputPath);
    return false;
  }

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Raw RGBA-Daten holen
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = Buffer.from(data);
    const channels = info.channels; // 4 (RGBA)

    let transparentCount = 0;
    const totalPixels = width * height;

    for (let i = 0; i < pixels.length; i += channels) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // Wenn alle Kanäle über dem Threshold → transparent machen
      if (r > WHITE_THRESHOLD && g > WHITE_THRESHOLD && b > WHITE_THRESHOLD) {
        pixels[i + 3] = 0; // Alpha auf 0
        transparentCount++;
      }
      // Übergangsbereich: Pixel nahe weiß → teilweise transparent
      else if (r > WHITE_THRESHOLD - 20 && g > WHITE_THRESHOLD - 20 && b > WHITE_THRESHOLD - 20) {
        const avg = (r + g + b) / 3;
        const alpha = Math.round(255 * (1 - (avg - (WHITE_THRESHOLD - 20)) / 20));
        pixels[i + 3] = Math.max(0, Math.min(255, alpha));
        if (alpha < 128) transparentCount++;
      }
    }

    await sharp(pixels, { raw: { width, height, channels } })
      .png()
      .toFile(outputPath);

    const pct = ((transparentCount / totalPixels) * 100).toFixed(1);
    console.log(`     🧹 Background entfernt: ${pct}% transparent`);
    return true;
  } catch (err) {
    console.warn(`     ⚠ sharp Fehler: ${err.message}`);
    fs.copyFileSync(inputPath, outputPath);
    return false;
  }
}

function saveDebugInfo(ingredient, prompt, imageUrl, duration) {
  const debugFile = path.join(DIR_DEBUG, `${ingredient.id}.json`);
  fs.writeFileSync(debugFile, JSON.stringify({
    id: ingredient.id,
    name: ingredient.name,
    render_layer: ingredient.render_layer,
    prompt, imageUrl,
    model: IMAGE_MODEL, size: IMAGE_SIZE, quality: IMAGE_QUALITY,
    generatedAt: new Date().toISOString(),
    durationMs: duration
  }, null, 2));
}

// ─── Hauptlogik ──────────────────────────────────────────────────

async function processIngredient(ingredient, index, total) {
  const tag = `[${index + 1}/${total}]`;
  const rawPath = path.join(DIR_RAW, `${ingredient.id}.png`);
  const cleanPath = path.join(DIR_CLEAN, `${ingredient.id}.png`);

  if (fs.existsSync(cleanPath)) {
    console.log(`${tag} ⏭  ${ingredient.name} — bereits vorhanden`);
    return { id: ingredient.id, status: "skipped" };
  }

  const layerIcon = ingredient.render_layer === "over_cheese" ? "🔝" : "🧀";
  console.log(`${tag} 🎨 ${ingredient.name} ${layerIcon}`);
  console.log(buildDebugSummary(ingredient).split("\n").map(l => `     ${l}`).join("\n"));

  const prompt = buildPrompt(ingredient);
  const startTime = Date.now();

  try {
    const imageUrl = await generateImage(prompt);
    const duration = Date.now() - startTime;
    console.log(`     ✓ DALL-E (${(duration / 1000).toFixed(1)}s)`);

    await downloadImage(imageUrl, rawPath);
    console.log(`     ✓ raw/${ingredient.id}.png`);

    await removeWhiteBackground(rawPath, cleanPath);
    console.log(`     ✓ clean/${ingredient.id}.png`);

    saveDebugInfo(ingredient, prompt, imageUrl, duration);
    return { id: ingredient.id, status: "ok", duration };
  } catch (err) {
    console.error(`     ✗ ${err.message}`);
    return { id: ingredient.id, status: "error", error: err.message };
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║  Pizza Layer Generator v2                ║");
  console.log("║  Weiß→Transparent Post-Processing        ║");
  console.log("╚══════════════════════════════════════════╝\n");

  ensureDirs();
  const ingredients = loadIngredients();

  console.log(`📋 ${ingredients.length} Zutaten`);
  console.log(`🤖 ${IMAGE_MODEL} | ${IMAGE_SIZE} | ${IMAGE_QUALITY}`);
  console.log(`🧹 sharp: ${sharp ? "aktiv" : "NICHT installiert"}`);
  console.log("─".repeat(50));

  const results = [];
  for (let i = 0; i < ingredients.length; i++) {
    const result = await processIngredient(ingredients[i], i, ingredients.length);
    results.push(result);
    if (i < ingredients.length - 1 && result.status === "ok") {
      console.log(`     ⏳ ${DELAY_BETWEEN_CALLS / 1000}s...\n`);
      await sleep(DELAY_BETWEEN_CALLS);
    } else {
      console.log("");
    }
  }

  console.log("─".repeat(50));
  const ok = results.filter(r => r.status === "ok").length;
  const skipped = results.filter(r => r.status === "skipped").length;
  const errors = results.filter(r => r.status === "error").length;
  console.log(`\n✅ ${ok} generiert, ${skipped} übersprungen, ${errors} Fehler\n`);

  if (errors > 0) {
    console.log("Fehler:");
    results.filter(r => r.status === "error").forEach(r => console.log(`  ✗ ${r.id}: ${r.error}`));
  }

  fs.writeFileSync(path.join(DIR_DEBUG, "_report.json"), JSON.stringify({ results, generatedAt: new Date().toISOString() }, null, 2));
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
