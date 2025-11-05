# 🏗 What-If RAG: Explainable Construction Project Intelligence

[![FastAPI](https://img.shields.io/badge/FastAPI-0.120.3-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![LangChain](https://img.shields.io/badge/LangChain-0.3.14-1C3C3C?style=flat)](https://www.langchain.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=flat&logo=openai)](https://openai.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Pro-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> *An AI-powered construction project management platform that provides explainable insights, scenario simulations, and intelligent document analysis through an intuitive chat-based experience.*

**Built by The Multiverse Task Force** — Sparsh Agarwal & Divy Dobariya

---

## 🎯 Problem Statement

Construction projects face critical challenges:

**Hidden Insights**: Key contract details, risks, and compliance gaps buried in scattered documents (PDFs, BIM, reports)

**No Real-Time Impact Analysis**: Cannot simulate "what-if" scenarios or see instant effects of cost/timeline changes

**Opaque Decision-Making**: Existing dashboards show scores without explaining *why* — no transparency in AI reasoning

**Manual Bottlenecks**: Hours wasted searching for clauses, deadlines, and compliance requirements

---

## ✨ Solution: Unified AI-Powered Platform

### Core Capabilities

🔍 **RAG-Based Document Intelligence** — Natural language queries on project documents with source citations

🎚️ **Interactive What-If Simulator** — Real-time scenario testing with explainable impact analysis using tunable sliders

📊 **Visual Insights Dashboard** — Highlights, risks, and document chat with transparent reasoning

🔐 **Explainable AI** — Every insight includes reasoning chains and audit trails

🤖 **Dual AI Backend** — Choose between OpenAI GPT-4 (production) or Google Gemini (free tier)

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 16+**
- **API Key**: [OpenAI](https://platform.openai.com/) *OR* [Google AI](https://ai.google.dev/)

---

### 🔧 Step 1: Backend Setup

#### Choose Your AI Provider

**Option A: OpenAI Backend** (Recommended for production)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-your_key_here

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Option B: Google Gemini Backend** (Free alternative)

```bash
# Navigate to Gemini version
cd backend/gemini_version

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add: GOOGLE_API_KEY=your_gemini_key_here

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**✅ Backend running at:** http://localhost:8000  
**📚 API Docs:** http://localhost:8000/docs

---

### 🎨 Step 2: Frontend Setup

```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure backend connection
cp .env.example .env
# Edit .env and add: VITE_API_BASE_URL=http://localhost:8000

# Start development server
npm run dev
```

**✅ Frontend running at:** http://localhost:5173

---

## 📁 Project Structure

```
whatif-rag-construction/
│
├── backend/                        # OpenAI-powered backend
│   ├── loader.py                   # Multi-format document ingestion
│   ├── vectorstore.py              # ChromaDB + OpenAI embeddings
│   ├── rag_chain.py                # AI reasoning engine
│   ├── main.py                     # FastAPI server
│   └── requirements.txt
│
├── backend/gemini_version/         # Google Gemini backend (free)
│   ├── loader.py
│   ├── vectorstore.py              # ChromaDB + Gemini embeddings
│   ├── rag_chain.py
│   ├── main.py
│   └── requirements.txt
│
└── frontend/                       # React + TypeScript UI
    ├── src/
    │   ├── components/             # Reusable UI components
    │   ├── pages/                  # Main application views
    │   │   ├── Welcome.tsx
    │   │   ├── Chat.tsx
    │   │   ├── ScenarioTuning.tsx
    │   │   └── VisualInsights.tsx
    │   ├── contexts/               # Global state management
    │   └── App.tsx
    └── package.json
```

---

## 🏗 Architecture & Workflow

```
┌─────────────────┐
│ Upload Documents│  ← PDF, DOCX, BIM, CSV, Images
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Document Loader│─────▶│ Vector Store │  ← ChromaDB
│  (Chunking)     │      │  (Embeddings)│
└─────────────────┘      └──────┬───────┘
                                 │
         ┌───────────────────────┼────────────────────┐
         │                       │                    │
         ▼                       ▼                    ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  RAG Chat       │   │  Dashboard AI   │   │  What-If Engine │
│  Q&A + Citations│   │  Health Scoring │   │  Scenario Tuning│
└─────────────────┘   └─────────────────┘   └─────────────────┘
         │                       │                    │
         └───────────────────────┴────────────────────┘
                                 │
                                 ▼
                       ┌─────────────────┐
                       │  React Frontend │
                       │  Chat Interface │
                       └─────────────────┘
```

---

## 🛠 Technology Stack

### Backend
- **AI Models**: OpenAI GPT-4/GPT-4o | Google Gemini Pro
- **RAG Framework**: LangChain 0.3.14
- **Vector Database**: ChromaDB 0.5.23
- **API Framework**: FastAPI 0.120.3
- **Document Processing**: PyPDF, python-docx, ezdxf, IfcOpenShell, Pandas

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **State Management**: Context API
- **Styling**: Tailwind CSS (via UI components)

---

## 🎮 Key Features

### 1. RAG-Powered Chat Interface
- Ask natural language questions about uploaded documents
- Get instant answers with source citations
- Conversational follow-ups maintain context
- Example: *"What is the payment schedule?"* → Returns answer with contract section reference

### 2. Interactive Scenario Tuning
- **5 Adjustable Sliders** (scored 1-5):
  - Cost Management
  - Timeline Adherence
  - Design Quality
  - Regulatory Compliance
  - Sustainability
- **Real-time Analysis**: View strengths, weaknesses, and top 3 recommended changes
- **What-If Simulation**: See instant impact of parameter adjustments
- Example: *"What if I reduce timeline score from 4 to 2?"* → Shows impact + mitigation steps

### 3. Visual Insights Dashboard
- **Highlights**: Key achievements and positive indicators
- **Risks**: Identified threats requiring attention
- **Document Chat**: Ask specific questions with contextual answers
- Example: *"Which clauses address force majeure events?"* → Extracts and cites relevant sections

### 4. Explainable AI
- Every response includes reasoning chain
- Source citations for all claims
- Audit trails for compliance and transparency

---

## 📂 Supported File Formats

| Format | Use Case | Processing |
|--------|----------|------------|
| PDF | Contracts, reports | Page-based chunking |
| DOCX | Proposals, change orders | Text extraction |
| CSV/XLSX | Cost sheets, schedules | Table summarization |
| IFC/BIM | 3D building models | Entity extraction |
| DWG/DXF | CAD drawings | Layer analysis |
| Images | Site photos, diagrams | Tesseract OCR |

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload` | POST | Upload and index documents |
| `/search` | POST | Ask questions (RAG Q&A) |
| `/dashboard` | GET | Get AI project health scores |
| `/highlights` | GET | Extract key terms and risks |
| `/ask` | POST | Run what-if scenario simulations |

### Example: Ask Question
```bash
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the liquidated damages?"}'
```

---

## 🧪 Example Workflow

1. **Upload Project Documents** (via UI)
   - Contract PDF
   - Cost estimate XLSX
   - Structural plans PDF

2. **View Dashboard** → Get overall health score with AI reasoning

3. **Extract Insights** → Automated highlights of deadlines, risks, compliance gaps

4. **Run Scenario** → *"What if steel delivery is delayed 4 weeks?"* → Impact analysis + 3-step mitigation

5. **Ask Questions** → *"What are the payment milestones?"* → Answer with section citations

---

## 🚀 Production Deployment

### Backend
```bash
# Build for production
pip install -r requirements.txt

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
# Build production bundle
npm run build

# Preview locally
npm run preview

# Deploy dist/ folder to hosting service (Vercel, Netlify, AWS S3)
```

---

## 🐛 Troubleshooting

**Backend won't start:**
- Verify Python 3.10+: `python --version`
- Check API key in `.env`
- Ensure dependencies: `pip install -r requirements.txt`

**Frontend can't connect:**
- Verify backend running: `curl http://localhost:8000/about`
- Check `VITE_API_BASE_URL` in frontend `.env`
- Ensure CORS enabled in backend `main.py`

**Vector search fails:**
- Clear ChromaDB: `rm -rf /tmp/chroma_store`
- Check write permissions

---


## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👥 Team

**The Multiverse Task Force**

- **Sparsh Agarwal** — Front End and System Integration
- **Divy Dobariya** — Backend Development & AI/ML, Langchain, RAG Architechture

**Built for Aurigo Hackathon 2025** 🚀

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/sparshagra/WhatIF_Chatbot-AI_powered_document_analysis/issues)
- **Email**: divydobariya11@gmail.com

---

**⚡ Make better construction decisions, faster, with transparent AI reasoning.**

**⭐ Star this repo if you find it useful!**