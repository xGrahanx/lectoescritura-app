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
router.get('/', async (req, res) => {
  try {
    const grupos = await prisma.Grupo.findMany({
      where: { activo: true },
      include: {
        usuarios: {
          select: { id: true, nombre: true, apellido: true, correo: true },
        },
        _count: { select: { grupos_estudiantes: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    // Normalizar la respuesta para que la app reciba el formato esperado
    const resultado = grupos.map(g => ({
      id: g.id,
      nombre: g.nombre,
      activo: g.activo,
      docente: g.usuarios,
      _count: { estudiantes: g._count.grupos_estudiantes },
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/grupos/docente/:docenteId ───────────────────────────────────────
router.get('/docente/:docenteId', async (req, res) => {
  const docenteId = parseInt(req.params.docenteId);
  if (isNaN(docenteId)) {
    return res.status(400).json({ mensaje: 'ID de docente invalido' });
  }

  try {
    const grupos = await prisma.Grupo.findMany({
      where: { docente_id: docenteId, activo: true },
      include: {
        usuarios: {
          select: { id: true, nombre: true, apellido: true },
        },
        grupos_estudiantes: {
          include: {
            usuarios: {
              select: { id: true, nombre: true, apellido: true, correo: true, grado: true },
            },
          },
        },
        _count: { select: { grupos_estudiantes: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    // Normalizar para que la app reciba el formato esperado
    const resultado = grupos.map(g => ({
      id: g.id,
      nombre: g.nombre,
      docente: g.usuarios,
      _count: { estudiantes: g._count.grupos_estudiantes },
      estudiantes: g.grupos_estudiantes.map(ge => ({
        estudianteId: ge.estudiante_id,
        estudiante: ge.usuarios,
      })),
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener grupos del docente:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/grupos/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID invalido' });

  try {
    const grupo = await prisma.Grupo.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: { id: true, nombre: true, apellido: true, correo: true },
        },
        grupos_estudiantes: {
          include: {
            usuarios: {
              select: { id: true, nombre: true, apellido: true, correo: true, grado: true },
            },
          },
        },
      },
    });

    if (!grupo) return res.status(404).json({ mensaje: 'Grupo no encontrado' });

    res.json({
      id: grupo.id,
      nombre: grupo.nombre,
      docente: grupo.usuarios,
      estudiantes: grupo.grupos_estudiantes.map(ge => ({
        estudianteId: ge.estudiante_id,
        estudiante: ge.usuarios,
      })),
    });
  } catch (error) {
    console.error('Error al obtener grupo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/grupos ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { nombre, docenteId } = req.body;

  if (!nombre || !docenteId) {
    return res.status(400).json({ mensaje: 'El nombre y el docente son requeridos' });
  }

  try {
    const docente = await prisma.Usuario.findFirst({
      where: { id: parseInt(docenteId), rol: 'docente', activo: true },
    });
    if (!docente) {
      return res.status(404).json({ mensaje: 'Docente no encontrado o inactivo' });
    }

    const grupoExistente = await prisma.Grupo.findUnique({ where: { nombre } });
    if (grupoExistente) {
      return res.status(409).json({ mensaje: 'Ya existe un grupo con ese nombre' });
    }

    const nuevoGrupo = await prisma.Grupo.create({
      data: { nombre, docente_id: parseInt(docenteId) },
      include: {
        usuarios: { select: { id: true, nombre: true, apellido: true } },
        _count: { select: { grupos_estudiantes: true } },
      },
    });

    res.status(201).json({
      mensaje: 'Grupo creado exitosamente',
      grupo: {
        id: nuevoGrupo.id,
        nombre: nuevoGrupo.nombre,
        docente: nuevoGrupo.usuarios,
        _count: { estudiantes: nuevoGrupo._count.grupos_estudiantes },
      },
    });
  } catch (error) {
    console.error('Error al crear grupo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── PUT /api/grupos/:id ──────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, docenteId } = req.body;

  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID invalido' });

  try {
    const grupo = await prisma.Grupo.findUnique({ where: { id } });
    if (!grupo) return res.status(404).json({ mensaje: 'Grupo no encontrado' });

    if (docenteId) {
      const docente = await prisma.Usuario.findFirst({
        where: { id: parseInt(docenteId), rol: 'docente', activo: true },
      });
      if (!docente) return res.status(404).json({ mensaje: 'Docente no encontrado' });
    }

    const grupoActualizado = await prisma.Grupo.update({
      where: { id },
      data: {
        ...(nombre    && { nombre }),
        ...(docenteId && { docente_id: parseInt(docenteId) }),
      },
      include: {
        usuarios: { select: { id: true, nombre: true, apellido: true } },
        _count: { select: { grupos_estudiantes: true } },
      },
    });

    res.json({
      mensaje: 'Grupo actualizado',
      grupo: {
        id: grupoActualizado.id,
        nombre: grupoActualizado.nombre,
        docente: grupoActualizado.usuarios,
        _count: { estudiantes: grupoActualizado._count.grupos_estudiantes },
      },
    });
  } catch (error) {
    console.error('Error al actualizar grupo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/grupos/:id/estudiantes ─────────────────────────────────────────
router.post('/:id/estudiantes', async (req, res) => {
  const grupoId      = parseInt(req.params.id);
  const estudianteId = parseInt(req.body.estudianteId);

  if (isNaN(grupoId) || isNaN(estudianteId)) {
    return res.status(400).json({ mensaje: 'IDs invalidos' });
  }

  try {
    const estudiante = await prisma.Usuario.findFirst({
      where: { id: estudianteId, rol: 'estudiante', activo: true },
    });
    if (!estudiante) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const grupo = await prisma.Grupo.findUnique({ where: { id: grupoId } });
    if (!grupo) return res.status(404).json({ mensaje: 'Grupo no encontrado' });

    const yaEnGrupo = await prisma.GrupoEstudiante.findUnique({
      where: { grupo_id_estudiante_id: { grupo_id: grupoId, estudiante_id: estudianteId } },
    });
    if (yaEnGrupo) {
      return res.status(409).json({ mensaje: 'El estudiante ya pertenece a este grupo' });
    }

    await prisma.GrupoEstudiante.create({
      data: { grupo_id: grupoId, estudiante_id: estudianteId },
    });

    res.status(201).json({
      mensaje: `${estudiante.nombre} ${estudiante.apellido} agregado al grupo exitosamente`,
    });
  } catch (error) {
    console.error('Error al agregar estudiante:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── DELETE /api/grupos/:id/estudiantes/:estudianteId ─────────────────────────
router.delete('/:id/estudiantes/:estudianteId', async (req, res) => {
  const grupoId      = parseInt(req.params.id);
  const estudianteId = parseInt(req.params.estudianteId);

  if (isNaN(grupoId) || isNaN(estudianteId)) {
    return res.status(400).json({ mensaje: 'IDs invalidos' });
  }

  try {
    const relacion = await prisma.GrupoEstudiante.findUnique({
      where: { grupo_id_estudiante_id: { grupo_id: grupoId, estudiante_id: estudianteId } },
    });
    if (!relacion) {
      return res.status(404).json({ mensaje: 'El estudiante no pertenece a este grupo' });
    }

    await prisma.GrupoEstudiante.delete({
      where: { grupo_id_estudiante_id: { grupo_id: grupoId, estudiante_id: estudianteId } },
    });

    res.json({ mensaje: 'Estudiante removido del grupo correctamente' });
  } catch (error) {
    console.error('Error al quitar estudiante:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── DELETE /api/grupos/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID invalido' });

  try {
    const grupo = await prisma.Grupo.findUnique({ where: { id } });
    if (!grupo) return res.status(404).json({ mensaje: 'Grupo no encontrado' });

    await prisma.Grupo.update({ where: { id }, data: { activo: false } });

    res.json({ mensaje: `Grupo "${grupo.nombre}" eliminado correctamente` });
  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
