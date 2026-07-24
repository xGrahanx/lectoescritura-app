# Script para crear tabla cartas_memoria
Write-Host "Creando tabla cartas_memoria..." -ForegroundColor Cyan
$env:PGPASSWORD = "gabriel"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d lectoescritura -f prisma/migrations/create_cartas_memoria.sql
Remove-Item Env:\PGPASSWORD
