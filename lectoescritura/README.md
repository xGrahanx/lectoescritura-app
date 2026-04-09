# LectoEscritura App

Aplicacion movil para el aprendizaje de lectoescritura en la **Escuela Nacional Jose Gabriel Alviares**, desarrollada con **React Native + Expo**.

## Caracteristicas

- 3 roles: Estudiante, Docente y Administrador
- Modulos de Lectura, Escritura y Ejercicios con IA (Google Gemini)
- Evaluacion automatica de respuestas con retroalimentacion personalizada
- El docente monitorea el rendimiento de sus estudiantes en tiempo real
- Alertas automaticas al docente sobre errores frecuentes, logros e inactividad
- Asignacion de tareas adicionales para estudiantes de alto rendimiento
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

Para conectar la app con la base de datos use dos herramientas principales que me facilitaron mucho el trabajo:

**Prisma** es un ORM (Object Relational Mapper) que use en el backend para no tener que escribir SQL directamente. En vez de escribir `SELECT * FROM usuarios`, simplemente escribo `prisma.usuario.findMany()` y el se encarga de traducirlo a SQL y ejecutarlo en PostgreSQL. Ademas, con el archivo `schema.prisma` defino como son mis tablas y con un solo comando `prisma migrate dev` el crea todas las tablas en la base de datos automaticamente.

**Axios** es una libreria que use en la app movil para hacer las peticiones HTTP al backend. Cuando el administrador crea un usuario, Axios manda esos datos al servidor con `axios.post(...)`, y cuando necesito listar los usuarios uso `axios.get(...)`. Es mucho mas comodo que el `fetch` nativo de JavaScript porque maneja automaticamente los errores, los timeouts y la conversion de JSON.

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
│       │   ├── teacher/           # Dashboard, Estudiantes, Alertas, Perfil
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
    │   └── routes/
    │       └── usuarios.js        # GET, POST, DELETE /api/usuarios
    ├── prisma/
    │   └── schema.prisma          # Modelos de la base de datos
    └── .env                       # Credenciales de PostgreSQL
```

## Instalacion

### App movil

```bash
cd lectoescritura
npm install
npx expo start
```

Escanea el QR con la app **Expo Go** en tu dispositivo Android o iOS.

### Backend

```bash
cd backend
npm install
$env:DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/lectoescritura"; npx prisma migrate dev --name init
npm run dev
```

## Configurar la IP

Copia el archivo de ejemplo y pon tu IP local:

```bash
cp lectoescritura/.env.example lectoescritura/.env
```

Edita `lectoescritura/.env` con tu IP (corre `ipconfig` en Windows para verla):

```
EXPO_PUBLIC_API_URL=http://192.168.X.X:3000/api
```

> El celular y la PC deben estar conectados a la misma red WiFi.

## Credenciales demo (sin backend)

La app incluye modo demo para presentaciones sin necesidad de servidor:

| Correo                  | Contrasena | Rol            |
|-------------------------|------------|----------------|
| estudiante@demo.com     | demo123    | Estudiante     |
| docente@demo.com        | demo123    | Docente        |
| admin@demo.com          | demo123    | Administrador  |

## Roles y responsabilidades

- **Estudiante**: realiza ejercicios de lectura, escritura e IA, ve su progreso y tareas asignadas
- **Docente**: monitorea el rendimiento del grupo, recibe alertas de la IA, asigna tareas adicionales
- **Administrador**: gestiona usuarios (crear/eliminar con validacion), ve reportes y configura el sistema
