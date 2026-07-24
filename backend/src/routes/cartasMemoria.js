/**
 * cartasMemoria.js - Rutas para gestión de cartas de memoria
 *
 * GET    /api/cartas-memoria              - Listar todas las cartas activas
 * GET    /api/cartas-memoria/:id          - Detalle de una carta
 * GET    /api/cartas-memoria/juego/:nivel - Obtener cartas para juego (por nivel)
 * POST   /api/cartas-memoria              - Crear nueva carta
 * PUT    /api/cartas-memoria/:id          - Editar carta
 * DELETE /api/cartas-memoria/:id          - Soft delete de una carta
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/cartas-memoria ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { nivel, categoria } = req.query;

  const filtro = { activo: true };
  if (nivel) {
    const nivelesValidos = ['basico', 'intermedio', 'avanzado'];
    if (!nivelesValidos.includes(nivel)) {
      return res.status(400).json({ mensaje: 'El nivel debe ser: basico, intermedio o avanzado' });
    }
    filtro.nivel = nivel;
  }
  if (categoria) {
    filtro.categoria = categoria;
  }

  try {
    const cartas = await prisma.$queryRaw`
      SELECT * FROM cartas_memoria 
      WHERE ${filtro.nivel ? prisma.$queryRaw`nivel = ${nivel} AND` : prisma.$queryRaw``} 
            ${filtro.categoria ? prisma.$queryRaw`categoria = ${categoria} AND` : prisma.$queryRaw``}
            activo = true 
      ORDER BY categoria, id
    `;
    res.json(cartas);
  } catch (error) {
    console.error('Error al obtener cartas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/cartas-memoria/juego/:nivel ───────────────────────────────────────
router.get('/juego/:nivel', async (req, res) => {
  const { nivel } = req.params;
  const { categoria } = req.query;

  const nivelesValidos = ['basico', 'intermedio', 'avanzado'];
  if (!nivelesValidos.includes(nivel)) {
    return res.status(400).json({ mensaje: 'El nivel debe ser: basico, intermedio o avanzado' });
  }

  try {
    // Obtener todas las cartas del nivel
    let query = 'SELECT * FROM cartas_memoria WHERE nivel = $1 AND activo = true';
    const params = [nivel];

    if (categoria) {
      query += ' AND categoria = $2';
      params.push(categoria);
    }

    const todasLasCartas = await prisma.$queryRawUnsafe(query, ...params);

    if (!todasLasCartas || todasLasCartas.length === 0) {
      return res.status(404).json({ mensaje: 'No hay cartas disponibles para este nivel' });
    }

    // Agrupar cartas por pares (usando par_id)
    const paresMap = new Map();
    
    todasLasCartas.forEach(carta => {
      // Para cartas con par_id, agrupar por el menor de los dos IDs
      if (carta.par_id) {
        const parKey = Math.min(carta.id, carta.par_id);
        if (!paresMap.has(parKey)) {
          paresMap.set(parKey, []);
        }
        paresMap.get(parKey).push(carta);
      }
    });

    // Convertir a array y filtrar solo pares completos (2 cartas)
    const paresCompletos = Array.from(paresMap.values()).filter(par => par.length === 2);

    if (paresCompletos.length === 0) {
      return res.status(404).json({ mensaje: 'No hay pares completos disponibles' });
    }

    // Seleccionar aleatoriamente 4 pares (8 cartas)
    const paresSeleccionados = paresCompletos
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    // Aplanar el array de pares seleccionados
    const cartasJuego = paresSeleccionados.flat();

    // Mezclar las cartas para el juego
    const cartasMezcladas = cartasJuego.sort(() => Math.random() - 0.5);

    res.json(cartasMezcladas);
  } catch (error) {
    console.error('Error al obtener cartas para juego:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/cartas-memoria/:id ───────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const carta = await prisma.$queryRaw`
      SELECT * FROM cartas_memoria WHERE id = ${id}
    `;
    
    if (!carta || carta.length === 0 || !carta[0].activo) {
      return res.status(404).json({ mensaje: 'Carta no encontrada' });
    }
    res.json(carta[0]);
  } catch (error) {
    console.error('Error al obtener carta:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/cartas-memoria ───────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { imagen_url, palabra, categoria, nivel, par_id } = req.body;

  if (!palabra || !categoria || !nivel) {
    return res.status(400).json({ mensaje: 'Los campos palabra, categoria y nivel son requeridos' });
  }

  const nivelesValidos = ['basico', 'intermedio', 'avanzado'];
  if (!nivelesValidos.includes(nivel)) {
    return res.status(400).json({ mensaje: 'El nivel debe ser: basico, intermedio o avanzado' });
  }

  try {
    const nuevaCarta = await prisma.$queryRaw`
      INSERT INTO cartas_memoria (imagen_url, palabra, categoria, nivel, par_id, activo)
      VALUES (${imagen_url || null}, ${palabra}, ${categoria}, ${nivel}, ${par_id || null}, true)
      RETURNING *
    `;

    res.status(201).json({ mensaje: 'Carta creada exitosamente', carta: nuevaCarta[0] });
  } catch (error) {
    console.error('Error al crear carta:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── PUT /api/cartas-memoria/:id ────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { imagen_url, palabra, categoria, nivel, par_id, activo } = req.body;

  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  if (nivel) {
    const nivelesValidos = ['basico', 'intermedio', 'avanzado'];
    if (!nivelesValidos.includes(nivel)) {
      return res.status(400).json({ mensaje: 'El nivel debe ser: basico, intermedio o avanzado' });
    }
  }

  try {
    const carta = await prisma.$queryRaw`SELECT * FROM cartas_memoria WHERE id = ${id}`;
    if (!carta || carta.length === 0) return res.status(404).json({ mensaje: 'Carta no encontrada' });

    const cartaActualizada = await prisma.$queryRaw`
      UPDATE cartas_memoria 
      SET imagen_url = ${imagen_url !== undefined ? imagen_url : carta[0].imagen_url},
          palabra = ${palabra || carta[0].palabra},
          categoria = ${categoria || carta[0].categoria},
          nivel = ${nivel || carta[0].nivel},
          par_id = ${par_id !== undefined ? par_id : carta[0].par_id},
          activo = ${activo !== undefined ? activo : carta[0].activo}
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({ mensaje: 'Carta actualizada correctamente', carta: cartaActualizada[0] });
  } catch (error) {
    console.error('Error al actualizar carta:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── DELETE /api/cartas-memoria/:id ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const carta = await prisma.$queryRaw`SELECT * FROM cartas_memoria WHERE id = ${id}`;
    if (!carta || carta.length === 0) return res.status(404).json({ mensaje: 'Carta no encontrada' });

    await prisma.$queryRaw`UPDATE cartas_memoria SET activo = false WHERE id = ${id}`;

    res.json({ mensaje: `Carta "${carta[0].palabra}" eliminada correctamente` });
  } catch (error) {
    console.error('Error al eliminar carta:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
