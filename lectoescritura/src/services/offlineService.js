/**
 * offlineService.js - Servicio de almacenamiento offline con expo-sqlite
 *
 * Guarda ejercicios, respuestas y resultados localmente cuando no hay conexión.
 * Al recuperar la conexión, sincroniza con PostgreSQL en el servidor.
 *
 * Tablas SQLite locales:
 * - ejercicios_pendientes: Respuestas no enviadas al servidor
 * - textos_descargados: Textos de lectura disponibles offline
 * - cache_progreso: Progreso del estudiante guardado localmente
 */

import * as SQLite from 'expo-sqlite';

// Instancia de la base de datos (se abre de forma lazy)
let db = null;

/**
 * Abre (o crea) la base de datos SQLite local usando expo-sqlite
 */
export const abrirBaseDatos = async () => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('lectoescritura_offline.db');
  await crearTablas();
  return db;
};

/**
 * Crea las tablas necesarias si no existen
 */
const crearTablas = async () => {
  const database = await abrirBaseDatos();

  // Tabla para ejercicios completados pendientes de sincronización
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ejercicios_pendientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      ejercicio_id INTEGER,
      respuestas TEXT NOT NULL,
      puntaje INTEGER,
      fecha TEXT NOT NULL,
      sincronizado INTEGER DEFAULT 0
    );
  `);

  // Tabla para textos de lectura descargados
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS textos_descargados (
      id INTEGER PRIMARY KEY,
      titulo TEXT NOT NULL,
      autor TEXT,
      contenido TEXT NOT NULL,
      nivel TEXT,
      fecha_descarga TEXT NOT NULL
    );
  `);

  // Tabla para caché del progreso del estudiante
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS cache_progreso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      puntaje INTEGER,
      ejercicios_completados INTEGER,
      datos_json TEXT
    );
  `);
};

/**
 * Guarda un ejercicio completado localmente para sincronizar después
 *
 * @param {string} tipo - 'lectura' | 'escritura' | 'ia'
 * @param {number} ejercicioId - ID del ejercicio
 * @param {object} respuestas - Respuestas del estudiante
 * @param {number} puntaje - Puntaje obtenido
 */
export const guardarEjercicioPendiente = async (tipo, ejercicioId, respuestas, puntaje) => {
  const database = await abrirBaseDatos();
  await database.runAsync(
    `INSERT INTO ejercicios_pendientes (tipo, ejercicio_id, respuestas, puntaje, fecha)
     VALUES (?, ?, ?, ?, ?)`,
    [tipo, ejercicioId, JSON.stringify(respuestas), puntaje, new Date().toISOString()]
  );
};

/**
 * Obtiene todos los ejercicios pendientes de sincronización
 * @returns {Array} Lista de ejercicios pendientes
 */
export const obtenerEjerciciosPendientes = async () => {
  const database = await abrirBaseDatos();
  return await database.getAllAsync(
    'SELECT * FROM ejercicios_pendientes WHERE sincronizado = 0'
  );
};

/**
 * Marca un ejercicio como sincronizado
 * @param {number} id - ID del registro local
 */
export const marcarSincronizado = async (id) => {
  const database = await abrirBaseDatos();
  await database.runAsync(
    'UPDATE ejercicios_pendientes SET sincronizado = 1 WHERE id = ?',
    [id]
  );
};

/**
 * Guarda un texto de lectura para uso offline
 * @param {object} texto - Datos del texto a guardar
 */
export const guardarTextoOffline = async (texto) => {
  const database = await abrirBaseDatos();
  await database.runAsync(
    `INSERT OR REPLACE INTO textos_descargados (id, titulo, autor, contenido, nivel, fecha_descarga)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [texto.id, texto.titulo, texto.autor, texto.contenido, texto.nivel, new Date().toISOString()]
  );
};

/**
 * Obtiene los textos disponibles offline
 * @returns {Array} Lista de textos descargados
 */
export const obtenerTextosOffline = async () => {
  const database = await abrirBaseDatos();
  return await database.getAllAsync('SELECT * FROM textos_descargados');
};
