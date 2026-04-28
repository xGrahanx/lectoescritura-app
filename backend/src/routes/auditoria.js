/**
 * auditoria.js - Rutas para consultar la bitácora de auditoría
 * 
 * Solo accesible para administradores
 * 
 * GET /api/auditoria              - Obtener todos los registros de auditoría (con filtros)
 * GET /api/auditoria/:id          - Obtener un registro específico
 * GET /api/auditoria/usuario/:id  - Obtener auditoría de un usuario específico
 * GET /api/auditoria/tabla/:tabla - Obtener auditoría de una tabla específica
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/auditoria ──────────────────────────────────────────────────────
// Obtener registros de auditoría con filtros opcionales
router.get('/', async (req, res) => {
  const { tabla, operacion, usuario_id, fecha_desde, fecha_hasta, limit = 100, offset = 0 } = req.query;

  try {
    const where = {};
    
    if (tabla) where.tabla = tabla;
    if (operacion) where.operacion = operacion;
    if (usuario_id) where.usuario_id = parseInt(usuario_id);
    
    if (fecha_desde || fecha_hasta) {
      where.creado_en = {};
      if (fecha_desde) where.creado_en.gte = new Date(fecha_desde);
      if (fecha_hasta) where.creado_en.lte = new Date(fecha_hasta);
    }

    const [registros, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              rol: true,
            },
          },
        },
        orderBy: { creado_en: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.auditoria.count({ where }),
    ]);

    res.json({
      registros,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Error al obtener auditoría:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/auditoria/:id ──────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const registro = await prisma.auditoria.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            rol: true,
          },
        },
      },
    });

    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado' });

    res.json(registro);
  } catch (error) {
    console.error('Error al obtener registro de auditoría:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/auditoria/usuario/:id ──────────────────────────────────────────
router.get('/usuario/:id', async (req, res) => {
  const usuario_id = parseInt(req.params.id);
  if (isNaN(usuario_id)) return res.status(400).json({ mensaje: 'ID inválido' });

  const { limit = 50, offset = 0 } = req.query;

  try {
    const [registros, total] = await Promise.all([
      prisma.auditoria.findMany({
        where: { usuario_id },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              rol: true,
            },
          },
        },
        orderBy: { creado_en: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.auditoria.count({ where: { usuario_id } }),
    ]);

    res.json({
      registros,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Error al obtener auditoría del usuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/auditoria/tabla/:tabla ─────────────────────────────────────────
router.get('/tabla/:tabla', async (req, res) => {
  const { tabla } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const [registros, total] = await Promise.all([
      prisma.auditoria.findMany({
        where: { tabla },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              rol: true,
            },
          },
        },
        orderBy: { creado_en: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.auditoria.count({ where: { tabla } }),
    ]);

    res.json({
      registros,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Error al obtener auditoría de la tabla:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/auditoria/estadisticas ─────────────────────────────────────────
router.get('/stats/resumen', async (req, res) => {
  try {
    const [
      totalRegistros,
      registrosPorTabla,
      registrosPorOperacion,
      registrosRecientes,
    ] = await Promise.all([
      prisma.auditoria.count(),
      prisma.$queryRaw`
        SELECT tabla, COUNT(*)::int as total
        FROM auditoria
        GROUP BY tabla
        ORDER BY total DESC
      `,
      prisma.$queryRaw`
        SELECT operacion, COUNT(*)::int as total
        FROM auditoria
        GROUP BY operacion
      `,
      prisma.auditoria.findMany({
        take: 10,
        orderBy: { creado_en: 'desc' },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              rol: true,
            },
          },
        },
      }),
    ]);

    res.json({
      totalRegistros,
      registrosPorTabla,
      registrosPorOperacion,
      registrosRecientes,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de auditoría:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
