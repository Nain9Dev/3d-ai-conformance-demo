import streamlit as st
import base64
import os
import tempfile
import trimesh
import time

# Importamos nuestros nuevos módulos de Producción
from ai_module.classifier import predict
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
            with st.spinner("Extrayendo Features Geométricas & ML Inferencia..."):
                # Ejecutamos el modelo ML Real
                prediction, confidence = predict(mesh)
                
            st.success(f"Predicción Categórica: **{prediction}**")
            st.metric(label="Confianza ML", value=f"{confidence*100:.1f}%")
                
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
