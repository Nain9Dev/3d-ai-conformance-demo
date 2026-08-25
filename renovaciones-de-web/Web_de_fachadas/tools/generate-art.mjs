/**
 * Generador de arte vectorial para CJBR Fachadas.
 *
 * El sitio no usa fotografía de stock: todas las imágenes son SVG procedurales
 * que reproducen despieces reales de fachada ventilada (modulación de bandejas,
 * juntas, huecos, coronación) sobre volúmenes que se leen como edificios.
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
const n = (v) => Math.round(v * 10) / 10;

/* Paletas por material de revestimiento */
const PALETTES = {
  composite:    { base: ["#9098a0", "#a8b0b7", "#7c848c", "#bcc3c9"], joint: "#464d54", trim: "#ced4d9", side: "#6f767d" },
  ceramico:     { base: ["#a06c4c", "#b8815e", "#8d5b3e", "#c99a76"], joint: "#4f3323", trim: "#dcb493", side: "#7d5138" },
  fibrocemento: { base: ["#9ba1a1", "#b0b6b5", "#868c8c", "#c4c9c8"], joint: "#4e5353", trim: "#d6dad9", side: "#767c7c" },
  fenolico:     { base: ["#756047", "#8a7359", "#5e4c39", "#a08a6c"], joint: "#372d21", trim: "#b9a181", side: "#5a4a37" },
  muroCortina:  { base: ["#42707f", "#537f92", "#365a6a", "#65a0b4"], joint: "#20353d", trim: "#a9d3e0", side: "#2d4d59" },
  metal:        { base: ["#4d545a", "#5f676d", "#3e4449", "#727a81"], joint: "#282d31", trim: "#98a0a7", side: "#3a4045" },
};

/* ---------------------------------------------------------- Alzado ---- */

