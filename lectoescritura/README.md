# LectoEscritura App

Aplicacion movil para el aprendizaje de lectoescritura en la **Escuela Nacional Jose Gabriel Alviares**, desarrollada con **React Native + Expo**.

## Caracteristicas

- 3 roles: Estudiante, Docente y Administrador
- Modulos de Lectura, Escritura y Ejercicios con IA (Google Gemini)
- Evaluacion automatica de respuestas con retroalimentacion personalizada
- El docente monitorea el rendimiento de sus estudiantes en tiempo real
- Asignacion de tareas a cualquier estudiante con texto o ejercicio especifico de la BD
- Alertas automaticas al docente sobre errores frecuentes, logros e inactividad
- Modo offline con sincronizacion automatica (expo-sqlite)
- Panel de administracion para gestion de usuarios con conexion real a PostgreSQL

## Tecnologias

### App movil
- **React Native + Expo** (~54)
- **React Navigation** (Stack + Bottom Tabs)
- **@expo/vector-icons** (MaterialCommunityIcons)
- **expo-sqlite** para almacenamiento offline
- **expo-network** para deteccion de conectividad
- **@react-native-async-storage/async-storage** para persistencia de sesion
- **Axios** para llamadas a la API REST

### Backend
- **Node.js + Express** servidor de la API REST
- **PostgreSQL** base de datos relacional
- **Prisma** ORM para manejo de la base de datos
- **bcryptjs** para hashear contrasenas
- **dotenv** para variables de entorno
- **cors** para permitir peticiones desde la app
- **nodemon** para reinicio automatico en desarrollo

## Por que Prisma y Axios?

**Prisma** es un ORM que se usa en el backend para no escribir SQL directamente. En vez de `SELECT * FROM usuarios`, se escribe `prisma.usuario.findMany()`. Con el archivo `schema.prisma` se definen las tablas y con `prisma migrate dev` se crean automaticamente en PostgreSQL.

**Axios** es la libreria que usa la app movil para hacer peticiones HTTP al backend. Maneja errores, timeouts y conversion de JSON de forma mas comoda que el `fetch` nativo.

El flujo completo es: **App (Axios) → Express (Node.js) → Prisma → PostgreSQL**

## Estructura del proyecto

```
lectoescritura-app/
├── lectoescritura/                # App movil (Expo)
│   ├── App.jsx                    # Entry point
│   ├── .env                       # IP del backend (no subir al repo)
│   ├── .env.example               # Plantilla de configuracion
│   └── src/
│       ├── context/
│       │   ├── AuthContext.jsx    # Autenticacion y sesion
│       │   └── OfflineContext.jsx # Estado de conexion
│       ├── navigation/            # Navegadores por rol
│       ├── screens/
│       │   ├── auth/              # Login, Registro, RecuperarPassword
│       │   ├── student/           # Inicio, Lectura, Escritura, IA, Progreso, Tareas
│       │   ├── teacher/           # Dashboard, Estudiantes, Detalle, AsignarTarea, Alertas, Perfil
│       │   └── admin/             # Dashboard, GestionUsuarios, Reportes, Configuracion
│       ├── services/
│       │   ├── authService.js     # Login / Registro API
│       │   ├── iaService.js       # Integracion con Google Gemini
│       │   └── offlineService.js  # SQLite local
│       └── utils/
│           └── constantes.js      # Colores, roles, URL del backend
└── backend/                       # API REST (Node.js)
    ├── src/
    │   ├── index.js               # Entry point del servidor
    │   ├── seed.js                # Datos iniciales (textos y ejercicios)
    │   └── routes/
    │       ├── auth.js            # POST /login, POST /registro
    │       ├── usuarios.js        # CRUD usuarios + stats
    │       ├── grupos.js          # CRUD grupos + gestion de estudiantes
    │       ├── tareas.js          # CRUD tareas por estudiante/docente
    │       ├── textos.js          # CRUD textos de lectura
    │       ├── ejercicios.js      # CRUD ejercicios de escritura
    │       └── progreso.js        # Progreso diario + resultados lectura/escritura
    ├── prisma/
    │   └── schema.prisma          # Modelos de la base de datos
    └── .env                       # Credenciales de PostgreSQL
```

