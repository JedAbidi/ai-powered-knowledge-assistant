# models.py
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class QueryHistory(Base):
    __tablename__ = "query_history"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    sources = Column(Text, nullable=True)  # <--- NEW
    timestamp = Column(DateTime, default=datetime.utcnow)