function facade({
  w = 1200, h = 900, seed = 1, palette = "composite",
  cols = 9, rows = 7, night = false, entrance = true,
  top = 0.08, ground = 0.92, left = 0.08, right = 0.72,
}) {
  const r = rng(seed);
  const p = PALETTES[palette];
  const o = [];

  const skyTop = night ? "#0d141b" : "#c9d6e0";
  const skyBot = night ? "#1b2530" : "#eef1f2";
  const groundC = night ? "#0a0e12" : "#8f959a";

  const gy = h * ground;            // línea de suelo
  const x0 = w * left;              // arranque del alzado principal
  const x1 = w * right;             // fin del alzado principal
  const y0 = h * top;               // coronación
  const d = w * 0.115;              // profundidad del lateral en escorzo
  const dTop = d * 0.55;            // caída del canto superior al fondo
  const dBot = d * 0.28;            // subida del arranque al fondo

  /* Cielo */
  o.push(`<rect width="${w}" height="${h}" fill="url(#sky)"/>`);
  if (!night) {
    o.push(`<circle cx="${n(w * 0.83)}" cy="${n(h * 0.16)}" r="${n(h * 0.22)}" fill="url(#sun)"/>`);
  }

  /* Skyline de fondo: da escala urbana sin robar protagonismo */
  const far = night ? "#131b23" : "#b3bfc8";
  let fx = w * 0.60;
  while (fx < w * 1.05) {
    const fw = w * (0.07 + r() * 0.09);
    const fh = h * (0.22 + r() * 0.30);
    o.push(`<rect x="${n(fx)}" y="${n(gy - fh)}" width="${n(fw)}" height="${n(fh)}" fill="${far}"/>`);
    fx += fw + w * 0.012;
  }

  /* Cara lateral en escorzo: es lo que convierte el alzado en volumen */
  o.push(
    `<path d="M${n(x1)} ${n(y0)} L${n(x1 + d)} ${n(y0 + dTop)} L${n(x1 + d)} ${n(gy - dBot)} L${n(x1)} ${n(gy)} Z" fill="${p.side}"/>`
  );
  const sideRows = Math.max(4, Math.round(rows * 0.8));
  for (let i = 1; i < sideRows; i++) {
    const t = i / sideRows;
    const ya = y0 + (gy - y0) * t;
    const yb = y0 + dTop + (gy - dBot - y0 - dTop) * t;
    o.push(`<line x1="${n(x1)}" y1="${n(ya)}" x2="${n(x1 + d)}" y2="${n(yb)}" stroke="#000" stroke-opacity="0.16" stroke-width="1.4"/>`);
  }
  o.push(`<path d="M${n(x1)} ${n(y0)} L${n(x1 + d)} ${n(y0 + dTop)} L${n(x1 + d)} ${n(gy - dBot)} L${n(x1)} ${n(gy)} Z" fill="url(#sideShade)"/>`);

  /* Alzado principal: fondo de junta y despiece de paneles */
  o.push(`<rect x="${n(x0)}" y="${n(y0)}" width="${n(x1 - x0)}" height="${n(gy - y0)}" fill="${p.joint}"/>`);

  const gw = (x1 - x0) / cols;
  const gh = (gy - y0) / rows;
  const j = Math.max(2.5, gw * 0.035);   // ancho de junta

  for (let ry = 0; ry < rows; ry++) {
    for (let rx = 0; rx < cols; rx++) {
      const px = x0 + rx * gw;
      const py = y0 + ry * gh;
      const pw = gw - j;
      const ph = gh - j;
      const isWindow = ry < rows - 1 && rx % 3 === 1 && (ry + rx) % 2 === 1;

      if (isWindow) {
        const glass = night ? pick(r, ["#ffd489", "#f6c46a", "#20303c", "#ffe0a4"]) : "#5d7b8c";
        o.push(`<rect x="${n(px + j)}" y="${n(py + j)}" width="${n(pw)}" height="${n(ph)}" fill="${glass}"/>`);
        o.push(`<rect x="${n(px + j)}" y="${n(py + j)}" width="${n(pw)}" height="${n(ph)}" fill="url(#glassG)" opacity="${night ? 0.25 : 0.85}"/>`);
        // Reflejo diagonal del vidrio
        o.push(`<path d="M${n(px + j)} ${n(py + j + ph)} L${n(px + j + pw * 0.62)} ${n(py + j)} L${n(px + j + pw)} ${n(py + j)} L${n(px + j)} ${n(py + j + ph * 0.55)} Z" fill="#ffffff" opacity="${night ? 0.05 : 0.16}"/>`);
        // Montante central
        o.push(`<line x1="${n(px + j + pw / 2)}" y1="${n(py + j)}" x2="${n(px + j + pw / 2)}" y2="${n(py + j + ph)}" stroke="${p.joint}" stroke-width="2"/>`);
        o.push(`<rect x="${n(px + j)}" y="${n(py + j)}" width="${n(pw)}" height="${n(ph)}" fill="none" stroke="${p.joint}" stroke-width="3"/>`);
        continue;
      }

      const tone = pick(r, p.base);
      if (r() > 0.80) {
        // Bandeja partida en dos: modulación real de obra
        const half = (ph - 2) / 2;
        o.push(`<rect x="${n(px + j)}" y="${n(py + j)}" width="${n(pw)}" height="${n(half)}" fill="${tone}"/>`);
        o.push(`<rect x="${n(px + j)}" y="${n(py + j + half + 2)}" width="${n(pw)}" height="${n(half)}" fill="${pick(r, p.base)}"/>`);
      } else {
        o.push(`<rect x="${n(px + j)}" y="${n(py + j)}" width="${n(pw)}" height="${n(ph)}" fill="${tone}"/>`);
      }
      o.push(`<rect x="${n(px + j)}" y="${n(py + j)}" width="${n(pw)}" height="${n(ph)}" fill="url(#sheen)" opacity="0.55"/>`);
      if (r() > 0.75) {
        o.push(`<circle cx="${n(px + j + pw - 7)}" cy="${n(py + j + 7)}" r="1.7" fill="${p.trim}" opacity="0.7"/>`);
      }
    }
  }

  /* Coronación (remate superior) con su sombra arrojada */
  o.push(`<rect x="${n(x0 - 7)}" y="${n(y0 - 11)}" width="${n(x1 - x0 + 14)}" height="11" fill="${p.trim}"/>`);
  o.push(`<path d="M${n(x1 + 7)} ${n(y0 - 11)} L${n(x1 + d + 5)} ${n(y0 + dTop - 8)} L${n(x1 + d + 5)} ${n(y0 + dTop + 2)} L${n(x1 + 7)} ${n(y0)} Z" fill="${p.trim}" opacity="0.72"/>`);
  o.push(`<rect x="${n(x0)}" y="${n(y0)}" width="${n(x1 - x0)}" height="7" fill="#000" opacity="0.18"/>`);

  /* Planta baja: zócalo y acceso */
  const zy = gy - (gy - y0) * 0.085;
  o.push(`<rect x="${n(x0)}" y="${n(zy)}" width="${n(x1 - x0)}" height="${n(gy - zy)}" fill="${night ? "#12181e" : "#5f666c"}"/>`);
  if (entrance) {
    const ew = (x1 - x0) * 0.15;
    const ex = x0 + (x1 - x0) * 0.20;
    o.push(`<rect x="${n(ex)}" y="${n(zy + 6)}" width="${n(ew)}" height="${n(gy - zy - 6)}" fill="${night ? "#f3c977" : "#2f373d"}" opacity="0.9"/>`);
    o.push(`<rect x="${n(ex - 14)}" y="${n(zy - 8)}" width="${n(ew + 28)}" height="9" rx="2" fill="${p.trim}"/>`);
  }

  /* Suelo y escala humana */
  o.push(`<rect x="0" y="${n(gy)}" width="${w}" height="${n(h - gy)}" fill="${groundC}"/>`);
  o.push(`<rect x="0" y="${n(gy)}" width="${w}" height="${n((h - gy) * 0.22)}" fill="#000" opacity="0.13"/>`);
  const figures = 3 + Math.floor(r() * 3);
  for (let i = 0; i < figures; i++) {
    const fx2 = x0 + r() * (x1 + d - x0);
    const fh2 = (h - gy) * (0.34 + r() * 0.12);
    const fy = gy + (h - gy) * 0.30;
    const fw2 = fh2 * 0.19;
    o.push(
      `<g fill="${night ? "#05080b" : "#3f464b"}" opacity="0.7">` +
        `<ellipse cx="${n(fx2 + fw2 / 2)}" cy="${n(fy + fh2)}" rx="${n(fw2 * 1.5)}" ry="${n(fw2 * 0.35)}" opacity="0.35"/>` +
        `<rect x="${n(fx2)}" y="${n(fy)}" width="${n(fw2)}" height="${n(fh2)}" rx="${n(fw2 * 0.45)}"/>` +
        `<circle cx="${n(fx2 + fw2 / 2)}" cy="${n(fy - fw2 * 0.6)}" r="${n(fw2 * 0.55)}"/>` +
      `</g>`
    );
  }

  /* Oclusión ambiental en el arranque del volumen */
  o.push(`<rect x="0" y="${n(gy - h * 0.16)}" width="${w}" height="${n(h * 0.16)}" fill="url(#ao)"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${skyTop}"/><stop offset="100%" stop-color="${skyBot}"/>
    </linearGradient>
    <radialGradient id="sun"><stop offset="0%" stop-color="#fff3dd" stop-opacity="0.9"/><stop offset="100%" stop-color="#fff3dd" stop-opacity="0"/></radialGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="${night ? 0.06 : 0.22}"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.16"/>
    </linearGradient>
    <linearGradient id="glassG" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#dbe7ee" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="#4d6d80" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#1d2b35" stop-opacity="0.45"/>
    </linearGradient>
    <linearGradient id="sideShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.34"/>
    </linearGradient>
    <linearGradient id="ao" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.22"/>
    </linearGradient>
  </defs>
  ${o.join("\n  ")}
</svg>`;
}

/* ------------------------------------------------- Muestra de material - */

function swatch({ w = 800, h = 640, seed = 1, palette = "composite", cols = 4, rows = 3 }) {
  const r = rng(seed);
  const p = PALETTES[palette];
  const o = [`<rect width="${w}" height="${h}" fill="${p.joint}"/>`];
  const gw = w / cols, gh = h / rows, j = Math.max(3, gw * 0.022);

  for (let ry = 0; ry < rows; ry++) {
    for (let rx = 0; rx < cols; rx++) {
      const x = rx * gw, y = ry * gh;
      o.push(`<rect x="${n(x + j)}" y="${n(y + j)}" width="${n(gw - j * 2)}" height="${n(gh - j * 2)}" fill="${pick(r, p.base)}"/>`);
      o.push(`<rect x="${n(x + j)}" y="${n(y + j)}" width="${n(gw - j * 2)}" height="${n(gh - j * 2)}" fill="url(#sheen)" opacity="0.6"/>`);
      // Fijación vista en las cuatro esquinas de la bandeja
      for (const [cx, cy] of [[x + j + 12, y + j + 12], [x + gw - j - 12, y + j + 12],
                              [x + j + 12, y + gh - j - 12], [x + gw - j - 12, y + gh - j - 12]]) {
        o.push(`<circle cx="${n(cx)}" cy="${n(cy)}" r="2.4" fill="${p.trim}" opacity="0.65"/>`);
      }
    }
  }
  // Luz rasante general sobre el conjunto
  o.push(`<rect width="${w}" height="${h}" fill="url(#raking)"/>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.20"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.16"/>
    </linearGradient>
    <linearGradient id="raking" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.22"/>
    </linearGradient>
  </defs>
  ${o.join("\n  ")}
</svg>`;
}

/* ------------------------------------------------------------ Catálogo - */

const ART = [
  ["hero-facade",        facade,  { w: 1000, h: 1250, seed: 7,   palette: "composite",   cols: 7,  rows: 12, top: 0.05, ground: 0.94, left: 0.06, right: 0.78 }],
  ["project-alea",       facade,  { w: 1600, h: 900,  seed: 21,  palette: "composite",   cols: 11, rows: 6, top: 0.07, ground: 0.93 }],
  ["project-ahorramas",  facade,  { w: 1200, h: 900,  seed: 34,  palette: "fenolico",    cols: 8,  rows: 5, top: 0.14, ground: 0.93 }],
  ["project-santillana", facade,  { w: 1200, h: 900,  seed: 55,  palette: "fibrocemento",cols: 8,  rows: 7, top: 0.07, ground: 0.93 }],
  ["project-colegios",   facade,  { w: 1200, h: 900,  seed: 89,  palette: "ceramico",    cols: 10, rows: 6, top: 0.12, ground: 0.93 }],
  ["project-cordoba",    facade,  { w: 1200, h: 900,  seed: 144, palette: "composite",   cols: 8,  rows: 8, top: 0.06, ground: 0.93 }],
  ["project-muro-cortina", facade,{ w: 1600, h: 900,  seed: 233, palette: "muroCortina", cols: 13, rows: 8, night: true, top: 0.05, ground: 0.93 }],
  ["project-aislamiento", facade, { w: 1200, h: 900,  seed: 377, palette: "metal",       cols: 9,  rows: 7, top: 0.07, ground: 0.93 }],
  ["project-torre",      facade,  { w: 1200, h: 900,  seed: 610, palette: "muroCortina", cols: 7,  rows: 11, night: true, top: 0.04, ground: 0.94, left: 0.12, right: 0.70 }],
  ["swatch-composite",    swatch, { seed: 11, palette: "composite",    cols: 4, rows: 3 }],
  ["swatch-ceramico",     swatch, { seed: 12, palette: "ceramico",     cols: 5, rows: 4 }],
  ["swatch-fibrocemento", swatch, { seed: 13, palette: "fibrocemento", cols: 3, rows: 3 }],
  ["swatch-fenolico",     swatch, { seed: 14, palette: "fenolico",     cols: 4, rows: 2 }],
  ["swatch-muro-cortina", swatch, { seed: 15, palette: "muroCortina",  cols: 5, rows: 4 }],
  ["swatch-metal",        swatch, { seed: 16, palette: "metal",        cols: 3, rows: 4 }],
];

for (const [name, fn, opts] of ART) {
  writeFileSync(resolve(OUT, `${name}.svg`), fn(opts), "utf8");
  console.log("✓", `assets/img/${name}.svg`);
}
console.log(`\n${ART.length} piezas generadas en assets/img/`);
