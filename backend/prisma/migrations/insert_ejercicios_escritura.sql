-- ============================================================================
-- INSERTAR EJERCICIOS DE ESCRITURA
-- ============================================================================

-- ══════════════════════════════════════════════════════════════════════════════
-- EJERCICIOS DE ESCRITURA - NIVEL BASICO (Primero y Segundo)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO ejercicios_escritura (titulo, tipo, descripcion, contenido, nivel, activo) VALUES
('Dictado: Mi familia', 'dictado', 'Escribe el texto que te dictara el maestro', 
'Mi familia es grande. Mi papa se llama Juan. Mi mama se llama Maria. Tengo dos hermanos. Carlos es mayor que yo. Ana es menor que yo. Los domingos vamos al parque. Jugamos futbol y comemos helado. Mi familia es muy feliz.', 
'basico', true),

('Completar oraciones', 'completar', 'Completa las oraciones con las palabras que faltan', 
'Mi ___ se llama Juan. Mi ___ se llama Maria. Tengo dos ___. Carlos es ___ que yo. Ana es ___ que yo. Los ___ vamos al parque. Jugamos ___ y comemos ___. Mi familia es muy ___.', 
'basico', true),

('Copia: El gato y el raton', 'copia', 'Copia el texto exactamente como esta', 
'El gato Tom es muy grande y negro. Le gusta dormir en el sofa. El raton Jerry es pequeno y gris. Le gusta correr por la casa. Un dia, Tom vio a Jerry. Tom corrio detras de Jerry. Jerry se escondio en un agujero.', 
'basico', true),

('Escritura libre: Mi mascota', 'libre', 'Escribe sobre tu mascota favorita', 
'Describe tu mascota: como se llama, de que color es, que le gusta hacer, por que es especial para ti.', 
'basico', true),

('Dictado: La escuela', 'dictado', 'Escribe el texto que te dictara el maestro', 
'Mi escuela es bonita. Tiene muchas aulas. En mi aula hay veinte sillas. Mi maestra se llama Laura. Ella es muy amable. Aprendemos a leer y escribir. Tambien aprendemos matematicas. Los recreos son divertidos.', 
'basico', true);

-- ══════════════════════════════════════════════════════════════════════════════
-- EJERCICIOS DE ESCRITURA - NIVEL INTERMEDIO (Tercero y Cuarto)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO ejercicios_escritura (titulo, tipo, descripcion, contenido, nivel, activo) VALUES
('Dictado: Una aventura en el bosque', 'dictado', 'Escribe el texto que te dictara el maestro', 
'Sabado pasado, mis amigos y yo fuimos al bosque. Llevamos mochilas con agua y sandwiches. Caminamos por senderos llenos de arboles altos. Vimos ardillas saltando de rama en rama. Tambien escuchamos pajaros cantando. Encontramos un riachito con agua cristalina.', 
'intermedio', true),

('Completar: El ciclo del agua', 'completar', 'Completa el texto sobre el ciclo del agua', 
'El agua viaja constantemente por la ___. Comienza en los ___. El sol calienta el agua y se convierte en ___. El vapor sube al cielo y forma ___. Cuando las nubes se llenan, ___. La lluvia cae en ___ y ___. Luego el agua regresa al ___.', 
'intermedio', true),

('Copia: La biblioteca magica', 'copia', 'Copia el texto exactamente como esta', 
'La biblioteca de mi escuela es especial. Tiene miles de libros de todos los colores. Hay libros de aventuras, cuentos de hadas y libros de ciencia. Mi libro favorito es sobre dinosaurios. La bibliotecaria se dona Carmen. Ella nos ayuda a encontrar libros.', 
'intermedio', true),

('Escritura libre: Mi heroe', 'libre', 'Escribe sobre tu heroe personal', 
'Escribe sobre alguien que admiras mucho. Puede ser un familiar, un maestro, un personaje famoso o alguien de tu comunidad. Explica por que es tu heroe y que has aprendido de el o ella.', 
'intermedio', true),

('Dictado: Receta de pastel', 'dictado', 'Escribe la receta que te dictara el maestro', 
'Para hacer un delicioso pastel de chocolate necesitas: dos tazas de harina, una taza de azucar, tres huevos, media taza de leche y cacao en polvo. Primero, mezcla la harina con el azucar y el cacao. Luego, agrega los huevos y la leche. Bate todo muy bien.', 
'intermedio', true),

