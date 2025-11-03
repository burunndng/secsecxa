from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any


class ToolBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    parameters_schema: Dict[str, Any]
    result_schema: Dict[str, Any]
    default_values: Dict[str, Any]
    enabled: bool = True
    requires_elevated_privileges: bool = False


class ToolResponse(ToolBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str


class ToolExecuteRequest(BaseModel):
    parameters: Dict[str, Any]
    user_id: Optional[str] = None
