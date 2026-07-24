/**
 * mensajes.js - Rutas para mensajería entre docentes y estudiantes
 *
 * GET    /api/mensajes/conversaciones/:userId       - Lista de contactos con último mensaje
 * GET    /api/mensajes/:userId/:contactoId          - Historial de mensajes con un contacto
 * POST   /api/mensajes                              - Enviar un mensaje
 * PUT    /api/mensajes/leer/:userId/:contactoId     - Marcar como leídos los mensajes de un contacto
 * GET    /api/mensajes/no-leidos/:userId            - Conteo total de mensajes no leídos
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const conAuditoria = require('../utils/registrarAuditoria');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/mensajes/conversaciones/:userId ─────────────────────────────
// Obtiene la lista de personas con las que el usuario ha chateado o puede chatear
router.get('/conversaciones/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    let contactos = [];

    // Si es docente, sus contactos son los estudiantes de sus grupos
    if (usuario.rol === 'docente') {
      const grupos = await prisma.grupo.findMany({
        where: { docente_id: userId, activo: true },
        include: {
          grupos_estudiantes: {
            where: { activo: true },
            include: {
              usuarios: { select: { id: true, nombre: true, apellido: true, rol: true } }
            }
          }
        }
      });
      const estudiantesMap = new Map();
      grupos.forEach(g => {
        g.grupos_estudiantes.forEach(ge => {
          if (!estudiantesMap.has(ge.usuarios.id)) {
            estudiantesMap.set(ge.usuarios.id, ge.usuarios);
          }
        });
      });
      contactos = Array.from(estudiantesMap.values());
    } 
    // Si es estudiante, sus contactos son los docentes de sus grupos
    else if (usuario.rol === 'estudiante') {
      const grupos_estudiantes = await prisma.grupoEstudiante.findMany({
        where: { estudiante_id: userId, activo: true },
        include: {
          grupos: {
            include: {
              usuarios: { select: { id: true, nombre: true, apellido: true, rol: true } }
            }
          }
        }
      });
      const docentesMap = new Map();
      grupos_estudiantes.forEach(ge => {
        if (ge.grupos && ge.grupos.usuarios && !docentesMap.has(ge.grupos.docente_id)) {
          docentesMap.set(ge.grupos.docente_id, ge.grupos.usuarios);
        }
      });
      contactos = Array.from(docentesMap.values());
    }

    // Para cada contacto, obtener el último mensaje y el conteo de no leídos
    const conversaciones = await Promise.all(contactos.map(async (contacto) => {
      // Último mensaje (enviado o recibido)
      const ultimoMensaje = await prisma.mensajes.findFirst({
        where: {
          OR: [
            { remitente_id: userId, destinatario_id: contacto.id },
            { remitente_id: contacto.id, destinatario_id: userId }
          ],
          activo: true
        },
        orderBy: { creado_en: 'desc' }
      });

      // Conteo de mensajes no leídos (solo los recibidos por este userId)
      const noLeidos = await prisma.mensajes.count({
        where: {
          remitente_id: contacto.id,
          destinatario_id: userId,
          leido: false,
          activo: true
        }
      });

      return {
        contacto,
        ultimoMensaje,
        noLeidos
      };
    }));

    // Ordenar por fecha del último mensaje descendente
    conversaciones.sort((a, b) => {
      const fechaA = a.ultimoMensaje ? new Date(a.ultimoMensaje.creado_en).getTime() : 0;
      const fechaB = b.ultimoMensaje ? new Date(b.ultimoMensaje.creado_en).getTime() : 0;
      return fechaB - fechaA;
    });

    res.json(conversaciones);
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/mensajes/:userId/:contactoId ──────────────────────────────────
// Historial de mensajes entre dos usuarios
router.get('/:userId/:contactoId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const contactoId = parseInt(req.params.contactoId);
  const { page = 1, limit = 50 } = req.query;

  if (isNaN(userId) || isNaN(contactoId)) return res.status(400).json({ mensaje: 'IDs inválidos' });

  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const mensajes = await prisma.mensajes.findMany({
      where: {
        OR: [
          { remitente_id: userId, destinatario_id: contactoId },
          { remitente_id: contactoId, destinatario_id: userId }
        ],
        activo: true
      },
      orderBy: { creado_en: 'desc' },
      skip,
      take: parseInt(limit),
    });

    // Devolvemos ordenados cronológicamente (el más antiguo primero) para la UI
    res.json(mensajes.reverse());
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/mensajes ───────────────────────────────────────────────────────
// Enviar un mensaje
router.post('/', async (req, res) => {
  const { remitente_id, destinatario_id, contenido } = req.body;

  if (!remitente_id || !destinatario_id || !contenido) {
    return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
  }

  try {
    // Validar relación docente-estudiante
    const remitente = await prisma.usuario.findUnique({ where: { id: parseInt(remitente_id) } });
    const destinatario = await prisma.usuario.findUnique({ where: { id: parseInt(destinatario_id) } });

    if (!remitente || !destinatario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    let esValido = false;

    if (remitente.rol === 'docente' && destinatario.rol === 'estudiante') {
      const grupos = await prisma.grupo.findMany({
        where: { docente_id: remitente.id, activo: true },
        select: { id: true }
      });
      const grupoIds = grupos.map(g => g.id);
      const vinculacion = await prisma.grupoEstudiante.findFirst({
        where: { estudiante_id: destinatario.id, grupo_id: { in: grupoIds }, activo: true }
      });
      if (vinculacion) esValido = true;
    } else if (remitente.rol === 'estudiante' && destinatario.rol === 'docente') {
      const vinculaciones = await prisma.grupoEstudiante.findMany({
        where: { estudiante_id: remitente.id, activo: true },
        select: { grupo_id: true }
      });
      const grupoIds = vinculaciones.map(v => v.grupo_id);
      const grupoDocente = await prisma.grupo.findFirst({
        where: { id: { in: grupoIds }, docente_id: destinatario.id, activo: true }
      });
      if (grupoDocente) esValido = true;
    }

    if (!esValido) {
      return res.status(403).json({ mensaje: 'No tienes permiso para enviar mensajes a este usuario' });
    }

    const nuevoMensaje = await conAuditoria(prisma, req.headers['x-usuario-id'], async (tx) => {
      return await tx.mensajes.create({
        data: {
          remitente_id: parseInt(remitente_id),
          destinatario_id: parseInt(destinatario_id),
          contenido: contenido.trim()
        }
      });
    });

    res.status(201).json(nuevoMensaje);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── PUT /api/mensajes/leer/:userId/:contactoId ──────────────────────────────
// Marcar mensajes como leídos
router.put('/leer/:userId/:contactoId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const contactoId = parseInt(req.params.contactoId);

  if (isNaN(userId) || isNaN(contactoId)) return res.status(400).json({ mensaje: 'IDs inválidos' });

  try {
    await conAuditoria(prisma, req.headers['x-usuario-id'], async (tx) => {
      await tx.mensajes.updateMany({
        where: {
          remitente_id: contactoId,
          destinatario_id: userId,
          leido: false,
          activo: true
        },
        data: { leido: true }
      });
    });

    res.json({ mensaje: 'Mensajes marcados como leídos' });
  } catch (error) {
    console.error('Error al marcar como leídos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/mensajes/no-leidos/:userId ──────────────────────────────────────
// Conteo total de mensajes no leídos
router.get('/no-leidos/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const conteo = await prisma.mensajes.count({
      where: {
        destinatario_id: userId,
        leido: false,
        activo: true
      }
    });

    res.json({ noLeidos: conteo });
  } catch (error) {
    console.error('Error al contar no leídos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── DELETE /api/mensajes/:id ─────────────────────────────────────────────────
// Eliminar un mensaje propio (soft delete)
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const remitenteId = parseInt(req.query.remitente_id);

  if (isNaN(id) || isNaN(remitenteId)) return res.status(400).json({ mensaje: 'IDs inválidos' });

  try {
    // Solo el remitente puede eliminar su propio mensaje
    const mensaje = await prisma.mensajes.findUnique({ where: { id } });

    if (!mensaje) return res.status(404).json({ mensaje: 'Mensaje no encontrado' });
    if (mensaje.remitente_id !== remitenteId) {
      return res.status(403).json({ mensaje: 'No puedes eliminar mensajes de otro usuario' });
    }

    await conAuditoria(prisma, req.headers['x-usuario-id'], async (tx) => {
      await tx.mensajes.update({
        where: { id },
        data: { activo: false }
      });
    });

    res.json({ mensaje: 'Mensaje eliminado' });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
