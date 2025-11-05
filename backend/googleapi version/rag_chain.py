from google import genai
import os

def answer_doc_question(user_query, context_chunks):
    api_key = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=api_key)
    context_section = "\n".join(chunk.page_content for chunk in context_chunks)
    prompt = f"""You are a contract QA AI. Based only on the following document sections, answer the user's question clearly and concisely. Cite which section, quote, or summary your answer comes from, and explain if you cannot find the answer.
User question: {user_query}
Relevant context:
{context_section}"""

    response = client.chat.generate(
        model="gemini-pro",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_output_tokens=400
    )
    return response.candidates[0].content, context_chunks



def extract_contract_highlights(document_text):
    api_key = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=api_key)
    prompt = f"""
You are a top-tier contract analysis and compliance AI.

For the document below, perform TWO distinct tasks and format the result as JSON with two keys: "highlights" and "risks".

1. Project Key Terms, Obligations, Deadlines:
    - Find and list every major clause, deadline, party obligation, payment term, approval requirement, and milestone.
    - For each, include a concise explanation ("explanation") of why it's important to the project or parties (in simple English).

2. Compliance Risks:
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
    response = client.chat.generate(
        model="gemini-pro",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_output_tokens=1500
    )
    import json, re
    # Safety fallback: parse first valid JSON in case LLM adds text
    m = re.search(r"\{[\s\S]+\}", response.candidates[0].content)
    if m:
        highlights_and_risks = json.loads(m.group())
    else:
        highlights_and_risks = {"highlights": [], "risks": []}
    return highlights_and_risks




SCORING_PARAMS = ["cost", "timeline", "compliance", "design", "sustainability"]
WEIGHTS = {"cost": 0.3, "timeline": 0.2, "compliance": 0.2, "design": 0.1, "sustainability": 0.2}

def evaluate_scores_with_llm(doc_chunks):
    api_key = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=api_key)
    context_text = "\n\n".join(chunk.page_content for chunk in doc_chunks)
    prompt = f"""
You are a senior construction consultant.
Based on the following document context, rate the project on these parameters—cost, timeline, compliance, design, sustainability (1=worst, 5=best).
For each, respond in JSON:
{{
  "parameter": "...",
  "score": ...,
  "why": "..."
}}
Make sure your explanations quote supporting evidence from the context.

Context:
{context_text}
"""
    response = client.chat.generate(
        model="gemini-pro",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_output_tokens=700
    )
    import json
    scores_list = json.loads(response.candidates[0].content)
    scores = {item["parameter"]: {"score": item["score"], "why": item["why"]} for item in scores_list}
    final_score = sum(WEIGHTS[p] * scores[p]["score"] for p in WEIGHTS)
    return scores, final_score


def build_report_prompt(user_query, context):
    """
    Returns a system/user prompt for the LLM, using the given context and query.
    """
    context_str = "\n\n".join(context)
    prompt = f"""
You are a senior construction project consultant AI. A user has asked:

'{user_query}'

Here are the most relevant details from the project documents:

{context_str}

Generate a decision report with these sections:
1. Cost impact
2. Schedule/delay impact
3. Resource impact
4. Recommended mitigation
5. Alternative strategies

Conclude with a brief explanation referencing why you made these recommendations (cite details from the context).
Return clear bullet points for each section.
"""
    return prompt

def generate_report(user_query, context):
    api_key = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=api_key)

    prompt = build_report_prompt(user_query, context)
    response = client.chat.generate(
        model="gemini-pro",
        messages=[
            {"role": "system", "content": "You are an expert, unbiased construction project consultant. Always answer in bullet points and organized sections."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_output_tokens=700
    )
    return response.candidates[0].content
