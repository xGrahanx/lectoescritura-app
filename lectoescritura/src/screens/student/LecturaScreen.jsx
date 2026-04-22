/**
 * LecturaScreen.jsx - Módulo de Lectura
 *
 * Carga los textos disponibles desde el backend.
 * Permite filtrar por nivel y buscar por título.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';

const COLOR_NIVEL = { basico: '#4CAF50', intermedio: '#FF9800', avanzado: '#F44336' };

const LecturaScreen = ({ navigation }) => {
  const [textos, setTextos]           = useState([]);
  const [busqueda, setBusqueda]       = useState('');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [cargando, setCargando]       = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarTextos = useCallback(async () => {
    try {
      const params = filtroNivel !== 'todos' ? { nivel: filtroNivel } : {};
      const { data } = await axios.get(`${API_CONFIG.BASE_URL}/textos`, {
        params,
        timeout: API_CONFIG.TIMEOUT,
      });
      setTextos(data);
    } catch (error) {
      console.error('Error al cargar textos:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [filtroNivel]);

  useEffect(() => { cargarTextos(); }, [cargarTextos]);

  const onRefrescar = () => { setRefrescando(true); cargarTextos(); };

  const textosFiltrados = textos.filter(t =>
    t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.autor.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderTexto = ({ item }) => {
    const color = COLOR_NIVEL[item.nivel] || '#9E9E9E';
    return (
      <TouchableOpacity
        style={styles.tarjetaTexto}
        onPress={() => navigation.navigate('EjercicioLectura', { textoId: item.id })}
      >
        <View style={styles.contenidoTarjeta}>
          <View style={styles.encabezadoTarjeta}>
            <View style={[styles.etiquetaNivel, { backgroundColor: color + '20' }]}>
              <Text style={[styles.textoNivel, { color }]}>
                {item.nivel.charAt(0).toUpperCase() + item.nivel.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.tituloTexto}>{item.titulo}</Text>
          <Text style={styles.autorTexto}>{item.autor}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color="#BDBDBD" />
      </TouchableOpacity>
    );
  };

  const niveles = ['todos', 'basico', 'intermedio', 'avanzado'];
  const etiquetasNivel = { todos: 'Todos', basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' };

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="book-open-variant" size={26} color="#1A237E" />
          <Text style={styles.titulo}> Lectura</Text>
        </View>
        <Text style={styles.subtitulo}>Selecciona un texto para practicar</Text>
      </View>

      <View style={styles.busquedaContenedor}>
        <MaterialCommunityIcons name="magnify" size={20} color="#9E9E9E" />
        <TextInput
          style={styles.inputBusqueda}
          placeholder="Buscar texto o autor..."
          value={busqueda}
          onChangeText={setBusqueda}
          placeholderTextColor="#BDBDBD"
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#BDBDBD" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtros}>
        {niveles.map(nivel => (
          <TouchableOpacity
            key={nivel}
            style={[styles.botonFiltro, filtroNivel === nivel && styles.botonFiltroActivo]}
            onPress={() => setFiltroNivel(nivel)}
          >
            <Text style={[styles.textoFiltro, filtroNivel === nivel && styles.textoFiltroActivo]}>
              {etiquetasNivel[nivel]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#4A90D9" />
          <Text style={styles.textoCargando}>Cargando textos...</Text>
        </View>
      ) : (
        <FlatList
          data={textosFiltrados}
          renderItem={renderTexto}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefrescar} />}
          ListEmptyComponent={
            <View style={styles.sinResultados}>
              <MaterialCommunityIcons name="book-off" size={40} color="#BDBDBD" />
              <Text style={styles.textoSinResultados}>
                {busqueda ? 'No se encontraron textos' : 'No hay textos disponibles aún'}
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
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  textoCargando: { color: '#9E9E9E', marginTop: 12 },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50 },
  tituloRow: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  subtitulo: { fontSize: 13, color: '#757575', marginTop: 2 },
  busquedaContenedor: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    margin: 16, borderRadius: 12, paddingHorizontal: 14, elevation: 2,
  },
  inputBusqueda: { flex: 1, height: 44, fontSize: 15, color: '#212121', marginLeft: 8 },
  filtros: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, flexWrap: 'wrap' },
  botonFiltro: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', marginRight: 8, marginBottom: 4,
  },
  botonFiltroActivo: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  textoFiltro: { fontSize: 13, color: '#757575' },
  textoFiltroActivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20, paddingTop: 8 },
  tarjetaTexto: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', elevation: 2, marginBottom: 12,
  },
  contenidoTarjeta: { flex: 1 },
  encabezadoTarjeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  etiquetaNivel: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  textoNivel: { fontSize: 11, fontWeight: 'bold' },
  tituloTexto: { fontSize: 15, fontWeight: '600', color: '#212121', marginBottom: 2 },
  autorTexto: { fontSize: 12, color: '#9E9E9E' },
  sinResultados: { alignItems: 'center', padding: 40 },
  textoSinResultados: { color: '#9E9E9E', fontSize: 14, marginTop: 12, textAlign: 'center' },
});

export default LecturaScreen;
