from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import Optional
import asyncio
import json

from app.db.session import get_db
from app.models import Execution
from app.schemas import ExecutionResponse, ExecutionList, ProgressUpdate

router = APIRouter()


@router.get("/executions", response_model=ExecutionList)
def list_executions(
    tool_id: Optional[str] = None,
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Execution)
    
    if tool_id:
        query = query.filter(Execution.tool_id == tool_id)
    if user_id:
        query = query.filter(Execution.user_id == user_id)
    if status:
        query = query.filter(Execution.status == status)
    
    total = query.count()
    executions = query.order_by(Execution.started_at.desc()).offset(offset).limit(limit).all()
    
    return ExecutionList(
        executions=[ExecutionResponse.model_validate(execution) for execution in executions],
        total=total
    )


@router.get("/executions/{execution_id}", response_model=ExecutionResponse)
def get_execution(execution_id: str, db: Session = Depends(get_db)):
    execution = db.query(Execution).filter(Execution.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return ExecutionResponse.model_validate(execution)


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, execution_id: str, websocket: WebSocket):
        await websocket.accept()
        if execution_id not in self.active_connections:
            self.active_connections[execution_id] = []
        self.active_connections[execution_id].append(websocket)

    def disconnect(self, execution_id: str, websocket: WebSocket):
        if execution_id in self.active_connections:
            self.active_connections[execution_id].remove(websocket)
            if not self.active_connections[execution_id]:
                del self.active_connections[execution_id]

    async def broadcast(self, execution_id: str, message: dict):
        if execution_id in self.active_connections:
            for connection in self.active_connections[execution_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass


manager = ConnectionManager()


@router.websocket("/executions/{execution_id}/stream")
async def execution_stream(execution_id: str, websocket: WebSocket):
    await manager.connect(execution_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(execution_id, websocket)
    except Exception as e:
        manager.disconnect(execution_id, websocket)


async def send_progress_update(execution_id: str, progress: int, message: Optional[str] = None, partial_result: Optional[dict] = None):
    update = ProgressUpdate(
        execution_id=execution_id,
        status="running",
        progress=progress,
        message=message,
        partial_result=partial_result
    )
    await manager.broadcast(execution_id, update.model_dump())
