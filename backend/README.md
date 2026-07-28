# Backend API REST - LectoEscritura App

Servidor API REST desarrollado con **Node.js**, **Express**, **Prisma ORM** y **PostgreSQL** para la plataforma de aprendizaje de lectoescritura.

---

## 🛠️ Tecnologías y Librerías

- **Entorno de ejecución**: Node.js
- **Framework Web**: Express.js (`v4.21`)
- **Base de Datos & ORM**: PostgreSQL con Prisma ORM (`v5.22`)
- **Autenticación & Seguridad**: JSON Web Tokens (JWT) y `bcryptjs`
- **Inteligencia Artificial**: Google Generative AI SDK (`@google/generative-ai`) para integración con Gemini
- **Generación de Documentos**: `pdfkit` para reportes administrativos en PDF
- **Envío de Correos**: `nodemailer` para códigos de recuperación de contraseña
- **Control de Frecuencia**: `express-rate-limit` y manejo de CORS con `cors`

---

## 📂 Estructura del Backend

```text
backend/
├── .env.example                # Plantilla de variables de entorno
├── package.json                # Dependencias y scripts de ejecución
├── railway.json / render.yaml  # Configuración de despliegue en la nube
├── prisma/
│   ├── schema.prisma           # Esquema de modelos de datos
│   └── migrations/             # Migraciones e historial SQL
├── scripts/                    # Scripts de mantenimiento y verificación
│   ├── aplicar-migracion.ps1   # Aplicación de triggers de auditoría y soft delete
│   ├── crear-tabla-cartas-memoria.ps1
│   ├── insertar-cartas-memoria.ps1
│   ├── probar-endpoint-cartas.js
│   └── verificar-cartas-memoria.js
└── src/
    ├── index.js                # Servidor principal de Express
    ├── seed.js                 # Semilla de datos iniciales
    ├── middleware/             # Verificación de JWT y manejo de errores
    ├── routes/                 # Endpoints divididos por módulo
    └── utils/                  # Generador de PDF, integraciones de correo e IA
```

---

## 🌐 Endpoints de la API REST

### 🔑 Autenticación (`/api/auth`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `POST` | `/api/auth/login` | Iniciar sesión y obtener token de autenticación |
| `POST` | `/api/auth/registro` | Registrar nuevo estudiante o docente |
| `POST` | `/api/auth/solicitar-recuperacion` | Enviar código de 6 dígitos al correo |
| `POST` | `/api/auth/verificar-codigo` | Validar código de verificación recibido |
| `POST` | `/api/auth/restablecer-password` | Actualizar contraseña con código validado |

### 👥 Usuarios (`/api/usuarios`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/usuarios` | Listar usuarios registrados (con filtros y búsqueda) |
| `GET` | `/api/usuarios/stats` | Obtener métricas y totales agrupados por rol |
| `GET` | `/api/usuarios/:id` | Consultar perfil detallado de un usuario |
| `POST` | `/api/usuarios` | Crear usuario desde el panel de administración |
| `PUT` | `/api/usuarios/:id` | Editar información personal o rol del usuario |
| `DELETE` | `/api/usuarios/:id` | Desactivar usuario (`soft delete`) |

### 🏫 Grupos (`/api/grupos`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/grupos` | Listar todos los grupos escolares |
| `POST` | `/api/grupos` | Crear un nuevo grupo académico |
| `GET` | `/api/grupos/:id` | Obtener información detallada de un grupo |
| `PUT` | `/api/grupos/:id` | Actualizar datos o docente a cargo del grupo |
| `DELETE` | `/api/grupos/:id` | Desactivar grupo (`soft delete`) |
| `GET` | `/api/grupos/docente/:id` | Obtener grupos asignados a un docente específico |
| `POST` | `/api/grupos/:id/estudiantes` | Matricular estudiante en el grupo |
| `DELETE` | `/api/grupos/:id/estudiantes/:estudiante_id` | Desvincular estudiante del grupo |

### 📋 Tareas (`/api/tareas`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/tareas/estudiante/:id` | Listar tareas asignadas a un estudiante |
| `GET` | `/api/tareas/docente/:id` | Listar tareas creadas por el docente |
| `POST` | `/api/tareas` | Crear y asignar tarea a un estudiante |
| `PUT` | `/api/tareas/:id/estado` | Cambiar estado de tarea (pendiente/completada) |
| `DELETE` | `/api/tareas/:id` | Cancelar o eliminar tarea |

### 📖 Textos de Lectura (`/api/textos`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/textos` | Listar textos de lectura filtrados por nivel/grado |
| `GET` | `/api/textos/:id` | Obtener texto completo con preguntas de comprensión |
| `POST` | `/api/textos` | Crear un nuevo texto educativo |
| `PUT` | `/api/textos/:id` | Modificar texto existente |
| `DELETE` | `/api/textos/:id` | Desactivar lectura (`soft delete`) |

