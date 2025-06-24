#langchain logic : emberdding + rag


import os
from dotenv import load_dotenv

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.docstore.document import Document
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI  

load_dotenv()

CHROMA_DIR = "chroma_store"

# Embedding model
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Function to process and store documents
def process_and_store_documents(documents: list[Document], metadata: dict = {}) -> None:
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    split_docs = splitter.split_documents(documents)

    # Attach metadata
    for doc in split_docs:
        doc.metadata.update(metadata)

    # Store in Chroma
    vectorstore = Chroma.from_documents(
        documents=split_docs,
        embedding=embedding_model,
        persist_directory=CHROMA_DIR,
        collection_metadata={"hnsw:space": "cosine"}  # 👈 force cosine metric

    )
    vectorstore.persist()

# Load vector store and create retriever 
vectorstore = Chroma(
    persist_directory=CHROMA_DIR,
    embedding_function=embedding_model,
    collection_metadata={"hnsw:space": "cosine"},
    
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 4}) #top 4 relevant answers

# Prompt template
template = """
You are an AI assistant helping answer questions based on the following context:

{context}

Question: {question}
Answer:
"""
prompt = PromptTemplate.from_template(template)

# LLM setup
llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.2) #temperature up , creativity up

# RAG chain setup
qa_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
)

# Optional helper functions
def get_answer(question: str) -> str:
    return qa_chain.invoke(question).content

def get_vectorstore():
    return vectorstore
