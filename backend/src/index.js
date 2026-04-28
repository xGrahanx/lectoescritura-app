/**
 * index.js - Entry point del servidor Express
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');

const usuariosRouter  = require('./routes/usuarios');
const authRouter      = require('./routes/auth');
const gruposRouter    = require('./routes/grupos');
const tareasRouter    = require('./routes/tareas');
const textosRouter    = require('./routes/textos');
const ejerciciosRouter = require('./routes/ejercicios');
const progresoRouter  = require('./routes/progreso');
const iaRouter        = require('./routes/ia');
const alertasRouter   = require('./routes/alertas');
const auditoriaRouter = require('./routes/auditoria');
const reportesRouter  = require('./routes/reportes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/usuarios',   usuariosRouter);
app.use('/api/auth',       authRouter);
app.use('/api/grupos',     gruposRouter);
app.use('/api/tareas',     tareasRouter);
app.use('/api/textos',     textosRouter);
app.use('/api/ejercicios', ejerciciosRouter);
app.use('/api/progreso',   progresoRouter);
app.use('/api/ia',         iaRouter);
app.use('/api/alertas',    alertasRouter);
app.use('/api/auditoria',  auditoriaRouter);
app.use('/api/reportes',   reportesRouter);

// Ruta de salud para verificar que el servidor esta corriendo
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'Servidor LectoEscritura funcionando' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Accesible desde red local en http://192.168.1.107:${PORT}`);
});