### ✏️ Ejercicios de Escritura (`/api/ejercicios`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/ejercicios` | Listar ejercicios de escritura |
| `GET` | `/api/ejercicios/:id` | Consultar detalle de ejercicio por ID |
| `POST` | `/api/ejercicios` | Crear nuevo ejercicio |
| `PUT` | `/api/ejercicios/:id` | Editar ejercicio existente |
| `DELETE` | `/api/ejercicios/:id` | Desactivar ejercicio (`soft delete`) |

### 📊 Progreso (`/api/progreso`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/progreso/:id` | Historial de actividad diaria de los últimos 30 días |
| `GET` | `/api/progreso/:id/resumen` | Resumen estadístico global del estudiante |
| `POST` | `/api/progreso/:id` | Registrar actividad diaria del estudiante |
| `GET` | `/api/progreso/:id/lectura` | Historial de desempeño en lectura |
| `POST` | `/api/progreso/:id/lectura` | Guardar resultado de lectura realizada |
| `GET` | `/api/progreso/:id/escritura` | Historial de desempeño en escritura |
| `POST` | `/api/progreso/:id/escritura` | Guardar resultado de ejercicio de escritura |

### 🤖 Inteligencia Artificial - Gemini (`/api/ia`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `POST` | `/api/ia/evaluar-respuesta` | Evaluación automatizada de respuestas escritas con Gemini |
| `POST` | `/api/ia/generar-ejercicio` | Generar ejercicios dinámicos adaptados al nivel del alumno |
| `POST` | `/api/ia/asistente-docente` | Asistente virtual pedagógico para docentes |
| `POST` | `/api/ia/sugerir-tarea` | Sugerencias automatizadas de tareas de refuerzo |

### 🎴 Juego de Memoria (`/api/cartas-memoria`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/cartas-memoria/juego/:nivel` | Obtener cartas aleatorias emparejadas según nivel |
| `GET` | `/api/cartas-memoria/records/:estudiante_id` | Consultar mejores récords del estudiante |
| `POST` | `/api/cartas-memoria/records` | Registrar nuevo récord (tiempo, intentos y aciertos) |

### 📚 Biblioteca de Cuentos (`/api/biblioteca`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/biblioteca/cuentos` | Listar catálogo de cuentos disponibles |
| `GET` | `/api/biblioteca/cuentos/:id` | Obtener contenido completo del cuento |
| `GET` | `/api/biblioteca/mis-favoritos` | Listar cuentos marcados como favoritos por el usuario |
| `POST` | `/api/biblioteca/favoritos` | Agregar o remover cuento de favoritos |

### 💬 Mensajería (`/api/mensajes`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/mensajes/conversaciones/:usuario_id` | Obtener conversaciones activas del usuario |
| `GET` | `/api/mensajes/historial/:usuario_id/:contacto_id` | Historial de chat entre docente y alumno/padre |
| `POST` | `/api/mensajes/enviar` | Enviar mensaje en una conversación |
| `PUT` | `/api/mensajes/marcar-leidos` | Actualizar estado de mensajes recibidos a leídos |

### 🔔 Alertas Docentes (`/api/alertas`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/alertas/docente/:docente_id` | Consultar alertas generadas por inactividad o errores |
| `PUT` | `/api/alertas/:id/leida` | Marcar una alerta individual como revisada |
| `POST` | `/api/alertas/generar` | Forzar la verificación y generación de alertas |

### 🛡️ Auditoría del Sistema (`/api/auditoria`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/auditoria` | Consultar bitácora de cambios (triggers PostgreSQL) |
| `GET` | `/api/auditoria/stats/resumen` | Resumen de operaciones auditadas (INSERT/UPDATE/DELETE) |
| `GET` | `/api/auditoria/tablas` | Listar tablas bajo seguimiento de auditoría |

### 📄 Reportes PDF (`/api/reportes`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/reportes/pdf` | Generar y descargar reporte general en formato PDF |
| `GET` | `/api/reportes/progreso-mensual` | Métricas de progreso mensual consolidado |
| `GET` | `/api/reportes/rendimiento` | Distribución de niveles de rendimiento estudiantil |
| `GET` | `/api/reportes/modulos` | Estadísticas de uso por módulo de la aplicación |
| `GET` | `/api/reportes/alertas` | Resumen consolidado de alertas del sistema |

### ⚡ Performance (`/api/performance`)
| Método | Ruta | Descripción |
| :---: | :--- | :--- |
| `GET` | `/api/performance/metricas` | Consultar tiempos de respuesta y estado del backend y BD |

---

## ⚙️ Configuración e Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno `.env`:
   ```bash
   cp .env.example .env
   ```

3. Variables de entorno requeridas en `backend/.env`:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://postgres:password@localhost:5432/lectoescritura?schema=public"
   JWT_SECRET="clave_secreta_jwt"
   GEMINI_API_KEY="tu_api_key_de_gemini"
   ```

4. Generar cliente de Prisma y ejecutar migraciones:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Cargar datos iniciales:
   ```bash
   npm run db:seed
   ```

6. Ejecutar servidor de desarrollo:
   ```bash
   npm run dev
   ```
