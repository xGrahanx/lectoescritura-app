/**
 * seed.js - Datos iniciales para la base de datos
 * Contenido adaptado para niños de 1er a 3er grado (6-9 años)
 * Ejecutar con: node src/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Insertando datos de prueba...');

  // Textos de lectura apropiados para 1er-3er grado
  await prisma.textos.createMany({
    skipDuplicates: true,
    data: [
      {
        titulo: 'El perrito perdido',
        autor: 'Cuento popular',
        contenido: `Un día, un perrito pequeño se perdió en el parque.\nEl perrito se llamaba Toby y tenía el pelo café.\nToby estaba muy asustado y comenzó a llorar.\nUna niña llamada Sofía lo escuchó y fue a ayudarlo.\nSofía le dio agua y lo llevó a su casa.\nAl día siguiente, el dueño de Toby llegó muy feliz a buscarlo.\nToby movió la cola y saltó de alegría.`,
        nivel: 'basico',
      },
      {
        titulo: 'Las frutas del jardín',
        autor: 'Cuento educativo',
        contenido: `En el jardín de la abuela había muchos árboles frutales.\nHabía manzanas rojas, naranjas dulces y mangos amarillos.\nCada mañana, los niños iban a recoger frutas frescas.\nLas frutas son muy buenas para la salud.\nNos dan vitaminas y nos ayudan a crecer fuertes.\nLa abuela hacía jugos deliciosos con todas las frutas del jardín.`,
        nivel: 'basico',
      },
      {
        titulo: 'El sol y la lluvia',
        autor: 'Texto educativo',
        contenido: `El sol sale todas las mañanas y nos da luz y calor.\nCon el sol, las plantas crecen y las flores se abren.\nA veces vienen las nubes y tapa el sol.\nEntonces cae la lluvia sobre la tierra.\nLa lluvia riega las plantas y llena los ríos.\nDespués de la lluvia, a veces aparece el arcoíris.\nEl arcoíris tiene muchos colores bonitos en el cielo.`,
        nivel: 'basico',
      },
      {
        titulo: 'Mi familia',
        autor: 'Texto escolar',
        contenido: `Mi familia es muy especial para mí.\nEn mi casa vivimos papá, mamá, mi hermana y yo.\nPapá trabaja y mamá nos cuida en casa.\nMi hermana se llama Valentina y tiene cinco años.\nLos domingos toda la familia se reúne a comer junta.\nNos reímos, jugamos y nos contamos cosas del día.\nYo quiero mucho a mi familia.`,
        nivel: 'basico',
      },
      {
        titulo: 'Los animales de la granja',
        autor: 'Cuento educativo',
        contenido: `En la granja del señor Pedro viven muchos animales.\nHay vacas que nos dan leche fresca cada mañana.\nLas gallinas ponen huevos amarillos y redondos.\nLos cerdos se revuelcan en el barro y gruñen fuerte.\nEl caballo marrón corre muy rápido por el campo.\nEl perro guardián cuida a todos los animales de noche.\nLos animales de la granja son muy importantes para nosotros.`,
        nivel: 'intermedio',
      },
      {
        titulo: 'El agua y nosotros',
        autor: 'Texto científico escolar',
        contenido: `El agua es muy importante para todos los seres vivos.\nLas personas necesitamos tomar agua todos los días para vivir.\nEl agua está en los ríos, los lagos y el mar.\nCuando llueve, el agua cae del cielo y riega la tierra.\nDebemos cuidar el agua y no desperdiciarla.\nCerrar el grifo cuando nos lavamos los dientes ayuda mucho.\nSin agua, no podría existir la vida en nuestro planeta.`,
        nivel: 'intermedio',
      },
    ],
  });

  // Ejercicios de escritura apropiados para 1er-3er grado
  await prisma.ejercicios_escritura.createMany({
    skipDuplicates: true,
    data: [
      {
        titulo: 'Dictado: Animales del campo',
        tipo: 'dictado',
        descripcion: 'Escucha y escribe estas palabras sobre animales.',
        contenido: 'vaca, perro, gato, pato, pollo, caballo, oveja, conejo, cerdo, gallina',
        nivel: 'basico',
      },
      {
        titulo: 'Dictado: La naturaleza',
        tipo: 'dictado',
        descripcion: 'Escucha y escribe estas palabras sobre la naturaleza.',
        contenido: 'árbol, flor, río, sol, luna, lluvia, nube, tierra, piedra, hoja',
        nivel: 'basico',
      },
      {
        titulo: 'Completa las oraciones: La familia',
        tipo: 'completar',
        descripcion: 'Completa cada oración con la palabra correcta.',
        contenido: 'Mi ___ se llama mamá. El ___ trabaja todos los días. Mi ___ juega conmigo. La ___ nos cuida con amor.',
        nivel: 'basico',
      },
      {
        titulo: 'Completa las oraciones: Los animales',
        tipo: 'completar',
        descripcion: 'Escribe el nombre del animal que corresponde.',
        contenido: 'El ___ dice miau. El ___ dice guau. La ___ pone huevos. La ___ nos da leche.',
        nivel: 'basico',
      },
      {
        titulo: 'Escritura libre: Mi animal favorito',
        tipo: 'libre',
        descripcion: 'Escribe 3 oraciones sobre tu animal favorito. ¿Cómo se llama? ¿De qué color es? ¿Qué come?',
        nivel: 'basico',
      },
      {
        titulo: 'Escritura libre: Mi día en la escuela',
        tipo: 'libre',
        descripcion: 'Escribe 4 oraciones sobre lo que haces en la escuela. ¿Qué aprendes? ¿Con quién juegas?',
        nivel: 'intermedio',
      },
      {
        titulo: 'Copia el texto: El gatito',
        tipo: 'copia',
        descripcion: 'Copia este texto con cuidado, respetando las mayúsculas y los puntos.',
        contenido: 'El gatito se llama Michi. Michi tiene el pelo blanco y suave. Le gusta dormir en el sofá. Todos los días toma leche fría.',
        nivel: 'basico',
      },
      {
        titulo: 'Copia el texto: Las estaciones',
        tipo: 'copia',
        descripcion: 'Copia este texto con buena letra.',
        contenido: 'En verano hace mucho calor. En invierno hace frío y a veces nieva. En primavera florecen las plantas. En otoño caen las hojas de los árboles.',
        nivel: 'intermedio',
      },
    ],
  });

  console.log('✅ Datos insertados correctamente.');
  console.log('   - 6 textos de lectura (apropiados para 1er-3er grado)');
  console.log('   - 8 ejercicios de escritura (apropiados para 1er-3er grado)');
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
