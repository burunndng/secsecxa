import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, Callable
from sqlalchemy.orm import Session
import subprocess
import sys
import io

from app.models.execution import Execution
from app.models.tool import Tool
from app.core.logging import logger


class ExecutionEngine:
    def __init__(self):
        self.active_executions: Dict[str, asyncio.Task] = {}
        self.max_concurrent = 10
        
    async def execute_tool(
        self,
        db: Session,
        tool_id: str,
        parameters: Dict[str, Any],
        user_id: Optional[str] = None,
        progress_callback: Optional[Callable] = None
    ) -> str:
        tool = db.query(Tool).filter(Tool.id == tool_id).first()
        if not tool:
            raise ValueError(f"Tool {tool_id} not found")
        
        if not tool.enabled:
            raise ValueError(f"Tool {tool_id} is disabled")
        
        execution_id = str(uuid.uuid4())
        
        execution = Execution(
            id=execution_id,
            tool_id=tool_id,
            user_id=user_id,
            parameters=parameters,
            status="pending"
        )
        db.add(execution)
        db.commit()
        db.refresh(execution)
        
        if len(self.active_executions) >= self.max_concurrent:
            logger.warning(f"Max concurrent executions reached. Execution {execution_id} queued.")
            return execution_id
        
        task = asyncio.create_task(
            self._run_execution(execution_id, tool_id, parameters, progress_callback)
        )
        self.active_executions[execution_id] = task
        
        return execution_id
    
    async def _run_execution(
        self,
        execution_id: str,
        tool_id: str,
        parameters: Dict[str, Any],
        progress_callback: Optional[Callable] = None
    ):
        from app.db.session import SessionLocal
        
        db = SessionLocal()
        try:
            execution = db.query(Execution).filter(Execution.id == execution_id).first()
            if not execution:
                logger.error(f"Execution {execution_id} not found")
                return
            
            from datetime import timezone
            
            execution.status = "running"
            execution.started_at = datetime.now(timezone.utc)
            db.commit()
            
            if progress_callback:
                await progress_callback(10, "Execution started")
            
            try:
                result = await self._execute_tool_logic(
                    tool_id, 
                    parameters,
                    progress_callback
                )
                
                execution.status = "completed"
                execution.result = result
                execution.progress = 100
                
            except Exception as e:
                logger.error(f"Execution {execution_id} failed: {str(e)}")
                execution.status = "failed"
                execution.error = str(e)
            
            execution.completed_at = datetime.now(timezone.utc)
            if execution.started_at:
                execution.execution_time = int(
                    (execution.completed_at - execution.started_at).total_seconds()
                )
            
            db.commit()
            
            if progress_callback:
                await progress_callback(
                    100,
                    "Execution completed" if execution.status == "completed" else "Execution failed"
                )
            
        finally:
            db.close()
            if execution_id in self.active_executions:
                del self.active_executions[execution_id]
    
    async def _execute_tool_logic(
        self,
        tool_id: str,
        parameters: Dict[str, Any],
        progress_callback: Optional[Callable] = None
    ) -> Dict[str, Any]:
        if progress_callback:
            await progress_callback(30, "Processing parameters")
        
        await asyncio.sleep(0.5)
        
        if progress_callback:
            await progress_callback(60, "Executing tool")
        
        result = {
            "tool_id": tool_id,
            "parameters": parameters,
            "output": "Tool execution stub - specific implementation pending",
            "status": "success"
        }
        
        if progress_callback:
            await progress_callback(90, "Finalizing results")
        
        return result
    
    async def capture_output(self, command: list) -> tuple[str, str, int]:
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        return (
            stdout.decode('utf-8', errors='ignore'),
            stderr.decode('utf-8', errors='ignore'),
            process.returncode
        )
    
    def get_execution_status(self, db: Session, execution_id: str) -> Optional[Execution]:
        return db.query(Execution).filter(Execution.id == execution_id).first()
    
    async def cancel_execution(self, execution_id: str) -> bool:
        if execution_id in self.active_executions:
            task = self.active_executions[execution_id]
            task.cancel()
            del self.active_executions[execution_id]
            return True
        return False


execution_engine = ExecutionEngine()
