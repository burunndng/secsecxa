import pytest
from fastapi import status
import asyncio


def test_list_executions(client, test_tool, db):
    from app.models.execution import Execution
    
    execution = Execution(
        id="test-exec-1",
        tool_id=test_tool.id,
        parameters={},
        status="completed"
    )
    db.add(execution)
    db.commit()
    
    response = client.get("/api/executions")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["id"] == "test-exec-1"


def test_list_executions_by_tool(client, test_tool, db):
    from app.models.execution import Execution
    
    execution = Execution(
        id="test-exec-2",
        tool_id=test_tool.id,
        parameters={},
        status="completed"
    )
    db.add(execution)
    db.commit()
    
    response = client.get(f"/api/executions?tool_id={test_tool.id}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert all(exec["tool_id"] == test_tool.id for exec in data)


def test_list_executions_by_status(client, test_tool, db):
    from app.models.execution import Execution
    
    execution = Execution(
        id="test-exec-3",
        tool_id=test_tool.id,
        parameters={},
        status="running"
    )
    db.add(execution)
    db.commit()
    
    response = client.get("/api/executions?status=running")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert all(exec["status"] == "running" for exec in data)


def test_get_execution(client, test_tool, db):
    from app.models.execution import Execution
    
    execution = Execution(
        id="test-exec-4",
        tool_id=test_tool.id,
        parameters={"test": "value"},
        status="completed",
        result={"output": "success"}
    )
    db.add(execution)
    db.commit()
    
    response = client.get(f"/api/executions/{execution.id}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == execution.id
    assert data["status"] == "completed"
    assert data["result"]["output"] == "success"


def test_get_nonexistent_execution(client):
    response = client.get("/api/executions/nonexistent")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_execution_lifecycle(client, test_tool):
    execute_response = client.post(
        f"/api/tools/{test_tool.id}/execute",
        json={"parameters": {"test": "value"}}
    )
    
    assert execute_response.status_code == status.HTTP_200_OK
    execution_data = execute_response.json()
    execution_id = execution_data["id"]
    
    get_response = client.get(f"/api/executions/{execution_id}")
    assert get_response.status_code == status.HTTP_200_OK
    
    list_response = client.get("/api/executions")
    assert list_response.status_code == status.HTTP_200_OK
    execution_ids = [exec["id"] for exec in list_response.json()]
    assert execution_id in execution_ids


def test_execution_with_user(client, test_tool, test_user):
    response = client.post(
        f"/api/tools/{test_tool.id}/execute",
        json={"parameters": {}, "user_id": test_user.id}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["user_id"] == test_user.id


def test_execution_pagination(client, test_tool, db):
    from app.models.execution import Execution
    
    for i in range(10):
        execution = Execution(
            id=f"test-exec-page-{i}",
            tool_id=test_tool.id,
            parameters={},
            status="completed"
        )
        db.add(execution)
    db.commit()
    
    response = client.get("/api/executions?limit=5&offset=0")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 5
    
    response = client.get("/api/executions?limit=5&offset=5")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 5


def test_execution_captures_stdout_stderr(client, test_tool, db):
    from app.models.execution import Execution
    
    execution = Execution(
        id="test-exec-output",
        tool_id=test_tool.id,
        parameters={},
        status="completed",
        stdout="Standard output",
        stderr="Standard error"
    )
    db.add(execution)
    db.commit()
    
    response = client.get(f"/api/executions/{execution.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["stdout"] == "Standard output"
    assert data["stderr"] == "Standard error"
