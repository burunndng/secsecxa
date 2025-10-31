# Quick Start Guide - Network Toolkit Backend

## Setup (5 minutes)

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the Server

```bash
./run_backend.sh
```

Or manually:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Verify Installation

```bash
python3 verify_setup.py
```

## Quick API Test

### Using cURL

```bash
# Health check
curl http://localhost:8000/health

# List all tools
curl http://localhost:8000/api/tools

# Get tool details
curl http://localhost:8000/api/tools/port_scanner

# Execute port scan
curl -X POST http://localhost:8000/api/tools/port_scanner/execute \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"target": "scanme.nmap.org", "ports": "80-443"}}'

# Check execution status (replace {execution_id} with ID from previous response)
curl http://localhost:8000/api/executions/{execution_id}

# List all executions
curl http://localhost:8000/api/executions
```

### Using Python

```python
import requests

# Execute DNS lookup
response = requests.post(
    "http://localhost:8000/api/tools/dns_lookup/execute",
    json={
        "parameters": {
            "domain": "example.com",
            "record_types": ["A", "MX", "NS"]
        }
    }
)

execution_id = response.json()["id"]
print(f"Execution ID: {execution_id}")

# Check status
status_response = requests.get(
    f"http://localhost:8000/api/executions/{execution_id}"
)

print(f"Status: {status_response.json()['status']}")
print(f"Result: {status_response.json()['result']}")
```

### Using JavaScript/WebSocket

```javascript
// Execute tool
const response = await fetch('http://localhost:8000/api/tools/ping/execute', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    parameters: {target: 'example.com', count: 4}
  })
});

const {id} = await response.json();

// Connect to WebSocket for real-time updates
const ws = new WebSocket(`ws://localhost:8000/api/executions/${id}/stream`);

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(`Progress: ${update.progress}%`);
  console.log(`Message: ${update.message}`);
  
  if (update.status === 'completed') {
    console.log('Result:', update.partial_result);
  }
};
```

## Test the Tools

### Port Scanner
```bash
curl -X POST http://localhost:8000/api/tools/port_scanner/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "target": "scanme.nmap.org",
      "ports": "22-80",
      "timeout": 1
    }
  }'
```

### DNS Lookup
```bash
curl -X POST http://localhost:8000/api/tools/dns_lookup/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "domain": "google.com",
      "record_types": ["A", "AAAA", "MX"]
    }
  }'
```

### WHOIS Lookup
```bash
curl -X POST http://localhost:8000/api/tools/whois_lookup/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "domain": "example.com"
    }
  }'
```

### Ping
```bash
curl -X POST http://localhost:8000/api/tools/ping/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "target": "8.8.8.8",
      "count": 5
    }
  }'
```

### SSL Analyzer
```bash
curl -X POST http://localhost:8000/api/tools/ssl_analyzer/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "hostname": "google.com",
      "port": 443
    }
  }'
```

### Traceroute
```bash
curl -X POST http://localhost:8000/api/tools/traceroute/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "target": "example.com",
      "max_hops": 15
    }
  }'
```

## Run Tests

```bash
# All tests
pytest

# Specific test file
pytest app/tests/unit/test_port_scanner.py

# With coverage
pytest --cov=app --cov-report=html

# Verbose output
pytest -v
```

## API Documentation

Once the server is running, visit:
- Interactive API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Directory Structure

```
app/
├── main.py                 # FastAPI application entry point
├── api/
│   ├── tools.py           # Tool endpoints
│   └── executions.py      # Execution endpoints + WebSocket
├── services/
│   ├── execution_engine.py # Execution orchestration
│   └── tools/
│       ├── base.py        # Base runner class
│       └── network/       # Network tool implementations
├── models/                # Database models
├── schemas/               # API schemas
├── db/                    # Database config
├── core/                  # App config
├── data/                  # Tool definitions
└── tests/                 # Unit & integration tests
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn app.main:app --port 8001
```

### Database Issues
```bash
# Delete database and restart
rm cybersec_toolkit.db
./run_backend.sh
```

### Import Errors
```bash
# Ensure you're in the project root
cd /path/to/project

# Reinstall dependencies
pip install -r requirements.txt
```

### Permission Errors (ping/traceroute)
Some tools require system utilities:
```bash
# Ubuntu/Debian
sudo apt-get install traceroute iputils-ping

# macOS
# These are usually pre-installed
```

## Next Steps

1. **Explore API Docs**: Visit http://localhost:8000/docs
2. **Read Full Documentation**: See `BACKEND_README.md`
3. **Review Architecture**: See `NETWORK_TOOLS_DOCUMENTATION.md`
4. **Add Custom Tools**: Follow the guide in `NETWORK_TOOLS_DOCUMENTATION.md`
5. **Integrate Frontend**: Connect your UI to the API endpoints

## Configuration

Edit `app/core/config.py` or create `.env` file:

```env
DATABASE_URL=sqlite:///./cybersec_toolkit.db
MAX_EXECUTION_TIME=300
MAX_CONCURRENT_EXECUTIONS=10
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
DEBUG=true
```

## Support

- API Documentation: http://localhost:8000/docs
- Backend README: `BACKEND_README.md`
- Technical Docs: `NETWORK_TOOLS_DOCUMENTATION.md`
- GitHub Issues: [Create an issue]

---

**Happy Hacking! 🔐🛠️**
