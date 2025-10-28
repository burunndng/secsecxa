from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.session import get_db
from app.models import Tool, Execution
from app.schemas import ToolResponse, ToolList, ExecutionCreate, ExecutionResponse
from app.services.execution_engine import execution_engine

router = APIRouter()


@router.get("/tools", response_model=ToolList)
def list_tools(
    category: str = None,
    enabled: bool = None,
    db: Session = Depends(get_db)
):
    query = db.query(Tool)
    
    if category:
        query = query.filter(Tool.category == category)
    if enabled is not None:
        query = query.filter(Tool.enabled == enabled)
    
    tools = query.all()
    
    return ToolList(
        tools=[ToolResponse.model_validate(tool) for tool in tools],
        total=len(tools)
    )


@router.get("/tools/{tool_id}", response_model=ToolResponse)
def get_tool(tool_id: str, db: Session = Depends(get_db)):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return ToolResponse.model_validate(tool)


@router.post("/tools/{tool_id}/execute", response_model=ExecutionResponse)
async def execute_tool(
    tool_id: str,
    execution_create: ExecutionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    if not tool.enabled:
        raise HTTPException(status_code=400, detail="Tool is disabled")
    
    execution_id = str(uuid.uuid4())
    execution = Execution(
        id=execution_id,
        tool_id=tool_id,
        user_id=execution_create.user_id,
        status="pending",
        parameters=execution_create.parameters,
        progress=0
    )
    
    db.add(execution)
    db.commit()
    db.refresh(execution)
    
    background_tasks.add_task(
        execution_engine.start_execution,
        execution_id,
        tool.parameters_schema.get('runner_class') if isinstance(tool.parameters_schema, dict) else getattr(tool, 'runner_class', None) or _get_runner_class_from_tool(tool_id),
        execution_create.parameters,
        db
    )
    
    return ExecutionResponse.model_validate(execution)


def _get_runner_class_from_tool(tool_id: str) -> str:
    mapping = {
        'port_scanner': 'PortScannerRunner',
        'dns_lookup': 'DNSLookupRunner',
        'whois_lookup': 'WhoisLookupRunner',
        'ping': 'PingRunner',
        'ssl_analyzer': 'SSLAnalyzerRunner',
        'traceroute': 'TracerouteRunner',
    }
    return mapping.get(tool_id, '')
