const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarCartas() {
  try {
    console.log('Verificando cartas de memoria...\n');
    
    // Verificar todas las cartas
    const cartas = await prisma.$queryRaw`SELECT * FROM cartas_memoria WHERE activo = true ORDER BY nivel, categoria, id`;
    
    console.log(`Total de cartas: ${cartas.length}\n`);
    
    console.log('=== CARTAS POR NIVEL ===');
    const porNivel = {};
    cartas.forEach(carta => {
      if (!porNivel[carta.nivel]) porNivel[carta.nivel] = [];
      porNivel[carta.nivel].push(carta);
    });
    
    Object.keys(porNivel).forEach(nivel => {
      console.log(`\n${nivel.toUpperCase()}:`);
      porNivel[nivel].forEach(carta => {
        console.log(`  ID: ${carta.id}, Palabra: ${carta.palabra}, Par_ID: ${carta.par_id}, Imagen: ${carta.imagen_url ? 'Sí' : 'No'}`);
      });
    });
    
    // Verificar pares
    console.log('\n=== VERIFICANDO PARES ===');
    const pares = {};
    cartas.forEach(carta => {
      if (carta.par_id) {
        if (!pares[carta.par_id]) pares[carta.par_id] = [];
        pares[carta.par_id].push(carta);
      }
    });
    
    Object.keys(pares).forEach(parId => {
      const par = pares[parId];
      if (par.length === 2) {
        console.log(`Par ${parId}: ${par[0].palabra} ↔ ${par[1].palabra} ✓`);
      } else {
        console.log(`Par ${parId}: INCOMPLETO (${par.length} cartas) ✗`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarCartas();
