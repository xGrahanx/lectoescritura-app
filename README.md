# LectoEscritura App

Plataforma educativa para el aprendizaje y reforzamiento de la lectoescritura en estudiantes de educación primaria, desarrollada para la **Escuela Nacional José Álvarez de Lugo**. 

El sistema combina una **aplicación móvil híbrida** (React Native / Expo) con un **servidor API REST centralizado** (Node.js / Express / PostgreSQL / Prisma) e integración con **Google Gemini AI**.

---

## 🏛️ Arquitectura del Sistema

```text
               +----------------------------------+
               |  App Móvil (React Native + Expo) |
               +----------------------------------+
                                 |
                     Peticiones HTTP (Axios / JSON)
                                 v
               +----------------------------------+
               |     API REST (Node.js + Express) |
               +----------------------------------+
                     |            |          |
                     v            v          v
               PostgreSQL   Google Gemini   PDFKit
                (Prisma)      (IA API)    (Reportes)
```

---

## 📁 Estructura del Repositorio

El proyecto está organizado en dos módulos principales:

- 📱 [**lectoescritura/**](lectoescritura/README.md): Aplicación móvil cliente para Android e iOS desarrollada en React Native y Expo.
- ⚙️ [**backend/**](backend/README.md): Servidor backend con API REST, base de datos PostgreSQL, migraciones de Prisma, auditoría y servicios de IA.

```text
lectoescritura-app/
├── README.md                 # Vista general del proyecto en GitHub
├── backend/                  # API REST, base de datos y servicios
│   ├── README.md             # Documentación detallada de la API REST y endpoints
│   ├── package.json          # Configuración y scripts del backend
│   ├── prisma/               # Esquema de base de datos y migraciones
│   ├── scripts/              # Scripts de auditoría y utilidades de DB
│   └── src/                  # Código fuente (rutas, middlewares, servicios)
└── lectoescritura/           # Aplicación móvil Expo
    ├── README.md             # Documentación detallada del cliente móvil
    ├── package.json          # Configuración y scripts de la app
    └── src/                  # Componentes, pantallas, contextos y SQLite offline
```

---

## 👥 Resumen de Funcionalidades por Rol

| Rol | Módulos y Capacidades |
| :--- | :--- |
| **🎓 Estudiante** | Lectura comprensiva, ejercicios de escritura, evaluación inteligente de respuestas con Gemini IA, juego de memoria con récord de tiempos, biblioteca de cuentos (con modo offline) y control de progreso diario. |
| **👩‍🏫 Docente** | Dashboard de rendimiento por alumno y grupo, asignación de tareas específicas, alertas por inactividad o errores frecuentes, chat directo con estudiantes y asistente de IA para recomendaciones pedagógicas. |
| **🛠️ Administrador** | Gestión de usuarios y grupos con borrado lógico (`soft delete`), panel de auditoría de cambios en PostgreSQL, métricas de performance y exportación de reportes ejecutivos en PDF. |

---

## 📑 Documentación Detallada

Para consultar la referencia técnica completa, endpoints de la API REST o detalles de la app móvil:

- 📱 **[Documentación de la Aplicación Móvil (`lectoescritura/README.md`)](lectoescritura/README.md)**
- ⚙️ **[Documentación del Servidor y API REST (`backend/README.md`)](backend/README.md)**

---

## 🚀 Guía Rápida de Inicio

### 1. Iniciar el Backend

```bash
cd backend
npm install
cp .env.example .env

# Generar esquema de BD y ejecutar migraciones
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Iniciar API REST en modo desarrollo (puerto 3000)
npm run dev
```

### 2. Iniciar la App Móvil

```bash
cd lectoescritura
npm install
cp .env.example .env

# Configurar IP local en .env (ejemplo: EXPO_PUBLIC_API_URL=http://192.168.1.50:3000/api)
# Iniciar servidor de desarrollo Expo
npx expo start
```

*Escanea el código QR generado en la terminal utilizando la aplicación **Expo Go** en tu dispositivo móvil.*