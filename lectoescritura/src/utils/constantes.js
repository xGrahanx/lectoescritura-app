/**
 * constantes.js - Constantes globales de la aplicación
 *
 * Centraliza valores que se usan en múltiples partes del código
 * para facilitar el mantenimiento y la configuración.
 */

// ─── ROLES DE USUARIO ────────────────────────────────────────────────────────
export const ROLES = {
  ESTUDIANTE: 'estudiante',
  DOCENTE: 'docente',
  ADMINISTRADOR: 'administrador',
};

// ─── TIPOS DE EJERCICIO ───────────────────────────────────────────────────────
export const TIPOS_EJERCICIO = {
  LECTURA: 'lectura',
  ESCRITURA: 'escritura',
  IA: 'ia',
};

// ─── NIVELES DE DIFICULTAD ────────────────────────────────────────────────────
export const NIVELES = {
  BASICO: 'Básico',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
};

// ─── UMBRALES DE RENDIMIENTO (configurables desde el panel admin) ─────────────
export const UMBRALES = {
  ALTO_RENDIMIENTO: 80,   // % mínimo para considerar alto rendimiento
  BAJO_RENDIMIENTO: 60,   // % máximo para considerar bajo rendimiento
  DIAS_INACTIVIDAD: 3,    // Días sin actividad para generar alerta
};

// ─── COLORES DE LA APP ────────────────────────────────────────────────────────
export const COLORES = {
  PRIMARIO: '#4A90D9',
  SECUNDARIO: '#1A237E',
  EXITO: '#4CAF50',
  ADVERTENCIA: '#FF9800',
  ERROR: '#F44336',
  FONDO: '#F5F9FF',
  TEXTO_PRINCIPAL: '#212121',
  TEXTO_SECUNDARIO: '#757575',
};

// ─── CONFIGURACIÓN DE LA API ──────────────────────────────────────────────────
// Cambia EXPO_PUBLIC_API_URL en el archivo .env con la IP de tu maquina
// Ejemplo: EXPO_PUBLIC_API_URL=http://192.168.1.X:3000/api
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.50.21:3000/api',
  TIMEOUT: 10000,
};
