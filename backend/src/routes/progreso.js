/**
 * progreso.js - Rutas para progreso diario y resultados
 *
 * GET  /api/progreso/:estudianteId              - Progreso diario de un estudiante
 * POST /api/progreso/:estudianteId              - Registrar o actualizar progreso del día
 * GET  /api/progreso/:estudianteId/resumen      - Resumen general (racha, promedio, total ejercicios)
 *
 * GET  /api/progreso/:estudianteId/lectura      - Resultados de lectura del estudiante
 * POST /api/progreso/:estudianteId/lectura      - Guardar resultado de lectura
 *
 * GET  /api/progreso/:estudianteId/escritura    - Resultados de escritura del estudiante
 * POST /api/progreso/:estudianteId/escritura    - Guardar resultado de escritura
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/progreso/:estudianteId ─────────────────────────────────────────
router.get('/:estudianteId', async (req, res) => {
  const estudianteId = parseInt(req.params.estudianteId);
  if (isNaN(estudianteId)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const progreso = await prisma.progreso_diario.findMany({
      where: { estudiante_id: estudianteId },
      orderBy: { fecha: 'desc' },
      take: 30, // últimos 30 días
    });
    res.json(progreso);
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/progreso/:estudianteId ────────────────────────────────────────
// Registra o actualiza el progreso del día actual
router.post('/:estudianteId', async (req, res) => {
  const estudianteId = parseInt(req.params.estudianteId);
  const { puntaje_promedio, ejercicios_completados, racha_dias } = req.body;

  if (isNaN(estudianteId)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const estudiante = await prisma.usuario.findFirst({
      where: { id: estudianteId, rol: 'estudiante', activo: true },
    });
    if (!estudiante) return res.status(404).json({ mensaje: 'Estudiante no encontrado' });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Buscar si ya existe registro de hoy
    const registroHoy = await prisma.progreso_diario.findFirst({
      where: { estudiante_id: estudianteId, fecha: hoy },
    });

    let progreso;
    if (registroHoy) {
      // Actualizar el registro existente
      progreso = await prisma.progreso_diario.update({
        where: { id: registroHoy.id },
        data: {
          ...(puntaje_promedio !== undefined      && { puntaje_promedio }),
          ...(ejercicios_completados !== undefined && { ejercicios_completados }),
          ...(racha_dias !== undefined             && { racha_dias }),
        },
      });
    } else {
      // Crear nuevo registro para hoy
      progreso = await prisma.progreso_diario.create({
        data: {
          estudiante_id: estudianteId,
          fecha: hoy,
          puntaje_promedio: puntaje_promedio || 0,
          ejercicios_completados: ejercicios_completados || 0,
          racha_dias: racha_dias || 0,
        },
      });
    }

    res.status(201).json({ mensaje: 'Progreso registrado correctamente', progreso });
  } catch (error) {
    console.error('Error al registrar progreso:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/progreso/:estudianteId/resumen ─────────────────────────────────
router.get('/:estudianteId/resumen', async (req, res) => {
  const estudianteId = parseInt(req.params.estudianteId);
  if (isNaN(estudianteId)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const registros = await prisma.progreso_diario.findMany({
      where: { estudiante_id: estudianteId },
      orderBy: { fecha: 'desc' },
    });

    if (registros.length === 0) {
      return res.json({
        totalEjercicios: 0,
        promedioGeneral: 0,
        rachaDias: 0,
        diasActivo: 0,
      });
    }

    const totalEjercicios = registros.reduce((sum, r) => sum + (r.ejercicios_completados || 0), 0);
    const promedioGeneral = Math.round(
      registros.reduce((sum, r) => sum + (r.puntaje_promedio || 0), 0) / registros.length
    );
    const rachaDias = registros[0].racha_dias || 0;

    res.json({
      totalEjercicios,
      promedioGeneral,
      rachaDias,
      diasActivo: registros.length,
    });
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/progreso/:estudianteId/lectura ─────────────────────────────────
router.get('/:estudianteId/lectura', async (req, res) => {
  const estudianteId = parseInt(req.params.estudianteId);
  if (isNaN(estudianteId)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const resultados = await prisma.resultados_lectura.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        textos: { select: { id: true, titulo: true, autor: true, nivel: true } },
      },
      orderBy: { creado_en: 'desc' },
    });
    res.json(resultados);
  } catch (error) {
    console.error('Error al obtener resultados de lectura:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/progreso/:estudianteId/lectura ────────────────────────────────
router.post('/:estudianteId/lectura', async (req, res) => {
  const estudianteId = parseInt(req.params.estudianteId);
  const { texto_id, puntaje, respuestas, retroalimentacion, errores } = req.body;

  if (isNaN(estudianteId)) return res.status(400).json({ mensaje: 'ID inválido' });
  if (!texto_id || puntaje === undefined) {
    return res.status(400).json({ mensaje: 'Los campos texto_id y puntaje son requeridos' });
  }

  if (puntaje < 0 || puntaje > 100) {
    return res.status(400).json({ mensaje: 'El puntaje debe estar entre 0 y 100' });
  }

  try {
    const texto = await prisma.textos.findUnique({ where: { id: parseInt(texto_id) } });
    if (!texto) return res.status(404).json({ mensaje: 'Texto no encontrado' });

    const resultado = await prisma.resultados_lectura.create({
      data: {
        estudiante_id: estudianteId,
        texto_id: parseInt(texto_id),
        puntaje,
        respuestas: respuestas || null,
        retroalimentacion: retroalimentacion || null,
        errores: errores || null,
      },
    });

    res.status(201).json({ mensaje: 'Resultado de lectura guardado', resultado });
  } catch (error) {
    console.error('Error al guardar resultado de lectura:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/progreso/:estudianteId/escritura ───────────────────────────────
router.get('/:estudianteId/escritura', async (req, res) => {
  const estudianteId = parseInt(req.params.estudianteId);
  if (isNaN(estudianteId)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const resultados = await prisma.resultados_escritura.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        ejercicios_escritura: { select: { id: true, titulo: true, tipo: true, nivel: true } },
      },
      orderBy: { creado_en: 'desc' },
    });
    res.json(resultados);
  } catch (error) {
    console.error('Error al obtener resultados de escritura:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/progreso/:estudianteId/escritura ──────────────────────────────
router.post('/:estudianteId/escritura', async (req, res) => {
  const estudianteId = parseInt(req.params.estudianteId);
  const { ejercicio_id, puntaje, respuesta, errores_ortograficos, retroalimentacion } = req.body;

  if (isNaN(estudianteId)) return res.status(400).json({ mensaje: 'ID inválido' });
  if (!ejercicio_id || puntaje === undefined) {
    return res.status(400).json({ mensaje: 'Los campos ejercicio_id y puntaje son requeridos' });
  }

  if (puntaje < 0 || puntaje > 100) {
    return res.status(400).json({ mensaje: 'El puntaje debe estar entre 0 y 100' });
  }

  try {
    const ejercicio = await prisma.ejercicios_escritura.findUnique({
      where: { id: parseInt(ejercicio_id) },
    });
    if (!ejercicio) return res.status(404).json({ mensaje: 'Ejercicio no encontrado' });

    const resultado = await prisma.resultados_escritura.create({
      data: {
        estudiante_id: estudianteId,
        ejercicio_id: parseInt(ejercicio_id),
        puntaje,
        respuesta: respuesta || null,
        errores_ortograficos: errores_ortograficos || null,
        retroalimentacion: retroalimentacion || null,
      },
    });

    res.status(201).json({ mensaje: 'Resultado de escritura guardado', resultado });
  } catch (error) {
    console.error('Error al guardar resultado de escritura:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
