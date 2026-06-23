/**
 * RegistroScreen.jsx - Pantalla de registro de nuevos estudiantes
 *
 * SEGURIDAD: Solo permite crear cuentas de estudiante.
 * Los docentes y administradores deben ser creados por un administrador.
 *
 * Validaciones de seguridad:
 * - Nombre y apellido: solo letras, minimo 2 caracteres
 * - Correo: formato valido
 * - Password: minimo 8 caracteres, al menos 1 mayuscula y 1 numero
 * - Confirmacion de password
 * - Grado requerido
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
  const [grado, setGrado]                     = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando]               = useState(false);

  // Indicadores visuales de seguridad de la password
  const passwordTiene8     = password.length >= 8;
  const passwordTieneMayus = /[A-Z]/.test(password);
  const passwordTieneNum   = /\d/.test(password);

  // Validacion completa en el cliente antes de enviar al backend
  const validar = () => {
    if (!nombre.trim() || !apellido.trim() || !correo.trim() || !password || !confirmarPassword || !grado.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return false;
    }
    if (!REGEX_NOMBRE.test(nombre.trim())) {
      Alert.alert('Nombre inválido', 'El nombre solo puede contener letras y debe tener al menos 2 caracteres.');
      return false;
    }
    if (!REGEX_NOMBRE.test(apellido.trim())) {
      Alert.alert('Apellido inválido', 'El apellido solo puede contener letras y debe tener al menos 2 caracteres.');
      return false;
    }
    if (!REGEX_CORREO.test(correo.trim())) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.');
      return false;
    }
    if (!REGEX_PASSWORD.test(password)) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
      return false;
    }
    if (password !== confirmarPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
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
          grado:            grado.trim(),
        },
        { timeout: API_CONFIG.TIMEOUT }
      );

      Alert.alert(
        'Registro exitoso',
        'Tu cuenta de estudiante ha sido creada. Ya puedes iniciar sesión.',
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

        <Text style={styles.titulo}>Registro de Estudiante</Text>
        <Text style={styles.subtitulo}>Completa tus datos para crear tu cuenta de estudiante</Text>

        {/* Información de seguridad */}
        <View style={styles.infoSeguridad}>
          <MaterialCommunityIcons name="shield-check" size={18} color="#4CAF50" />
          <Text style={styles.infoSeguridadTexto}>
            {' '}Registro seguro - Solo estudiantes pueden registrarse aquí.
          </Text>
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

          <Text style={styles.etiqueta}>Grado *</Text>
          <TextInput
            style={styles.input} placeholder="Ej: 3er Grado - Sección A"
            value={grado} onChangeText={setGrado} placeholderTextColor="#BDBDBD"
          />

          <Text style={styles.etiqueta}>Correo electrónico *</Text>
          <TextInput
            style={styles.input} placeholder="correo@escuela.edu"
            value={correo} onChangeText={setCorreo}
            keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#BDBDBD"
          />

          <Text style={styles.etiqueta}>Contraseña *</Text>
          <View style={styles.inputContenedor}>
            <TextInput
              style={styles.inputPassword} placeholder="Mínimo 8 caracteres"
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
                <Text style={[styles.textoIndicador, passwordTiene8 && styles.indicadorOk]}>Mínimo 8 caracteres</Text>
              </View>
              <View style={styles.indicador}>
                <MaterialCommunityIcons name={passwordTieneMayus ? 'check-circle' : 'circle-outline'} size={14} color={passwordTieneMayus ? '#4CAF50' : '#BDBDBD'} />
                <Text style={[styles.textoIndicador, passwordTieneMayus && styles.indicadorOk]}>Al menos una mayúscula</Text>
              </View>
              <View style={styles.indicador}>
                <MaterialCommunityIcons name={passwordTieneNum ? 'check-circle' : 'circle-outline'} size={14} color={passwordTieneNum ? '#4CAF50' : '#BDBDBD'} />
                <Text style={[styles.textoIndicador, passwordTieneNum && styles.indicadorOk]}>Al menos un número</Text>
              </View>
            </View>
          )}

          <Text style={styles.etiqueta}>Confirmar contraseña *</Text>
          <TextInput
            style={[
              styles.input,
              confirmarPassword.length > 0 && {
                borderColor: confirmarPassword === password ? '#4CAF50' : '#F44336',
              },
            ]}
            placeholder="Repite tu contraseña"
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
              : <Text style={styles.botonTexto}>Crear cuenta de estudiante</Text>
            }
          </TouchableOpacity>

          {/* Información sobre docentes */}
          <View style={styles.infoDocente}>
            <MaterialCommunityIcons name="information" size={16} color="#757575" />
            <Text style={styles.infoDocenteTexto}>
              {' '}Los docentes deben ser registrados por el administrador del sistema.
              Para más información, contacta con tu profesor o administrador.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, backgroundColor: '#F5F9FF', padding: 24, paddingTop: 50 },
  botonVolver: { marginBottom: 16 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1A237E', marginBottom: 4, textAlign: 'center' },
  subtitulo: { fontSize: 14, color: '#757575', marginBottom: 20, textAlign: 'center' },
  infoSeguridad: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoSeguridadTexto: {
    fontSize: 13,
    color: '#2E7D32',
    flex: 1,
    lineHeight: 18,
  },
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
  infoDocente: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  infoDocenteTexto: {
    fontSize: 12,
    color: '#757575',
    flex: 1,
    lineHeight: 16,
    marginLeft: 8,
  },
});

export default RegistroScreen;
