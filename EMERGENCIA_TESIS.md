# 🚨 GUÍA DE EMERGENCIA - PRESENTACIÓN DE TESIS

## ⚡ ORDEN CRÍTICO DE EJECUCIÓN

**1. PRIMERO desplegar backend → obtener URL del servidor**
**2. SEGUNDO actualizar .env del frontend con esa URL**
**3. TERCERO generar APK con la URL correcta**

## ⏰ TIEMPO LÍMITE: MAÑANA A PRIMERA HORA

## OPCIÓN 1: DESPLEGAR BACKEND EN RAILWAY (MÁS RÁPIDO - 5 MINUTOS)

### Pasos desde cualquier navegador:

1. **Ir a https://railway.app**
2. **Iniciar sesión con GitHub** (tu cuenta: xGrahanx)
3. **Click en "New Project" → "Deploy from GitHub repo"**
4. **Seleccionar: `xGrahanx/lectoescritura-app`**
5. **Configurar:**
   - Root directory: `backend`
   - Build command: `npm install && npx prisma generate`
   - Start command: `npm start`
6. **Agregar variables de entorno (Variables tab):**
   ```
   DATABASE_URL = postgresql://postgres:TU_CONTRASEÑA@localhost:5432/lectoescritura
   PORT = 3000
   GEMINI_API_KEY = TU_API_KEY
   EMAIL_HOST = smtp.gmail.com
   EMAIL_PORT = 587
   EMAIL_USER = tu_correo@gmail.com
   EMAIL_PASS = TU_CONTRASEÑA_DE_APP
   EMAIL_FROM = tu_correo@gmail.com
   ```
7. **Agregar base de datos PostgreSQL:**
   - Click "New" → "Database" → "PostgreSQL"
   - Copiar la DATABASE_URL que te da Railway
   - Reemplazar en las variables de entorno
8. **Ejecutar migraciones:**
   - En Railway, abre la consola de la base de datos
   - Copia y ejecuta el contenido de: `backend/prisma/migrations/soft_delete_y_auditoria_completa.sql`
   - Luego ejecuta: `backend/prisma/migrations/add_auditoria_codigos_recuperacion.sql`
   - Finalmente: `backend/prisma/migrations/add_grado_categoria_to_textos.sql`
9. **Esperar a que esté verde (Running)**
10. **Copiar la URL del backend** (ej: https://lectoescritura-backend.railway.app)
11. **CRÍTICO: Esta URL es la que necesitas para el APK**

## OPCIÓN 2: DESPLEGAR BACKEND EN RENDER (ALTERNATIVA)

### Pasos desde cualquier navegador:

1. **Ir a https://render.com**
2. **Iniciar sesión con GitHub**
3. **Click "New +" → "Web Service"**
4. **Conectar GitHub y seleccionar repo**
5. **Configurar:**
   - Name: `lectoescritura-backend`
   - Root directory: `backend`
   - Build command: `npm install && npx prisma generate`
   - Start command: `npm start`
6. **Agregar variables de entorno (Advanced → Environment Variables):**
   - (Mismas variables que en Railway)
7. **Agregar base de datos PostgreSQL:**
   - Click "New +" → "PostgreSQL"
   - Copiar la Internal Database URL
   - Usarla como DATABASE_URL en el backend
8. **Ejecutar migraciones** (igual que Railway, usando la consola de Render)
9. **Esperar deploy y copiar URL**

## 📱 GENERAR APK DE LA APP MÓVIL

### OPCIÓN A: Expo EAS Build (Requiere cuenta Expo)

1. **Ir a https://expo.dev**
2. **Iniciar sesión con GitHub**
3. **Crear nuevo proyecto**
4. **Conectar tu repo de GitHub**
5. **Configurar build:**
   - Platform: Android
   - Build profile: production
   - Distribution: APK
6. **Esperar build (15-30 minutos)**
7. **Descargar APK**

### OPCIÓN B: Usar Expo Go desde celular (MÁS RÁPIDO)

Si tienes celular con Expo Go:

1. **Desplegar backend primero (arriba) → COPIAR LA URL**
2. **Clonar repo en cualquier PC:**
   ```bash
   git clone git@github.com:xGrahanx/lectoescritura-app.git
   cd lectoescritura-app/lectoescritura
   npm install
   ```
3. **CRÍTICO: Crear .env con URL del servidor (NO tu IP local):**
   ```env
   EXPO_PUBLIC_API_URL=https://lectoescritura-backend.railway.app/api
   ```
   - Reemplaza con la URL que te dio Railway/Render
4. **Iniciar:**
   ```bash
   npx expo start
   ```
5. **Escanear QR con Expo Go en celular**

### OPCIÓN C: Generar APK localmente (Si tienes acceso a PC mañana)

1. **Instalar Android Studio** (para SDK de Android)
2. **Configurar EAS:**
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   eas build --platform android --profile production
   ```

## 🔗 CONECTAR TODO (ORDEN CRÍTICO)

**PASO 1: Desplegar backend**
- Usar Railway o Render (arriba)
- Obtener la URL del servidor (ej: https://lectoescritura-backend.railway.app)

**PASO 2: Actualizar .env del frontend ANTES de generar APK**
- Archivo: `lectoescritura/.env`
- Cambiar de: `EXPO_PUBLIC_API_URL=http://192.168.1.X:3000/api`
- Cambiar a: `EXPO_PUBLIC_API_URL=https://lectoescritura-backend.railway.app/api`
- Commit este cambio al repo

**PASO 3: Generar APK**
- El APK ahora tendrá la URL del servidor embebida
- No dependerá de tu IP local

**PASO 4: Probar**
- Instalar APK en celular
- Debería conectar al backend en Railway/Render

## 📋 CHECKLIST PARA MAÑANA

- [ ] Desplegar backend en Railway/Render (5-10 min)
- [ ] Ejecutar migraciones de base de datos (5 min)
- [ ] Generar APK o usar Expo Go (15-30 min)
- [ ] Probar que la app conecte con el backend
- [ ] Crear usuario administrador en la base de datos
- [ ] Probar funcionalidad completa

## 💡 TRUCO: USAR DATABASE GRATUITA

Si no quieres configurar PostgreSQL local:

**Supabase (gratuito):**
1. Crear cuenta en https://supabase.com
2. Crear nuevo proyecto
3. Copiar DATABASE_URL del proyecto
4. Usar esa URL en Railway/Render
5. Ejecutar migraciones en el SQL Editor de Supabase

## 🆘 SI TODO FALLA

Presenta el proyecto desde el navegador web:

1. **Desplegar solo el backend**
2. **Usar Postman o similar para demostrar la API**
3. **Mostrar el código en GitHub**
4. **Explicar la arquitectura**

## 📞 CONTACTO DE AYUDA

- Railway: https://docs.railway.app
- Render: https://docs.render.com
- Expo: https://docs.expo.dev
- Supabase: https://supabase.com/docs

**¡ÉXITO EN LA TESIS! 🎓**
