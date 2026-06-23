/**
 * auth.js - Rutas de autenticacion
 *
 * POST /api/auth/login               - Iniciar sesion
 * POST /api/auth/registro            - Registrar nuevo usuario (solo estudiantes)
 * POST /api/auth/solicitar-recuperacion - Solicitar recuperacion de contrasena
 * POST /api/auth/validar-codigo      - Validar codigo de recuperacion
 * POST /api/auth/restablecer         - Restablecer contrasena con codigo valido
 *
 * Validaciones de seguridad:
 * - Correo con formato valido
 * - Password minimo 8 caracteres, al menos una mayuscula y un numero
 * - Correo unico en la BD
 * - Password hasheada con bcrypt (salt 12)
 * - Usuarios inactivos no pueden iniciar sesion
 * - Solo estudiantes pueden registrarse desde el registro publico
 * - Los docentes deben ser creados por un administrador
 */

const express = require('express');
const bcrypt  = require('bcryptjs');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { enviarCorreoRecuperacion, enviarCorreoBienvenida } = require('../utils/emailService');

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

// POST /api/auth/registro - SOLO ESTUDIANTES
router.post('/registro', async (req, res) => {
  const { nombre, apellido, correo, password, confirmarPassword, grado } = req.body;

  if (!nombre || !apellido || !correo || !password || !confirmarPassword || !grado) {
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

  // Seguridad: SOLO se permite registro de estudiantes desde registro publico
  // Los docentes deben ser creados por un administrador
  const rol = 'estudiante';

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
        rol:      rol,
        grado:    grado.toString(),
      },
      select: {
        id: true, nombre: true, apellido: true,
        correo: true, rol: true, grado: true,
      },
    });

    // Enviar correo de bienvenida
    const resultadoBienvenida = await enviarCorreoBienvenida(
      nuevoUsuario.correo,
      `${nuevoUsuario.nombre} ${nuevoUsuario.apellido}`,
      nuevoUsuario.rol
    );

    res.status(201).json({
      mensaje: 'Cuenta de estudiante creada exitosamente. Ya puedes iniciar sesion.',
      usuario: nuevoUsuario,
      correo_enviado: resultadoBienvenida.success,
      modo_correo: resultadoBienvenida.real ? 'real' : 'simulado',
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// POST /api/auth/solicitar-recuperacion - Solicitar codigo de recuperacion
router.post('/solicitar-recuperacion', async (req, res) => {
  const { correo } = req.body;

  if (!correo || !REGEX_CORREO.test(correo.trim())) {
    return res.status(400).json({ mensaje: 'Correo valido requerido' });
  }

  try {
    const usuario = await prisma.Usuario.findFirst({
      where: { correo: correo.toLowerCase().trim(), activo: true },
      select: { id: true, nombre: true, correo: true, rol: true },
    });

    // Por seguridad, no revelamos si el correo existe o no
    if (!usuario) {
      return res.json({
        mensaje: 'Si el correo existe en nuestro sistema, recibiras un codigo de recuperacion',
      });
    }

    // Generar codigo de 6 digitos
    const codigo = crypto.randomInt(100000, 999999).toString();

    // Calcular expiracion (15 minutos)
    const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

    // Crear o actualizar codigo de recuperacion
    await prisma.codigosRecuperacion.upsert({
      where: { usuario_id: usuario.id },
      update: {
        codigo: codigo,
        expira_en: fechaExpiracion,
        usado: false,
        creado_en: new Date(),
      },
      create: {
        usuario_id: usuario.id,
        codigo: codigo,
        expira_en: fechaExpiracion,
        usado: false,
      },
    });

    // Enviar correo REAL de recuperación
    const resultadoCorreo = await enviarCorreoRecuperacion(
      usuario.correo,
      codigo,
      usuario.nombre
    );

    const mensajeRespuesta = resultadoCorreo.real
      ? 'Se ha enviado un código de recuperación a tu correo'
      : 'Solicitud procesada (modo simulación). Verifica la consola del servidor para el código.';

    res.json({
      mensaje: mensajeRespuesta,
      modo_correo: resultadoCorreo.real ? 'real' : 'simulado',
      // En produccion, no enviar el codigo en la respuesta
      // codigo: codigo, // Solo para desarrollo/testing
    });
  } catch (error) {
    console.error('Error en solicitud de recuperacion:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// POST /api/auth/validar-codigo - Validar codigo de recuperacion
router.post('/validar-codigo', async (req, res) => {
  const { correo, codigo } = req.body;

  if (!correo || !codigo || !REGEX_CORREO.test(correo.trim())) {
    return res.status(400).json({ mensaje: 'Correo y codigo requeridos' });
  }

  try {
    // Buscar usuario
    const usuario = await prisma.Usuario.findFirst({
      where: { correo: correo.toLowerCase().trim(), activo: true },
      select: { id: true },
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Codigo invalido o expirado' });
    }

    // Buscar codigo de recuperacion
    const codigoRecuperacion = await prisma.codigosRecuperacion.findUnique({
      where: { usuario_id: usuario.id },
    });

    if (!codigoRecuperacion) {
      return res.status(404).json({ mensaje: 'No hay solicitud de recuperacion activa' });
    }

    // Verificar si ya fue usado
    if (codigoRecuperacion.usado) {
      return res.status(400).json({ mensaje: 'Este codigo ya fue utilizado' });
    }

    // Verificar expiracion
    if (new Date() > codigoRecuperacion.expira_en) {
      return res.status(400).json({ mensaje: 'El codigo ha expirado' });
    }

    // Verificar codigo
    if (codigoRecuperacion.codigo !== codigo.trim()) {
      return res.status(400).json({ mensaje: 'Codigo incorrecto' });
    }

    res.json({
      mensaje: 'Codigo validado correctamente',
      valido: true,
      usuario_id: usuario.id,
    });
  } catch (error) {
    console.error('Error en validacion de codigo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// POST /api/auth/restablecer - Restablecer contrasena con codigo valido
router.post('/restablecer', async (req, res) => {
  const { correo, codigo, nuevaPassword, confirmarPassword } = req.body;

  if (!correo || !codigo || !nuevaPassword || !confirmarPassword) {
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
  }

  if (!REGEX_CORREO.test(correo.trim())) {
    return res.status(400).json({ mensaje: 'Correo valido requerido' });
  }

  if (!REGEX_PASSWORD.test(nuevaPassword)) {
    return res.status(400).json({
      mensaje: 'La contrasena debe tener al menos 8 caracteres, una mayuscula y un numero',
    });
  }

  if (nuevaPassword !== confirmarPassword) {
    return res.status(400).json({ mensaje: 'Las contrasenas no coinciden' });
  }

  try {
    // Buscar usuario
    const usuario = await prisma.Usuario.findFirst({
      where: { correo: correo.toLowerCase().trim(), activo: true },
      select: { id: true },
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Buscar y validar codigo
    const codigoRecuperacion = await prisma.codigosRecuperacion.findUnique({
      where: { usuario_id: usuario.id },
    });

    if (!codigoRecuperacion) {
      return res.status(400).json({ mensaje: 'No hay solicitud de recuperacion activa' });
    }

    if (codigoRecuperacion.usado) {
      return res.status(400).json({ mensaje: 'Este codigo ya fue utilizado' });
    }

    if (new Date() > codigoRecuperacion.expira_en) {
      return res.status(400).json({ mensaje: 'El codigo ha expirado' });
    }

    if (codigoRecuperacion.codigo !== codigo.trim()) {
      return res.status(400).json({ mensaje: 'Codigo incorrecto' });
    }

    // Hashear nueva contrasena
    const nuevaPasswordHash = await bcrypt.hash(nuevaPassword, 12);

    // Actualizar contrasena del usuario
    await prisma.Usuario.update({
      where: { id: usuario.id },
      data: { password: nuevaPasswordHash },
    });

    // Marcar codigo como usado
    await prisma.codigosRecuperacion.update({
      where: { usuario_id: usuario.id },
      data: { usado: true, usado_en: new Date() },
    });

    // Registrar auditoria de cambio de contrasena
    await prisma.auditoria.create({
      data: {
        usuario: {
          connect: { id: usuario.id }
        },
        tabla: 'usuarios',
        operacion: 'UPDATE',
        datos_anteriores: { contrasena_cambiada: true },
        datos_nuevos: { contrasena_actualizada: new Date().toISOString() },
      },
    });

    res.json({
      mensaje: 'Contrasena restablecida exitosamente. Ya puedes iniciar sesion con tu nueva contrasena.',
      success: true,
    });
  } catch (error) {
    console.error('Error en restablecimiento de contrasena:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// POST /api/auth/cambiar-password - Cambiar contraseña desde perfil (requiere contraseña actual)
router.post('/cambiar-password', async (req, res) => {
  const { correo, passwordActual, nuevaPassword, confirmarPassword } = req.body;

  if (!correo || !passwordActual || !nuevaPassword || !confirmarPassword) {
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
  }

  if (!REGEX_CORREO.test(correo.trim())) {
    return res.status(400).json({ mensaje: 'Correo válido requerido' });
  }

  if (!REGEX_PASSWORD.test(nuevaPassword)) {
    return res.status(400).json({
      mensaje: 'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
    });
  }

  if (nuevaPassword !== confirmarPassword) {
    return res.status(400).json({ mensaje: 'Las contraseñas no coinciden' });
  }

  try {
    // Buscar usuario
    const usuario = await prisma.Usuario.findFirst({
      where: { correo: correo.toLowerCase().trim(), activo: true },
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const passwordActualValida = await bcrypt.compare(passwordActual, usuario.password);
    if (!passwordActualValida) {
      return res.status(401).json({ mensaje: 'Contraseña actual incorrecta' });
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const mismaPassword = await bcrypt.compare(nuevaPassword, usuario.password);
    if (mismaPassword) {
      return res.status(400).json({ mensaje: 'La nueva contraseña debe ser diferente a la actual' });
    }

    // Hashear nueva contraseña
    const nuevaPasswordHash = await bcrypt.hash(nuevaPassword, 12);

    // Actualizar contraseña del usuario
    await prisma.Usuario.update({
      where: { id: usuario.id },
      data: { password: nuevaPasswordHash },
    });

    // Registrar auditoría de cambio de contraseña
    await prisma.auditoria.create({
      data: {
        usuario: {
          connect: { id: usuario.id }
        },
        tabla: 'usuarios',
        operacion: 'UPDATE',
        datos_anteriores: { contraseña_cambiada: true },
        datos_nuevos: { contraseña_actualizada: new Date().toISOString() },
      },
    });

    res.json({
      mensaje: 'Contraseña cambiada exitosamente',
      success: true,
    });

  } catch (error) {
    console.error('Error en cambio de contraseña:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// GET /api/auth/verificar-email - Verificar configuración del servicio de email
router.get('/verificar-email', (req, res) => {
  const { verificarConfiguracionEmail } = require('../utils/emailService');
  const config = verificarConfiguracionEmail();
  
  res.json({
    mensaje: 'Estado del servicio de email',
    configuracion: config,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
