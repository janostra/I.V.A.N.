import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
faiss_index = None

def create_vectorstore_from_text(user_id: str, raw_text: str):
    global faiss_index
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(raw_text)
    docs = [Document(page_content=chunk) for chunk in chunks]
    faiss_index = FAISS.from_documents(docs, embeddings)
    return {"status": "ok", "chunks": len(docs)}

def query_vectorstore(query: str):
    if not faiss_index:
        return {"error": "No knowledge loaded"}
    results = faiss_index.similarity_search(query, k=3)
    context = "\n".join([r.page_content for r in results])
    return {"context": context}
