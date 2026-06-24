/**
 * bibliotecaService.js - Servicio para gestionar la biblioteca offline
 * 
 * Sincroniza con el backend y mantiene copia local para modo offline
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../utils/constantes';
import * as FileSystem from 'expo-file-system/legacy';

const BIBLIOTECA_KEY = '@lectoescritura:biblioteca_offline';
const ARCHIVOS_DIR = FileSystem.documentDirectory + 'biblioteca_offline/';

// ─── MAPEO DE NIVELES ───────────────────────────────────────────────────────
const MAPEO_NIVELES = {
  'Básico': 'basico',
  'Intermedio': 'intermedio',
  'Avanzado': 'avanzado',
};

const convertirNivel = (nivel) => {
  return MAPEO_NIVELES[nivel] || nivel;
};

// ─── MAPEO INVERSO DE NIVELES ─────────────────────────────────────────────────
const MAPEO_NIVELES_INVERSO = {
  'basico': 'Básico',
  'intermedio': 'Intermedio',
  'avanzado': 'Avanzado',
};

const convertirNivelDesdeBackend = (nivel) => {
  return MAPEO_NIVELES_INVERSO[nivel] || nivel;
};

// Crear directorio si no existe
const crearDirectorio = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(ARCHIVOS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(ARCHIVOS_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Error creando directorio de biblioteca:', error);
  }
};

crearDirectorio();

/**
 * Obtener todos los materiales de la biblioteca (desde API o local)
 */
export const obtenerBiblioteca = async () => {
  try {
    const { data } = await axios.get(`${API_CONFIG.BASE_URL}/biblioteca`, {
      timeout: API_CONFIG.TIMEOUT,
    });
    
    // Convertir niveles desde el formato del backend
    const datosConvertidos = data.map(item => ({
      ...item,
      nivel: convertirNivelDesdeBackend(item.nivel),
    }));
    
    // Guardar copia local para offline
    await AsyncStorage.setItem(BIBLIOTECA_KEY, JSON.stringify(datosConvertidos));
    
    // Guardar archivos localmente
    for (const material of data) {
      try {
        const archivoPath = `${ARCHIVOS_DIR}${material.id}.txt`;
        await FileSystem.writeAsStringAsync(archivoPath, material.contenido);
      } catch (error) {
        console.warn(`No se pudo guardar archivo para material ${material.id}:`, error);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error obteniendo biblioteca de API, usando local:', error);
    // Fallback a almacenamiento local
    const bibliotecaJson = await AsyncStorage.getItem(BIBLIOTECA_KEY);
    return bibliotecaJson ? JSON.parse(bibliotecaJson) : [];
  }
};

/**
 * Obtener materiales filtrados
 */
export const obtenerCuentosFiltrados = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.grado) params.append('grado', filtros.grado);
    if (filtros.nivel) params.append('nivel', filtros.nivel);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.activo !== undefined) params.append('activo', filtros.activo);
    
    const { data } = await axios.get(`${API_CONFIG.BASE_URL}/biblioteca?${params}`, {
      timeout: API_CONFIG.TIMEOUT,
    });
    
    return data;
  } catch (error) {
    console.error('Error filtrando materiales de API, usando local:', error);
    // Filtro local
    const biblioteca = await AsyncStorage.getItem(BIBLIOTECA_KEY);
    const materiales = bibliotecaJson ? JSON.parse(bibliotecaJson) : [];
    
    return materiales.filter(material => {
      if (filtros.grado && material.grado !== filtros.grado) return false;
      if (filtros.nivel && material.nivel !== filtros.nivel) return false;
      if (filtros.categoria && material.categoria !== filtros.categoria) return false;
      if (filtros.busqueda) {
        const busquedaLower = filtros.busqueda.toLowerCase();
        const enTitulo = material.titulo.toLowerCase().includes(busquedaLower);
        const enContenido = material.contenido.toLowerCase().includes(busquedaLower);
        const enAutor = material.autor.toLowerCase().includes(busquedaLower);
        if (!enTitulo && !enContenido && !enAutor) return false;
      }
      return true;
    });
  }
};

/**
 * Agregar un nuevo material a la biblioteca
 */
export const agregarCuentoOffline = async (cuento, usuarioId) => {
  try {
    const { data } = await axios.post(`${API_CONFIG.BASE_URL}/biblioteca`, {
      ...cuento,
      nivel: convertirNivel(cuento.nivel),
      agregado_por: usuarioId,
    }, {
      timeout: API_CONFIG.TIMEOUT,
    });
    
    // Actualizar copia local
    const bibliotecaActual = await obtenerBiblioteca();
    const nuevaBiblioteca = [...bibliotecaActual, data.material];
    await AsyncStorage.setItem(BIBLIOTECA_KEY, JSON.stringify(nuevaBiblioteca));
    
    // Guardar archivo local
    const archivoPath = `${ARCHIVOS_DIR}${data.material.id}.txt`;
    await FileSystem.writeAsStringAsync(archivoPath, cuento.contenido);
    
    return {
      success: true,
      message: 'Material agregado exitosamente',
      cuento: data.material,
      total: nuevaBiblioteca.length,
    };
  } catch (error) {
    console.error('Error agregando material:', error);
    
    // Fallback: guardar localmente si no hay conexión
    const bibliotecaActual = await obtenerBiblioteca();
    const nuevoCuento = {
      id: `local_${Date.now()}`,
      ...cuento,
      fecha_agregado: new Date().toISOString(),
      sincronizado: false,
    };
    
    const nuevaBiblioteca = [...bibliotecaActual, nuevoCuento];
    await AsyncStorage.setItem(BIBLIOTECA_KEY, JSON.stringify(nuevaBiblioteca));
    
    return {
      success: true,
      message: 'Material guardado localmente (sin conexión)',
      cuento: nuevoCuento,
      total: nuevaBiblioteca.length,
      offline: true,
    };
  }
};

