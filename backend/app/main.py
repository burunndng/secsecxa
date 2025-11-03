from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import json
from pathlib import Path

from app.core.config import settings
from app.core.logging import logger
from app.db.base import Base
from app.db.session import engine
from app.api import auth, tools, executions
from app.models import User, Tool, Execution


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting application...")
    
    Base.metadata.create_all(bind=engine)
    
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        _initialize_tools(db)
        logger.info("Tools initialized")
    finally:
        db.close()
    
    yield
    
    logger.info("Shutting down application...")


def _initialize_tools(db):
    tool_definitions_path = Path("app/data/tool_definitions.json")
    
    if not tool_definitions_path.exists():
        logger.warning("Tool definitions file not found, skipping tool initialization")
        return
    
    with open(tool_definitions_path, 'r') as f:
        data = json.load(f)
    
    for tool_data in data.get('tools', []):
        existing_tool = db.query(Tool).filter(Tool.id == tool_data['id']).first()
        if not existing_tool:
            tool = Tool(
                id=tool_data['id'],
                name=tool_data['name'],
                description=tool_data['description'],
                category=tool_data['category'],
                parameters_schema=tool_data['parameters_schema'],
                result_schema=tool_data['result_schema'],
                default_values=tool_data.get('default_values', {}),
                enabled=tool_data.get('enabled', True),
                requires_elevated_privileges=tool_data.get('requires_elevated_privileges', False)
            )
            db.add(tool)
    
    db.commit()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


if settings.ALLOWED_HOSTS != ["*"]:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    return response


app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(tools.router, prefix="/api", tags=["Tools"])
app.include_router(executions.router, prefix="/api", tags=["Executions"])


@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "database": "connected"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
