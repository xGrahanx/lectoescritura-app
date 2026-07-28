# LectoEscritura App (Cliente Móvil)

Aplicación móvil desarrollada con **React Native** y **Expo** para el aprendizaje y reforzamiento de la lectoescritura en estudiantes de educación primaria de la **Escuela Nacional José Álvarez de Lugo**. 

La aplicación se conecta a una API REST centralizada en Node.js y cuenta con capacidad de funcionamiento offline para la lectura de cuentos y actividades locales.

---

## 🎯 Características Principales

### 🎓 Módulo de Estudiante
- **Lectura Comprensiva**: Textos educativos organizados por grado y nivel con preguntas de selección y respuesta abierta.
- **Ejercicios de Escritura**: Prácticas guiadas de ortografía y redacción.
- **Evaluación Asistida por IA**: Análisis en tiempo real de las respuestas escritas utilizando Google Gemini para dar correcciones detalladas y puntajes.
- **Juego de Memoria**: Juego interactivo de emparejamiento de palabras e imágenes por niveles (básico, intermedio y avanzado) con registro de mejores tiempos, aciertos e intentos.
- **Biblioteca de Cuentos y Modo Offline**: Lectura de cuentos interactivos con soporte para guardar favoritos y leer sin conexión a internet mediante **SQLite** (`expo-sqlite`).
- **Tareas y Progreso**: Visualización de tareas asignadas por el docente y consulta del historial de desempeño de los últimos 30 días.

### 👩‍🏫 Módulo de Docente
- **Dashboard de Monitoreo**: Estado general del grupo, métricas de avance y lista de estudiantes asignados.
- **Ficha del Estudiante**: Detalle individual del progreso en lectura, escritura, tareas y juego de memoria.
- **Asignación de Tareas**: Envío de tareas personalizadas seleccionando lecturas o ejercicios específicos de la base de datos.
- **Asistente Pedagógico con IA**: Consultas didácticas a Gemini para obtener recomendaciones de reforzamiento según el rendimiento de cada alumno.
- **Sistema de Alertas**: Avisos automáticos sobre estudiantes inactivos, errores recurrentes o logros destacados.
- **Mensajería Interna**: Chat directo entre docente y estudiante/padre de familia.

### 🛠️ Módulo de Administrador
- **Gestión de Usuarios**: Creación, edición y desactivación de usuarios (estudiantes, docentes, administradores) con borrado lógico (`soft delete`).
- **Gestión de Grupos**: Creación de secciones escolares y asignación de profesores responsables.
- **Bitácora de Auditoría**: Visualización en tiempo real de las operaciones (INSERT, UPDATE, DELETE) registradas en PostgreSQL.
- **Reportes Institucionales en PDF**: Generación, previsualización y descarga/compartido de reportes en PDF usando `expo-file-system` y `expo-sharing`.
- **Monitor de Performance**: Estadísticas de tiempo de respuesta de la API REST y estado de la base de datos.

---

## 🛠️ Tecnologías y Librerías

- **Framework**: React Native (`~0.81.5`) + Expo (`~54.0.33`)
- **Navegación**: `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`
- **Peticiones HTTP**: `axios` (`^1.7.9`)
- **Persistencia Local**: `expo-sqlite` (`~16.0.10`) y `@react-native-async-storage/async-storage` (`^2.1.0`)
- **Componentes de UI e Iconos**: `@expo/vector-icons` (MaterialCommunityIcons), `react-native-reanimated`, `react-native-safe-area-context`
- **Manejo de Archivos**: `expo-file-system` y `expo-sharing`
- **Red**: `expo-network` para detección automática de conectividad

---

## 📂 Estructura del Código Fuente

