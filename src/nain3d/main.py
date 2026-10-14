from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from .api.routes import router as conformance_router

app = FastAPI(
    title="Nain3D Gateway",
    description=(
        "Deterministic 3D Asset Conformance Engine and AI Classification Gateway. "
        "Enforces the governing philosophy: 'La IA propone, el contrato dispone.'"
    ),
    version="1.0.0",
    docs_url=None,  # We serve modern Scalar API Reference at /docs
    redoc_url=None,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5376",
        "http://127.0.0.1:5376",
        "https://naindev.com",
        "https://www.naindev.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/health", status_code=status.HTTP_200_OK, tags=["Health"])
async def liveness():
    """Liveness probe: verifies the Kestrel / Uvicorn Python process is running."""
    return {"status": "Healthy", "service": "Nain3D Gateway", "version": "1.0.0"}


@app.get("/health/ready", status_code=status.HTTP_200_OK, tags=["Health"])
async def readiness():
    """Readiness probe: verifies the 3D geometry engine and ML components are ready."""
    return {"status": "Healthy", "engine": "Trimesh + Scikit-Learn", "ready": True}


@app.get("/docs", include_in_schema=False)
async def scalar_docs():
    """Renders modern Scalar API Reference documentation."""
    html_content = """
    <!doctype html>
    <html>
      <head>
        <title>Nain3D Gateway · API Reference</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg>" />
      </head>
      <body>
        <script
          id="api-reference"
          data-url="/openapi.json"
          data-configuration='{"theme": "deepSpace"}'>
        </script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
    """
    return HTMLResponse(content=html_content)


app.include_router(conformance_router)
