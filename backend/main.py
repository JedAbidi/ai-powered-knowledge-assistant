from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil, os
from utils.file_loader import load_document
from rag_pipeline import process_and_store_documents, get_vectorstore
from fastapi.responses import JSONResponse
from db import SessionLocal
from models import QueryHistory
from pydantic import BaseModel
from rag_pipeline import get_answer, qa_chain
from langchain_core.documents import Document
from collections import Counter
from datetime import datetime
import pandas as pd

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploaded_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/documents")
def get_documents():
    try:
        files = os.listdir(UPLOAD_DIR)
        documents = [
            {
                "filename": file,
                "size": os.path.getsize(os.path.join(UPLOAD_DIR, file)),
                "uploaded_at": os.path.getctime(os.path.join(UPLOAD_DIR, file))
            }
            for file in files if os.path.isfile(os.path.join(UPLOAD_DIR, file))
        ]
        return JSONResponse(content=documents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        docs = load_document(file_location)
        process_and_store_documents(docs, metadata={"source": file.filename})
        return {"message": f"File '{file.filename}' processed and stored."}
    except Exception as e:
        return {"error": str(e)}

class QuestionInput(BaseModel):
    question: str

@app.post("/ask")
async def ask_question(data: QuestionInput):
    try:
        answer = get_answer(data.question)
        return {"question": data.question, "answer": answer}
    except Exception as e:
        return {"error": str(e)}

@app.post("/query")
async def query_knowledge(data: QuestionInput):
    try:
        question = data.question
        result = qa_chain.invoke(question)
        answer = result.content if hasattr(result, "content") else str(result)

        vectorstore = get_vectorstore()
        docs_and_scores: list[tuple[Document, float]] = vectorstore.similarity_search_with_score(question, k=6)
        filtered_docs_and_scores = [(doc, score) for doc, score in docs_and_scores if score < 1.2][:4]

        sources_info = [
            {
                "source": doc.metadata.get("source", "Unknown"),
                "confidence": round(100 * (1 / (1 + score)), 2),
                "content": doc.page_content[:200]
            }
            for doc, score in filtered_docs_and_scores
        ]

        context = "\n".join([doc.page_content for doc, _ in filtered_docs_and_scores])
        source_filenames = [doc.metadata.get("source", "Unknown") for doc, _ in filtered_docs_and_scores]
        sources_csv = ",".join(source_filenames)

        db = SessionLocal()
        db.add(QueryHistory(
            question=question,
            answer=answer,
            context=context,
            sources=sources_csv
        ))
        db.commit()
        db.close()

        return {
            "question": question,
            "answer": answer,
            "sources": sources_info
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/history")
def get_history():
    db = SessionLocal()
    records = db.query(QueryHistory).order_by(QueryHistory.timestamp.desc()).all()
    db.close()
    return JSONResponse(content=[
        {
            "question": r.question,
            "answer": r.answer,
            "timestamp": r.timestamp.isoformat()
        } for r in records
    ])

@app.get("/analytics")
def get_analytics():
    try:
        db = SessionLocal()
        records = db.query(QueryHistory).all()
        files = os.listdir(UPLOAD_DIR)
        documents = [file for file in files if os.path.isfile(os.path.join(UPLOAD_DIR, file))]

        # Number of uploads
        num_uploads = len(documents)

        # Most asked questions
        question_counts = Counter(r.question for r in records)
        most_asked = [
            {"question": question, "count": count}
            for question, count in question_counts.most_common(5)
        ]

        # Model usage over time (queries per day)
        if records:
            timestamps = [r.timestamp for r in records]
            df = pd.DataFrame({"timestamp": timestamps})
            df['date'] = df['timestamp'].dt.date
            usage_counts = df['date'].value_counts().sort_index()
            usage_over_time = [
                {"date": str(date), "count": count}
                for date, count in usage_counts.items()
            ]
        else:
            usage_over_time = []

        # Most referenced document
        source_counts = Counter()
        for r in records:
            if r.sources:
                sources = r.sources.split(",")
                source_counts.update(sources)
        most_referenced = [
            {"filename": source, "count": count}
            for source, count in source_counts.most_common(1)
        ]

        db.close()
        return JSONResponse(content={
            "num_uploads": num_uploads,
            "most_asked_questions": most_asked,
            "usage_over_time": usage_over_time,
            "most_referenced_document": most_referenced
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")

@app.delete("/delete-document/{filename}")
def delete_document(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    else:
        raise HTTPException(status_code=404, detail="File not found on disk")
    try:
        vectorstore = get_vectorstore()
        vectorstore._collection.delete(where={"source": filename})
        return {"message": f"Document '{filename}' and its embeddings were deleted."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete embeddings: {str(e)}")