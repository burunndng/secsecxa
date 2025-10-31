# Backend Quickstart Guide

## Quick Start (5 minutes)

### 1. Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Run the Server

```bash
# Option 1: Using the run script
./run.sh

# Option 2: Manually
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The server will start at: http://localhost:8000

- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 3. Try the API

#### Register a User

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "username": "admin",
    "password": "admin123",
    "full_name": "Admin User"
  }'
```

#### Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

#### List Tools

```bash
curl http://localhost:8000/api/tools
```

#### Execute a Tool

```bash
curl -X POST http://localhost:8000/api/tools/port_scanner/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "target": "scanme.nmap.org",
      "ports": "80-443"
    }
  }'
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tool_id": "port_scanner",
  "status": "pending",
  "parameters": {...},
  ...
}
```

#### Check Execution Status

```bash
curl http://localhost:8000/api/executions/550e8400-e29b-41d4-a716-446655440000
```

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v
```

## Development Tips

### Using the Interactive Docs

Visit http://localhost:8000/docs to:
- Explore all endpoints
- Try API calls directly from the browser
- View request/response schemas
- Test authentication

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=sqlite:///./cybersec_toolkit.db
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
DEBUG=True
```

### Adding a New Tool

1. Add tool definition to `app/data/tool_definitions.json`:

```json
{
  "id": "my_tool",
  "name": "My Tool",
  "description": "Description",
  "category": "network",
  "parameters_schema": {...},
  "result_schema": {...},
  "default_values": {},
  "enabled": true,
  "requires_elevated_privileges": false
}
```

2. Implement tool logic in `app/services/execution_engine.py`

3. Add tests in `tests/`

4. Restart the server

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 8000
kill -9 $(lsof -ti:8000)
```

### Database Locked

```bash
# Remove the database and restart
rm cybersec_toolkit.db
```

### Dependencies Issue

```bash
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

## What's Next?

- Check `README.md` for detailed documentation
- Explore API endpoints at `/docs`
- Review test files for usage examples
- Add your own tools and integrations
