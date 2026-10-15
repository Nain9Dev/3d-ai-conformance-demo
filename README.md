# Nain3D Gateway · 3D AI Conformance Engine

[![Live Demo](https://img.shields.io/badge/Live%20Demo-3d.naindev.com-0284c7?style=flat-square&logo=google-chrome&logoColor=white)](https://3d.naindev.com/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Pydantic v2](https://img.shields.io/badge/Pydantic-v2.10-E92063?logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-informational)](LICENSE)

Motor de validación determinista de activos 3D (GLB/glTF) y pasarela de clasificación de IA, fundamentado en el principio rector:

> **"La IA propone, el contrato dispone."**  
> *(The AI proposes, the technical contract decides.)*

El subsistema de Inteligencia Artificial predice la categoría candidata y su nivel de confianza. El motor geométrico determinista evalúa el modelo contra límites matemáticos estrictos (densidad de polígonos, escala métrica, solidez hermética y micro-caras degeneradas). **Bajo ninguna circunstancia la predicción de una IA puede anular o vetar un contrato técnico fallido.**

Forma parte del portafolio técnico de [naindev.com](https://www.naindev.com) bajo la marca **Nain3D**.

---

## Qué se puede comprobar en 60 segundos

| Quiero… | Dónde |
|:---|:---|
| **Explorar el visor 3D interactivo** | Demo en vivo en [https://3d.naindev.com](https://3d.naindev.com) o local en `http://localhost:5376` (inspección 3D orbital, subida drag-and-drop y veredictos en tiempo real) |
| **Consultar la documentación OpenAPI** | [Scalar API Reference](http://localhost:8104/docs) en `/docs` |
| **Probar modelos sintéticos sin archivos** | Drawer integrado con 4 modelos de referencia (Monitor, Silla, Válvula Industrial y Silla Gigante No Conforme) |
| **Verificar la suite de pruebas** | `pytest tests/ -v` (9/9 pruebas unitarias y de integración pasando) |
| **Entender la gobernanza** | [AGENTS.md](AGENTS.md) y [docs/01-architecture.md](docs/01-architecture.md) |

---

## Arquitectura

```text
Browser Client (Vue 3 + TypeScript + Google <model-viewer> en puerto 5376)
  │
  ├── Reverse Proxy (Vite Dev Server) -> http://localhost:8104
  │
FastAPI Host (Uvicorn en puerto 8104)
  ├── Scalar OpenAPI Documentation (/docs)
  ├── Sondas de salud (/health, /health/ready)
  └── Conformance API (/api/v1/conformance/...)
        │
        ├── Subsistema de Clasificación IA (Random Forest + Fallback Ollama LLM)
        │     └── Propuesta de categoría y confianza ("La IA Propone")
        │
        └── Motor Geométrico Determinista (Trimesh & NumPy)
              ├── Extracción de características (triángulos, vértices, bounding box, hermeticidad)
              ├── Evaluación de reglas técnicas por perfil
              └── Agregador de veredicto Fail-Closed ("El Contrato Dispone")
```

---

## Contratos y Perfiles de Conformidad

| Perfil | Categoría | Presupuesto Triángulos | Dimensión Máxima | Hermeticidad Requerida |
|:---|:---|:---:|:---:|:---:|
| `monitor-std-01` | Monitor | 25.000 | 2.5 m | No |
| `furniture-chair-01` | Mobiliario (Chair) | 50.000 | 3.0 m | No |
| `industrial-part-01` | Pieza Industrial | 100.000 | 1.2 m | **Sí (Bloqueante)** |
| `prop-decor-01` | Prop / Decorativo | 35.000 | 4.0 m | No |

---

## Ejecución Local

### 1. Iniciar Backend (FastAPI en puerto 8104)

```powershell
.\.venv\Scripts\uvicorn src.nain3d.main:app --port 8104 --reload
```

Acceso a la documentación interactiva en: [http://localhost:8104/docs](http://localhost:8104/docs)

### 2. Iniciar Cliente (Vue 3 en puerto 5376)

```powershell
cd Nain3D.Client
npm install
npm run dev
```

Acceso a la interfaz gráfica en: [http://localhost:5376](http://localhost:5376)

### 3. Ejecutar Pruebas Automatizadas

```powershell
.\.venv\Scripts\pytest tests/ -v
npm --prefix Nain3D.Client run build
```

---

## Autor

**Aitor Nain Mendoza Vallejo (`NainDev`)**  
Full Stack Architect & 3D Software Engineer  
[naindev.com](https://www.naindev.com) · contact@naindev.com
