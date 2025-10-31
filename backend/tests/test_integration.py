import pytest
from fastapi import status


def test_full_workflow(client, test_tool):
    # 1. Register a user
    register_response = client.post(
        "/auth/register",
        json={
            "email": "workflow@example.com",
            "username": "workflowuser",
            "password": "testpass123",
            "full_name": "Workflow Test User"
        }
    )
    assert register_response.status_code == status.HTTP_201_CREATED
    user_data = register_response.json()
    assert user_data["username"] == "workflowuser"
    
    # 2. Login
    login_response = client.post(
        "/auth/login",
        data={"username": "workflowuser", "password": "testpass123"}
    )
    assert login_response.status_code == status.HTTP_200_OK
    token = login_response.json()["access_token"]
    assert token is not None
    
    # 3. List tools (no auth required for this endpoint)
    tools_response = client.get("/api/tools")
    assert tools_response.status_code == status.HTTP_200_OK
    tools = tools_response.json()
    assert len(tools) > 0
    
    # 4. Get a specific tool
    tool = tools[0]
    tool_response = client.get(f"/api/tools/{tool['id']}")
    assert tool_response.status_code == status.HTTP_200_OK
    tool_data = tool_response.json()
    assert tool_data["id"] == tool["id"]
    
    # 5. Execute the tool
    execute_response = client.post(
        f"/api/tools/{tool['id']}/execute",
        json={
            "parameters": {"test": "value"},
            "user_id": user_data["id"]
        }
    )
    assert execute_response.status_code == status.HTTP_200_OK
    execution = execute_response.json()
    assert execution["tool_id"] == tool["id"]
    assert execution["user_id"] == user_data["id"]
    execution_id = execution["id"]
    
    # 6. Get execution status
    status_response = client.get(f"/api/executions/{execution_id}")
    assert status_response.status_code == status.HTTP_200_OK
    execution_status = status_response.json()
    assert execution_status["id"] == execution_id
    
    # 7. List all executions
    executions_response = client.get("/api/executions")
    assert executions_response.status_code == status.HTTP_200_OK
    executions = executions_response.json()
    assert any(e["id"] == execution_id for e in executions)
    
    # 8. Filter executions by user
    user_executions_response = client.get(f"/api/executions?user_id={user_data['id']}")
    assert user_executions_response.status_code == status.HTTP_200_OK
    user_executions = user_executions_response.json()
    assert all(e["user_id"] == user_data["id"] for e in user_executions)


def test_health_and_root(client):
    # Test root endpoint
    root_response = client.get("/")
    assert root_response.status_code == status.HTTP_200_OK
    root_data = root_response.json()
    assert "name" in root_data
    assert "version" in root_data
    assert "status" in root_data
    
    # Test health endpoint
    health_response = client.get("/health")
    assert health_response.status_code == status.HTTP_200_OK
    health_data = health_response.json()
    assert health_data["status"] == "healthy"
