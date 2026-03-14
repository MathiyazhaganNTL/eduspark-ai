@echo off
echo Starting EduSpark AI Backend...
start cmd /k "cd backend && ..\venv\Scripts\uvicorn.exe main:app --reload"

echo Starting EduSpark AI Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both services launched in separate windows!
echo Frontend will be running at http://localhost:8080
echo Backend will be running at http://127.0.0.1:8000
