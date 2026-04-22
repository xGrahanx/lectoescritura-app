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
  const { estudiante }  = route.params;
  const [tabActiva, setTabActiva]   = useState('resumen');
  const [tareas, setTareas]         = useState([]);
  const [cargandoTareas, setCargandoTareas] = useState(false);

  const colorRendimiento = estudiante.promedio >= 80 ? '#4CAF50'
    : estudiante.promedio >= 60 ? '#FF9800' : '#F44336';

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

  useEffect(() => {
    if (tabActiva === 'tareas') cargarTareas();
  }, [tabActiva, cargarTareas]);

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
              await axios.delete(
                `${API_CONFIG.BASE_URL}/tareas/${tarea.id}`,
                { timeout: API_CONFIG.TIMEOUT }
              );
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

  const TABS = ['resumen', 'tareas', 'errores'];

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
            <Text style={[styles.valorPromedio, { color: colorRendimiento }]}>{estudiante.promedio}%</Text>
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
          {TABS.map(tab => (
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

        {/* Tab: Resumen */}
        {tabActiva === 'resumen' && (
          <View style={styles.contenidoTab}>
            <Text style={styles.tituloSeccion}>Progreso por módulo</Text>
            {[
              { nombre: 'Lectura',  progreso: 72, color: '#4A90D9' },
              { nombre: 'Escritura', progreso: 58, color: '#E91E63' },
              { nombre: 'Ejercicios IA', progreso: 88, color: '#9C27B0' },
            ].map(modulo => (
              <View key={modulo.nombre} style={styles.filaModulo}>
                <Text style={styles.nombreModulo}>{modulo.nombre}</Text>
                <View style={styles.barraProgreso}>
                  <View style={[styles.relleno, { flex: modulo.progreso, backgroundColor: modulo.color }]} />
                  <View style={{ flex: 100 - modulo.progreso }} />
                </View>
                <Text style={[styles.porcentajeModulo, { color: modulo.color }]}>{modulo.progreso}%</Text>
              </View>
            ))}
            <Text style={styles.tituloSeccion}>Estadísticas</Text>
            <View style={styles.gridStats}>
              {[
                { valor: '18', etiqueta: 'Ejercicios completados' },
                { valor: '5',  etiqueta: 'Días consecutivos' },
                { valor: '2h 30m', etiqueta: 'Tiempo total' },
                { valor: String(tareas.filter(t => t.estado === 'completada').length), etiqueta: 'Tareas completadas' },
              ].map((stat, i) => (
                <View key={i} style={styles.statItem}>
                  <Text style={styles.valorStat}>{stat.valor}</Text>
                  <Text style={styles.etiquetaStat}>{stat.etiqueta}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tab: Tareas */}
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
              <>
                {tareas.map(tarea => (
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
                    {/* Solo se puede eliminar si está pendiente */}
                    {tarea.estado === 'pendiente' && (
                      <TouchableOpacity
                        style={styles.botonEliminar}
                        onPress={() => eliminarTarea(tarea)}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#F44336" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Tab: Errores */}
        {tabActiva === 'errores' && (
          <View style={styles.contenidoTab}>
            <Text style={styles.descripcionErrores}>
              Errores frecuentes detectados por la IA en los últimos 30 días:
            </Text>
            {ERRORES_FRECUENTES.map((item, index) => (
              <View key={index} style={styles.tarjetaError}>
                <View style={styles.frecuenciaContenedor}>
                  <Text style={styles.frecuenciaValor}>{item.frecuencia}x</Text>
                </View>
                <Text style={styles.textoError}>{item.error}</Text>
              </View>
            ))}
            <View style={styles.recomendacionIA}>
              <MaterialCommunityIcons name="robot" size={20} color="#9C27B0" />
              <Text style={styles.textoRecomendacion}>
                La IA recomienda reforzar ejercicios de acentuación y ortografía básica para este estudiante.
              </Text>
            </View>
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
  nombreModulo: { fontSize: 13, color: '#424242', width: 70 },
  barraProgreso: { flex: 1, height: 8, backgroundColor: '#F5F5F5', borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  relleno: { height: 8, borderRadius: 4 },
  porcentajeModulo: { fontSize: 13, fontWeight: 'bold', width: 36, textAlign: 'right' },
  gridStats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  statItem: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 2, marginBottom: 4 },
  valorStat: { fontSize: 20, fontWeight: 'bold', color: '#1A237E' },
  etiquetaStat: { fontSize: 11, color: '#757575', textAlign: 'center', marginTop: 4 },
  // Tareas
  tarjetaTarea: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 2, gap: 10,
  },
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
  // Errores
  descripcionErrores: { fontSize: 13, color: '#757575', marginBottom: 12, lineHeight: 20 },
  tarjetaError: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 2, gap: 12 },
  frecuenciaContenedor: { backgroundColor: '#FFEBEE', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minWidth: 44, alignItems: 'center' },
  frecuenciaValor: { fontSize: 13, fontWeight: 'bold', color: '#F44336' },
  textoError: { flex: 1, fontSize: 13, color: '#424242', lineHeight: 20 },
  recomendacionIA: { backgroundColor: '#F3E5F5', borderRadius: 12, padding: 14, flexDirection: 'row', marginTop: 8, gap: 10, alignItems: 'flex-start' },
  textoRecomendacion: { flex: 1, fontSize: 13, color: '#424242', lineHeight: 20 },
});

export default DetalleEstudianteScreen;
