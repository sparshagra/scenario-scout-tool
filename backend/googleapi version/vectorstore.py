
from langchaincommunity.vectorstores import Chroma
from langchaincore.documents import Document
from google import genai
import os

def get_embeddings():
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    def embed(texts):
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=[{"content": t} for t in texts]
        )
        # result.embeddings is a list of objects with 'values'
        return [e.values for e in result.embeddings]
    return embed


def get_vectorstore(persist_directory="/tmp/chroma_store"):
    """
    Returns a Chroma vectorstore instance (persistent on disk in /tmp/chroma_store by default).
    """
    try:
        vectorstore = Chroma(
            embedding_function=get_embeddings(),
            persist_directory=persist_directory
        )
        return vectorstore
    except Exception as e:
        raise RuntimeError(f"Vectorstore initialization failed: {e}")

def add_documents(chunks, vectorstore):
    """
    Add document chunks to the vectorstore.
    chunks: list of langchain Document objects (from loader.py).
    """
    try:
        vectorstore.add_documents(chunks)
    except Exception as e:
        raise RuntimeError(f"Failed to add documents to vectorstore: {e}")

def similarity_search(query, vectorstore, k=5):
    """
    Search the vectorstore for top-k similar chunks for the given query.
    Returns a list of Document objects.
    """
    try:
        docs = vectorstore.similarity_search(query, k=k)
        if not docs:
            raise ValueError("No relevant context found in the knowledge base.")
        return docs  # <-- Just return the list of Document objects!
    except Exception as e:
        raise RuntimeError(f"Error in vectorstore similarity search: {e}")
