
import os
import json
import re
from typing import List, Optional, Dict, Any, Set
from pydantic import BaseModel, ValidationError, Field
from langchain_openai import ChatOpenAI
from typing import Tuple
# --- Pydantic Models ---

class DocChunk(BaseModel):
    page_content: str

class ScoreItem(BaseModel):
    parameter: str
    score: float
    why: str

class StrengthWeakness(BaseModel):
    what: str
    why: str

class NextStep(BaseModel):
    step: str
    why: str
    impact: str
    how_it_helps: str

class EvaluationOutput(BaseModel):
    scores: List[ScoreItem]
    strength: StrengthWeakness
    weakness: StrengthWeakness
    next_steps: List[NextStep]

class HighlightRisk(BaseModel):
    text: str
    explanation: Optional[str] = None
    risk_flag: Optional[str] = None

class ContractHighlightsRisks(BaseModel):
    highlights: List[HighlightRisk] = Field(default_factory=list)
    risks: List[HighlightRisk] = Field(default_factory=list)

qa_history: List[Dict[str, str]] = []
qa_summary: Optional[str] = None

report_history: List[Dict[str, str]] = []
report_summary: Optional[str] = None

# --- RAG and Document Searching ---
def summarize_history(history: List[Dict[str, str]], model="gpt-4.1-mini", max_tokens=200) -> str:
    history_text = "\n".join(f"{m['role']}: {m['content']}" for m in history)
    prompt = f"""Summarize the following chat history in under 150 tokens, keeping key questions, decisions, and context for the next LLM turn. No fluff:
{history_text}
"""
    llm = ChatOpenAI(model=model, temperature=0.1, max_tokens=max_tokens)
    response = llm.invoke([{"role": "user", "content": prompt}])
    return response.content.strip()

def rag_search(query: str, vectorstore, k: int = 4) -> List[DocChunk]:
    # vectorstore.similarity_search returns objects with .page_content
    relevant_chunks = vectorstore.similarity_search(query, k=k)
    # Validate and wrap results with Pydantic
    return [DocChunk(page_content=chunk.page_content) for chunk in relevant_chunks]

# --- Q&A with Context Chunks ---

def answer_doc_question(
    user_query: str,
    context_chunks: List[DocChunk],
    chat_summary: Optional[str] = None
) -> Tuple[str, List[DocChunk]]:
    # Ensure the chunks are DocChunk and have heading/line info if possible
    context_chunks = [DocChunk(**chunk.dict()) for chunk in context_chunks]

    references = []
    for i, chunk in enumerate(context_chunks):
        heading = (chunk.heading or "Unknown Section") if hasattr(chunk, "heading") else "Unknown Section"
        line = chunk.line_number if hasattr(chunk, "line_number") and chunk.line_number is not None else "-"
        ref = f"[CHUNK {i+1} | {heading}] (Line {line})\n{chunk.page_content.strip()}"
        references.append(ref)
    context_section = "\n\n".join(references)

    summary_block = f"Previous chat summary:\n{chat_summary}\n" if chat_summary else ""
    prompt = f"""
You are a contract Q&A AI.

Based only on these labeled document sections, answer the user's question clearly and concisely.
- For each fact or quote used, cite the exact [CHUNK X | Section Title] and line number.
- In the citations field, match fact/quote to the chunk/heading/line.

User question: {user_query}

Labeled relevant context:
{context_section}

Return JSON:
{{
  "answer": "...",
  "citations": [
    {{"chunk": "CHUNK 3", "heading": "Project Overview", "line": 52, "quote": "..."}},
    ...
  ]
}}
Strict rules: Only return JSON, always attach the heading/section and line for each citation.
"""
    llm = ChatOpenAI(model="gpt-4", temperature=0.1, max_tokens=600)
    response = llm.invoke([{"role": "user", "content": prompt}])
    return response.content, context_chunks

# --- Highlights and Risk Extraction ---

def extract_contract_highlights(document_text: str) -> ContractHighlightsRisks:
    prompt = f"""
You are a top-tier contract analysis and compliance AI.

For the document below, perform TWO distinct tasks and format the result as JSON with two keys: "highlights" and "risks".

1. **Project Key Terms, Obligations, Deadlines**:
    - Find and list every major clause, deadline, party obligation, payment term, approval requirement, and milestone.
    - For each, include a concise explanation ("explanation") of why it's important to the project or parties (in simple English).

2. **Compliance Risks**:
    - Scan the text for missing mandatory clauses, unclear obligations, penalties, potential loopholes, or ambiguous timelines.
    - For each risk/issue, provide ("risk_flag") a clear, specific reason why it represents a compliance or legal risk.

Respond using this JSON structure:
{{
  "highlights": [
     {{"text": "...", "explanation": "..."}},
     ...
  ],
  "risks": [
     {{"text": "...", "risk_flag": "..."}},
     ...
  ]
}}

CONTRACT DOCUMENT:
{document_text}
"""
    llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.2, max_tokens=1500)
    response = llm.invoke([{"role": "user", "content": prompt}])

    m = re.search(r"\{[\s\S]+\}", response.content if hasattr(response, 'content') else response)
    parsed = json.loads(m.group()) if m else {"highlights": [], "risks": []}

    # Validate with Pydantic
    return ContractHighlightsRisks(**parsed)

