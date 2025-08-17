@echo off
echo Iniciando FaceLog...
start cmd /k "cd /d C:\facelog\backend_django && venv\Scripts\activate && python manage.py runserver"
timeout /t 3 /nobreak >nul
start cmd /k "cd /d C:\facelog\frontend_react\frontend && npm start"
echo Servicios iniciados!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
pause
