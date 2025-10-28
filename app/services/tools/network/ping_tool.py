from typing import Dict, Any
import asyncio
import re
from ..base import BaseToolRunner


class PingRunner(BaseToolRunner):
    def validate_parameters(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        target = parameters.get('target')
        if not target:
            raise ValueError("Target host is required")
        
        target = self.sanitize_hostname(target) if not self._is_ip(target) else self.sanitize_ip(target)
        
        count = parameters.get('count', 4)
        if not isinstance(count, int) or count < 1 or count > 100:
            raise ValueError("Count must be between 1 and 100")
        
        return {
            'target': target,
            'count': count
        }

    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        validated = self.validate_parameters(parameters)
        target = validated['target']
        count = validated['count']

        await self.update_progress(10, f"Pinging {target}")

        try:
            process = await asyncio.create_subprocess_exec(
                'ping', '-c', str(count), target,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                raise ValueError(f"Ping failed: {stderr.decode()}")

            output = stdout.decode()
            
            await self.update_progress(80, "Parsing ping results")

            result = self._parse_ping_output(output, target, count)
            
            await self.update_progress(100, "Ping complete")

            return self.redact_sensitive_data(result)

        except Exception as e:
            raise ValueError(f"Ping execution failed: {str(e)}")

    def _parse_ping_output(self, output: str, target: str, count: int) -> Dict[str, Any]:
        packets_sent = count
        packets_received = 0
        packet_loss = 0
        
        loss_match = re.search(r'(\d+)% packet loss', output)
        if loss_match:
            packet_loss = int(loss_match.group(1))
            packets_received = packets_sent - (packets_sent * packet_loss // 100)

        min_rtt = max_rtt = avg_rtt = mdev_rtt = None
        rtt_match = re.search(r'rtt min/avg/max/mdev = ([\d.]+)/([\d.]+)/([\d.]+)/([\d.]+)', output)
        if rtt_match:
            min_rtt = float(rtt_match.group(1))
            avg_rtt = float(rtt_match.group(2))
            max_rtt = float(rtt_match.group(3))
            mdev_rtt = float(rtt_match.group(4))

        packets = []
        for line in output.split('\n'):
            if 'bytes from' in line:
                seq_match = re.search(r'icmp_seq=(\d+)', line)
                ttl_match = re.search(r'ttl=(\d+)', line)
                time_match = re.search(r'time=([\d.]+)', line)
                
                if seq_match and time_match:
                    packets.append({
                        'sequence': int(seq_match.group(1)),
                        'ttl': int(ttl_match.group(1)) if ttl_match else None,
                        'time': float(time_match.group(1))
                    })

        return {
            'target': target,
            'packets_sent': packets_sent,
            'packets_received': packets_received,
            'packet_loss_percent': packet_loss,
            'min_rtt_ms': min_rtt,
            'avg_rtt_ms': avg_rtt,
            'max_rtt_ms': max_rtt,
            'mdev_rtt_ms': mdev_rtt,
            'packets': packets
        }

    def _is_ip(self, value: str) -> bool:
        import re
        return bool(re.match(r'^(\d{1,3}\.){3}\d{1,3}$', value))
