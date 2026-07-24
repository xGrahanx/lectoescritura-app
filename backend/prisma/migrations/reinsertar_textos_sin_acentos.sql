-- ============================================================================
-- REINSERTAR TEXTOS SIN ACENTOS Y Ñ
-- ============================================================================

-- Borrar textos existentes de prueba
DELETE FROM textos WHERE autor = 'Sistema de Pruebas';

-- ══════════════════════════════════════════════════════════════════════════════
-- TEXTOS PARA PRIMERO Y SEGUNDO GRADO (Nivel Basico)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO textos (titulo, autor, contenido, grado, categoria, nivel, activo) VALUES
('El gato y el raton', 'Sistema de Pruebas', 
'El gato Tom es muy grande y negro. Le gusta dormir en el sofa. El raton Jerry es pequeno y gris. Le gusta correr por la casa. Un dia, Tom vio a Jerry. Tom corrio detras de Jerry. Jerry se escondio en un agujero. Tom espero mucho tiempo. Jerry salio cuando Tom se fue. Asi termino el juego del gato y el raton.', 
'primero', 'cuento', 'basico', true),

('Mi familia', 'Sistema de Pruebas',
'Mi familia es grande. Mi papa se llama Juan. Mi mama se llama Maria. Tengo dos hermanos. Carlos es mayor que yo. Ana es menor que yo. Los domingos vamos al parque. Jugamos futbol y comemos helado. Mi familia es muy feliz.', 
'primero', 'familia', 'basico', true),

('La escuela', 'Sistema de Pruebas',
'Mi escuela es bonita. Tiene muchas aulas. En mi aula hay veinte sillas. Mi maestra se llama Laura. Ella es muy amable. Aprendemos a leer y escribir. Tambien aprendemos matematicas. Los recreos son divertidos. Juego con mis amigos en el patio.', 
'segundo', 'escolar', 'basico', true),

('El sol y la luna', 'Sistema de Pruebas',
'El dia sale el sol. El sol es brillante y caliente. Nos da luz y calor. Por la noche sale la luna. La luna es blanca y redonda. A veces parece un plato. Las estrellas acompanan a la luna. El sol y la luna son importantes para nosotros.', 
'segundo', 'naturaleza', 'basico', true),

('El perro fiel', 'Sistema de Pruebas',
'Rex es mi perro. Es de color marron. Tiene orejas grandes y cola larga. Rex es muy fiel. Me espera cuando salgo de la escuela. Cuando llego a casa, Rex mueve la cola. Le gusta jugar con la pelota. Rex es el mejor amigo del hombre.', 
'primero', 'animales', 'basico', true);

-- ══════════════════════════════════════════════════════════════════════════════
-- TEXTOS PARA TERCERO Y CUARTO GRADO (Nivel Intermedio)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO textos (titulo, autor, contenido, grado, categoria, nivel, activo) VALUES
('La biblioteca magica', 'Sistema de Pruebas',
'La biblioteca de mi escuela es especial. Tiene miles de libros de todos los colores. Hay libros de aventuras, cuentos de hadas y libros de ciencia. Mi libro favorito es sobre dinosaurios. La bibliotecaria se dona Carmen. Ella nos ayuda a encontrar libros. Cada viernes voy a la biblioteca. Presto dos libros para leer en casa. Leer es mi pasion favorita.', 
'tercero', 'escolar', 'intermedio', true),

('El ciclo del agua', 'Sistema de Pruebas',
'El agua viaja constantemente por la Tierra. Comienza en los oceanos. El sol calienta el agua y se convierte en vapor. El vapor sube al cielo y forma nubes. Cuando las nubes se llenan, llueve. La lluvia cae en rios y lagos. Luego el agua regresa al oceano. Este ciclo nunca se detiene. Es importante cuidar el agua para que no se contamine.', 
'cuarto', 'ciencia', 'intermedio', true),

('Una aventura en el bosque', 'Sistema de Pruebas',
'Sabado pasado, mis amigos y yo fuimos al bosque. Llevamos mochilas con agua y sandwiches. Caminamos por senderos llenos de arboles altos. Vimos ardillas saltando de rama en rama. Tambien escuchamos pajaros cantando. Encontramos un riachito con agua cristalina. Nos sentamos a comer junto al agua. Fue una aventura inolvidable. Prometimos volver pronto.', 
'tercero', 'aventura', 'intermedio', true),

('La importancia de las plantas', 'Sistema de Pruebas',
'Las plantas son esenciales para la vida en la Tierra. Producen oxigeno que respiramos. Nos dan alimentos como frutas y vegetales. Algunas plantas nos dan madera para construir casas. Tambien nos dan medicinas para curar enfermedades. Las plantas hacen el mundo mas hermoso con sus flores. Debemos proteger los bosques y no cortar arboles innecesariamente.', 
'cuarto', 'naturaleza', 'intermedio', true),

('Mi heroe', 'Sistema de Pruebas',
'Mi heroe es mi abuelo Pedro. Tiene setenta anos pero parece mas joven. Trabajo como maestro por cuarenta anos. Enseno a cientos de ninos a leer. Ahora me ayuda con las tareas. Me cuenta historias de cuando era joven. Dice que la educacion es el regalo mas importante. Mi abuelo es mi inspiracion. Quiero ser como el cuando sea grande.', 
'tercero', 'familia', 'intermedio', true);

