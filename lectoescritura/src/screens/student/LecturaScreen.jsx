/**
 * LecturaScreen.jsx - Modulo de Lectura
 *
 * Muestra la lista de textos disponibles para leer, organizados por nivel.
 * Cada texto tiene un ejercicio de comprension lectora evaluado por IA.
 * Funciona en modo offline usando textos descargados previamente.
 */

import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TEXTOS_EJEMPLO = [
  { id: 1, titulo: 'El Principito - Capitulo 1', autor: 'Antoine de Saint-Exupery', nivel: 'Basico', colorNivel: '#4CAF50', duracionMin: 5, completado: true, puntaje: 90, disponibleOffline: true },
  { id: 2, titulo: 'La Tortuga y la Liebre', autor: 'Esopo', nivel: 'Basico', colorNivel: '#4CAF50', duracionMin: 3, completado: false, puntaje: null, disponibleOffline: true },
  { id: 3, titulo: 'El Quijote - Fragmento', autor: 'Miguel de Cervantes', nivel: 'Intermedio', colorNivel: '#FF9800', duracionMin: 8, completado: false, puntaje: null, disponibleOffline: false },
  { id: 4, titulo: 'Cien Anos de Soledad - Inicio', autor: 'Gabriel Garcia Marquez', nivel: 'Avanzado', colorNivel: '#F44336', duracionMin: 10, completado: false, puntaje: null, disponibleOffline: false },
];

const LecturaScreen = ({ navigation }) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  const niveles = ['Todos', 'Basico', 'Intermedio', 'Avanzado'];

  const textosFiltrados = TEXTOS_EJEMPLO.filter(texto => {
    const coincideBusqueda = texto.titulo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideNivel = filtroNivel === 'Todos' || texto.nivel === filtroNivel;
    return coincideBusqueda && coincideNivel;
  });

  const renderTexto = ({ item }) => (
    <TouchableOpacity
      style={styles.tarjetaTexto}
      onPress={() => navigation.navigate('EjercicioLectura', { texto: item })}
    >
      {item.completado && (
        <View style={styles.insigniaCompletado}>
          <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
        </View>
      )}
      <View style={styles.contenidoTarjeta}>
        <View style={styles.encabezadoTarjeta}>
          <View style={[styles.etiquetaNivel, { backgroundColor: item.colorNivel + '20' }]}>
            <Text style={[styles.textoNivel, { color: item.colorNivel }]}>{item.nivel}</Text>
          </View>
          {item.disponibleOffline && (
            <MaterialCommunityIcons name="download-circle" size={18} color="#4A90D9" />
          )}
        </View>
        <Text style={styles.tituloTexto}>{item.titulo}</Text>
        <Text style={styles.autorTexto}>{item.autor}</Text>
        <View style={styles.pieTexto}>
          <View style={styles.duracion}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#9E9E9E" />
            <Text style={styles.textoDuracion}> {item.duracionMin} min</Text>
          </View>
          {item.completado && item.puntaje && (
            <View style={styles.puntaje}>
              <MaterialCommunityIcons name="star" size={14} color="#FFC107" />
              <Text style={styles.textoPuntaje}> {item.puntaje}%</Text>
            </View>
          )}
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color="#BDBDBD" />
    </TouchableOpacity>
  );

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
          style={styles.inputBusqueda} placeholder="Buscar texto..."
          value={busqueda} onChangeText={setBusqueda} placeholderTextColor="#BDBDBD"
        />
      </View>

      <View style={styles.filtros}>
        {niveles.map(nivel => (
          <TouchableOpacity
            key={nivel}
            style={[styles.botonFiltro, filtroNivel === nivel && styles.botonFiltroActivo]}
            onPress={() => setFiltroNivel(nivel)}
          >
            <Text style={[styles.textoFiltro, filtroNivel === nivel && styles.textoFiltroActivo]}>{nivel}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={textosFiltrados}
        renderItem={renderTexto}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.sinResultados}>
            <MaterialCommunityIcons name="book-off" size={40} color="#BDBDBD" />
            <Text style={styles.textoSinResultados}>No se encontraron textos</Text>
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
  botonFiltro: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0',
  },
  botonFiltroActivo: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  textoFiltro: { fontSize: 13, color: '#757575' },
  textoFiltroActivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20, paddingTop: 8 },
  tarjetaTexto: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', elevation: 2, position: 'relative',
    marginBottom: 12,
  },
  insigniaCompletado: {
    position: 'absolute', top: 10, right: 10, backgroundColor: '#4CAF50',
    borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  contenidoTarjeta: { flex: 1 },
  encabezadoTarjeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  etiquetaNivel: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  textoNivel: { fontSize: 11, fontWeight: 'bold' },
  tituloTexto: { fontSize: 15, fontWeight: '600', color: '#212121', marginBottom: 2 },
  autorTexto: { fontSize: 12, color: '#9E9E9E', marginBottom: 8 },
  pieTexto: { flexDirection: 'row' },
  duracion: { flexDirection: 'row', alignItems: 'center' },
  textoDuracion: { fontSize: 12, color: '#9E9E9E' },
  puntaje: { flexDirection: 'row', alignItems: 'center' },
  textoPuntaje: { fontSize: 12, color: '#FFC107', fontWeight: '600' },
  sinResultados: { alignItems: 'center', padding: 40 },
  textoSinResultados: { color: '#9E9E9E', fontSize: 14 },
});

export default LecturaScreen;
