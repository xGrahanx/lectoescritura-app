/**
 * AuditoriaScreen.jsx - Pantalla de auditoría y bitácora del sistema
 * 
 * Solo accesible para administradores
 * Muestra todos los cambios realizados en el sistema
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';

const OPERACIONES = {
  INSERT: { label: 'Creación', color: '#4CAF50', icono: 'plus-circle' },
  UPDATE: { label: 'Modificación', color: '#FF9800', icono: 'pencil-circle' },
  DELETE: { label: 'Eliminación', color: '#F44336', icono: 'delete-circle' },
};

const TABLAS_NOMBRES = {
  usuarios: 'Usuarios',
  tareas: 'Tareas',
  grupos: 'Grupos',
  grupos_estudiantes: 'Grupos - Estudiantes',
  alertas: 'Alertas',
  resultados_lectura: 'Resultados de Lectura',
  resultados_escritura: 'Resultados de Escritura',
  ejercicios_ia: 'Ejercicios IA',
  progreso_diario: 'Progreso Diario',
  textos: 'Textos',
  ejercicios_escritura: 'Ejercicios de Escritura',
  configuracion_sistema: 'Configuración',
};

// Extrae un resumen legible de los datos del registro según la tabla
const extraerResumen = (registro) => {
  const datos = registro.datos_nuevos || registro.datos_anteriores;
  if (!datos) return null;

  switch (registro.tabla) {
    case 'usuarios':
      return datos.nombre
        ? `${datos.nombre} ${datos.apellido || ''} (${datos.rol || ''}) - ${datos.correo || ''}`
        : null;
    case 'tareas':
      return datos.titulo
        ? `"${datos.titulo}" → Estado: ${datos.estado || '-'}`
        : null;
    case 'grupos':
      return datos.nombre ? `Grupo: "${datos.nombre}"` : null;
    case 'grupos_estudiantes':
      return `Estudiante ID: ${datos.estudiante_id} → Grupo ID: ${datos.grupo_id}`;
    case 'textos':
      return datos.titulo
        ? `"${datos.titulo}" - Nivel: ${datos.nivel || '-'}`
        : null;
    case 'ejercicios_escritura':
      return datos.titulo
        ? `"${datos.titulo}" - Tipo: ${datos.tipo || '-'}`
        : null;
    case 'ejercicios_ia':
      return `Tipo: ${datos.tipo || '-'} - Puntaje: ${datos.puntaje ?? '-'}`;
    case 'resultados_lectura':
      return `Puntaje: ${datos.puntaje ?? '-'} - Estudiante ID: ${datos.estudiante_id || '-'}`;
    case 'resultados_escritura':
      return `Puntaje: ${datos.puntaje ?? '-'} - Estudiante ID: ${datos.estudiante_id || '-'}`;
    case 'progreso_diario':
      return `Promedio: ${datos.puntaje_promedio ?? '-'}% - Ejercicios: ${datos.ejercicios_completados ?? '-'}`;
    case 'alertas':
      return datos.titulo ? `"${datos.titulo}" - Tipo: ${datos.tipo || '-'}` : null;
    case 'configuracion_sistema':
      return `Umbral alto: ${datos.umbral_alto_rendimiento ?? '-'}% / bajo: ${datos.umbral_bajo_rendimiento ?? '-'}%`;
    default:
      return null;
  }
};

// Extrae los campos que cambiaron en un UPDATE
const extraerCambios = (registro) => {
  if (registro.operacion !== 'UPDATE') return null;
  const antes = registro.datos_anteriores;
  const despues = registro.datos_nuevos;
  if (!antes || !despues) return null;

  const camposIgnorar = ['creado_en', 'actualizado_en', 'id'];
  const cambios = [];

  Object.keys(despues).forEach(key => {
    if (camposIgnorar.includes(key)) return;
    if (JSON.stringify(antes[key]) !== JSON.stringify(despues[key])) {
      cambios.push({ campo: key, antes: antes[key], despues: despues[key] });
    }
  });

  return cambios.length > 0 ? cambios : null;
};

const AuditoriaScreen = ({ navigation }) => {
  const [registros, setRegistros] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [filtroTabla, setFiltroTabla] = useState('');
  const [filtroOperacion, setFiltroOperacion] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const cargarDatos = useCallback(async () => {
    try {
      const params = {};
      if (filtroTabla) params.tabla = filtroTabla;
      if (filtroOperacion) params.operacion = filtroOperacion;
      params.limit = 50;

      const [registrosRes, statsRes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}/auditoria`, {
          params,
          timeout: API_CONFIG.TIMEOUT,
        }),
        axios.get(`${API_CONFIG.BASE_URL}/auditoria/stats/resumen`, {
          timeout: API_CONFIG.TIMEOUT,
        }),
      ]);

      setRegistros(registrosRes.data.registros || []);
      setEstadisticas(statsRes.data);
    } catch (error) {
      console.error('Error al cargar auditoría:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [filtroTabla, filtroOperacion]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const onRefrescar = () => {
    setRefrescando(true);
    cargarDatos();
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const registrosFiltrados = registros.filter(r => {
    if (!busqueda) return true;
    const termino = busqueda.toLowerCase();
    return (
      r.tabla.toLowerCase().includes(termino) ||
      r.operacion.toLowerCase().includes(termino) ||
      r.usuario?.nombre?.toLowerCase().includes(termino) ||
      r.usuario?.apellido?.toLowerCase().includes(termino)
    );
  });

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1A237E" />
        <Text style={styles.textoCargando}>Cargando auditoría...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="shield-check" size={26} color="#1A237E" />
          <Text style={styles.titulo}> Auditoría del Sistema</Text>
        </View>
        <Text style={styles.subtitulo}>Bitácora de cambios y operaciones</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefrescar} />}
      >
        {/* Estadísticas */}
        {estadisticas && (
          <View style={styles.tarjetaStats}>
            <Text style={styles.tituloSeccion}>Resumen</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValor}>{estadisticas.totalRegistros}</Text>
                <Text style={styles.statLabel}>Total registros</Text>
              </View>
              <View style={styles.separador} />
              <View style={styles.statItem}>
                <Text style={styles.statValor}>
                  {estadisticas.registrosPorOperacion?.find(o => o.operacion === 'INSERT')?.total || 0}
                </Text>
                <Text style={styles.statLabel}>Creaciones</Text>
              </View>
              <View style={styles.separador} />
              <View style={styles.statItem}>
                <Text style={styles.statValor}>
                  {estadisticas.registrosPorOperacion?.find(o => o.operacion === 'UPDATE')?.total || 0}
                </Text>
                <Text style={styles.statLabel}>Modificaciones</Text>
              </View>
            </View>
          </View>
        )}

        {/* Filtros */}
        <View style={styles.tarjetaFiltros}>
          <Text style={styles.tituloSeccion}>Filtros</Text>
          
          {/* Búsqueda */}
          <View style={styles.inputBusqueda}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9E9E9E" />
            <TextInput
              style={styles.textoBusqueda}
              placeholder="Buscar por tabla, operación o usuario..."
              value={busqueda}
              onChangeText={setBusqueda}
              placeholderTextColor="#BDBDBD"
            />
          </View>

          {/* Filtro por operación */}
          <Text style={styles.labelFiltro}>Operación:</Text>
          <View style={styles.filtrosRow}>
            <TouchableOpacity
              style={[styles.chipFiltro, !filtroOperacion && styles.chipActivo]}
              onPress={() => setFiltroOperacion('')}
            >
              <Text style={[styles.textoChip, !filtroOperacion && styles.textoChipActivo]}>
                Todas
              </Text>
            </TouchableOpacity>
            {Object.keys(OPERACIONES).map(op => (
              <TouchableOpacity
                key={op}
                style={[styles.chipFiltro, filtroOperacion === op && styles.chipActivo]}
                onPress={() => setFiltroOperacion(op)}
              >
                <Text style={[styles.textoChip, filtroOperacion === op && styles.textoChipActivo]}>
                  {OPERACIONES[op].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Filtro por tabla */}
          <Text style={styles.labelFiltro}>Tabla:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtrosRow}>
              <TouchableOpacity
                style={[styles.chipFiltro, !filtroTabla && styles.chipActivo]}
                onPress={() => setFiltroTabla('')}
              >
                <Text style={[styles.textoChip, !filtroTabla && styles.textoChipActivo]}>
                  Todas
                </Text>
              </TouchableOpacity>
              {Object.keys(TABLAS_NOMBRES).map(tabla => (
                <TouchableOpacity
                  key={tabla}
                  style={[styles.chipFiltro, filtroTabla === tabla && styles.chipActivo]}
                  onPress={() => setFiltroTabla(tabla)}
                >
                  <Text style={[styles.textoChip, filtroTabla === tabla && styles.textoChipActivo]}>
                    {TABLAS_NOMBRES[tabla]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Lista de registros */}
        <Text style={styles.tituloSeccion}>
          Registros ({registrosFiltrados.length})
        </Text>

        {registrosFiltrados.length === 0 ? (
          <View style={styles.sinDatos}>
            <MaterialCommunityIcons name="database-off" size={40} color="#BDBDBD" />
            <Text style={styles.textoSinDatos}>No hay registros que mostrar</Text>
          </View>
        ) : (
          registrosFiltrados.map(registro => {
            const operacion = OPERACIONES[registro.operacion] || {};
            const resumen = extraerResumen(registro);
            const cambios = extraerCambios(registro);
            return (
              <View key={registro.id} style={styles.tarjetaRegistro}>
                {/* Cabecera */}
                <View style={styles.headerRegistro}>
                  <View style={[styles.iconoOperacion, { backgroundColor: operacion.color + '20' }]}>
                    <MaterialCommunityIcons
                      name={operacion.icono || 'circle'}
                      size={20}
                      color={operacion.color || '#9E9E9E'}
                    />
                  </View>
                  <View style={styles.infoRegistro}>
                    <Text style={styles.tablaRegistro}>
                      {TABLAS_NOMBRES[registro.tabla] || registro.tabla}
                    </Text>
                    <Text style={styles.fechaRegistro}>
                      {formatearFecha(registro.creado_en)}
                    </Text>
                  </View>
                  <View style={[styles.badgeOperacion, { backgroundColor: operacion.color }]}>
                    <Text style={styles.textoOperacion}>{operacion.label}</Text>
                  </View>
                </View>

                {/* Quién hizo el cambio */}
                {registro.usuario && (
                  <View style={styles.usuarioRow}>
                    <MaterialCommunityIcons name="account" size={14} color="#757575" />
                    <Text style={styles.textoUsuario}>
                      {' '}{registro.usuario.nombre} {registro.usuario.apellido}
                      {' '}({registro.usuario.rol})
                    </Text>
                  </View>
                )}

                {/* Resumen del registro afectado */}
                {resumen && (
                  <View style={styles.resumenRow}>
                    <MaterialCommunityIcons name="information-outline" size={14} color="#1A237E" />
                    <Text style={styles.textoResumen}> {resumen}</Text>
                  </View>
                )}

                {/* Cambios específicos en UPDATE */}
                {cambios && cambios.length > 0 && (
                  <View style={styles.cambiosContenedor}>
                    <Text style={styles.tituloCambios}>Cambios:</Text>
                    {cambios.map((c, i) => (
                      <View key={i} style={styles.filaCambio}>
                        <Text style={styles.campoCambio}>{c.campo}:</Text>
                        <Text style={styles.antesValor} numberOfLines={1}>
                          {String(c.antes ?? '-')}
                        </Text>
                        <MaterialCommunityIcons name="arrow-right" size={12} color="#9E9E9E" />
                        <Text style={styles.despuesValor} numberOfLines={1}>
                          {String(c.despues ?? '-')}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F9FF' },
  textoCargando: { color: '#9E9E9E', marginTop: 12 },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50, elevation: 2 },
  tituloRow: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  subtitulo: { fontSize: 13, color: '#757575', marginTop: 2 },
  scroll: { flex: 1 },
  tarjetaStats: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  tituloSeccion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: { alignItems: 'center' },
  statValor: { fontSize: 22, fontWeight: 'bold', color: '#1A237E' },
  statLabel: { fontSize: 12, color: '#757575', marginTop: 4 },
  separador: { width: 1, backgroundColor: '#E0E0E0' },
  tarjetaFiltros: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  inputBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  textoBusqueda: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#212121',
  },
  labelFiltro: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  filtrosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chipFiltro: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipActivo: {
    backgroundColor: '#1A237E',
    borderColor: '#1A237E',
  },
  textoChip: {
    fontSize: 12,
    color: '#757575',
  },
  textoChipActivo: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tarjetaRegistro: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 14,
    elevation: 2,
  },
  headerRegistro: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconoOperacion: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoRegistro: { flex: 1 },
  tablaRegistro: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  fechaRegistro: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
  },
  badgeOperacion: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  textoOperacion: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  usuarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  textoUsuario: {
    fontSize: 12,
    color: '#757575',
  },
  detalleRegistro: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 4,
  },
  resumenRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    backgroundColor: '#E8EAF6',
    borderRadius: 8,
    padding: 8,
  },
  textoResumen: {
    fontSize: 12,
    color: '#1A237E',
    flex: 1,
    lineHeight: 18,
  },
  cambiosContenedor: {
    marginTop: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 8,
  },
  tituloCambios: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 4,
  },
  filaCambio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  campoCambio: {
    fontSize: 11,
    fontWeight: '600',
    color: '#424242',
  },
  antesValor: {
    fontSize: 11,
    color: '#F44336',
    maxWidth: 80,
  },
  despuesValor: {
    fontSize: 11,
    color: '#4CAF50',
    maxWidth: 80,
  },
  sinDatos: {
    alignItems: 'center',
    padding: 40,
  },
  textoSinDatos: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 12,
  },
});

export default AuditoriaScreen;
