/**
 * seed.js - Datos iniciales para la base de datos
 * Ejecutar con: node src/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Insertando datos de prueba...');

  // Textos de lectura
  await prisma.textos.createMany({
    skipDuplicates: true,
    data: [
      {
        titulo: 'El Principito - Capítulo 1',
        autor: 'Antoine de Saint-Exupéry',
        contenido: `Cuando yo tenía seis años vi en un libro sobre la selva virgen que se titulaba "Historias vividas", una magnífica lámina. Representaba una serpiente boa que se tragaba a una fiera.\n\nEn el libro se afirmaba: "Las serpientes boas se tragan su presa entera, sin masticarla. Luego ya no pueden moverse y duermen durante los seis meses que dura su digestión."\n\nReflexioné mucho en ese entonces sobre las aventuras de la jungla y a mi vez logré trazar con un lápiz de colores mi primer dibujo.\n\nMostré mi obra de arte a las personas mayores y les pregunté si mi dibujo les daba miedo.\n\nMe respondieron: "¿Por qué habría de asustar un sombrero?"\n\nMi dibujo no representaba un sombrero. Representaba una serpiente boa que digerí­a un elefante. Dibujé entonces el interior de la serpiente boa, a fin de que las personas mayores pudieran comprender. Siempre tienen necesidad de explicaciones.`,
        nivel: 'basico',
      },
      {
        titulo: 'La Tortuga y la Liebre',
        autor: 'Esopo',
        contenido: `Una liebre se burlaba de las cortas patas y el lento caminar de la tortuga. Esta, riéndose, le dijo: "Aunque eres tan veloz como el viento, yo te ganaré en una carrera."\n\nLa liebre, creyendo que tal cosa era imposible, aceptó la propuesta. Convinieron que el zorro señalaría el recorrido y la meta.\n\nLlegado el día, partieron juntas. La tortuga no dejó de caminar en ningún momento, a paso lento pero continuo. La liebre, confiada en su velocidad, se tumbó a descansar y se quedó dormida.\n\nCuando despertó, corrió tan rápido como pudo, pero llegó a la meta y encontró a la tortuga descansando tranquilamente, pues había llegado primero.\n\nMoraleja: La constancia y el esfuerzo continuo vencen a la velocidad sin disciplina.`,
        nivel: 'basico',
      },
      {
        titulo: 'El Quijote - Fragmento',
        autor: 'Miguel de Cervantes',
        contenido: `En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.\n\nUna olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lentejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda.\n\nEl resto della concluían sayo de velarte, calzas de velludo para las fiestas con sus pantuflos de lo mismo, y los días de entresemana se honraba con su vellorí de lo más fino.\n\nTenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza que así ensillaba el rocín como tomaba la podadera.`,
        nivel: 'intermedio',
      },
      {
        titulo: 'El Aleph - Fragmento',
        autor: 'Jorge Luis Borges',
        contenido: `La candente mañana de febrero en que Beatriz Viterbo murió, después de una imperiosa agonía que no se rebajó un solo momento ni al sentimentalismo ni al miedo, noté que las carteleras de fierro de la Plaza Constitución habían renovado no sé qué aviso de cigarrillos rubios; el hecho me dolió, pues comprendí que el incesante y vasto universo ya se apartaba de ella y que ese cambio era el primero de una serie infinita.\n\nCambiaría el universo pero yo no, pensé con melancólica vanidad; alguna vez, lo sé, mi vana devoción la había exasperado; muerta, yo podía consagrarme a su memoria, sin esperanza, pero también sin humillación.\n\nCarlos Argentino Daneri era primo hermano de Beatriz. La ruina de su cara me recordó la de ella, lo cual no podía no advertirme que yo estaba mirando la cara de un muerto.`,
        nivel: 'avanzado',
      },
    ],
  });

  // Ejercicios de escritura
  await prisma.ejercicios_escritura.createMany({
    skipDuplicates: true,
    data: [
      {
        titulo: 'Dictado: Animales del bosque',
        tipo: 'dictado',
        descripcion: 'Escucha y escribe 10 palabras relacionadas con animales del bosque.',
        contenido: 'oso, lobo, ciervo, ardilla, búho, zorro, jabalí, águila, serpiente, murciélago',
        nivel: 'basico',
      },
      {
        titulo: 'Completa las oraciones',
        tipo: 'completar',
        descripcion: 'Rellena los espacios en blanco con la palabra correcta.',
        contenido: 'El ___ brilla de día. La ___ sale de noche. Los ___ viven en el mar.',
        nivel: 'basico',
      },
      {
        titulo: 'Escritura libre: Mi mascota',
        tipo: 'libre',
        descripcion: 'Escribe un párrafo de al menos 5 oraciones sobre tu mascota favorita o la que te gustaría tener.',
        nivel: 'intermedio',
      },
      {
        titulo: 'Copia el texto',
        tipo: 'copia',
        descripcion: 'Copia el fragmento con buena ortografía y puntuación.',
        contenido: 'El sol brillaba intensamente sobre el jardín. Las flores de colores se mecían suavemente con la brisa de la mañana. Un pequeño pájaro cantaba desde la rama más alta del árbol.',
        nivel: 'basico',
      },
      {
        titulo: 'Redacción: Mi día favorito',
        tipo: 'libre',
        descripcion: 'Escribe una redacción de al menos 10 oraciones sobre tu día favorito de la semana y por qué.',
        nivel: 'intermedio',
      },
      {
        titulo: 'Dictado avanzado: Naturaleza',
        tipo: 'dictado',
        descripcion: 'Dictado con palabras que incluyen tildes y letras de uso difícil.',
        contenido: 'atmósfera, clorofila, fotosíntesis, ecosistema, biodiversidad, hibernación, migración, depredador, herbívoro, omnívoro',
        nivel: 'avanzado',
      },
    ],
  });

  console.log('✅ Datos insertados correctamente.');
  console.log('   - 4 textos de lectura');
  console.log('   - 6 ejercicios de escritura');
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
