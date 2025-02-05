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


echo Cleanup completed.
