#!/bin/bash

echo "🕒 Waiting for SQL Server to be available..."
until /opt/mssql-tools/bin/sqlcmd -S db -U sa -P "Quangcao1@" -Q "SELECT 1" &> /dev/null
do
  sleep 2
done

echo "✅ SQL Server is up, running migrations..."
dotnet ef database update

echo "🚀 Starting app..."
dotnet AIGenVideo.Server.dll
