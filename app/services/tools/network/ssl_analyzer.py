from typing import Dict, Any
import ssl
import socket
from datetime import datetime
from OpenSSL import crypto
from ..base import BaseToolRunner


class SSLAnalyzerRunner(BaseToolRunner):
    def validate_parameters(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        hostname = parameters.get('hostname')
        if not hostname:
            raise ValueError("Hostname is required")
        
        hostname = self.sanitize_hostname(hostname)
        
        port = parameters.get('port', 443)
        port = self.sanitize_port(port)
        
        return {
            'hostname': hostname,
            'port': port
        }

    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        validated = self.validate_parameters(parameters)
        hostname = validated['hostname']
        port = validated['port']

        await self.update_progress(10, f"Connecting to {hostname}:{port}")

        try:
            context = ssl.create_default_context()
            
            with socket.create_connection((hostname, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    await self.update_progress(30, "Retrieving certificate")
                    
                    cert_bin = ssock.getpeercert(binary_form=True)
                    cert_dict = ssock.getpeercert()
                    
                    x509 = crypto.load_certificate(crypto.FILETYPE_ASN1, cert_bin)
                    
                    await self.update_progress(60, "Analyzing certificate")
                    
                    result = {
                        'hostname': hostname,
                        'port': port,
                        'version': ssock.version(),
                        'cipher': ssock.cipher(),
                        'certificate': {
                            'subject': dict(x[0] for x in cert_dict.get('subject', ())),
                            'issuer': dict(x[0] for x in cert_dict.get('issuer', ())),
                            'version': cert_dict.get('version'),
                            'serial_number': x509.get_serial_number(),
                            'not_before': datetime.strptime(cert_dict['notBefore'], '%b %d %H:%M:%S %Y %Z').isoformat(),
                            'not_after': datetime.strptime(cert_dict['notAfter'], '%b %d %H:%M:%S %Y %Z').isoformat(),
                            'signature_algorithm': x509.get_signature_algorithm().decode(),
                            'san': cert_dict.get('subjectAltName', []),
                            'expired': x509.has_expired(),
                        }
                    }
                    
                    not_after = datetime.strptime(cert_dict['notAfter'], '%b %d %H:%M:%S %Y %Z')
                    days_until_expiry = (not_after - datetime.now()).days
                    result['certificate']['days_until_expiry'] = days_until_expiry
                    
                    await self.update_progress(100, "SSL analysis complete")
                    
                    return self.redact_sensitive_data(result)

        except socket.gaierror:
            raise ValueError(f"Could not resolve hostname: {hostname}")
        except socket.timeout:
            raise ValueError(f"Connection timeout to {hostname}:{port}")
        except ssl.SSLError as e:
            raise ValueError(f"SSL error: {str(e)}")
        except Exception as e:
            raise ValueError(f"SSL analysis failed: {str(e)}")
