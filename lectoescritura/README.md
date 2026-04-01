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
- Panel de administracion para gestion de usuarios, reportes y configuracion del sistema

## Tecnologias

- **React Native + Expo** (~54)
- **React Navigation** (Stack + Bottom Tabs)
- **@expo/vector-icons** (MaterialCommunityIcons)
- **expo-sqlite** para almacenamiento offline
- **expo-network** para deteccion de conectividad
- **@react-native-async-storage/async-storage** para persistencia de sesion
- **Axios** para llamadas a la API

## Estructura del proyecto

```
lectoescritura/
├── App.jsx                        # Entry point
├── index.js                       # Registro del componente raiz
├── src/
│   ├── context/
│   │   ├── AuthContext.jsx        # Autenticacion y sesion (AsyncStorage)
│   │   └── OfflineContext.jsx     # Estado de conexion (expo-network)
│   ├── navigation/
│   │   ├── RootNavigator.jsx      # Navegador raiz (redirige por rol)
│   │   ├── AuthNavigator.jsx      # Login / Registro
│   │   ├── StudentNavigator.jsx   # Tabs del estudiante
│   │   ├── TeacherNavigator.jsx   # Tabs del docente
│   │   └── AdminNavigator.jsx     # Tabs del administrador
│   ├── screens/
│   │   ├── auth/                  # LoginScreen, RegistroScreen, RecuperarPasswordScreen
│   │   ├── student/               # Inicio, Lectura, Escritura, EjerciciosIA, Progreso, Tareas
│   │   ├── teacher/               # Dashboard, Estudiantes, DetalleEstudiante, AsignarTarea, Alertas, Perfil
│   │   └── admin/                 # Dashboard, GestionUsuarios, CrearUsuario, Reportes, Configuracion
│   ├── services/
│   │   ├── authService.js         # Login / Registro API
│   │   ├── iaService.js           # Integracion con Google Gemini
│   │   └── offlineService.js      # SQLite local (expo-sqlite)
│   ├── components/
│   │   └── IndicadorOffline.jsx   # Banner de modo offline
│   └── utils/
│       └── constantes.js          # Colores, roles, umbrales de rendimiento
```

## Instalacion

```bash
cd lectoescritura
npm install
npx expo start
```

Escanea el QR con la app **Expo Go** en tu dispositivo Android o iOS.

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
- **Administrador**: gestiona usuarios, ve reportes del sistema y configura parametros de la IA

## Backend

El backend esta en la carpeta `/backend` (Node.js + Express + PostgreSQL). Configura la URL en `src/utils/constantes.js`:

```js
BASE_URL: 'http://TU_IP:3000/api'  // Reemplaza TU_IP con la IP de tu maquina
```

> En emulador Android usa `10.0.2.2` en lugar de `localhost`.
> En dispositivo fisico usa la IP local de tu maquina (ej: `192.168.1.X`).
