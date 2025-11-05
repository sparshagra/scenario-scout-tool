
# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel
# import os
# import uuid

# from loader import load_and_chunk_docs
# from vectorstore import get_vectorstore, add_documents, similarity_search
# from rag_chain import evaluate_scores_with_llm, extract_contract_highlights, generate_report

# DOCUMENTS = {}
# from dotenv import load_dotenv
# load_dotenv()

# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ---- Pydantic model for Swagger UI support ----
# class QuestionInput(BaseModel):
#     question: str

# from langchain_community.vectorstores import Chroma
# from langchain_openai import OpenAIEmbeddings
# from rag_chain import answer_doc_question

# @app.post("/document/{doc_id}/search")
# async def search_contract(doc_id: str, input: QuestionInput):
#     import traceback
#     question = input.question
#     doc_chunks = DOCUMENTS.get(doc_id)

#     if not doc_chunks or len(doc_chunks) == 0:
#         print("DEBUG: No chunks for doc_id", doc_id)
#         return JSONResponse({"error": "Document not found or empty."}, status_code=404)
#     print("DEBUG: Chunks loaded:", len(doc_chunks), type(doc_chunks[0]))

#     try:
#         assert hasattr(doc_chunks[0], "page_content"), "Chunk missing page_content"
#         embeddings = OpenAIEmbeddings()
#         chroma_vs = Chroma.from_documents(doc_chunks, embeddings)
#         top_chunks = chroma_vs.similarity_search(question, k=min(6, len(doc_chunks)))
#         print("DEBUG: Top chunks found:", len(top_chunks))
#     except Exception as e:
#         print("VECTORSTORE ERROR", traceback.format_exc())
#         return JSONResponse({"error": "Vector search failed", "detail": str(e)}, status_code=500)

#     try:
#         answer = answer_doc_question(question, top_chunks)
#     except Exception as e:
#         print("LLM ERROR", traceback.format_exc())
#         return JSONResponse({"error": "LLM QA failed", "detail": str(e)}, status_code=500)

#     return JSONResponse({
#         "answer": answer,
#         "cited_chunks": [
#             {
#                 "text": c.page_content,
#                 "metadata": getattr(c, "metadata", {})
#             } for c in top_chunks
#         ]
#     })


# @app.post("/upload")
# async def upload_project_file(file: UploadFile = File(...)):
#     os.makedirs("./backend/uploads", exist_ok=True)
#     file_path = f"./backend/uploads/{file.filename}"
#     with open(file_path, "wb") as f:
#         content = await file.read()
#         f.write(content)
#     chunks = load_and_chunk_docs(file_path)
#     vectordb = get_vectorstore()
#     add_documents(chunks, vectordb)
#     project_id = str(uuid.uuid4())
#     doc_id = str(uuid.uuid4())
#     DOCUMENTS[doc_id] = chunks
#     return {
#         "msg": f"File {file.filename} uploaded and indexed.",
#         "project_id": project_id,
#         "doc_id": doc_id
#     }

# @app.get("/dashboard/{project_id}")
# async def get_dashboard(project_id: str, mode: str = "ai"):
#     vectordb = get_vectorstore()
#     chunks = similarity_search("project overview", vectordb, k=20)
#     texts = [doc.page_content for doc in chunks]
#     if mode == "ai":
#         scores, final_score = evaluate_scores_with_llm(texts)
#     else:
#         scores = {}
#         final_score = 0
#     return JSONResponse({
#         "scores": scores,
#         "final_score": final_score,
#         "parameters": {"cost": 0.3, "timeline": 0.2, "compliance": 0.2, "design": 0.1, "sustainability": 0.2}
#     })

# @app.get("/document/{doc_id}/highlights")
# async def get_highlights(doc_id: str):
#     doc_chunks = DOCUMENTS.get(doc_id)
#     if not doc_chunks:
#         return JSONResponse({"error": "Document not found"}, status_code=404)
#     full_text = "\n\n".join(chunk.page_content for chunk in doc_chunks)
#     highlights = extract_contract_highlights(full_text)
#     return JSONResponse(highlights)

