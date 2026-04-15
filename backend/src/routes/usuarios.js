/**
 * usuarios.js - Rutas para gestion de usuarios
 *
 * GET    /api/usuarios         - Listar todos los usuarios
 * POST   /api/usuarios         - Crear nuevo usuario (con validacion)
 * DELETE /api/usuarios/:id     - Eliminar usuario por ID
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// â”€â”€â”€ GET /api/usuarios/estudiantes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Retorna solo los usuarios con rol estudiante y activos
router.get('/estudiantes', async (req, res) => {
  try {
    const estudiantes = await prisma.usuario.findMany({
      where: { rol: 'estudiante', activo: true },
      select: {
        id: true, nombre: true, apellido: true,
        correo: true, grado: true, creado_en: true,
      },
      orderBy: { nombre: 'asc' },
    });
    res.json(estudiantes);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// â”€â”€â”€ GET /api/usuarios/stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Retorna conteos por rol para el dashboard del admin
router.get('/stats', async (req, res) => {
  try {
    const [totalEstudiantes, totalDocentes, totalAdmins] = await Promise.all([
      prisma.usuario.count({ where: { rol: 'estudiante', activo: true } }),
      prisma.usuario.count({ where: { rol: 'docente',    activo: true } }),
      prisma.usuario.count({ where: { rol: 'administrador', activo: true } }),
    ]);

    res.json({
      totalEstudiantes,
      totalDocentes,
      totalAdmins,
      totalUsuarios: totalEstudiantes + totalDocentes + totalAdmins,
    });
  } catch (error) {
    console.error('Error al obtener stats:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// â”€â”€â”€ GET /api/usuarios â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Retorna todos los usuarios sin incluir la password
router.get('/', async (req, res) => {
  try {
    // Solo retorna usuarios activos â€” los inactivos (soft deleted) no existen para la app
    const usuarios = await prisma.usuario.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        rol: true,
        grado: true,
        activo: true,
        creado_en: true,
        // password excluida intencionalmente
      },
      orderBy: { creado_en: 'desc' },
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// â”€â”€â”€ POST /api/usuarios â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Crea un nuevo usuario con validacion de campos
router.post('/', async (req, res) => {
  const { nombre, apellido, correo, password, rol, grado } = req.body;

  // â”€â”€ Validaciones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // Campos requeridos
  if (!nombre || !apellido || !correo || !password) {
    return res.status(400).json({
      mensaje: 'Los campos nombre, apellido, correo y password son requeridos',
    });
  }

  // Formato de correo valido
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexCorreo.test(correo)) {
    return res.status(400).json({ mensaje: 'El correo no tiene un formato valido' });
  }

  // Password minimo 6 caracteres
  if (password.length < 6) {
    return res.status(400).json({ mensaje: 'La password debe tener al menos 6 caracteres' });
  }

  // Rol valido
  const rolesValidos = ['estudiante', 'docente', 'administrador'];
  if (rol && !rolesValidos.includes(rol)) {
    return res.status(400).json({ mensaje: 'El rol debe ser: estudiante, docente o administrador' });
  }

  // Grado requerido si es estudiante
  if (rol === 'estudiante' && !grado) {
    return res.status(400).json({ mensaje: 'El grado es requerido para estudiantes' });
  }

  try {
    // Verificar que el correo no este ya registrado
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo },
    });
    if (usuarioExistente) {
      return res.status(409).json({ mensaje: 'Ya existe un usuario con ese correo' });
    }

    // Hashear la password antes de guardar
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear el usuario en la BD
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        correo,
        password: passwordHash,
        rol: rol || 'estudiante',
        grado: grado || null,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        correo: true,
        rol: true,
        grado: true,
        activo: true,
        creado_en: true,
      },
    });

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// â”€â”€â”€ PUT /api/usuarios/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Actualiza los datos de un usuario existente
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, apellido, correo, rol, grado, activo } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ mensaje: 'El ID debe ser un numero valido' });
  }

  // Validar formato de correo si se esta actualizando
  if (correo) {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
      return res.status(400).json({ mensaje: 'El correo no tiene un formato valido' });
    }
  }

  // Validar rol si se esta actualizando
  const rolesValidos = ['estudiante', 'docente', 'administrador'];
  if (rol && !rolesValidos.includes(rol)) {
    return res.status(400).json({ mensaje: 'El rol debe ser: estudiante, docente o administrador' });
  }

  try {
    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({ where: { id } });
    if (!usuarioExistente) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Si se cambia el correo, verificar que no lo use otro usuario
    if (correo && correo !== usuarioExistente.correo) {
      const correoEnUso = await prisma.usuario.findUnique({ where: { correo } });
      if (correoEnUso) {
        return res.status(409).json({ mensaje: 'Ya existe otro usuario con ese correo' });
      }
    }

    // Actualizar solo los campos que vienen en el body
    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: {
        ...(nombre    && { nombre }),
        ...(apellido  && { apellido }),
        ...(correo    && { correo }),
        ...(rol       && { rol }),
        ...(grado !== undefined && { grado: grado || null }),
        ...(activo !== undefined && { activo }),
      },
      select: {
        id: true, nombre: true, apellido: true,
        correo: true, rol: true, grado: true, activo: true,
      },
    });

    res.json({ mensaje: 'Usuario actualizado correctamente', usuario: usuarioActualizado });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// â”€â”€â”€ DELETE /api/usuarios/:id â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Soft delete: marca el usuario como inactivo en vez de eliminarlo fisicamente.
// El registro permanece en la BD para auditoria e historial.
// Solo el DBA puede hacer un DELETE real directamente en PostgreSQL.
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ mensaje: 'El ID debe ser un numero valido' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Soft delete: desactivar en vez de eliminar fisicamente
    await prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });

    res.json({ mensaje: `Usuario ${usuario.nombre} ${usuario.apellido} eliminado correctamente` });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;

