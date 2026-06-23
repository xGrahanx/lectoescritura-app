/**
 * bibliotecaOffline.js - Gestión de cuentos y materiales educativos offline
 * 
 * Permite al profesor:
 * 1. Agregar cuentos/textos para uso offline
 * 2. Ver la biblioteca offline disponible
 * 3. Eliminar materiales de la biblioteca
 * 4. Categorizar por grado/nivel
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const BIBLIOTECA_KEY = '@lectoescritura:biblioteca_offline';
const ARCHIVOS_DIR = FileSystem.documentDirectory + 'biblioteca_offline/';

// Crear directorio si no existe
const crearDirectorio = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(ARCHIVOS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(ARCHIVOS_DIR, { intermediates: true });
      console.log('✅ Directorio de biblioteca offline creado');
    }
  } catch (error) {
    console.error('Error creando directorio de biblioteca:', error);
  }
};

// Inicializar directorio
crearDirectorio();

/**
 * Agregar un cuento/material a la biblioteca offline
 * @param {Object} cuento - Datos del cuento
 * @param {string} cuento.titulo - Título del cuento
 * @param {string} cuento.contenido - Texto del cuento
 * @param {string} cuento.grado - Grado escolar (1ro, 2do, etc.)
 * @param {string} cuento.categoria - Categoría (cuento, poema, ejercicio, etc.)
 * @param {string} cuento.nivel - Nivel (básico, intermedio, avanzado)
 * @param {string} cuento.autor - Autor del material
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const agregarCuentoOffline = async (cuento) => {
  try {
    // Validar datos requeridos
    if (!cuento.titulo || !cuento.contenido) {
      throw new Error('Título y contenido son requeridos');
    }

    // Obtener biblioteca actual
    const bibliotecaActual = await obtenerBiblioteca();
    
    // Crear ID único
    const nuevoCuento = {
      id: `cuento_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      titulo: cuento.titulo.trim(),
      contenido: cuento.contenido.trim(),
      grado: cuento.grado || 'General',
      categoria: cuento.categoria || 'Cuento',
      nivel: cuento.nivel || 'Básico',
      autor: cuento.autor || 'Anónimo',
      fecha_agregado: new Date().toISOString(),
      tamanio: cuento.contenido.length,
      caracteres: cuento.contenido.length,
      palabras: cuento.contenido.split(/\s+/).length,
    };

    // Agregar a la biblioteca
    const nuevaBiblioteca = [...bibliotecaActual, nuevoCuento];
    await AsyncStorage.setItem(BIBLIOTECA_KEY, JSON.stringify(nuevaBiblioteca));

    // Guardar archivo de texto por si acaso
    const archivoPath = `${ARCHIVOS_DIR}${nuevoCuento.id}.txt`;
    await FileSystem.writeAsStringAsync(archivoPath, cuento.contenido);

    console.log(`✅ Cuento agregado a biblioteca offline: "${nuevoCuento.titulo}"`);
    
    return {
      success: true,
      message: 'Cuento agregado a la biblioteca offline',
      cuento: nuevoCuento,
      total: nuevaBiblioteca.length,
    };
  } catch (error) {
    console.error('Error agregando cuento offline:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
};

/**
 * Obtener todos los cuentos de la biblioteca offline
 * @returns {Promise<Array>} - Lista de cuentos
 */
export const obtenerBiblioteca = async () => {
  try {
    const bibliotecaJson = await AsyncStorage.getItem(BIBLIOTECA_KEY);
    return bibliotecaJson ? JSON.parse(bibliotecaJson) : [];
  } catch (error) {
    console.error('Error obteniendo biblioteca offline:', error);
    return [];
  }
};

/**
 * Obtener cuentos por categoría/grado/nivel
 * @param {Object} filtros - Filtros opcionales
 * @returns {Promise<Array>} - Cuentos filtrados
 */
export const obtenerCuentosFiltrados = async (filtros = {}) => {
  try {
    const biblioteca = await obtenerBiblioteca();
    
    return biblioteca.filter(cuento => {
      // Filtrar por grado
      if (filtros.grado && cuento.grado !== filtros.grado) {
        return false;
      }
      // Filtrar por categoría
      if (filtros.categoria && cuento.categoria !== filtros.categoria) {
        return false;
      }
      // Filtrar por nivel
      if (filtros.nivel && cuento.nivel !== filtros.nivel) {
        return false;
      }
      // Filtrar por búsqueda de texto
      if (filtros.busqueda) {
        const busquedaLower = filtros.busqueda.toLowerCase();
        const enTitulo = cuento.titulo.toLowerCase().includes(busquedaLower);
        const enContenido = cuento.contenido.toLowerCase().includes(busquedaLower);
        const enAutor = cuento.autor.toLowerCase().includes(busquedaLower);
        if (!enTitulo && !enContenido && !enAutor) {
          return false;
        }
      }
      return true;
    });
  } catch (error) {
    console.error('Error filtrando cuentos:', error);
    return [];
  }
};

