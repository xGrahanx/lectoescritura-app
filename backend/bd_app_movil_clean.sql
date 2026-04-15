-- ============================================================
-- LectoEscritura - Script SQL limpio para pgAdmin
-- Ejecutar en la base de datos: lectoescritura
-- ============================================================

-- Enums
CREATE TYPE public.tipo_rol AS ENUM ('estudiante','docente','administrador');
CREATE TYPE public.tipo_nivel AS ENUM ('basico','intermedio','avanzado');
CREATE TYPE public.tipo_ejercicio AS ENUM ('dictado','completar','libre','copia');
CREATE TYPE public.tipo_ia AS ENUM ('sinonimos','oraciones','acentuacion','comprension');
CREATE TYPE public.tipo_tarea AS ENUM ('lectura','escritura','especial','ia');
CREATE TYPE public.tipo_estado_tarea AS ENUM ('pendiente','completada','vencida');
CREATE TYPE public.tipo_alerta AS ENUM ('error','logro','inactividad','mejora','alto_rendimiento');

-- Tabla: usuarios
CREATE TABLE public.usuarios (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    apellido    VARCHAR(100) NOT NULL,
    correo      VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    rol         public.tipo_rol NOT NULL,
    grado       VARCHAR(50),
    activo      BOOLEAN DEFAULT true,
    creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: grupos
CREATE TABLE public.grupos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    docente_id  INTEGER REFERENCES public.usuarios(id) ON DELETE SET NULL,
    activo      BOOLEAN DEFAULT true,
    creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: grupos_estudiantes
CREATE TABLE public.grupos_estudiantes (
    grupo_id        INTEGER NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
    estudiante_id   INTEGER NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    asignado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (grupo_id, estudiante_id)
);

-- Tabla: textos
CREATE TABLE public.textos (
    id          SERIAL PRIMARY KEY,
    titulo      VARCHAR(100) NOT NULL,
    autor       VARCHAR(100) NOT NULL,
    contenido   TEXT NOT NULL,
    nivel       public.tipo_nivel NOT NULL,
    activo      BOOLEAN DEFAULT true,
    creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: ejercicios_escritura
CREATE TABLE public.ejercicios_escritura (
    id          SERIAL PRIMARY KEY,
    titulo      VARCHAR(100) NOT NULL,
    tipo        public.tipo_ejercicio NOT NULL,
    descripcion TEXT,
    contenido   TEXT,
    nivel       public.tipo_nivel NOT NULL,
    creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: resultados_lectura
CREATE TABLE public.resultados_lectura (
    id                  SERIAL PRIMARY KEY,
    estudiante_id       INTEGER REFERENCES public.usuarios(id) ON DELETE CASCADE,
    texto_id            INTEGER REFERENCES public.textos(id) ON DELETE CASCADE,
    puntaje             INTEGER CHECK (puntaje >= 0 AND puntaje <= 100),
    respuestas          JSONB,
    retroalimentacion   TEXT,
    errores             JSONB,
    creado_en           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: resultados_escritura
CREATE TABLE public.resultados_escritura (
    id                      SERIAL PRIMARY KEY,
    estudiante_id           INTEGER REFERENCES public.usuarios(id) ON DELETE CASCADE,
    ejercicio_id            INTEGER REFERENCES public.ejercicios_escritura(id) ON DELETE CASCADE,
    puntaje                 INTEGER CHECK (puntaje >= 0 AND puntaje <= 100),
    respuesta               TEXT,
    errores_ortograficos    JSONB,
    retroalimentacion       TEXT,
    creado_en               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: ejercicios_ia
CREATE TABLE public.ejercicios_ia (
    id              SERIAL PRIMARY KEY,
    estudiante_id   INTEGER REFERENCES public.usuarios(id) ON DELETE CASCADE,
    tipo            public.tipo_ia NOT NULL,
    preguntas       JSONB NOT NULL,
    respuestas      JSONB,
    puntaje         INTEGER CHECK (puntaje >= 0 AND puntaje <= 100),
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: tareas
CREATE TABLE public.tareas (
    id              SERIAL PRIMARY KEY,
    titulo          VARCHAR(100) NOT NULL,
    descripcion     TEXT NOT NULL,
    tipo            public.tipo_tarea NOT NULL,
    docente_id      INTEGER REFERENCES public.usuarios(id) ON DELETE SET NULL,
    estudiante_id   INTEGER REFERENCES public.usuarios(id) ON DELETE CASCADE,
    fecha_limite    DATE,
    estado          public.tipo_estado_tarea DEFAULT 'pendiente',
    es_avanzada     BOOLEAN DEFAULT false,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: alertas
CREATE TABLE public.alertas (
    id              SERIAL PRIMARY KEY,
    docente_id      INTEGER REFERENCES public.usuarios(id) ON DELETE CASCADE,
    estudiante_id   INTEGER REFERENCES public.usuarios(id) ON DELETE CASCADE,
    tipo            public.tipo_alerta NOT NULL,
    titulo          VARCHAR(200),
    mensaje         TEXT,
    leida           BOOLEAN DEFAULT false,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: progreso_diario
CREATE TABLE public.progreso_diario (
    id                      SERIAL PRIMARY KEY,
    estudiante_id           INTEGER REFERENCES public.usuarios(id) ON DELETE CASCADE,
    fecha                   DATE DEFAULT CURRENT_DATE,
    puntaje_promedio        INTEGER,
    ejercicios_completados  INTEGER DEFAULT 0,
    racha_dias              INTEGER DEFAULT 0
);

-- Tabla: configuracion_sistema
CREATE TABLE public.configuracion_sistema (
    id                      SERIAL PRIMARY KEY,
    umbral_alto_rendimiento INTEGER DEFAULT 80,
    umbral_bajo_rendimiento INTEGER DEFAULT 60,
    dias_inactividad_alerta INTEGER DEFAULT 3,
    notif_activas           BOOLEAN DEFAULT true,
    intervalo_sync_minutos  INTEGER DEFAULT 30,
    actualizado_en          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
