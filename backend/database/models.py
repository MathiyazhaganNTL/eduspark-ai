from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from database.db import Base


class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    language = Column(String(10), default="en")
    file_type = Column(String(20), nullable=True)       # audio / image / pdf / text
    original_text = Column(Text, nullable=True)         # teacher typed text
    extracted_text = Column(Text, nullable=True)        # whisper / llava / pdf output
    embedding_json = Column(Text, nullable=True)        # nomic-embed-text vector as JSON
    ai_result = Column(Text, nullable=True)             # JSON array of InsightResult

class FileCache(Base):
    __tablename__ = "file_cache"

    id = Column(Integer, primary_key=True, index=True)
    file_hash = Column(String(64), unique=True, index=True)
    file_type = Column(String(20))
    extracted_text = Column(Text)
