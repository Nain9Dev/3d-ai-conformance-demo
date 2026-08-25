/**
 * Constructor de páginas estáticas.
 *
 * La cabecera, el pie, el botón de WhatsApp y el diálogo de proyecto viven una
 * sola vez: en index.html. Este script los extrae de ahí y los inyecta en cada
 * fragmento de `src/pages/*.html`, de modo que el chrome del sitio nunca se
 * desincroniza entre páginas.
 *
 *   node tools/build.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const index = readFileSync(resolve(ROOT, "index.html"), "utf8");

const grab = (re, label) => {
  const m = index.match(re);
  if (!m) throw new Error(`No se encontró ${label} en index.html`);
  return m[0];
};

const HEADER = grab(/<header class="site-header">[\s\S]*?<\/header>/, "la cabecera");
const FOOTER = grab(/<footer class="site-footer">[\s\S]*?<\/footer>/, "el pie");
const FAB = grab(/<a class="fab"[\s\S]*?<\/a>/, "el botón de WhatsApp");
const LIGHTBOX = grab(/<div class="lightbox" id="lightbox"[\s\S]*?\n<\/div>/, "el lightbox");

const shell = ({ title, description, slug, body, canonical }) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="theme-color" content="#f5f3f0">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="CJBR Fachadas">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="https://www.cjbrfachadas.com/assets/img/project-alea.svg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="assets/css/style.css">
</head>

<body>
<a class="skip-link" href="#main">Saltar al contenido</a>
<div class="progress-bar" aria-hidden="true"></div>

${HEADER.replace(/ aria-current="page"/g, "").replace(
  new RegExp(`(<a class="nav__link" href="${slug}")`),
  '$1 aria-current="page"'
)}

<main id="main">
${body}
</main>

${FOOTER}

${FAB}

${LIGHTBOX}

<script src="assets/js/main.js" defer></script>
</body>
</html>
`;

const PAGES_DIR = resolve(ROOT, "src/pages");
let count = 0;

for (const file of readdirSync(PAGES_DIR).filter((f) => f.endsWith(".html"))) {
  const raw = readFileSync(resolve(PAGES_DIR, file), "utf8");
  const m = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${file} no declara su bloque <!--meta ... -->`);
  const meta = JSON.parse(m[1]);
  const body = raw.slice(m[0].length).trimEnd();
  const slug = basename(file);

  writeFileSync(
    resolve(ROOT, slug),
    shell({
      title: meta.title,
      description: meta.description,
      slug,
      body,
      canonical: `https://www.cjbrfachadas.com/${slug}`,
    }),
    "utf8"
  );
  console.log("✓", slug);
  count++;
}

console.log(`\n${count} páginas construidas desde src/pages/`);
