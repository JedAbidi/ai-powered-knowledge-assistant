# File parsing (PDF, TXT, etc.)
from typing import List
from langchain.docstore.document import Document
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    UnstructuredWordDocumentLoader
)
import os

def load_document(file_path: str) -> List[Document]:
    ext = os.path.splitext(file_path)[-1].lower()

    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
    elif ext == ".txt":
        loader = TextLoader(file_path, encoding='utf-8')
    elif ext in [".docx", ".doc"]:
        loader = UnstructuredWordDocumentLoader(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
    
    return loader.load()
