# Cybersecurity Toolkit MVP Web Wrapper

A fast MVP web application built with Flask that provides a simple interface to discover and run cybersecurity tools from the toolkit directory.

## Features

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

## Quick Start

### Prerequisites

- Python 3.7+
- pip

### Option 1: Run Directly with Python

**Quick Start (recommended):**
```bash
./run_mvp.sh
```

This script automatically sets up a virtual environment, installs dependencies, and starts the server.

**Manual Setup:**

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. (Optional) Set authentication token:
   ```bash
   export MVP_AUTH_TOKEN=your-secret-token-here
   ```

3. Run the app:
   ```bash
   python mvp_app/app.py
   ```

4. Visit: `http://localhost:5000`

### Option 2: Run with Docker

1. Build the Docker image:
   ```bash
   docker build -t cybersec-toolkit-mvp .
   ```

2. Run the container:
   ```bash
   docker run -p 5000:5000 \
     -e MVP_AUTH_TOKEN=your-secret-token-here \
     cybersec-toolkit-mvp
   ```

3. Visit: `http://localhost:5000`

## Configuration

Create a `.env` file or set environment variables:

- `MVP_AUTH_TOKEN`: (Optional) Bearer token for authentication. If not set, no auth is required.
- `PORT`: Server port (default: 5000)
- `FLASK_DEBUG`: Enable debug mode (default: False)

See `.env.example` for a template.

## API Endpoints

### GET /api/tools
Returns list of discovered tools.

### POST /api/run
Execute a tool with arguments.

Request body:
```json
{
  "tool_path": "port_scanner.py",
  "args": "localhost 80 443"
}
```

Response:
```json
{
  "stdout": "...",
  "stderr": "...",
  "returncode": 0,
  "command": "python3 /path/to/port_scanner.py localhost 80 443",
  "timestamp": "2025-10-23T18:30:00"
}
```

### GET /health
Health check endpoint.

## Web UI Tips

- Tools are grouped by folder and display their relative path.
- Arguments are split safely with `shlex.split` – avoid quoting tricks; redirection characters are blocked.
- If you upload a file, it is stored temporarily inside `toolkit/_uploads/` and the file path is appended as the last argument to the command. The file is removed after execution.
- Raw stdout can be downloaded per run via the "Download" link.

## Authentication

When `MVP_AUTH_TOKEN` is set, all routes (except `/health`) require authentication. You can either:

- Login via the built-in `/login` form to unlock the web UI; or
- Supply the header directly:

```bash
curl -H "Authorization: Bearer your-secret-token-here" http://localhost:5000/api/tools
```

## Security & Safety

⚠️ **WARNING**: This is an MVP for development/testing purposes. Consider the following before deploying:

- **Path Confinement**: All executions are confined to the `toolkit/` directory
- **Timeout**: Hard limit of 120 seconds per execution
- **Output Limits**: Maximum 5MB stdout/stderr to prevent memory issues
- **Argument Sanitization**: Blocks shell redirection characters (`|`, `&&`, `;`, `>`, `<`, etc.)
- **Authentication**: Optional bearer token (recommended for production)
- **No Privilege Escalation**: Scripts run with the same permissions as the Flask process
- **Logging**: All executions are logged to `logs/mvp_app.log`

### Recommendations for Production

- Use a proper authentication system (OAuth, JWT, etc.)
- Run in a containerized environment with limited privileges
- Implement rate limiting
- Add input validation specific to each tool
- Use a reverse proxy (nginx) for SSL/TLS
- Regularly audit logs for suspicious activity

## Toolkit Directory Structure

The app scans `toolkit/` for:
- Python scripts (`.py`)
- Shell scripts (`.sh`)
- JavaScript files (`.js`)
- Ruby scripts (`.rb`)
- Perl scripts (`.pl`)
- Executable binaries

Example structure:
```
toolkit/
├── port_scanner.py
├── hash_analyzer.py
├── base64_tool.sh
├── network_info.sh
└── password_strength.py
```

## Logs

Execution logs are stored in `logs/mvp_app.log` with automatic rotation (max 10MB, 5 backups).

## Troubleshooting

- **No tools found**: Ensure `toolkit/` directory exists and contains executable scripts
- **Permission denied**: Make scripts executable with `chmod +x toolkit/*.sh`
- **Timeout errors**: Increase `EXECUTION_TIMEOUT` in `mvp_app/app.py` (default: 120s)
- **Authentication errors**: Verify `MVP_AUTH_TOKEN` is set and included in requests

## License

MIT License - Use at your own risk.