```text
lectoescritura/
├── App.jsx                     # Componente principal y proveedor de contextos
├── app.json                    # Configuración global del proyecto en Expo
├── index.js                    # Registro del punto de entrada
├── package.json                # Dependencias y scripts
├── .env.example                # Plantilla de IP del backend
├── assets/                     # Iconos de la app y splash screen
└── src/
    ├── context/
    │   └── AuthContext.jsx     # Gestión de sesión, JWT y datos del usuario
    ├── navigation/
    │   ├── RootNavigator.jsx   # Navegador raíz (Switch según estado de auth)
    │   ├── AuthNavigator.jsx   # Rutas públicas (Login, Registro, Recuperación)
    │   ├── StudentNavigator.jsx# Rutas y Bottom Tabs del Estudiante
    │   ├── TeacherNavigator.jsx# Rutas y Bottom Tabs del Docente
    │   └── AdminNavigator.jsx  # Rutas y Bottom Tabs del Administrador
    ├── screens/
    │   ├── admin/              # Pantallas del rol Administrador
    │   │   ├── DashboardAdminScreen.jsx
    │   │   ├── GestionUsuariosScreen.jsx
    │   │   ├── CrearUsuarioScreen.jsx / EditarUsuarioScreen.jsx
    │   │   ├── GestionGruposScreen.jsx
    │   │   ├── CrearGrupoScreen.jsx / EditarGrupoScreen.jsx / DetalleGrupoScreen.jsx
    │   │   ├── AuditoriaScreen.jsx
    │   │   ├── ReportesScreen.jsx
    │   │   └── ConfiguracionScreen.jsx
    │   ├── auth/               # Pantallas de Autenticación
    │   │   ├── LoginScreen.jsx
    │   │   ├── RegistroScreen.jsx
    │   │   └── RecuperarPasswordScreen.jsx
    │   ├── student/            # Pantallas del rol Estudiante
    │   │   ├── InicioEstudianteScreen.jsx
    │   │   ├── LecturaScreen.jsx / EjercicioLecturaScreen.jsx
    │   │   ├── EscrituraScreen.jsx / EjercicioEscrituraScreen.jsx
    │   │   ├── EjerciciosIAScreen.jsx
    │   │   ├── JuegoMemoriaScreen.jsx
    │   │   ├── CuentosOfflineScreen.jsx
    │   │   ├── ProgresoScreen.jsx
    │   │   └── TareasScreen.jsx
    │   └── teacher/            # Pantallas del rol Docente
    │       ├── DashboardDocenteScreen.jsx
    │       ├── EstudiantesScreen.jsx / DetalleEstudianteScreen.jsx
    │       ├── AsignarTareaScreen.jsx
    │       ├── AsistenteIAScreen.jsx
    │       ├── AlertasScreen.jsx
    │       ├── ChatScreen.jsx / ConversacionScreen.jsx
    │       ├── BibliotecaOfflineScreen.jsx
    │       ├── PerfilDocenteScreen.jsx / EditarPerfilScreen.jsx / CambiarPasswordScreen.jsx
    │       └── AyudaScreen.jsx
    ├── services/
    │   ├── authService.js      # Servicios de Login, Registro y Password
    │   ├── iaService.js        # Integración con endpoints de Gemini IA
    │   ├── bibliotecaService.js# Consumo de cuentos y favoritos
    │   └── offlineService.js   # Sincronización SQLite local
    └── utils/
        ├── constantes.js       # Colores de la app, roles y URL base de API
        └── bibliotecaOffline.js# Consultas y tablas de SQLite local
```

---

## 🌐 API REST Consumida por la App

La aplicación móvil realiza llamadas HTTP mediante Axios a los siguientes endpoints del backend:

