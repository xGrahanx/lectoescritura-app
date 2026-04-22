/**
 * EstudiantesScreen.jsx - Lista de estudiantes del docente
 *
 * Carga los estudiantes reales desde el backend (tabla usuarios, rol=estudiante).
 * Permite buscar y filtrar. Los datos de promedio son de ejemplo
 * hasta que se implemente la tabla de resultados.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';

const colorRendimiento = (promedio) => {
  if (promedio >= 80) return '#4CAF50';
  if (promedio >= 60) return '#FF9800';
  return '#F44336';
};

const EstudiantesScreen = ({ navigation }) => {
  const { usuario }                   = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [busqueda, setBusqueda]       = useState('');
  const [filtro, setFiltro]           = useState('todos');
  const [cargando, setCargando]       = useState(true);

  // Cargar estudiantes del grupo asignado al docente logueado
  const cargarEstudiantes = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await axios.get(
        `${API_CONFIG.BASE_URL}/grupos/docente/${usuario.id}`,
        { timeout: API_CONFIG.TIMEOUT }
      );

      // Extraer todos los estudiantes de todos los grupos del docente
      const estudiantesExtraidos = [];
      data.forEach(grupo => {
        grupo.estudiantes.forEach(ge => {
          // Promedio fijo basado en el ID hasta que se implemente el cálculo real
          const promedioFijo = 50 + (ge.estudiante.id % 40);
          estudiantesExtraidos.push({
            ...ge.estudiante,
            nombre: `${ge.estudiante.nombre} ${ge.estudiante.apellido}`,
            grupo: grupo.nombre,
            promedio: promedioFijo,
            activo: true,
            ultimaActividad: 'Sin actividad',
          });
        });
      });

      setEstudiantes(estudiantesExtraidos);
    } catch (error) {
      setEstudiantes([]);
    } finally {
      setCargando(false);
    }
  }, [usuario.id]);

  useEffect(() => {
    cargarEstudiantes();
    const unsubscribe = navigation.addListener('focus', cargarEstudiantes);
    return unsubscribe;
  }, [navigation, cargarEstudiantes]);

  const estudiantesFiltrados = estudiantes.filter(est => {
    const coincideBusqueda = est.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro =
      filtro === 'todos' ||
      (filtro === 'alto'  && est.promedio >= 80) ||
      (filtro === 'medio' && est.promedio >= 60 && est.promedio < 80) ||
      (filtro === 'bajo'  && est.promedio < 60);
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
        <Text style={styles.grado}>{item.grupo || item.grado || 'Sin grupo asignado'}</Text>
        <View style={styles.pie}>
          <View style={[styles.indicadorActividad, { backgroundColor: item.activo ? '#4CAF50' : '#BDBDBD' }]} />
          <Text style={styles.textoActividad}>{item.ultimaActividad}</Text>
        </View>
      </View>
      <View style={[styles.promedioContenedor, { backgroundColor: colorRendimiento(item.promedio) + '15' }]}>
        <Text style={[styles.promedioValor, { color: colorRendimiento(item.promedio) }]}>{item.promedio}%</Text>
      </View>
      <TouchableOpacity
        style={styles.botonAsignar}
        onPress={() => navigation.navigate('AsignarTarea', { estudiante: item })}
      >
        <MaterialCommunityIcons name="clipboard-plus" size={20} color="#2E7D32" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="account-group" size={26} color="#1A237E" />
          <Text style={styles.titulo}> Mis Estudiantes</Text>
        </View>
        <Text style={styles.subtitulo}>{estudiantes.length} estudiantes registrados</Text>
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
          { key: 'alto',  label: 'Alto' },
          { key: 'medio', label: 'Medio' },
          { key: 'bajo',  label: 'Bajo' },
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

      {cargando ? (
        <View style={styles.cargando}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.textoCargando}>Cargando estudiantes...</Text>
        </View>
      ) : (
        <FlatList
          data={estudiantesFiltrados}
          renderItem={renderEstudiante}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.sinResultados}>
              <MaterialCommunityIcons name="account-search" size={40} color="#BDBDBD" />
              <Text style={styles.textoSinResultados}>
                {busqueda ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados aun'}
              </Text>
            </View>
          }
        />
      )}
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
  botonFiltro: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', marginRight: 8,
  },
  botonFiltroActivo: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  textoFiltro: { fontSize: 12, color: '#757575' },
  textoFiltroActivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20 },
  tarjeta: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', elevation: 2, marginBottom: 12,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  inicial: { fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1 },
  nombre: { fontSize: 14, fontWeight: '600', color: '#212121' },
  grado: { fontSize: 12, color: '#9E9E9E', marginTop: 1 },
  pie: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  indicadorActividad: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  textoActividad: { fontSize: 11, color: '#9E9E9E' },
  promedioContenedor: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  promedioValor: { fontSize: 14, fontWeight: 'bold' },
  botonAsignar: { padding: 6, marginLeft: 4 },
  cargando: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textoCargando: { color: '#9E9E9E', marginTop: 12 },
  sinResultados: { alignItems: 'center', padding: 40 },
  textoSinResultados: { color: '#9E9E9E', fontSize: 14, marginTop: 12, textAlign: 'center' },
});

export default EstudiantesScreen;
