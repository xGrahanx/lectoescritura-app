/**
 * EscrituraScreen.jsx - Módulo de Escritura
 *
 * Carga los ejercicios de escritura desde el backend.
 * Permite filtrar por tipo y nivel.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';

const ICONO_TIPO  = { dictado: 'microphone', completar: 'format-text', libre: 'pencil-box', copia: 'content-copy' };
const COLOR_TIPO  = { dictado: '#E91E63', completar: '#FF9800', libre: '#4CAF50', copia: '#9C27B0' };
const COLOR_NIVEL = { basico: '#4CAF50', intermedio: '#FF9800', avanzado: '#F44336' };

const EscrituraScreen = ({ navigation }) => {
  const [ejercicios, setEjercicios]   = useState([]);
  const [filtroTipo, setFiltroTipo]   = useState('todos');
  const [cargando, setCargando]       = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarEjercicios = useCallback(async () => {
    try {
      const params = filtroTipo !== 'todos' ? { tipo: filtroTipo } : {};
      const { data } = await axios.get(`${API_CONFIG.BASE_URL}/ejercicios`, {
        params,
        timeout: API_CONFIG.TIMEOUT,
      });
      setEjercicios(data);
    } catch (error) {
      console.error('Error al cargar ejercicios:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [filtroTipo]);

  useEffect(() => { cargarEjercicios(); }, [cargarEjercicios]);

  const onRefrescar = () => { setRefrescando(true); cargarEjercicios(); };

  const renderEjercicio = ({ item }) => {
    const color = COLOR_TIPO[item.tipo] || '#9E9E9E';
    const icono = ICONO_TIPO[item.tipo] || 'pencil';
    const colorNivel = COLOR_NIVEL[item.nivel] || '#9E9E9E';

    return (
      <TouchableOpacity
        style={styles.tarjeta}
        onPress={() => navigation.navigate('EjercicioEscritura', { ejercicioId: item.id })}
      >
        <View style={[styles.iconoContenedor, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icono} size={28} color={color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          {item.descripcion ? (
            <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
          ) : null}
          <View style={styles.pie}>
            <View style={[styles.etiquetaTipo, { backgroundColor: color + '15' }]}>
              <Text style={[styles.textoTipo, { color }]}>
                {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
              </Text>
            </View>
            <View style={[styles.etiquetaNivel, { backgroundColor: colorNivel + '15' }]}>
              <Text style={[styles.textoNivel, { color: colorNivel }]}>
                {item.nivel.charAt(0).toUpperCase() + item.nivel.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#BDBDBD" />
      </TouchableOpacity>
    );
  };

  const tipos = ['todos', 'dictado', 'completar', 'libre', 'copia'];
  const etiquetasTipos = { todos: 'Todos', dictado: 'Dictado', completar: 'Completar', libre: 'Libre', copia: 'Copia' };

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
            style={[styles.botonFiltro, filtroTipo === tipo && styles.botonFiltroActivo]}
            onPress={() => setFiltroTipo(tipo)}
          >
            <Text style={[styles.textoFiltro, filtroTipo === tipo && styles.textoFiltroActivo]}>
              {etiquetasTipos[tipo]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.textoCargando}>Cargando ejercicios...</Text>
        </View>
      ) : (
        <FlatList
          data={ejercicios}
          renderItem={renderEjercicio}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefrescar} />}
          ListEmptyComponent={
            <View style={styles.sinResultados}>
              <MaterialCommunityIcons name="pencil-off" size={40} color="#BDBDBD" />
              <Text style={styles.textoSinResultados}>
                No hay ejercicios disponibles aún
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
  tituloModulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  subtitulo: { fontSize: 13, color: '#757575', marginTop: 2 },
  filtros: { flexDirection: 'row', padding: 16, flexWrap: 'wrap' },
  botonFiltro: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0',
    marginRight: 8, marginBottom: 4,
  },
  botonFiltroActivo: { backgroundColor: '#E91E63', borderColor: '#E91E63' },
  textoFiltro: { fontSize: 12, color: '#757575' },
  textoFiltroActivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20, paddingTop: 8 },
  tarjeta: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', elevation: 2, marginBottom: 12,
  },
  iconoContenedor: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  info: { flex: 1 },
  titulo: { fontSize: 15, fontWeight: '600', color: '#212121', marginBottom: 2 },
  descripcion: { fontSize: 12, color: '#9E9E9E', marginBottom: 6, lineHeight: 18 },
  pie: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  etiquetaTipo: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  textoTipo: { fontSize: 11, fontWeight: '600' },
  etiquetaNivel: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  textoNivel: { fontSize: 11, fontWeight: '600' },
  sinResultados: { alignItems: 'center', padding: 40 },
  textoSinResultados: { color: '#9E9E9E', fontSize: 14, marginTop: 12, textAlign: 'center' },
});

export default EscrituraScreen;
