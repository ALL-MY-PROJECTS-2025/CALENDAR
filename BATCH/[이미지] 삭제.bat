@echo off
setlocal enabledelayedexpansion

echo Stopping all running Docker containers...
for /f "tokens=*" %%i in ('docker ps -q') do (
    docker stop %%i
)

echo Removing all Docker containers...
for /f "tokens=*" %%i in ('docker ps -aq') do (
    docker rm %%i
)

echo Removing all Docker images...
for /f "tokens=*" %%i in ('docker images -q') do (
    docker rmi -f %%i
)

echo Cleanup completed.