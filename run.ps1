Write-Host "Starting EduSpark AI..." -ForegroundColor Green

Write-Host "Starting Backend API..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; ..\venv\Scripts\uvicorn.exe main:app --reload"

Write-Host "Starting Frontend App..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Both services launched in separate windows!" -ForegroundColor Green
Write-Host "Frontend will be running at http://localhost:8080"
Write-Host "Backend will be running at http://127.0.0.1:8000"
