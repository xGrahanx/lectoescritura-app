/**
 * RegistroScreen.jsx - Pantalla de registro de nuevos usuarios
 *
 * Permite crear cuentas de estudiante o docente.
 * Los administradores son creados directamente desde el panel admin.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiRegistro } from '../../services/authService';

const RegistroScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [rol, setRol] = useState('estudiante');
  const [grado, setGrado] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async () => {
    if (!nombre || !apellido || !correo || !password) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return;
    }
    if (password !== confirmarPassword) {
      Alert.alert('Error', 'Las contrasenas no coinciden.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contrasena debil', 'La contrasena debe tener al menos 6 caracteres.');
      return;
    }
    setCargando(true);
    try {
      await apiRegistro({ nombre, apellido, correo, password, rol, grado });
      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada. Espera la aprobacion del administrador.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo completar el registro.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
      </TouchableOpacity>

      <Text style={styles.titulo}>Crear cuenta</Text>
      <Text style={styles.subtitulo}>Completa tus datos para registrarte</Text>

      <View style={styles.selectorRol}>
        <TouchableOpacity
          style={[styles.opcionRol, rol === 'estudiante' && styles.opcionRolActiva]}
          onPress={() => setRol('estudiante')}
        >
          <MaterialCommunityIcons name="school" size={20} color={rol === 'estudiante' ? '#FFFFFF' : '#757575'} />
          <Text style={[styles.textoRol, rol === 'estudiante' && styles.textoRolActivo]}>Estudiante</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.opcionRol, rol === 'docente' && styles.opcionRolActiva]}
          onPress={() => setRol('docente')}
        >
          <MaterialCommunityIcons name="account-tie" size={20} color={rol === 'docente' ? '#FFFFFF' : '#757575'} />
          <Text style={[styles.textoRol, rol === 'docente' && styles.textoRolActivo]}>Docente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formulario}>
        <Text style={styles.etiqueta}>Nombre</Text>
        <TextInput style={styles.input} placeholder="Tu nombre" value={nombre} onChangeText={setNombre} placeholderTextColor="#BDBDBD" />

        <Text style={styles.etiqueta}>Apellido</Text>
        <TextInput style={styles.input} placeholder="Tu apellido" value={apellido} onChangeText={setApellido} placeholderTextColor="#BDBDBD" />

        {rol === 'estudiante' && (
          <>
            <Text style={styles.etiqueta}>Grado</Text>
            <TextInput style={styles.input} placeholder="Ej: 3er grado" value={grado} onChangeText={setGrado} placeholderTextColor="#BDBDBD" />
          </>
        )}

        <Text style={styles.etiqueta}>Correo electronico</Text>
        <TextInput
          style={styles.input} placeholder="correo@escuela.edu"
          value={correo} onChangeText={setCorreo}
          keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#BDBDBD"
        />

        <Text style={styles.etiqueta}>Contrasena</Text>
        <TextInput style={styles.input} placeholder="Minimo 6 caracteres" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#BDBDBD" />

        <Text style={styles.etiqueta}>Confirmar contrasena</Text>
        <TextInput style={styles.input} placeholder="Repite tu contrasena" value={confirmarPassword} onChangeText={setConfirmarPassword} secureTextEntry placeholderTextColor="#BDBDBD" />

        <TouchableOpacity
          style={[styles.botonRegistrar, cargando && styles.botonDeshabilitado]}
          onPress={handleRegistro} disabled={cargando}
        >
          {cargando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.botonTexto}>Crear cuenta</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, backgroundColor: '#F5F9FF', padding: 24, paddingTop: 50 },
  botonVolver: { marginBottom: 16 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1A237E', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#757575', marginBottom: 24 },
  selectorRol: { flexDirection: 'row', marginBottom: 20 },
  opcionRol: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  opcionRolActiva: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  textoRol: { fontSize: 14, color: '#757575', fontWeight: '500' },
  textoRolActivo: { color: '#FFFFFF', fontWeight: 'bold' },
  formulario: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 4 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: '#424242', marginBottom: 4, marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 14, height: 46, fontSize: 15, color: '#212121', backgroundColor: '#FAFAFA',
  },
  botonRegistrar: {
    backgroundColor: '#4A90D9', borderRadius: 10, height: 50,
    justifyContent: 'center', alignItems: 'center', marginTop: 24,
  },
  botonDeshabilitado: { backgroundColor: '#90CAF9' },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default RegistroScreen;
