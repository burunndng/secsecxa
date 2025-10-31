# CyberSec Toolkit Backend

Advanced network and reconnaissance toolkit backend with REST API and WebSocket support.

## Features

- **Network Tools**: Port scanner, DNS lookup, WHOIS lookup, Ping, Traceroute, SSL/TLS analyzer
- **REST API**: Execute tools, track executions, retrieve results
- **Real-time Progress**: WebSocket streaming for live execution updates
- **Input Validation**: Comprehensive sanitization and validation
- **Security**: Sensitive data redaction, command injection prevention
- **Database**: SQLite for execution history and results persistence

## Architecture

```
app/
├── api/                    # API endpoints
│   ├── tools.py           # Tool management and execution endpoints
│   └── executions.py      # Execution history and WebSocket streaming
├── services/
│   ├── execution_engine.py # Tool execution orchestration
│   └── tools/
│       ├── base.py        # Base runner class with sanitization
│       └── network/       # Network tool runners
│           ├── port_scanner.py
│           ├── dns_lookup.py
│           ├── whois_lookup.py
│           ├── ping_tool.py
│           ├── ssl_analyzer.py
│           └── traceroute.py
├── models/                 # SQLAlchemy models
│   ├── tool.py
│   └── execution.py
├── schemas/               # Pydantic schemas
│   ├── tool.py
│   └── execution.py
├── db/                    # Database configuration
├── core/                  # Core configuration
├── data/                  # Static data
│   └── tool_definitions.json
└── tests/                 # Unit and integration tests

```

## Installation

### Prerequisites

- Python 3.10+
- pip

### Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   ./run_backend.sh
   ```

   Or manually:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. Access the API:
   - API Docs: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

## API Endpoints

### Tools

#### List Tools
```
GET /api/tools
Query Parameters:
  - category: Filter by category (e.g., "network")
  - enabled: Filter by enabled status
```

#### Get Tool Details
```
GET /api/tools/{tool_id}
```

#### Execute Tool
```
POST /api/tools/{tool_id}/execute
Body:
{
  "parameters": {
    "target": "example.com",
    "ports": "80-443",
    "timeout": 1
  },
  "user_id": "optional_user_id"
}
```

### Executions

#### List Executions
```
GET /api/executions
Query Parameters:
  - tool_id: Filter by tool
  - user_id: Filter by user
  - status: Filter by status (pending, running, completed, failed)
  - limit: Results per page (default: 50)
  - offset: Pagination offset
```

#### Get Execution Details
```
GET /api/executions/{execution_id}
```

#### Stream Execution Progress (WebSocket)
```
WS /api/executions/{execution_id}/stream
```

## Network Tools

### Port Scanner
Scan TCP ports on target hosts.

**Parameters:**
- `target` (required): Hostname or IP address
- `ports` (optional): Port or range (e.g., "80" or "1-1000")
- `timeout` (optional): Connection timeout in seconds

**Example:**
```bash
curl -X POST http://localhost:8000/api/tools/port_scanner/execute \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"target": "scanme.nmap.org", "ports": "80-443"}}'
```

### DNS Lookup
Query DNS records for a domain.

**Parameters:**
- `domain` (required): Domain name
- `record_types` (optional): Array of record types (A, AAAA, MX, NS, TXT, CNAME, SOA, PTR, SRV)

**Example:**
```bash
curl -X POST http://localhost:8000/api/tools/dns_lookup/execute \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"domain": "example.com", "record_types": ["A", "MX"]}}'
```

### WHOIS Lookup
Retrieve domain registration information.

**Parameters:**
- `domain` (required): Domain name

**Example:**
```bash
curl -X POST http://localhost:8000/api/tools/whois_lookup/execute \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"domain": "example.com"}}'
```

### Ping
Test host reachability and measure latency.

**Parameters:**
- `target` (required): Hostname or IP address
- `count` (optional): Number of packets (default: 4)

**Example:**
```bash
curl -X POST http://localhost:8000/api/tools/ping/execute \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"target": "example.com", "count": 10}}'
```

### SSL/TLS Analyzer
Analyze SSL/TLS certificates and connection security.

**Parameters:**
- `hostname` (required): Hostname to analyze
- `port` (optional): Port number (default: 443)

**Example:**
```bash
curl -X POST http://localhost:8000/api/tools/ssl_analyzer/execute \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"hostname": "example.com", "port": 443}}'
```

### Traceroute
Trace network path to a destination.

**Parameters:**
- `target` (required): Hostname or IP address
- `max_hops` (optional): Maximum hops (default: 30)

**Example:**
```bash
curl -X POST http://localhost:8000/api/tools/traceroute/execute \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"target": "example.com", "max_hops": 20}}'
```

## WebSocket Usage

Connect to execution stream for real-time progress updates:

```javascript
const ws = new WebSocket('ws://localhost:8000/api/executions/{execution_id}/stream');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(`Progress: ${update.progress}%`);
  console.log(`Message: ${update.message}`);
  if (update.partial_result) {
    console.log('Partial result:', update.partial_result);
  }
};
```

## Security Features

### Input Sanitization
- Command injection prevention
- Hostname/IP validation
- Port range validation
- Character filtering

### Data Redaction
Automatically redacts sensitive patterns:
- Email addresses
- Passwords
- API keys
- Credit card numbers
- SSN

### Rate Limiting
- Max concurrent executions: 10
- Max execution time: 300 seconds

## Testing

Run tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

Run specific test file:
```bash
pytest app/tests/unit/test_port_scanner.py
```

## Configuration

Edit `app/core/config.py` or use environment variables:

```env
DATABASE_URL=sqlite:///./cybersec_toolkit.db
MAX_EXECUTION_TIME=300
MAX_CONCURRENT_EXECUTIONS=10
REDACT_SENSITIVE_DATA=true
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

## Development

### Adding New Tools

1. Create runner in `app/services/tools/network/new_tool.py`:
```python
from ..base import BaseToolRunner

class NewToolRunner(BaseToolRunner):
    def validate_parameters(self, parameters):
        # Validate and sanitize
        return validated_params
    
    async def execute(self, parameters):
        # Execute tool logic
        return result
```

2. Register in `app/services/tools/network/__init__.py`

3. Add tool definition to `app/data/tool_definitions.json`

4. Register runner class in `app/services/execution_engine.py`

5. Write tests in `app/tests/unit/` and `app/tests/integration/`

## CLI Usage Patterns

### Port Scanner
```bash
# Basic scan
nmap -p 80-443 example.com

# Service detection
nmap -sV example.com
```

### DNS Lookup
```bash
# A records
dig example.com A

# MX records
dig example.com MX

# All records
dig example.com ANY
```

### WHOIS
```bash
whois example.com
```

### Ping
```bash
ping -c 4 example.com
```

### Traceroute
```bash
traceroute -m 30 example.com
```

### SSL/TLS
```bash
openssl s_client -connect example.com:443
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request
