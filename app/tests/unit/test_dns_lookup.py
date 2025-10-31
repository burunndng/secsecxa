import pytest
from app.services.tools.network.dns_lookup import DNSLookupRunner


@pytest.mark.asyncio
async def test_validate_parameters_valid():
    runner = DNSLookupRunner("test-id")
    
    params = {
        "domain": "example.com",
        "record_types": ["A", "MX"]
    }
    
    validated = runner.validate_parameters(params)
    
    assert validated["domain"] == "example.com"
    assert "A" in validated["record_types"]
    assert "MX" in validated["record_types"]


@pytest.mark.asyncio
async def test_validate_parameters_string_record_types():
    runner = DNSLookupRunner("test-id")
    
    params = {
        "domain": "example.com",
        "record_types": "A, AAAA, MX"
    }
    
    validated = runner.validate_parameters(params)
    
    assert "A" in validated["record_types"]
    assert "AAAA" in validated["record_types"]
    assert "MX" in validated["record_types"]


@pytest.mark.asyncio
async def test_validate_parameters_default_record_types():
    runner = DNSLookupRunner("test-id")
    
    params = {
        "domain": "example.com"
    }
    
    validated = runner.validate_parameters(params)
    
    assert len(validated["record_types"]) > 0


@pytest.mark.asyncio
async def test_validate_parameters_invalid_domain():
    runner = DNSLookupRunner("test-id")
    
    params = {
        "domain": "example.com; whoami"
    }
    
    with pytest.raises(ValueError):
        runner.validate_parameters(params)