### Autenticación y Perfil
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/registro` - Registro de nuevos usuarios
- `POST /api/auth/solicitar-recuperacion` - Solicitud de código de recuperación por correo
- `POST /api/auth/verificar-codigo` - Verificación de código de 6 dígitos
- `POST /api/auth/restablecer-password` - Cambio de contraseña con código verificado
- `PUT /api/usuarios/:id` - Actualización de datos de perfil

### Estudiantes
- `GET /api/textos` & `GET /api/textos/:id` - Lecturas disponibles y preguntas
- `GET /api/ejercicios` & `GET /api/ejercicios/:id` - Ejercicios de escritura
- `POST /api/ia/evaluar-respuesta` - Evaluación con Gemini IA
- `POST /api/ia/generar-ejercicio` - Generación de ejercicio dinámico con IA
- `GET /api/cartas-memoria/juego/:nivel` - Parejas de cartas para el Juego de Memoria
- `GET /api/cartas-memoria/records/:estudiante_id` - Récords personales del juego
- `POST /api/cartas-memoria/records` - Guardar tiempo y aciertos de partida
- `GET /api/biblioteca/cuentos` & `GET /api/biblioteca/mis-favoritos` - Cuentos y favoritos
- `POST /api/biblioteca/favoritos` - Alternar cuento como favorito
- `GET /api/progreso/:id` & `GET /api/progreso/:id/resumen` - Progreso y estadísticas
- `POST /api/progreso/:id/lectura` & `POST /api/progreso/:id/escritura` - Guardar actividad
- `GET /api/tareas/estudiante/:id` - Tareas asignadas
- `PUT /api/tareas/:id/estado` - Marcar tarea como completada

### Docentes
- `GET /api/grupos/docente/:id` - Grupos del docente
- `GET /api/usuarios?grupo_id=X` - Alumnos de un grupo
- `POST /api/tareas` & `DELETE /api/tareas/:id` - Crear o cancelar tareas
- `POST /api/ia/asistente-docente` & `POST /api/ia/sugerir-tarea` - Consultas pedagógicas a Gemini
- `GET /api/alertas/docente/:id` & `PUT /api/alertas/:id/leida` - Gestión de alertas
- `GET /api/mensajes/conversaciones/:usuario_id` - Lista de chats
- `GET /api/mensajes/historial/:usuario_id/:contacto_id` - Mensajes de una conversación
- `POST /api/mensajes/enviar` - Enviar mensaje

### Administradores
- `GET /api/usuarios`, `POST /api/usuarios`, `DELETE /api/usuarios/:id` - CRUD Usuarios
- `GET /api/grupos`, `POST /api/grupos`, `DELETE /api/grupos/:id` - CRUD Grupos
- `GET /api/auditoria` - Consulta de eventos auditados
- `GET /api/reportes/pdf` - Descarga de reporte en PDF
- `GET /api/performance/metricas` - Tiempos de respuesta del backend

---

## 📴 Funcionamiento Offline (SQLite)

La app utiliza `expo-sqlite` para garantizar la continuidad educativa cuando no hay acceso a internet:

1. **Tabla de Cuentos Locales**: En la primera conexión, la aplicación descarga el catálogo básico de cuentos y los almacena en la base de datos local SQLite (`bibliotecaOffline.js`).
2. **Lectura sin conexión**: El estudiante puede acceder a `CuentosOfflineScreen` y realizar lecturas sin depender de la red.
3. **Detección de estado de red**: Con `expo-network`, la aplicación identifica el cambio a conexión activa y sincroniza las actividades de lectura o progreso pendientes.

---

## ⚙️ Guía de Instalación y Ejecución

### 1. Requisitos Previos
- Node.js versión 18 o superior
- Aplicación **Expo Go** instalada en tu dispositivo móvil (disponible en Play Store y App Store) o emulador de Android / simulador de iOS
- Servidor backend corriendo en tu red local (puerto 3000 por defecto)

### 2. Pasos de Configuración

1. Entrar en la carpeta del proyecto:
   ```bash
   cd lectoescritura
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Crear el archivo `.env` a partir de `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configurar la URL de la API con tu IP local:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.X.X:3000/api
   ```
   > *Tip: En Windows, ejecuta `ipconfig` en la consola para obtener tu dirección IPv4. La computadora y el teléfono deben estar conectados a la misma red Wi-Fi.*

5. Iniciar Metro Bundler:
   ```bash
   npx expo start
   ```

6. Escanear el código QR mostrado en la terminal desde la aplicación **Expo Go**.
