-- ============================================================================
-- INSERTAR CARTAS DE MEMORIA DE EJEMPLO
-- ============================================================================

-- ══════════════════════════════════════════════════════════════════════════════
-- CARTAS NIVEL BASICO (Imagen - Palabra)
-- ══════════════════════════════════════════════════════════════════════════════

-- Animales
INSERT INTO cartas_memoria (imagen_url, palabra, categoria, nivel, par_id, activo) VALUES
('https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop', 'gato', 'animales', 'basico', 2, true),
(NULL, 'gato', 'animales', 'basico', 1, true),
('https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&h=200&fit=crop', 'perro', 'animales', 'basico', 4, true),
(NULL, 'perro', 'animales', 'basico', 3, true),
('https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=200&h=200&fit=crop', 'pajaro', 'animales', 'basico', 6, true),
(NULL, 'pajaro', 'animales', 'basico', 5, true);

-- Colores
INSERT INTO cartas_memoria (imagen_url, palabra, categoria, nivel, par_id, activo) VALUES
('https://images.unsplash.com/photo-1563089145-599997674d42?w=200&h=200&fit=crop', 'rojo', 'colores', 'basico', 8, true),
(NULL, 'rojo', 'colores', 'basico', 7, true),
('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=200&h=200&fit=crop', 'azul', 'colores', 'basico', 10, true),
(NULL, 'azul', 'colores', 'basico', 9, true),
('https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200&h=200&fit=crop', 'verde', 'colores', 'basico', 12, true),
(NULL, 'verde', 'colores', 'basico', 11, true);

-- Frutas
INSERT INTO cartas_memoria (imagen_url, palabra, categoria, nivel, par_id, activo) VALUES
('https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=200&h=200&fit=crop', 'manzana', 'frutas', 'basico', 14, true),
(NULL, 'manzana', 'frutas', 'basico', 13, true),
('https://images.unsplash.com/photo-1574183320182-71413c4e2e87?w=200&h=200&fit=crop', 'platano', 'frutas', 'basico', 16, true),
(NULL, 'platano', 'frutas', 'basico', 15, true),
('https://images.unsplash.com/photo-1596363505729-4190a9505188?w=200&h=200&fit=crop', 'naranja', 'frutas', 'basico', 18, true),
(NULL, 'naranja', 'frutas', 'basico', 17, true);

-- ══════════════════════════════════════════════════════════════════════════════
-- CARTAS NIVEL INTERMEDIO (Palabra - Sinonimo)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO cartas_memoria (palabra, categoria, nivel, par_id, activo) VALUES
('feliz', 'sinonimos', 'intermedio', 20, true),
('contento', 'sinonimos', 'intermedio', 19, true),
('grande', 'sinonimos', 'intermedio', 22, true),
('enorme', 'sinonimos', 'intermedio', 21, true),
('rapido', 'sinonimos', 'intermedio', 24, true),
('veloz', 'sinonimos', 'intermedio', 23, true),
('bonito', 'sinonimos', 'intermedio', 26, true),
('hermoso', 'sinonimos', 'intermedio', 25, true),
('inteligente', 'sinonimos', 'intermedio', 28, true),
('listo', 'sinonimos', 'intermedio', 27, true);

-- ══════════════════════════════════════════════════════════════════════════════
-- CARTAS NIVEL AVANZADO (Palabra - Definicion)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO cartas_memoria (palabra, categoria, nivel, par_id, activo) VALUES
('biblioteca', 'definiciones', 'avanzado', 30, true),
('lugar con muchos libros', 'definiciones', 'avanzado', 29, true),
('escuela', 'definiciones', 'avanzado', 32, true),
('lugar donde aprendemos', 'definiciones', 'avanzado', 31, true),
('familia', 'definiciones', 'avanzado', 34, true),
('personas que viven juntas', 'definiciones', 'avanzado', 33, true),
('amigo', 'definiciones', 'avanzado', 36, true),
('persona que nos quiere y ayuda', 'definiciones', 'avanzado', 35, true);

-- ══════════════════════════════════════════════════════════════════════════════
-- VERIFICACION
-- ══════════════════════════════════════════════════════════════════════════════

SELECT nivel, categoria, COUNT(*) as total 
FROM cartas_memoria 
WHERE activo = true 
GROUP BY nivel, categoria 
ORDER BY nivel, categoria;

SELECT id, palabra, categoria, nivel, par_id 
FROM cartas_memoria 
WHERE activo = true 
ORDER BY nivel, categoria, id;
