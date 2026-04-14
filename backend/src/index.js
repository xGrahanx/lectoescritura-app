/**
 * index.js - Entry point del servidor Express
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');

const usuariosRouter = require('./routes/usuarios');
const authRouter     = require('./routes/auth');
const gruposRouter   = require('./routes/grupos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usuariosRouter);
app.use('/api/auth',     authRouter);
app.use('/api/grupos',   gruposRouter);

// Ruta de salud para verificar que el servidor esta corriendo
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'Servidor LectoEscritura funcionando' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