# --- Score, Strength, Weakness, Next Steps ---

SCORING_PARAMS = ["cost", "timeline", "compliance", "design", "sustainability"]
PARAM_WEIGHTS = {
    "cost":       {"self": 0.5, "timeline": 0.2, "safety": 0.15, "compliance": 0.1, "design": 0.05},
    "timeline":   {"self": 0.5, "design": 0.2, "compliance": 0.15, "safety": 0.1, "cost": 0.05},
    "safety":     {"self": 0.5, "compliance": 0.2, "design": 0.15, "cost": 0.1, "timeline": 0.05},
    "compliance": {"self": 0.5, "design": 0.2, "timeline": 0.15, "safety": 0.1, "cost": 0.05},
    "design":     {"self": 0.5, "compliance": 0.2, "timeline": 0.15, "cost": 0.1, "safety": 0.05},
}
WEIGHTS = {"cost": 0.3, "timeline": 0.2, "compliance": 0.2, "design": 0.1, "sustainability": 0.2}

def evaluate_scores_with_llm(doc_chunks: List[DocChunk]) -> Tuple[Dict[str, Any], float, StrengthWeakness, StrengthWeakness, List[NextStep]]:
    context_text = "\n\n".join(chunk.page_content for chunk in doc_chunks)
    prompt = f"""
You are a senior construction consultant.
Based on the following document context, rate the project on these parameters—cost, timeline, compliance, design, safety, sustainability (1=worst, 5=best).
For each, respond in JSON:
{{
  "parameter": "...",
  "score": ...,
  "why": "..."
}}
Make sure your explanations quote supporting evidence from the context.

Then, also provide:
  - "strength": {{"what": "...", "why": "..."}}
  - "weakness": {{"what": "...", "why": "..."}}
  - "next_steps": [
      {{"step": "...", "why": "...", "impact": "...", "how_it_helps": "..."}},
      ...
    ] (3 concrete actions for improvement)

Structure your response as a JSON object with the following top-level keys:
'scores', 'strength', 'weakness', 'next_steps'

Context:
{context_text}
"""
    llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.2, max_tokens=1200)
    response = llm.invoke([{"role": "user", "content": prompt}])

    match = re.search(r"\{[\s\S]+\}", response.content if hasattr(response, 'content') else response)
    raw_json = json.loads(match.group()) if match else {}

    # Validate and parse with Pydantic
    try:
        output = EvaluationOutput.parse_obj(raw_json)
    except ValidationError as ve:
        # Fallback: preserve everything, fill missing with defaults
        output = EvaluationOutput(
            scores=[ScoreItem(parameter=k, score=3, why="Malformed response") for k in SCORING_PARAMS],
            strength=StrengthWeakness(what="", why=""),
            weakness=StrengthWeakness(what="", why=""),
            next_steps=[]
        )

    # Score calculation as before
    raw_scores = {item.parameter: {"score": item.score, "why": item.why} for item in output.scores}
    for key in ["cost", "timeline", "compliance", "design", "sustainability", "safety"]:
        if key not in raw_scores:
            raw_scores[key] = {"score": 3, "why": "Insufficient evidence in documents."}
    results = {}
    for param in SCORING_PARAMS:
        w = PARAM_WEIGHTS.get(param, {})
        score = (
            w.get("self", 0.5) * raw_scores[param]["score"] +
            w.get("timeline", 0) * raw_scores.get("timeline", {}).get("score", 3) +
            w.get("cost", 0) * raw_scores.get("cost", {}).get("score", 3) +
            w.get("compliance", 0) * raw_scores.get("compliance", {}).get("score", 3) +
            w.get("design", 0) * raw_scores.get("design", {}).get("score", 3) +
            w.get("safety", 0) * raw_scores.get("safety", {}).get("score", 3)
        )
        results[param] = {
            "score": round(score, 2),
            "why": raw_scores[param]["why"]
        }
    final_score = sum(WEIGHTS[p] * results[p]["score"] for p in WEIGHTS)

    return results, final_score, output.strength, output.weakness, output.next_steps

# --- Follow-up Question Pipeline ---
from typing import List, Dict, Any, Set, Optional
from pydantic import BaseModel
import json

class QuestionRequest(BaseModel):
    user_query: str

def summarize_history(history: List[Dict[str, str]], model="gpt-4.1-mini", max_tokens=200) -> str:
    history_text = "\n".join(f"{m['role']}: {m['content']}" for m in history)
    prompt = f"""Summarize the following chat history in under 150 tokens, keeping key questions, decisions, and context for the next LLM turn. No fluff:
{history_text}
"""
    llm = ChatOpenAI(model=model, temperature=0.1, max_tokens=max_tokens)
    response = llm.invoke([{"role": "user", "content": prompt}])
    return response.content.strip()
