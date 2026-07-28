const http = require('http');

const probarEndpoint = (nivel) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/cartas-memoria/juego/${nivel}`,
    method: 'GET',
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const cartas = JSON.parse(data);
          resolve(cartas);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

const verificarPares = (cartas) => {
  console.log(`\n=== Verificando ${cartas.length} cartas ===`);
  
  // Agrupar por pares
  const paresMap = new Map();
  
  cartas.forEach(carta => {
    if (carta.par_id) {
      const parKey = Math.min(carta.id, carta.par_id);
      if (!paresMap.has(parKey)) {
        paresMap.set(parKey, []);
      }
      paresMap.get(parKey).push(carta);
    }
  });

  console.log(`Pares encontrados: ${paresMap.size}`);
  
  paresMap.forEach((par, key) => {
    if (par.length === 2) {
      console.log(`✓ Par ${key}: ${par[0].palabra} ↔ ${par[1].palabra}`);
      console.log(`  - ID 1: ${par[0].id}, Par_ID: ${par[0].par_id}, Imagen: ${par[0].imagen_url ? 'Sí' : 'No'}`);
      console.log(`  - ID 2: ${par[1].id}, Par_ID: ${par[1].par_id}, Imagen: ${par[1].imagen_url ? 'Sí' : 'No'}`);
    } else {
      console.log(`✗ Par ${key}: INCOMPLETO (${par.length} cartas)`);
    }
  });

  return paresMap.size === 4 && Array.from(paresMap.values()).every(p => p.length === 2);
};

async function main() {
  const niveles = ['basico', 'intermedio', 'avanzado'];
  
  console.log('Probando endpoint de cartas de memoria...\n');
  
  for (const nivel of niveles) {
    console.log(`\n=== NIVEL: ${nivel.toUpperCase()} ===`);
    try {
      const cartas = await probarEndpoint(nivel);
      
      if (!Array.isArray(cartas) || cartas.length === 0) {
        console.log('✗ No se recibieron cartas');
        continue;
      }
      
      const paresValidos = verificarPares(cartas);
      
      if (paresValidos) {
        console.log(`✓ ${nivel}: Todos los pares son válidos`);
      } else {
        console.log(`✗ ${nivel}: Hay pares incompletos`);
      }
    } catch (error) {
      console.error(`✗ Error al probar ${nivel}:`, error.message);
    }
  }
}

main();