## Endpoints del backend

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/auth/login | Iniciar sesion |
| POST | /api/auth/registro | Registrar cuenta |
| GET | /api/usuarios | Listar usuarios |
| POST | /api/usuarios | Crear usuario |
| PUT | /api/usuarios/:id | Editar usuario |
| DELETE | /api/usuarios/:id | Eliminar usuario (soft delete) |
| GET | /api/usuarios/stats | Conteo por rol |
| GET | /api/grupos | Listar grupos |
| POST | /api/grupos | Crear grupo |
| GET | /api/grupos/docente/:id | Grupos de un docente |
| POST | /api/grupos/:id/estudiantes | Agregar estudiante al grupo |
| DELETE | /api/grupos/:id/estudiantes/:id | Quitar estudiante del grupo |
| GET | /api/tareas/estudiante/:id | Tareas de un estudiante |
| GET | /api/tareas/docente/:id | Tareas creadas por un docente |
| POST | /api/tareas | Crear tarea |
| PUT | /api/tareas/:id/estado | Cambiar estado de tarea |
| DELETE | /api/tareas/:id | Eliminar tarea |
| GET | /api/textos | Listar textos (filtro por nivel) |
| GET | /api/textos/:id | Obtener texto completo |
| POST | /api/textos | Crear texto |
| PUT | /api/textos/:id | Editar texto |
| GET | /api/ejercicios | Listar ejercicios (filtro por tipo/nivel) |
| GET | /api/ejercicios/:id | Obtener ejercicio |
| POST | /api/ejercicios | Crear ejercicio |
| GET | /api/progreso/:id | Progreso diario (ultimos 30 dias) |
| GET | /api/progreso/:id/resumen | Resumen general del estudiante |
| POST | /api/progreso/:id | Registrar progreso del dia |
| GET | /api/progreso/:id/lectura | Resultados de lectura |
| POST | /api/progreso/:id/lectura | Guardar resultado de lectura |
| GET | /api/progreso/:id/escritura | Resultados de escritura |
| POST | /api/progreso/:id/escritura | Guardar resultado de escritura |
| GET | /api/auditoria | Listar registros de auditoría (admin) |
| GET | /api/auditoria/stats/resumen | Estadísticas de auditoría (admin) |
| GET | /api/reportes/pdf | Generar y descargar reporte en PDF (admin) |
| GET | /api/reportes/progreso-mensual | Progreso mensual del sistema |
| GET | /api/reportes/rendimiento | Distribución de rendimiento |
| GET | /api/reportes/modulos | Uso de módulos |
| GET | /api/reportes/alertas | Resumen de alertas |

## Instalacion

### Backend

```bash
cd backend
npm install

# Aplicar migración de auditoría (primera vez)
.\aplicar-migracion.ps1

# O si prefieres usar psql directamente:
# $env:PGPASSWORD = "tu_password"
# & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5432 -U postgres -d lectoescritura -f prisma/migrations/soft_delete_y_auditoria_completa.sql

# Generar cliente de Prisma
npx prisma generate

# Insertar datos de prueba (opcional)
node src/seed.js

# Iniciar servidor
npm run dev
```

### App movil

```bash
cd lectoescritura
npm install
npx expo start
```

Escanea el QR con la app **Expo Go** en tu dispositivo Android o iOS.

## Configurar la IP

Copia el archivo de ejemplo y pon tu IP local:

```bash
cp lectoescritura/.env.example lectoescritura/.env
```

Edita `lectoescritura/.env` con tu IP (corre `ipconfig` en Windows):

```
EXPO_PUBLIC_API_URL=http://192.168.X.X:3000/api
```

> El celular y la PC deben estar en la misma red WiFi.

## Roles y responsabilidades

- **Estudiante**: realiza ejercicios de lectura, escritura e IA, ve su progreso y tareas asignadas
- **Docente**: monitorea el rendimiento del grupo, asigna tareas con textos/ejercicios especificos a cualquier estudiante, puede eliminar tareas pendientes
- **Administrador**: gestiona usuarios (crear/editar/eliminar), ve reportes y configura el sistema

## Completado (28 de Abril, 2026)

### ✅ Sistema de Auditoría Completa
- **60 triggers automáticos** en PostgreSQL
- **13 tablas auditadas** (100% del sistema)
- Registra automáticamente INSERT, UPDATE, DELETE
- Guarda datos anteriores y nuevos en formato JSON
- Pantalla de auditoría para administradores

### ✅ Borrado Lógico (Soft Delete)
- Campo `activo` agregado a **11 tablas**
- Ningún dato se elimina físicamente
- Todos los registros son 100% recuperables
- Cumplimiento de normativas GDPR

### ✅ Sistema de Reportes en PDF
- Endpoint `GET /api/reportes/pdf` para generar reportes
- Descarga y compartir PDF en la app móvil
- Solo disponible para administrador
- Incluye: resumen general, distribución de rendimiento, uso de módulos, progreso mensual, alertas

### ✅ Mejoras Adicionales
- Detalle de estudiante con módulo de IA
- Sistema de progreso actualizado en todos los módulos (lectura, escritura, IA)
- Sistema de alertas mejorado con cálculo correcto de inactividad
- Reportes con datos en tiempo real desde PostgreSQL

### 📊 Estadísticas
```
✅ 60 triggers de auditoría
✅ 13 tablas auditadas (100%)
✅ 11 tablas con borrado lógico
✅ 7 endpoints con soft delete
✅ 100% de trazabilidad
✅ 0% de pérdida de datos
```

## Pendiente

- Integracion completa con **Google Gemini** para evaluacion de respuestas y sugerencias de tareas personalizadas segun rendimiento
- Modo offline con sincronizacion automatica via expo-sqlite
