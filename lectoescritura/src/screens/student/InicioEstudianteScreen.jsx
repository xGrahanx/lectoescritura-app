/**
 * InicioEstudianteScreen.jsx - Pantalla de inicio del estudiante
 *
 * Carga el resumen de progreso y tareas pendientes desde el backend.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { API_CONFIG } from '../../utils/constantes';

const ACCESO_RAPIDO = [
  { nombre: 'Lectura',     icono: 'book-open-variant', color: '#4A90D9', ruta: 'Lectura' },
  { nombre: 'Escritura',   icono: 'pencil',            color: '#E91E63', ruta: 'Escritura' },
  { nombre: 'Ejercicios IA', icono: 'robot',           color: '#9C27B0', ruta: 'EjerciciosIA' },
  { nombre: 'Mi Progreso', icono: 'chart-line',        color: '#4CAF50', ruta: 'Progreso' },
];

const InicioEstudianteScreen = ({ navigation }) => {
  const { usuario, cerrarSesion } = useAuth();
  const { estaConectado }         = useOffline();
  const [resumen, setResumen]     = useState(null);
  const [tareas, setTareas]       = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      const [resumenRes, tareasRes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}/progreso/${usuario.id}/resumen`, { timeout: API_CONFIG.TIMEOUT }),
        axios.get(`${API_CONFIG.BASE_URL}/tareas/estudiante/${usuario.id}`, { timeout: API_CONFIG.TIMEOUT }),
      ]);
      setResumen(resumenRes.data);
      // Solo mostrar las tareas pendientes en el inicio
      setTareas(tareasRes.data.filter(t => t.estado === 'pendiente').slice(0, 3));
    } catch (error) {
      console.error('Error al cargar datos de inicio:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [usuario.id]);

  useEffect(() => {
    cargarDatos();
    const unsubscribe = navigation.addListener('focus', cargarDatos);
    return unsubscribe;
  }, [navigation, cargarDatos]);

  const onRefrescar = () => { setRefrescando(true); cargarDatos(); };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const iconoTipo = { lectura: 'book-open-variant', escritura: 'pencil', especial: 'star', ia: 'robot' };

  return (
    <ScrollView
      style={styles.contenedor}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefrescar} />}
    >
      {!estaConectado && (
        <View style={styles.bannerOffline}>
          <MaterialCommunityIcons name="wifi-off" size={16} color="#FFFFFF" />
          <Text style={styles.textoOffline}>  Sin conexión - Los datos se sincronizarán al conectarte</Text>
        </View>
      )}

      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View>
          <Text style={styles.saludo}>{obtenerSaludo()},</Text>
          <Text style={styles.nombreUsuario}>{usuario?.nombre}</Text>
          <Text style={styles.grado}>{usuario?.grado || 'Estudiante'}</Text>
        </View>
        <TouchableOpacity onPress={cerrarSesion} style={styles.botonSalir}>
          <MaterialCommunityIcons name="logout" size={22} color="#757575" />
        </TouchableOpacity>
      </View>

      {/* Estadísticas del día */}
      {cargando ? (
        <View style={styles.cargandoStats}>
          <ActivityIndicator size="small" color="#4A90D9" />
        </View>
      ) : (
        <View style={styles.tarjetaEstadisticas}>
          <View style={styles.tituloSeccionRow}>
            <MaterialCommunityIcons name="chart-bar" size={18} color="#1A237E" />
            <Text style={styles.tituloSeccion}>  Tu progreso</Text>
          </View>
          <View style={styles.fillaEstadisticas}>
            <View style={styles.estadistica}>
              <Text style={styles.valorEstadistica}>{resumen?.promedioGeneral ?? 0}%</Text>
              <Text style={styles.etiquetaEstadistica}>Promedio</Text>
            </View>
            <View style={styles.separadorVertical} />
            <View style={styles.estadistica}>
              <Text style={styles.valorEstadistica}>{resumen?.totalEjercicios ?? 0}</Text>
              <Text style={styles.etiquetaEstadistica}>Ejercicios</Text>
            </View>
            <View style={styles.separadorVertical} />
            <View style={styles.estadistica}>
              <View style={styles.rachaRow}>
                <MaterialCommunityIcons name="fire" size={20} color="#FF9800" />
                <Text style={styles.valorEstadistica}> {resumen?.rachaDias ?? 0}</Text>
              </View>
              <Text style={styles.etiquetaEstadistica}>Días seguidos</Text>
            </View>
          </View>
        </View>
      )}

      {/* Acceso rápido */}
      <View style={styles.tituloSeccionRow2}>
        <MaterialCommunityIcons name="lightning-bolt" size={18} color="#212121" />
        <Text style={styles.tituloSeccion}>  Acceso rápido</Text>
      </View>
      <View style={styles.gridAccesos}>
        {ACCESO_RAPIDO.map((item) => (
          <TouchableOpacity
            key={item.nombre}
            style={[styles.tarjetaAcceso, { borderLeftColor: item.color }]}
            onPress={() => navigation.navigate(item.ruta)}
          >
            <MaterialCommunityIcons name={item.icono} size={28} color={item.color} />
            <Text style={styles.textoAcceso}>{item.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tareas pendientes */}
      <View style={styles.tituloSeccionRow2}>
        <MaterialCommunityIcons name="clipboard-list" size={18} color="#212121" />
        <Text style={styles.tituloSeccion}>  Tareas pendientes</Text>
      </View>

      {cargando ? (
        <View style={styles.cargandoStats}>
          <ActivityIndicator size="small" color="#4A90D9" />
        </View>
      ) : tareas.length === 0 ? (
        <View style={styles.sinTareas}>
          <MaterialCommunityIcons name="check-circle" size={40} color="#4CAF50" />
          <Text style={styles.textoSinTareas}>No tienes tareas pendientes</Text>
        </View>
      ) : (
        <>
          {tareas.map((tarea) => (
            <TouchableOpacity
              key={tarea.id}
              style={styles.tarjetaTarea}
              onPress={() => navigation.navigate('Tareas')}
            >
              <MaterialCommunityIcons
                name={iconoTipo[tarea.tipo] || 'clipboard'}
                size={24}
                color={tarea.es_avanzada ? '#FF9800' : '#4A90D9'}
              />
              <View style={styles.infoTarea}>
                <Text style={styles.tituloTarea} numberOfLines={1}>{tarea.titulo}</Text>
                {tarea.es_avanzada && (
                  <View style={styles.etiquetaAvanzada}>
                    <Text style={styles.textoAvanzada}>Alto rendimiento</Text>
                  </View>
                )}
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#BDBDBD" />
            </TouchableOpacity>
          ))}
          {/* Ver todas las tareas */}
          <TouchableOpacity
            style={styles.botonVerTodas}
            onPress={() => navigation.navigate('Tareas')}
          >
            <Text style={styles.textoVerTodas}>Ver todas las tareas</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#4A90D9" />
          </TouchableOpacity>
        </>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  bannerOffline: {
    backgroundColor: '#FF9800', flexDirection: 'row',
    alignItems: 'center', padding: 10, paddingHorizontal: 16,
  },
  textoOffline: { color: '#FFFFFF', fontSize: 12 },
  encabezado: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 20, paddingTop: 50, backgroundColor: '#FFFFFF',
  },
  saludo: { fontSize: 16, color: '#757575' },
  nombreUsuario: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  grado: { fontSize: 13, color: '#4A90D9', marginTop: 2 },
  botonSalir: { padding: 8 },
  cargandoStats: { alignItems: 'center', padding: 20 },
  tarjetaEstadisticas: {
    backgroundColor: '#FFFFFF', margin: 16, borderRadius: 16, padding: 16, elevation: 3,
  },
  tituloSeccionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  tituloSeccionRow2: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 12, marginTop: 8,
  },
  tituloSeccion: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  fillaEstadisticas: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  estadistica: { alignItems: 'center' },
  rachaRow: { flexDirection: 'row', alignItems: 'center' },
  valorEstadistica: { fontSize: 22, fontWeight: 'bold', color: '#1A237E' },
  etiquetaEstadistica: { fontSize: 12, color: '#757575', marginTop: 4 },
  separadorVertical: { width: 1, backgroundColor: '#E0E0E0' },
  gridAccesos: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 8 },
  tarjetaAcceso: {
    width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 16, alignItems: 'center', borderLeftWidth: 4, elevation: 2, margin: 4,
  },
  textoAcceso: { fontSize: 14, fontWeight: '600', color: '#424242', marginTop: 6 },
  tarjetaTarea: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 14, elevation: 2,
  },
  infoTarea: { flex: 1, marginLeft: 12 },
  tituloTarea: { fontSize: 14, color: '#212121', fontWeight: '500' },
  etiquetaAvanzada: {
    backgroundColor: '#FFF3E0', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4,
  },
  textoAvanzada: { color: '#FF9800', fontSize: 11, fontWeight: 'bold' },
  sinTareas: { alignItems: 'center', padding: 24 },
  textoSinTareas: { color: '#757575', fontSize: 14, marginTop: 8 },
  botonVerTodas: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginTop: 4, marginBottom: 8, padding: 10,
  },
  textoVerTodas: { color: '#4A90D9', fontSize: 14, fontWeight: '600', marginRight: 4 },
});

export default InicioEstudianteScreen;
