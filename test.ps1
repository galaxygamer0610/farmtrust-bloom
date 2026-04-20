# Test script for Farmer Credit Assessment Backend

Write-Host "=== Testing Farmer Credit Assessment Backend ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Health Check" -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/health" -Method GET
$health | ConvertTo-Json
Write-Host ""

Write-Host "2. Get Enum Values" -ForegroundColor Yellow
$enums = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/config/enums" -Method GET
$enums | ConvertTo-Json
Write-Host ""

Write-Host "3. Submit Assessment Request" -ForegroundColor Yellow
$body = Get-Content "test-request.json" -Raw
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/assess" -Method POST -Body $body -ContentType "application/json"
    $result | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Expected error (ML service not running):" -ForegroundColor Red
    $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    $errorBody | ConvertFrom-Json | ConvertTo-Json
}
Write-Host ""

Write-Host "=== Tests Complete ===" -ForegroundColor Green
