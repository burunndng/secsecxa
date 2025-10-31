import pytest
from fastapi import status


def test_list_tools(client, test_tool):
    response = client.get("/api/tools")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["id"] == "test_tool"


def test_list_tools_by_category(client, test_tool):
    response = client.get("/api/tools?category=test")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["category"] == "test"


def test_list_tools_by_enabled(client, test_tool, db):
    from app.models.tool import Tool
    
    disabled_tool = Tool(
        id="disabled_tool",
        name="Disabled Tool",
        description="A disabled tool",
        category="test",
        parameters_schema={},
        result_schema={},
        default_values={},
        enabled=False
    )
    db.add(disabled_tool)
    db.commit()
    
    response = client.get("/api/tools?enabled=true")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert all(tool["enabled"] for tool in data)


def test_get_tool(client, test_tool):
    response = client.get(f"/api/tools/{test_tool.id}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_tool.id
    assert data["name"] == test_tool.name


def test_get_nonexistent_tool(client):
    response = client.get("/api/tools/nonexistent")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_execute_tool(client, test_tool):
    response = client.post(
        f"/api/tools/{test_tool.id}/execute",
        json={"parameters": {"test_param": "value"}}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "id" in data
    assert data["tool_id"] == test_tool.id
    assert data["status"] in ["pending", "running"]


def test_execute_nonexistent_tool(client):
    response = client.post(
        "/api/tools/nonexistent/execute",
        json={"parameters": {}}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_execute_disabled_tool(client, test_tool, db):
    test_tool.enabled = False
    db.commit()
    
    response = client.post(
        f"/api/tools/{test_tool.id}/execute",
        json={"parameters": {}}
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_tool_listing_metadata(client, test_tool):
    response = client.get("/api/tools")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    tool = data[0]
    
    assert "parameters_schema" in tool
    assert "result_schema" in tool
    assert "default_values" in tool
    assert "requires_elevated_privileges" in tool
