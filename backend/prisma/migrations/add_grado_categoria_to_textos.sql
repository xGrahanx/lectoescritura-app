-- ============================================================================
-- MIGRACIÓN: Agregar campos grado y categoria a tabla textos
-- ============================================================================
-- Estos campos permiten usar la tabla textos como una biblioteca offline
-- con categorización por grado escolar y tipo de contenido
-- ============================================================================

-- Agregar campos a la tabla textos
ALTER TABLE textos ADD COLUMN IF NOT EXISTS grado VARCHAR(50);
ALTER TABLE textos ADD COLUMN IF NOT EXISTS categoria VARCHAR(50);

-- Crear índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_textos_grado ON textos(grado);
CREATE INDEX IF NOT EXISTS idx_textos_categoria ON textos(categoria);

-- ══════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ══════════════════════════════════════════════════════════════════════════════

-- Verificar que los campos se agregaron correctamente
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'textos'
  AND column_name IN ('grado', 'categoria')
ORDER BY column_name;

-- Verificar que los índices se crearon
SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE tablename = 'textos'
  AND indexname LIKE 'idx_textos_%';

-- ══════════════════════════════════════════════════════════════════════════════
-- COMPLETADO
-- ══════════════════════════════════════════════════════════════════════════════
-- ✅ Campos grado y categoria agregados a tabla textos
-- ✅ Índices creados para búsquedas
-- ══════════════════════════════════════════════════════════════════════════════
