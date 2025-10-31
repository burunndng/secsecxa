import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import json

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models import Tool

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def test_db():
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    
    with open('app/data/tool_definitions.json', 'r') as f:
        data = json.load(f)
    
    for tool_data in data['tools']:
        tool = Tool(
            id=tool_data['id'],
            name=tool_data['name'],
            description=tool_data['description'],
            category=tool_data['category'],
            parameters_schema=tool_data['parameters_schema'],
            result_schema=tool_data['result_schema'],
            default_values=tool_data['default_values'],
            enabled=tool_data['enabled'],
            requires_elevated_privileges=tool_data['requires_elevated_privileges']
        )
        db.add(tool)
    
    db.commit()
    db.close()
    
    yield
    
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "name" in response.json()


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_list_tools(test_db):
    response = client.get("/api/tools")
    assert response.status_code == 200
    data = response.json()
    assert "tools" in data
    assert "total" in data
    assert len(data["tools"]) > 0


def test_list_tools_by_category(test_db):
    response = client.get("/api/tools?category=network")
    assert response.status_code == 200
    data = response.json()
    assert all(tool["category"] == "network" for tool in data["tools"])


def test_get_tool(test_db):
    response = client.get("/api/tools/port_scanner")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "port_scanner"
    assert data["name"] == "Port Scanner"


def test_get_tool_not_found():
    response = client.get("/api/tools/nonexistent")
    assert response.status_code == 404


def test_execute_tool(test_db):
    response = client.post(
        "/api/tools/dns_lookup/execute",
        json={
            "parameters": {
                "domain": "example.com",
                "record_types": ["A"]
            }
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["status"] in ["pending", "running"]
    assert data["tool_id"] == "dns_lookup"


def test_list_executions(test_db):
    client.post(
        "/api/tools/dns_lookup/execute",
        json={
            "parameters": {
                "domain": "example.com"
            }
        }
    )
    
    response = client.get("/api/executions")
    assert response.status_code == 200
    data = response.json()
    assert "executions" in data
    assert "total" in data


def test_get_execution(test_db):
    exec_response = client.post(
        "/api/tools/dns_lookup/execute",
        json={
            "parameters": {
                "domain": "example.com"
            }
        }
    )
    execution_id = exec_response.json()["id"]
    
    response = client.get(f"/api/executions/{execution_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == execution_id
