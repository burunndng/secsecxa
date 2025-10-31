from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api import tools, executions
from app.models import Tool


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        _initialize_tools(db)
    finally:
        db.close()
    
    yield


def _initialize_tools(db):
    with open('app/data/tool_definitions.json', 'r') as f:
        data = json.load(f)
    
    for tool_data in data['tools']:
        existing_tool = db.query(Tool).filter(Tool.id == tool_data['id']).first()
        if not existing_tool:
            tool = Tool(
                id=tool_data['id'],
                name=tool_data['name'],
                description=tool_data['description'],
                category=tool_data['category'],
                parameters_schema=tool_data['parameters_schema'],
                result_schema=tool_data['result_schema'],
                default_values=tool_data['default_values'],
                enabled=tool_data['enabled'],
                requires_elevated_privileges=tool_data['requires_elevated_privileges']
            )
            db.add(tool)
    
    db.commit()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tools.router, prefix="/api", tags=["tools"])
app.include_router(executions.router, prefix="/api", tags=["executions"])


@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
