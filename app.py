import streamlit as st
import base64
import os
import tempfile
import trimesh
import time

# Importamos nuestros nuevos módulos de Producción
from ai_module.classifier import predict
from ai_module.predictive_engine import LocalLLMPredictor
from geometry_engine.validator import evaluate_contract

st.set_page_config(page_title="AI-Driven 3D Conformance", layout="wide", initial_sidebar_state="expanded")

st.title("🛡️ AI-Driven 3D Conformance Gateway")
st.markdown("**La IA Propone. El Contrato Dispone.**")

# CSS para inyectar model-viewer desde el CDN de Google de forma limpia
st.markdown(
    """
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
    <style>
        model-viewer {
            width: 100%;
            height: 550px;
            background-color: #f0f2f6;
            border-radius: 8px;
        }
    </style>
    """,
    unsafe_allow_html=True
)

st.sidebar.header("1. Sube tu Asset 3D")
uploaded_file = st.sidebar.file_uploader("Arrastra un archivo .glb", type=["glb"])

col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("Visualización del Activo")
    if uploaded_file is not None:
        file_bytes = uploaded_file.getvalue()
        b64_glb = base64.b64encode(file_bytes).decode('utf-8')
        
        html_code = f'''
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
        <model-viewer 
            src="data:model/gltf-binary;base64,{b64_glb}" 
            camera-controls 
            auto-rotate 
            shadow-intensity="1">
        </model-viewer>
        '''
        st.components.v1.html(html_code, height=570)
    else:
        st.info("Sube un modelo 3D para visualizarlo interactivo.")

with col2:
    st.subheader("Inspección y Contratos")
    if uploaded_file is not None:
        
        # Validamos geometría real guardando en temp temporalmente
        with tempfile.NamedTemporaryFile(delete=False, suffix=".glb") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        
        try:
            # Cargamos la malla con Trimesh
            mesh = trimesh.load(tmp_path, process=False)
            
            st.write("### 🤖 La IA Propone")
            with st.spinner("Extrayendo Metadatos y Consultando LLM..."):
                # 1. Extracción de metadatos reales del modelo subido
                try:
                    bbox = mesh.extents.tolist() if hasattr(mesh, "extents") else [0,0,0]
                    if hasattr(mesh, "vertices"):
                        vertices = len(mesh.vertices)
                    elif hasattr(mesh, "geometry"):
                        vertices = sum([len(g.vertices) for g in mesh.geometry.values() if hasattr(g, 'vertices')])
                    else:
                        vertices = 0
                        
                    is_watertight = mesh.is_watertight if hasattr(mesh, "is_watertight") else False
                except:
                    bbox, vertices, is_watertight = [0,0,0], 0, False
                
                metadata = {
                    "bounding_box_dimensions": bbox,
                    "num_vertices": vertices,
                    "is_watertight": is_watertight
                }
                
                # 2. Intentamos Inferencia con LLM Local (Ollama)
                engine = LocalLLMPredictor(model_name="qwen2.5-coder:32b")
                proposal = engine.predict(metadata)
                
                if proposal.get("categoria_propuesta") not in ["Error", "Unknown"]:
                    prediction = proposal["categoria_propuesta"]
                    confidence = proposal.get("confianza", 0) / 100.0
                    motivo = proposal.get("motivo", "")
                    
                    st.success(f"Predicción (Ollama LLM): **{prediction}**")
                    st.info(f"Razonamiento: {motivo}")
                else:
                    # 3. Fallback al ML Clásico (Scikit-Learn) si Ollama no está disponible (ej. en la nube)
                    st.warning("No se pudo contactar a Ollama. Usando motor Random Forest de respaldo...")
                    prediction, confidence = predict(mesh)
                    st.success(f"Predicción (ML Clásico): **{prediction}**")
                
            st.metric(label="Confianza de la IA", value=f"{confidence*100:.1f}%")
                
            st.write("---")
            st.write("### 📐 El Contrato Dispone")
            st.warning(f"Aplicando Perfil de Conformidad E3C para: '{prediction}'")
            
            # Ejecutamos el Contrato Real
            is_conformant, details = evaluate_contract(mesh, prediction)
            
            if "error" in details:
                st.error(details["error"])
            else:
                # Mostramos los resultados del contrato
                for rule, data in details.items():
                    status_icon = "✅" if data["pass"] else "❌"
                    st.write(f"**{rule.replace('_', ' ').title()}**: {status_icon}")
                    if rule == "integrity_watertight":
                        st.caption(f"Requerido: {data['required']} | Pasa: {data['pass']}")
                    else:
                        st.caption(f"Valor: {data['value']} | Límite: {data['limit']}")

                st.write("---")
                if is_conformant:
                    st.success("🟢 Veredicto: ACTIVO ACEPTADO")
                    st.balloons()
                else:
                    st.error("🔴 Veredicto: ACTIVO RECHAZADO (La IA fue vetada por el contrato)")
                
        except Exception as e:
            st.error(f"Error procesando la malla: {e}")
        finally:
            os.remove(tmp_path)
    else:
        st.write("Esperando modelo...")
