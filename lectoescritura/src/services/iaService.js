/**
 * iaService.js - Servicio de Inteligencia Artificial con Google Gemini
 *
 * Usa la API gratuita de Google Gemini (gemini-1.5-flash) para:
 * - Evaluar respuestas de comprensión lectora
 * - Corregir ejercicios de escritura
 * - Generar ejercicios personalizados
 *
 * Las llamadas se hacen desde el BACKEND por seguridad,
 * nunca directamente desde la app móvil (para no exponer la API key).
 *
 * Tier gratuito de Gemini:
 * - 15 requests por minuto
 * - 1 millón de tokens por día
 * - Sin tarjeta de crédito
 * Más info: https://aistudio.google.com
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../utils/constantes';

/**
 * Obtiene el header de autenticación JWT
 */
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

/**
 * Evalúa las respuestas de un ejercicio de lectura
 * El backend envía las respuestas a Gemini y retorna la evaluación
 *
 * @param {object} texto - Texto leído
 * @param {Array} preguntas - Lista de preguntas
 * @param {object} respuestas - Respuestas del estudiante
 * @returns {object} { puntaje, retroalimentacion, errores, recomendacion }
 */
export const evaluarLectura = async (texto, preguntas, respuestas) => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/ia/evaluar-lectura`,
      { texto, preguntas, respuestas },
      { headers, timeout: API_CONFIG.TIMEOUT }
    );
    return response.data;
  } catch (error) {
    // Sin conexión: evaluación básica offline (solo preguntas objetivas)
    if (!error.response) {
      return evaluarOffline(preguntas, respuestas);
    }
    throw new Error('Error al evaluar con IA.');
  }
};

/**
 * Evalúa un ejercicio de escritura
 * Gemini detecta errores ortográficos, gramaticales y de puntuación
 *
 * @param {object} ejercicio - Tipo y contexto del ejercicio
 * @param {string} respuesta - Texto escrito por el estudiante
 * @returns {object} { puntaje, erroresOrtograficos, erroresGramaticales, retroalimentacion }
 */
export const evaluarEscritura = async (ejercicio, respuesta) => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/ia/evaluar-escritura`,
      { ejercicio, respuesta },
      { headers, timeout: API_CONFIG.TIMEOUT }
    );
    return response.data;
  } catch (error) {
    if (!error.response) {
      return {
        puntaje: 70,
        erroresOrtograficos: [],
        erroresGramaticales: [],
        retroalimentacion: 'Evaluación offline. Se sincronizará cuando haya conexión.',
        palabrasCorrectas: respuesta.trim().split(/\s+/).length,
        totalPalabras: respuesta.trim().split(/\s+/).length,
      };
    }
    throw new Error('Error al evaluar escritura con IA.');
  }
};

/**
 * Genera un ejercicio personalizado según el tipo y el historial del estudiante
 * Gemini crea preguntas adaptadas al nivel y errores frecuentes del estudiante
 *
 * @param {string} tipo - 'sinonimos' | 'oraciones' | 'acentuacion' | 'comprension'
 * @param {string} estudianteId - ID del estudiante para personalización
 * @returns {object} Ejercicio generado por Gemini
 */
export const generarEjercicio = async (tipo, estudianteId) => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/ia/generar-ejercicio`,
      { tipo, estudianteId },
      { headers, timeout: API_CONFIG.TIMEOUT }
    );
    return response.data;
  } catch (error) {
    throw new Error('No se pudo generar el ejercicio. Verifica tu conexión.');
  }
};

/**
 * Evaluación básica offline para preguntas objetivas (opción múltiple y V/F)
 * Las respuestas abiertas no se pueden evaluar sin IA
 */
const evaluarOffline = (preguntas, respuestas) => {
  const evaluables = preguntas.filter(p => p.tipo !== 'respuesta_abierta');
  const correctas = evaluables.filter(p => respuestas[p.id] === p.respuestaCorrecta).length;
  const puntaje = evaluables.length > 0 ? Math.round((correctas / evaluables.length) * 100) : 0;

  return {
    puntaje,
    retroalimentacion: 'Evaluación parcial (modo offline). Las respuestas abiertas serán evaluadas por Gemini al conectarte.',
    errores: [],
    recomendacion: 'Conéctate para obtener retroalimentación completa.',
  };
};
