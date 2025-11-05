
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import uuid
from dotenv import load_dotenv
from loader import load_and_chunk_docs
from vectorstore import get_vectorstore, add_documents, similarity_search
from rag_chain import QuestionRequest, evaluate_scores_with_llm, extract_contract_highlights, generate_report, answer_doc_question, rag_loop


load_dotenv()
PROJECT_CHUNKS = []

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
        from langchain_openai import OpenAIEmbeddings
        assert hasattr(PROJECT_CHUNKS[0], "page_content"), "Chunk missing page_content"
        embeddings = OpenAIEmbeddings()
        chroma_vs = Chroma.from_documents(PROJECT_CHUNKS, embeddings)
        top_chunks = chroma_vs.similarity_search(question, k=min(6, len(PROJECT_CHUNKS)))
    except Exception as e:
        print("VECTORSTORE ERROR", traceback.format_exc())
        return JSONResponse({"error": "Vector search failed", "detail": str(e)}, status_code=500)
    try:
        answer, _ = answer_doc_question(question, top_chunks)
    except Exception as e:
        print("LLM ERROR", traceback.format_exc())
        return JSONResponse({"error": "LLM QA failed", "detail": str(e)}, status_code=500)
    answer, _ = answer_doc_question(question, top_chunks)
    import json
    try:
        answer_json = json.loads(answer)
        return JSONResponse(answer_json)
    except Exception:
        return JSONResponse({"answer": answer})


@app.post("/upload")
async def upload_project_file(file: UploadFile = File(...)):
    try:
        os.makedirs("./backend/uploads", exist_ok=True)
        file_path = f"./backend/uploads/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        chunks = load_and_chunk_docs(file_path)
        vectordb = get_vectorstore()
        add_documents(chunks, vectordb)
        PROJECT_CHUNKS.extend(chunks)
        doc_id = str(uuid.uuid4())
        return {
            "msg": f"File {file.filename} uploaded and indexed.",
            "doc_id": doc_id
        }
    except Exception as e:
        return JSONResponse({"error": f"Upload failed: {str(e)}"}, status_code=500)

@app.get("/highlights")
async def get_highlights():
    if not PROJECT_CHUNKS:
        return JSONResponse({"error": "No documents found"}, status_code=404)
    try:
        full_text = "\n\n".join(chunk.page_content for chunk in PROJECT_CHUNKS)
        highlights = extract_contract_highlights(full_text)
        return JSONResponse(highlights.dict())
    except Exception as e:
        return JSONResponse({"error": f"Highlights error: {str(e)}"}, status_code=500)

@app.get("/dashboard")
async def get_dashboard(mode: str = "ai"):
    if not PROJECT_CHUNKS:
        return JSONResponse({"error": "No documents to score."}, status_code=404)
    try:
        if mode == "ai":
            # Unpack all five outputs as per your new rag_chain.py
            scores, final_score, strength, weakness, next_steps = evaluate_scores_with_llm(PROJECT_CHUNKS)
        else:
            scores = {}
            final_score = 0
            strength = {"what": "", "why": ""}
            weakness = {"what": "", "why": ""}
            next_steps = []
        return JSONResponse({
            "scores": scores,
            "final_score": final_score,
            "strength": strength.dict() if hasattr(strength, "dict") else strength,
            "weakness": weakness.dict() if hasattr(weakness, "dict") else weakness,
            "next_steps": [ns.dict() if hasattr(ns, "dict") else ns for ns in next_steps],
            "parameters": {"cost": 0.3, "timeline": 0.2, "compliance": 0.2, "design": 0.1, "sustainability": 0.2}
        })
    except Exception as e:
        return JSONResponse({"error": f"Dashboard error: {str(e)}"}, status_code=500)



@app.post("/ask")

async def ask_whatif(question: str = Form(...)):
    try:
        vectordb = get_vectorstore()
        report = rag_loop(question, vectordb)
        return report
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=10000)
