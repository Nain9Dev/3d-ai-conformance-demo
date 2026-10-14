import requests
import json
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

class LocalLLMPredictor:
    def __init__(self, host="http://localhost:11434", model_name="qwen2.5-coder:32b"):
        """
        Inicializa el motor predictivo conectado a Ollama local.
        """
        self.endpoint = f"{host}/api/generate"
        self.model_name = model_name
        self.taxonomy = ["Monitor", "Laptop", "Motherboard", "Peripheral", "Unknown"]

    def create_prompt(self, mesh_metadata):
        """
        Aplica Prompt Engineering estricto para delimitar la taxonomía (Fix del Bug).
        """
        prompt = f"""
        You are a strict 3D industrial asset classifier.
        Classify the object based ONLY on the following geometric metadata:
        {json.dumps(mesh_metadata, indent=2)}

        RULES:
        1. You must classify the object into EXACTLY ONE of these categories: {self.taxonomy}
        2. If the geometric metadata doesn't clearly match any category, you MUST return "Unknown".
        3. Do NOT invent new categories. 
        4. Return ONLY a valid JSON object, without any markdown formatting, following this exact schema:
           {{
             "categoria_propuesta": "CategoryName",
             "confianza": 85,
             "motivo": "Brief technical explanation based on the metadata"
           }}
        """
        return prompt.strip()

    def predict(self, mesh_metadata):
        """
        Llama al endpoint de Ollama y fuerza la salida en JSON.
        """
        prompt = self.create_prompt(mesh_metadata)
        
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "format": "json", # Fuerza a Ollama a devolver un JSON parseable
            "stream": False,
            "options": {
                "temperature": 0.1 # Temperatura baja para máxima consistencia y cero alucinaciones
            }
        }

        try:
            response = requests.post(self.endpoint, json=payload, timeout=120)
            response.raise_for_status()
            
            # Extraer el texto generado por Ollama
            result_text = response.json().get("response", "")
            
            # Parsear el JSON devuelto
            prediction_data = json.loads(result_text)
            
            # Validar que la categoría esté dentro de la taxonomía (Contrato Defensivo en Capa IA)
            if prediction_data.get("categoria_propuesta") not in self.taxonomy:
                prediction_data["categoria_propuesta"] = "Unknown"
                prediction_data["motivo"] = "LLM Hallucination prevented by defensive taxonomy."

            return prediction_data

        except requests.exceptions.RequestException as e:
            error_details = ""
            if hasattr(e, 'response') and e.response is not None:
                error_details = e.response.text
            logging.error(f"Error de conexión con Ollama en {self.endpoint}: {e} - Detalles: {error_details}")
            return {"categoria_propuesta": "Error", "confianza": 0, "motivo": str(e)}
        except json.JSONDecodeError as e:
            logging.error(f"Ollama no devolvió un JSON válido: {e}\nRespuesta cruda: {result_text}")
            return {"categoria_propuesta": "Unknown", "confianza": 0, "motivo": "JSON parsing error"}

def validate_llm_proposal(proposal):
    """
    Simulación del inicio del "Contrato Dispone".
    Recibe el JSON parseado y decide si iniciar la validación geométrica pesada.
    """
    logging.info(f"--- Inicio del Contrato ---")
    categoria = proposal.get("categoria_propuesta")
    confianza = proposal.get("confianza", 0)
    
    if categoria in ["Unknown", "Error"]:
        logging.warning("Contrato abortado: La IA no pudo clasificar el activo de forma segura.")
        return False
        
    if confianza < 70:
        logging.warning(f"Contrato abortado: La confianza de la IA es muy baja ({confianza}%).")
        return False
        
    logging.info(f"Contrato aceptado para perfil '{categoria}'. Motivo IA: {proposal.get('motivo')}")
    logging.info("Iniciando validación geométrica determinista (Trimesh)...")
    return True

if __name__ == "__main__":
    # Dummy Data: Simulamos la extracción geométrica de un Monitor
    dummy_metadata = {
        "bounding_box_mm": [1920, 1080, 50],
        "num_vertices": 4500,
        "aspect_ratio": "16:9",
        "is_watertight": False
    }

    print("Iniciando Motor Predictivo Local (Ollama: qwen2.5-coder:32b)")
    engine = LocalLLMPredictor(model_name="qwen2.5-coder:32b")
    
    print("\nEnviando metadata 3D a la IA...")
    proposal_json = engine.predict(dummy_metadata)
    
    print("\nPropuesta cruda de la IA (JSON):")
    print(json.dumps(proposal_json, indent=2, ensure_ascii=False))
    
    print("\nEvaluando el Contrato:")
    validate_llm_proposal(proposal_json)
