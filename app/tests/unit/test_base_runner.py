import pytest
from app.services.tools.base import BaseToolRunner


class MockRunner(BaseToolRunner):
    async def execute(self, parameters):
        return {"result": "success"}
    
    def validate_parameters(self, parameters):
        return parameters


@pytest.mark.asyncio
async def test_sanitize_hostname():
    runner = MockRunner("test-id")
    
    assert runner.sanitize_hostname("example.com") == "example.com"
    assert runner.sanitize_hostname("sub.example.com") == "sub.example.com"
    
    with pytest.raises(ValueError):
        runner.sanitize_hostname("example.com; rm -rf /")
    
    with pytest.raises(ValueError):
        runner.sanitize_hostname("example.com && echo hack")


@pytest.mark.asyncio
async def test_sanitize_ip():
    runner = MockRunner("test-id")
    
    assert runner.sanitize_ip("192.168.1.1") == "192.168.1.1"
    assert runner.sanitize_ip("10.0.0.1") == "10.0.0.1"
    
    with pytest.raises(ValueError):
        runner.sanitize_ip("192.168.1.256")
    
    with pytest.raises(ValueError):
        runner.sanitize_ip("192.168.1.1; whoami")


@pytest.mark.asyncio
async def test_sanitize_port():
    runner = MockRunner("test-id")
    
    assert runner.sanitize_port(80) == 80
    assert runner.sanitize_port("443") == 443
    
    with pytest.raises(ValueError):
        runner.sanitize_port(0)
    
    with pytest.raises(ValueError):
        runner.sanitize_port(65536)
    
    with pytest.raises(ValueError):
        runner.sanitize_port("invalid")


@pytest.mark.asyncio
async def test_redact_sensitive_data():
    runner = MockRunner("test-id")
    
    data = {
        "email": "user@example.com",
        "password": "password: secret123",
        "api_key": "api_key: abc123xyz",
        "safe_data": "This is safe"
    }
    
    redacted = runner.redact_sensitive_data(data)
    
    assert "***@***.***" in redacted["email"]
    assert "[REDACTED]" in redacted["password"]
    assert "[REDACTED]" in redacted["api_key"]
    assert redacted["safe_data"] == "This is safe"
