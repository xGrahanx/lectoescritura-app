# Script para insertar cartas de memoria
Write-Host "Insertando cartas de memoria..." -ForegroundColor Cyan
$env:PGPASSWORD = "gabriel"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d lectoescritura -f prisma/migrations/insert_cartas_memoria.sql
Remove-Item Env:\PGPASSWORD
