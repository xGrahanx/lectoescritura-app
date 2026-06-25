# lectoescritura-app
Repositorio para el proyecto de la app de la lectoescritura

## ⚡ CONFIGURACIONES CRÍTICAS PARA LA TESIS

### Backend (.env en carpeta backend/)
- DATABASE_URL: postgresql://postgres:TU_CONTRASEÑA@localhost:5432/lectoescritura
- PORT: 3000
- GEMINI_API_KEY: TU_API_KEY_DE_GEMINI
- EMAIL_HOST: smtp.gmail.com
- EMAIL_PORT: 587
- EMAIL_USER: tu_correo@gmail.com
- EMAIL_PASS: TU_CONTRASEÑA_DE_APP
- EMAIL_FROM: tu_correo@gmail.com

### Frontend (.env en carpeta lectoescritura/)
- EXPO_PUBLIC_API_URL: http://TU_IP_LOCAL:3000/api

### Para iniciar el proyecto mañana:
1. Backend: `cd backend && npm start`
2. Frontend: `cd lectoescritura && npx expo start`
3. Escanear QR con Expo Go en celular

### Base de datos:
- Nombre: lectoescritura
- Usuario: postgres
- Puerto: 5432
- Migraciones en: backend/prisma/migrations/

## 📚 Guía Completa
Ver INSTALACION_COMPLETA.md para instrucciones detalladas
