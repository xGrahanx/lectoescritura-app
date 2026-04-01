/**
 * DetalleEstudianteScreen.jsx - Detalle del rendimiento de un estudiante
 *
 * El docente puede ver el historial completo de actividades, errores frecuentes
 * detectados por la IA, progreso por modulo y asignar tareas adicionales.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HISTORIAL_EJEMPLO = [
  { id: 1, tipo: 'lectura', titulo: 'El Principito - Cap. 1', puntaje: 90, fecha: '01/04/2026' },
  { id: 2, tipo: 'escritura', titulo: 'Dictado: Animales', puntaje: 65, fecha: '31/03/2026' },
  { id: 3, tipo: 'ia', titulo: 'Sinonimos', puntaje: 100, fecha: '30/03/2026' },
  { id: 4, tipo: 'escritura', titulo: 'Escritura libre', puntaje: 72, fecha: '29/03/2026' },
];

const ERRORES_FRECUENTES = [
  { error: 'Omision de tildes en palabras esdrujulas', frecuencia: 8 },
  { error: 'Confusion entre "b" y "v"', frecuencia: 5 },
  { error: 'Falta de mayuscula al inicio de oracion', frecuencia: 3 },
];

const DetalleEstudianteScreen = ({ route, navigation }) => {
  const { estudiante } = route.params;
  const [tabActiva, setTabActiva] = useState('resumen');
  const colorRendimiento = estudiante.promedio >= 80 ? '#4CAF50' : estudiante.promedio >= 60 ? '#FF9800' : '#F44336';

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
        <View style={styles.perfilContenedor}>
          <View style={[styles.avatarGrande, { backgroundColor: colorRendimiento + '20' }]}>
            <Text style={[styles.inicialGrande, { color: colorRendimiento }]}>{estudiante.nombre.charAt(0)}</Text>
          </View>
          <Text style={styles.nombreEstudiante}>{estudiante.nombre}</Text>
          <Text style={styles.gradoEstudiante}>{estudiante.grado || '3er Grado'}</Text>
          <View style={[styles.promedioDestacado, { backgroundColor: colorRendimiento + '15', borderColor: colorRendimiento }]}>
            <Text style={[styles.valorPromedio, { color: colorRendimiento }]}>{estudiante.promedio}%</Text>
            <Text style={styles.etiquetaPromedio}>Promedio general</Text>
          </View>
          {estudiante.promedio >= 80 && (
            <TouchableOpacity
              style={styles.botonAsignarTarea}
              onPress={() => navigation.navigate('AsignarTarea', { estudiante })}
            >
              <MaterialCommunityIcons name="plus-circle" size={18} color="#FFFFFF" />
              <Text style={styles.textoBotonAsignar}>  Asignar tarea adicional</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabs}>
          {['resumen', 'historial', 'errores'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, tabActiva === tab && styles.tabActiva]}
              onPress={() => setTabActiva(tab)}
            >
              <Text style={[styles.textoTab, tabActiva === tab && styles.textoTabActivo]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tabActiva === 'resumen' && (
          <View style={styles.contenidoTab}>
            <Text style={styles.tituloSeccion}>Progreso por modulo</Text>
            {[
              { nombre: 'Lectura', progreso: 72, color: '#4A90D9' },
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
            <Text style={styles.tituloSeccion}>Estadisticas</Text>
            <View style={styles.gridStats}>
              {[
                { valor: '18', etiqueta: 'Ejercicios completados' },
                { valor: '5', etiqueta: 'Dias consecutivos' },
                { valor: '2h 30m', etiqueta: 'Tiempo total' },
                { valor: '3', etiqueta: 'Tareas completadas' },
              ].map((stat, i) => (
                <View key={i} style={styles.statItem}>
                  <Text style={styles.valorStat}>{stat.valor}</Text>
                  <Text style={styles.etiquetaStat}>{stat.etiqueta}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {tabActiva === 'historial' && (
          <View style={styles.contenidoTab}>
            {HISTORIAL_EJEMPLO.map(actividad => (
              <View key={actividad.id} style={styles.tarjetaHistorial}>
                <MaterialCommunityIcons
                  name={actividad.tipo === 'lectura' ? 'book-open-variant' : actividad.tipo === 'escritura' ? 'pencil' : 'robot'}
                  size={22}
                  color={actividad.tipo === 'lectura' ? '#4A90D9' : actividad.tipo === 'escritura' ? '#E91E63' : '#9C27B0'}
                />
                <View style={styles.infoHistorial}>
                  <Text style={styles.tituloHistorial}>{actividad.titulo}</Text>
                  <Text style={styles.fechaHistorial}>{actividad.fecha}</Text>
                </View>
                <View style={[styles.puntajeHistorial, { backgroundColor: actividad.puntaje >= 70 ? '#E8F5E9' : '#FFEBEE' }]}>
                  <Text style={[styles.textoPuntaje, { color: actividad.puntaje >= 70 ? '#2E7D32' : '#C62828' }]}>
                    {actividad.puntaje}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {tabActiva === 'errores' && (
          <View style={styles.contenidoTab}>
            <Text style={styles.descripcionErrores}>Errores frecuentes detectados por la IA en los ultimos 30 dias:</Text>
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
                La IA recomienda reforzar ejercicios de acentuacion y ortografia basica para este estudiante.
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
  gridStats: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 2, marginBottom: 12 },
  valorStat: { fontSize: 18, fontWeight: 'bold', color: '#1A237E' },
  etiquetaStat: { fontSize: 11, color: '#757575', textAlign: 'center', marginTop: 4 },
  tarjetaHistorial: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2 },
  infoHistorial: { flex: 1 },
  tituloHistorial: { fontSize: 14, fontWeight: '500', color: '#212121' },
  fechaHistorial: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  puntajeHistorial: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  textoPuntaje: { fontSize: 13, fontWeight: 'bold' },
  descripcionErrores: { fontSize: 13, color: '#757575', marginBottom: 12, lineHeight: 20 },
  tarjetaError: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2 },
  frecuenciaContenedor: { backgroundColor: '#FFEBEE', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  frecuenciaValor: { fontSize: 13, fontWeight: 'bold', color: '#F44336' },
  textoError: { flex: 1, fontSize: 13, color: '#424242' },
  recomendacionIA: { backgroundColor: '#F3E5F5', borderRadius: 12, padding: 14, flexDirection: 'row', marginTop: 8 },
  textoRecomendacion: { flex: 1, fontSize: 13, color: '#424242', lineHeight: 20 },
});

export default DetalleEstudianteScreen;
