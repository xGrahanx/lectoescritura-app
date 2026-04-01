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
export const API_CONFIG = {
  // Cambiar según el entorno de despliegue
  BASE_URL: __DEV__
    ? 'http://10.0.2.2:3000/api'    // Desarrollo (emulador Android)
    : 'https://tu-servidor.com/api', // Producción
  TIMEOUT: 10000, // 10 segundos
};
