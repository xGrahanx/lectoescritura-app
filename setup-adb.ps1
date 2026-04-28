# Script para configurar ADB y hacer port forwarding
Write-Host "Configurando ADB..." -ForegroundColor Cyan

# Agregar ADB al PATH de esta sesion
$env:Path += ";$env:LOCALAPPDATA\Android\Sdk\platform-tools"

# Verificar dispositivos
Write-Host "`nDispositivos conectados:" -ForegroundColor Yellow
adb devices

# Hacer port forwarding
Write-Host "`nConfigurando port forwarding (puerto 3000)..." -ForegroundColor Yellow
adb reverse tcp:3000 tcp:3000

Write-Host "`nListo! Ahora tu app puede usar http://localhost:3000/api" -ForegroundColor Green
Write-Host "Reinicia tu app de Expo para que tome los cambios del .env" -ForegroundColor Cyan