/**
 * Eliminar un material de la biblioteca
 */
export const eliminarCuentoOffline = async (cuentoId) => {
  try {
    // Si es un ID local, solo eliminar localmente
    if (typeof cuentoId === 'string' && cuentoId.startsWith('local_')) {
      const biblioteca = await obtenerBiblioteca();
      const nuevaBiblioteca = biblioteca.filter(c => c.id !== cuentoId);
      await AsyncStorage.setItem(BIBLIOTECA_KEY, JSON.stringify(nuevaBiblioteca));
      
      return {
        success: true,
        message: 'Material eliminado localmente',
        totalRestante: nuevaBiblioteca.length,
      };
    }
    
    // Eliminar del backend
    await axios.delete(`${API_CONFIG.BASE_URL}/biblioteca/${cuentoId}`, {
      timeout: API_CONFIG.TIMEOUT,
    });
    
    // Actualizar copia local
    const biblioteca = await obtenerBiblioteca();
    const nuevaBiblioteca = biblioteca.filter(c => c.id !== cuentoId);
    await AsyncStorage.setItem(BIBLIOTECA_KEY, JSON.stringify(nuevaBiblioteca));
    
    // Eliminar archivo local
    try {
      const archivoPath = `${ARCHIVOS_DIR}${cuentoId}.txt`;
      await FileSystem.deleteAsync(archivoPath);
    } catch (error) {
      // Ignorar error si el archivo no existe
    }
    
    return {
      success: true,
      message: 'Material eliminado exitosamente',
      totalRestante: nuevaBiblioteca.length,
    };
  } catch (error) {
    console.error('Error eliminando material:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
};

/**
 * Obtener estadísticas de la biblioteca
 */
export const obtenerEstadisticasBiblioteca = async () => {
  try {
    const { data } = await axios.get(`${API_CONFIG.BASE_URL}/biblioteca/stats/estadisticas`, {
      timeout: API_CONFIG.TIMEOUT,
    });
    
    return data;
  } catch (error) {
    console.error('Error obteniendo estadísticas de API, calculando local:', error);
    
    const biblioteca = await obtenerBiblioteca();
    
    if (biblioteca.length === 0) {
      return {
        totalCuentos: 0,
        totalCaracteres: 0,
        totalPalabras: 0,
        porGrado: {},
        porCategoria: {},
        porNivel: {},
      };
    }
    
    const estadisticas = {
      total: biblioteca.length,
      totalCaracteres: biblioteca.reduce((sum, c) => sum + (c.contenido?.length || 0), 0),
      totalPalabras: biblioteca.reduce((sum, c) => sum + (c.contenido?.split(/\s+/).length || 0), 0),
      porGrado: {},
      porCategoria: {},
      porNivel: {},
    };
    
    biblioteca.forEach(cuento => {
      estadisticas.porGrado[cuento.grado] = (estadisticas.porGrado[cuento.grado] || 0) + 1;
      estadisticas.porCategoria[cuento.categoria] = (estadisticas.porCategoria[cuento.categoria] || 0) + 1;
      estadisticas.porNivel[cuento.nivel] = (estadisticas.porNivel[cuento.nivel] || 0) + 1;
    });
    
    return estadisticas;
  }
};

/**
 * Obtener un material por ID
 */
export const obtenerCuentoPorId = async (cuentoId) => {
  try {
    const { data } = await axios.get(`${API_CONFIG.BASE_URL}/biblioteca/${cuentoId}`, {
      timeout: API_CONFIG.TIMEOUT,
    });
    
    // Convertir nivel desde el formato del backend
    return {
      ...data,
      nivel: convertirNivelDesdeBackend(data.nivel),
    };
  } catch (error) {
    console.error('Error obteniendo material de API, usando local:', error);
    
    const biblioteca = await obtenerBiblioteca();
    return biblioteca.find(c => c.id === cuentoId) || null;
  }
};

/**
 * Actualizar un material existente
 */
export const actualizarCuento = async (cuentoId, nuevosDatos) => {
  try {
    const datosConvertidos = {
      ...nuevosDatos,
      nivel: convertirNivel(nuevosDatos.nivel),
    };
    
    const { data } = await axios.put(`${API_CONFIG.BASE_URL}/biblioteca/${cuentoId}`, datosConvertidos, {
      timeout: API_CONFIG.TIMEOUT,
    });
    
    // Actualizar copia local
    const biblioteca = await obtenerBiblioteca();
    const indice = biblioteca.findIndex(c => c.id === cuentoId);
    
    if (indice !== -1) {
      biblioteca[indice] = data.material;
      await AsyncStorage.setItem(BIBLIOTECA_KEY, JSON.stringify(biblioteca));
    }
    
    return {
      success: true,
      message: 'Material actualizado exitosamente',
      cuento: data.material,
    };
  } catch (error) {
    console.error('Error actualizando material:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
};
