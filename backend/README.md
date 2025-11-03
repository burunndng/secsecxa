# CyberSec Toolkit Backend

Advanced FastAPI backend with authentication, execution engine, and toolkit API.

## Features

- **Authentication**: JWT-based auth with password hashing (passlib + bcrypt)
- **User Management**: User registration, login, and role-based access control
- **Database**: SQLite (pluggable) with SQLAlchemy/SQLModel and Alembic migrations
- **Execution Engine**: Async task execution with progress tracking and WebSocket streaming
- **Tool Management**: Dynamic tool registry with metadata and execution support
- **API**: RESTful endpoints for tools, executions, and auth
- **Security**: CORS, security headers, password hashing, JWT tokens
- **Configuration**: Environment-based configuration with Pydantic
- **Logging**: Structured logging with file and console output
- **Testing**: Comprehensive pytest coverage for auth, tools, and executions

## Architecture

```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── tools.py      # Tool management endpoints
│   │   └── executions.py # Execution tracking endpoints
│   ├── core/             # Core configuration
│   │   ├── config.py     # Settings and configuration
│   │   ├── logging.py    # Logging setup
│   │   └── security.py   # JWT and password utilities
│   ├── db/               # Database configuration
│   │   ├── base.py       # SQLAlchemy base
│   │   └── session.py    # Database session
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py       # User model
│   │   ├── tool.py       # Tool model
│   │   └── execution.py  # Execution model
│   ├── schemas/          # Pydantic schemas
│   │   ├── user.py       # User schemas
│   │   ├── tool.py       # Tool schemas
│   │   └── execution.py  # Execution schemas
│   ├── services/         # Business logic
│   │   └── execution_engine.py # Execution orchestration
│   ├── data/             # Static data
│   │   └── tool_definitions.json
│   └── main.py           # FastAPI application
├── alembic/              # Database migrations
├── tests/                # Test suite
├── pyproject.toml        # Poetry dependencies
└── alembic.ini           # Alembic configuration
```

## Installation

### Prerequisites

- Python 3.10+
- Poetry or pip

### Setup with Poetry

```bash
cd backend
poetry install
poetry shell
```

### Setup with pip

```bash
cd backend
pip install -r requirements.txt  # Generate from poetry
```

### Initialize Database

```bash
# Run migrations
alembic upgrade head

# Or let the app create tables automatically on startup
python -m uvicorn app.main:app --reload
```

## Running the Server

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Access the API:
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## API Endpoints

### Authentication

#### Register
```bash
POST /auth/register
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "Full Name"
}
```

#### Login (Form)
```bash
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=username&password=password123
```

#### Login (JSON)
```bash
POST /auth/login/json
{
  "username": "username",
  "password": "password123"
}
```

### Tools

#### List Tools
```bash
GET /api/tools?category=network&enabled=true
```

#### Get Tool
```bash
GET /api/tools/{tool_id}
```

#### Execute Tool
```bash
POST /api/tools/{tool_id}/execute
{
  "parameters": {
    "param1": "value1"
  },
  "user_id": "optional-user-id"
}
```

### Executions

#### List Executions
```bash
GET /api/executions?tool_id=xxx&status=completed&limit=50
```

#### Get Execution
```bash
GET /api/executions/{execution_id}
```

#### Stream Execution (WebSocket)
```bash
WS /api/executions/{execution_id}/stream
```

#### Cancel Execution
```bash
DELETE /api/executions/{execution_id}
```

## Database Models

### User
- Authentication and authorization
- Email, username, password (hashed)
- Role-based access control
- Activity tracking

### Tool
- Tool metadata and configuration
- Parameters and result schemas
- Category and privilege requirements
- Enable/disable flag

### Execution
- Job tracking and history
- Status, progress, and timing
- Parameters and results
- stdout/stderr capture
- User association

## Configuration

Edit `.env` file or set environment variables:

```env
DATABASE_URL=sqlite:///./cybersec_toolkit.db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
MAX_EXECUTION_TIME=300
MAX_CONCURRENT_EXECUTIONS=10
CORS_ORIGINS=["http://localhost:5173"]
```

## Testing

Run all tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

Run specific test file:
```bash
pytest tests/test_auth.py -v
```

## Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback migration:
```bash
alembic downgrade -1
```

## Security Features

- **Password Hashing**: bcrypt via passlib
- **JWT Tokens**: Secure token-based authentication
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, etc.
- **Input Validation**: Pydantic schemas
- **SQL Injection Protection**: SQLAlchemy ORM

## Execution Engine

The execution engine supports:
- Async task execution
- Progress tracking
- Status updates (pending, running, completed, failed)
- stdout/stderr capture
- WebSocket streaming
- Concurrent execution limits
- Cancellation support

Future enhancements:
- Celery integration for distributed tasks
- Redis for job queue
- Advanced scheduling
- Rate limiting per user

## Development

### Adding New Tools

1. Add tool definition to `app/data/tool_definitions.json`
2. Implement tool-specific logic in execution engine
3. Add tests in `tests/`

### Adding API Endpoints

1. Create router in `app/api/`
2. Define schemas in `app/schemas/`
3. Add business logic in `app/services/`
4. Include router in `app/main.py`
5. Write tests

## License

MIT
