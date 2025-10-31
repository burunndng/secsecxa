# Network and Reconnaissance Toolkit - Technical Documentation

## Overview

This document provides comprehensive documentation for the network and reconnaissance toolkit backend integration, including CLI usage patterns, implementation details, and testing strategies.

## Tool Inventory

### 1. Port Scanner
**Purpose**: Identify open TCP ports on target hosts to discover running services.

**CLI Usage Patterns**:
```bash
# Using nmap
nmap -p 1-1000 example.com
nmap -p- example.com  # Scan all ports
nmap -p 80,443 example.com  # Specific ports
nmap -sV -p 80,443 example.com  # Version detection

# Using netcat
nc -zv example.com 80
nc -zv example.com 1-1000

# Using custom Python
python3 -c "import socket; s=socket.socket(); s.connect(('example.com', 80)); print('Open')"
```

**Implementation**: `app/services/tools/network/port_scanner.py`
- Uses asyncio for concurrent scanning
- Configurable timeout per port
- Service name detection for common ports
- Maximum range limit (10000 ports) for safety

**Input Validation**:
- Hostname/IP sanitization
- Port range validation (1-65535)
- Command injection prevention

**Output Schema**:
```json
{
  "target": "example.com",
  "ip": "93.184.216.34",
  "ports_scanned": 1000,
  "open_ports_count": 2,
  "open_ports": [
    {"port": 80, "state": "open", "service": "http"},
    {"port": 443, "state": "open", "service": "https"}
  ],
  "scan_type": "TCP Connect"
}
```

### 2. DNS Lookup
**Purpose**: Query DNS records to discover domain configuration and infrastructure.

**CLI Usage Patterns**:
```bash
# Using dig
dig example.com A
dig example.com MX
dig example.com ANY
dig @8.8.8.8 example.com  # Specific nameserver

# Using nslookup
nslookup example.com
nslookup -type=MX example.com

# Using host
host example.com
host -t MX example.com
```

**Implementation**: `app/services/tools/network/dns_lookup.py`
- Uses dnspython library
- Supports multiple record types: A, AAAA, MX, NS, TXT, CNAME, SOA, PTR, SRV
- Graceful handling of missing records
- Structured output for complex records (MX, SOA, SRV)

**Input Validation**:
- Domain name sanitization
- Record type validation

**Output Schema**:
```json
{
  "domain": "example.com",
  "records": {
    "A": ["93.184.216.34"],
    "MX": [
      {"preference": 10, "exchange": "mail.example.com"}
    ],
    "NS": ["ns1.example.com", "ns2.example.com"]
  },
  "total_record_types": 3
}
```

### 3. WHOIS Lookup
**Purpose**: Retrieve domain registration information including registrar, dates, and contacts.

**CLI Usage Patterns**:
```bash
# Using whois
whois example.com
whois 93.184.216.34  # IP WHOIS

# Using web APIs
curl -s "https://www.whoisxmlapi.com/whoisserver/WhoisService?domainName=example.com"
```

**Implementation**: `app/services/tools/network/whois_lookup.py`
- Uses python-whois library
- Parses structured WHOIS data
- Date serialization for JSON compatibility
- Email redaction for privacy

**Input Validation**:
- Domain name sanitization

**Output Schema**:
```json
{
  "domain": "example.com",
  "registrar": "Example Registrar Inc.",
  "creation_date": "1995-08-14T04:00:00",
  "expiration_date": "2024-08-13T04:00:00",
  "updated_date": "2023-08-14T07:01:38",
  "status": ["clientDeleteProhibited", "clientTransferProhibited"],
  "name_servers": ["ns1.example.com", "ns2.example.com"],
  "emails": ["***@***.***"],
  "org": "Example Organization",
  "country": "US"
}
```

### 4. Ping Tool
**Purpose**: Test host reachability and measure network latency.

**CLI Usage Patterns**:
```bash
# Using ping
ping -c 4 example.com
ping -c 10 -i 0.5 example.com  # Faster interval
ping -s 1000 example.com  # Larger packet size

# Using fping (multiple hosts)
fping example.com google.com github.com
```

**Implementation**: `app/services/tools/network/ping_tool.py`
- Executes system ping command
- Parses RTT statistics
- Tracks individual packet responses
- Calculates packet loss percentage

**Input Validation**:
- Hostname/IP sanitization
- Packet count limits (1-100)

**Output Schema**:
```json
{
  "target": "example.com",
  "packets_sent": 4,
  "packets_received": 4,
  "packet_loss_percent": 0,
  "min_rtt_ms": 12.345,
  "avg_rtt_ms": 15.678,
  "max_rtt_ms": 18.901,
  "mdev_rtt_ms": 2.345,
  "packets": [
    {"sequence": 1, "ttl": 56, "time": 14.2},
    {"sequence": 2, "ttl": 56, "time": 15.1}
  ]
}
```

### 5. SSL/TLS Certificate Analyzer
**Purpose**: Analyze SSL/TLS certificates for security assessment and expiration monitoring.

