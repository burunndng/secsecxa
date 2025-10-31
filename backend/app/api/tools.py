from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.tool import Tool
from app.schemas.tool import ToolResponse, ToolExecuteRequest
from app.schemas.execution import ExecutionResponse
from app.services.execution_engine import execution_engine
from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.get("/tools", response_model=List[ToolResponse])
async def list_tools(
    category: Optional[str] = None,
    enabled: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Tool)
    
    if category:
        query = query.filter(Tool.category == category)
    
    if enabled is not None:
        query = query.filter(Tool.enabled == enabled)
    
    tools = query.all()
    return tools


@router.get("/tools/{tool_id}", response_model=ToolResponse)
async def get_tool(tool_id: str, db: Session = Depends(get_db)):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool {tool_id} not found"
        )
    
    return tool


@router.post("/tools/{tool_id}/execute", response_model=ExecutionResponse)
async def execute_tool(
    tool_id: str,
    request: ToolExecuteRequest,
    db: Session = Depends(get_db)
):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool {tool_id} not found"
        )
    
    if not tool.enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tool {tool_id} is disabled"
        )
    
    try:
        execution_id = await execution_engine.execute_tool(
            db=db,
            tool_id=tool_id,
            parameters=request.parameters,
            user_id=request.user_id
        )
        
        execution = execution_engine.get_execution_status(db, execution_id)
        return execution
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute tool: {str(e)}"
        )
