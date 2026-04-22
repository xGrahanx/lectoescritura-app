/**
 * ejercicios.js - Rutas para gestión de ejercicios de escritura
 *
 * GET    /api/ejercicios              - Listar todos los ejercicios
 * GET    /api/ejercicios/:id          - Detalle de un ejercicio
 * POST   /api/ejercicios              - Crear nuevo ejercicio
 * PUT    /api/ejercicios/:id          - Editar ejercicio
 * DELETE /api/ejercicios/:id          - Eliminar ejercicio
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/ejercicios ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { nivel, tipo } = req.query;

  const filtro = {};

  if (nivel) {
    const nivelesValidos = ['basico', 'intermedio', 'avanzado'];
    if (!nivelesValidos.includes(nivel)) {
      return res.status(400).json({ mensaje: 'El nivel debe ser: basico, intermedio o avanzado' });
    }
    filtro.nivel = nivel;
  }

  if (tipo) {
    const tiposValidos = ['dictado', 'completar', 'libre', 'copia'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ mensaje: 'El tipo debe ser: dictado, completar, libre o copia' });
    }
    filtro.tipo = tipo;
  }

  try {
    const ejercicios = await prisma.ejercicios_escritura.findMany({
      where: filtro,
      select: {
        id: true, titulo: true, tipo: true,
        descripcion: true, nivel: true, creado_en: true,
        // contenido excluido del listado
      },
      orderBy: { titulo: 'asc' },
    });
    res.json(ejercicios);
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/ejercicios/:id ──────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const ejercicio = await prisma.ejercicios_escritura.findUnique({ where: { id } });
    if (!ejercicio) return res.status(404).json({ mensaje: 'Ejercicio no encontrado' });
    res.json(ejercicio);
  } catch (error) {
    console.error('Error al obtener ejercicio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/ejercicios ─────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { titulo, tipo, descripcion, contenido, nivel } = req.body;

  if (!titulo || !tipo || !nivel) {
    return res.status(400).json({ mensaje: 'Los campos titulo, tipo y nivel son requeridos' });
  }

  const tiposValidos = ['dictado', 'completar', 'libre', 'copia'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ mensaje: 'El tipo debe ser: dictado, completar, libre o copia' });
  }

  const nivelesValidos = ['basico', 'intermedio', 'avanzado'];
  if (!nivelesValidos.includes(nivel)) {
    return res.status(400).json({ mensaje: 'El nivel debe ser: basico, intermedio o avanzado' });
  }

  try {
    const nuevoEjercicio = await prisma.ejercicios_escritura.create({
      data: {
        titulo: titulo.trim(),
        tipo,
        descripcion: descripcion ? descripcion.trim() : null,
        contenido: contenido ? contenido.trim() : null,
        nivel,
      },
    });

    res.status(201).json({ mensaje: 'Ejercicio creado exitosamente', ejercicio: nuevoEjercicio });
  } catch (error) {
    console.error('Error al crear ejercicio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── PUT /api/ejercicios/:id ──────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, tipo, descripcion, contenido, nivel } = req.body;

  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  if (tipo) {
    const tiposValidos = ['dictado', 'completar', 'libre', 'copia'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ mensaje: 'El tipo debe ser: dictado, completar, libre o copia' });
    }
  }

  if (nivel) {
    const nivelesValidos = ['basico', 'intermedio', 'avanzado'];
    if (!nivelesValidos.includes(nivel)) {
      return res.status(400).json({ mensaje: 'El nivel debe ser: basico, intermedio o avanzado' });
    }
  }

  try {
    const ejercicio = await prisma.ejercicios_escritura.findUnique({ where: { id } });
    if (!ejercicio) return res.status(404).json({ mensaje: 'Ejercicio no encontrado' });

    const ejercicioActualizado = await prisma.ejercicios_escritura.update({
      where: { id },
      data: {
        ...(titulo      && { titulo: titulo.trim() }),
        ...(tipo        && { tipo }),
        ...(descripcion !== undefined && { descripcion: descripcion ? descripcion.trim() : null }),
        ...(contenido   !== undefined && { contenido: contenido ? contenido.trim() : null }),
        ...(nivel       && { nivel }),
      },
    });

    res.json({ mensaje: 'Ejercicio actualizado correctamente', ejercicio: ejercicioActualizado });
  } catch (error) {
    console.error('Error al actualizar ejercicio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── DELETE /api/ejercicios/:id ───────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const ejercicio = await prisma.ejercicios_escritura.findUnique({ where: { id } });
    if (!ejercicio) return res.status(404).json({ mensaje: 'Ejercicio no encontrado' });

    await prisma.ejercicios_escritura.delete({ where: { id } });

    res.json({ mensaje: `Ejercicio "${ejercicio.titulo}" eliminado correctamente` });
  } catch (error) {
    console.error('Error al eliminar ejercicio:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