/**
 * Eliminar un cuento de la biblioteca offline
 * @param {string} cuentoId - ID del cuento a eliminar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const eliminarCuentoOffline = async (cuentoId) => {
  try {
    const biblioteca = await obtenerBiblioteca();
    const cuentoAEliminar = biblioteca.find(c => c.id === cuentoId);
    
    if (!cuentoAEliminar) {
      throw new Error('Cuento no encontrado');
    }

    // Filtrar cuento eliminado
    const nuevaBiblioteca = biblioteca.filter(c => c.id !== cuentoId);
    await AsyncStorage.setItem(BIBLIOTECA_KEY, JSON.stringify(nuevaBiblioteca));

    // Eliminar archivo si existe
    try {
      const archivoPath = `${ARCHIVOS_DIR}${cuentoId}.txt`;
      await FileSystem.deleteAsync(archivoPath);
    } catch (error) {
      // Ignorar error si el archivo no existe
    }

    console.log(`🗑️ Cuento eliminado de biblioteca: "${cuentoAEliminar.titulo}"`);
    
    return {
      success: true,
      message: 'Cuento eliminado de la biblioteca offline',
      cuentoEliminado: cuentoAEliminar,
      totalRestante: nuevaBiblioteca.length,
    };
  } catch (error) {
    console.error('Error eliminando cuento offline:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
};

/**
 * Obtener estadísticas de la biblioteca offline
 * @returns {Promise<Object>} - Estadísticas
 */
export const obtenerEstadisticasBiblioteca = async () => {
  try {
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

    // Calcular estadísticas
    const estadisticas = {
      totalCuentos: biblioteca.length,
      totalCaracteres: biblioteca.reduce((sum, c) => sum + (c.caracteres || 0), 0),
      totalPalabras: biblioteca.reduce((sum, c) => sum + (c.palabras || 0), 0),
      espacioAprox: `${Math.round((estadisticas.totalCaracteres / 1024)).toLocaleString()} KB`,
      porGrado: {},
      porCategoria: {},
      porNivel: {},
    };

    // Agrupar por grado
    biblioteca.forEach(cuento => {
      // Por grado
      estadisticas.porGrado[cuento.grado] = (estadisticas.porGrado[cuento.grado] || 0) + 1;
      
      // Por categoría
      estadisticas.porCategoria[cuento.categoria] = (estadisticas.porCategoria[cuento.categoria] || 0) + 1;
      
      // Por nivel
      estadisticas.porNivel[cuento.nivel] = (estadisticas.porNivel[cuento.nivel] || 0) + 1;
    });

    // Calcular uso de almacenamiento
    try {
      const dirInfo = await FileSystem.getInfoAsync(ARCHIVOS_DIR);
      if (dirInfo.exists && dirInfo.size) {
        const mb = dirInfo.size / (1024 * 1024);
        estadisticas.espacioUsado = mb < 1 
          ? `${Math.round(dirInfo.size / 1024)} KB` 
          : `${mb.toFixed(2)} MB`;
      }
    } catch (error) {
      // Ignorar error de lectura de tamaño
    }

    return estadisticas;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      totalCuentos: 0,
      error: error.message,
    };
  }
};

/**
 * Exportar biblioteca a archivo JSON (para backup)
 * @returns {Promise<Object>} - Resultado de la exportación
 */
export const exportarBiblioteca = async () => {
  try {
    const biblioteca = await obtenerBiblioteca();
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `biblioteca_offline_${fecha}.json`;
    const contenido = JSON.stringify(biblioteca, null, 2);
    
    const archivoPath = `${ARCHIVOS_DIR}${nombreArchivo}`;
    await FileSystem.writeAsStringAsync(archivoPath, contenido);

    return {
      success: true,
      message: 'Biblioteca exportada exitosamente',
      archivo: nombreArchivo,
      ruta: archivoPath,
      total: biblioteca.length,
    };
  } catch (error) {
    console.error('Error exportando biblioteca:', error);
    return {
      success: false,
      message: `Error exportando: ${error.message}`,
    };
  }
};

/**
 * Importar biblioteca desde archivo JSON
 * @param {string} contenidoJson - Contenido JSON de la biblioteca
 * @returns {Promise<Object>} - Resultado de la importación
 */