#############added:
def build_final_reasoning_prompt(user_query: str, context: List[str]) -> str:
    context_str = "\n\n".join(context) if context else "(No document context found. Respond as an expert using only project best-practices—but always say so in 'why'.)"
    prompt = f"""
You are a senior construction project consultant AI. The user has asked a 'what-if' scenario.

User query:
{user_query}

Relevant context from project documents:
{context_str}

Instructions:
- Analyze the scenario in structured JSON.
- Each section should have 'analysis' and 'why'.
- If context above is empty or missing for a section, fill 'why' with "No relevant data in provided documents; using project expertise/best practices".
- If you do use facts from the context, directly quote or reference them in 'why'.

Return ONLY well-formed minified JSON like:
{{
"cost_impact": {{"analysis":"...","why":"..."}},
"schedule_impact": {{"analysis":"...","why":"..."}},
"resource_impact": {{"analysis":"...","why":"..."}},
"recommended_mitigation": {{"analysis":"...","why":"..."}},
"alternative_strategies": [{{"strategy":"...","why":"..."}}, ...]
}}

Strict rules:
- No markdown or narrative text.
- If not enough context, just explain as above.
Now generate your answer.
"""
    return prompt.strip()

def get_final_report(user_query: str, context: List[str]) -> Dict[str, Any]:
    prompt = build_final_reasoning_prompt(user_query, context)
    llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.2, max_tokens=1400)
    res = llm.invoke([{"role": "system", "content": "Return only minified JSON. If evidence lacking, clearly state so in 'citations' and 'why'."},
                      {"role": "user", "content": prompt}])
    import re
    match = re.search(r"\{[\s\S]+\}", res.content if hasattr(res, 'content') else res)
    report = json.loads(match.group()) if match else {"error": "Malformed LLM output"}
    return report

#############till here
def build_final_reasoning_prompt(user_query: str, context: List[str]) -> str:
    context_str = "\n\n".join(context) if context else "(No document context found. Only use expertise/best-practices, and state so if you must.)"
    prompt = f"""
You are a senior construction scenario report AI. The user is asking a "what-if" question:

User query:
{user_query}

Relevant project evidence (if any):
{context_str}

Instructions:
- Analyze the scenario thoroughly and step by step (cost, schedule, resources, risk).
- For each main section, output the following fields:
    - 'analysis': your answer (stepwise and realistic)
    - 'why': the explanation, with reasoning and/or support from evidence (quote if possible, or say 'using best-practices')
    - 'citations': a list (possibly empty) of source chunks: [{{"chunk":"CHUNK 2", "heading":"Bid Summary", "line":10, "quote":"..."}}]
- If there is NO document evidence for a point, say so in the why and make it clear in citations (e.g. [{{"chunk":null, "heading": "N/A", "line": null, "quote": "no evidence, relying on expertise"}}])
- When listing consequences, go deep into the effects of the change requested.
- Only return a minified JSON object. No markdown, no narrative, no extra text.

JSON structure:
{{
    "answer": "... short summary ...",
    "cost_impact": {{"analysis":"...","why":"...","citations":[...]}},
    "schedule_impact": {{"analysis":"...","why":"...","citations":[...]}},
    "resource_impact": {{"analysis":"...","why":"...","citations":[...]}},
    "consequences": [
        {{"what":"...","why":"...","citations":[...]}},
        ...
    ],
    "recommended_mitigation": {{"analysis":"...","why":"...","citations":[...]}},
    "alternative_strategies": [
        {{"strategy":"...","why":"...","citations":[...]}},
        ...
    ]
}}
"""
    return prompt.strip()

def generate_report(request: QuestionRequest, chat_summary: Optional[str]=None) -> List[str]:
    prompt = build_final_reasoning_prompt(request.user_query, chat_summary)
    llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.0, max_tokens=500)
    res = llm.invoke([{"role": "system", "content": "Generate questions as described."},
                      {"role": "user", "content": prompt}])
    try:
        start = res.content.find('[')
        end = res.content.rfind(']') + 1
        questions_str = res.content[start:end]
        questions = json.loads(questions_str)
        if isinstance(questions, list):
            return questions
        return []
    except Exception as e:
        return []

def rag_loop(
    user_query: str,
    vectorstore,
    history: Optional[List[Dict[str, str]]] = None,
    chat_summary: Optional[str] = None,
    summary_every: int = 5
) -> Dict[str, Any]:
    # Step 1: update/generate summary if needed
    history = history or []
    if len(history) > 0 and (chat_summary is None or len(history) % summary_every == 0):
        chat_summary = summarize_history(history[-summary_every:])

    # Step 2: followup questions using latest summary
    request = QuestionRequest(user_query=user_query)
    followup_questions = generate_report(request, chat_summary=chat_summary)
    context_chunks = []
    for q in followup_questions:
        context_chunks.extend(rag_search(q, vectorstore))
 
    seen: Set[str] = set()
    deduped_chunks = []
    for c in context_chunks:
        page_text = getattr(c, 'page_content', c)  # Handles both DocChunk or str
        if page_text not in seen:
            deduped_chunks.append(page_text)
            seen.add(page_text)
    # Replace evaluate_scores_with_llm with get_final_report:
    final_report = get_final_report(user_query, deduped_chunks)
    final_report["summary"] = chat_summary
    return final_report
