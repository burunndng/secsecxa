# Cybersecurity Toolkit MVP Web Wrapper

# CyberSec Toolkit

Advanced tools for encryption, analysis, cognitive simulation, and **network reconnaissance**.

This project combines a React frontend for cognitive tools with a powerful Python backend for network and security toolkit utilities.

- **Tool Discovery**: Automatically scans `toolkit/` directory for executables and scripts (.py, .sh, .js, etc.)
- **Simple Web UI**: Lists all discovered tools with minimal forms to run them (arguments + optional file upload)
- **Safe Execution**: 
  - Confined to `toolkit/` directory (no path traversal)
  - 120-second timeout per execution
  - Output size limits
  - Sanitized arguments (blocks dangerous shell characters and absolute paths)
- **Output Display**: Shows stdout/stderr on the page after execution
- **Download Support**: Download raw stdout as .txt file
- **Optional Authentication**: Bearer token auth via environment variable (with simple login screen)
- **Logging**: Rotating log files under `logs/` directory
- **REST API**: JSON endpoints for programmatic access

## 🚀 Quick Start

### Frontend (React App)

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

### Backend (Network Toolkit API)

**Prerequisites:** Python 3.10+

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the backend server:
   ```bash
   ./run_backend.sh
   ```
   
   Or manually:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. Access the API documentation:
   - **Swagger UI**: http://localhost:8000/docs
   - **ReDoc**: http://localhost:8000/redoc
   - **Health Check**: http://localhost:8000/health

## 📚 Documentation

### Backend Documentation
- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes
- **[Backend README](BACKEND_README.md)** - Comprehensive backend documentation
- **[Technical Documentation](NETWORK_TOOLS_DOCUMENTATION.md)** - In-depth technical details
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Complete implementation overview

### Verification
Run the setup verification script:
```bash
python3 verify_setup.py
```

## 🛠️ Network Tools Available

1. **Port Scanner** - Scan TCP ports to identify open services
2. **DNS Lookup** - Query DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA, PTR, SRV)
3. **WHOIS Lookup** - Retrieve domain registration information
4. **Ping** - Test host reachability and measure latency
5. **SSL/TLS Analyzer** - Analyze certificates and connection security
6. **Traceroute** - Trace network path to destination hosts

## 🏗️ Architecture

```
CyberSec Toolkit
├── Frontend (React/TypeScript)
│   ├── Cognitive Tools (ToT, DoT, Memory Palace, etc.)
│   └── UI Components
│
└── Backend (Python/FastAPI)
    ├── REST API Endpoints
    ├── WebSocket Streaming
    ├── Tool Execution Engine
    ├── Network Tool Runners
    └── Database (SQLite/PostgreSQL)
```

## 🔐 Security Features

- **Input Sanitization**: Prevents command injection attacks
- **Data Redaction**: Automatically redacts sensitive information
- **Rate Limiting**: Prevents abuse with execution limits
- **Validation**: Comprehensive parameter validation
- **Audit Trail**: Complete execution history in database

## 🧪 Testing

Run the test suite:
```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific tests
pytest app/tests/unit/
pytest app/tests/integration/
```

## 📡 API Examples

### Execute Port Scan
```bash
curl -X POST http://localhost:8000/api/tools/port_scanner/execute \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"target": "scanme.nmap.org", "ports": "80-443"}}'
```

### DNS Lookup
```bash
curl -X POST http://localhost:8000/api/tools/dns_lookup/execute \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"domain": "example.com", "record_types": ["A", "MX"]}}'
```

### WebSocket Progress Streaming
```javascript
const ws = new WebSocket('ws://localhost:8000/api/executions/{id}/stream');
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(`Progress: ${update.progress}%`);
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/new-tool`)
3. Commit your changes (`git commit -am 'Add new tool'`)
4. Push to the branch (`git push origin feat/new-tool`)
5. Create a Pull Request

## 📄 License

MIT

## 🆘 Support

- **API Documentation**: http://localhost:8000/docs
- **Issues**: Create a GitHub issue
- **Documentation**: See the `docs/` directory

---

**Built with ❤️ for security professionals and researchers**