-- ══════════════════════════════════════════════════════════════════════════════
-- TEXTOS PARA QUINTO Y SEXTO GRADO (Nivel Avanzado)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO textos (titulo, autor, contenido, grado, categoria, nivel, activo) VALUES
('La revolucion tecnologica', 'Sistema de Pruebas',
'La tecnologia ha transformado nuestra vida de manera extraordinaria. Antes, las cartas tardaban semanas en llegar. Ahora, los mensajes son instantaneos. La informacion esta disponible en segundos a traves de internet. Los telefonos inteligentes nos permiten trabajar desde cualquier lugar. La inteligencia artificial esta cambiando como aprendemos y trabajamos. Sin embargo, debemos usar la tecnologia con responsabilidad. Es importante equilibrar el tiempo digital con actividades presenciales.', 
'quinto', 'tecnologia', 'avanzado', true),

('El cambio climatico', 'Sistema de Pruebas',
'El cambio climatico es uno de los mayores desafios de nuestro tiempo. La temperatura de la Tierra esta aumentando debido a los gases de efecto invernadero. Esto provoca el derretimiento de los glaciares y el aumento del nivel del mar. Los patrones climaticos estan cambiando, causando sequias e inundaciones. Para combatir este problema, debemos reducir el uso de combustibles fosiles. Las energias renovables como la solar y eolica son alternativas importantes. Cada pequena accion cuenta para proteger nuestro planeta.', 
'sexto', 'ciencia', 'avanzado', true),

('La historia de mi ciudad', 'Sistema de Pruebas',
'Mi ciudad fue fundada hace trescientos anos. Comenzo como un pequeno pueblo agricola. Con el tiempo, crecio gracias al comercio. El ferrocarril trajo progreso y nuevas oportunidades. Durante el siglo XX, se convirtio en un centro industrial. Hoy en dia, es una ciudad moderna con parques, museos y universidades. Las calles antiguas conservan la arquitectura colonial. Conocer la historia de mi ciudad me ayuda a valorar mi patrimonio cultural.', 
'quinto', 'historia', 'avanzado', true),

('El poder de la lectura', 'Sistema de Pruebas',
'Leer es una de las actividades mas enriquecedoras que podemos realizar. Cada libro es una puerta a nuevos mundos y conocimientos. La lectura mejora nuestro vocabulario y comprension. Nos permite viajar a lugares lejanos sin salir de casa. Los libros nos ensenan sobre diferentes culturas y epocas. Personajes famosos de la historia eran grandes lectores. Leer estimula la imaginacion y la creatividad. Es un habito que debemos cultivar desde ninos.', 
'sexto', 'educacion', 'avanzado', true),

('La amistad verdadera', 'Sistema de Pruebas',
'La amistad verdadera es un tesoro invaluable. No se basa en la conveniencia o el interes. Un amigo verdadero esta presente en los buenos y malos momentos. Escucha sin juzgar y ofrece apoyo sincero. La confianza mutua es la base de toda amistad duradera. Los amigos verdaderos celebran nuestros exitos y nos ayudan en las dificultades. Mantener una amistad requiere tiempo, esfuerzo y reciprocidad. A lo largo de la vida, los amigos se convierten en la familia que elegimos.', 
'sexto', 'valores', 'avanzado', true);

-- ══════════════════════════════════════════════════════════════════════════════
-- TEXTOS ADICIONALES PARA ESCRITURA
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO textos (titulo, autor, contenido, grado, categoria, nivel, activo) VALUES
('Receta de pastel', 'Sistema de Pruebas',
'Para hacer un delicioso pastel de chocolate necesitas: dos tazas de harina, una taza de azucar, tres huevos, media taza de leche y cacao en polvo. Primero, mezcla la harina con el azucar y el cacao. Luego, agrega los huevos y la leche. Bate todo muy bien. Precalienta el horno a 180 grados. Vierte la mezcla en un molde engrasado. Hornea por 40 minutos. Deja enfriar antes de decorar.', 
'tercero', 'instruccional', 'intermedio', true),

('Carta a un amigo', 'Sistema de Pruebas',
'Querido amigo: Te escribo para contarte mis noticias. Este semestre escolar ha sido muy intenso. Aprendi muchas cosas nuevas en matematicas y ciencias. Tambien participe en el equipo de futbol. Ganamos el campeonato escolar. Mis padres estan muy orgullosos. Como estas tu? Espero que todo vaya bien. Cuentame sobre tu vida. Nos vemos pronto. Tu amigo, Pedro.', 
'cuarto', 'correspondencia', 'intermedio', true),

('Descripcion de un lugar', 'Sistema de Pruebas',
'El parque de mi ciudad es un lugar especial. Tiene grandes arboles que dan sombra en verano. Hay un lago con patos y peces de colores. Los ninos juegan en los columpios y toboganes. Las personas caminan por los senderos de piedra. Los domingos hay musica en vivo. Vendedores ofrecen helados y palomitas. Es el lugar favorito de las familias para pasar tiempo juntos.', 
'quinto', 'descriptivo', 'avanzado', true),

('Biografia corta', 'Sistema de Pruebas',
'Marie Curie fue una cientifica extraordinaria. Nacio en Polonia en 1867. Fue la primera mujer en ganar un Premio Nobel. Descubrio dos elementos quimicos: el polonio y el radio. Su investigacion sobre la radiacion salvo muchas vidas. Trabajo incansablemente a pesar de las dificultades. Murio en 1934, pero su legado perdura. Es un ejemplo de dedicacion y perseverancia para todas las generaciones.', 
'sexto', 'biografia', 'avanzado', true);

-- Verificar textos insertados
SELECT id, titulo, grado, categoria, nivel 
FROM textos 
WHERE autor = 'Sistema de Pruebas' 
ORDER BY grado, nivel, titulo;
