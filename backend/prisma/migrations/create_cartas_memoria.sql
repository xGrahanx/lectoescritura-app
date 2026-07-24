-- ============================================================================
-- CREAR TABLA cartas_memoria PARA JUEGO DE MEMORIA
-- ============================================================================

CREATE TABLE IF NOT EXISTS cartas_memoria (
    id SERIAL PRIMARY KEY,
    imagen_url VARCHAR(500),
    palabra VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('basico', 'intermedio', 'avanzado')),
    par_id INTEGER,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_cartas_memoria_categoria ON cartas_memoria(categoria);
CREATE INDEX IF NOT EXISTS idx_cartas_memoria_nivel ON cartas_memoria(nivel);
CREATE INDEX IF NOT EXISTS idx_cartas_memoria_par_id ON cartas_memoria(par_id);

-- Verificar que la tabla se creó correctamente
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'cartas_memoria'
ORDER BY ordinal_position;

-- Verificar índices
SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE tablename = 'cartas_memoria';
