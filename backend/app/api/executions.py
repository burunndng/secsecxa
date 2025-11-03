from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional
import asyncio

from app.db.session import get_db
from app.models.execution import Execution
from app.schemas.execution import ExecutionResponse
from app.services.execution_engine import execution_engine

router = APIRouter()


@router.get("/executions", response_model=List[ExecutionResponse])
async def list_executions(
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
    
    executions = query.order_by(Execution.started_at.desc()).offset(offset).limit(limit).all()
    return executions


@router.get("/executions/{execution_id}", response_model=ExecutionResponse)
async def get_execution(execution_id: str, db: Session = Depends(get_db)):
    execution = db.query(Execution).filter(Execution.id == execution_id).first()
    
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Execution {execution_id} not found"
        )
    
    return execution


@router.websocket("/executions/{execution_id}/stream")
async def stream_execution(websocket: WebSocket, execution_id: str):
    await websocket.accept()
    
    from app.db.session import SessionLocal
    db = SessionLocal()
    
    try:
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        
        if not execution:
            await websocket.send_json({
                "error": f"Execution {execution_id} not found"
            })
            await websocket.close()
            return
        
        while True:
            db.refresh(execution)
            
            await websocket.send_json({
                "execution_id": execution.id,
                "status": execution.status,
                "progress": execution.progress,
                "message": f"Status: {execution.status}",
                "partial_result": execution.result if execution.status == "completed" else None
            })
            
            if execution.status in ["completed", "failed"]:
                break
            
            await asyncio.sleep(1)
        
        await websocket.close()
        
    except WebSocketDisconnect:
        pass
    finally:
        db.close()


@router.delete("/executions/{execution_id}")
async def cancel_execution(execution_id: str, db: Session = Depends(get_db)):
    execution = db.query(Execution).filter(Execution.id == execution_id).first()
    
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Execution {execution_id} not found"
        )
    
    if execution.status in ["completed", "failed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel completed or failed execution"
        )
    
    cancelled = await execution_engine.cancel_execution(execution_id)
    
    if cancelled:
        execution.status = "cancelled"
        db.commit()
        return {"message": "Execution cancelled"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Execution not running or already completed"
        )
