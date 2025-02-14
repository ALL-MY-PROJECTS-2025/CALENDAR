#!/bin/bash

until nc -z mysql8-container 3306; do
  echo "Waiting for MySQL to be ready..."
  sleep 2
done

echo "MySQL is ready! Starting exporter..."
exec "$@" 