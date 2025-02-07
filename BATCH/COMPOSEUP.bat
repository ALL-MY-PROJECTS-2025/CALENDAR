@echo off
cd /d "%~dp0.."  REM 현재 배치 파일이 있는 폴더의 상위 폴더로 이동
docker-compose up
pause  REM 창이 바로 닫히지 않도록 설정
