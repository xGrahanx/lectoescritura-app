/**
 * DetalleEstudianteScreen.jsx - Detalle del rendimiento de un estudiante
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';

const ERRORES_FRECUENTES = [
  { error: 'Omisión de tildes en palabras esdrújulas', frecuencia: 8 },
  { error: 'Confusión entre "b" y "v"', frecuencia: 5 },
  { error: 'Falta de mayúscula al inicio de oración', frecuencia: 3 },
];

const ICONO_TIPO  = { lectura: 'book-open-variant', escritura: 'pencil', ia: 'robot', especial: 'star' };
const COLOR_TIPO  = { lectura: '#4A90D9', escritura: '#E91E63', ia: '#9C27B0', especial: '#FF9800' };
const COLOR_ESTADO = { pendiente: '#FF9800', completada: '#4CAF50', vencida: '#F44336' };

const DetalleEstudianteScreen = ({ route, navigation }) => {
  const { estudiante } = route.params;

  const [tabActiva, setTabActiva]               = useState('resumen');
  const [tareas, setTareas]                     = useState([]);
  const [cargandoTareas, setCargandoTareas]     = useState(false);
  const [resumen, setResumen]                   = useState(null);
  const [resultadosLectura, setResultadosLectura]     = useState([]);
  const [resultadosEscritura, setResultadosEscritura] = useState([]);
  const [resultadosIA, setResultadosIA]         = useState([]);
  const [cargandoResumen, setCargandoResumen]   = useState(true);

  const colorRendimiento = (estudiante.promedio || 0) >= 80 ? '#4CAF50'
    : (estudiante.promedio || 0) >= 60 ? '#FF9800' : '#F44336';

  // ── Cargar resumen y resultados reales ──────────────────────────────────────
  const cargarResumen = useCallback(async () => {
    setCargandoResumen(true);
    try {
      const [resumenRes, lecturaRes, escrituraRes, iaRes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}/progreso/${estudiante.id}/resumen`, { timeout: API_CONFIG.TIMEOUT }),
        axios.get(`${API_CONFIG.BASE_URL}/progreso/${estudiante.id}/lectura`,  { timeout: API_CONFIG.TIMEOUT }),
        axios.get(`${API_CONFIG.BASE_URL}/progreso/${estudiante.id}/escritura`, { timeout: API_CONFIG.TIMEOUT }),
        axios.get(`${API_CONFIG.BASE_URL}/progreso/${estudiante.id}/ia`, { timeout: API_CONFIG.TIMEOUT }),
      ]);
      setResumen(resumenRes.data);
      setResultadosLectura(lecturaRes.data);
      setResultadosEscritura(escrituraRes.data);
      setResultadosIA(iaRes.data);
    } catch {
      setResumen({ totalEjercicios: 0, promedioGeneral: 0, rachaDias: 0, diasActivo: 0 });
    } finally {
      setCargandoResumen(false);
    }
  }, [estudiante.id]);

  const cargarTareas = useCallback(async () => {
    setCargandoTareas(true);
    try {
      const { data } = await axios.get(
        `${API_CONFIG.BASE_URL}/tareas/estudiante/${estudiante.id}`,
        { timeout: API_CONFIG.TIMEOUT }
      );
      setTareas(data);
    } catch {
      setTareas([]);
    } finally {
      setCargandoTareas(false);
    }
  }, [estudiante.id]);

  useEffect(() => { cargarResumen(); }, [cargarResumen]);
  useEffect(() => { if (tabActiva === 'tareas') cargarTareas(); }, [tabActiva, cargarTareas]);

  const eliminarTarea = (tarea) => {
    Alert.alert(
      'Eliminar tarea',
      `¿Seguro que quieres eliminar "${tarea.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_CONFIG.BASE_URL}/tareas/${tarea.id}`, { timeout: API_CONFIG.TIMEOUT });
              setTareas(prev => prev.filter(t => t.id !== tarea.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la tarea.');
            }
          },
        },
      ]
    );
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatearRelativa = (fecha) => {
    if (!fecha) return '';
    const diff = Math.floor((Date.now() - new Date(fecha)) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return `Hace ${diff} días`;
  };

  // Promedios por módulo calculados desde resultados reales
  const promedioLectura = resultadosLectura.length
    ? Math.round(resultadosLectura.reduce((s, r) => s + (r.puntaje || 0), 0) / resultadosLectura.length)
    : 0;
  const promedioEscritura = resultadosEscritura.length
    ? Math.round(resultadosEscritura.reduce((s, r) => s + (r.puntaje || 0), 0) / resultadosEscritura.length)
    : 0;
  const promedioIA = resultadosIA.length
    ? Math.round(resultadosIA.reduce((s, r) => s + (r.puntaje || 0), 0) / resultadosIA.length)
    : 0;

  // Actividades recientes combinadas
  const actividadesRecientes = [
    ...resultadosLectura.slice(0, 3).map(r => ({
      id: `l-${r.id}`, tipo: 'lectura',
      titulo: r.textos?.titulo || 'Texto de lectura',
      puntaje: r.puntaje, fecha: r.creado_en,
    })),
    ...resultadosEscritura.slice(0, 3).map(r => ({
      id: `e-${r.id}`, tipo: 'escritura',
      titulo: r.ejercicios_escritura?.titulo || 'Ejercicio de escritura',
      puntaje: r.puntaje, fecha: r.creado_en,
    })),
    ...resultadosIA.slice(0, 3).map(r => ({
      id: `ia-${r.id}`, tipo: 'ia',
      titulo: `Ejercicio IA: ${r.tipo || 'general'}`,
      puntaje: r.puntaje, fecha: r.creado_en,
    })),
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);

  return (
    <View style={styles.contenedor}>
      <View style={styles.barraTop}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
        </TouchableOpacity>
        <Text style={styles.tituloBar}>Detalle del estudiante</Text>
        <View />
      </View>

      <ScrollView>
        {/* Perfil */}
        <View style={styles.perfilContenedor}>
          <View style={[styles.avatarGrande, { backgroundColor: colorRendimiento + '20' }]}>
            <Text style={[styles.inicialGrande, { color: colorRendimiento }]}>
              {estudiante.nombre.charAt(0)}
            </Text>
          </View>
          <Text style={styles.nombreEstudiante}>{estudiante.nombre} {estudiante.apellido || ''}</Text>
          <Text style={styles.gradoEstudiante}>{estudiante.grupo || estudiante.grado || ''}</Text>
          <View style={[styles.promedioDestacado, { backgroundColor: colorRendimiento + '15', borderColor: colorRendimiento }]}>
            <Text style={[styles.valorPromedio, { color: colorRendimiento }]}>
              {resumen?.promedioGeneral ?? estudiante.promedio ?? 0}%
            </Text>
            <Text style={styles.etiquetaPromedio}>Promedio general</Text>
          </View>
          <TouchableOpacity
            style={styles.botonAsignarTarea}
            onPress={() => navigation.navigate('AsignarTarea', { estudiante })}
          >
            <MaterialCommunityIcons name="plus-circle" size={18} color="#FFFFFF" />
            <Text style={styles.textoBotonAsignar}>  Asignar tarea</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['resumen', 'tareas', 'errores'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, tabActiva === tab && styles.tabActiva]}
              onPress={() => setTabActiva(tab)}
            >
              <Text style={[styles.textoTab, tabActiva === tab && styles.textoTabActivo]}>
                {tab === 'resumen' ? 'Resumen' : tab === 'tareas' ? 'Tareas' : 'Errores'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab: Resumen ─────────────────────────────────────────────────── */}
        {tabActiva === 'resumen' && (
          <View style={styles.contenidoTab}>
            {cargandoResumen ? (
              <ActivityIndicator color="#2E7D32" style={{ marginVertical: 20 }} />
            ) : (
              <>
                <Text style={styles.tituloSeccion}>Progreso por módulo</Text>
                {[
                  { nombre: 'Lectura',   progreso: promedioLectura,   color: '#4A90D9', icono: 'book-open-variant' },
                  { nombre: 'Escritura', progreso: promedioEscritura, color: '#E91E63', icono: 'pencil' },
                  { nombre: 'Ejercicios IA', progreso: promedioIA, color: '#9C27B0', icono: 'robot' },
                ].map(modulo => (
                  <View key={modulo.nombre} style={styles.filaModulo}>
                    <MaterialCommunityIcons name={modulo.icono} size={16} color={modulo.color} style={{ width: 22 }} />
                    <Text style={styles.nombreModulo}>{modulo.nombre}</Text>
                    <View style={styles.barraProgreso}>
                      <View style={[styles.relleno, {
                        flex: modulo.progreso > 0 ? modulo.progreso : 1,
                        backgroundColor: modulo.progreso > 0 ? modulo.color : '#E0E0E0',
                      }]} />
                      <View style={{ flex: 100 - (modulo.progreso > 0 ? modulo.progreso : 1) }} />
                    </View>
                    <Text style={[styles.porcentajeModulo, { color: modulo.progreso > 0 ? modulo.color : '#BDBDBD' }]}>
                      {modulo.progreso}%
                    </Text>
                  </View>
                ))}

                <Text style={styles.tituloSeccion}>Estadísticas</Text>
                <View style={styles.gridStats}>
                  {[
                    { valor: String(resumen?.totalEjercicios ?? 0), etiqueta: 'Ejercicios completados' },
                    { valor: String(resumen?.rachaDias ?? 0),        etiqueta: 'Días consecutivos' },
                    { valor: String(resumen?.diasActivo ?? 0),       etiqueta: 'Días activo' },
                    { valor: String(tareas.filter(t => t.estado === 'completada').length), etiqueta: 'Tareas completadas' },
                  ].map((stat, i) => (
                    <View key={i} style={styles.statItem}>
                      <Text style={styles.valorStat}>{stat.valor}</Text>
                      <Text style={styles.etiquetaStat}>{stat.etiqueta}</Text>
                    </View>
                  ))}
                </View>

                {actividadesRecientes.length > 0 && (
                  <>
                    <Text style={styles.tituloSeccion}>Actividades recientes</Text>
                    {actividadesRecientes.map(act => (
                      <View key={act.id} style={styles.tarjetaHistorial}>
                        <MaterialCommunityIcons
                          name={ICONO_TIPO[act.tipo] || 'clipboard'}
                          size={22}
                          color={COLOR_TIPO[act.tipo] || '#9E9E9E'}
                        />
                        <View style={styles.infoHistorial}>
                          <Text style={styles.tituloHistorial}>{act.titulo}</Text>
                          <Text style={styles.fechaHistorial}>{formatearRelativa(act.fecha)}</Text>
                        </View>
                        <View style={[styles.puntajeHistorial, { backgroundColor: act.puntaje >= 70 ? '#E8F5E9' : '#FFEBEE' }]}>
                          <Text style={[styles.textoPuntaje, { color: act.puntaje >= 70 ? '#2E7D32' : '#C62828' }]}>
                            {act.puntaje}%
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {actividadesRecientes.length === 0 && (
                  <View style={styles.sinActividad}>
                    <MaterialCommunityIcons name="clipboard-text-off" size={36} color="#BDBDBD" />
                    <Text style={styles.textoSinActividad}>Sin actividad registrada aún</Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* ── Tab: Tareas ──────────────────────────────────────────────────── */}
        {tabActiva === 'tareas' && (
          <View style={styles.contenidoTab}>
            {cargandoTareas ? (
              <ActivityIndicator color="#2E7D32" style={{ marginVertical: 20 }} />
            ) : tareas.length === 0 ? (
              <View style={styles.sinTareas}>
                <MaterialCommunityIcons name="clipboard-off" size={40} color="#BDBDBD" />
                <Text style={styles.textoSinTareas}>No hay tareas asignadas</Text>
                <TouchableOpacity
                  style={styles.botonAgregarTarea}
                  onPress={() => navigation.navigate('AsignarTarea', { estudiante })}
                >
                  <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
                  <Text style={styles.textoBotonAgregar}> Asignar primera tarea</Text>
                </TouchableOpacity>
              </View>
            ) : (
              tareas.map(tarea => (
                <View key={tarea.id} style={styles.tarjetaTarea}>
                  <View style={[styles.iconoTarea, { backgroundColor: (COLOR_TIPO[tarea.tipo] || '#9E9E9E') + '20' }]}>
                    <MaterialCommunityIcons
                      name={ICONO_TIPO[tarea.tipo] || 'clipboard'}
                      size={20}
                      color={COLOR_TIPO[tarea.tipo] || '#9E9E9E'}
                    />
                  </View>
                  <View style={styles.infoTarea}>
                    <Text style={styles.tituloTarea} numberOfLines={1}>{tarea.titulo}</Text>
                    <View style={styles.filaTareaInfo}>
                      <View style={[styles.estadoBadge, { backgroundColor: (COLOR_ESTADO[tarea.estado] || '#9E9E9E') + '20' }]}>
                        <Text style={[styles.textoEstado, { color: COLOR_ESTADO[tarea.estado] || '#9E9E9E' }]}>
                          {tarea.estado}
                        </Text>
                      </View>
                      <Text style={styles.fechaTarea}>{formatearFecha(tarea.fecha_limite)}</Text>
                    </View>
                  </View>
                  {tarea.estado === 'pendiente' && (
                    <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminarTarea(tarea)}>
                      <MaterialCommunityIcons name="trash-can-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* ── Tab: Errores ─────────────────────────────────────────────────── */}
        {tabActiva === 'errores' && (
          <View style={styles.contenidoTab}>
            {cargandoResumen ? (
              <ActivityIndicator color="#9C27B0" style={{ marginVertical: 20 }} />
            ) : (
              <>
                <Text style={styles.descripcionErrores}>
                  Errores detectados en los últimos ejercicios completados:
                </Text>

                {resultadosEscritura.some(r => r.errores_ortograficos?.length > 0) && (
                  <>
                    <Text style={styles.tituloSeccion}>Escritura</Text>
                    {resultadosEscritura.filter(r => r.errores_ortograficos?.length > 0).slice(0, 3).map((r, i) => (
                      <View key={i} style={styles.tarjetaError}>
                        <View style={styles.frecuenciaContenedor}>
                          <Text style={styles.frecuenciaValor}>{r.errores_ortograficos.length}x</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          {r.errores_ortograficos.map((e, j) => (
                            <Text key={j} style={styles.textoError}>• {e}</Text>
                          ))}
                          <Text style={styles.fechaError}>{formatearRelativa(r.creado_en)}</Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {resultadosLectura.some(r => r.errores?.length > 0) && (
                  <>
                    <Text style={styles.tituloSeccion}>Lectura</Text>
                    {resultadosLectura.filter(r => r.errores?.length > 0).slice(0, 3).map((r, i) => (
                      <View key={i} style={styles.tarjetaError}>
                        <View style={styles.frecuenciaContenedor}>
                          <Text style={styles.frecuenciaValor}>{r.errores.length}x</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          {r.errores.map((e, j) => (
                            <Text key={j} style={styles.textoError}>• {e}</Text>
                          ))}
                          <Text style={styles.fechaError}>{formatearRelativa(r.creado_en)}</Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}

                {!resultadosEscritura.some(r => r.errores_ortograficos?.length > 0) &&
                 !resultadosLectura.some(r => r.errores?.length > 0) && (
                  <View style={styles.sinActividad}>
                    <MaterialCommunityIcons name={actividadesRecientes.length === 0 ? 'clipboard-text-off' : 'check-circle'} size={36} color={actividadesRecientes.length === 0 ? '#BDBDBD' : '#4CAF50'} />
                    <Text style={styles.textoSinActividad}>
                      {actividadesRecientes.length === 0 ? 'Sin actividad registrada aún' : '¡Sin errores detectados!'}
                    </Text>
                  </View>
                )}

                {(resultadosEscritura.some(r => r.errores_ortograficos?.length > 0) ||
                  resultadosLectura.some(r => r.errores?.length > 0)) && (
                  <View style={styles.recomendacionIA}>
                    <MaterialCommunityIcons name="robot" size={20} color="#9C27B0" />
                    <Text style={styles.textoRecomendacion}>
                      Basado en los errores detectados, se recomienda reforzar los ejercicios donde el estudiante muestra más dificultades.
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  barraTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', padding: 16, paddingTop: 50, elevation: 2,
  },
  tituloBar: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  perfilContenedor: { backgroundColor: '#FFFFFF', alignItems: 'center', padding: 24, marginBottom: 8 },
  avatarGrande: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  inicialGrande: { fontSize: 32, fontWeight: 'bold' },
  nombreEstudiante: { fontSize: 20, fontWeight: 'bold', color: '#1A237E' },
  gradoEstudiante: { fontSize: 13, color: '#757575', marginTop: 2, marginBottom: 12 },
  promedioDestacado: { borderWidth: 2, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center', marginBottom: 16 },
  valorPromedio: { fontSize: 28, fontWeight: 'bold' },
  etiquetaPromedio: { fontSize: 12, color: '#757575' },
  botonAsignarTarea: { backgroundColor: '#2E7D32', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' },
  textoBotonAsignar: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  tabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActiva: { borderBottomColor: '#2E7D32' },
  textoTab: { fontSize: 14, color: '#9E9E9E' },
  textoTabActivo: { color: '#2E7D32', fontWeight: 'bold' },
  contenidoTab: { padding: 16 },
  tituloSeccion: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 12, marginTop: 4 },
  filaModulo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  nombreModulo: { fontSize: 13, color: '#424242', width: 68 },
  barraProgreso: { flex: 1, height: 8, backgroundColor: '#F5F5F5', borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  relleno: { height: 8, borderRadius: 4 },
  porcentajeModulo: { fontSize: 13, fontWeight: 'bold', width: 36, textAlign: 'right' },
  gridStats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  statItem: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 2, marginBottom: 4 },
  valorStat: { fontSize: 20, fontWeight: 'bold', color: '#1A237E' },
  etiquetaStat: { fontSize: 11, color: '#757575', textAlign: 'center', marginTop: 4 },
  tarjetaHistorial: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 1, gap: 12 },
  infoHistorial: { flex: 1 },
  tituloHistorial: { fontSize: 14, fontWeight: '500', color: '#212121' },
  fechaHistorial: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  puntajeHistorial: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  textoPuntaje: { fontSize: 13, fontWeight: 'bold' },
  sinActividad: { alignItems: 'center', padding: 24 },
  textoSinActividad: { color: '#9E9E9E', fontSize: 14, marginTop: 8 },
  tarjetaTarea: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 2, gap: 10 },
  iconoTarea: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoTarea: { flex: 1 },
  tituloTarea: { fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 4 },
  filaTareaInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  estadoBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  textoEstado: { fontSize: 11, fontWeight: '600' },
  fechaTarea: { fontSize: 11, color: '#9E9E9E' },
  botonEliminar: { padding: 6 },
  sinTareas: { alignItems: 'center', padding: 30 },
  textoSinTareas: { color: '#9E9E9E', fontSize: 14, marginTop: 10, marginBottom: 16 },
  botonAgregarTarea: { backgroundColor: '#2E7D32', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' },
  textoBotonAgregar: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  descripcionErrores: { fontSize: 13, color: '#757575', marginBottom: 12, lineHeight: 20 },
  tarjetaError: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 2, gap: 12 },
  frecuenciaContenedor: { backgroundColor: '#FFEBEE', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minWidth: 44, alignItems: 'center' },
  frecuenciaValor: { fontSize: 13, fontWeight: 'bold', color: '#F44336' },
  textoError: { flex: 1, fontSize: 13, color: '#424242', lineHeight: 20 },
  fechaError: { fontSize: 11, color: '#9E9E9E', marginTop: 4 },
  recomendacionIA: { backgroundColor: '#F3E5F5', borderRadius: 12, padding: 14, flexDirection: 'row', marginTop: 8, gap: 10, alignItems: 'flex-start' },
  textoRecomendacion: { flex: 1, fontSize: 13, color: '#424242', lineHeight: 20 },
});

export default DetalleEstudianteScreen;
