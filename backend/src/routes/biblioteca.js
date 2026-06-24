/**
 * biblioteca.js - Rutas para gestionar la biblioteca offline (usando tabla textos)
 * 
 * GET /api/biblioteca - Obtener todos los materiales de la biblioteca
 * GET /api/biblioteca/:id - Obtener un material específico
 * POST /api/biblioteca - Agregar un nuevo material
 * PUT /api/biblioteca/:id - Actualizar un material
 * DELETE /api/biblioteca/:id - Eliminar un material (soft delete)
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/biblioteca ─────────────────────────────────────────────────────
// Obtener todos los materiales de la biblioteca (con filtros opcionales)
router.get('/', async (req, res) => {
  const { grado, nivel, categoria, activo } = req.query;

  try {
    const where = {};
    
    if (grado) where.grado = grado;
    if (nivel) where.nivel = nivel;
    if (categoria) where.categoria = categoria;
    if (activo !== undefined) where.activo = activo === 'true';

    const materiales = await prisma.textos.findMany({
      where,
      orderBy: { creado_en: 'desc' },
    });

    // Calcular estadísticas adicionales
    const materialesConStats = materiales.map(material => ({
      ...material,
      caracteres: material.contenido.length,
      palabras: material.contenido.split(/\s+/).length,
    }));

    res.json(materialesConStats);
  } catch (error) {
    console.error('Error al obtener biblioteca:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/biblioteca/:id ───────────────────────────────────────────────────
// Obtener un material específico por ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const material = await prisma.textos.findUnique({
      where: { id },
    });

    if (!material) {
      return res.status(404).json({ mensaje: 'Material no encontrado' });
    }

    // Agregar estadísticas
    const materialConStats = {
      ...material,
      caracteres: material.contenido.length,
      palabras: material.contenido.split(/\s+/).length,
    };

    res.json(materialConStats);
  } catch (error) {
    console.error('Error al obtener material:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/biblioteca ──────────────────────────────────────────────────────
// Agregar un nuevo material a la biblioteca
router.post('/', async (req, res) => {
  const { titulo, contenido, autor, grado, categoria, nivel } = req.body;

  // Validaciones
  if (!titulo || !contenido || !autor || !nivel) {
    return res.status(400).json({ 
      mensaje: 'Faltan campos requeridos: titulo, contenido, autor, nivel' 
    });
  }

  if (contenido.length < 50) {
    return res.status(400).json({ mensaje: 'El contenido debe tener al menos 50 caracteres' });
  }

  try {
    const nuevoMaterial = await prisma.textos.create({
      data: {
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        autor: autor.trim(),
        grado: grado ? grado.trim() : null,
        categoria: categoria ? categoria.trim() : null,
        nivel,
      },
    });

    res.status(201).json({
      mensaje: 'Material agregado exitosamente',
      material: nuevoMaterial,
    });
  } catch (error) {
    console.error('Error al agregar material:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── PUT /api/biblioteca/:id ───────────────────────────────────────────────────
// Actualizar un material existente
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  const { titulo, contenido, autor, grado, categoria, nivel } = req.body;

  try {
    const materialActualizado = await prisma.textos.update({
      where: { id },
      data: {
        ...(titulo && { titulo: titulo.trim() }),
        ...(contenido && { contenido: contenido.trim() }),
        ...(autor && { autor: autor.trim() }),
        ...(grado !== undefined && { grado: grado ? grado.trim() : null }),
        ...(categoria !== undefined && { categoria: categoria ? categoria.trim() : null }),
        ...(nivel && { nivel }),
      },
    });

    res.json({
      mensaje: 'Material actualizado exitosamente',
      material: materialActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar material:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ mensaje: 'Material no encontrado' });
    }
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── DELETE /api/biblioteca/:id ─────────────────────────────────────────────────
// Eliminar un material (soft delete)
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const materialEliminado = await prisma.textos.update({
      where: { id },
      data: { activo: false },
    });

    res.json({
      mensaje: 'Material eliminado exitosamente',
      material: materialEliminado,
    });
  } catch (error) {
    console.error('Error al eliminar material:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ mensaje: 'Material no encontrado' });
    }
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/biblioteca/estadisticas ───────────────────────────────────────────
// Obtener estadísticas de la biblioteca
router.get('/stats/estadisticas', async (req, res) => {
  try {
    const [total, porGrado, porCategoria, porNivel] = await Promise.all([
      prisma.textos.count({ where: { activo: true } }),
      prisma.textos.groupBy({
        by: ['grado'],
        where: { activo: true, grado: { not: null } },
        _count: { id: true },
      }),
      prisma.textos.groupBy({
        by: ['categoria'],
        where: { activo: true, categoria: { not: null } },
        _count: { id: true },
      }),
      prisma.textos.groupBy({
        by: ['nivel'],
        where: { activo: true },
        _count: { id: true },
      }),
    ]);

    const todosMateriales = await prisma.textos.findMany({
      where: { activo: true },
      select: { contenido: true },
    });

    const totalCaracteres = todosMateriales.reduce((sum, m) => sum + m.contenido.length, 0);
    const totalPalabras = todosMateriales.reduce((sum, m) => sum + m.contenido.split(/\s+/).length, 0);

    res.json({
      total,
      totalCaracteres,
      totalPalabras,
      porGrado: porGrado.reduce((acc, item) => {
        acc[item.grado] = item._count.id;
        return acc;
      }, {}),
      porCategoria: porCategoria.reduce((acc, item) => {
        acc[item.categoria] = item._count.id;
        return acc;
      }, {}),
      porNivel: porNivel.reduce((acc, item) => {
        acc[item.nivel] = item._count.id;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
