/**
 * GestionUsuariosScreen.jsx - Gestion de usuarios del sistema
 *
 * El administrador puede ver, activar/desactivar y eliminar usuarios.
 * Tambien puede aprobar nuevos registros pendientes de validacion.
 */

import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const USUARIOS_EJEMPLO = [
  { id: 1, nombre: 'Ana Garcia', correo: 'ana@escuela.edu', rol: 'estudiante', activo: true, pendiente: false },
  { id: 2, nombre: 'Prof. Maria Gonzalez', correo: 'mgonzalez@escuela.edu', rol: 'docente', activo: true, pendiente: false },
  { id: 3, nombre: 'Carlos Lopez', correo: 'carlos@escuela.edu', rol: 'estudiante', activo: true, pendiente: false },
  { id: 4, nombre: 'Prof. Roberto Silva', correo: 'rsilva@escuela.edu', rol: 'docente', activo: false, pendiente: false },
  { id: 5, nombre: 'Nuevo Estudiante', correo: 'nuevo@escuela.edu', rol: 'estudiante', activo: false, pendiente: true },
];

const colorRol = { estudiante: '#4A90D9', docente: '#2E7D32', administrador: '#6A1B9A' };
const iconoRol = { estudiante: 'school', docente: 'account-tie', administrador: 'shield-account' };

const GestionUsuariosScreen = ({ navigation }) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [usuarios, setUsuarios] = useState(USUARIOS_EJEMPLO);

  const usuariosFiltrados = usuarios.filter(u => {
    const coincideBusqueda = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || u.correo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === 'todos' || u.rol === filtroRol;
    return coincideBusqueda && coincideRol;
  });

  const toggleActivarUsuario = (id) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !u.activo, pendiente: false } : u));
  };

  const eliminarUsuario = (usuario) => {
    Alert.alert(
      'Eliminar usuario',
      `Estas seguro de eliminar a ${usuario.nombre}? Esta accion no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => setUsuarios(prev => prev.filter(u => u.id !== usuario.id)) },
      ]
    );
  };

  const pendientes = usuarios.filter(u => u.pendiente).length;

  const renderUsuario = ({ item }) => (
    <View style={[styles.tarjeta, item.pendiente && styles.tarjetaPendiente]}>
      {item.pendiente && (
        <View style={styles.etiquetaPendiente}>
          <Text style={styles.textoPendiente}>Pendiente de aprobacion</Text>
        </View>
      )}
      <View style={styles.contenidoTarjeta}>
        <View style={[styles.avatar, { backgroundColor: colorRol[item.rol] + '20' }]}>
          <MaterialCommunityIcons name={iconoRol[item.rol]} size={22} color={colorRol[item.rol]} />
        </View>
        <View style={styles.info}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.correo}>{item.correo}</Text>
          <View style={[styles.etiquetaRol, { backgroundColor: colorRol[item.rol] + '15' }]}>
            <Text style={[styles.textoRol, { color: colorRol[item.rol] }]}>
              {item.rol.charAt(0).toUpperCase() + item.rol.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.acciones}>
          <TouchableOpacity
            style={[styles.botonAccion, { backgroundColor: item.activo ? '#E8F5E9' : '#FFEBEE' }]}
            onPress={() => toggleActivarUsuario(item.id)}
          >
            <MaterialCommunityIcons name={item.activo ? 'check-circle' : 'close-circle'} size={20} color={item.activo ? '#4CAF50' : '#F44336'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botonAccion, { backgroundColor: '#FFEBEE' }]} onPress={() => eliminarUsuario(item)}>
            <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="account-multiple" size={24} color="#1A237E" />
          <Text style={styles.titulo}> Gestion de Usuarios</Text>
        </View>
        {pendientes > 0 && (
          <View style={styles.badgePendientes}>
            <Text style={styles.textoBadge}>{pendientes} pendientes</Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.botonCrear} onPress={() => navigation.navigate('CrearUsuario')}>
        <MaterialCommunityIcons name="account-plus" size={20} color="#FFFFFF" />
        <Text style={styles.textoBotonCrear}>  Crear nuevo usuario</Text>
      </TouchableOpacity>
      <View style={styles.busquedaContenedor}>
        <MaterialCommunityIcons name="magnify" size={20} color="#9E9E9E" />
        <TextInput style={styles.inputBusqueda} placeholder="Buscar por nombre o correo..." value={busqueda} onChangeText={setBusqueda} placeholderTextColor="#BDBDBD" />
      </View>
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
      <FlatList
        data={usuariosFiltrados}
        renderItem={renderUsuario}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  tituloRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1A237E' },
  badgePendientes: { backgroundColor: '#FF9800', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  textoBadge: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  botonCrear: { backgroundColor: '#6A1B9A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, borderRadius: 12, padding: 12 },
  textoBotonCrear: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  busquedaContenedor: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, paddingHorizontal: 14, elevation: 2 },
  inputBusqueda: { flex: 1, height: 44, fontSize: 15, color: '#212121', marginLeft: 8 },
  filtros: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, flexWrap: 'wrap' },
  botonFiltro: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' },
  botonFiltroActivo: { backgroundColor: '#6A1B9A', borderColor: '#6A1B9A' },
  textoFiltro: { fontSize: 12, color: '#757575' },
  textoFiltroActivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20, paddingTop: 8 },
  tarjeta: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, elevation: 2, marginBottom: 12 },
  tarjetaPendiente: { borderWidth: 1, borderColor: '#FF9800' },
  etiquetaPendiente: { backgroundColor: '#FFF8E1', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  textoPendiente: { fontSize: 11, color: '#F57F17', fontWeight: 'bold' },
  contenidoTarjeta: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  nombre: { fontSize: 14, fontWeight: '600', color: '#212121' },
  correo: { fontSize: 12, color: '#9E9E9E', marginTop: 1 },
  etiquetaRol: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  textoRol: { fontSize: 11, fontWeight: 'bold' },
  acciones: { flexDirection: 'row' },
  botonAccion: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});

export default GestionUsuariosScreen;
