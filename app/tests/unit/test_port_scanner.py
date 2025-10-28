import pytest
from app.services.tools.network.port_scanner import PortScannerRunner


@pytest.mark.asyncio
async def test_validate_parameters_valid():
    runner = PortScannerRunner("test-id")
    
    params = {
        "target": "example.com",
        "ports": "80-443",
        "timeout": 1
    }
    
    validated = runner.validate_parameters(params)
    
    assert validated["target"] == "example.com"
    assert validated["start_port"] == 80
    assert validated["end_port"] == 443
    assert validated["timeout"] == 1.0


@pytest.mark.asyncio
async def test_validate_parameters_single_port():
    runner = PortScannerRunner("test-id")
    
    params = {
        "target": "192.168.1.1",
        "ports": "80"
    }
    
    validated = runner.validate_parameters(params)
    
    assert validated["start_port"] == 80
    assert validated["end_port"] == 80


@pytest.mark.asyncio
async def test_validate_parameters_invalid_target():
    runner = PortScannerRunner("test-id")
    
    params = {
        "target": "example.com; rm -rf /"
    }
    
    with pytest.raises(ValueError):
        runner.validate_parameters(params)


@pytest.mark.asyncio
async def test_validate_parameters_invalid_port_range():
    runner = PortScannerRunner("test-id")
    
    params = {
        "target": "example.com",
        "ports": "1-100000"
    }
    
    with pytest.raises(ValueError):
        runner.validate_parameters(params)


@pytest.mark.asyncio
async def test_get_service_name():
    runner = PortScannerRunner("test-id")
    
    assert runner._get_service_name(80) == "http"
    assert runner._get_service_name(443) == "https"
    assert runner._get_service_name(22) == "ssh"
    assert runner._get_service_name(12345) == "unknown"
