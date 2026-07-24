-- ============================================================================
-- MIGRACIÓN: Insertar textos de prueba para ejercicios de lectura y escritura
-- ============================================================================
-- Textos variados por grado, categoría y nivel para pruebas
-- ============================================================================

-- Limpiar textos existentes de prueba (opcional)
-- DELETE FROM textos WHERE titulo LIKE '%Prueba%' OR autor LIKE 'Sistema%';

-- ══════════════════════════════════════════════════════════════════════════════
-- TEXTOS PARA PRIMERO Y SEGUNDO GRADO (Nivel Básico)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO textos (titulo, autor, contenido, grado, categoria, nivel, activo) VALUES
('El gato y el ratón', 'Sistema de Pruebas', 
'El gato Tom es muy grande y negro. Le gusta dormir en el sofá. El ratón Jerry es pequeño y gris. Le gusta correr por la casa. Un día, Tom vio a Jerry. Tom corrió detrás de Jerry. Jerry se escondió en un agujero. Tom esperó mucho tiempo. Jerry salió cuando Tom se fue. Así terminó el juego del gato y el ratón.', 
'primero', 'cuento', 'basico', true),

('Mi familia', 'Sistema de Pruebas',
'Mi familia es grande. Mi papá se llama Juan. Mi mamá se llama María. Tengo dos hermanos. Carlos es mayor que yo. Ana es menor que yo. Los domingos vamos al parque. Jugamos fútbol y comemos helado. Mi familia es muy feliz.', 
'primero', 'familia', 'basico', true),

('La escuela', 'Sistema de Pruebas',
'Mi escuela es bonita. Tiene muchas aulas. En mi aula hay veinte sillas. Mi maestra se llama Laura. Ella es muy amable. Aprendemos a leer y escribir. También aprendemos matemáticas. Los recreos son divertidos. Juego con mis amigos en el patio.', 
'segundo', 'escolar', 'basico', true),

('El sol y la luna', 'Sistema de Pruebas',
'El día sale el sol. El sol es brillante y caliente. Nos da luz y calor. Por la noche sale la luna. La luna es blanca y redonda. A veces parece un plato. Las estrellas acompañan a la luna. El sol y la luna son importantes para nosotros.', 
'segundo', 'naturaleza', 'basico', true),

('El perro fiel', 'Sistema de Pruebas',
'Rex es mi perro. Es de color marrón. Tiene orejas grandes y cola larga. Rex es muy fiel. Me espera cuando salgo de la escuela. Cuando llego a casa, Rex mueve la cola. Le gusta jugar con la pelota. Rex es el mejor amigo del hombre.', 
'primero', 'animales', 'basico', true);

-- ══════════════════════════════════════════════════════════════════════════════
-- TEXTOS PARA TERCERO Y CUARTO GRADO (Nivel Intermedio)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO textos (titulo, autor, contenido, grado, categoria, nivel, activo) VALUES
('La biblioteca mágica', 'Sistema de Pruebas',
'La biblioteca de mi escuela es especial. Tiene miles de libros de todos los colores. Hay libros de aventuras, cuentos de hadas y libros de ciencia. Mi libro favorito es sobre dinosaurios. La bibliotecaria se doña Carmen. Ella nos ayuda a encontrar libros. Cada viernes voy a la biblioteca. Presto dos libros para leer en casa. Leer es mi pasión favorita.', 
'tercero', 'escolar', 'intermedio', true),

('El ciclo del agua', 'Sistema de Pruebas',
'El agua viaja constantemente por la Tierra. Comienza en los océanos. El sol calienta el agua y se convierte en vapor. El vapor sube al cielo y forma nubes. Cuando las nubes se llenan, llueve. La lluvia cae en ríos y lagos. Luego el agua regresa al océano. Este ciclo nunca se detiene. Es importante cuidar el agua para que no se contamine.', 
'cuarto', 'ciencia', 'intermedio', true),

