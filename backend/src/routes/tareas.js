/**
 * tareas.js - Rutas para gestión de tareas
 *
 * GET    /api/tareas/estudiante/:estudianteId  - Tareas de un estudiante
 * GET    /api/tareas/docente/:docenteId        - Tareas creadas por un docente
 * GET    /api/tareas/:id                       - Detalle de una tarea
 * POST   /api/tareas                           - Crear nueva tarea
 * PUT    /api/tareas/:id/estado                - Actualizar estado de una tarea
 * DELETE /api/tareas/:id                       - Eliminar tarea
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/tareas/estudiante/:estudianteId ─────────────────────────────────
router.get('/estudiante/:estudianteId', async (req, res) => {
  const estudianteId = parseInt(req.params.estudianteId);
  if (isNaN(estudianteId)) {
    return res.status(400).json({ mensaje: 'ID de estudiante inválido' });
  }

  try {
    const tareas = await prisma.tareas.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        usuarios_tareas_docente_idTousuarios: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
      orderBy: { fecha_limite: 'asc' },
    });

    const resultado = tareas.map(t => ({
      id: t.id,
      titulo: t.titulo,
      descripcion: t.descripcion,
      tipo: t.tipo,
      estado: t.estado,
      fecha_limite: t.fecha_limite,
      es_avanzada: t.es_avanzada,
      creado_en: t.creado_en,
      docente: t.usuarios_tareas_docente_idTousuarios,
      texto_id: t.texto_id,
      ejercicio_id: t.ejercicio_id,
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener tareas del estudiante:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/tareas/docente/:docenteId ───────────────────────────────────────
router.get('/docente/:docenteId', async (req, res) => {
  const docenteId = parseInt(req.params.docenteId);
  if (isNaN(docenteId)) {
    return res.status(400).json({ mensaje: 'ID de docente inválido' });
  }

  try {
    const tareas = await prisma.tareas.findMany({
      where: { docente_id: docenteId },
      include: {
        usuarios_tareas_estudiante_idTousuarios: {
          select: { id: true, nombre: true, apellido: true, grado: true },
        },
      },
      orderBy: { creado_en: 'desc' },
    });

    const resultado = tareas.map(t => ({
      id: t.id,
      titulo: t.titulo,
      descripcion: t.descripcion,
      tipo: t.tipo,
      estado: t.estado,
      fecha_limite: t.fecha_limite,
      es_avanzada: t.es_avanzada,
      creado_en: t.creado_en,
      estudiante: t.usuarios_tareas_estudiante_idTousuarios,
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener tareas del docente:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/tareas/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const tarea = await prisma.tareas.findUnique({
      where: { id },
      include: {
        usuarios_tareas_docente_idTousuarios: {
          select: { id: true, nombre: true, apellido: true },
        },
        usuarios_tareas_estudiante_idTousuarios: {
          select: { id: true, nombre: true, apellido: true, grado: true },
        },
      },
    });

    if (!tarea) return res.status(404).json({ mensaje: 'Tarea no encontrada' });

    res.json({
      id: tarea.id,
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      tipo: tarea.tipo,
      estado: tarea.estado,
      fecha_limite: tarea.fecha_limite,
      es_avanzada: tarea.es_avanzada,
      creado_en: tarea.creado_en,
      docente: tarea.usuarios_tareas_docente_idTousuarios,
      estudiante: tarea.usuarios_tareas_estudiante_idTousuarios,
    });
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/tareas ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { titulo, descripcion, tipo, docenteId, estudianteId, fecha_limite, es_avanzada, texto_id, ejercicio_id } = req.body;

  if (!titulo || !descripcion || !tipo || !docenteId || !estudianteId) {
    return res.status(400).json({
      mensaje: 'Los campos titulo, descripcion, tipo, docenteId y estudianteId son requeridos',
    });
  }

  const tiposValidos = ['lectura', 'escritura', 'especial', 'ia'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ mensaje: 'El tipo debe ser: lectura, escritura, especial o ia' });
  }

  try {
    const docente = await prisma.usuario.findFirst({
      where: { id: parseInt(docenteId), rol: 'docente', activo: true },
    });
    if (!docente) return res.status(404).json({ mensaje: 'Docente no encontrado' });

    const estudiante = await prisma.usuario.findFirst({
      where: { id: parseInt(estudianteId), rol: 'estudiante', activo: true },
    });
    if (!estudiante) return res.status(404).json({ mensaje: 'Estudiante no encontrado' });

    const nuevaTarea = await prisma.tareas.create({
      data: {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        docente_id: parseInt(docenteId),
        estudiante_id: parseInt(estudianteId),
        fecha_limite: fecha_limite ? (() => {
          const d = new Date(fecha_limite);
          return isNaN(d.getTime()) ? null : d;
        })() : null,
        es_avanzada: es_avanzada || false,
        estado: 'pendiente',
        texto_id: texto_id ? parseInt(texto_id) : null,
        ejercicio_id: ejercicio_id ? parseInt(ejercicio_id) : null,
      },
    });

    res.status(201).json({ mensaje: 'Tarea creada exitosamente', tarea: nuevaTarea });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── PUT /api/tareas/:id/estado ───────────────────────────────────────────────
router.put('/:id/estado', async (req, res) => {
  const id = parseInt(req.params.id);
  const { estado } = req.body;

  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  const estadosValidos = ['pendiente', 'completada', 'vencida'];
  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ mensaje: 'El estado debe ser: pendiente, completada o vencida' });
  }

  try {
    const tarea = await prisma.tareas.findUnique({ where: { id } });
    if (!tarea) return res.status(404).json({ mensaje: 'Tarea no encontrada' });

    const tareaActualizada = await prisma.tareas.update({
      where: { id },
      data: { estado },
    });

    res.json({ mensaje: 'Estado actualizado correctamente', tarea: tareaActualizada });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── DELETE /api/tareas/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const tarea = await prisma.tareas.findUnique({ where: { id } });
    if (!tarea) return res.status(404).json({ mensaje: 'Tarea no encontrada' });

    await prisma.tareas.delete({ where: { id } });

    res.json({ mensaje: `Tarea "${tarea.titulo}" eliminada correctamente` });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
