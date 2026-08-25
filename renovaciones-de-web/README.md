# Renovaciones de Web

Colección de rediseños de webs reales, hechos como piezas de portafolio.

Cada carpeta es un proyecto independiente y autocontenido: se toma una web
pública que funciona pero que se ha quedado atrás, y se rehace el front-end
entero — contenido, sistema de diseño, accesibilidad, rendimiento y SEO — sin
inventar la empresa que hay detrás.

## Proyectos

| Proyecto | Web original | Sector | Estado |
|---|---|---|---|
| [`Web_de_fachadas/`](Web_de_fachadas/) | cjbrfachadas.com | Construcción · fachadas ventiladas | ✅ Terminado |

## Reglas de la colección

Para que los proyectos se puedan comparar entre sí, todos siguen las mismas
reglas:

1. **La empresa es real, el contenido es fiel.** Se parte de la información
   pública de la empresa (servicios, datos de contacto, obras). Lo que sea
   estimación o relleno se marca como tal en el README del proyecto.
2. **Autocontenido.** El proyecto se abre con doble clic en `index.html` o con
   un servidor estático. Nada de pasos de instalación para *ver* el resultado.
3. **Sin dependencias en producción.** Ninguna librería de terceros llega al
   navegador del visitante. Las herramientas de desarrollo (build, generación de
   arte, capturas) viven en `tools/` y no se despliegan.
4. **Sin fotografía de stock.** O se usa material real de la empresa, o se
   genera arte propio. Nunca una foto genérica con marca de agua.
5. **Claro y oscuro.** Los dos temas se diseñan, no se improvisan.
6. **Accesible de serie.** Navegación por teclado, foco visible, `aria-*` donde
   toca y respeto por `prefers-reduced-motion`.
7. **Cada proyecto se explica solo.** Su `README.md` cuenta qué se rediseñó,
   qué decisiones se tomaron y qué quedaría pendiente para producción.

## Añadir un proyecto nuevo

```bash
cp -r _plantilla "Nombre_del_proyecto"
```

Después: rellena el `README.md` de la plantilla, monta el sitio dentro y añade
la fila correspondiente a la tabla de arriba.

## Estructura

```
Renovaciones de Web/
├── README.md              Este índice
├── _plantilla/            Esqueleto para un proyecto nuevo
└── Web_de_fachadas/       Rediseño de cjbrfachadas.com
```
