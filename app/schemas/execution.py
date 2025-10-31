from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class ExecutionCreate(BaseModel):
    parameters: Dict[str, Any] = Field(default_factory=dict)
    user_id: Optional[str] = None


class ExecutionUpdate(BaseModel):
    status: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    progress: Optional[int] = None
    completed_at: Optional[datetime] = None
    execution_time: Optional[int] = None


class ExecutionResponse(BaseModel):
    id: str
    tool_id: str
    user_id: Optional[str] = None
    status: str
    parameters: Optional[Dict[str, Any]] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    progress: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    execution_time: Optional[int] = None

    class Config:
        from_attributes = True


class ExecutionList(BaseModel):
    executions: list[ExecutionResponse]
    total: int


class ProgressUpdate(BaseModel):
    execution_id: str
    status: str
    progress: int
    message: Optional[str] = None
    partial_result: Optional[Dict[str, Any]] = None
