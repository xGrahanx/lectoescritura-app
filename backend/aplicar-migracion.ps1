# Script para aplicar la migración de auditoría completa y soft delete
# Ejecutar con: .\aplicar-migracion.ps1

Write-Host "Aplicando migración de auditoría completa y soft delete..." -ForegroundColor Cyan

$env:PGPASSWORD = "gabriel"

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d lectoescritura -f prisma/migrations/soft_delete_y_auditoria_completa.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migración aplicada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verificando triggers creados..." -ForegroundColor Cyan
    
    $query = "SELECT COUNT(*) as total FROM information_schema.triggers WHERE trigger_name LIKE 'trigger_auditoria_%';"
    $result = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d lectoescritura -t -c $query
    
    Write-Host "Total de triggers creados: $result" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verificando campo 'activo' en tablas..." -ForegroundColor Cyan
    
    $query2 = "SELECT COUNT(DISTINCT table_name) as total FROM information_schema.columns WHERE column_name = 'activo' AND table_schema = 'public';"
    $result2 = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d lectoescritura -t -c $query2
    
    Write-Host "Total de tablas con campo 'activo': $result2" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Sistema de auditoría completa y borrado lógico listo!" -ForegroundColor Green
} else {
    Write-Host "❌ Error al aplicar la migración" -ForegroundColor Red
}

Remove-Item Env:\PGPASSWORD
