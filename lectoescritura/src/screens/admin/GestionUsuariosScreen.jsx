/**
 * GestionUsuariosScreen.jsx - Gestion de usuarios del sistema
 *
 * Carga los usuarios desde el backend real (PostgreSQL via API REST).
 * Permite activar/desactivar y eliminar usuarios.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';

const colorRol = { estudiante: '#4A90D9', docente: '#2E7D32', administrador: '#6A1B9A' };
const iconoRol  = { estudiante: 'school', docente: 'account-tie', administrador: 'shield-account' };

const GestionUsuariosScreen = ({ navigation }) => {
  const [usuarios, setUsuarios]     = useState([]);
  const [busqueda, setBusqueda]     = useState('');
  const [filtroRol, setFiltroRol]   = useState('todos');
  const [cargando, setCargando]     = useState(true);

  // ── Cargar usuarios desde el backend ────────────────────────────────────────
  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await axios.get(`${API_CONFIG.BASE_URL}/usuarios`, {
        timeout: API_CONFIG.TIMEOUT,
      });
      setUsuarios(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios. Verifica la conexion.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
    // Recargar al volver de CrearUsuario
    const unsubscribe = navigation.addListener('focus', cargarUsuarios);
    return unsubscribe;
  }, [navigation, cargarUsuarios]);

  // ── Eliminar usuario ─────────────────────────────────────────────────────────
  const eliminarUsuario = (usuario) => {
    Alert.alert(
      'Eliminar usuario',
      `Estas seguro de eliminar a ${usuario.nombre} ${usuario.apellido}? Esta accion no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_CONFIG.BASE_URL}/usuarios/${usuario.id}`, {
                timeout: API_CONFIG.TIMEOUT,
              });
              setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el usuario.');
            }
          },
        },
      ]
    );
  };

  // ── Filtrar lista ────────────────────────────────────────────────────────────
  const usuariosFiltrados = usuarios.filter(u => {
    const coincideBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === 'todos' || u.rol === filtroRol;
    return coincideBusqueda && coincideRol;
  });

  // ── Render de cada tarjeta ───────────────────────────────────────────────────
  const renderUsuario = ({ item }) => (
    <View style={styles.tarjeta}>
      <View style={styles.contenidoTarjeta}>
        <View style={[styles.avatar, { backgroundColor: (colorRol[item.rol] || '#9E9E9E') + '20' }]}>
          <MaterialCommunityIcons
            name={iconoRol[item.rol] || 'account'}
            size={22}
            color={colorRol[item.rol] || '#9E9E9E'}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
          <Text style={styles.correo}>{item.correo}</Text>
          {item.grado && <Text style={styles.grado}>{item.grado}</Text>}
          <View style={[styles.etiquetaRol, { backgroundColor: (colorRol[item.rol] || '#9E9E9E') + '15' }]}>
            <Text style={[styles.textoRol, { color: colorRol[item.rol] || '#9E9E9E' }]}>
              {item.rol.charAt(0).toUpperCase() + item.rol.slice(1)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.botonEliminar}
          onPress={() => eliminarUsuario(item)}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botonEditar}
          onPress={() => navigation.navigate('EditarUsuario', { usuario: item })}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#1A237E" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Gestion de Usuarios</Text>
        <Text style={styles.subtitulo}>{usuarios.length} usuarios registrados</Text>
      </View>

      {/* Boton crear */}
      <TouchableOpacity
        style={styles.botonCrear}
        onPress={() => navigation.navigate('CrearUsuario')}
      >
        <MaterialCommunityIcons name="account-plus" size={20} color="#FFFFFF" />
        <Text style={styles.textoBotonCrear}>  Crear nuevo usuario</Text>
      </TouchableOpacity>

      {/* Busqueda */}
      <View style={styles.busquedaContenedor}>
        <MaterialCommunityIcons name="magnify" size={20} color="#9E9E9E" />
        <TextInput
          style={styles.inputBusqueda}
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChangeText={setBusqueda}
          placeholderTextColor="#BDBDBD"
        />
      </View>

      {/* Filtros */}
      <View style={styles.filtros}>
        {['todos', 'estudiante', 'docente', 'administrador'].map(rol => (
          <TouchableOpacity
            key={rol}
            style={[styles.botonFiltro, filtroRol === rol && styles.botonFiltroActivo]}
            onPress={() => setFiltroRol(rol)}
          >
            <Text style={[styles.textoFiltro, filtroRol === rol && styles.textoFiltroActivo]}>
              {rol.charAt(0).toUpperCase() + rol.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {cargando ? (
        <View style={styles.cargando}>
          <ActivityIndicator size="large" color="#6A1B9A" />
          <Text style={styles.textoCargando}>Cargando usuarios...</Text>
        </View>
      ) : (
        <FlatList
          data={usuariosFiltrados}
          renderItem={renderUsuario}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <View style={styles.sinResultados}>
              <MaterialCommunityIcons name="account-search" size={40} color="#BDBDBD" />
              <Text style={styles.textoSinResultados}>No se encontraron usuarios</Text>
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
  busquedaContenedor: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginBottom: 8, borderRadius: 12, paddingHorizontal: 14, elevation: 2,
  },
  inputBusqueda: { flex: 1, height: 44, fontSize: 15, color: '#212121', marginLeft: 8 },
  filtros: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, flexWrap: 'wrap' },
  botonFiltro: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', marginRight: 6, marginBottom: 6,
  },
  botonFiltroActivo: { backgroundColor: '#6A1B9A', borderColor: '#6A1B9A' },
  textoFiltro: { fontSize: 12, color: '#757575' },
  textoFiltroActivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20 },
  tarjeta: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, elevation: 2, marginBottom: 12 },
  contenidoTarjeta: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  nombre: { fontSize: 14, fontWeight: '600', color: '#212121' },
  correo: { fontSize: 12, color: '#9E9E9E', marginTop: 1 },
  grado: { fontSize: 11, color: '#4A90D9', marginTop: 1 },
  etiquetaRol: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  textoRol: { fontSize: 11, fontWeight: 'bold' },
  botonEliminar: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  botonEditar: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  cargando: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textoCargando: { color: '#9E9E9E', marginTop: 12 },
  sinResultados: { alignItems: 'center', padding: 40 },
  textoSinResultados: { color: '#9E9E9E', fontSize: 14, marginTop: 12 },
});

export default GestionUsuariosScreen;
