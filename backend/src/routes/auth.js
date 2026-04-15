/**
 * auth.js - Rutas de autenticacion
 *
 * POST /api/auth/login    - Iniciar sesion
 * POST /api/auth/registro - Registrar nuevo usuario (estudiante o docente)
 *
 * Validaciones de seguridad:
 * - Correo con formato valido
 * - Password minimo 8 caracteres, al menos una mayuscula y un numero
 * - Correo unico en la BD
 * - Password hasheada con bcrypt (salt 12)
 * - Usuarios inactivos no pueden iniciar sesion
 * - Solo estudiantes y docentes pueden registrarse solos
 */

const express = require('express');
const bcrypt  = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const REGEX_CORREO   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_PASSWORD = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ mensaje: 'Correo y contrasena son requeridos' });
  }

  try {
    const usuario = await prisma.Usuario.findFirst({
      where: { correo: correo.toLowerCase().trim(), activo: true },
    });

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    res.json({
      usuario: {
        id:       usuario.id,
        nombre:   usuario.nombre,
        apellido: usuario.apellido,
        correo:   usuario.correo,
        rol:      usuario.rol,
        grado:    usuario.grado,
      },
      token: `token-${usuario.id}-${usuario.rol}`,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// POST /api/auth/registro
router.post('/registro', async (req, res) => {
  const { nombre, apellido, correo, password, confirmarPassword, rol, grado } = req.body;

  if (!nombre || !apellido || !correo || !password || !confirmarPassword) {
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
  }

  const regexNombre = /^[a-zA-Z\s]{2,50}$/;
  if (!regexNombre.test(nombre.trim())) {
    return res.status(400).json({ mensaje: 'El nombre solo puede contener letras y debe tener al menos 2 caracteres' });
  }
  if (!regexNombre.test(apellido.trim())) {
    return res.status(400).json({ mensaje: 'El apellido solo puede contener letras y debe tener al menos 2 caracteres' });
  }

  if (!REGEX_CORREO.test(correo.trim())) {
    return res.status(400).json({ mensaje: 'El correo no tiene un formato valido' });
  }

  if (!REGEX_PASSWORD.test(password)) {
    return res.status(400).json({
      mensaje: 'La contrasena debe tener al menos 8 caracteres, una mayuscula y un numero',
    });
  }

  if (password !== confirmarPassword) {
    return res.status(400).json({ mensaje: 'Las contrasenas no coinciden' });
  }

  if (rol === 'administrador') {
    return res.status(403).json({
      mensaje: 'Los administradores solo pueden ser creados por otro administrador',
    });
  }

  const rolesPermitidos = ['estudiante', 'docente'];
  if (rol && !rolesPermitidos.includes(rol)) {
    return res.status(400).json({ mensaje: 'El rol debe ser: estudiante o docente' });
  }

  if (rol === 'estudiante' && !grado) {
    return res.status(400).json({ mensaje: 'El grado es requerido para estudiantes' });
  }

  try {
    const correoExistente = await prisma.Usuario.findUnique({
      where: { correo: correo.toLowerCase().trim() },
    });
    if (correoExistente) {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const nuevoUsuario = await prisma.Usuario.create({
      data: {
        nombre:   nombre.trim(),
        apellido: apellido.trim(),
        correo:   correo.toLowerCase().trim(),
        password: passwordHash,
        rol:      rol || 'estudiante',
        grado:    grado || null,
      },
      select: {
        id: true, nombre: true, apellido: true,
        correo: true, rol: true, grado: true,
      },
    });

    res.status(201).json({
      mensaje: 'Cuenta creada exitosamente. Ya puedes iniciar sesion.',
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
