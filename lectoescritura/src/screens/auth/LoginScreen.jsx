/**
 * LoginScreen.jsx - Pantalla de inicio de sesion
 *
 * Modo DEMO (sin backend): usa credenciales hardcodeadas.
 *   estudiante@demo.com / demo123
 *   docente@demo.com    / demo123
 *   admin@demo.com      / demo123
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

// Usuarios demo para presentacion sin backend
const USUARIOS_DEMO = {
  'estudiante@demo.com': { nombre: 'Ana', apellido: 'Garcia', rol: 'estudiante', grado: '3er Grado' },
  'docente@demo.com':    { nombre: 'Prof. Maria', apellido: 'Gonzalez', rol: 'docente' },
  'admin@demo.com':      { nombre: 'Admin', apellido: 'Sistema', rol: 'administrador' },
};

const LoginScreen = ({ navigation }) => {
  const { iniciarSesion } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!correo.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contrasena.');
      return;
    }
    setCargando(true);
    try {
      const usuarioDemo = USUARIOS_DEMO[correo.toLowerCase().trim()];
      if (usuarioDemo && password === 'demo123') {
        await iniciarSesion(usuarioDemo, 'token-demo-123');
        return;
      }
      Alert.alert(
        'Credenciales incorrectas',
        'Usa:\nestudiante@demo.com\ndocente@demo.com\nadmin@demo.com\n\nContrasena: demo123'
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo iniciar sesion.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
      <View style={styles.encabezado}>
        <View style={styles.logoContenedor}>
          <MaterialCommunityIcons name="book-education" size={60} color="#4A90D9" />
        </View>
        <Text style={styles.titulo}>LectoEscritura</Text>
        <Text style={styles.subtitulo}>Escuela Nacional Jose Gabriel Alviares</Text>
      </View>

      {/* Banner con credenciales demo */}
      <View style={styles.bannerDemo}>
        <MaterialCommunityIcons name="information" size={16} color="#1565C0" />
        <Text style={styles.textoBannerDemo}>
          {'  '}Demo: estudiante@demo.com | docente@demo.com | admin@demo.com{'\n'}
          {'  '}Contrasena: demo123
        </Text>
      </View>

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
            placeholder="demo123"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!mostrarPassword}
            placeholderTextColor="#BDBDBD"
          />
          <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)}>
            <MaterialCommunityIcons name={mostrarPassword ? 'eye-off' : 'eye'} size={20} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

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
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, backgroundColor: '#F5F9FF', justifyContent: 'center', padding: 24 },
  encabezado: { alignItems: 'center', marginBottom: 16 },
  logoContenedor: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#1A237E', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#757575', textAlign: 'center' },
  bannerDemo: {
    backgroundColor: '#E3F2FD', borderRadius: 10, padding: 12,
    marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start',
  },
  textoBannerDemo: { fontSize: 12, color: '#1565C0', lineHeight: 18, flex: 1 },
  formulario: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24,
    elevation: 4,
  },
  etiqueta: { fontSize: 14, fontWeight: '600', color: '#424242', marginBottom: 6, marginTop: 12 },
  inputContenedor: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 12, backgroundColor: '#FAFAFA',
  },
  inputIcono: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 15, color: '#212121' },
  botonIngresar: {
    backgroundColor: '#4A90D9', borderRadius: 10, height: 50,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },
  botonDeshabilitado: { backgroundColor: '#90CAF9' },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  registroContenedor: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  textoRegistro: { color: '#757575', fontSize: 14 },
  enlaceRegistro: { color: '#4A90D9', fontSize: 14, fontWeight: '600' },
});

export default LoginScreen;
