/**
 * InicioEstudianteScreen.jsx - Pantalla de inicio del estudiante
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';

const DATOS_EJEMPLO = {
  puntajeHoy: 85,
  ejerciciosCompletados: 3,
  rachaActual: 5,
  tareasPendientes: [
    { id: 1, titulo: 'Lectura: El Principito - Cap. 3', tipo: 'lectura', urgente: true },
    { id: 2, titulo: 'Escritura: Dictado de 10 palabras', tipo: 'escritura', urgente: false },
  ],
  accesoRapido: [
    { nombre: 'Lectura', icono: 'book-open-variant', color: '#4A90D9', ruta: 'Lectura' },
    { nombre: 'Escritura', icono: 'pencil', color: '#E91E63', ruta: 'Escritura' },
    { nombre: 'Ejercicios IA', icono: 'robot', color: '#9C27B0', ruta: 'EjerciciosIA' },
    { nombre: 'Mi Progreso', icono: 'chart-line', color: '#4CAF50', ruta: 'Progreso' },
  ],
};

const InicioEstudianteScreen = ({ navigation }) => {
  const { usuario, cerrarSesion } = useAuth();
  const { estaConectado } = useOffline();
  const [refrescando, setRefrescando] = useState(false);

  const onRefrescar = async () => {
    setRefrescando(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefrescando(false);
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos dias';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <ScrollView
      style={styles.contenedor}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefrescar} />}
    >
      {!estaConectado && (
        <View style={styles.bannerOffline}>
          <MaterialCommunityIcons name="wifi-off" size={16} color="#FFFFFF" />
          <Text style={styles.textoOffline}>  Sin conexion - Los datos se sincronizaran al conectarte</Text>
        </View>
      )}

      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View>
          <Text style={styles.saludo}>{obtenerSaludo()},</Text>
          <Text style={styles.nombreUsuario}>{usuario?.nombre}</Text>
          <Text style={styles.grado}>{usuario?.grado || '3er Grado'}</Text>
        </View>
        <TouchableOpacity onPress={cerrarSesion} style={styles.botonSalir}>
          <MaterialCommunityIcons name="logout" size={22} color="#757575" />
        </TouchableOpacity>
      </View>

      {/* Estadisticas del dia */}
      <View style={styles.tarjetaEstadisticas}>
        <View style={styles.tituloSeccionRow}>
          <MaterialCommunityIcons name="chart-bar" size={18} color="#1A237E" />
          <Text style={styles.tituloSeccion}>  Tu dia de hoy</Text>
        </View>
        <View style={styles.fillaEstadisticas}>
          <View style={styles.estadistica}>
            <Text style={styles.valorEstadistica}>{DATOS_EJEMPLO.puntajeHoy}%</Text>
            <Text style={styles.etiquetaEstadistica}>Puntaje</Text>
          </View>
          <View style={styles.separadorVertical} />
          <View style={styles.estadistica}>
            <Text style={styles.valorEstadistica}>{DATOS_EJEMPLO.ejerciciosCompletados}</Text>
            <Text style={styles.etiquetaEstadistica}>Ejercicios</Text>
          </View>
          <View style={styles.separadorVertical} />
          <View style={styles.estadistica}>
            <View style={styles.rachaRow}>
              <MaterialCommunityIcons name="fire" size={20} color="#FF9800" />
              <Text style={styles.valorEstadistica}> {DATOS_EJEMPLO.rachaActual}</Text>
            </View>
            <Text style={styles.etiquetaEstadistica}>Dias seguidos</Text>
          </View>
        </View>
      </View>

      {/* Acceso rapido */}
      <View style={styles.tituloSeccionRow2}>
        <MaterialCommunityIcons name="lightning-bolt" size={18} color="#212121" />
        <Text style={styles.tituloSeccion}>  Acceso rapido</Text>
      </View>
      <View style={styles.gridAccesos}>
        {DATOS_EJEMPLO.accesoRapido.map((item) => (
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
      {DATOS_EJEMPLO.tareasPendientes.length === 0 ? (
        <View style={styles.sinTareas}>
          <MaterialCommunityIcons name="check-circle" size={40} color="#4CAF50" />
          <Text style={styles.textoSinTareas}>No tienes tareas pendientes</Text>
        </View>
      ) : (
        DATOS_EJEMPLO.tareasPendientes.map((tarea) => (
          <TouchableOpacity key={tarea.id} style={styles.tarjetaTarea}>
            <MaterialCommunityIcons
              name={tarea.tipo === 'lectura' ? 'book-open-variant' : 'pencil'}
              size={24}
              color={tarea.urgente ? '#F44336' : '#4A90D9'}
            />
            <View style={styles.infoTarea}>
              <Text style={styles.tituloTarea}>{tarea.titulo}</Text>
              {tarea.urgente && (
                <View style={styles.etiquetaUrgente}>
                  <Text style={styles.textoUrgente}>Urgente</Text>
                </View>
              )}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#BDBDBD" />
          </TouchableOpacity>
        ))
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
  etiquetaUrgente: {
    backgroundColor: '#FFEBEE', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4,
  },
  textoUrgente: { color: '#F44336', fontSize: 11, fontWeight: 'bold' },
  sinTareas: { alignItems: 'center', padding: 24 },
  textoSinTareas: { color: '#757575', fontSize: 14, marginTop: 8 },
});

export default InicioEstudianteScreen;
