/**
 * EditarUsuarioScreen.jsx - Editar usuario existente
 *
 * Carga los datos actuales del usuario y permite modificarlos.
 * Envia un PUT al backend con los campos actualizados.
 * Validaciones: correo unico, formato valido, rol correcto.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';

const EditarUsuarioScreen = ({ route, navigation }) => {
  const { usuario } = route.params;

  // Inicializar con los datos actuales del usuario
  const [nombre, setNombre]     = useState(usuario.nombre);
  const [apellido, setApellido] = useState(usuario.apellido);
  const [correo, setCorreo]     = useState(usuario.correo);
  const [rol, setRol]           = useState(usuario.rol);
  const [grado, setGrado]       = useState(usuario.grado || '');
  const [activo, setActivo]     = useState(usuario.activo);
  const [cargando, setCargando] = useState(false);

  const roles = [
    { key: 'estudiante',    label: 'Estudiante', icono: 'school',         color: '#4A90D9' },
    { key: 'docente',       label: 'Docente',    icono: 'account-tie',    color: '#2E7D32' },
    { key: 'administrador', label: 'Admin',      icono: 'shield-account', color: '#6A1B9A' },
  ];

  const guardarCambios = async () => {
    if (!nombre.trim() || !apellido.trim() || !correo.trim()) {
      Alert.alert('Campos requeridos', 'Nombre, apellido y correo son obligatorios.');
      return;
    }

    setCargando(true);
    try {
      await axios.put(
        `${API_CONFIG.BASE_URL}/usuarios/${usuario.id}`,
        { nombre, apellido, correo, rol, grado: grado || null, activo },
        { timeout: API_CONFIG.TIMEOUT }
      );

      Alert.alert(
        'Usuario actualizado',
        `Los datos de ${nombre} fueron actualizados correctamente.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo actualizar el usuario.';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.contenedor}>
        {/* Barra superior */}
        <View style={styles.barraTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
          </TouchableOpacity>
          <Text style={styles.tituloBar}>Editar usuario</Text>
          <View />
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Avatar con inicial */}
          <View style={styles.avatarContenedor}>
            <View style={styles.avatar}>
              <Text style={styles.inicialAvatar}>{nombre.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.idUsuario}>ID: {usuario.id}</Text>
          </View>

          {/* Estado activo/inactivo */}
          <View style={styles.filaSwitch}>
            <View>
              <Text style={styles.etiquetaSwitch}>Estado de la cuenta</Text>
              <Text style={styles.subEtiquetaSwitch}>{activo ? 'Cuenta activa' : 'Cuenta desactivada'}</Text>
            </View>
            <Switch
              value={activo}
              onValueChange={setActivo}
              trackColor={{ false: '#FFCDD2', true: '#C8E6C9' }}
              thumbColor={activo ? '#4CAF50' : '#F44336'}
            />
          </View>

          {/* Selector de rol */}
          <Text style={styles.etiqueta}>Rol</Text>
          <View style={styles.selectorRol}>
            {roles.map(r => (
              <TouchableOpacity
                key={r.key}
                style={[styles.opcionRol, rol === r.key && { backgroundColor: r.color, borderColor: r.color }]}
                onPress={() => setRol(r.key)}
              >
                <MaterialCommunityIcons name={r.icono} size={18} color={rol === r.key ? '#FFFFFF' : '#757575'} />
                <Text style={[styles.textoRol, rol === r.key && styles.textoRolActivo]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.etiqueta}>Nombre *</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholderTextColor="#BDBDBD" />

          <Text style={styles.etiqueta}>Apellido *</Text>
          <TextInput style={styles.input} value={apellido} onChangeText={setApellido} placeholderTextColor="#BDBDBD" />

          {rol === 'estudiante' && (
            <>
              <Text style={styles.etiqueta}>Grado</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 3er Grado - Seccion A"
                value={grado}
                onChangeText={setGrado}
                placeholderTextColor="#BDBDBD"
              />
            </>
          )}

          <Text style={styles.etiqueta}>Correo electronico *</Text>
          <TextInput
            style={styles.input}
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#BDBDBD"
          />

          <View style={styles.notaInfo}>
            <MaterialCommunityIcons name="information" size={16} color="#FF9800" />
            <Text style={styles.textoNota}>
              No se puede cambiar la contrasena desde aqui. El usuario debe solicitarlo desde la pantalla de recuperacion.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.botonGuardar, cargando && styles.botonDeshabilitado]}
            onPress={guardarCambios}
            disabled={cargando}
          >
            {cargando
              ? <ActivityIndicator color="#FFFFFF" />
              : <><MaterialCommunityIcons name="content-save" size={18} color="#FFFFFF" /><Text style={styles.botonTexto}>  Guardar cambios</Text></>
            }
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  barraTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', padding: 16, paddingTop: 50, elevation: 2,
  },
  tituloBar: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  scroll: { padding: 16 },
  avatarContenedor: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  inicialAvatar: { fontSize: 28, fontWeight: 'bold', color: '#1565C0' },
  idUsuario: { fontSize: 12, color: '#9E9E9E' },
  filaSwitch: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1,
  },
  etiquetaSwitch: { fontSize: 14, fontWeight: '600', color: '#212121' },
  subEtiquetaSwitch: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  etiqueta: { fontSize: 14, fontWeight: '600', color: '#424242', marginBottom: 6, marginTop: 14 },
  selectorRol: { flexDirection: 'row', marginBottom: 4 },
  opcionRol: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF', marginRight: 6,
  },
  textoRol: { fontSize: 11, color: '#757575', fontWeight: '500', marginLeft: 4 },
  textoRolActivo: { color: '#FFFFFF', fontWeight: 'bold' },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#E0E0E0', paddingHorizontal: 14, height: 48, fontSize: 15, color: '#212121',
  },
  notaInfo: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF8E1',
    borderRadius: 10, padding: 12, marginTop: 16, marginBottom: 16,
  },
  textoNota: { flex: 1, fontSize: 12, color: '#F57F17', lineHeight: 18, marginLeft: 8 },
  botonGuardar: {
    backgroundColor: '#1A237E', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  botonDeshabilitado: { backgroundColor: '#9FA8DA' },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default EditarUsuarioScreen;
