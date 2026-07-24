-- Fix para capturar el usuario_id de la sesión de PostgreSQL
CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    operacion_real VARCHAR(20);
    registro_id_val INT;
    usuario_actual INT;
BEGIN
    -- Intentar leer el usuario_id de la sesión
    BEGIN
        usuario_actual := current_setting('app.usuario_id', true)::INT;
    EXCEPTION WHEN OTHERS THEN
        usuario_actual := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        BEGIN
            registro_id_val := OLD.id;
        EXCEPTION WHEN undefined_column THEN
            registro_id_val := NULL;
        END;
        INSERT INTO auditoria (tabla, operacion, registro_id, usuario_id, datos_anteriores)
        VALUES (TG_TABLE_NAME, 'DELETE', registro_id_val, usuario_actual, row_to_json(OLD));
        RETURN OLD;

    ELSIF (TG_OP = 'UPDATE') THEN
        BEGIN
            registro_id_val := NEW.id;
        EXCEPTION WHEN undefined_column THEN
            registro_id_val := NULL;
        END;
        IF (OLD.activo = true AND NEW.activo = false) THEN
            operacion_real := 'DELETE';
        ELSE
            operacion_real := 'UPDATE';
        END IF;
        INSERT INTO auditoria (tabla, operacion, registro_id, usuario_id, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, operacion_real, registro_id_val, usuario_actual, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;

    ELSIF (TG_OP = 'INSERT') THEN
        BEGIN
            registro_id_val := NEW.id;
        EXCEPTION WHEN undefined_column THEN
            registro_id_val := NULL;
        END;
        INSERT INTO auditoria (tabla, operacion, registro_id, usuario_id, datos_nuevos)
        VALUES (TG_TABLE_NAME, 'INSERT', registro_id_val, usuario_actual, row_to_json(NEW));
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
