@echo off
title Lanzador del Proyecto I.V.A.N

echo Iniciando servidor Node.js...
start "Node.js Server" cmd /k "cd /d %~dp0 && node server.js"

echo Activando entorno virtual de Python...
start "Activar Entorno Virtual" cmd /k "cd /d %~dp0services\rag_Services && call venv\Scripts\activate.bat && uvicorn main:app --port 8001"
