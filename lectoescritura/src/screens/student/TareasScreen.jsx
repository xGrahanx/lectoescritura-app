/**
 * TareasScreen.jsx - Pantalla de tareas asignadas por el docente
 *
 * Muestra las tareas adicionales que el docente asigno al estudiante,
 * especialmente cuando el estudiante muestra alto rendimiento.
 */

import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TAREAS_EJEMPLO = [
  {
    id: 1,
    titulo: 'Lectura avanzada: Fabulas de Esopo',
    descripcion: 'Lee las primeras 3 fabulas y responde las preguntas de comprension.',
    tipo: 'lectura',
    estado: 'pendiente',
    fechaLimite: '2026-04-05',
    asignadaPor: 'Prof. Maria Gonzalez',
    esAvanzada: true,
  },
  {
    id: 2,
    titulo: 'Redaccion: Mi dia favorito',
    descripcion: 'Escribe una redaccion de al menos 10 oraciones sobre tu dia favorito.',
    tipo: 'escritura',
    estado: 'pendiente',
    fechaLimite: '2026-04-07',
    asignadaPor: 'Prof. Maria Gonzalez',
    esAvanzada: false,
  },
  {
    id: 3,
    titulo: 'Ejercicio especial: Poesia',
    descripcion: 'Completa los ejercicios de rima y metrica basica.',
    tipo: 'especial',
    estado: 'completada',
    fechaLimite: '2026-03-30',
    asignadaPor: 'Prof. Maria Gonzalez',
    puntaje: 95,
    esAvanzada: true,
  },
];

const TareasScreen = ({ navigation }) => {
  const [filtro, setFiltro] = useState('todas');

  const tareasFiltradas = filtro === 'todas'
    ? TAREAS_EJEMPLO
    : TAREAS_EJEMPLO.filter(t => t.estado === filtro);

  const iconoTipo = { lectura: 'book-open-variant', escritura: 'pencil', especial: 'star' };
  const colorTipo = { lectura: '#4A90D9', escritura: '#E91E63', especial: '#FF9800' };

  const renderTarea = ({ item }) => (
    <TouchableOpacity style={styles.tarjeta}>
      {item.esAvanzada && (
        <View style={styles.etiquetaAvanzada}>
          <MaterialCommunityIcons name="star" size={12} color="#FFFFFF" />
          <Text style={styles.textoAvanzada}> Alto rendimiento</Text>
        </View>
      )}
      <View style={styles.contenidoTarjeta}>
        <View style={[styles.iconoContenedor, { backgroundColor: colorTipo[item.tipo] + '20' }]}>
          <MaterialCommunityIcons name={iconoTipo[item.tipo]} size={24} color={colorTipo[item.tipo]} />
        </View>
        <View style={styles.infoTarea}>
          <Text style={styles.tituloTarea}>{item.titulo}</Text>
          <Text style={styles.descripcionTarea} numberOfLines={2}>{item.descripcion}</Text>
          <View style={styles.pieTarea}>
            <MaterialCommunityIcons name="account-tie" size={13} color="#9E9E9E" />
            <Text style={styles.textoDocente}> {item.asignadaPor}</Text>
          </View>
          <View style={styles.pieTarea}>
            <MaterialCommunityIcons name="calendar" size={13} color="#9E9E9E" />
            <Text style={styles.textoFecha}> Limite: {item.fechaLimite}</Text>
          </View>
        </View>
      </View>
      <View style={[
        styles.estadoContenedor,
        item.estado === 'completada' ? styles.estadoCompletada : styles.estadoPendiente,
      ]}>
        <Text style={[
          styles.textoEstado,
          item.estado === 'completada' ? styles.textoCompletada : styles.textoPendiente,
        ]}>
          {item.estado === 'completada' ? `${item.puntaje}%` : 'Pendiente'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Mis Tareas</Text>
        <Text style={styles.subtitulo}>Tareas asignadas por tu docente</Text>
      </View>

      <View style={styles.filtros}>
        {['todas', 'pendiente', 'completada'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.botonFiltro, filtro === f && styles.botonFiltroActivo]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.textoFiltro, filtro === f && styles.textoFiltroActivo]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tareasFiltradas}
        renderItem={renderTarea}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.sinTareas}>
            <MaterialCommunityIcons name="check-all" size={40} color="#4CAF50" />
            <Text style={styles.textoSinTareas}>No hay tareas en esta categoria</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  subtitulo: { fontSize: 13, color: '#757575', marginTop: 2 },
  filtros: { flexDirection: 'row', padding: 16 },
  botonFiltro: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', marginRight: 8,
  },
  botonFiltroActivo: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  textoFiltro: { fontSize: 13, color: '#757575' },
  textoFiltroActivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20, paddingTop: 8 },
  tarjeta: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    elevation: 2, overflow: 'hidden', marginBottom: 12,
  },
  etiquetaAvanzada: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF9800',
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, marginBottom: 10,
  },
  textoAvanzada: { fontSize: 11, color: '#FFFFFF', fontWeight: 'bold' },
  contenidoTarjeta: { flexDirection: 'row', marginBottom: 10 },
  iconoContenedor: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoTarea: { flex: 1 },
  tituloTarea: { fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 4 },
  descripcionTarea: { fontSize: 12, color: '#757575', lineHeight: 18, marginBottom: 6 },
  pieTarea: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  textoDocente: { fontSize: 11, color: '#9E9E9E' },
  textoFecha: { fontSize: 11, color: '#9E9E9E' },
  estadoContenedor: { alignSelf: 'flex-end', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  estadoCompletada: { backgroundColor: '#E8F5E9' },
  estadoPendiente: { backgroundColor: '#FFF8E1' },
  textoEstado: { fontSize: 12, fontWeight: 'bold' },
  textoCompletada: { color: '#2E7D32' },
  textoPendiente: { color: '#F57F17' },
  sinTareas: { alignItems: 'center', padding: 40 },
  textoSinTareas: { color: '#9E9E9E', fontSize: 14, marginTop: 12 },
});

export default TareasScreen;
