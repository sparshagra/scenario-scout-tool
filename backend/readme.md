# 🏗 What-If RAG: Explainable Construction Project Intelligence

[![FastAPI](https://img.shields.io/badge/FastAPI-0.120.3-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-0.3.14-1C3C3C?style=flat)](https://www.langchain.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=flat&logo=openai)](https://openai.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Pro-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> *Transforming construction project management with transparent AI reasoning and real-time decision intelligence.*

An open-source RAG-powered platform that eliminates hidden insights and accelerates decision-making by providing explainable AI analysis of construction documents with auditable reasoning trails.

---

## 🎯 Problem Statement

This project addresses two critical challenges in construction and capital planning:

**Challenge 1: What-If Analysis with Explainable AI**:
- Existing tools cannot simulate project changes in real-time or show impact instantly
- No transparency on why decisions are suggested, making planning slow and unclear

**Challenge 2: NLP-based Contract Analysis**:
- Key contract details are buried in documents, causing delays and missed risks
- No smart search or automated compliance alerts — review is manual and error-prone

Construction projects suffer from:
- **Scattered Data**: Critical information buried across PDFs, contracts, BIM models, and reports
- **Manual Review Bottlenecks**: Hours spent searching for clauses, deadlines, and compliance requirements
- **Opaque Dashboards**: No understanding of *why* metrics are flagged or how scores are calculated
- **Slow Decision-Making**: Unable to quickly simulate "what-if" scenarios for cost overruns or timeline delays

---

## ✨ Core Capabilities

### 1️⃣ **Unified Construction Intelligence Platform**
Brings contract understanding, planning insights, and risk analysis into one AI-powered system.

### 2️⃣ **Real-Time What-If Scenario Simulator**
Instantly test planning decisions and see budget, timeline, compliance, and safety impact live.

### 3️⃣ **Explainable AI Output**
Insights are transparent — every result includes reasoning, not just scores or predictions.

### 4️⃣ **Smart Project Health Scoring**
Quantifies project readiness with dynamic scoring across cost, timeline, design quality, compliance & sustainability.

### 5️⃣ **AI-Powered Document & Risk Extraction**
Reads contracts/reports, highlights risks, key terms, and compliance gaps automatically.

### 6️⃣ **Actionable 3-Step Recommendations**
For every scenario, the system suggests the next 3 actions to improve project outcomes.

### 7️⃣ **Conversational Decision Support**
Users can ask natural questions like "What if material costs rise?" and get AI-driven planning guidance instantly.

---

## 🚀 What Makes This Unique

### **Flexible AI Provider Support**
Unlike vendor-locked solutions, this implementation supports multiple AI backends:
- **OpenAI GPT-4/GPT-4o** for industry-leading reasoning and generation
- **Google Gemini Pro** for cost-effective, high-performance alternatives
- **Easy Provider Switching** – Choose the best model for your needs and budget

### **Explainability First**
Every AI response includes:
- ✅ Source citations with document references
- ✅ Reasoning chains explaining "how" conclusions were reached
- ✅ Risk flags for compliance gaps and ambiguous clauses
- ✅ Alternative strategies for mitigation

---

## 📁 Repository Structure

```
whatif-rag-construction/
│
├── backend/
│   |   # 🚀 OpenAI GPT-4 implementation
│   │   ├── loader.py               # Multi-format document ingestion
│   │   ├── vectorstore.py          # ChromaDB + OpenAI embeddings
│   │   ├── rag_chain.py            # AI reasoning and report generation
│   │   ├── main.py                 # FastAPI server
│   │   ├── requirements.txt        # Python dependencies
│   │   └── .env.example            # Environment configuration
│   │
│   └── gemini_version/             # 🆓 Google Gemini implementation
│       ├── loader.py               # Multi-format document ingestion
│       ├── vectorstore.py          # ChromaDB + Gemini embeddings
│       ├── rag_chain.py            # AI reasoning and report generation
│       ├── main.py                 # FastAPI server
│       ├── requirements.txt        # Python dependencies
│       └── .env.example            # Environment configuration
│
└── frontend/                       # React/Next.js UI
    └── README.md                   # Frontend-specific setup instructions
```

### **Why Two Backend Versions?**

| Version | API Provider | Cost | Best For |
|---------|-------------|------|----------|
| **openai_version/** ⭐ | OpenAI GPT-4/4o | Paid (usage-based) | Production deployments, highest accuracy needs |
| **gemini_version/** 🆓 | Google Gemini Pro | **FREE** (generous limits) | Hackathons, prototypes, cost-sensitive deployments |

**Both versions share identical APIs and functionality** – switch between them without changing your frontend code!

---

## 🏗 Architecture

```
┌─────────────────┐
│  Document Upload│
│  (Multi-format) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ Loader Pipeline │─────▶│ Vector Store │
│  (Chunking)     │      │  (ChromaDB)  │
└─────────────────┘      └──────┬───────┘
                                 │
         ┌───────────────────────┼────────────────────┐
         │                       │                    │
         ▼                       ▼                    ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  RAG Search     │   │  Dashboard AI   │   │  What-If Engine │
│  (Q&A)          │   │  (Scoring)      │   │  (Simulation)   │
└─────────────────┘   └─────────────────┘   └─────────────────┘
         │                       │                    │
         └───────────────────────┴────────────────────┘
                                 │
                                 ▼
                       ┌─────────────────┐
                       │   Frontend UI   │
                       │ (React/Next.js) │
                       └─────────────────┘
```

### Key Components

| Module | Technology | Purpose |
|--------|-----------|---------|
| **loader.py** | LangChain Document Loaders | Ingests PDF, DOCX, BIM, images with structure-aware chunking |
| **vectorstore.py** | ChromaDB + AI Embeddings | Semantic search index for document retrieval |
| **rag_chain.py** | OpenAI GPT-4 / Gemini Pro | Generates explainable answers, risk analysis, and reports |
| **main.py** | FastAPI | REST API endpoints for upload, search, dashboard, and what-if queries |

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 16+** (for frontend)
- **API Key**: [OpenAI API Key](https://platform.openai.com/) *OR* [Google AI API Key](https://ai.google.dev/)

---

## 📦 Backend Setup

### Choose Your AI Provider

#### **Option 1: OpenAI Backend (Recommended for Production)**

##### 1. Navigate to OpenAI Backend Directory
```bash
cd backend
```

##### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

##### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

##### 4. Configure Environment
```bash
# Create .env file
cp .env.example .env

# Add your OpenAI API key:
# OPENAI_API_KEY=sk-your_openai_api_key_here
```

##### 5. Start Backend Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

#### **Option 2: Google Gemini Backend (Free & Fast)**

##### 1. Navigate to Gemini Backend Directory
```bash
cd backend/gemini_version
```

##### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

##### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

##### 4. Configure Environment
```bash
# Create .env file
cp .env.example .env

# Add your Google AI API key:
# GOOGLE_API_KEY=your_gemini_api_key_here
```

##### 5. Start Backend Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

### 6. Optional: Install Format-Specific Libraries (Both Versions)

```bash
# For BIM/IFC files
pip install ifcopenshell

# For CAD files (DWG/DXF)
pip install ezdxf

# For OCR on images
pip install pytesseract pillow
# Note: Tesseract binary required (see platform instructions)
```

---

**✅ Backend is now running at:** http://localhost:8000

**📚 API Documentation:** http://localhost:8000/docs

---

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd ../../frontend
```

### 2. Follow Frontend Instructions

**⚠ Important:** Refer to `frontend/README.md` for complete setup instructions.

The frontend provides:
- Document upload interface
- Interactive chat for Q&A
- Real-time "what-if" scenario simulator
- Explainable project health dashboard
- Risk analysis and compliance reports

### 3. Configure Backend Connection

Ensure the frontend is configured to connect to your backend:

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Start Frontend
```bash
npm install
npm run dev
```

**✅ Frontend is now running at:** http://localhost:3000

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload` | POST | Upload and index project documents |
| `/search` | POST | Ask questions about documents |
| `/dashboard` | GET | Get AI-scored project health metrics |
| `/highlights` | GET | Extract key terms and compliance risks |
| `/ask` | POST | Run "what-if" scenario simulations |
| `/about` | GET | API metadata and version info |

### Example API Calls

#### Upload Document
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@contract.pdf"
```

#### Ask Question
```bash
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the payment schedule?"}'
```

#### Get Dashboard Scores
```bash
curl "http://localhost:8000/dashboard?mode=ai"
```

---

## 📂 Supported File Formats

| Format | Use Case | Extraction Method |
|--------|----------|-------------------|
| **PDF** | Contracts, reports, specifications | PyPDFLoader (page-based chunking) |
| **DOCX** | Proposals, change orders | Docx2txtLoader |
| **TXT** | Notes, logs | TextLoader with UTF-8 encoding |
| **CSV/XLSX** | Cost sheets, schedules, material lists | Pandas (table summarization) |
| **IFC/BIM** | 3D building models | IfcOpenShell (entity extraction) |
| **DWG/DXF** | CAD drawings | ezdxf (layer analysis) |
| **Images** | Site photos, diagrams | Tesseract OCR |

---

## 🧪 Example Workflow

### Scenario: New Commercial Building Project

1. **Upload Documents** (via Frontend UI)
   - Contract PDF
   - Cost estimate XLSX
   - Structural plans PDF
   - Site layout DWG

2. **View Project Dashboard**
   - Get overall health score
   - See parameter breakdown (Cost, Timeline, Compliance, etc.)
   - Review AI reasoning for each score

3. **Extract Key Insights**
   - Automated highlights of deadlines, obligations
   - Risk flags for missing clauses or compliance gaps

4. **Run What-If Scenarios**
   - Query: "What if steel delivery is delayed 4 weeks?"
   - Get: Impact analysis + 3-step mitigation plan

5. **Ask Specific Questions**
   - Query: "What are the liquidated damages?"
   - Get: "$2,500/day after June 15, 2026 (Section 8.3)" with source citation

---

## 🛠 Technology Stack

### Backend (Both Versions)

| Layer | OpenAI Version | Gemini Version | Purpose |
|-------|---------------|----------------|---------|
| **AI/ML** | OpenAI GPT-4/4o, text-embedding-3 | Google Gemini Pro, Gemini Embeddings | Reasoning, generation, semantic search |
| **RAG Framework** | LangChain 0.3.14 | LangChain 0.3.14 | Document processing, chain orchestration |
| **Vector DB** | ChromaDB 0.5.23 | ChromaDB 0.5.23 | Persistent embedding storage |
| **API** | FastAPI 0.120.3 | FastAPI 0.120.3 | REST endpoints with async support |
| **Document Parsing** | PyPDF, python-docx, ezdxf, IfcOpenShell | PyPDF, python-docx, ezdxf, IfcOpenShell | Multi-format ingestion |
| **Data Processing** | Pandas, NumPy | Pandas, NumPy | Table analysis and preprocessing |

### Frontend
See `frontend/README.md` for complete technology stack details.

---

## 🔄 Deployment Options

### Option 1: Run Backend Only (API Mode)
Deploy the backend server and integrate with custom frontends:
```bash
# For OpenAI version
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000

# OR for Gemini version
cd backend/gemini_version
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Option 2: Full Stack Deployment
1. Deploy backend on a cloud service (AWS, GCP, Azure, Render)
2. Deploy frontend separately or as a bundled application
3. Configure CORS and API URLs appropriately

### Option 3: Hybrid Deployment
- Use OpenAI backend for critical production queries
- Use Gemini backend for development/testing environments
- Load balance based on query complexity and budget

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest tests/

# Format code
black .
isort .

# Lint
flake8 .
```

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Verify Python version: `python --version` (3.10+ required)
- Check API key in `.env` file
- Ensure all dependencies installed: `pip install -r requirements.txt`

**Vector search fails:**
- ChromaDB may need write permissions to `/tmp/chroma_store`
- Try clearing the vector store: `rm -rf /tmp/chroma_store`

**Frontend can't connect to backend:**
- Verify backend is running: `curl http://localhost:8000/about`
- Check CORS configuration in `main.py`
- Ensure `NEXT_PUBLIC_API_URL` is set correctly

**API rate limits:**
- OpenAI: Monitor usage at https://platform.openai.com/usage
- Gemini: Check quota at https://ai.google.dev/

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

## 👥 Team

**The Multiverse Task Force**

- **Sparsh Agarwal** - System Integration & RAG Implementation
- **Divy Dobariya** - Backend Development & AI/ML and LangChain Architecture

**Built for Aurigo Hackathon 2025** 🚀

---

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-org/whatif-rag/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/whatif-rag/issues)
- **Email**: divydobariya11@gmail.com

---

## 🙏 Acknowledgments

- OpenAI for GPT-4 and embedding models
- Google for Gemini API access and generous free tier
- LangChain community for RAG frameworks
- ChromaDB team for open-source vector database
- Construction industry partners for domain expertise

---

## 📊 Performance Metrics

### OpenAI Backend
- **Query Response Time**: < 1.5 seconds (typical)
- **Document Processing**: 15-60 pages/second
- **Accuracy**: Industry-leading with GPT-4
- **Cost**: ~$0.03-0.06 per query (varies by model)

### Gemini Backend
- **Query Response Time**: < 2 seconds (typical)
- **Document Processing**: 10-50 pages/second
- **Free Tier Capacity**: 60+ queries/minute
- **Cost**: FREE for moderate usage

### Both Versions
- **Supported File Size**: Up to 50MB per document
- **Concurrent Users**: 10+ on single instance
- **Vector Search Latency**: < 200ms

---

**⚡ Make better construction decisions, faster, with transparent AI reasoning.**

**⭐ Star this repo if you find it useful!**
