/**
 * RegistroScreen.jsx - Pantalla de registro de nuevos usuarios
 *
 * Permite crear cuentas de estudiante o docente.
 * Los administradores solo pueden ser creados desde el panel admin.
 *
 * Validaciones de seguridad:
 * - Nombre y apellido: solo letras, minimo 2 caracteres
 * - Correo: formato valido
 * - Password: minimo 8 caracteres, al menos 1 mayuscula y 1 numero
 * - Confirmacion de password
 * - Grado requerido para estudiantes
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';

// Regex de validacion
const REGEX_CORREO   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_PASSWORD = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const REGEX_NOMBRE   = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;

const RegistroScreen = ({ navigation }) => {
  const [nombre, setNombre]                   = useState('');
  const [apellido, setApellido]               = useState('');
  const [correo, setCorreo]                   = useState('');
  const [password, setPassword]               = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [rol, setRol]                         = useState('estudiante');
  const [grado, setGrado]                     = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando]               = useState(false);

  // Indicadores visuales de seguridad de la password
  const passwordTiene8     = password.length >= 8;
  const passwordTieneMayus = /[A-Z]/.test(password);
  const passwordTieneNum   = /\d/.test(password);

  // Validacion completa en el cliente antes de enviar al backend
  const validar = () => {
    if (!nombre.trim() || !apellido.trim() || !correo.trim() || !password || !confirmarPassword) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return false;
    }
    if (!REGEX_NOMBRE.test(nombre.trim())) {
      Alert.alert('Nombre invalido', 'El nombre solo puede contener letras y debe tener al menos 2 caracteres.');
      return false;
    }
    if (!REGEX_NOMBRE.test(apellido.trim())) {
      Alert.alert('Apellido invalido', 'El apellido solo puede contener letras y debe tener al menos 2 caracteres.');
      return false;
    }
    if (!REGEX_CORREO.test(correo.trim())) {
      Alert.alert('Correo invalido', 'Ingresa un correo electronico valido.');
      return false;
    }
    if (!REGEX_PASSWORD.test(password)) {
      Alert.alert('Contrasena debil', 'La contrasena debe tener al menos 8 caracteres, una mayuscula y un numero.');
      return false;
    }
    if (password !== confirmarPassword) {
      Alert.alert('Error', 'Las contrasenas no coinciden.');
      return false;
    }
    if (rol === 'estudiante' && !grado.trim()) {
      Alert.alert('Grado requerido', 'Ingresa el grado del estudiante.');
      return false;
    }
    return true;
  };

  const handleRegistro = async () => {
    if (!validar()) return;

    setCargando(true);
    try {
      await axios.post(
        `${API_CONFIG.BASE_URL}/auth/registro`,
        {
          nombre:           nombre.trim(),
          apellido:         apellido.trim(),
          correo:           correo.toLowerCase().trim(),
          password,
          confirmarPassword,
          rol,
          grado:            grado.trim() || undefined,
        },
        { timeout: API_CONFIG.TIMEOUT }
      );

      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada. Ya puedes iniciar sesion.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo completar el registro.';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
        </TouchableOpacity>

        <Text style={styles.titulo}>Crear cuenta</Text>
        <Text style={styles.subtitulo}>Completa tus datos para registrarte</Text>

        {/* Selector de rol */}
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
          <Text style={styles.etiqueta}>Nombre *</Text>
          <TextInput
            style={styles.input} placeholder="Tu nombre"
            value={nombre} onChangeText={setNombre} placeholderTextColor="#BDBDBD"
          />

          <Text style={styles.etiqueta}>Apellido *</Text>
          <TextInput
            style={styles.input} placeholder="Tu apellido"
            value={apellido} onChangeText={setApellido} placeholderTextColor="#BDBDBD"
          />

          {rol === 'estudiante' && (
            <>
              <Text style={styles.etiqueta}>Grado *</Text>
              <TextInput
                style={styles.input} placeholder="Ej: 3er Grado - Seccion A"
                value={grado} onChangeText={setGrado} placeholderTextColor="#BDBDBD"
              />
            </>
          )}

          <Text style={styles.etiqueta}>Correo electronico *</Text>
          <TextInput
            style={styles.input} placeholder="correo@escuela.edu"
            value={correo} onChangeText={setCorreo}
            keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#BDBDBD"
          />

          <Text style={styles.etiqueta}>Contrasena *</Text>
          <View style={styles.inputContenedor}>
            <TextInput
              style={styles.inputPassword} placeholder="Minimo 8 caracteres"
              value={password} onChangeText={setPassword}
              secureTextEntry={!mostrarPassword} placeholderTextColor="#BDBDBD"
            />
            <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)}>
              <MaterialCommunityIcons name={mostrarPassword ? 'eye-off' : 'eye'} size={20} color="#9E9E9E" />
            </TouchableOpacity>
          </View>

          {/* Indicadores de seguridad de la password */}
          {password.length > 0 && (
            <View style={styles.indicadoresPassword}>
              <View style={styles.indicador}>
                <MaterialCommunityIcons name={passwordTiene8 ? 'check-circle' : 'circle-outline'} size={14} color={passwordTiene8 ? '#4CAF50' : '#BDBDBD'} />
                <Text style={[styles.textoIndicador, passwordTiene8 && styles.indicadorOk]}>Minimo 8 caracteres</Text>
              </View>
              <View style={styles.indicador}>
                <MaterialCommunityIcons name={passwordTieneMayus ? 'check-circle' : 'circle-outline'} size={14} color={passwordTieneMayus ? '#4CAF50' : '#BDBDBD'} />
                <Text style={[styles.textoIndicador, passwordTieneMayus && styles.indicadorOk]}>Al menos una mayuscula</Text>
              </View>
              <View style={styles.indicador}>
                <MaterialCommunityIcons name={passwordTieneNum ? 'check-circle' : 'circle-outline'} size={14} color={passwordTieneNum ? '#4CAF50' : '#BDBDBD'} />
                <Text style={[styles.textoIndicador, passwordTieneNum && styles.indicadorOk]}>Al menos un numero</Text>
              </View>
            </View>
          )}

          <Text style={styles.etiqueta}>Confirmar contrasena *</Text>
          <TextInput
            style={[
              styles.input,
              confirmarPassword.length > 0 && {
                borderColor: confirmarPassword === password ? '#4CAF50' : '#F44336',
              },
            ]}
            placeholder="Repite tu contrasena"
            value={confirmarPassword} onChangeText={setConfirmarPassword}
            secureTextEntry placeholderTextColor="#BDBDBD"
          />

          <TouchableOpacity
            style={[styles.botonRegistrar, cargando && styles.botonDeshabilitado]}
            onPress={handleRegistro}
            disabled={cargando}
          >
            {cargando
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.botonTexto}>Crear cuenta</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#FFFFFF', marginRight: 8,
  },
  opcionRolActiva: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  textoRol: { fontSize: 14, color: '#757575', fontWeight: '500', marginLeft: 6 },
  textoRolActivo: { color: '#FFFFFF', fontWeight: 'bold' },
  formulario: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 4 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: '#424242', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 14, height: 46, fontSize: 15, color: '#212121', backgroundColor: '#FAFAFA',
  },
  inputContenedor: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 14,
    backgroundColor: '#FAFAFA', height: 46,
  },
  inputPassword: { flex: 1, fontSize: 15, color: '#212121' },
  indicadoresPassword: { marginTop: 8, marginBottom: 4 },
  indicador: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  textoIndicador: { fontSize: 12, color: '#BDBDBD', marginLeft: 6 },
  indicadorOk: { color: '#4CAF50' },
  botonRegistrar: {
    backgroundColor: '#4A90D9', borderRadius: 10, height: 50,
    justifyContent: 'center', alignItems: 'center', marginTop: 24,
  },
  botonDeshabilitado: { backgroundColor: '#90CAF9' },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default RegistroScreen;
