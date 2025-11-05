
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

# Initialize embeddings ENGINES - update as needed
def get_embeddings():
    try:
        embedding = OpenAIEmbeddings()
        return embedding
    except Exception as e:
        raise RuntimeError(f"Failed to create embedding engine: {e}")

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
