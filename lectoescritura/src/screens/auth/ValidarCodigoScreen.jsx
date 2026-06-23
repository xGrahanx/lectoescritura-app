/**
 * ValidarCodigoScreen.jsx - Pantalla para validar codigo de recuperacion
 *
 * Paso 2: Ingresar el codigo de 6 digitos recibido por correo
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';

const ValidarCodigoScreen = ({ navigation, route }) => {
  const { correo } = route.params || {};
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [cargando, setCargando] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(900); // 15 minutos en segundos
  const inputsRef = useRef([]);

  // Contador de tiempo para expiracion del codigo
  React.useEffect(() => {
    if (tiempoRestante <= 0) return;

    const timer = setInterval(() => {
      setTiempoRestante(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [tiempoRestante]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCodigoChange = (text, index) => {
    if (text.length <= 1 && /^\d*$/.test(text)) {
      const newCodigo = [...codigo];
      newCodigo[index] = text;
      setCodigo(newCodigo);

      // Auto-focus siguiente input
      if (text.length === 1 && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace' && !codigo[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleValidarCodigo = async () => {
    const codigoCompleto = codigo.join('');
    
    if (codigoCompleto.length !== 6) {
      Alert.alert('Código incompleto', 'Por favor ingresa los 6 dígitos del código.');
      return;
    }

    if (!/^\d{6}$/.test(codigoCompleto)) {
      Alert.alert('Código inválido', 'El código debe contener solo números.');
      return;
    }

    setCargando(true);
    try {
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/validar-codigo`,
        { 
          correo: correo.toLowerCase().trim(),
          codigo: codigoCompleto,
        },
        { timeout: API_CONFIG.TIMEOUT }
      );

      if (data.valido) {
        // Navegar a pantalla de restablecer contraseña
        navigation.navigate('RestablecerPassword', {
          correo,
          codigo: codigoCompleto,
        });
      } else {
        Alert.alert('Código inválido', 'El código ingresado no es válido.');
      }

    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo validar el código.';
      Alert.alert('Error', mensaje);
      
      // Si el codigo expiró, permitir solicitar uno nuevo
      if (error.response?.status === 400 && error.response?.data?.mensaje?.includes('expirado')) {
        Alert.alert(
          'Código expirado',
          'Tu código ha expirado. ¿Deseas solicitar uno nuevo?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Solicitar nuevo',
              onPress: () => navigation.navigate('RecuperarPassword'),
            },
          ]
        );
      }
    } finally {
      setCargando(false);
    }
  };

  const handleReenviarCodigo = async () => {
    Alert.alert(
      'Reenviar código',
      '¿Deseas recibir un nuevo código de verificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reenviar',
          onPress: async () => {
            setCargando(true);
            try {
              const { data } = await axios.post(
                `${API_CONFIG.BASE_URL}/auth/solicitar-recuperacion`,
                { correo: correo.toLowerCase().trim() },
                { timeout: API_CONFIG.TIMEOUT }
              );

              // Reiniciar contador
              setTiempoRestante(900);
              setCodigo(['', '', '', '', '', '']);
              
              Alert.alert('Código reenviado', data.mensaje);
            } catch (error) {
              const mensaje = error.response?.data?.mensaje || 'No se pudo reenviar el código.';
              Alert.alert('Error', mensaje);
            } finally {
              setCargando(false);
            }
          },
        },
      ]
    );
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
            <MaterialCommunityIcons name="shield-check" size={60} color="#4A90D9" />
          </View>
          <Text style={styles.titulo}>Verificar Código</Text>
          <Text style={styles.subtitulo}>
            Ingresa el código de 6 dígitos que enviamos a:
          </Text>
          <Text style={styles.correo}>{correo}</Text>
        </View>

        {/* Inputs de código */}
        <View style={styles.codigoContenedor}>
          <Text style={styles.etiquetaCodigo}>Código de verificación</Text>
          
          <View style={styles.inputsGrid}>
            {codigo.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputsRef.current[index] = ref)}
                style={[
                  styles.codigoInput,
                  digit && styles.codigoInputLleno,
                ]}
                value={digit}
                onChangeText={(text) => handleCodigoChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!cargando}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Timer y reenviar */}
          <View style={styles.timerContenedor}>
            {tiempoRestante > 0 ? (
              <>
                <MaterialCommunityIcons name="timer-outline" size={16} color="#FF9800" />
                <Text style={styles.timerTexto}>Válido por: {formatTime(tiempoRestante)}</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#F44336" />
                <Text style={styles.timerTextoExpirado}>Código expirado</Text>
              </>
            )}
          </View>

          {tiempoRestante <= 0 && (
            <TouchableOpacity
              style={styles.botonReenviar}
              onPress={handleReenviarCodigo}
              disabled={cargando}
            >
              <MaterialCommunityIcons name="reload" size={16} color="#4A90D9" />
              <Text style={styles.botonReenviarTexto}>Solicitar nuevo código</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botones */}
        <View style={styles.botonesContenedor}>
          <TouchableOpacity
            style={[styles.botonPrincipal, cargando && styles.botonDeshabilitado]}
            onPress={handleValidarCodigo}
            disabled={cargando || codigo.join('').length !== 6}
          >
            {cargando
              ? <ActivityIndicator color="#FFFFFF" />
              : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" style={styles.botonIcono} />
                  <Text style={styles.botonTexto}>Validar código</Text>
                </>
              )
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonSecundario}
            onPress={() => navigation.navigate('RecuperarPassword')}
            disabled={cargando}
          >
            <MaterialCommunityIcons name="email-outline" size={16} color="#4A90D9" style={styles.botonSecundarioIcono} />
            <Text style={styles.botonSecundarioTexto}>Usar otro correo</Text>
          </TouchableOpacity>
        </View>

        {/* Ayuda */}
        <View style={styles.ayudaContenedor}>
          <MaterialCommunityIcons name="help-circle" size={16} color="#757575" />
          <Text style={styles.ayudaTexto}>
            {' '}No recibiste el código? Revisa tu carpeta de spam o intenta nuevamente.
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
  },
  correo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    marginTop: 4,
  },
  codigoContenedor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    marginBottom: 24,
  },
  etiquetaCodigo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  codigoInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    fontSize: 24,
    textAlign: 'center',
    color: '#212121',
    backgroundColor: '#FAFAFA',
  },
  codigoInputLleno: {
    borderColor: '#4A90D9',
    backgroundColor: '#F5F9FF',
  },
  timerContenedor: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  timerTexto: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '600',
    marginLeft: 6,
  },
  timerTextoExpirado: {
    fontSize: 13,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 6,
  },
  botonReenviar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  botonReenviarTexto: {
    fontSize: 13,
    color: '#4A90D9',
    fontWeight: '600',
    marginLeft: 8,
  },
  botonesContenedor: {
    marginBottom: 24,
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
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90D9',
  },
  botonSecundarioIcono: {
    marginRight: 8,
  },
  botonSecundarioTexto: {
    color: '#4A90D9',
    fontSize: 14,
    fontWeight: '600',
  },
  ayudaContenedor: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  ayudaTexto: {
    fontSize: 12,
    color: '#FF8F00',
    flex: 1,
    lineHeight: 16,
  },
});

export default ValidarCodigoScreen;
