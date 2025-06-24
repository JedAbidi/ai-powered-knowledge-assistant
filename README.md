# 🧠 AI Knowledge Extractor

An AI-powered assistant that lets users upload documents and ask questions — receiving accurate answers grounded in those documents using Retrieval-Augmented Generation (RAG).

---

## 🚀 Features

- 📄 Upload documents (PDF, TXT, DOCX)
- 💬 Ask questions based on uploaded content
- 🧠 See answer confidence scores + source previews
- 📚 Chat history tracking and retrieval
- 🗑️ Delete documents (and remove their embeddings)
- 📊 Analytics Dashboard:
  - Number of uploads
  - Most asked questions
  - Model usage over time
  - Most referenced documents

---

## 🧱 Tech Stack

### 🖥 Frontend
- [Next.js](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/), `axios`, `Recharts`

### ⚙️ Backend
- [FastAPI](https://fastapi.tiangolo.com/)
- [Chroma](https://www.trychroma.com/) for vector storage
- [LangChain](https://www.langchain.com/) for RAG pipeline
- [Hugging Face Embeddings](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- [SQLite](https://www.sqlite.org/) (can be replaced with Supabase/PostgreSQL)

---

## 📁 Project Structure

ai-knowledge-extarctor/
├── backend/ # FastAPI backend + RAG logic
├── frontend/ # Next.js + Tailwind UI
└── README.md

---

## ⚙️ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate (Windows)
pip install -r requirements.txt
uvicorn main:app --reload


Create a .env file inside backend/:
OPENAI_API_KEY=your-openai-api-key



💻 Frontend Setup :
cd frontend
npm install
npm run dev
Create a .env.local in frontend/:
NEXT_PUBLIC_API_URL=http://localhost:8000




