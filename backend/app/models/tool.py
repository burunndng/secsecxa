from sqlalchemy import Column, String, JSON, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base


class Tool(Base):
    __tablename__ = "tools"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    category = Column(String, index=True)
    parameters_schema = Column(JSON)
    result_schema = Column(JSON)
    default_values = Column(JSON)
    enabled = Column(Boolean, default=True)
    requires_elevated_privileges = Column(Boolean, default=False)
    
    executions = relationship("Execution", back_populates="tool", cascade="all, delete-orphan")
