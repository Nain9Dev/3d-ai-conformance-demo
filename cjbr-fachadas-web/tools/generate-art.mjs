/**
 * Generador de arte vectorial para CJBR Fachadas.
 *
 * El sitio no depende de fotografía de stock: todas las imágenes son SVG
 * procedurales que reproducen despieces reales de fachada ventilada
 * (juntas, subestructura, modulación de bandejas, huecos de ventana).
 * Determinista: mismo `seed` -> mismo dibujo, así el repo no cambia sin motivo.
 *
 *   node tools/generate-art.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "assets/img");
mkdirSync(OUT, { recursive: true });

/* PRNG determinista (mulberry32) */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const round = (n) => Math.round(n * 100) / 100;

/* Paletas por material de revestimiento */
const PALETTES = {
  composite: { name: "Composite", base: ["#8d949b", "#a4abb2", "#767d85", "#b6bcc2"], joint: "#4d545b", accent: "#c9d0d6" },
  ceramico: { name: "Cerámico", base: ["#9c6a4d", "#b07d5e", "#8a5a3f", "#c08f6f"], joint: "#5a3b29", accent: "#d8ae8d" },
  fibrocemento: { name: "Fibrocemento", base: ["#9aa0a0", "#adb3b2", "#868c8c", "#c0c5c4"], joint: "#565b5b", accent: "#d3d7d6" },
  fenolico: { name: "Fenólico", base: ["#6d5a44", "#836e54", "#5a4a37", "#9a8365"], joint: "#3d3225", accent: "#b39b7b" },
  muroCortina: { name: "Muro cortina", base: ["#3f6b7d", "#4f7f92", "#35596a", "#6098ad"], joint: "#22394352", accent: "#a9d3e0" },
  metal: { name: "Chapa lacada", base: ["#4a5157", "#5b6369", "#3c4247", "#6d757c"], joint: "#2b3034", accent: "#8f979e" },
};

/**
 * Dibuja un alzado de fachada modulado.
 */
function facade({ w = 1200, h = 900, seed = 1, palette = "composite", sky = "#dfe4e8", night = false, windows = true, cols = 9, rows = 7 }) {
  const r = rng(seed);
  const p = PALETTES[palette];
  const parts = [];
  const gap = 3;
  const padX = w * 0.06;
  const padY = h * 0.05;
  const gw = (w - padX * 2) / cols;
  const gh = (h - padY * 2) / rows;

  // Cielo / fondo con degradado
  parts.push(`<rect width="${w}" height="${h}" fill="url(#sky-${seed})"/>`);

  // Volumen secundario al fondo (profundidad urbana)
  const bw = w * (0.28 + r() * 0.2);
  parts.push(
    `<rect x="${round(w - bw - padX * 0.2)}" y="${round(h * (0.18 + r() * 0.1))}" width="${round(bw)}" height="${h}" fill="${night ? "#161b20" : "#c9cfd4"}" opacity="0.55"/>`
  );

  // Cuerpo principal
  parts.push(`<rect x="${round(padX)}" y="${round(padY)}" width="${round(w - padX * 2)}" height="${round(h - padY)}" fill="${p.joint}"/>`);

  // Bandejas / paneles
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = padX + x * gw;
      const py = padY + y * gh;
      // Huecos de ventana modulados según retícula
      const isWindow = windows && y > 0 && y < rows - 1 && x % 3 === 1 && y % 2 === 1;
      if (isWindow) {
        const glass = night ? pick(r, ["#f2c46a", "#ffd98a", "#2b3238", "#e8b95c"]) : pick(r, ["#7d939f", "#6c8593", "#8fa5b0"]);
        parts.push(`<rect x="${round(px + gap)}" y="${round(py + gap)}" width="${round(gw - gap * 2)}" height="${round(gh - gap * 2)}" fill="${glass}"/>`);
        parts.push(`<rect x="${round(px + gap)}" y="${round(py + gap)}" width="${round(gw - gap * 2)}" height="${round((gh - gap * 2) * 0.42)}" fill="#ffffff" opacity="${night ? 0.06 : 0.22}"/>`);
        parts.push(`<rect x="${round(px + gap)}" y="${round(py + gap)}" width="${round(gw - gap * 2)}" height="${round(gh - gap * 2)}" fill="none" stroke="${p.joint}" stroke-width="2.5"/>`);
        continue;
      }
      const tone = pick(r, p.base);
      // Paneles ocasionalmente partidos en dos bandejas: modulación real de obra
      const split = r() > 0.82;
      if (split) {
        const half = (gh - gap * 2) / 2 - 1;
        parts.push(`<rect x="${round(px + gap)}" y="${round(py + gap)}" width="${round(gw - gap * 2)}" height="${round(half)}" fill="${tone}"/>`);
        parts.push(`<rect x="${round(px + gap)}" y="${round(py + gap + half + 2)}" width="${round(gw - gap * 2)}" height="${round(half)}" fill="${pick(r, p.base)}"/>`);
      } else {
        parts.push(`<rect x="${round(px + gap)}" y="${round(py + gap)}" width="${round(gw - gap * 2)}" height="${round(gh - gap * 2)}" fill="${tone}"/>`);
      }
      // Brillo direccional del panel (luz rasante)
      parts.push(
        `<rect x="${round(px + gap)}" y="${round(py + gap)}" width="${round(gw - gap * 2)}" height="${round(gh - gap * 2)}" fill="url(#sheen-${seed})" opacity="0.5"/>`
      );
      // Fijación vista puntual
      if (r() > 0.72) {
        parts.push(`<circle cx="${round(px + gw - gap - 7)}" cy="${round(py + gap + 7)}" r="1.6" fill="${p.accent}" opacity="0.75"/>`);
      }
    }
  }

  // Remate superior (coronación) y zócalo
  parts.push(`<rect x="${round(padX - 6)}" y="${round(padY - 10)}" width="${round(w - padX * 2 + 12)}" height="10" fill="${p.accent}" opacity="0.9"/>`);
  parts.push(`<rect x="${round(padX)}" y="${round(h - 26)}" width="${round(w - padX * 2)}" height="26" fill="${night ? "#0f1317" : "#7b8288"}"/>`);

  // Sombra proyectada / oclusión ambiental en el arranque
  parts.push(`<rect x="0" y="${round(h * 0.72)}" width="${w}" height="${round(h * 0.28)}" fill="url(#ao-${seed})"/>`);

  const skyTop = night ? "#111820" : sky;
  const skyBot = night ? "#1d262e" : "#f2f4f6";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${skyTop}"/><stop offset="100%" stop-color="${skyBot}"/>
    </linearGradient>
    <linearGradient id="sheen-${seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="${night ? 0.05 : 0.2}"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.14"/>
    </linearGradient>
    <linearGradient id="ao-${seed}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.30"/>
    </linearGradient>
  </defs>
  ${parts.join("\n  ")}
