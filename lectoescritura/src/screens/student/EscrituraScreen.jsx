/**
 * EscrituraScreen.jsx - Modulo de Escritura
 *
 * Lista de ejercicios de escritura disponibles:
 * dictados, completar oraciones, escritura libre y copia de textos.
 */

import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EJERCICIOS_ESCRITURA = [
  { id: 1, tipo: 'dictado', titulo: 'Dictado: Animales del bosque', descripcion: '10 palabras relacionadas con animales', icono: 'microphone', color: '#E91E63', dificultad: 'Facil', completado: false },
  { id: 2, tipo: 'completar', titulo: 'Completa las oraciones', descripcion: 'Rellena los espacios en blanco', icono: 'format-text', color: '#FF9800', dificultad: 'Facil', completado: true, puntaje: 95 },
  { id: 3, tipo: 'libre', titulo: 'Escritura libre: Mi mascota', descripcion: 'Escribe un parrafo sobre tu mascota favorita', icono: 'pencil-box', color: '#4CAF50', dificultad: 'Medio', completado: false },
  { id: 4, tipo: 'copia', titulo: 'Copia el texto', descripcion: 'Copia el fragmento con buena ortografia', icono: 'content-copy', color: '#9C27B0', dificultad: 'Medio', completado: false },
];

const EscrituraScreen = ({ navigation }) => {
  const [filtro, setFiltro] = useState('Todos');
  const tipos = ['Todos', 'dictado', 'completar', 'libre', 'copia'];
  const etiquetasTipos = { Todos: 'Todos', dictado: 'Dictado', completar: 'Completar', libre: 'Libre', copia: 'Copia' };

  const ejerciciosFiltrados = filtro === 'Todos'
    ? EJERCICIOS_ESCRITURA
    : EJERCICIOS_ESCRITURA.filter(e => e.tipo === filtro);

  const renderEjercicio = ({ item }) => (
    <TouchableOpacity
      style={styles.tarjeta}
      onPress={() => navigation.navigate('EjercicioEscritura', { ejercicio: item })}
    >
      <View style={[styles.iconoContenedor, { backgroundColor: item.color + '20' }]}>
        <MaterialCommunityIcons name={item.icono} size={28} color={item.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.descripcion}>{item.descripcion}</Text>
        <View style={styles.pie}>
          <View style={styles.etiquetaDificultad}>
            <Text style={styles.textoDificultad}>{item.dificultad}</Text>
          </View>
          {item.completado && (
            <View style={styles.puntajeContenedor}>
              <MaterialCommunityIcons name="star" size={13} color="#FFC107" />
              <Text style={styles.textoPuntaje}> {item.puntaje}%</Text>
            </View>
          )}
        </View>
      </View>
      {item.completado
        ? <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
        : <MaterialCommunityIcons name="chevron-right" size={24} color="#BDBDBD" />
      }
    </TouchableOpacity>
  );

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="pencil" size={26} color="#1A237E" />
          <Text style={styles.tituloModulo}> Escritura</Text>
        </View>
        <Text style={styles.subtitulo}>Practica y mejora tu escritura</Text>
      </View>
      <View style={styles.filtros}>
        {tipos.map(tipo => (
          <TouchableOpacity
            key={tipo}
            style={[styles.botonFiltro, filtro === tipo && styles.botonFiltroActivo]}
            onPress={() => setFiltro(tipo)}
          >
            <Text style={[styles.textoFiltro, filtro === tipo && styles.textoFiltroActivo]}>
              {etiquetasTipos[tipo]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={ejerciciosFiltrados}
        renderItem={renderEjercicio}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50 },
  tituloRow: { flexDirection: 'row', alignItems: 'center' },
  tituloModulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  subtitulo: { fontSize: 13, color: '#757575', marginTop: 2 },
  filtros: { flexDirection: 'row', padding: 16, flexWrap: 'wrap' },
  botonFiltro: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0',
  },
  botonFiltroActivo: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
  textoFiltro: { fontSize: 12, color: '#757575' },
  textoFiltroActivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20, paddingTop: 8 },
  tarjeta: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', elevation: 2,
    marginBottom: 12,
  },
  iconoContenedor: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  info: { flex: 1 },
  titulo: { fontSize: 15, fontWeight: '600', color: '#212121', marginBottom: 2 },
  descripcion: { fontSize: 12, color: '#9E9E9E', marginBottom: 6 },
  pie: { flexDirection: 'row', alignItems: 'center' },
  etiquetaDificultad: { backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  textoDificultad: { fontSize: 11, color: '#757575' },
  puntajeContenedor: { flexDirection: 'row', alignItems: 'center' },
  textoPuntaje: { fontSize: 12, color: '#FFC107', fontWeight: '600' },
});

export default EscrituraScreen;
