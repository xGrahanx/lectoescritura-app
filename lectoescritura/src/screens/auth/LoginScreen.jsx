/**
 * LoginScreen.jsx - Pantalla de inicio de sesion
 *
 * Estudiantes y docentes se autentican contra el backend real (PostgreSQL).
 * El administrador tiene un acceso demo de emergencia por si no hay
 * ningun admin registrado en la base de datos todavia.
 *
 * Credencial demo de emergencia (solo admin):
 *   admin@demo.com / Demo1234
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../utils/constantes';

// Acceso de emergencia para el administrador
// Util cuando no hay ningun admin registrado en la BD todavia
const ADMIN_DEMO = {
  correo:   'admin@demo.com',
  password: 'Demo1234',
  usuario:  { nombre: 'Admin', apellido: 'Demo', rol: 'administrador' },
};

const LoginScreen = ({ navigation }) => {
  const { iniciarSesion } = useAuth();
  const [correo, setCorreo]                   = useState('');
  const [password, setPassword]               = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando]               = useState(false);

  const handleLogin = async () => {
    if (!correo.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contrasena.');
      return;
    }

    setCargando(true);
    try {
      // Verificar acceso demo de emergencia para admin
      if (
        correo.toLowerCase().trim() === ADMIN_DEMO.correo &&
        password === ADMIN_DEMO.password
      ) {
        await iniciarSesion(ADMIN_DEMO.usuario, 'token-admin-demo');
        return;
      }

      // Login real contra el backend
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/login`,
        { correo: correo.toLowerCase().trim(), password },
        { timeout: API_CONFIG.TIMEOUT }
      );

      await iniciarSesion(data.usuario, data.token);

    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo conectar al servidor.';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.encabezado}>
          <View style={styles.logoContenedor}>
            <MaterialCommunityIcons name="book-education" size={60} color="#4A90D9" />
          </View>
          <Text style={styles.titulo}>LectoEscritura</Text>
          <Text style={styles.subtitulo}>Escuela Nacional Jose Gabriel Alviares</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formulario}>
          <Text style={styles.etiqueta}>Correo electronico</Text>
          <View style={styles.inputContenedor}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#9E9E9E" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="correo@escuela.edu"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#BDBDBD"
            />
          </View>

          <Text style={styles.etiqueta}>Contrasena</Text>
          <View style={styles.inputContenedor}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#9E9E9E" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="Tu contrasena"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!mostrarPassword}
              placeholderTextColor="#BDBDBD"
            />
            <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)}>
              <MaterialCommunityIcons name={mostrarPassword ? 'eye-off' : 'eye'} size={20} color="#9E9E9E" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('RecuperarPassword')}>
            <Text style={styles.enlaceOlvide}>Olvide mi contrasena</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botonIngresar, cargando && styles.botonDeshabilitado]}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.botonTexto}>Ingresar</Text>
            }
          </TouchableOpacity>

          <View style={styles.registroContenedor}>
            <Text style={styles.textoRegistro}>No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
              <Text style={styles.enlaceRegistro}>Registrate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nota de acceso demo */}
        <View style={styles.notaDemo}>
          <MaterialCommunityIcons name="shield-account" size={14} color="#9E9E9E" />
          <Text style={styles.textoDemo}>  Admin de emergencia: admin@demo.com / Demo1234</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, backgroundColor: '#F5F9FF', justifyContent: 'center', padding: 24 },
  encabezado: { alignItems: 'center', marginBottom: 24 },
  logoContenedor: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#1A237E', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#757575', textAlign: 'center' },
  formulario: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, elevation: 4 },
  etiqueta: { fontSize: 14, fontWeight: '600', color: '#424242', marginBottom: 6, marginTop: 12 },
  inputContenedor: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#FAFAFA',
  },
  inputIcono: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 15, color: '#212121' },
  enlaceOlvide: { color: '#4A90D9', fontSize: 13, textAlign: 'right', marginTop: 8, marginBottom: 4 },
  botonIngresar: {
    backgroundColor: '#4A90D9', borderRadius: 10, height: 50,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },
  botonDeshabilitado: { backgroundColor: '#90CAF9' },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  registroContenedor: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  textoRegistro: { color: '#757575', fontSize: 14 },
  enlaceRegistro: { color: '#4A90D9', fontSize: 14, fontWeight: '600' },
  notaDemo: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  textoDemo: { color: '#BDBDBD', fontSize: 11 },
});

export default LoginScreen;
