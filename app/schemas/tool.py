from pydantic import BaseModel
from typing import Optional, Dict, Any


class ToolBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: str
    parameters_schema: Optional[Dict[str, Any]] = None
    result_schema: Optional[Dict[str, Any]] = None
    default_values: Optional[Dict[str, Any]] = None
    enabled: bool = True
    requires_elevated_privileges: bool = False


class ToolResponse(ToolBase):
    class Config:
        from_attributes = True


class ToolList(BaseModel):
    tools: list[ToolResponse]
    total: int
