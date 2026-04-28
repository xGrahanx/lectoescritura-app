/**
 * alertas.js - Rutas para gestión de alertas
 *
 * GET  /api/alertas/docente/:docenteId        - Alertas de un docente
 * PUT  /api/alertas/:id/leer                  - Marcar alerta como leída
 * PUT  /api/alertas/docente/:docenteId/leer-todas - Marcar todas como leídas
 * POST /api/alertas/generar/:docenteId        - Generar alertas automáticas
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/alertas/docente/:docenteId ──────────────────────────────────────
router.get('/docente/:docenteId', async (req, res) => {
  const docenteId = parseInt(req.params.docenteId);
  if (isNaN(docenteId)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const alertas = await prisma.alertas.findMany({
      where: { docente_id: docenteId, activo: true },
      include: {
        usuarios_alertas_estudiante_idTousuarios: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
      orderBy: { creado_en: 'desc' },
      take: 50,
    });

    const resultado = alertas.map(a => ({
      id: a.id,
      tipo: a.tipo,
      titulo: a.titulo,
      mensaje: a.mensaje,
      leida: a.leida,
      creado_en: a.creado_en,
      estudiante: a.usuarios_alertas_estudiante_idTousuarios,
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── PUT /api/alertas/:id/leer ────────────────────────────────────────────────
router.put('/:id/leer', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    await prisma.alertas.update({ where: { id }, data: { leida: true } });
    res.json({ mensaje: 'Alerta marcada como leída' });
  } catch (error) {
    console.error('Error al marcar alerta:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── PUT /api/alertas/docente/:docenteId/leer-todas ───────────────────────────
router.put('/docente/:docenteId/leer-todas', async (req, res) => {
  const docenteId = parseInt(req.params.docenteId);
  if (isNaN(docenteId)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    await prisma.alertas.updateMany({
      where: { docente_id: docenteId, leida: false },
      data: { leida: true },
    });
    res.json({ mensaje: 'Todas las alertas marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar alertas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── DELETE /api/alertas/docente/:docenteId/limpiar ──────────────────────────
// ─── DELETE /api/alertas/docente/:docenteId/limpiar ──────────────────────────
// Borrado lógico: marca todas las alertas del docente como inactivas
router.delete('/docente/:docenteId/limpiar', async (req, res) => {
  const docenteId = parseInt(req.params.docenteId);
  if (isNaN(docenteId)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    // Soft delete: desactivar todas las alertas del docente
    const resultado = await prisma.alertas.updateMany({
      where: { docente_id: docenteId, activo: true },
      data: { activo: false },
    });
    res.json({ mensaje: `${resultado.count} alertas eliminadas correctamente` });
  } catch (error) {
    console.error('Error al limpiar alertas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/alertas/generar/:docenteId ─────────────────────────────────────
// Analiza los estudiantes del docente y genera alertas automáticas
router.post('/generar/:docenteId', async (req, res) => {
  const docenteId = parseInt(req.params.docenteId);
  if (isNaN(docenteId)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    // PRIMERO: Limpiar alertas viejas de inactividad (más de 7 días) - soft delete
    const hace7DiasLimpieza = new Date();
    hace7DiasLimpieza.setDate(hace7DiasLimpieza.getDate() - 7);
    
    await prisma.alertas.updateMany({
      where: {
        docente_id: docenteId,
        tipo: 'inactividad',
        creado_en: { lt: hace7DiasLimpieza },
        activo: true,
      },
      data: { activo: false },
    });

    // Obtener todos los estudiantes del docente
    const grupos = await prisma.grupo.findMany({
      where: { docente_id: docenteId, activo: true },
      include: {
        grupos_estudiantes: {
          include: { usuarios: true },
        },
      },
    });

    const estudiantes = grupos.flatMap(g =>
      g.grupos_estudiantes.map(ge => ge.usuarios)
    );

    if (estudiantes.length === 0) {
      return res.json({ mensaje: 'No hay estudiantes para analizar', generadas: 0 });
    }

    let alertasGeneradas = 0;
    const hoy = new Date();
    const hace3Dias = new Date(hoy);
    hace3Dias.setDate(hoy.getDate() - 3);
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hoy.getDate() - 7);

    for (const estudiante of estudiantes) {
      // ── 1. Alerta de INACTIVIDAD ──────────────────────────────────────────
      const ultimaActividad = await prisma.progreso_diario.findFirst({
        where: { estudiante_id: estudiante.id },
        orderBy: { fecha: 'desc' },
      });

      let diasSinActividad = 0;
      
      if (ultimaActividad) {
        const fechaActividad = new Date(ultimaActividad.fecha);
        const hoyInicio = new Date(hoy);
        hoyInicio.setHours(0, 0, 0, 0);
        fechaActividad.setHours(0, 0, 0, 0);
        
        diasSinActividad = Math.floor((hoyInicio - fechaActividad) / (1000 * 60 * 60 * 24));
      } else {
        // Si no tiene ningún registro, verificar si es un estudiante nuevo
        const estudianteCreado = new Date(estudiante.creado_en);
        const diasDesdeCreacion = Math.floor((hoy - estudianteCreado) / (1000 * 60 * 60 * 24));
        
        // Solo alertar si el estudiante tiene más de 3 días de creado
        if (diasDesdeCreacion < 3) {
          continue; // Saltar este estudiante, es muy nuevo
        }
        diasSinActividad = diasDesdeCreacion;
      }

      if (diasSinActividad >= 3) {
        // Verificar que no exista ya una alerta reciente de inactividad
        const alertaExistente = await prisma.alertas.findFirst({
          where: {
            docente_id: docenteId,
            estudiante_id: estudiante.id,
            tipo: 'inactividad',
            creado_en: { gte: hace3Dias },
          },
        });

        if (!alertaExistente) {
          await prisma.alertas.create({
            data: {
              docente_id: docenteId,
              estudiante_id: estudiante.id,
              tipo: 'inactividad',
              titulo: 'Inactividad prolongada',
              mensaje: `${estudiante.nombre} ${estudiante.apellido} lleva ${diasSinActividad} días sin completar ejercicios. Se recomienda hacer seguimiento.`,
              leida: false,
            },
          });
          alertasGeneradas++;
        }
      }

      // ── 2. Alerta de ERROR (bajo rendimiento) ─────────────────────────────
      const [resultadosEscritura, resultadosLectura] = await Promise.all([
        prisma.resultados_escritura.findMany({
          where: { estudiante_id: estudiante.id, creado_en: { gte: hace7Dias } },
          orderBy: { creado_en: 'desc' },
          take: 5,
        }),
        prisma.resultados_lectura.findMany({
          where: { estudiante_id: estudiante.id, creado_en: { gte: hace7Dias } },
          orderBy: { creado_en: 'desc' },
          take: 5,
        }),
      ]);

      const todosResultados = [...resultadosEscritura, ...resultadosLectura];

      if (todosResultados.length >= 2) {
        const promedio = Math.round(
          todosResultados.reduce((s, r) => s + (r.puntaje || 0), 0) / todosResultados.length
        );

        if (promedio < 60) {
          const alertaExistente = await prisma.alertas.findFirst({
            where: {
              docente_id: docenteId,
              estudiante_id: estudiante.id,
              tipo: 'error',
              creado_en: { gte: hace7Dias },
            },
          });

          if (!alertaExistente) {
            await prisma.alertas.create({
              data: {
                docente_id: docenteId,
                estudiante_id: estudiante.id,
                tipo: 'error',
                titulo: 'Bajo rendimiento general',
                mensaje: `${estudiante.nombre} ${estudiante.apellido} tiene un promedio general de ${promedio}% en los últimos ejercicios de lectura y escritura. Se recomienda reforzar con ejercicios básicos.`,
                leida: false,
              },
            });
            alertasGeneradas++;
          }
        }

        // ── 2b. Alerta de MEJORA ───────────────────────────────────────────
        if (promedio >= 60 && promedio < 80) {
          const alertaExistente = await prisma.alertas.findFirst({
            where: {
              docente_id: docenteId,
              estudiante_id: estudiante.id,
              tipo: 'mejora',
              creado_en: { gte: hace7Dias },
            },
          });

          if (!alertaExistente) {
            await prisma.alertas.create({
              data: {
                docente_id: docenteId,
                estudiante_id: estudiante.id,
                tipo: 'mejora',
                titulo: 'Progreso en buen camino',
                mensaje: `${estudiante.nombre} ${estudiante.apellido} tiene un promedio general de ${promedio}% esta semana. Sigue avanzando bien.`,
                leida: false,
              },
            });
            alertasGeneradas++;
          }
        }
      }

      // ── 3. Alerta de LOGRO (alto rendimiento) ─────────────────────────────
      const progresoDiario = await prisma.progreso_diario.findMany({
        where: {
          estudiante_id: estudiante.id,
          fecha: { gte: hace7Dias },
        },
        orderBy: { fecha: 'desc' },
      });

      if (progresoDiario.length >= 3) {
        const promedioSemana = Math.round(
          progresoDiario.reduce((s, p) => s + (p.puntaje_promedio || 0), 0) / progresoDiario.length
        );
        const racha = progresoDiario[0]?.racha_dias || 0;

        if (promedioSemana >= 80 || racha >= 5) {
          const alertaExistente = await prisma.alertas.findFirst({
            where: {
              docente_id: docenteId,
              estudiante_id: estudiante.id,
              tipo: 'alto_rendimiento',
              creado_en: { gte: hace7Dias },
            },
          });

          if (!alertaExistente) {
            await prisma.alertas.create({
              data: {
                docente_id: docenteId,
                estudiante_id: estudiante.id,
                tipo: 'alto_rendimiento',
                titulo: 'Alto rendimiento destacado',
                mensaje: `${estudiante.nombre} ${estudiante.apellido} tiene un promedio de ${promedioSemana}% esta semana${racha >= 5 ? ` y una racha de ${racha} días consecutivos` : ''}. Considera asignarle tareas adicionales.`,
                leida: false,
              },
            });
            alertasGeneradas++;
          }
        }
      }
    }

    res.json({
      mensaje: `Análisis completado. ${alertasGeneradas} alertas generadas.`,
      generadas: alertasGeneradas,
    });
  } catch (error) {
    console.error('Error al generar alertas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