('Una aventura en el bosque', 'Sistema de Pruebas',
'Sábado pasado, mis amigos y yo fuimos al bosque. Llevamos mochilas con agua y sandwiches. Caminamos por senderos llenos de árboles altos. Vimos ardillas saltando de rama en rama. También escuchamos pájaros cantando. Encontramos un riachito con agua cristalina. Nos sentamos a comer junto al agua. Fue una aventura inolvidable. Prometimos volver pronto.', 
'tercero', 'aventura', 'intermedio', true),

('La importancia de las plantas', 'Sistema de Pruebas',
'Las plantas son esenciales para la vida en la Tierra. Producen oxígeno que respiramos. Nos dan alimentos como frutas y vegetales. Algunas plantas nos dan madera para construir casas. También nos dan medicinas para curar enfermedades. Las plantas hacen el mundo más hermoso con sus flores. Debemos proteger los bosques y no cortar árboles innecesariamente.', 
'cuarto', 'naturaleza', 'intermedio', true),

('Mi héroe', 'Sistema de Pruebas',
'Mi héroe es mi abuelo Pedro. Tiene setenta años pero parece más joven. Trabajó como maestro por cuarenta años. Enseñó a cientos de niños a leer. Ahora me ayuda con las tareas. Me cuenta historias de cuando era joven. Dice que la educación es el regalo más importante. Mi abuelo es mi inspiración. Quiero ser como él cuando sea grande.', 
'tercero', 'familia', 'intermedio', true);

-- ══════════════════════════════════════════════════════════════════════════════
-- TEXTOS PARA QUINTO Y SEXTO GRADO (Nivel Avanzado)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO textos (titulo, autor, contenido, grado, categoria, nivel, activo) VALUES
('La revolución tecnológica', 'Sistema de Pruebas',
'La tecnología ha transformado nuestra vida de manera extraordinaria. Antes, las cartas tardaban semanas en llegar. Ahora, los mensajes son instantáneos. La información está disponible en segundos a través de internet. Los teléfonos inteligentes nos permiten trabajar desde cualquier lugar. La inteligencia artificial está cambiando cómo aprendemos y trabajamos. Sin embargo, debemos usar la tecnología con responsabilidad. Es importante equilibrar el tiempo digital con actividades presenciales.', 
'quinto', 'tecnología', 'avanzado', true),

('El cambio climático', 'Sistema de Pruebas',
'El cambio climático es uno de los mayores desafíos de nuestro tiempo. La temperatura de la Tierra está aumentando debido a los gases de efecto invernadero. Esto provoca el derretimiento de los glaciares y el aumento del nivel del mar. Los patrones climáticos están cambiando, causando sequías e inundaciones. Para combatir este problema, debemos reducir el uso de combustibles fósiles. Las energías renovables como la solar y eólica son alternativas importantes. Cada pequeño acción cuenta para proteger nuestro planeta.', 
'sexto', 'ciencia', 'avanzado', true),

('La historia de mi ciudad', 'Sistema de Pruebas',
'Mi ciudad fue fundada hace trescientos años. Comenzó como un pequeño pueblo agrícola. Con el tiempo, creció gracias al comercio. El ferrocarril trajo progreso y nuevas oportunidades. Durante el siglo XX, se convirtió en un centro industrial. Hoy en día, es una ciudad moderna con parques, museos y universidades. Las calles antiguas conservan la arquitectura colonial. Conocer la historia de mi ciudad me ayuda a valorar mi patrimonio cultural.', 
'quinto', 'historia', 'avanzado', true),

('El poder de la lectura', 'Sistema de Pruebas',
'Leer es una de las actividades más enriquecedoras que podemos realizar. Cada libro es una puerta a nuevos mundos y conocimientos. La lectura mejora nuestro vocabulario y comprensión. Nos permite viajar a lugares lejanos sin salir de casa. Los libros nos enseñan sobre diferentes culturas y épocas. Personajes famosos de la historia eran grandes lectores. Leer estimula la imaginación y la creatividad. Es un hábito que debemos cultivar desde niños.', 
'sexto', 'educación', 'avanzado', true),

