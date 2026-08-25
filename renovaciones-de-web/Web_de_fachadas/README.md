# Web_de_fachadas — rediseño de cjbrfachadas.com

Rediseño completo del front-end de **CJBR Fachadas S.L.** (Madrid), empresa de
instalación de fachadas ventiladas y cerramientos de edificación.

Proyecto de portafolio: se reconstruye la web pública partiendo de la información
real de la empresa, con un lenguaje visual propio, sin dependencias en producción
y sin fotografía de stock.

---

## Qué incluye

| Página | Contenido |
|---|---|
| `index.html` | Portada: hero, servicios, sección constructiva interactiva, materiales, proyectos, cifras, proceso, calculadora, testimonios, FAQ y contacto |
| `servicios.html` | Las cinco líneas de trabajo en detalle + tabla comparativa de materiales |
| `proyectos.html` | Galería filtrable de 9 obras con ficha técnica en diálogo modal |
| `empresa.html` | Historia, valores, trayectoria, sectores y ficha societaria |
| `contacto.html` | Datos directos, mapa y formulario validado |
| `legal.html` | Aviso legal, privacidad y cookies |
| `404.html` | Página de error |

## Decisiones de diseño

**Cero dependencias en el navegador.** No hay React, ni Bootstrap, ni jQuery:
HTML, CSS y ~450 líneas de JavaScript sin librerías. La web carga en un par de
peticiones y funciona sin JS (el menú, los enlaces y el contenido siguen siendo
accesibles; sólo se pierden las mejoras).

**Sistema de diseño con tokens.** Escala tipográfica fluida (`clamp`), ritmo
espacial, paleta doble (claro/oscuro) y curvas de animación viven en variables
CSS en `assets/css/style.css`. Cambiar el acento de toda la web es cambiar una
línea.

**Tema claro y oscuro reales.** Respeta `prefers-color-scheme` y permite
alternar manualmente; la elección se recuerda en `localStorage`.

**Imágenes generadas, no de stock.** Todo el material gráfico son SVG
procedurales creados por `tools/generate-art.mjs`: alzados de fachada con
despiece de bandejas, huecos, coronación, volumen en escorzo y escala humana.
Son deterministas (mismo `seed`, mismo dibujo), pesan pocos KB y escalan sin
pérdida. Sustituirlos por fotografía real de obra es cambiar el `src`.

**El contenido explica el oficio.** La sección constructiva interactiva
(seis capas, de muro soporte a revestimiento) y la calculadora orientativa de
coste convierten la web en una herramienta, no en un folleto.

**Accesibilidad.** Enlace de salto, foco visible, `aria-*` en pestañas,
acordeón, diálogo y formulario, contraste verificado en ambos temas y respeto
por `prefers-reduced-motion`.

**SEO técnico.** Metadatos por página, Open Graph, datos estructurados
`GeneralContractor` en JSON-LD, `sitemap.xml`, `robots.txt` y manifest.

## Estructura

```
Web_de_fachadas/
├── index.html              Portada (escrita a mano; es la fuente del "chrome")
├── servicios.html …        Páginas generadas por tools/build.mjs
├── src/pages/*.html        Fragmentos de contenido de cada página
├── assets/
│   ├── css/style.css       Sistema de diseño completo
│   ├── js/main.js          Interacción (sin dependencias)
│   └── img/*.svg           Arte generado
└── tools/
    ├── generate-art.mjs    Genera las ilustraciones SVG
    ├── build.mjs           Inyecta cabecera/pie en cada página
    └── shots.mjs           Capturas de verificación con Playwright
```

La cabecera, el pie, el botón de WhatsApp y el diálogo de proyecto se escriben
**una sola vez** (en `index.html`) y `tools/build.mjs` los inyecta en el resto de
páginas, de modo que la navegación nunca se desincroniza.

## Cómo trabajar con él

```bash
# Servir en local (no necesita nada instalado salvo Python)
npm run dev            # http://localhost:4321

# Regenerar arte y páginas tras editar src/pages/ o index.html
npm run build

# Capturas de verificación en claro/oscuro y móvil (requiere Playwright)
npm install
npm run shots
```

> Editar `servicios.html`, `proyectos.html`, `empresa.html`, `contacto.html`,
> `legal.html` o `404.html` directamente **no sirve**: los regenera el build.
> El contenido de esas páginas está en `src/pages/`.

## Publicación

Es un sitio estático: vale cualquier hosting. Para GitHub Pages, el `.nojekyll`
ya está puesto; basta con apuntar Pages a esta carpeta.

## Pendiente si se lleva a producción

- Sustituir el arte SVG por fotografía real de obra (mismo `src`, mismo tamaño).
- Conectar el formulario a un endpoint real; ahora compone un `mailto:`
  con los datos ya rellenados.
- Revisar los textos legales con asesoría y confirmar las cifras de la home
  (m² instalados, % de obras en plazo) con la empresa.

## Datos de la empresa

Información pública: CJBR Fachadas S.L., CIF B88462254, constituida el
9 de agosto de 2019, C/ Pobladura del Valle 5, 9ºA, 28037 Madrid,
teléfono 91 421 32 51, presupuestos@cjbrfachadas.com, 17 personas en plantilla.
Las cifras de superficie instalada y porcentaje de obras en plazo son
**estimaciones de demostración** y deben confirmarse antes de publicar.
