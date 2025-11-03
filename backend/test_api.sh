#!/bin/bash

# Simple API test script
# Requires: curl, jq (optional for pretty printing)

API_URL="http://localhost:8000"

echo "Testing Backend API..."
echo "====================="
echo

# Test 1: Health check
echo "1. Health Check"
curl -s "${API_URL}/health" | grep -q "healthy" && echo "✓ Health check passed" || echo "✗ Health check failed"
echo

# Test 2: Register user
echo "2. Register User"
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpass123",
    "full_name": "Test User"
  }')

echo "$REGISTER_RESPONSE" | grep -q "testuser" && echo "✓ User registration passed" || echo "✗ User registration failed"
echo

# Test 3: Login
echo "3. Login"
TOKEN=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

[ -n "$TOKEN" ] && echo "✓ Login passed (Token: ${TOKEN:0:20}...)" || echo "✗ Login failed"
echo

# Test 4: List tools
echo "4. List Tools"
curl -s "${API_URL}/api/tools" | grep -q "port_scanner" && echo "✓ List tools passed" || echo "✗ List tools failed"
echo

# Test 5: Execute tool
echo "5. Execute Tool"
EXECUTION=$(curl -s -X POST "${API_URL}/api/tools/port_scanner/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "target": "example.com"
    }
  }')

echo "$EXECUTION" | grep -q "pending\|running" && echo "✓ Tool execution passed" || echo "✗ Tool execution failed"
echo

echo "====================="
echo "API test completed!"