('Completar: Carta a un amigo', 'completar', 'Completa la carta con las palabras adecuadas', 
'Querido ___: Te escribo para contarte mis ___. Este semestre escolar ha sido muy ___. Aprendi muchas cosas nuevas en ___ y ___. Tambien participe en el equipo de ___. Ganamos el campeonato ___. Mis padres estan muy ___. Como estas tu? Espero que todo vaya ___.', 
'intermedio', true);

-- ══════════════════════════════════════════════════════════════════════════════
-- EJERCICIOS DE ESCRITURA - NIVEL AVANZADO (Quinto y Sexto)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO ejercicios_escritura (titulo, tipo, descripcion, contenido, nivel, activo) VALUES
('Dictado: La revolucion tecnologica', 'dictado', 'Escribe el texto que te dictara el maestro', 
'La tecnologia ha transformado nuestra vida de manera extraordinaria. Antes, las cartas tardaban semanas en llegar. Ahora, los mensajes son instantaneos. La informacion esta disponible en segundos a traves de internet. Los telefonos inteligentes nos permiten trabajar desde cualquier lugar.', 
'avanzado', true),

('Completar: El cambio climatico', 'completar', 'Completa el texto sobre el cambio climatico', 
'El cambio climatico es uno de los mayores ___ de nuestro tiempo. La temperatura de la Tierra esta ___ debido a los gases de efecto ___. Esto provoca el derretimiento de los ___ y el aumento del nivel del ___. Los patrones climaticos estan ___, causando ___ e ___. Para combatir este problema, debemos ___ el uso de combustibles ___.', 
'avanzado', true),

('Copia: La historia de mi ciudad', 'copia', 'Copia el texto exactamente como esta', 
'Mi ciudad fue fundada hace trescientos anos. Comenzo como un pequeno pueblo agricola. Con el tiempo, crecio gracias al comercio. El ferrocarril trajo progreso y nuevas oportunidades. Durante el siglo XX, se convirtio en un centro industrial. Hoy en dia, es una ciudad moderna con parques, museos y universidades.', 
'avanzado', true),

('Escritura libre: La amistad verdadera', 'libre', 'Escribe un ensayo sobre la amistad', 
'Escribe un ensayo de al menos 150 palabras sobre lo que significa una amistad verdadera. Incluye: caracteristicas de un buen amigo, importancia de la confianza, como mantener una amistad, y por que la amistad es valiosa en la vida.', 
'avanzado', true),

('Dictado: El poder de la lectura', 'dictado', 'Escribe el texto que te dictara el maestro', 
'Leer es una de las actividades mas enriquecedoras que podemos realizar. Cada libro es una puerta a nuevos mundos y conocimientos. La lectura mejora nuestro vocabulario y comprension. Nos permite viajar a lugares lejanos sin salir de casa. Los libros nos ensenan sobre diferentes culturas y epocas.', 
'avanzado', true),

('Completar: Biografia corta', 'completar', 'Completa la biografia de Marie Curie', 
'Marie Curie fue una cientifica ___. Nacio en ___ en 1867. Fue la primera mujer en ganar un Premio ___. Descubrio dos elementos quimicos: el ___ y el ___. Su investigacion sobre la ___ salvo muchas vidas. Trabajo incansablemente a pesar de las ___. Murio en 1934, pero su legado ___.', 
'avanzado', true),

('Escritura libre: Descripcion de un lugar', 'libre', 'Escribe una descripcion detallada de un lugar', 
'Elige un lugar que conozcas bien (parque, playa, museo, etc.) y escribe una descripcion detallada. Usa adjetivos, describe los colores, sonidos, olores y sensaciones. Haz que el lector pueda imaginar el lugar.', 
'avanzado', true);

-- ══════════════════════════════════════════════════════════════════════════════
-- VERIFICACION
-- ══════════════════════════════════════════════════════════════════════════════

-- Verificar ejercicios insertados por nivel
SELECT nivel, tipo, COUNT(*) as total 
FROM ejercicios_escritura 
WHERE activo = true 
GROUP BY nivel, tipo 
ORDER BY nivel, tipo;

-- Ver todos los ejercicios insertados
SELECT id, titulo, tipo, nivel 
FROM ejercicios_escritura 
WHERE activo = true 
ORDER BY nivel, tipo, titulo;
