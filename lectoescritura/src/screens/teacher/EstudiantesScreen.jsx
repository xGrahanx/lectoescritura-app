/**
 * EstudiantesScreen.jsx - Lista de estudiantes del docente
 *
 * Muestra todos los estudiantes asignados con su estado de rendimiento.
 * Permite buscar y filtrar por nivel de rendimiento.
 */

import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ESTUDIANTES_EJEMPLO = [
  { id: 1, nombre: 'Ana Garcia',      grado: '4to Grado - Seccion A', promedio: 95, activo: true,  ultimaActividad: 'Hoy' },
  { id: 2, nombre: 'Carlos Lopez',    grado: '3er Grado - Seccion A', promedio: 91, activo: true,  ultimaActividad: 'Hoy' },
  { id: 3, nombre: 'Maria Torres',    grado: '5to Grado - Seccion B', promedio: 78, activo: true,  ultimaActividad: 'Ayer' },
  { id: 4, nombre: 'Jose Ramirez',    grado: '3er Grado - Seccion B', promedio: 72, activo: false, ultimaActividad: 'Hace 3 dias' },
  { id: 5, nombre: 'Pedro Martinez',  grado: '4to Grado - Seccion A', promedio: 42, activo: true,  ultimaActividad: 'Hoy' },
  { id: 6, nombre: 'Luisa Rodriguez', grado: '2do Grado - Seccion C', promedio: 38, activo: false, ultimaActividad: 'Hace 5 dias' },
  { id: 7, nombre: 'Sofia Herrera',   grado: '5to Grado - Seccion C', promedio: 85, activo: true,  ultimaActividad: 'Hoy' },
];

const colorRendimiento = (promedio) => {
  if (promedio >= 80) return '#4CAF50';
  if (promedio >= 60) return '#FF9800';
  return '#F44336';
};

const EstudiantesScreen = ({ navigation }) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const estudiantesFiltrados = ESTUDIANTES_EJEMPLO.filter(est => {
    const coincideBusqueda = est.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro =
      filtro === 'todos' ||
      (filtro === 'alto' && est.promedio >= 80) ||
      (filtro === 'medio' && est.promedio >= 60 && est.promedio < 80) ||
      (filtro === 'bajo' && est.promedio < 60);
    return coincideBusqueda && coincideFiltro;
  });

  const renderEstudiante = ({ item }) => (
    <TouchableOpacity
      style={styles.tarjeta}
      onPress={() => navigation.navigate('DetalleEstudiante', { estudiante: item })}
    >
      <View style={[styles.avatar, { backgroundColor: colorRendimiento(item.promedio) + '20' }]}>
        <Text style={[styles.inicial, { color: colorRendimiento(item.promedio) }]}>
          {item.nombre.charAt(0)}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.grado}>{item.grado}</Text>
        <View style={styles.pie}>
          <View style={[styles.indicadorActividad, { backgroundColor: item.activo ? '#4CAF50' : '#BDBDBD' }]} />
          <Text style={styles.textoActividad}>{item.ultimaActividad}</Text>
        </View>
      </View>
      <View style={[styles.promedioContenedor, { backgroundColor: colorRendimiento(item.promedio) + '15' }]}>
        <Text style={[styles.promedioValor, { color: colorRendimiento(item.promedio) }]}>{item.promedio}%</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#BDBDBD" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="account-group" size={26} color="#1A237E" />
          <Text style={styles.titulo}> Mis Estudiantes</Text>
        </View>
        <Text style={styles.subtitulo}>{ESTUDIANTES_EJEMPLO.length} estudiantes asignados</Text>
      </View>
      <View style={styles.busquedaContenedor}>
        <MaterialCommunityIcons name="magnify" size={20} color="#9E9E9E" />
        <TextInput
          style={styles.inputBusqueda} placeholder="Buscar estudiante..."
          value={busqueda} onChangeText={setBusqueda} placeholderTextColor="#BDBDBD"
        />
      </View>
      <View style={styles.filtros}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'alto', label: 'Alto' },
          { key: 'medio', label: 'Medio' },
          { key: 'bajo', label: 'Bajo' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.botonFiltro, filtro === f.key && styles.botonFiltroActivo]}
            onPress={() => setFiltro(f.key)}
          >
            <Text style={[styles.textoFiltro, filtro === f.key && styles.textoFiltroActivo]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={estudiantesFiltrados}
        renderItem={renderEstudiante}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.sinResultados}>
            <MaterialCommunityIcons name="account-search" size={40} color="#BDBDBD" />
            <Text style={styles.textoSinResultados}>No se encontraron estudiantes</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50 },
  tituloRow: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  subtitulo: { fontSize: 13, color: '#757575', marginTop: 2 },
  busquedaContenedor: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    margin: 16, borderRadius: 12, paddingHorizontal: 14, elevation: 2,
  },
  inputBusqueda: { flex: 1, height: 44, fontSize: 15, color: '#212121', marginLeft: 8 },
  filtros: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
  botonFiltro: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' },
  botonFiltroActivo: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  textoFiltro: { fontSize: 12, color: '#757575' },
  textoFiltroActivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20, paddingTop: 8 },
  tarjeta: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', elevation: 2, marginBottom: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  inicial: { fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1 },
  nombre: { fontSize: 14, fontWeight: '600', color: '#212121' },
  grado: { fontSize: 12, color: '#9E9E9E', marginTop: 1 },
  pie: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  indicadorActividad: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  textoActividad: { fontSize: 11, color: '#9E9E9E' },
  promedioContenedor: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  promedioValor: { fontSize: 14, fontWeight: 'bold' },
  sinResultados: { alignItems: 'center', padding: 40 },
  textoSinResultados: { color: '#9E9E9E', fontSize: 14 },
});

export default EstudiantesScreen;