('La amistad verdadera', 'Sistema de Pruebas',
'La amistad verdadera es un tesoro invaluable. No se basa en la conveniencia o el interés. Un amigo verdadero está presente en los buenos y malos momentos. Escucha sin juzgar y ofrece apoyo sincero. La confianza mutua es la base de toda amistad duradera. Los amigos verdaderos celebran nuestros éxitos y nos ayudan en las dificultades. Mantener una amistad requiere tiempo, esfuerzo y reciprocidad. A lo largo de la vida, los amigos se convierten en la familia que elegimos.', 
'sexto', 'valores', 'avanzado', true);

-- ══════════════════════════════════════════════════════════════════════════════
-- TEXTOS ADICIONALES PARA ESCRITURA (Diferentes categorías)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO textos (titulo, autor, contenido, grado, categoria, nivel, activo) VALUES
('Receta de pastel', 'Sistema de Pruebas',
'Para hacer un delicioso pastel de chocolate necesitas: dos tazas de harina, una taza de azúcar, tres huevos, media taza de leche y cacao en polvo. Primero, mezcla la harina con el azúcar y el cacao. Luego, agrega los huevos y la leche. Bate todo muy bien. Precalienta el horno a 180 grados. Vierte la mezcla en un molde engrasado. Hornea por 40 minutos. Deja enfriar antes de decorar.', 
'tercero', 'instruccional', 'intermedio', true),

('Carta a un amigo', 'Sistema de Pruebas',
'Querido amigo: Te escribo para contarte mis noticias. Este semestre escolar ha sido muy intenso. Aprendí muchas cosas nuevas en matemáticas y ciencias. También participé en el equipo de fútbol. Ganamos el campeonato escolar. Mis padres están muy orgullosos. ¿Cómo estás tú? Espero que todo vaya bien. Cuéntame sobre tu vida. Nos vemos pronto. Tu amigo, Pedro.', 
'cuarto', 'correspondencia', 'intermedio', true),

('Descripción de un lugar', 'Sistema de Pruebas',
'El parque de mi ciudad es un lugar especial. Tiene grandes árboles que dan sombra en verano. Hay un lago con patos y peces de colores. Los niños juegan en los columpios y toboganes. Las personas caminan por los senderos de piedra. Los domingos hay música en vivo. Vendedores ofrecen helados y palomitas. Es el lugar favorito de las familias para pasar tiempo juntos.', 
'quinto', 'descriptivo', 'avanzado', true),

('Biografía corta', 'Sistema de Pruebas',
'Marie Curie fue una científica extraordinaria. Nació en Polonia en 1867. Fue la primera mujer en ganar un Premio Nobel. Descubrió dos elementos químicos: el polonio y el radio. Su investigación sobre la radiación salvó muchas vidas. Trabajó incansablemente a pesar de las dificultades. Murió en 1934, pero su legado perdura. Es un ejemplo de dedicación y perseverancia para todas las generaciones.', 
'sexto', 'biografía', 'avanzado', true);

-- ══════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ══════════════════════════════════════════════════════════════════════════════

-- Verificar textos insertados por grado
SELECT grado, COUNT(*) as total_textos 
FROM textos 
WHERE autor = 'Sistema de Pruebas' 
GROUP BY grado 
ORDER BY grado;

-- Verificar textos insertados por categoría
SELECT categoria, COUNT(*) as total_textos 
FROM textos 
WHERE autor = 'Sistema de Pruebas' 
GROUP BY categoria 
ORDER BY categoria;

-- Verificar textos insertados por nivel
SELECT nivel, COUNT(*) as total_textos 
FROM textos 
WHERE autor = 'Sistema de Pruebas' 
GROUP BY nivel 
ORDER BY nivel;

-- Ver todos los textos insertados
SELECT id, titulo, grado, categoria, nivel 
FROM textos 
WHERE autor = 'Sistema de Pruebas' 
ORDER BY grado, nivel, titulo;

-- ══════════════════════════════════════════════════════════════════════════════
-- COMPLETADO
-- ══════════════════════════════════════════════════════════════════════════════
-- ✅ 14 textos insertados para pruebas
-- ✅ Distribución por grados: primero a sexto
-- ✅ Diferentes categorías: cuento, familia, escolar, naturaleza, ciencia, etc.
-- ✅ Tres niveles: básico, intermedio, avanzado
-- ══════════════════════════════════════════════════════════════════════════════
