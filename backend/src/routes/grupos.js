/**
 * grupos.js - Rutas para gestion de grupos/secciones
 *
 * GET    /api/grupos                    - Listar todos los grupos
 * GET    /api/grupos/:id                - Detalle de un grupo con sus estudiantes
 * GET    /api/grupos/docente/:docenteId - Grupos asignados a un docente
 * POST   /api/grupos                    - Crear nuevo grupo
 * PUT    /api/grupos/:id                - Editar nombre o docente del grupo
 * POST   /api/grupos/:id/estudiantes    - Agregar estudiante al grupo
 * DELETE /api/grupos/:id/estudiantes/:estudianteId - Quitar estudiante del grupo
 * DELETE /api/grupos/:id               - Soft delete del grupo
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/grupos ──────────────────────────────────────────────────────────
// Lista todos los grupos activos con su docente y conteo de estudiantes
router.get('/', async (req, res) => {
  try {
    const grupos = await prisma.grupo.findMany({
      where: { activo: true },
      include: {
        docente: {
          select: { id: true, nombre: true, apellido: true, correo: true },
        },
        _count: { select: { estudiantes: true } },
      },
      orderBy: { nombre: 'asc' },
    });
    res.json(grupos);
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/grupos/docente/:docenteId ───────────────────────────────────────
// Retorna los grupos asignados a un docente especifico con sus estudiantes
router.get('/docente/:docenteId', async (req, res) => {
  const docenteId = parseInt(req.params.docenteId);
  if (isNaN(docenteId)) {
    return res.status(400).json({ mensaje: 'ID de docente invalido' });
  }

  try {
    const grupos = await prisma.grupo.findMany({
      where: { docenteId, activo: true },
      include: {
        estudiantes: {
          include: {
            estudiante: {
              select: { id: true, nombre: true, apellido: true, correo: true, grado: true },
            },
          },
        },
        _count: { select: { estudiantes: true } },
      },
      orderBy: { nombre: 'asc' },
    });
    res.json(grupos);
  } catch (error) {
    console.error('Error al obtener grupos del docente:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/grupos/:id ──────────────────────────────────────────────────────
// Detalle de un grupo con lista completa de estudiantes
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID invalido' });

  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id },
      include: {
        docente: {
          select: { id: true, nombre: true, apellido: true, correo: true },
        },
        estudiantes: {
          include: {
            estudiante: {
              select: { id: true, nombre: true, apellido: true, correo: true, grado: true },
            },
          },
        },
      },
    });

    if (!grupo) return res.status(404).json({ mensaje: 'Grupo no encontrado' });
    res.json(grupo);
  } catch (error) {
    console.error('Error al obtener grupo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/grupos ─────────────────────────────────────────────────────────
// Crea un nuevo grupo y lo asigna a un docente
router.post('/', async (req, res) => {
  const { nombre, docenteId } = req.body;

  if (!nombre || !docenteId) {
    return res.status(400).json({ mensaje: 'El nombre y el docente son requeridos' });
  }

  try {
    // Verificar que el docente existe y tiene rol docente
    const docente = await prisma.usuario.findFirst({
      where: { id: parseInt(docenteId), rol: 'docente', activo: true },
    });
    if (!docente) {
      return res.status(404).json({ mensaje: 'Docente no encontrado o inactivo' });
    }

    // Verificar que el nombre del grupo no exista
    const grupoExistente = await prisma.grupo.findUnique({ where: { nombre } });
    if (grupoExistente) {
      return res.status(409).json({ mensaje: 'Ya existe un grupo con ese nombre' });
    }

    const nuevoGrupo = await prisma.grupo.create({
      data: { nombre, docenteId: parseInt(docenteId) },
      include: {
        docente: { select: { id: true, nombre: true, apellido: true } },
        _count: { select: { estudiantes: true } },
      },
    });

    res.status(201).json({ mensaje: 'Grupo creado exitosamente', grupo: nuevoGrupo });
  } catch (error) {
    console.error('Error al crear grupo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── PUT /api/grupos/:id ──────────────────────────────────────────────────────
// Actualiza el nombre o el docente asignado al grupo
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, docenteId } = req.body;

  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID invalido' });

  try {
    const grupo = await prisma.grupo.findUnique({ where: { id } });
    if (!grupo) return res.status(404).json({ mensaje: 'Grupo no encontrado' });

    // Si se cambia el docente, verificar que existe
    if (docenteId) {
      const docente = await prisma.usuario.findFirst({
        where: { id: parseInt(docenteId), rol: 'docente', activo: true },
      });
      if (!docente) return res.status(404).json({ mensaje: 'Docente no encontrado' });
    }

    const grupoActualizado = await prisma.grupo.update({
      where: { id },
      data: {
        ...(nombre    && { nombre }),
        ...(docenteId && { docenteId: parseInt(docenteId) }),
      },
      include: {
        docente: { select: { id: true, nombre: true, apellido: true } },
        _count: { select: { estudiantes: true } },
      },
    });

    res.json({ mensaje: 'Grupo actualizado', grupo: grupoActualizado });
  } catch (error) {
    console.error('Error al actualizar grupo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/grupos/:id/estudiantes ─────────────────────────────────────────
// Agrega un estudiante al grupo
router.post('/:id/estudiantes', async (req, res) => {
  const grupoId      = parseInt(req.params.id);
  const estudianteId = parseInt(req.body.estudianteId);

  if (isNaN(grupoId) || isNaN(estudianteId)) {
    return res.status(400).json({ mensaje: 'IDs invalidos' });
  }

  try {
    // Verificar que el estudiante existe y tiene rol estudiante
    const estudiante = await prisma.usuario.findFirst({
      where: { id: estudianteId, rol: 'estudiante', activo: true },
    });
    if (!estudiante) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    // Verificar que el grupo existe
    const grupo = await prisma.grupo.findUnique({ where: { id: grupoId } });
    if (!grupo) return res.status(404).json({ mensaje: 'Grupo no encontrado' });

    // Verificar que el estudiante no este ya en el grupo
    const yaEnGrupo = await prisma.grupoEstudiante.findUnique({
      where: { grupoId_estudianteId: { grupoId, estudianteId } },
    });
    if (yaEnGrupo) {
      return res.status(409).json({ mensaje: 'El estudiante ya pertenece a este grupo' });
    }

    await prisma.grupoEstudiante.create({ data: { grupoId, estudianteId } });

    res.status(201).json({
      mensaje: `${estudiante.nombre} ${estudiante.apellido} agregado al grupo exitosamente`,
    });
  } catch (error) {
    console.error('Error al agregar estudiante:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── DELETE /api/grupos/:id/estudiantes/:estudianteId ─────────────────────────
// Quita un estudiante del grupo
router.delete('/:id/estudiantes/:estudianteId', async (req, res) => {
  const grupoId      = parseInt(req.params.id);
  const estudianteId = parseInt(req.params.estudianteId);

  if (isNaN(grupoId) || isNaN(estudianteId)) {
    return res.status(400).json({ mensaje: 'IDs invalidos' });
  }

  try {
    const relacion = await prisma.grupoEstudiante.findUnique({
      where: { grupoId_estudianteId: { grupoId, estudianteId } },
    });
    if (!relacion) {
      return res.status(404).json({ mensaje: 'El estudiante no pertenece a este grupo' });
    }

    await prisma.grupoEstudiante.delete({
      where: { grupoId_estudianteId: { grupoId, estudianteId } },
    });

    res.json({ mensaje: 'Estudiante removido del grupo correctamente' });
  } catch (error) {
    console.error('Error al quitar estudiante:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── DELETE /api/grupos/:id ───────────────────────────────────────────────────
// Soft delete del grupo
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID invalido' });

  try {
    const grupo = await prisma.grupo.findUnique({ where: { id } });
    if (!grupo) return res.status(404).json({ mensaje: 'Grupo no encontrado' });

    await prisma.grupo.update({ where: { id }, data: { activo: false } });

    res.json({ mensaje: `Grupo "${grupo.nombre}" eliminado correctamente` });
  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
