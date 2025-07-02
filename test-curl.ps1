$body = @{
    question = "query battery cover inventory status"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3005/api/multi-step-query" -Method Post -Body $body -ContentType "application/json"

Write-Host "Query successful!"
Write-Host "Workflow status: $($response.workflow.status)"
Write-Host "Steps count: $($response.workflow.steps.Count)"
Write-Host "Intent: $($response.workflow.steps[0].result.intent)"
Write-Host "Data sources: $($response.workflow.steps[1].result.Count)"
Write-Host "Total records: $($response.workflow.steps[3].result.totalRecords)"
Write-Host "Answer preview: $($response.result.answer.Substring(0, [Math]::Min(200, $response.result.answer.Length)))..."