</svg>`;
}

/* Catálogo de imágenes a generar */
const ART = [
  ["hero-facade", { w: 900, h: 1125, seed: 7, palette: "composite", cols: 7, rows: 9, night: false }],
  ["project-alea", { w: 1200, h: 900, seed: 21, palette: "composite", cols: 9, rows: 7 }],
  ["project-ahorramas", { w: 1600, h: 900, seed: 34, palette: "fenolico", cols: 12, rows: 6 }],
  ["project-santillana", { w: 1200, h: 900, seed: 55, palette: "fibrocemento", cols: 8, rows: 7 }],
  ["project-colegios", { w: 1200, h: 900, seed: 89, palette: "ceramico", cols: 10, rows: 6 }],
  ["project-cordoba", { w: 1200, h: 900, seed: 144, palette: "composite", cols: 8, rows: 8 }],
  ["project-muro-cortina", { w: 1600, h: 900, seed: 233, palette: "muroCortina", cols: 14, rows: 8, night: true }],
  ["project-aislamiento", { w: 1200, h: 900, seed: 377, palette: "metal", cols: 9, rows: 7 }],
  ["project-torre", { w: 1200, h: 900, seed: 610, palette: "muroCortina", cols: 7, rows: 10, night: true }],
  ["swatch-composite", { w: 800, h: 640, seed: 11, palette: "composite", cols: 5, rows: 4, windows: false }],
  ["swatch-ceramico", { w: 800, h: 640, seed: 12, palette: "ceramico", cols: 6, rows: 5, windows: false }],
  ["swatch-fibrocemento", { w: 800, h: 640, seed: 13, palette: "fibrocemento", cols: 4, rows: 4, windows: false }],
  ["swatch-fenolico", { w: 800, h: 640, seed: 14, palette: "fenolico", cols: 5, rows: 3, windows: false }],
  ["swatch-muro-cortina", { w: 800, h: 640, seed: 15, palette: "muroCortina", cols: 6, rows: 6, windows: false }],
  ["swatch-metal", { w: 800, h: 640, seed: 16, palette: "metal", cols: 4, rows: 5, windows: false }],
];

for (const [name, opts] of ART) {
  writeFileSync(resolve(OUT, `${name}.svg`), facade(opts), "utf8");
  console.log("✓", `assets/img/${name}.svg`);
}
console.log(`\n${ART.length} piezas generadas en assets/img/`);
