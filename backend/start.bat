@echo off
title Lanzador del Proyecto I.V.A.N

echo Iniciando servidor Node.js...
start "Node.js Server" cmd /k "cd /d %~dp0 && node server.js"

echo Iniciando microservicio Python (RAG)...
start "RAG Service" cmd /k "cd /d %~dp0services\rag_Services && uvicorn main:app --port 8001"
