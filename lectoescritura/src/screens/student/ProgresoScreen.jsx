/**
 * ProgresoScreen.jsx - Pantalla de progreso del estudiante
 *
 * Muestra estadisticas del rendimiento: puntaje semanal, progreso
 * por modulo, logros obtenidos e historial de actividades recientes.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DATOS_SEMANA = [
  { dia: 'Lun', puntaje: 70 }, { dia: 'Mar', puntaje: 85 }, { dia: 'Mie', puntaje: 60 },
  { dia: 'Jue', puntaje: 90 }, { dia: 'Vie', puntaje: 78 }, { dia: 'Sab', puntaje: 95 }, { dia: 'Dom', puntaje: 0 },
];

const PROGRESO_MODULOS = [
  { nombre: 'Lectura', progreso: 72, color: '#4A90D9', icono: 'book-open-variant' },
  { nombre: 'Escritura', progreso: 65, color: '#E91E63', icono: 'pencil' },
  { nombre: 'Ejercicios IA', progreso: 88, color: '#9C27B0', icono: 'robot' },
];

const LOGROS = [
  { id: 1, titulo: 'Primera lectura', icono: 'book-check', obtenido: true },
  { id: 2, titulo: '5 dias seguidos', icono: 'fire', obtenido: true },
  { id: 3, titulo: 'Puntaje perfecto', icono: 'star-circle', obtenido: false },
  { id: 4, titulo: '10 ejercicios', icono: 'trophy', obtenido: false },
];

const ACTIVIDADES_RECIENTES = [
  { id: 1, tipo: 'lectura', titulo: 'El Principito - Cap. 1', puntaje: 90, fecha: 'Hoy' },
  { id: 2, tipo: 'escritura', titulo: 'Dictado: Animales', puntaje: 75, fecha: 'Ayer' },
  { id: 3, tipo: 'ia', titulo: 'Sinonimos y Antonimos', puntaje: 100, fecha: 'Hace 2 dias' },
];

const ProgresoScreen = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('semana');
  const periodos = ['semana', 'mes', 'total'];
  const etiquetasPeriodo = { semana: 'Esta semana', mes: 'Este mes', total: 'Total' };
  const ALTURA_MAX_BARRA = 100;

  const promedio = Math.round(
    DATOS_SEMANA.filter(d => d.puntaje > 0).reduce((acc, d) => acc + d.puntaje, 0) /
    DATOS_SEMANA.filter(d => d.puntaje > 0).length
  );

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="chart-line" size={26} color="#1A237E" />
          <Text style={styles.titulo}> Mi Progreso</Text>
        </View>
        <Text style={styles.subtitulo}>Sigue tu avance en lectoescritura</Text>
      </View>

      <View style={styles.resumenGeneral}>
        <View style={styles.statResumen}>
          <Text style={styles.valorResumen}>{promedio}%</Text>
          <Text style={styles.etiquetaResumen}>Promedio</Text>
        </View>
        <View style={styles.separador} />
        <View style={styles.statResumen}>
          <Text style={styles.valorResumen}>18</Text>
          <Text style={styles.etiquetaResumen}>Ejercicios</Text>
        </View>
        <View style={styles.separador} />
        <View style={styles.statResumen}>
          <MaterialCommunityIcons name="fire" size={20} color="#FF9800" />
          <Text style={styles.valorResumen}>5</Text>
          <Text style={styles.etiquetaResumen}>Racha</Text>
        </View>
      </View>

      <View style={styles.selectorPeriodo}>
        {periodos.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.botonPeriodo, periodoSeleccionado === p && styles.botonPeriodoActivo]}
            onPress={() => setPeriodoSeleccionado(p)}
          >
            <Text style={[styles.textoPeriodo, periodoSeleccionado === p && styles.textoPeriodoActivo]}>
              {etiquetasPeriodo[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tarjetaGrafica}>
        <Text style={styles.tituloTarjeta}>Puntaje diario</Text>
        <View style={styles.grafica}>
          {DATOS_SEMANA.map((item) => (
            <View key={item.dia} style={styles.columnaGrafica}>
              <Text style={styles.valorBarra}>{item.puntaje > 0 ? item.puntaje : ''}</Text>
              <View style={styles.contenedorBarra}>
                <View style={[styles.barra, {
                  height: (item.puntaje / 100) * ALTURA_MAX_BARRA,
                  backgroundColor: item.puntaje >= 80 ? '#4CAF50' : item.puntaje >= 60 ? '#FF9800' : '#E0E0E0',
                }]} />
              </View>
              <Text style={styles.etiquetaBarra}>{item.dia}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.tarjetaModulos}>
        <Text style={styles.tituloTarjeta}>Progreso por modulo</Text>
        {PROGRESO_MODULOS.map(modulo => (
          <View key={modulo.nombre} style={styles.filaModulo}>
            <MaterialCommunityIcons name={modulo.icono} size={20} color={modulo.color} />
            <Text style={styles.nombreModulo}>{modulo.nombre}</Text>
            <View style={styles.barraProgreso}>
              <View style={[styles.relleno, { flex: modulo.progreso, backgroundColor: modulo.color }]} />
              <View style={{ flex: 100 - modulo.progreso }} />
            </View>
            <Text style={[styles.porcentajeModulo, { color: modulo.color }]}>{modulo.progreso}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.tituloSeccionRow}>
        <MaterialCommunityIcons name="trophy" size={20} color="#212121" />
        <Text style={styles.tituloSeccion}> Logros</Text>
      </View>
      <View style={styles.gridLogros}>
        {LOGROS.map(logro => (
          <View key={logro.id} style={[styles.tarjetaLogro, !logro.obtenido && styles.logroNoObtenido]}>
            <MaterialCommunityIcons
              name={logro.icono}
              size={28}
              color={logro.obtenido ? '#FFC107' : '#BDBDBD'}
            />
            <Text style={[styles.tituloLogro, !logro.obtenido && styles.textoLogroOpaco]}>{logro.titulo}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tituloSeccionRow}>
        <MaterialCommunityIcons name="history" size={20} color="#212121" />
        <Text style={styles.tituloSeccion}> Actividades recientes</Text>
      </View>
      {ACTIVIDADES_RECIENTES.map(actividad => (
        <View key={actividad.id} style={styles.tarjetaActividad}>
          <MaterialCommunityIcons
            name={actividad.tipo === 'lectura' ? 'book-open-variant' : actividad.tipo === 'escritura' ? 'pencil' : 'robot'}
            size={22}
            color={actividad.tipo === 'lectura' ? '#4A90D9' : actividad.tipo === 'escritura' ? '#E91E63' : '#9C27B0'}
          />
          <View style={styles.infoActividad}>
            <Text style={styles.tituloActividad}>{actividad.titulo}</Text>
            <Text style={styles.fechaActividad}>{actividad.fecha}</Text>
          </View>
          <View style={[styles.puntajeActividad, { backgroundColor: actividad.puntaje >= 80 ? '#E8F5E9' : '#FFF8E1' }]}>
            <Text style={[styles.textoPuntajeActividad, { color: actividad.puntaje >= 80 ? '#2E7D32' : '#F57F17' }]}>
              {actividad.puntaje}%
            </Text>
          </View>
        </View>
      ))}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50 },
  tituloRow: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  subtitulo: { fontSize: 13, color: '#757575', marginTop: 2 },
  resumenGeneral: {
    backgroundColor: '#FFFFFF', margin: 16, borderRadius: 16, padding: 16,
    flexDirection: 'row', justifyContent: 'space-around', elevation: 3,
  },
  statResumen: { alignItems: 'center' },
  valorResumen: { fontSize: 22, fontWeight: 'bold', color: '#1A237E' },
  etiquetaResumen: { fontSize: 12, color: '#757575', marginTop: 4 },
  separador: { width: 1, backgroundColor: '#E0E0E0' },
  selectorPeriodo: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, elevation: 1,
  },
  botonPeriodo: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  botonPeriodoActivo: { backgroundColor: '#4A90D9' },
  textoPeriodo: { fontSize: 13, color: '#757575' },
  textoPeriodoActivo: { color: '#FFFFFF', fontWeight: '600' },
  tarjetaGrafica: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, elevation: 2 },
  tituloTarjeta: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 16 },
  grafica: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 140 },
  columnaGrafica: { alignItems: 'center', flex: 1 },
  valorBarra: { fontSize: 10, color: '#757575', marginBottom: 4 },
  contenedorBarra: { height: 100, justifyContent: 'flex-end', width: 24 },
  barra: { borderRadius: 4, width: '100%' },
  etiquetaBarra: { fontSize: 11, color: '#757575', marginTop: 4 },
  tarjetaModulos: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, elevation: 2 },
  filaModulo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  nombreModulo: { fontSize: 13, color: '#424242', width: 70 },
  barraProgreso: { flex: 1, height: 8, backgroundColor: '#F5F5F5', borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  relleno: { height: 8, borderRadius: 4 },
  porcentajeModulo: { fontSize: 13, fontWeight: 'bold', width: 36, textAlign: 'right' },
  tituloSeccionRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 14, marginTop: 4 },
  tituloSeccion: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  gridLogros: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 16 },
  tarjetaLogro: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 2, marginBottom: 8 },
  logroNoObtenido: { backgroundColor: '#F5F5F5', elevation: 0 },
  tituloLogro: { fontSize: 12, fontWeight: '600', color: '#424242', textAlign: 'center', marginTop: 4 },
  textoLogroOpaco: { color: '#BDBDBD' },
  tarjetaActividad: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 2,
  },
  infoActividad: { flex: 1 },
  tituloActividad: { fontSize: 14, fontWeight: '500', color: '#212121' },
  fechaActividad: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  puntajeActividad: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  textoPuntajeActividad: { fontSize: 13, fontWeight: 'bold' },
});

export default ProgresoScreen;
