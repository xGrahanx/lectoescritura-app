/**
 * auth.js - Rutas de autenticacion
 *
 * POST /api/auth/login    - Iniciar sesion
 * POST /api/auth/registro - Registrar nuevo usuario (estudiante o docente)
 *
 * Validaciones de seguridad implementadas:
 * - Correo con formato valido
 * - Password minimo 8 caracteres, al menos una mayuscula y un numero
 * - Correo unico en la BD
 * - Password hasheada con bcrypt (salt 12)
 * - Usuarios inactivos no pueden iniciar sesion
 * - Solo estudiantes y docentes pueden registrarse solos
 *   (los administradores solo los crea otro admin desde el panel)
 */

const express  = require('express');
const bcrypt   = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Regex de validaciones
const REGEX_CORREO    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_PASSWORD  = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
// Password debe tener: minimo 8 caracteres, al menos 1 mayuscula y 1 numero

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;

  // Validar campos requeridos
  if (!correo || !password) {
    return res.status(400).json({ mensaje: 'Correo y contrasena son requeridos' });
  }

  try {
    // Buscar usuario activo por correo
    const usuario = await prisma.usuario.findFirst({
      where: { correo: correo.toLowerCase().trim(), activo: true },
    });

    // Usuario no existe o esta inactivo — mismo mensaje por seguridad
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    // Comparar password con el hash guardado
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    // Login exitoso — devolver datos del usuario sin la password
    res.json({
      usuario: {
        id:       usuario.id,
        nombre:   usuario.nombre,
        apellido: usuario.apellido,
        correo:   usuario.correo,
        rol:      usuario.rol,
        grado:    usuario.grado,
      },
      // Token placeholder — implementar JWT en fase 2
      token: `token-${usuario.id}-${usuario.rol}`,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── POST /api/auth/registro ──────────────────────────────────────────────────
router.post('/registro', async (req, res) => {
  const { nombre, apellido, correo, password, confirmarPassword, rol, grado } = req.body;

  // ── Validaciones de campos requeridos ────────────────────────────────────────
  if (!nombre || !apellido || !correo || !password || !confirmarPassword) {
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
  }

  // Nombre y apellido: solo letras y espacios, minimo 2 caracteres
  const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
  if (!regexNombre.test(nombre.trim())) {
    return res.status(400).json({ mensaje: 'El nombre solo puede contener letras y debe tener al menos 2 caracteres' });
  }
  if (!regexNombre.test(apellido.trim())) {
    return res.status(400).json({ mensaje: 'El apellido solo puede contener letras y debe tener al menos 2 caracteres' });
  }

  // Formato de correo valido
  if (!REGEX_CORREO.test(correo.trim())) {
    return res.status(400).json({ mensaje: 'El correo no tiene un formato valido' });
  }

  // Password segura: minimo 8 caracteres, al menos 1 mayuscula y 1 numero
  if (!REGEX_PASSWORD.test(password)) {
    return res.status(400).json({
      mensaje: 'La contrasena debe tener al menos 8 caracteres, una mayuscula y un numero',
    });
  }

  // Las passwords deben coincidir
  if (password !== confirmarPassword) {
    return res.status(400).json({ mensaje: 'Las contrasenas no coinciden' });
  }

  // Solo estudiantes y docentes pueden registrarse solos
  if (rol === 'administrador') {
    return res.status(403).json({
      mensaje: 'Los administradores solo pueden ser creados por otro administrador',
    });
  }

  // Rol valido
  const rolesPermitidos = ['estudiante', 'docente'];
  if (rol && !rolesPermitidos.includes(rol)) {
    return res.status(400).json({ mensaje: 'El rol debe ser: estudiante o docente' });
  }

  // Grado requerido para estudiantes
  if (rol === 'estudiante' && !grado) {
    return res.status(400).json({ mensaje: 'El grado es requerido para estudiantes' });
  }

  try {
    // Verificar que el correo no este ya registrado (activo o inactivo)
    const correoExistente = await prisma.usuario.findUnique({
      where: { correo: correo.toLowerCase().trim() },
    });
    if (correoExistente) {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo' });
    }

    // Hashear password con salt 12 (mas seguro que el default de 10)
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario en la BD
    const nuevoUsuario = await prisma.usuario.create({
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
