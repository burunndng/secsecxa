#!/usr/bin/env python3
"""Minimal Flask wrapper to discover and execute toolkit utilities safely."""
from __future__ import annotations

import logging
import os
import secrets
import shlex
import shutil
import subprocess
import uuid
import zipfile
from collections import OrderedDict, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Dict, Iterable, List, Optional

from flask import (
    Flask,
    Response,
    abort,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.utils import secure_filename

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
TOOLKIT_DIR = BASE_DIR / "toolkit"
TOOLKIT_ZIP = BASE_DIR / "cybersec-toolkit.zip"
LOG_DIR = BASE_DIR / "logs"
UPLOAD_DIR = TOOLKIT_DIR / "_uploads"

# Constants
EXECUTION_TIMEOUT = 120  # seconds
MAX_OUTPUT_CHARS = 100_000
RUN_HISTORY_LIMIT = 20
ALLOWED_SCRIPT_SUFFIXES = {".py", ".sh", ".js", ".rb", ".pl"}
EXCLUDED_DIR_NAMES = {".git", "__pycache__", "node_modules", "_uploads"}
DANGEROUS_CHARS = {"|", "&", ";", ">", "<", "`"}

# Flask app setup
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB uploads
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

AUTH_TOKEN = os.getenv("MVP_AUTH_TOKEN")
app.secret_key = os.getenv("FLASK_SESSION_KEY") or AUTH_TOKEN or secrets.token_hex(16)

# Logging
LOG_DIR.mkdir(exist_ok=True, parents=True)
log_handler = RotatingFileHandler(
    LOG_DIR / "mvp_app.log", maxBytes=10 * 1024 * 1024, backupCount=5
)
log_handler.setLevel(logging.INFO)
log_handler.setFormatter(
    logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
)
app.logger.setLevel(logging.INFO)
app.logger.addHandler(log_handler)
app.logger.propagate = False

# Runtime storage for results
RUN_RESULTS: "OrderedDict[str, Dict[str, object]]" = OrderedDict()


def ensure_toolkit_present() -> None:
    """Ensure the toolkit directory exists, extracting from zip if needed."""
    if TOOLKIT_DIR.exists():
        return

    if not TOOLKIT_ZIP.exists():
        app.logger.warning("Toolkit directory missing and no ZIP provided. Creating empty toolkit/ directory.")
        TOOLKIT_DIR.mkdir(parents=True, exist_ok=True)
        return

    app.logger.info("Extracting cybersec-toolkit.zip into toolkit/ ...")
    TOOLKIT_DIR.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(TOOLKIT_ZIP) as archive:
        for member in archive.infolist():
            member_path = Path(member.filename)
            if member_path.parts and member_path.parts[0] == "..":
                continue

            destination = (TOOLKIT_DIR / member.filename).resolve()
            if not str(destination).startswith(str(TOOLKIT_DIR.resolve())):
                app.logger.warning("Skipping suspicious archive entry: %s", member.filename)
                continue

            if destination.exists():
                continue

            if member.is_dir():
                destination.mkdir(parents=True, exist_ok=True)
            else:
                destination.parent.mkdir(parents=True, exist_ok=True)
                with archive.open(member) as src, open(destination, "wb") as dst:
                    shutil.copyfileobj(src, dst)

    app.logger.info("Extraction completed.")


@dataclass(frozen=True)
class ToolMetadata:
    name: str
    relative_path: Path
    absolute_path: Path
    tool_type: str
    description: str
    category: str
    supports_upload: bool

    @property
    def display_category(self) -> str:
        return "Root" if self.category == "." else self.category.replace(os.sep, " /")

    @property
    def relative_posix(self) -> str:
        return self.relative_path.as_posix()


def is_executable(file_path: Path) -> bool:
    return os.access(file_path, os.X_OK)


def determine_tool_type(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    if suffix == ".py":
        return "python"
    if suffix == ".sh":
        return "bash"
    if suffix == ".js":
        return "javascript"
    if suffix == ".rb":
        return "ruby"
    if suffix == ".pl":
        return "perl"
    if is_executable(file_path):
        return "binary"
    return "unknown"


def infer_description(file_path: Path) -> str:
    lowered = file_path.name.lower()
    hints = {
        "port": "Network port scanning tool",
        "hash": "Hash analysis utility",
        "base64": "Base64 encode/decode helper",
        "network": "Network information gatherer",
        "password": "Password strength checker",
        "scan": "Scanning utility",
        "analyze": "Analysis helper",
        "encrypt": "Encryption/decryption helper",
    }
    for key, text in hints.items():
        if key in lowered:
            return text

    try:
        with file_path.open("r", encoding="utf-8", errors="ignore") as handle:
            for _ in range(5):
                line = handle.readline()
                if not line:
                    break
                line = line.strip()
                if line.startswith("#") and len(line) > 2:
                    candidate = line.lstrip("#").strip()
                    if candidate:
                        return candidate
    except OSError:
        pass

    return "Security tool"


def discover_tools() -> List[ToolMetadata]:
    ensure_toolkit_present()

    if not TOOLKIT_DIR.exists():
        return []

    tools: List[ToolMetadata] = []
    for root, dirs, files in os.walk(TOOLKIT_DIR):
        root_path = Path(root)
        relative_root = root_path.relative_to(TOOLKIT_DIR)

        dirs[:] = [
            d for d in dirs
            if d not in EXCLUDED_DIR_NAMES and not d.startswith('.')
        ]

        for filename in files:
            if filename.startswith('.'):
                continue

            file_path = root_path / filename
            suffix = file_path.suffix.lower()
            allowed = suffix in ALLOWED_SCRIPT_SUFFIXES or is_executable(file_path)
            if not allowed:
                continue

            tool_type = determine_tool_type(file_path)
            if tool_type == "unknown":
                continue

            relative_path = file_path.relative_to(TOOLKIT_DIR)
            category = str(relative_root) if str(relative_root) != "." else "."
            description = infer_description(file_path)

            tools.append(
                ToolMetadata(
                    name=file_path.stem,
                    relative_path=relative_path,
                    absolute_path=file_path,
                    tool_type=tool_type,
                    description=description,
                    category=category,
                    supports_upload=True,
                )
            )

    tools.sort(key=lambda t: (t.category, t.name))
    return tools


def group_tools_by_category(tools: Iterable[ToolMetadata]) -> Dict[str, List[ToolMetadata]]:
    grouped: Dict[str, List[ToolMetadata]] = defaultdict(list)
    for tool in tools:
        grouped[tool.display_category].append(tool)
    return dict(grouped)


def sanitize_args(raw_args: str) -> List[str]:
    if not raw_args or not raw_args.strip():
        return []

    try:
        arguments = shlex.split(raw_args, posix=True)
    except ValueError as exc:
        raise ValueError(f"Failed to parse arguments: {exc}") from exc

    for argument in arguments:
        if any(char in argument for char in DANGEROUS_CHARS):
            raise ValueError("Arguments contain disallowed shell characters")
        if os.path.isabs(argument):
            raise ValueError("Absolute paths are not allowed in arguments")
        if ".." in argument:
            raise ValueError("Parent directory references ('..') are not allowed")

    return arguments


def build_command(tool: ToolMetadata, arguments: List[str]) -> List[str]:
    base_cmd: List[str]
    rel_path = tool.relative_posix

    if tool.tool_type == "python":
        base_cmd = ["python3", rel_path]
    elif tool.tool_type == "bash":
        base_cmd = ["bash", rel_path]
    elif tool.tool_type == "javascript":
        base_cmd = ["node", rel_path]
    elif tool.tool_type == "ruby":
        base_cmd = ["ruby", rel_path]
    elif tool.tool_type == "perl":
        base_cmd = ["perl", rel_path]
    else:  # binary
        base_cmd = ["./" + rel_path]

    return base_cmd + arguments


def clip_output(text: str) -> (str, bool):
    if text is None:
        return "", False
    truncated = len(text) > MAX_OUTPUT_CHARS
    if truncated:
        text = text[:MAX_OUTPUT_CHARS] + "\n\n[OUTPUT TRUNCATED]"
    return text, truncated


def store_result(run_id: str, payload: Dict[str, object]) -> None:
    RUN_RESULTS[run_id] = payload
    while len(RUN_RESULTS) > RUN_HISTORY_LIMIT:
        RUN_RESULTS.popitem(last=False)


def find_tool(relative_path: str) -> Optional[ToolMetadata]:
    normalized = Path(relative_path)
    for tool in discover_tools():
        if tool.relative_path == normalized:
            return tool
    return None


def execute_tool(tool: ToolMetadata, raw_args: str, upload) -> Dict[str, object]:
    arguments = sanitize_args(raw_args)
    uploaded_path: Optional[Path] = None

    if upload and upload.filename:
        secure_name = secure_filename(upload.filename)
        if not secure_name:
            raise ValueError("Uploaded file name is invalid")
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        uploaded_path = UPLOAD_DIR / f"{uuid.uuid4().hex}_{secure_name}"
        upload.save(uploaded_path)
        arguments.append(uploaded_path.relative_to(TOOLKIT_DIR).as_posix())

    command = build_command(tool, arguments)
    joined_command = " ".join(command)
    app.logger.info("Executing: %s", joined_command)

    stdout = ""
    stderr = ""
    timeout = False
    return_code: Optional[int] = None

    try:
        completed = subprocess.run(
            command,
            cwd=str(TOOLKIT_DIR),
            timeout=EXECUTION_TIMEOUT,
            capture_output=True,
            text=True,
        )
        stdout, stdout_truncated = clip_output(completed.stdout or "")
        stderr, stderr_truncated = clip_output(completed.stderr or "")
        return_code = completed.returncode
    except subprocess.TimeoutExpired as exc:
        timeout = True
        stdout, stdout_truncated = clip_output(exc.stdout or "")
        stderr, stderr_truncated = clip_output(exc.stderr or "")
        return_code = None
        app.logger.error("Execution timed out: %s", joined_command)
    finally:
        if uploaded_path and uploaded_path.exists():
            try:
                uploaded_path.unlink()
            except OSError:
                app.logger.warning("Failed to remove uploaded file: %s", uploaded_path)

    timestamp = datetime.now().isoformat()
    result = {
        "tool_name": tool.name,
        "tool_path": tool.relative_posix,
        "command": joined_command,
        "args": arguments,
        "stdout": stdout,
        "stderr": stderr,
        "stdout_truncated": stdout_truncated,
        "stderr_truncated": stderr_truncated,
        "returncode": return_code,
        "timeout": timeout,
        "timestamp": timestamp,
    }
    return result


def authenticate_request() -> bool:
    if not AUTH_TOKEN:
        return True

    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer ") and header.split(" ", 1)[1] == AUTH_TOKEN:
        session["auth_token"] = AUTH_TOKEN
        return True

    if session.get("auth_token") == AUTH_TOKEN:
        return True

    token_param = request.args.get("token") or request.form.get("token")
    if token_param and token_param == AUTH_TOKEN:
        session["auth_token"] = AUTH_TOKEN
        return True

    return False


@app.before_request
def enforce_authentication():
    if request.endpoint in {"login", "health", "static"}:
        return

    if authenticate_request():
        return

    if request.path.startswith("/api/"):
        return jsonify({"error": "Unauthorized"}), 401

    next_url = request.url if request.method == "GET" else url_for("index")
    return redirect(url_for("login", next=next_url))


@app.route("/login", methods=["GET", "POST"])
def login():
    if not AUTH_TOKEN:
        return redirect(url_for("index"))

    if request.method == "POST":
        token = request.form.get("token", "")
        if token == AUTH_TOKEN:
            session["auth_token"] = AUTH_TOKEN
            flash("Authentication successful", "success")
            return redirect(request.args.get("next") or url_for("index"))
        flash("Invalid token", "error")

    return render_template("login.html", auth_required=bool(AUTH_TOKEN))


@app.route("/logout")
def logout():
    session.pop("auth_token", None)
    flash("Logged out", "info")
    return redirect(url_for("login") if AUTH_TOKEN else url_for("index"))


@app.route("/")
def index():
    tools = discover_tools()
    grouped_tools = group_tools_by_category(tools)

    run_id = request.args.get("run")
    result = RUN_RESULTS.get(run_id) if run_id else None

    return render_template(
        "index.html",
        tools_by_category=grouped_tools,
        run_id=run_id,
        result=result,
        auth_enabled=bool(AUTH_TOKEN),
    )


@app.route("/run", methods=["POST"])
def run_tool():
    tool_path = request.form.get("tool_path")
    raw_args = request.form.get("args", "")
    upload = request.files.get("input_file")

    if not tool_path:
        flash("Tool path missing", "error")
        return redirect(url_for("index"))

    tool = find_tool(tool_path)
    if not tool:
        flash("Tool not found", "error")
        return redirect(url_for("index"))

    try:
        result = execute_tool(tool, raw_args, upload)
    except ValueError as exc:
        flash(str(exc), "error")
        return redirect(url_for("index"))
    except Exception as exc:  # pylint: disable=broad-except
        app.logger.exception("Failed to execute tool")
        flash(f"Execution failed: {exc}", "error")
        return redirect(url_for("index"))

    run_id = uuid.uuid4().hex
    store_result(run_id, result)
    flash("Tool executed", "success")
    return redirect(url_for("index", run=run_id))


@app.route("/run/<run_id>/stdout")
def download_stdout(run_id: str):
    result = RUN_RESULTS.get(run_id)
    if not result:
        abort(404)

    stdout = result.get("stdout", "")
    filename = f"stdout_{run_id}.txt"
    return Response(
        stdout,
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "text/plain; charset=utf-8",
        },
    )


@app.route("/api/tools")
def api_tools():
    tools = discover_tools()
    payload = [
        {
            "name": tool.name,
            "path": tool.relative_posix,
            "type": tool.tool_type,
            "description": tool.description,
            "category": tool.display_category,
            "supports_upload": tool.supports_upload,
        }
        for tool in tools
    ]
    return jsonify({"tools": payload})


@app.route("/api/run", methods=["POST"])
def api_run():
    data = request.get_json(silent=True) or {}
    tool_path = data.get("tool_path")
    raw_args = data.get("args", "")

    if not tool_path:
        return jsonify({"error": "tool_path is required"}), 400

    tool = find_tool(tool_path)
    if not tool:
        return jsonify({"error": "Tool not found"}), 404

    try:
        result = execute_tool(tool, raw_args, upload=None)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # pylint: disable=broad-except
        app.logger.exception("API execution failure")
        return jsonify({"error": f"Execution failed: {exc}"}), 500

    run_id = uuid.uuid4().hex
    store_result(run_id, result)

    response = {
        "run_id": run_id,
        "tool": result["tool_name"],
        "command": result["command"],
        "stdout": result["stdout"],
        "stderr": result["stderr"],
        "stdout_truncated": result["stdout_truncated"],
        "stderr_truncated": result["stderr_truncated"],
        "returncode": result["returncode"],
        "timeout": result["timeout"],
        "timestamp": result["timestamp"],
    }
    return jsonify(response)


@app.route("/health")
def health():
    ensure_toolkit_present()
    return jsonify(
        {
            "status": "ok",
            "toolkit_dir": str(TOOLKIT_DIR),
            "toolkit_exists": TOOLKIT_DIR.exists(),
            "auth_enabled": bool(AUTH_TOKEN),
        }
    )


if __name__ == "__main__":
    ensure_toolkit_present()
    app.logger.info("Starting Cybersecurity Toolkit MVP")
    app.logger.info("Toolkit directory: %s", TOOLKIT_DIR)
    app.logger.info("Authentication enabled: %s", bool(AUTH_TOKEN))

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host=host, port=port, debug=debug)
