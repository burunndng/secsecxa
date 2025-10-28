from typing import Dict, Any
import asyncio
import re
from ..base import BaseToolRunner


class TracerouteRunner(BaseToolRunner):
    def validate_parameters(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        target = parameters.get('target')
        if not target:
            raise ValueError("Target host is required")
        
        target = self.sanitize_hostname(target) if not self._is_ip(target) else self.sanitize_ip(target)
        
        max_hops = parameters.get('max_hops', 30)
        if not isinstance(max_hops, int) or max_hops < 1 or max_hops > 64:
            raise ValueError("Max hops must be between 1 and 64")
        
        return {
            'target': target,
            'max_hops': max_hops
        }

    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        validated = self.validate_parameters(parameters)
        target = validated['target']
        max_hops = validated['max_hops']

        await self.update_progress(10, f"Starting traceroute to {target}")

        try:
            process = await asyncio.create_subprocess_exec(
                'traceroute', '-m', str(max_hops), '-w', '2', target,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await process.communicate()

            if process.returncode != 0 and not stdout:
                raise ValueError(f"Traceroute failed: {stderr.decode()}")

            output = stdout.decode()
            
            await self.update_progress(80, "Parsing traceroute results")

            result = self._parse_traceroute_output(output, target, max_hops)
            
            await self.update_progress(100, "Traceroute complete")

            return self.redact_sensitive_data(result)

        except FileNotFoundError:
            raise ValueError("traceroute command not found. Please install traceroute.")
        except Exception as e:
            raise ValueError(f"Traceroute execution failed: {str(e)}")

    def _parse_traceroute_output(self, output: str, target: str, max_hops: int) -> Dict[str, Any]:
        hops = []
        lines = output.split('\n')
        
        for line in lines[1:]:
            if not line.strip():
                continue
            
            hop_match = re.match(r'\s*(\d+)\s+(.+)', line)
            if hop_match:
                hop_num = int(hop_match.group(1))
                hop_data = hop_match.group(2)
                
                if '*' in hop_data and hop_data.strip() == '* * *':
                    hops.append({
                        'hop': hop_num,
                        'hostname': None,
                        'ip': None,
                        'rtts': [],
                        'timeout': True
                    })
                else:
                    hostname_match = re.search(r'([a-zA-Z0-9.-]+)\s+\(([\d.]+)\)', hop_data)
                    ip_match = re.search(r'([\d.]+)', hop_data)
                    
                    hostname = hostname_match.group(1) if hostname_match else None
                    ip = hostname_match.group(2) if hostname_match else (ip_match.group(1) if ip_match else None)
                    
                    rtts = []
                    for rtt_match in re.finditer(r'([\d.]+)\s*ms', hop_data):
                        rtts.append(float(rtt_match.group(1)))
                    
                    hops.append({
                        'hop': hop_num,
                        'hostname': hostname,
                        'ip': ip,
                        'rtts': rtts,
                        'timeout': False
                    })

        return {
            'target': target,
            'max_hops': max_hops,
            'hops_count': len(hops),
            'hops': hops
        }

    def _is_ip(self, value: str) -> bool:
        import re
        return bool(re.match(r'^(\d{1,3}\.){3}\d{1,3}$', value))
