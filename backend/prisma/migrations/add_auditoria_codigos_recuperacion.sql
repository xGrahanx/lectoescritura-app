-- ============================================================================
-- MIGRACIÓN: Agregar auditoría a tabla codigos_recuperacion
-- ============================================================================
-- Esta tabla fue agregada después de la migración de auditoría completa
-- ============================================================================

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNCIÓN DE AUDITORÍA (si no existe)
-- ══════════════════════════════════════════════════════════════════════════════
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
-- TRIGGERS PARA: codigos_recuperacion
-- ══════════════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trigger_auditoria_codigos_recuperacion_insert ON codigos_recuperacion;
DROP TRIGGER IF EXISTS trigger_auditoria_codigos_recuperacion_update ON codigos_recuperacion;
DROP TRIGGER IF EXISTS trigger_auditoria_codigos_recuperacion_delete ON codigos_recuperacion;

CREATE TRIGGER trigger_auditoria_codigos_recuperacion_insert
AFTER INSERT ON codigos_recuperacion
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_codigos_recuperacion_update
AFTER UPDATE ON codigos_recuperacion
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_codigos_recuperacion_delete
AFTER DELETE ON codigos_recuperacion
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ══════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ══════════════════════════════════════════════════════════════════════════════
-- Verificar que los triggers estén creados
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_auditoria_codigos_recuperacion%'
ORDER BY event_manipulation;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMPLETADO
-- ══════════════════════════════════════════════════════════════════════════════
-- ✅ La tabla codigos_recuperacion ahora tiene auditoría completa
-- ══════════════════════════════════════════════════════════════════════════════
