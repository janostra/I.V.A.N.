import os
from dotenv import load_dotenv
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
faiss_index = None

def create_vectorstore_from_text(user_id: str, raw_text: str = ""):
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(raw_text)
    docs = [Document(page_content=chunk) for chunk in chunks]

    index = FAISS.from_documents(docs, embeddings)

    os.makedirs("data_store", exist_ok=True)
    index.save_local("data_store/")

    return {"status": "ok", "chunks": len(docs)}

def query_vectorstore(query: str):
    if not os.path.exists("data_store/index.faiss"):
        return {"error": "No hay conocimiento cargado aún"}

    # Habilitamos la deserialización peligrosa porque el índice es de confianza
    index = FAISS.load_local(
        "data_store",
        embeddings=embeddings,
        allow_dangerous_deserialization=True
    )

    results = index.similarity_search(query, k=3)
    context = "\n".join([r.page_content for r in results])
    return {"context": context}