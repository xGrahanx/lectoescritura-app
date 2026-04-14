/**
 * GestionGruposScreen.jsx - Gestion de grupos/secciones
 *
 * El administrador puede:
 * - Ver todos los grupos con su docente asignado y cantidad de estudiantes
 * - Crear nuevos grupos
 * - Editar el nombre o docente de un grupo
 * - Eliminar grupos (soft delete)
 * - Navegar al detalle para agregar/quitar estudiantes
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';

const GestionGruposScreen = ({ navigation }) => {
  const [grupos, setGrupos]     = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarGrupos = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await axios.get(`${API_CONFIG.BASE_URL}/grupos`, {
        timeout: API_CONFIG.TIMEOUT,
      });
      setGrupos(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los grupos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarGrupos();
    const unsubscribe = navigation.addListener('focus', cargarGrupos);
    return unsubscribe;
  }, [navigation, cargarGrupos]);

  const eliminarGrupo = (grupo) => {
    Alert.alert(
      'Eliminar grupo',
      `Estas seguro de eliminar el grupo "${grupo.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_CONFIG.BASE_URL}/grupos/${grupo.id}`, {
                timeout: API_CONFIG.TIMEOUT,
              });
              setGrupos(prev => prev.filter(g => g.id !== grupo.id));
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el grupo.');
            }
          },
        },
      ]
    );
  };

  const renderGrupo = ({ item }) => (
    <TouchableOpacity
      style={styles.tarjeta}
      onPress={() => navigation.navigate('DetalleGrupo', { grupo: item })}
    >
      <View style={styles.iconoGrupo}>
        <MaterialCommunityIcons name="account-group" size={26} color="#6A1B9A" />
      </View>
      <View style={styles.info}>
        <Text style={styles.nombreGrupo}>{item.nombre}</Text>
        <View style={styles.filaDocente}>
          <MaterialCommunityIcons name="account-tie" size={13} color="#9E9E9E" />
          <Text style={styles.textoDocente}>
            {' '}{item.docente.nombre} {item.docente.apellido}
          </Text>
        </View>
        <View style={styles.filaEstudiantes}>
          <MaterialCommunityIcons name="account-multiple" size={13} color="#4A90D9" />
          <Text style={styles.textoEstudiantes}>
            {' '}{item._count.estudiantes} estudiantes
          </Text>
        </View>
      </View>
      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.botonEditar}
          onPress={() => navigation.navigate('EditarGrupo', { grupo: item })}
        >
          <MaterialCommunityIcons name="pencil" size={18} color="#1A237E" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botonEliminar}
          onPress={() => eliminarGrupo(item)}
        >
          <MaterialCommunityIcons name="delete" size={18} color="#F44336" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Gestion de Grupos</Text>
        <Text style={styles.subtitulo}>{grupos.length} grupos registrados</Text>
      </View>

      <TouchableOpacity
        style={styles.botonCrear}
        onPress={() => navigation.navigate('CrearGrupo')}
      >
        <MaterialCommunityIcons name="plus-circle" size={20} color="#FFFFFF" />
        <Text style={styles.textoBotonCrear}>  Crear nuevo grupo</Text>
      </TouchableOpacity>

      {cargando ? (
        <View style={styles.cargando}>
          <ActivityIndicator size="large" color="#6A1B9A" />
          <Text style={styles.textoCargando}>Cargando grupos...</Text>
        </View>
      ) : (
        <FlatList
          data={grupos}
          renderItem={renderGrupo}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.sinResultados}>
              <MaterialCommunityIcons name="account-group" size={48} color="#BDBDBD" />
              <Text style={styles.textoSinResultados}>No hay grupos creados aun</Text>
              <Text style={styles.subTextoSinResultados}>Crea el primer grupo con el boton de arriba</Text>
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
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1A237E' },
  subtitulo: { fontSize: 13, color: '#757575', marginTop: 2 },
  botonCrear: {
    backgroundColor: '#6A1B9A', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', margin: 16, borderRadius: 12, padding: 14,
  },
  textoBotonCrear: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20 },
  tarjeta: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', elevation: 2, marginBottom: 12,
  },
  iconoGrupo: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#F3E5F5', justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  info: { flex: 1 },
  nombreGrupo: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 4 },
  filaDocente: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  textoDocente: { fontSize: 12, color: '#757575' },
  filaEstudiantes: { flexDirection: 'row', alignItems: 'center' },
  textoEstudiantes: { fontSize: 12, color: '#4A90D9', fontWeight: '600' },
  acciones: { flexDirection: 'row' },
  botonEditar: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', marginLeft: 6,
  },
  botonEliminar: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginLeft: 6,
  },
  cargando: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textoCargando: { color: '#9E9E9E', marginTop: 12 },
  sinResultados: { alignItems: 'center', padding: 40 },
  textoSinResultados: { color: '#757575', fontSize: 16, fontWeight: '600', marginTop: 16 },
  subTextoSinResultados: { color: '#9E9E9E', fontSize: 13, marginTop: 6 },
});

export default GestionGruposScreen;
