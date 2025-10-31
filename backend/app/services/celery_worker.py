from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "cybersec_toolkit",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=settings.MAX_EXECUTION_TIME,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)


@celery_app.task(bind=True)
def execute_tool_task(self, tool_id: str, parameters: dict, execution_id: str):
    from app.db.session import SessionLocal
    from app.models.execution import Execution
    from datetime import datetime, timezone
    
    db = SessionLocal()
    try:
        execution = db.query(Execution).filter(Execution.id == execution_id).first()
        if not execution:
            return {"error": "Execution not found"}
        
        execution.status = "running"
        execution.started_at = datetime.now(timezone.utc)
        db.commit()
        
        self.update_state(state='PROGRESS', meta={'progress': 10, 'message': 'Starting execution'})
        
        result = {
            "tool_id": tool_id,
            "parameters": parameters,
            "output": "Tool execution completed",
            "status": "success"
        }
        
        execution.status = "completed"
        execution.result = result
        execution.completed_at = datetime.now(timezone.utc)
        execution.execution_time = int(
            (execution.completed_at - execution.started_at).total_seconds()
        )
        db.commit()
        
        return result
        
    except Exception as e:
        if execution:
            execution.status = "failed"
            execution.error = str(e)
            execution.completed_at = datetime.now(timezone.utc)
            db.commit()
        raise
    finally:
        db.close()