# from fastapi import Form
# @app.post("/ask")
# async def ask_whatif(question: str = Form(...)):
#     try:
#         vectordb = get_vectorstore()
#         context = similarity_search(question, vectordb)
#         texts = [doc.page_content for doc in context]
#         report = generate_report(question, texts)
#         return {"report": report}
#     except Exception as e:
#         return {"error": str(e)}

# @app.get("/about")
# async def about():
#     return {
#         "app": "Construction What-If Backend",
#         "description": "A FastAPI-powered backend for construction project queries.",
#         "author": "Divy",
#         "version": "1.0"
#     }
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import uuid

from loader import load_and_chunk_docs
from vectorstore import get_vectorstore, add_documents, similarity_search
from rag_chain import evaluate_scores_with_llm, extract_contract_highlights, generate_report

load_dotenv()

PROJECT_CHUNKS = []  # Store ALL chunks for the single project

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionInput(BaseModel):
    question: str

@app.post("/search")
async def search_contract(input: QuestionInput):
    import traceback
    question = input.question

    if not PROJECT_CHUNKS:
        return JSONResponse({"error": "No documents found in database."}, status_code=404)
    try:
        from langchain_community.vectorstores import Chroma
        from vectorstore import get_embeddings

        assert hasattr(PROJECT_CHUNKS[0], "page_content"), "Chunk missing page_content"
        embeddings = get_embeddings()
        chroma_vs = Chroma.from_documents(PROJECT_CHUNKS, embedding_function=embeddings)
        top_chunks = chroma_vs.similarity_search(question, k=min(6, len(PROJECT_CHUNKS)))
    except Exception as e:
        print("VECTORSTORE ERROR", traceback.format_exc())
        return JSONResponse({"error": "Vector search failed", "detail": str(e)}, status_code=500)

    try:
        from rag_chain import answer_doc_question
        answer, _ = answer_doc_question(question, top_chunks)  # Only use the actual answer
    except Exception as e:
        print("LLM ERROR", traceback.format_exc())
        return JSONResponse({"error": "LLM QA failed", "detail": str(e)}, status_code=500)

    # Only return the answer content
    return JSONResponse({"answer": answer})



@app.post("/upload")
async def upload_project_file(file: UploadFile = File(...)):
    os.makedirs("./backend/uploads", exist_ok=True)
    file_path = f"./backend/uploads/{file.filename}"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    chunks = load_and_chunk_docs(file_path)
    vectordb = get_vectorstore()
    add_documents(chunks, vectordb)
    PROJECT_CHUNKS.extend(chunks)
    doc_id = str(uuid.uuid4())
    return {
        "msg": f"File {file.filename} uploaded and indexed.",
        "doc_id": doc_id  # just for reference, not used for lookup
    }

@app.get("/dashboard")
async def get_dashboard(mode: str = "ai"):
    if not PROJECT_CHUNKS:
        return JSONResponse({"error": "No documents to score."}, status_code=404)
    if mode == "ai":
        scores, final_score = evaluate_scores_with_llm(PROJECT_CHUNKS)
    else:
        scores = {}
        final_score = 0
    return JSONResponse({
        "scores": scores,
        "final_score": final_score,
        "parameters": {"cost": 0.3, "timeline": 0.2, "compliance": 0.2, "design": 0.1, "sustainability": 0.2}
    })

@app.get("/highlights")
async def get_highlights():
    if not PROJECT_CHUNKS:
        return JSONResponse({"error": "No documents found"}, status_code=404)
    full_text = "\n\n".join(chunk.page_content for chunk in PROJECT_CHUNKS)
    highlights = extract_contract_highlights(full_text)
    return JSONResponse(highlights)

@app.post("/ask")
async def ask_whatif(question: str = Form(...)):
    try:
        vectordb = get_vectorstore()
        context = similarity_search(question, vectordb)
        texts = [doc.page_content for doc in context]
        report = generate_report(question, texts)
        return {"report": report}
    except Exception as e:
        return {"error": str(e)}

@app.get("/about")
async def about():
    return {
        "app": "Construction What-If Backend",
        "description": "A FastAPI-powered backend for construction project queries.",
        "author": "Divy",
        "version": "1.0"
    }
