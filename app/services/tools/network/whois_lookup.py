from typing import Dict, Any
import whois
from datetime import datetime
from ..base import BaseToolRunner


class WhoisLookupRunner(BaseToolRunner):
    def validate_parameters(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        domain = parameters.get('domain')
        if not domain:
            raise ValueError("Domain is required")
        
        domain = self.sanitize_hostname(domain)
        
        return {'domain': domain}

    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        validated = self.validate_parameters(parameters)
        domain = validated['domain']

        await self.update_progress(10, f"Looking up WHOIS information for {domain}")

        try:
            w = whois.whois(domain)
            
            await self.update_progress(50, "Parsing WHOIS data")

            def serialize_datetime(obj):
                if isinstance(obj, datetime):
                    return obj.isoformat()
                elif isinstance(obj, list):
                    return [serialize_datetime(item) for item in obj]
                return obj

            result = {
                'domain': domain,
                'registrar': w.registrar if hasattr(w, 'registrar') else None,
                'creation_date': serialize_datetime(w.creation_date) if hasattr(w, 'creation_date') else None,
                'expiration_date': serialize_datetime(w.expiration_date) if hasattr(w, 'expiration_date') else None,
                'updated_date': serialize_datetime(w.updated_date) if hasattr(w, 'updated_date') else None,
                'status': w.status if hasattr(w, 'status') else None,
                'name_servers': w.name_servers if hasattr(w, 'name_servers') else None,
                'dnssec': w.dnssec if hasattr(w, 'dnssec') else None,
                'emails': w.emails if hasattr(w, 'emails') else None,
                'org': w.org if hasattr(w, 'org') else None,
                'country': w.country if hasattr(w, 'country') else None,
            }

            await self.update_progress(100, "WHOIS lookup complete")

            return self.redact_sensitive_data(result)

        except Exception as e:
            raise ValueError(f"WHOIS lookup failed: {str(e)}")
