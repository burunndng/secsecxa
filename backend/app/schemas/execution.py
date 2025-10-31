from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime


class ExecutionBase(BaseModel):
    tool_id: str
    user_id: Optional[str] = None
    parameters: Dict[str, Any]


class ExecutionCreate(ExecutionBase):
    pass


class ExecutionResponse(ExecutionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    progress: int = 0
    started_at: datetime
    completed_at: Optional[datetime] = None
    execution_time: Optional[int] = None


class ExecutionProgress(BaseModel):
    progress: int
    message: str
    partial_result: Optional[Dict[str, Any]] = None
