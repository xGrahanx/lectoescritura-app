-- Verificar textos insertados
SELECT id, titulo, grado, categoria, nivel 
FROM textos 
WHERE autor = 'Sistema de Pruebas' 
ORDER BY grado, nivel, titulo;

-- Contar textos por grado
SELECT grado, COUNT(*) as total 
FROM textos 
WHERE autor = 'Sistema de Pruebas' 
GROUP BY grado 
ORDER BY grado;

-- Contar textos por nivel
SELECT nivel, COUNT(*) as total 
FROM textos 
WHERE autor = 'Sistema de Pruebas' 
GROUP BY nivel 
ORDER BY nivel;
