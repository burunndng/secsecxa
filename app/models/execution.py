from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Execution(Base):
    __tablename__ = "executions"

    id = Column(String, primary_key=True, index=True)
    tool_id = Column(String, ForeignKey("tools.id"), nullable=False, index=True)
    user_id = Column(String, nullable=True, index=True)
    status = Column(String, default="pending", index=True)
    parameters = Column(JSON)
    result = Column(JSON)
    error = Column(Text)
    stdout = Column(Text)
    stderr = Column(Text)
    progress = Column(Integer, default=0)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    execution_time = Column(Integer, nullable=True)
    
    tool = relationship("Tool", back_populates="executions")
