from fastapi import FastAPI, Body
from rag_engine import create_vectorstore_from_text, query_vectorstore
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambiar si se necesita seguridad
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/rag/upload-text")
def upload_text(user_id: str = Body(...), text: str = Body(...)):
    result = create_vectorstore_from_text(user_id, text)
    return result

@app.post("/rag/query")
def query_knowledge(query: str = Body(..., embed=True)):
    result = query_vectorstore(query)
    return result
