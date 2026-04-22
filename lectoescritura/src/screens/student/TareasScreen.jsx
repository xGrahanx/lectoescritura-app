/**
 * TareasScreen.jsx - Pantalla de tareas asignadas por el docente
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';

const TareasScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const [tareas, setTareas]       = useState([]);
  const [filtro, setFiltro]       = useState('todas');
  const [cargando, setCargando]   = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarTareas = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API_CONFIG.BASE_URL}/tareas/estudiante/${usuario.id}`,
        { timeout: API_CONFIG.TIMEOUT }
      );
      setTareas(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las tareas. Verifica tu conexión.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [usuario.id]);

  useEffect(() => {
    cargarTareas();
    const unsubscribe = navigation.addListener('focus', cargarTareas);
    return unsubscribe;
  }, [navigation, cargarTareas]);

  const onRefrescar = () => {
    setRefrescando(true);
    cargarTareas();
  };

  // Navegar a la pantalla correcta según el tipo de tarea
  const abrirTarea = (tarea) => {
    if (tarea.estado === 'completada') {
      Alert.alert('Tarea completada', 'Ya completaste esta tarea.');
      return;
    }
    if (tarea.estado === 'vencida') {
      Alert.alert('Tarea vencida', 'El plazo de esta tarea ha expirado.');
      return;
    }
    switch (tarea.tipo) {
      case 'lectura':
        navigation.navigate('Lectura', {
          screen: 'EjercicioLectura',
          params: { textoId: tarea.texto_id, tareaId: tarea.id },
        });
        break;
      case 'escritura':
        navigation.navigate('Escritura', {
          screen: 'EjercicioEscritura',
          params: { ejercicioId: tarea.ejercicio_id, tareaId: tarea.id, tarea },
        });
        break;
      case 'ia':
        navigation.navigate('EjerciciosIA', { tareaId: tarea.id });
        break;
      case 'especial':
        navigation.navigate('Escritura', {
          screen: 'EjercicioEscritura',
          params: { tareaId: tarea.id, tarea },
        });
        break;
      default:
        Alert.alert('Tarea', tarea.descripcion);
    }
  };

  const tareasFiltradas = filtro === 'todas'
    ? tareas
    : tareas.filter(t => t.estado === filtro);

  const iconoTipo  = { lectura: 'book-open-variant', escritura: 'pencil', especial: 'star', ia: 'robot' };
  const colorTipo  = { lectura: '#4A90D9', escritura: '#E91E63', especial: '#FF9800', ia: '#9C27B0' };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderTarea = ({ item }) => (
    <TouchableOpacity
      style={[styles.tarjeta, item.estado === 'completada' && styles.tarjetaCompletada]}
      onPress={() => abrirTarea(item)}
      activeOpacity={0.8}
    >
      {item.es_avanzada && (
        <View style={styles.etiquetaAvanzada}>
          <MaterialCommunityIcons name="star" size={12} color="#FFFFFF" />
          <Text style={styles.textoAvanzada}> Alto rendimiento</Text>
        </View>
      )}
      <View style={styles.contenidoTarjeta}>
        <View style={[styles.iconoContenedor, { backgroundColor: (colorTipo[item.tipo] || '#9E9E9E') + '20' }]}>
          <MaterialCommunityIcons name={iconoTipo[item.tipo] || 'clipboard'} size={24} color={colorTipo[item.tipo] || '#9E9E9E'} />
        </View>
        <View style={styles.infoTarea}>
          <Text style={styles.tituloTarea}>{item.titulo}</Text>
          <Text style={styles.descripcionTarea} numberOfLines={2}>{item.descripcion}</Text>
          {item.docente && (
            <View style={styles.pieTarea}>
              <MaterialCommunityIcons name="account-tie" size={13} color="#9E9E9E" />
              <Text style={styles.textoDocente}> {item.docente.nombre} {item.docente.apellido}</Text>
            </View>
          )}
          <View style={styles.pieTarea}>
            <MaterialCommunityIcons name="calendar" size={13} color="#9E9E9E" />
            <Text style={styles.textoFecha}> Límite: {formatearFecha(item.fecha_limite)}</Text>
          </View>
        </View>
      </View>
      <View style={[
        styles.estadoContenedor,
        item.estado === 'completada' ? styles.estadoCompletada
          : item.estado === 'vencida' ? styles.estadoVencida
          : styles.estadoPendiente,
      ]}>
        <Text style={[
          styles.textoEstado,
          item.estado === 'completada' ? styles.textoCompletada
            : item.estado === 'vencida' ? styles.textoVencida
            : styles.textoPendiente,
        ]}>
          {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
        </Text>
      </View>
      {item.estado === 'pendiente' && (
        <MaterialCommunityIcons name="chevron-right" size={20} color="#BDBDBD" style={{ alignSelf: 'flex-end' }} />
      )}
    </TouchableOpacity>
  );

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.textoCargando}>Cargando tareas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Mis Tareas</Text>
        <Text style={styles.subtitulo}>Tareas asignadas por tu docente</Text>
      </View>

      <View style={styles.filtros}>
        {['todas', 'pendiente', 'completada', 'vencida'].map(f => (
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
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefrescar} />}
        ListEmptyComponent={
          <View style={styles.sinTareas}>
            <MaterialCommunityIcons name="check-all" size={40} color="#4CAF50" />
            <Text style={styles.textoSinTareas}>No hay tareas en esta categoría</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F9FF' },
  textoCargando: { color: '#9E9E9E', marginTop: 12 },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  subtitulo: { fontSize: 13, color: '#757575', marginTop: 2 },
  filtros: { flexDirection: 'row', padding: 16, flexWrap: 'wrap' },
  botonFiltro: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', marginRight: 8, marginBottom: 4,
  },
  botonFiltroActivo: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  textoFiltro: { fontSize: 13, color: '#757575' },
  textoFiltroActivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20, paddingTop: 8 },
  tarjeta: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    elevation: 2, overflow: 'hidden', marginBottom: 12,
  },
  tarjetaCompletada: { opacity: 0.7 },
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
  estadoVencida: { backgroundColor: '#FFEBEE' },
  textoEstado: { fontSize: 12, fontWeight: 'bold' },
  textoCompletada: { color: '#2E7D32' },
  textoPendiente: { color: '#F57F17' },
  textoVencida: { color: '#F44336' },
  sinTareas: { alignItems: 'center', padding: 40 },
  textoSinTareas: { color: '#9E9E9E', fontSize: 14, marginTop: 12 },
});

export default TareasScreen;
