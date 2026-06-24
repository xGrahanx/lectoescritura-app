# 📚 Guía de Instalación Completa - LectoEscritura App

Esta guía explica paso a paso cómo instalar y configurar la aplicación LectoEscritura para que funcione correctamente.

## 📋 Requisitos Previos

Antes de empezar, necesitas tener instalado:

### 1. **Node.js** (v18 o superior)
- Descargar desde: https://nodejs.org/
- Verificar instalación: `node --version`

### 2. **PostgreSQL** (v14 o superior)
- Descargar desde: https://www.postgresql.org/download/windows/
- Durante la instalación, anota la contraseña que configures para el usuario `postgres`
- Verificar instalación: Abre "SQL Shell (psql)" y conecta con tu contraseña

### 3. **Git** (opcional, pero recomendado)
- Descargar desde: https://git-scm.com/download/win

### 4. **Expo Go** (en tu celular Android/iOS)
- Android: Descargar desde Google Play Store
- iOS: Descargar desde App Store

---

## 🗂️ Estructura del Proyecto

```
lectoescritura-app/
├── backend/          # Servidor Node.js + Express + PostgreSQL
├── lectoescritura/   # App móvil React Native + Expo
└── INSTALACION_COMPLETA.md  # Este archivo
```

---

## 🚀 Paso 1: Configuración de la Base de Datos

### 1.1 Crear la base de datos en PostgreSQL

1. Abre "SQL Shell (psql)" desde el menú de inicio
2. Ingresa la contraseña del usuario `postgres` cuando te la pida
3. Ejecuta el siguiente comando:

```sql
CREATE DATABASE lectoescritura;
```

4. Verifica que se creó:

```sql
\l
```

Deberías ver `lectoescritura` en la lista.
5. Sal de psql con: `\q`

### 1.2 Ejecutar las migraciones de la base de datos

1. Abre una terminal (PowerShell o CMD)
2. Navega a la carpeta del backend:

```powershell
cd C:\Users\Gabriel\Desktop\lectoescritura-app\backend
```

3. Instala las dependencias del backend:

```powershell
npm install
```

4. Genera el cliente de Prisma:

```powershell
npx prisma generate
```

5. Ejecuta las migraciones (esto crea todas las tablas):

```powershell
# Primero, ejecuta la migración principal
psql -h localhost -p 5432 -U postgres -d lectoescritura -f prisma/migrations/soft_delete_y_auditoria_completa.sql

# Luego, ejecuta la migración de códigos de recuperación
psql -h localhost -p 5432 -U postgres -d lectoescritura -f prisma/migrations/add_auditoria_codigos_recuperacion.sql

# Finalmente, ejecuta la migración de campos grado y categoría
psql -h localhost -p 5432 -U postgres -d lectoescritura -f prisma/migrations/add_grado_categoria_to_textos.sql
```

**Nota:** Te pedirá la contraseña de PostgreSQL cada vez. Ingrésala.

---

## 🔧 Paso 2: Configuración del Backend

### 2.1 Crear archivo .env

1. En la carpeta `backend`, crea un archivo llamado `.env`
2. Copia el siguiente contenido:

```env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/lectoescritura"
PORT=3000
GEMINI_API_KEY=TU_API_KEY_DE_GEMINI
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=TU_CONTRASEÑA_DE_APP
EMAIL_FROM=tu_correo@gmail.com
```

### 2.2 Configurar cada variable

- **DATABASE_URL**: Reemplaza `TU_CONTRASEÑA` con la contraseña que configuraste al instalar PostgreSQL
- **GEMINI_API_KEY**: 
  - Ve a https://makersuite.google.com/app/apikey
  - Crea una API key gratuita
  - Cópiala aquí
- **EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM**:
  - Si usas Gmail, necesitas una "Contraseña de aplicación"
  - Ve a tu cuenta de Google → Seguridad → Contraseñas de aplicación
  - Genera una nueva contraseña para "Correo"
  - Usa esa contraseña en `EMAIL_PASS`

### 2.3 Probar el backend

1. En la terminal, en la carpeta `backend`:

```powershell
npm start
```

2. Deberías ver algo como:
```
Servidor corriendo en puerto 3000
Base de datos conectada
```

3. Deja esta terminal abierta (el backend debe estar corriendo)

---

## 📱 Paso 3: Configuración del Frontend (App Móvil)

### 3.1 Instalar dependencias del frontend

1. Abre una NUEVA terminal (no cierres la del backend)
2. Navega a la carpeta del frontend:

```powershell
cd C:\Users\Gabriel\Desktop\lectoescritura-app\lectoescritura
```

3. Instala las dependencias:

```powershell
npm install
```

### 3.2 Configurar la URL del backend

1. En la carpeta `lectoescritura`, crea un archivo llamado `.env`
2. Copia el siguiente contenido:

```env
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:3000/api
```

### 3.3 Encontrar tu IP local

1. Abre una terminal y ejecuta:

```powershell
ipconfig
```

2. Busca "IPv4 Address" bajo "Adaptador de Wi-Fi" o "Ethernet"
3. Ejemplo: `192.168.1.50`
4. Reemplaza `TU_IP_LOCAL` con esa dirección

**Ejemplo final:**
```env
EXPO_PUBLIC_API_URL=http://192.168.1.50:3000/api
```

### 3.4 Iniciar la app móvil

1. En la terminal del frontend, ejecuta:

```powershell
npx expo start
```

2. Deberías ver un código QR en la terminal
3. Abre la app **Expo Go** en tu celular
4. Escanea el código QR
5. La app debería cargarse en tu celular

