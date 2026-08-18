@echo off
echo Instalando dependencias del frontend (si hace falta)...
cd frontend
if not exist node_modules (
  call npm install
)
echo Iniciando aplicacion (Vite + React)...
call npm run dev -- --open
cd ..
