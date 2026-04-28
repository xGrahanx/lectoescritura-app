-- ============================================================================
-- MIGRACIÓN: Borrado Lógico y Auditoría Completa
-- ============================================================================
-- 1. Agregar campo 'activo' a todas las tablas que no lo tienen
-- 2. Crear triggers de auditoría para TODAS las tablas del sistema
-- ============================================================================

-- ─── PASO 1: Agregar campo 'activo' para borrado lógico ─────────────────────

-- Tablas que ya tienen 'activo': usuarios, grupos, textos, configuracion_sistema
-- Agregar a las demás:

ALTER TABLE alertas ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE ejercicios_escritura ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE ejercicios_ia ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE progreso_diario ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE resultados_escritura ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE resultados_lectura ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE grupos_estudiantes ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- ─── PASO 2: Crear triggers para TODAS las tablas ───────────────────────────

-- Función genérica de auditoría
-- Detecta borrado lógico (activo: true → false) y lo registra como DELETE
-- Maneja tablas sin columna 'id' (ej: grupos_estudiantes con clave compuesta)
CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    operacion_real VARCHAR(20);
    registro_id_val INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        BEGIN
            registro_id_val := OLD.id;
        EXCEPTION WHEN undefined_column THEN
            registro_id_val := NULL;
        END;
        INSERT INTO auditoria (tabla, operacion, registro_id, datos_anteriores)
        VALUES (TG_TABLE_NAME, 'DELETE', registro_id_val, row_to_json(OLD));
        RETURN OLD;

    ELSIF (TG_OP = 'UPDATE') THEN
        BEGIN
            registro_id_val := NEW.id;
        EXCEPTION WHEN undefined_column THEN
            registro_id_val := NULL;
        END;
        -- Si activo cambió de true a false = borrado lógico → registrar como DELETE
        IF (OLD.activo = true AND NEW.activo = false) THEN
            operacion_real := 'DELETE';
        ELSE
            operacion_real := 'UPDATE';
        END IF;
        INSERT INTO auditoria (tabla, operacion, registro_id, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, operacion_real, registro_id_val, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;

    ELSIF (TG_OP = 'INSERT') THEN
        BEGIN
            registro_id_val := NEW.id;
        EXCEPTION WHEN undefined_column THEN
            registro_id_val := NULL;
        END;
        INSERT INTO auditoria (tabla, operacion, registro_id, datos_nuevos)
        VALUES (TG_TABLE_NAME, 'INSERT', registro_id_val, row_to_json(NEW));
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS PARA: usuarios
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_usuarios_insert ON usuarios;
DROP TRIGGER IF EXISTS trigger_auditoria_usuarios_update ON usuarios;
DROP TRIGGER IF EXISTS trigger_auditoria_usuarios_delete ON usuarios;

CREATE TRIGGER trigger_auditoria_usuarios_insert
AFTER INSERT ON usuarios
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_usuarios_update
AFTER UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_usuarios_delete
AFTER DELETE ON usuarios
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS PARA: grupos
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_grupos_insert ON grupos;
DROP TRIGGER IF EXISTS trigger_auditoria_grupos_update ON grupos;
DROP TRIGGER IF EXISTS trigger_auditoria_grupos_delete ON grupos;

CREATE TRIGGER trigger_auditoria_grupos_insert
AFTER INSERT ON grupos
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_grupos_update
AFTER UPDATE ON grupos
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_grupos_delete
AFTER DELETE ON grupos
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS PARA: grupos_estudiantes
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_grupos_estudiantes_insert ON grupos_estudiantes;
DROP TRIGGER IF EXISTS trigger_auditoria_grupos_estudiantes_update ON grupos_estudiantes;
DROP TRIGGER IF EXISTS trigger_auditoria_grupos_estudiantes_delete ON grupos_estudiantes;

CREATE TRIGGER trigger_auditoria_grupos_estudiantes_insert
AFTER INSERT ON grupos_estudiantes
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_grupos_estudiantes_update
AFTER UPDATE ON grupos_estudiantes
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_grupos_estudiantes_delete
AFTER DELETE ON grupos_estudiantes
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS PARA: alertas
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_alertas_insert ON alertas;
DROP TRIGGER IF EXISTS trigger_auditoria_alertas_update ON alertas;
DROP TRIGGER IF EXISTS trigger_auditoria_alertas_delete ON alertas;

CREATE TRIGGER trigger_auditoria_alertas_insert
AFTER INSERT ON alertas
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_alertas_update
AFTER UPDATE ON alertas
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_alertas_delete
AFTER DELETE ON alertas
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS PARA: configuracion_sistema
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_configuracion_sistema_insert ON configuracion_sistema;
DROP TRIGGER IF EXISTS trigger_auditoria_configuracion_sistema_update ON configuracion_sistema;
DROP TRIGGER IF EXISTS trigger_auditoria_configuracion_sistema_delete ON configuracion_sistema;

CREATE TRIGGER trigger_auditoria_configuracion_sistema_insert
AFTER INSERT ON configuracion_sistema
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_configuracion_sistema_update
AFTER UPDATE ON configuracion_sistema
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_configuracion_sistema_delete
AFTER DELETE ON configuracion_sistema
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS PARA: ejercicios_escritura
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_ejercicios_escritura_insert ON ejercicios_escritura;
DROP TRIGGER IF EXISTS trigger_auditoria_ejercicios_escritura_update ON ejercicios_escritura;
DROP TRIGGER IF EXISTS trigger_auditoria_ejercicios_escritura_delete ON ejercicios_escritura;

CREATE TRIGGER trigger_auditoria_ejercicios_escritura_insert
AFTER INSERT ON ejercicios_escritura
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_ejercicios_escritura_update
AFTER UPDATE ON ejercicios_escritura
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_ejercicios_escritura_delete
AFTER DELETE ON ejercicios_escritura
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS PARA: ejercicios_ia
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_ejercicios_ia_insert ON ejercicios_ia;
DROP TRIGGER IF EXISTS trigger_auditoria_ejercicios_ia_update ON ejercicios_ia;
DROP TRIGGER IF EXISTS trigger_auditoria_ejercicios_ia_delete ON ejercicios_ia;

CREATE TRIGGER trigger_auditoria_ejercicios_ia_insert
AFTER INSERT ON ejercicios_ia
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_ejercicios_ia_update
AFTER UPDATE ON ejercicios_ia
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_ejercicios_ia_delete
AFTER DELETE ON ejercicios_ia
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS PARA: progreso_diario
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_progreso_diario_insert ON progreso_diario;
DROP TRIGGER IF EXISTS trigger_auditoria_progreso_diario_update ON progreso_diario;
DROP TRIGGER IF EXISTS trigger_auditoria_progreso_diario_delete ON progreso_diario;

CREATE TRIGGER trigger_auditoria_progreso_diario_insert
AFTER INSERT ON progreso_diario
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_progreso_diario_update
AFTER UPDATE ON progreso_diario
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_progreso_diario_delete
AFTER DELETE ON progreso_diario
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS PARA: resultados_escritura
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_resultados_escritura_insert ON resultados_escritura;
DROP TRIGGER IF EXISTS trigger_auditoria_resultados_escritura_update ON resultados_escritura;
DROP TRIGGER IF EXISTS trigger_auditoria_resultados_escritura_delete ON resultados_escritura;

CREATE TRIGGER trigger_auditoria_resultados_escritura_insert
AFTER INSERT ON resultados_escritura
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_resultados_escritura_update
AFTER UPDATE ON resultados_escritura
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_resultados_escritura_delete
AFTER DELETE ON resultados_escritura
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS PARA: resultados_lectura
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_resultados_lectura_insert ON resultados_lectura;
DROP TRIGGER IF EXISTS trigger_auditoria_resultados_lectura_update ON resultados_lectura;
DROP TRIGGER IF EXISTS trigger_auditoria_resultados_lectura_delete ON resultados_lectura;

CREATE TRIGGER trigger_auditoria_resultados_lectura_insert
AFTER INSERT ON resultados_lectura
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_resultados_lectura_update
AFTER UPDATE ON resultados_lectura
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_resultados_lectura_delete
AFTER DELETE ON resultados_lectura
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS PARA: tareas
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_tareas_insert ON tareas;
DROP TRIGGER IF EXISTS trigger_auditoria_tareas_update ON tareas;
DROP TRIGGER IF EXISTS trigger_auditoria_tareas_delete ON tareas;

CREATE TRIGGER trigger_auditoria_tareas_insert
AFTER INSERT ON tareas
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_tareas_update
AFTER UPDATE ON tareas
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_tareas_delete
AFTER DELETE ON tareas
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS PARA: textos
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_textos_insert ON textos;
DROP TRIGGER IF EXISTS trigger_auditoria_textos_update ON textos;
DROP TRIGGER IF EXISTS trigger_auditoria_textos_delete ON textos;

CREATE TRIGGER trigger_auditoria_textos_insert
AFTER INSERT ON textos
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_textos_update
AFTER UPDATE ON textos
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_textos_delete
AFTER DELETE ON textos
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ══════════════════════════════════════════════════════════════════════════════

-- Verificar que todas las tablas tengan el campo 'activo'
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'activo'
ORDER BY table_name;

-- Verificar que todos los triggers estén creados
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_auditoria_%'
ORDER BY event_object_table, event_manipulation;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMPLETADO
-- ══════════════════════════════════════════════════════════════════════════════
-- ✅ Todas las tablas ahora tienen campo 'activo' para borrado lógico
-- ✅ Todas las tablas tienen triggers de auditoría (INSERT, UPDATE, DELETE)
-- ✅ El sistema registrará absolutamente TODO lo que ocurra en la base de datos
-- ══════════════════════════════════════════════════════════════════════════════