**CLI Usage Patterns**:
```bash
# Using openssl
openssl s_client -connect example.com:443 -showcerts
echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates

# Using nmap
nmap --script ssl-cert example.com

# Using testssl.sh
./testssl.sh example.com
```

**Implementation**: `app/services/tools/network/ssl_analyzer.py`
- Uses OpenSSL bindings
- Extracts certificate details
- Checks expiration status
- Analyzes cipher suite
- Validates certificate chain

**Input Validation**:
- Hostname sanitization
- Port validation (1-65535)

**Output Schema**:
```json
{
  "hostname": "example.com",
  "port": 443,
  "version": "TLSv1.3",
  "cipher": ["TLS_AES_256_GCM_SHA384", 256],
  "certificate": {
    "subject": {"CN": "example.com"},
    "issuer": {"CN": "DigiCert TLS RSA SHA256 2020 CA1"},
    "version": 3,
    "serial_number": 123456789,
    "not_before": "2023-01-01T00:00:00",
    "not_after": "2024-01-01T23:59:59",
    "signature_algorithm": "sha256WithRSAEncryption",
    "san": [["DNS", "example.com"], ["DNS", "www.example.com"]],
    "expired": false,
    "days_until_expiry": 120
  }
}
```

### 6. Traceroute
**Purpose**: Trace network path to identify routing and potential bottlenecks.

**CLI Usage Patterns**:
```bash
# Using traceroute
traceroute example.com
traceroute -m 20 example.com  # Max hops
traceroute -w 1 example.com  # Wait time

# Using tracepath
tracepath example.com

# Using mtr (My TraceRoute)
mtr example.com
```

**Implementation**: `app/services/tools/network/traceroute.py`
- Executes system traceroute command
- Parses hop information
- Handles timeout hops
- Extracts RTT measurements

**Input Validation**:
- Hostname/IP sanitization
- Max hops limit (1-64)

**Output Schema**:
```json
{
  "target": "example.com",
  "max_hops": 30,
  "hops_count": 12,
  "hops": [
    {
      "hop": 1,
      "hostname": "gateway.local",
      "ip": "192.168.1.1",
      "rtts": [1.234, 1.345, 1.456],
      "timeout": false
    },
    {
      "hop": 2,
      "hostname": null,
      "ip": null,
      "rtts": [],
      "timeout": true
    }
  ]
}
```

## Architecture Components

### Base Runner Class (`app/services/tools/base.py`)

Provides common functionality for all tool runners:

**Key Features**:
- Input sanitization methods
- Progress callback mechanism
- Sensitive data redaction
- Abstract methods for validation and execution

**Methods**:
- `sanitize_input()`: Remove dangerous characters
- `sanitize_hostname()`: Validate domain names
- `sanitize_ip()`: Validate IP addresses
- `sanitize_port()`: Validate port numbers
- `redact_sensitive_data()`: Remove sensitive patterns
- `update_progress()`: Send progress updates
- `validate_parameters()`: Abstract validation method
- `execute()`: Abstract execution method

### Execution Engine (`app/services/execution_engine.py`)

Orchestrates tool execution:

**Responsibilities**:
- Runner registration and lookup
- Asynchronous execution management
- Progress tracking
- Error handling
- Database updates

**Key Methods**:
- `execute_tool()`: Execute a tool and update database
- `start_execution()`: Start execution in background
- `is_execution_active()`: Check execution status
- `cancel_execution()`: Cancel running execution

### Tool Definitions (`app/data/tool_definitions.json`)

Metadata for API form generation:

**Structure**:
```json
{
  "tools": [
    {
      "id": "tool_id",
      "name": "Tool Name",
      "description": "Tool description",
      "category": "network",
      "runner_class": "RunnerClassName",
      "enabled": true,
      "requires_elevated_privileges": false,
      "parameters_schema": {
        "type": "object",
        "properties": {},
        "required": []
      },
      "default_values": {},
      "result_schema": {}
    }
  ]
}
```

### Database Models

**Tool Model** (`app/models/tool.py`):
- Stores tool metadata
- Parameters schema for validation
- Default values for UI
- Enable/disable flag

**Execution Model** (`app/models/execution.py`):
- Execution history
- Status tracking (pending, running, completed, failed)
- Parameters and results
- Timestamps and execution time
- Error logging

## API Endpoints

### Tool Management

**GET /api/tools**
- List all available tools
- Filter by category, enabled status
- Returns tool metadata

**GET /api/tools/{id}**
- Get specific tool details
- Returns parameters schema, default values, result schema

**POST /api/tools/{id}/execute**
- Execute a tool
- Accepts parameters JSON
- Returns execution ID
- Starts background task

### Execution Management

**GET /api/executions**
- List all executions
- Filter by tool_id, user_id, status
- Pagination support (limit, offset)
- Returns execution history

**GET /api/executions/{id}**
- Get specific execution details
- Returns status, progress, result, error

**WS /api/executions/{id}/stream**
- WebSocket connection for real-time updates
- Receives progress updates
- JSON format: `{execution_id, status, progress, message, partial_result}`

## Security Features

### Input Validation

