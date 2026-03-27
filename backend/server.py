from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import requests
import json
import os
from sentence_transformers import SentenceTransformer

app = FastAPI(title="Customer 360 RAG API (Numpy Vector Store)")

# Setup CORS for local frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Embeddings & Documents into memory
BASE_DIR = os.path.dirname(__file__)
EMB_PATH = os.path.join(BASE_DIR, "embeddings.npy")
DOC_PATH = os.path.join(BASE_DIR, "documents.json")

try:
    print("Loading 10K embeddings into RAM...")
    doc_embeddings = np.load(EMB_PATH)
    with open(DOC_PATH, "r", encoding="utf-8") as f:
        documents = json.load(f)
    print("Loading Sentence Transformer...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    is_ready = True
except Exception as e:
    is_ready = False
    print(f"Warning: Could not load embeddings. Run ingest.py first. Error: {e}")

# Request Model
class QueryRequest(BaseModel):
    query: str
    top_k: int = 5

def query_ollama(prompt: str) -> str:
    OLLAMA_URL = "http://localhost:11434/api/generate"
    payload = {
        "model": "qwen2.5-coder:7b",
        "prompt": prompt,
        "stream": False
    }
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=25)
        response.raise_for_status()
        result = response.json()
        return result.get("response", "")
    except requests.exceptions.ConnectionError:
        return "⚠️ Could not connect to Ollama. Ensure Ollama is running and qwen2.5-coder:7b is installed locally."
    except requests.exceptions.Timeout:
        return "⏳ Ollama generation timed out (CPU inference took >25s). Reducing context window might help."
    except Exception as e:
        print(f"Ollama Error: {e}")
        return f"Warning: Could not connect to local Ollama LLM. Raw context retrieved.\n\nError: {e}"

@app.post("/api/chat")
def chat_rag(request: QueryRequest):
    if not is_ready:
        raise HTTPException(status_code=500, detail="Vector store not initialized. Run ingest.py")
        
    try:
        # 1. Embed query
        query_embedding = model.encode(request.query)
        
        # 2. Compute Cosine Similarity (dot product since all-MiniLM normalizes to unit length, or we just do dot product and sort)
        # For normalized vectors, dot product equals cosine similarity. Let's normalize just in case.
        q_norm = query_embedding / np.linalg.norm(query_embedding)
        d_norm = doc_embeddings / np.linalg.norm(doc_embeddings, axis=1, keepdims=True)
        similarities = np.dot(d_norm, q_norm)
        
        # 3. Get Top-K indices
        top_k_indices = np.argsort(similarities)[::-1][:request.top_k]
        
        # 4. Build Context
        retrieved_docs = [documents[i] for i in top_k_indices]
        context = "\n\n---\n\n".join(retrieved_docs)

        # 5. Construct LLM Prompt
        system_prompt = (
            "You are a helpful Customer Intelligence Data Assistant for a dashboard managing 10,000 customers. "
            "You have retrieved the following Customer Profiles from the database that match the user's query.\n\n"
            "CONTEXT PROFILES:\n"
            f"{context}\n\n"
            "INSTRUCTIONS:\n"
            "1. Answer the user's question accurately using ONLY the context provided above.\n"
            "2. If the context does not contain the complete answer, synthesize what you DO have and state you only have partial info.\n"
            "3. Format your answers clearly with bullet points. Cite specific customer names and IDs when relevant.\n\n"
            f"USER QUERY: {request.query}\n\n"
            "ANSWER:"
        )

        # 6. Ask LLM
        answer = query_ollama(system_prompt)
        
        return {
            "answer": answer,
            "context": retrieved_docs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
