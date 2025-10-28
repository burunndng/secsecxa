from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Callable
import asyncio
import re


class BaseToolRunner(ABC):
    def __init__(self, execution_id: str, progress_callback: Optional[Callable] = None):
        self.execution_id = execution_id
        self.progress_callback = progress_callback
        self._current_progress = 0

    async def update_progress(self, progress: int, message: Optional[str] = None, partial_result: Optional[Dict[str, Any]] = None):
        self._current_progress = progress
        if self.progress_callback:
            await self.progress_callback(self.execution_id, progress, message, partial_result)

    @abstractmethod
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def validate_parameters(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        pass

    def sanitize_input(self, value: str) -> str:
        value = value.strip()
        value = re.sub(r'[;&|`$()]', '', value)
        return value

    def sanitize_hostname(self, hostname: str) -> str:
        hostname = self.sanitize_input(hostname)
        if not re.match(r'^[a-zA-Z0-9.-]+$', hostname):
            raise ValueError(f"Invalid hostname: {hostname}")
        return hostname

    def sanitize_ip(self, ip: str) -> str:
        ip = self.sanitize_input(ip)
        if not re.match(r'^(\d{1,3}\.){3}\d{1,3}$', ip):
            raise ValueError(f"Invalid IP address: {ip}")
        octets = ip.split('.')
        if any(int(octet) > 255 for octet in octets):
            raise ValueError(f"Invalid IP address: {ip}")
        return ip

    def sanitize_port(self, port: Any) -> int:
        try:
            port = int(port)
            if port < 1 or port > 65535:
                raise ValueError(f"Port must be between 1 and 65535")
            return port
        except (ValueError, TypeError):
            raise ValueError(f"Invalid port: {port}")

    def redact_sensitive_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        sensitive_patterns = [
            (r'\b\d{3}-\d{2}-\d{4}\b', '***-**-****'),
            (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '***@***.***'),
            (r'\b(?:\d{4}[-\s]?){3}\d{4}\b', '****-****-****-****'),
            (r'\bpassword\s*[:=]\s*\S+', 'password: [REDACTED]'),
            (r'\bapi[_-]?key\s*[:=]\s*\S+', 'api_key: [REDACTED]'),
        ]
        
        def redact_string(s: str) -> str:
            for pattern, replacement in sensitive_patterns:
                s = re.sub(pattern, replacement, s, flags=re.IGNORECASE)
            return s

        def redact_recursive(obj: Any) -> Any:
            if isinstance(obj, dict):
                return {k: redact_recursive(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [redact_recursive(item) for item in obj]
            elif isinstance(obj, str):
                return redact_string(obj)
            return obj

        return redact_recursive(data)
