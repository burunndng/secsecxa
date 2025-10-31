import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, Callable
from sqlalchemy.orm import Session

from app.models import Execution
from app.services.tools.network import (
    PortScannerRunner,
    DNSLookupRunner,
    WhoisLookupRunner,
    PingRunner,
    SSLAnalyzerRunner,
    TracerouteRunner,
)


class ExecutionEngine:
    def __init__(self):
        self.runners = {
            'PortScannerRunner': PortScannerRunner,
            'DNSLookupRunner': DNSLookupRunner,
            'WhoisLookupRunner': WhoisLookupRunner,
            'PingRunner': PingRunner,
            'SSLAnalyzerRunner': SSLAnalyzerRunner,
            'TracerouteRunner': TracerouteRunner,
        }
        self.active_executions: Dict[str, asyncio.Task] = {}

    async def execute_tool(
        self,
        execution_id: str,
        runner_class_name: str,
        parameters: Dict[str, Any],
        db: Session,
        progress_callback: Optional[Callable] = None
    ) -> Dict[str, Any]:
        if runner_class_name not in self.runners:
            raise ValueError(f"Unknown runner class: {runner_class_name}")

        runner_class = self.runners[runner_class_name]
        runner = runner_class(execution_id, progress_callback)

        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if not execution:
            raise ValueError(f"Execution not found: {execution_id}")

        try:
            execution.status = "running"
            db.commit()

            result = await runner.execute(parameters)

            execution.status = "completed"
            execution.result = result
            execution.completed_at = datetime.utcnow()
            execution.execution_time = int((execution.completed_at - execution.started_at).total_seconds())
            execution.progress = 100
            db.commit()

            return result

        except Exception as e:
            execution.status = "failed"
            execution.error = str(e)
            execution.completed_at = datetime.utcnow()
            execution.execution_time = int((execution.completed_at - execution.started_at).total_seconds())
            db.commit()
            raise

    async def start_execution(
        self,
        execution_id: str,
        runner_class_name: str,
        parameters: Dict[str, Any],
        db: Session,
        progress_callback: Optional[Callable] = None
    ):
        task = asyncio.create_task(
            self.execute_tool(execution_id, runner_class_name, parameters, db, progress_callback)
        )
        self.active_executions[execution_id] = task

        try:
            await task
        except Exception as e:
            pass
        finally:
            if execution_id in self.active_executions:
                del self.active_executions[execution_id]

    def is_execution_active(self, execution_id: str) -> bool:
        return execution_id in self.active_executions

    async def cancel_execution(self, execution_id: str) -> bool:
        if execution_id in self.active_executions:
            task = self.active_executions[execution_id]
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            return True
        return False


execution_engine = ExecutionEngine()