export const importarBiblioteca = async (contenidoJson) => {
  try {
    const bibliotecaImportada = JSON.parse(contenidoJson);
    
    // Validar formato
    if (!Array.isArray(bibliotecaImportada)) {
      throw new Error('Formato de biblioteca inválido');
    }

    // Guardar nueva biblioteca
    await AsyncStorage.setItem(BIBLIOTECA_KEY, JSON.stringify(bibliotecaImportada));

    // También guardar cada cuento como archivo
    for (const cuento of bibliotecaImportada) {
      if (cuento.id && cuento.contenido) {
        try {
          const archivoPath = `${ARCHIVOS_DIR}${cuento.id}.txt`;
          await FileSystem.writeAsStringAsync(archivoPath, cuento.contenido);
        } catch (error) {
          console.warn(`No se pudo guardar archivo para cuento ${cuento.id}:`, error);
        }
      }
    }

    return {
      success: true,
      message: 'Biblioteca importada exitosamente',
      total: bibliotecaImportada.length,
    };
  } catch (error) {
    console.error('Error importando biblioteca:', error);
    return {
      success: false,
      message: `Error importando: ${error.message}`,
    };
  }
};

/**
 * Limpiar toda la biblioteca offline
 * @returns {Promise<Object>} - Resultado de la limpieza
 */
export const limpiarBiblioteca = async () => {
  try {
    const biblioteca = await obtenerBiblioteca();
    const total = biblioteca.length;
    
    // Limpiar AsyncStorage
    await AsyncStorage.removeItem(BIBLIOTECA_KEY);
    
    // Limpiar directorio de archivos
    try {
      await FileSystem.deleteAsync(ARCHIVOS_DIR);
      await FileSystem.makeDirectoryAsync(ARCHIVOS_DIR, { intermediates: true });
    } catch (error) {
      console.warn('Error limpiando directorio de archivos:', error);
    }

    console.log(`🧹 Biblioteca offline limpiada: ${total} cuentos eliminados`);
    
    return {
      success: true,
      message: `Biblioteca offline limpiada (${total} cuentos eliminados)`,
      totalEliminados: total,
    };
  } catch (error) {
    console.error('Error limpiando biblioteca:', error);
    return {
      success: false,
      message: `Error limpiando: ${error.message}`,
    };
  }
};

/**
 * Obtener cuento por ID
 * @param {string} cuentoId - ID del cuento
 * @returns {Promise<Object|null>} - Cuento encontrado o null
 */
export const obtenerCuentoPorId = async (cuentoId) => {
  try {
    const biblioteca = await obtenerBiblioteca();
    return biblioteca.find(c => c.id === cuentoId) || null;
  } catch (error) {
    console.error('Error obteniendo cuento por ID:', error);
    return null;
  }
};

/**
 * Actualizar un cuento existente
 * @param {string} cuentoId - ID del cuento
 * @param {Object} nuevosDatos - Nuevos datos del cuento
 * @returns {Promise<Object>} - Resultado de la actualización
 */
export const actualizarCuento = async (cuentoId, nuevosDatos) => {
  try {
    const biblioteca = await obtenerBiblioteca();
    const indice = biblioteca.findIndex(c => c.id === cuentoId);
    
    if (indice === -1) {
      throw new Error('Cuento no encontrado');
    }

    // Actualizar cuento
    const cuentoActualizado = {
      ...biblioteca[indice],
      ...nuevosDatos,
      fecha_modificado: new Date().toISOString(),
    };

    if (nuevosDatos.contenido) {
      cuentoActualizado.tamanio = nuevosDatos.contenido.length;
      cuentoActualizado.caracteres = nuevosDatos.contenido.length;
      cuentoActualizado.palabras = nuevosDatos.contenido.split(/\s+/).length;
    }

    biblioteca[indice] = cuentoActualizado;
    await AsyncStorage.setItem(BIBLIOTECA_KEY, JSON.stringify(biblioteca));

    // Actualizar archivo si el contenido cambió
    if (nuevosDatos.contenido) {
      const archivoPath = `${ARCHIVOS_DIR}${cuentoId}.txt`;
      await FileSystem.writeAsStringAsync(archivoPath, nuevosDatos.contenido);
    }

    return {
      success: true,
      message: 'Cuento actualizado exitosamente',
      cuento: cuentoActualizado,
    };
  } catch (error) {
    console.error('Error actualizando cuento:', error);
    return {
      success: false,
      message: `Error actualizando: ${error.message}`,
    };
  }
};