**Hostname Sanitization**:
- Regex pattern: `^[a-zA-Z0-9.-]+$`
- Removes dangerous characters
- Prevents command injection

**IP Address Validation**:
- Regex pattern: `^(\d{1,3}\.){3}\d{1,3}$`
- Validates octet ranges (0-255)
- Prevents command injection

**Port Validation**:
- Range check: 1-65535
- Type validation (integer)
- Prevents overflow

### Data Redaction

Automatically redacts:
- Email addresses → `***@***.***`
- Passwords → `password: [REDACTED]`
- API keys → `api_key: [REDACTED]`
- Credit cards → `****-****-****-****`
- SSN → `***-**-****`

### Rate Limiting

Configuration in `app/core/config.py`:
- `MAX_EXECUTION_TIME`: 300 seconds
- `MAX_CONCURRENT_EXECUTIONS`: 10

### Command Injection Prevention

- Input sanitization removes: `; & | \` $ ( )`
- Hostname/IP validation with strict regex
- No direct shell execution without validation

## Testing Strategy

### Unit Tests (`app/tests/unit/`)

**Base Runner Tests** (`test_base_runner.py`):
- Input sanitization
- Data redaction
- Validation logic

**Tool-Specific Tests**:
- Parameter validation
- Edge cases
- Error handling
- Mock execution

**Example**:
```python
@pytest.mark.asyncio
async def test_sanitize_hostname():
    runner = PortScannerRunner("test-id")
    assert runner.sanitize_hostname("example.com") == "example.com"
    
    with pytest.raises(ValueError):
        runner.sanitize_hostname("example.com; rm -rf /")
```

### Integration Tests (`app/tests/integration/`)

**API Tests** (`test_api.py`):
- Endpoint functionality
- Request/response validation
- Database operations
- Background task execution

**Test Database**:
- SQLite in-memory database
- Fixture-based setup/teardown
- Isolated test environment

**Example**:
```python
def test_execute_tool(test_db):
    response = client.post(
        "/api/tools/port_scanner/execute",
        json={"parameters": {"target": "example.com"}}
    )
    assert response.status_code == 200
    assert "id" in response.json()
```

### Mock/Fixture Strategy

**Fixtures**:
- Test database with pre-loaded tools
- Mock network responses
- Sample execution data

**Mocking**:
- External network calls
- System commands (ping, traceroute)
- DNS resolution

## Development Workflow

### Adding New Tools

1. **Create Runner Class**:
   ```python
   # app/services/tools/network/new_tool.py
   from ..base import BaseToolRunner
   
   class NewToolRunner(BaseToolRunner):
       def validate_parameters(self, parameters):
           # Validation logic
           return validated_params
       
       async def execute(self, parameters):
           # Execution logic
           return result
   ```

2. **Register Runner**:
   ```python
   # app/services/tools/network/__init__.py
   from .new_tool import NewToolRunner
   __all__ = [..., "NewToolRunner"]
   ```

3. **Add Tool Definition**:
   ```json
   // app/data/tool_definitions.json
   {
     "id": "new_tool",
     "name": "New Tool",
     "runner_class": "NewToolRunner",
     ...
   }
   ```

4. **Register in Engine**:
   ```python
   # app/services/execution_engine.py
   self.runners = {
       ...,
       'NewToolRunner': NewToolRunner
   }
   ```

5. **Write Tests**:
   - Unit tests for validation/execution
   - Integration tests for API
   - Mock external dependencies

### CLI Usage Documentation

Each tool includes CLI examples for reference:
- Native commands (nmap, dig, whois, etc.)
- Alternative tools
- Common options and flags
- Output formats

## Performance Considerations

### Asynchronous Execution

- All tool runners use `async/await`
- Non-blocking I/O operations
- Concurrent execution support

### Resource Limits

- Connection timeouts prevent hanging
- Port scan range limits prevent abuse
- Max execution time prevents runaway processes

### Database Optimization

- Indexed fields: tool_id, user_id, status
- Result storage as JSON
- Pagination for large result sets

## Monitoring and Logging

### Progress Updates

- Real-time via WebSocket
- Progress percentage (0-100)
- Status messages
- Partial results

### Error Handling

- Exception capture and storage
- Error message sanitization
- Stack trace logging (development)

### Execution History

- All executions persisted
- Status tracking
- Execution time metrics
- Result archival

## Future Enhancements

### Potential Additions

1. **Service Enumerator**: Deep service fingerprinting
2. **Packet Analyzer**: Network traffic capture and analysis
3. **Vulnerability Scanner**: CVE detection
4. **Web Application Scanner**: HTTP/HTTPS analysis
5. **Network Mapper**: Topology discovery

### Scalability

- Redis for caching
- PostgreSQL for production
- Celery for distributed tasks
- Rate limiting per user
- Authentication/authorization

### UI Integration

- Form generation from tool_definitions.json
- Real-time progress display
- Result visualization
- Export functionality (JSON, CSV, PDF)

## Conclusion

This network and reconnaissance toolkit backend provides a secure, scalable foundation for network security tools. The modular architecture allows easy addition of new tools while maintaining security and reliability standards.