**Opción alternativa (sin escanear QR):**
- Presiona `w` en la terminal para abrir en el navegador web
- Presiona `a` para abrir en el emulador de Android (si tienes Android Studio instalado)

---

## 👤 Paso 4: Crear Usuarios Iniciales

### 4.1 Crear un administrador

Necesitas crear el primer usuario directamente en la base de datos:

1. Abre "SQL Shell (psql)"
2. Conecta a la base de datos:

```sql
\c lectoescritura
```

3. Ejecuta este comando (la contraseña debe tener mayúscula y número):

```sql
INSERT INTO usuarios (nombre, apellido, correo, password, rol, activo)
VALUES ('Admin', 'Sistema', 'admin@escuela.com', '$2a$12$TuPasswordHash123', 'administrador', true);
```

**⚠️ IMPORTANTE:** El hash de arriba es solo ejemplo. Para crear un usuario real, usa este script en Node.js:

Crea un archivo `crear_admin.js` en la carpeta `backend`:

```javascript
const bcrypt = require('bcryptjs');

async function crearAdmin() {
  const password = 'Admin123'; // Cambia esto
  const hash = await bcrypt.hash(password, 12);
  console.log('Hash:', hash);
}

crearAdmin();
```

Ejecútalo con `node crear_admin.js` y usa el hash generado en el SQL.

### 4.2 Crear usuarios desde la app

Una vez que tengas el administrador:
1. Inicia sesión en la app con el administrador
2. Ve a la sección de "Usuarios"
3. Crea docentes y estudiantes desde ahí

### 4.3 Registro público de estudiantes

Los estudiantes pueden registrarse directamente desde la pantalla de registro:
- Solo se permite el rol "estudiante"
- Los docentes deben ser creados por el administrador

---

## 🔍 Paso 5: Verificar que Todo Funciona

### 5.1 Verificar el backend

Abre tu navegador y ve a:
```
http://localhost:3000/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "message": "Servidor funcionando"
}
```

### 5.2 Verificar la conexión móvil

1. En la app móvil, intenta registrarte como estudiante
2. Si funciona, la conexión está correcta
3. Si falla, verifica:
   - Que el backend esté corriendo
   - Que la IP en `.env` sea correcta
   - Que tu celular y PC estén en la misma red Wi-Fi

---

## 🛠️ Solución de Problemas Comunes

### ❌ Error: "Connection refused"

**Problema:** El backend no está corriendo o el puerto está ocupado.

**Solución:**
1. Verifica que el backend esté corriendo en la terminal
2. Si el puerto 3000 está ocupado, cambia el PORT en `.env` del backend
3. Asegúrate de que el firewall no esté bloqueando el puerto

### ❌ Error: "Database connection failed"

**Problema:** PostgreSQL no está corriendo o la contraseña es incorrecta.

**Solución:**
1. Verifica que PostgreSQL esté instalado y corriendo
2. Abre "Services" en Windows y verifica que "postgresql-x64-18" esté "Running"
3. Verifica la contraseña en `DATABASE_URL` del `.env`

### ❌ Error: "Expo Go no puede conectar"

**Problema:** Tu celular y PC no están en la misma red.

**Solución:**
1. Asegúrate de que ambos estén conectados al mismo Wi-Fi
2. Verifica la IP con `ipconfig`
3. Actualiza `EXPO_PUBLIC_API_URL` en el `.env` del frontend
4. Reinicia la app móvil (cierra y ábrela de nuevo)

### ❌ Error: "Migraciones fallidas"

**Problema:** Las tablas ya existen o hay errores de SQL.

**Solución:**
1. Si las tablas ya existen, puedes eliminarlas y recrear:

```sql
DROP TABLE IF EXISTS auditoria CASCADE;
DROP TABLE IF EXISTS codigos_recuperacion CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
-- Repite para todas las tablas
```

2. Luego ejecuta las migraciones de nuevo

### ❌ Error: "IA no disponible"

**Problema:** La API key de Gemini no está configurada o es inválida.

**Solución:**
1. Verifica que `GEMINI_API_KEY` esté en el `.env` del backend
2. Genera una nueva API key en https://makersuite.google.com/app/apikey
3. Reinicia el backend

### ❌ Error: "Correo no se envía"

**Problema:** Configuración incorrecta del servicio de correo.

**Solución:**
1. Si usas Gmail, usa una "Contraseña de aplicación" (no tu contraseña normal)
2. Verifica que `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` sean correctos
3. Para pruebas, puedes comentar la parte del correo en el código

---

## 📝 Resumen Rápido

1. **Instalar requisitos:** Node.js, PostgreSQL, Expo Go
2. **Crear BD:** `CREATE DATABASE lectoescritura;` en psql
3. **Backend:**
   - `cd backend && npm install`
   - Crear `.env` con DATABASE_URL y GEMINI_API_KEY
   - Ejecutar migraciones SQL
   - `npm start` (dejar corriendo)
4. **Frontend:**
   - `cd lectoescritura && npm install`
   - Crear `.env` con EXPO_PUBLIC_API_URL (tu IP local)
   - `npx expo start`
   - Escanear QR con Expo Go
5. **Crear admin:** Insertar usuario en BD con hash de contraseña
6. **¡Listo!**

---

## 🆘 Ayuda Adicional

Si algo no funciona:

1. **Revisa las terminales:** Los errores suelen aparecer ahí
2. **Revisa los archivos .env:** Que todas las variables estén correctas
3. **Revisa la red:** Que celular y PC estén en el mismo Wi-Fi
4. **Reinicia todo:** Cierra terminales, vuelve a ejecutar comandos

---

## 📞 Contacto

Si tienes problemas, contacta al desarrollador original.

---

**¡Buena suerte! 🎉**
