/**
 * textos.js - Rutas para gestión de textos de lectura
 *
 * GET    /api/textos              - Listar todos los textos activos
 * GET    /api/textos/:id          - Detalle de un texto
 * POST   /api/textos              - Crear nuevo texto
 * PUT    /api/textos/:id          - Editar texto
 * DELETE /api/textos/:id          - Soft delete de un texto
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/textos ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { nivel } = req.query;

  const filtro = { activo: true };
  if (nivel) {
    const nivelesValidos = ['basico', 'intermedio', 'avanzado'];
    if (!nivelesValidos.includes(nivel)) {
      return res.status(400).json({ mensaje: 'El nivel debe ser: basico, intermedio o avanzado' });
    }
    filtro.nivel = nivel;
  }

  try {
    const textos = await prisma.textos.findMany({
      where: filtro,
      select: {
        id: true, titulo: true, autor: true,
        nivel: true, activo: true, creado_en: true,
        // contenido excluido del listado para no sobrecargar la respuesta
      },
      orderBy: { titulo: 'asc' },
    });
    res.json(textos);
  } catch (error) {
    console.error('Error al obtener textos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/textos/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const texto = await prisma.textos.findUnique({ where: { id } });
    if (!texto || !texto.activo) {
      return res.status(404).json({ mensaje: 'Texto no encontrado' });
    }
    res.json(texto);
  } catch (error) {
    console.error('Error al obtener texto:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/textos ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { titulo, autor, contenido, nivel } = req.body;

  if (!titulo || !autor || !contenido || !nivel) {
    return res.status(400).json({ mensaje: 'Los campos titulo, autor, contenido y nivel son requeridos' });
  }

  const nivelesValidos = ['basico', 'intermedio', 'avanzado'];
  if (!nivelesValidos.includes(nivel)) {
    return res.status(400).json({ mensaje: 'El nivel debe ser: basico, intermedio o avanzado' });
  }

  try {
    const nuevoTexto = await prisma.textos.create({
      data: {
        titulo: titulo.trim(),
        autor: autor.trim(),
        contenido: contenido.trim(),
        nivel,
      },
    });

    res.status(201).json({ mensaje: 'Texto creado exitosamente', texto: nuevoTexto });
  } catch (error) {
    console.error('Error al crear texto:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── PUT /api/textos/:id ──────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, autor, contenido, nivel, activo } = req.body;

  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  if (nivel) {
    const nivelesValidos = ['basico', 'intermedio', 'avanzado'];
    if (!nivelesValidos.includes(nivel)) {
      return res.status(400).json({ mensaje: 'El nivel debe ser: basico, intermedio o avanzado' });
    }
  }

  try {
    const texto = await prisma.textos.findUnique({ where: { id } });
    if (!texto) return res.status(404).json({ mensaje: 'Texto no encontrado' });

    const textoActualizado = await prisma.textos.update({
      where: { id },
      data: {
        ...(titulo    && { titulo: titulo.trim() }),
        ...(autor     && { autor: autor.trim() }),
        ...(contenido && { contenido: contenido.trim() }),
        ...(nivel     && { nivel }),
        ...(activo !== undefined && { activo }),
      },
    });

    res.json({ mensaje: 'Texto actualizado correctamente', texto: textoActualizado });
  } catch (error) {
    console.error('Error al actualizar texto:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── DELETE /api/textos/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const texto = await prisma.textos.findUnique({ where: { id } });
    if (!texto) return res.status(404).json({ mensaje: 'Texto no encontrado' });

    await prisma.textos.update({ where: { id }, data: { activo: false } });

    res.json({ mensaje: `Texto "${texto.titulo}" eliminado correctamente` });
  } catch (error) {
    console.error('Error al eliminar texto:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
