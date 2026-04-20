#!/bin/bash

echo "=== Testing Farmer Credit Assessment Backend ==="
echo ""

echo "1. Health Check"
curl -s http://localhost:8000/api/v1/health | json_pp
echo ""
echo ""

echo "2. Get Enum Values"
curl -s http://localhost:8000/api/v1/config/enums | json_pp
echo ""
echo ""

echo "3. Submit Assessment Request"
curl -s -X POST http://localhost:8000/api/v1/assess \
  -H "Content-Type: application/json" \
  -d @test-request.json | json_pp
echo ""
