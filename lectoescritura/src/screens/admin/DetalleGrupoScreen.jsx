/**
 * DetalleGrupoScreen.jsx - Detalle de un grupo con gestion de estudiantes
 *
 * El admin puede ver los estudiantes del grupo y agregar o quitar estudiantes.
 * Muestra la lista de estudiantes disponibles (sin grupo o de otros grupos).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, SectionList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';

const DetalleGrupoScreen = ({ route, navigation }) => {
  const { grupo: grupoInicial } = route.params;
  const [grupo, setGrupo]                   = useState(grupoInicial);
  const [todosEstudiantes, setTodosEstudiantes] = useState([]);
  const [cargando, setCargando]             = useState(true);
  const [tab, setTab]                       = useState('miembros'); // 'miembros' | 'agregar'

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resGrupo, resEstudiantes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}/grupos/${grupo.id}`, { timeout: API_CONFIG.TIMEOUT }),
        axios.get(`${API_CONFIG.BASE_URL}/usuarios/estudiantes`, { timeout: API_CONFIG.TIMEOUT }),
      ]);
      setGrupo(resGrupo.data);
      setTodosEstudiantes(resEstudiantes.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los datos.');
    } finally {
      setCargando(false);
    }
  }, [grupo.id]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // IDs de estudiantes que ya estan en el grupo
  const idsEnGrupo = new Set(grupo.estudiantes?.map(ge => ge.estudianteId) || []);

  // Estudiantes que NO estan en el grupo (disponibles para agregar)
  const estudiantesDisponibles = todosEstudiantes.filter(e => !idsEnGrupo.has(e.id));

  const agregarEstudiante = async (estudianteId) => {
    try {
      await axios.post(
        `${API_CONFIG.BASE_URL}/grupos/${grupo.id}/estudiantes`,
        { estudianteId },
        { timeout: API_CONFIG.TIMEOUT }
      );
      await cargarDatos();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.mensaje || 'No se pudo agregar el estudiante.');
    }
  };

  const quitarEstudiante = (estudiante) => {
    Alert.alert(
      'Quitar estudiante',
      `Quitar a ${estudiante.nombre} ${estudiante.apellido} del grupo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(
                `${API_CONFIG.BASE_URL}/grupos/${grupo.id}/estudiantes/${estudiante.id}`,
                { timeout: API_CONFIG.TIMEOUT }
              );
              await cargarDatos();
            } catch {
              Alert.alert('Error', 'No se pudo quitar el estudiante.');
            }
          },
        },
      ]
    );
  };

  const renderMiembro = ({ item }) => {
    const est = item.estudiante;
    return (
      <View style={styles.tarjetaEstudiante}>
        <View style={styles.avatar}>
          <Text style={styles.inicial}>{est.nombre.charAt(0)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.nombre}>{est.nombre} {est.apellido}</Text>
          <Text style={styles.correo}>{est.correo}</Text>
        </View>
        <TouchableOpacity style={styles.botonQuitar} onPress={() => quitarEstudiante(est)}>
          <MaterialCommunityIcons name="account-minus" size={18} color="#F44336" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDisponible = ({ item }) => (
    <View style={styles.tarjetaEstudiante}>
      <View style={[styles.avatar, { backgroundColor: '#E8F5E9' }]}>
        <Text style={[styles.inicial, { color: '#2E7D32' }]}>{item.nombre.charAt(0)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
        <Text style={styles.correo}>{item.grado || 'Sin grado'}</Text>
      </View>
      <TouchableOpacity style={styles.botonAgregar} onPress={() => agregarEstudiante(item.id)}>
        <MaterialCommunityIcons name="account-plus" size={18} color="#2E7D32" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      <View style={styles.barraTop}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
        </TouchableOpacity>
        <Text style={styles.tituloBar} numberOfLines={1}>{grupo.nombre}</Text>
        <View />
      </View>

      {/* Info del grupo */}
      <View style={styles.infoGrupo}>
        <View style={styles.filaInfo}>
          <MaterialCommunityIcons name="account-tie" size={16} color="#6A1B9A" />
          <Text style={styles.textoInfoGrupo}>
            {' '}Docente: {grupo.docente?.nombre} {grupo.docente?.apellido}
          </Text>
        </View>
        <View style={styles.filaInfo}>
          <MaterialCommunityIcons name="account-multiple" size={16} color="#4A90D9" />
          <Text style={styles.textoInfoGrupo}>
            {' '}{grupo.estudiantes?.length || 0} estudiantes en el grupo
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'miembros' && styles.tabActivo]}
          onPress={() => setTab('miembros')}
        >
          <Text style={[styles.textoTab, tab === 'miembros' && styles.textoTabActivo]}>
            Miembros ({grupo.estudiantes?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'agregar' && styles.tabActivo]}
          onPress={() => setTab('agregar')}
        >
          <Text style={[styles.textoTab, tab === 'agregar' && styles.textoTabActivo]}>
            Agregar ({estudiantesDisponibles.length})
          </Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <View style={styles.cargando}>
          <ActivityIndicator size="large" color="#6A1B9A" />
        </View>
      ) : tab === 'miembros' ? (
        <FlatList
          data={grupo.estudiantes || []}
          renderItem={renderMiembro}
          keyExtractor={item => item.estudianteId.toString()}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.sinResultados}>
              <MaterialCommunityIcons name="account-multiple-outline" size={40} color="#BDBDBD" />
              <Text style={styles.textoSinResultados}>No hay estudiantes en este grupo</Text>
              <Text style={styles.subTextoSinResultados}>Usa la pestana "Agregar" para incluir estudiantes</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={estudiantesDisponibles}
          renderItem={renderDisponible}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.sinResultados}>
              <MaterialCommunityIcons name="check-circle" size={40} color="#4CAF50" />
              <Text style={styles.textoSinResultados}>Todos los estudiantes ya estan en el grupo</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  barraTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', padding: 16, paddingTop: 50, elevation: 2,
  },
  tituloBar: { fontSize: 16, fontWeight: 'bold', color: '#212121', flex: 1, marginHorizontal: 12 },
  infoGrupo: { backgroundColor: '#FFFFFF', padding: 16, marginBottom: 4 },
  filaInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  textoInfoGrupo: { fontSize: 13, color: '#424242' },
  tabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActivo: { borderBottomColor: '#6A1B9A' },
  textoTab: { fontSize: 14, color: '#9E9E9E' },
  textoTabActivo: { color: '#6A1B9A', fontWeight: 'bold' },
  lista: { padding: 16, paddingBottom: 20 },
  tarjetaEstudiante: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', elevation: 1, marginBottom: 10,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  inicial: { fontSize: 16, fontWeight: 'bold', color: '#1565C0' },
  info: { flex: 1 },
  nombre: { fontSize: 14, fontWeight: '600', color: '#212121' },
  correo: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  botonQuitar: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center' },
  botonAgregar: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  cargando: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sinResultados: { alignItems: 'center', padding: 40 },
  textoSinResultados: { color: '#757575', fontSize: 15, fontWeight: '600', marginTop: 16 },
  subTextoSinResultados: { color: '#9E9E9E', fontSize: 12, marginTop: 6, textAlign: 'center' },
});

export default DetalleGrupoScreen;
