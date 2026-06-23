/**
 * RecuperarPasswordScreen.jsx - Pantalla para solicitar recuperacion de contrasena
 *
 * Paso 1: Solicitar correo para recibir codigo de verificacion
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

const RecuperarPasswordScreen = ({ navigation }) => {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSolicitarCodigo = async () => {
    if (!correo.trim()) {
      Alert.alert('Correo requerido', 'Por favor ingresa tu correo electrónico.');
      return;
    }

    // Validacion simple de formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim())) {
      Alert.alert('Correo inválido', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    setCargando(true);
    try {
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/solicitar-recuperacion`,
        { correo: correo.toLowerCase().trim() },
        { timeout: API_CONFIG.TIMEOUT }
      );

      // Mostrar mensaje de exito
      Alert.alert(
        'Código enviado',
        data.mensaje,
        [
          {
            text: 'Continuar',
            onPress: () => navigation.navigate('ValidarCodigo', { correo: correo.trim() }),
          },
        ]
      );

    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo enviar el código. Intenta nuevamente.';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
        {/* Boton de regresar */}
        <TouchableOpacity style={styles.botonRegresar} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>

        {/* Contenido */}
        <View style={styles.encabezado}>
          <View style={styles.iconoContenedor}>
            <MaterialCommunityIcons name="key" size={60} color="#4A90D9" />
          </View>
          <Text style={styles.titulo}>Recuperar Contraseña</Text>
          <Text style={styles.subtitulo}>
            Te enviaremos un código de 6 dígitos a tu correo para restablecer tu contraseña.
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formulario}>
          <Text style={styles.etiqueta}>Correo electrónico</Text>
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
              editable={!cargando}
            />
          </View>

          <Text style={styles.nota}>
            📧 El código será válido por 15 minutos.
            Si no ves el correo, revisa tu carpeta de spam.
          </Text>

          <TouchableOpacity
            style={[styles.botonPrincipal, cargando && styles.botonDeshabilitado]}
            onPress={handleSolicitarCodigo}
            disabled={cargando}
          >
            {cargando
              ? <ActivityIndicator color="#FFFFFF" />
              : (
                <>
                  <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" style={styles.botonIcono} />
                  <Text style={styles.botonTexto}>Enviar código</Text>
                </>
              )
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonSecundario}
            onPress={() => navigation.navigate('Login')}
            disabled={cargando}
          >
            <Text style={styles.botonSecundarioTexto}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.infoAdicional}>
          <MaterialCommunityIcons name="shield-check" size={16} color="#4CAF50" />
          <Text style={styles.infoTexto}>
            {' '}Por seguridad, el código solo puede usarse una vez y tiene tiempo limitado.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    backgroundColor: '#F5F9FF',
    padding: 24,
    paddingTop: 60,
  },
  botonRegresar: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  encabezado: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconoContenedor: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  inputContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
  },
  inputIcono: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#212121',
  },
  nota: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
    marginBottom: 24,
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  botonPrincipal: {
    backgroundColor: '#4A90D9',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  botonDeshabilitado: {
    backgroundColor: '#90CAF9',
  },
  botonIcono: {
    marginRight: 8,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonSecundario: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90D9',
  },
  botonSecundarioTexto: {
    color: '#4A90D9',
    fontSize: 14,
    fontWeight: '600',
  },
  infoAdicional: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTexto: {
    fontSize: 12,
    color: '#2E7D32',
    flex: 1,
    lineHeight: 16,
  },
});

export default RecuperarPasswordScreen;
