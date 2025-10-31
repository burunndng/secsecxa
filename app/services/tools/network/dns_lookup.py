from typing import Dict, Any
import dns.resolver
from ..base import BaseToolRunner


class DNSLookupRunner(BaseToolRunner):
    def validate_parameters(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        domain = parameters.get('domain')
        if not domain:
            raise ValueError("Domain is required")
        
        domain = self.sanitize_hostname(domain)
        
        record_types = parameters.get('record_types', ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'])
        if isinstance(record_types, str):
            record_types = [rt.strip().upper() for rt in record_types.split(',')]
        
        valid_types = {'A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA', 'PTR', 'SRV'}
        record_types = [rt.upper() for rt in record_types if rt.upper() in valid_types]
        
        if not record_types:
            record_types = ['A']
        
        return {
            'domain': domain,
            'record_types': record_types
        }

    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        validated = self.validate_parameters(parameters)
        domain = validated['domain']
        record_types = validated['record_types']

        await self.update_progress(10, f"Looking up DNS records for {domain}")

        results = {}
        total_types = len(record_types)
        
        for idx, record_type in enumerate(record_types):
            try:
                answers = dns.resolver.resolve(domain, record_type)
                records = []
                
                for rdata in answers:
                    if record_type == 'MX':
                        records.append({
                            'preference': rdata.preference,
                            'exchange': str(rdata.exchange)
                        })
                    elif record_type == 'SOA':
                        records.append({
                            'mname': str(rdata.mname),
                            'rname': str(rdata.rname),
                            'serial': rdata.serial,
                            'refresh': rdata.refresh,
                            'retry': rdata.retry,
                            'expire': rdata.expire,
                            'minimum': rdata.minimum
                        })
                    elif record_type == 'SRV':
                        records.append({
                            'priority': rdata.priority,
                            'weight': rdata.weight,
                            'port': rdata.port,
                            'target': str(rdata.target)
                        })
                    else:
                        records.append(str(rdata))
                
                results[record_type] = records
                await self.update_progress(
                    10 + int(((idx + 1) / total_types) * 80),
                    f"Found {len(records)} {record_type} record(s)"
                )
                
            except dns.resolver.NoAnswer:
                results[record_type] = []
            except dns.resolver.NXDOMAIN:
                raise ValueError(f"Domain does not exist: {domain}")
            except Exception as e:
                results[record_type] = {'error': str(e)}

        await self.update_progress(100, "DNS lookup complete")

        result = {
            'domain': domain,
            'records': results,
            'total_record_types': len(record_types)
        }

        return self.redact_sensitive_data(result)
