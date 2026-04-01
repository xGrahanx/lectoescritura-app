/**
 * CrearUsuarioScreen.jsx - Crear nuevo usuario desde el panel admin
 *
 * El administrador puede crear cuentas para estudiantes, docentes
 * y otros administradores directamente sin necesidad de registro.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CrearUsuarioScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('estudiante');
  const [grado, setGrado] = useState('');
  const [cargando, setCargando] = useState(false);

  const roles = [
    { key: 'estudiante', label: 'Estudiante', icono: 'school', color: '#4A90D9' },
    { key: 'docente', label: 'Docente', icono: 'account-tie', color: '#2E7D32' },
    { key: 'administrador', label: 'Admin', icono: 'shield-account', color: '#6A1B9A' },
  ];

  const crearUsuario = async () => {
    if (!nombre || !apellido || !correo || !password) {
      Alert.alert('Campos requeridos', 'Completa todos los campos obligatorios.');
      return;
    }
    setCargando(true);
    try {
      // TODO: Llamar al endpoint de creacion de usuarios
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Usuario creado', `La cuenta de ${nombre} fue creada exitosamente.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el usuario.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.barraTop}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
        </TouchableOpacity>
        <Text style={styles.tituloBar}>Crear usuario</Text>
        <View />
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.etiqueta}>Rol del usuario</Text>
        <View style={styles.selectorRol}>
          {roles.map(r => (
            <TouchableOpacity
              key={r.key}
              style={[styles.opcionRol, rol === r.key && { backgroundColor: r.color, borderColor: r.color }]}
              onPress={() => setRol(r.key)}
            >
              <MaterialCommunityIcons name={r.icono} size={20} color={rol === r.key ? '#FFFFFF' : '#757575'} />
              <Text style={[styles.textoRol, rol === r.key && styles.textoRolActivo]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.etiqueta}>Nombre *</Text>
        <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} placeholderTextColor="#BDBDBD" />

        <Text style={styles.etiqueta}>Apellido *</Text>
        <TextInput style={styles.input} placeholder="Apellido" value={apellido} onChangeText={setApellido} placeholderTextColor="#BDBDBD" />

        {rol === 'estudiante' && (
          <>
            <Text style={styles.etiqueta}>Grado</Text>
            <TextInput style={styles.input} placeholder="Ej: 3er Grado" value={grado} onChangeText={setGrado} placeholderTextColor="#BDBDBD" />
          </>
        )}

        <Text style={styles.etiqueta}>Correo electronico *</Text>
        <TextInput style={styles.input} placeholder="correo@escuela.edu" value={correo} onChangeText={setCorreo} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#BDBDBD" />

        <Text style={styles.etiqueta}>Contrasena temporal *</Text>
        <TextInput style={styles.input} placeholder="Minimo 6 caracteres" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#BDBDBD" />

        <View style={styles.notaInfo}>
          <MaterialCommunityIcons name="information" size={16} color="#4A90D9" />
          <Text style={styles.textoNota}>El usuario recibira un correo con sus credenciales y debera cambiar su contrasena en el primer inicio de sesion.</Text>
        </View>

        <TouchableOpacity
          style={[styles.botonCrear, cargando && styles.botonDeshabilitado]}
          onPress={crearUsuario} disabled={cargando}
        >
          {cargando
            ? <ActivityIndicator color="#FFFFFF" />
            : <><MaterialCommunityIcons name="account-plus" size={18} color="#FFFFFF" /><Text style={styles.botonTexto}>  Crear usuario</Text></>
          }
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  barraTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 16, paddingTop: 50, elevation: 2 },
  tituloBar: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  scroll: { padding: 16 },
  etiqueta: { fontSize: 14, fontWeight: '600', color: '#424242', marginBottom: 6, marginTop: 10 },
  selectorRol: { flexDirection: 'row', marginBottom: 8 },
  opcionRol: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  textoRol: { fontSize: 12, color: '#757575', fontWeight: '500' },
  textoRolActivo: { color: '#FFFFFF', fontWeight: 'bold' },
  input: { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 14, height: 48, fontSize: 15, color: '#212121' },
  notaInfo: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#E3F2FD', borderRadius: 10, padding: 12, marginTop: 16, marginBottom: 16 },
  textoNota: { flex: 1, fontSize: 12, color: '#1565C0', lineHeight: 18 },
  botonCrear: { backgroundColor: '#6A1B9A', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  botonDeshabilitado: { backgroundColor: '#CE93D8' },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default CrearUsuarioScreen;
