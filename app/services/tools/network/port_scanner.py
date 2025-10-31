from typing import Dict, Any
import asyncio
import socket
from ..base import BaseToolRunner


class PortScannerRunner(BaseToolRunner):
    def validate_parameters(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        target = parameters.get('target')
        if not target:
            raise ValueError("Target host is required")
        
        target = self.sanitize_hostname(target) if not self._is_ip(target) else self.sanitize_ip(target)
        
        ports = parameters.get('ports', '1-1000')
        start_port, end_port = self._parse_port_range(ports)
        
        timeout = parameters.get('timeout', 1)
        if not isinstance(timeout, (int, float)) or timeout <= 0:
            raise ValueError("Timeout must be a positive number")
        
        return {
            'target': target,
            'start_port': start_port,
            'end_port': end_port,
            'timeout': float(timeout)
        }

    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        validated = self.validate_parameters(parameters)
        target = validated['target']
        start_port = validated['start_port']
        end_port = validated['end_port']
        timeout = validated['timeout']

        await self.update_progress(10, f"Starting port scan on {target}")

        try:
            ip = socket.gethostbyname(target)
        except socket.gaierror as e:
            raise ValueError(f"Could not resolve hostname: {target}")

        open_ports = []
        total_ports = end_port - start_port + 1
        scanned = 0

        for port in range(start_port, end_port + 1):
            try:
                result = await self._scan_port(ip, port, timeout)
                if result:
                    service = self._get_service_name(port)
                    open_ports.append({
                        'port': port,
                        'state': 'open',
                        'service': service
                    })
                    await self.update_progress(
                        10 + int((scanned / total_ports) * 80),
                        f"Found open port: {port}/{service}",
                        {'open_ports_count': len(open_ports)}
                    )
            except Exception as e:
                pass

            scanned += 1
            if scanned % 10 == 0:
                await self.update_progress(
                    10 + int((scanned / total_ports) * 80),
                    f"Scanned {scanned}/{total_ports} ports"
                )

        await self.update_progress(100, "Scan complete")

        result = {
            'target': target,
            'ip': ip,
            'ports_scanned': total_ports,
            'open_ports_count': len(open_ports),
            'open_ports': open_ports,
            'scan_type': 'TCP Connect',
        }

        return self.redact_sensitive_data(result)

    async def _scan_port(self, ip: str, port: int, timeout: float) -> bool:
        try:
            reader, writer = await asyncio.wait_for(
                asyncio.open_connection(ip, port),
                timeout=timeout
            )
            writer.close()
            await writer.wait_closed()
            return True
        except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
            return False

    def _parse_port_range(self, ports: str) -> tuple[int, int]:
        if isinstance(ports, int):
            return ports, ports
        
        ports = str(ports).strip()
        if '-' in ports:
            parts = ports.split('-')
            if len(parts) != 2:
                raise ValueError("Invalid port range format")
            start = self.sanitize_port(parts[0])
            end = self.sanitize_port(parts[1])
            if start > end:
                raise ValueError("Start port must be less than end port")
            if end - start > 10000:
                raise ValueError("Port range too large (max 10000 ports)")
            return start, end
        else:
            port = self.sanitize_port(ports)
            return port, port

    def _is_ip(self, value: str) -> bool:
        import re
        return bool(re.match(r'^(\d{1,3}\.){3}\d{1,3}$', value))

    def _get_service_name(self, port: int) -> str:
        common_ports = {
            21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp',
            53: 'dns', 80: 'http', 110: 'pop3', 143: 'imap',
            443: 'https', 465: 'smtps', 587: 'smtp', 993: 'imaps',
            995: 'pop3s', 3306: 'mysql', 5432: 'postgresql', 6379: 'redis',
            8080: 'http-proxy', 8443: 'https-alt', 27017: 'mongodb'
        }
        return common_ports.get(port, 'unknown')
