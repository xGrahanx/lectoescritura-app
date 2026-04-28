-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
    id SERIAL PRIMARY KEY,
    tabla VARCHAR(100) NOT NULL,
    operacion VARCHAR(20) NOT NULL,
    usuario_id INTEGER,
    registro_id INTEGER,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL
);

-- Índices para mejorar consultas
CREATE INDEX idx_auditoria_tabla ON auditoria(tabla);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_fecha ON auditoria(creado_en);
CREATE INDEX idx_auditoria_operacion ON auditoria(operacion);

-- Función genérica para auditoría
CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria (tabla, operacion, registro_id, datos_anteriores)
        VALUES (TG_TABLE_NAME, TG_OP, OLD.id, row_to_json(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria (tabla, operacion, registro_id, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO auditoria (tabla, operacion, registro_id, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para tablas importantes

-- Auditoría de usuarios
CREATE TRIGGER trigger_auditoria_usuario
AFTER INSERT OR UPDATE OR DELETE ON usuario
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Auditoría de tareas
CREATE TRIGGER trigger_auditoria_tareas
AFTER INSERT OR UPDATE OR DELETE ON tareas
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Auditoría de grupos
CREATE TRIGGER trigger_auditoria_grupos
AFTER INSERT OR UPDATE OR DELETE ON grupos
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Auditoría de resultados de lectura
CREATE TRIGGER trigger_auditoria_resultados_lectura
AFTER INSERT OR UPDATE OR DELETE ON resultados_lectura
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Auditoría de resultados de escritura
CREATE TRIGGER trigger_auditoria_resultados_escritura
AFTER INSERT OR UPDATE OR DELETE ON resultados_escritura
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Auditoría de ejercicios IA
CREATE TRIGGER trigger_auditoria_ejercicios_ia
AFTER INSERT OR UPDATE OR DELETE ON ejercicios_ia
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Auditoría de progreso diario
CREATE TRIGGER trigger_auditoria_progreso_diario
AFTER INSERT OR UPDATE OR DELETE ON progreso_diario
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Auditoría de textos
CREATE TRIGGER trigger_auditoria_textos
AFTER INSERT OR UPDATE OR DELETE ON textos
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Auditoría de ejercicios de escritura
CREATE TRIGGER trigger_auditoria_ejercicios_escritura
AFTER INSERT OR UPDATE OR DELETE ON ejercicios_escritura
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();
