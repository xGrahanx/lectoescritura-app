/**
 * CambiarPasswordScreen.jsx - Pantalla para cambiar contraseña del docente
 * 
 * Permite cambiar la contraseña actual por una nueva (requiere contraseña actual)
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

const CambiarPasswordScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const [cargando, setCargando] = useState(false);
  
  // Estado para los campos del formulario
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  
  // Estado para mostrar/ocultar contraseñas
  const [mostrarPasswordActual, setMostrarPasswordActual] = useState(false);
  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);

  // Validación de fortaleza de contraseña
  const passwordTiene8 = nuevaPassword.length >= 8;
  const passwordTieneMayus = /[A-Z]/.test(nuevaPassword);
  const passwordTieneNum = /\d/.test(nuevaPassword);
  const passwordEsValida = passwordTiene8 && passwordTieneMayus && passwordTieneNum;
  const passwordsCoinciden = nuevaPassword === confirmarPassword && nuevaPassword.length > 0;

  const handleCambiarPassword = async () => {
    // Validaciones
    if (!passwordActual.trim()) {
      Alert.alert('Contraseña actual requerida', 'Ingresa tu contraseña actual');
      return;
    }

    if (!passwordEsValida) {
      Alert.alert(
        'Contraseña inválida',
        'La nueva contraseña debe tener:\n• Mínimo 8 caracteres\n• Al menos una mayúscula\n• Al menos un número'
      );
      return;
    }

    if (!passwordsCoinciden) {
      Alert.alert('Contraseñas no coinciden', 'La nueva contraseña y la confirmación deben ser iguales');
      return;
    }

    setCargando(true);
    try {
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/cambiar-password`,
        {
          correo: usuario.correo,
          passwordActual: passwordActual.trim(),
          nuevaPassword: nuevaPassword.trim(),
          confirmarPassword: confirmarPassword.trim(),
        },
        { timeout: API_CONFIG.TIMEOUT }
      );

      Alert.alert(
        'Contraseña cambiada',
        'Tu contraseña se ha actualizado correctamente.',
        [
          { 
            text: 'Aceptar', 
            onPress: () => {
              // Limpiar formulario
              setPasswordActual('');
              setNuevaPassword('');
              setConfirmarPassword('');
              navigation.goBack();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      
      let mensajeError = 'Error al cambiar la contraseña';
      if (error.response?.status === 400) {
        if (error.response.data?.mensaje?.includes('incorrecta')) {
          mensajeError = 'Contraseña actual incorrecta';
        } else if (error.response.data?.mensaje?.includes('coinciden')) {
          mensajeError = 'Las contraseñas no coinciden';
        } else {
          mensajeError = error.response.data.mensaje || 'Datos inválidos';
        }
      } else if (error.response?.status === 401) {
        mensajeError = 'Contraseña actual incorrecta';
      } else if (error.response?.status === 404) {
        mensajeError = 'Usuario no encontrado';
      } else if (error.response?.data?.mensaje) {
        mensajeError = error.response.data.mensaje;
      }

      Alert.alert('Error', mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContenedor}
        keyboardShouldPersistTaps="handled"
      >
        {/* Botón de regresar */}
        <TouchableOpacity style={styles.botonRegresar} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>

        {/* Encabezado */}
        <View style={styles.encabezado}>
          <View style={styles.iconoContenedor}>
            <MaterialCommunityIcons name="lock" size={60} color="#4A90D9" />
          </View>
          <Text style={styles.titulo}>Cambiar Contraseña</Text>
          <Text style={styles.subtitulo}>
            Actualiza tu contraseña de acceso al sistema
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formulario}>
          {/* Contraseña actual */}
          <Text style={styles.etiqueta}>Contraseña actual</Text>
          <View style={styles.inputContenedor}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#9E9E9E" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña actual"
              value={passwordActual}
              onChangeText={setPasswordActual}
              secureTextEntry={!mostrarPasswordActual}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setMostrarPasswordActual(!mostrarPasswordActual)}>
              <MaterialCommunityIcons 
                name={mostrarPasswordActual ? 'eye-off' : 'eye'} 
                size={20} 
                color="#9E9E9E" 
              />
            </TouchableOpacity>
          </View>

          {/* Nueva contraseña */}
          <Text style={styles.etiqueta}>Nueva contraseña</Text>
          <View style={styles.inputContenedor}>
            <MaterialCommunityIcons name="lock-plus" size={20} color="#9E9E9E" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="Crea una nueva contraseña"
              value={nuevaPassword}
              onChangeText={setNuevaPassword}
              secureTextEntry={!mostrarNuevaPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setMostrarNuevaPassword(!mostrarNuevaPassword)}>
              <MaterialCommunityIcons 
                name={mostrarNuevaPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#9E9E9E" 
              />
            </TouchableOpacity>
          </View>

          {/* Indicadores de fortaleza */}
          {nuevaPassword.length > 0 && (
            <View style={styles.indicadoresContenedor}>
              <Text style={styles.indicadoresTitulo}>La contraseña debe tener:</Text>
              
              <View style={styles.indicadoresLista}>
                <View style={styles.indicador}>
                  <MaterialCommunityIcons 
                    name={passwordTiene8 ? 'check-circle' : 'circle-outline'} 
                    size={14} 
                    color={passwordTiene8 ? '#4CAF50' : '#BDBDBD'} 
                  />
                  <Text style={[styles.textoIndicador, passwordTiene8 && styles.indicadorOk]}>
                    Mínimo 8 caracteres
                  </Text>
                </View>
                
                <View style={styles.indicador}>
                  <MaterialCommunityIcons 
                    name={passwordTieneMayus ? 'check-circle' : 'circle-outline'} 
                    size={14} 
                    color={passwordTieneMayus ? '#4CAF50' : '#BDBDBD'} 
                  />
                  <Text style={[styles.textoIndicador, passwordTieneMayus && styles.indicadorOk]}>
                    Al menos una mayúscula
                  </Text>
                </View>
                
                <View style={styles.indicador}>
                  <MaterialCommunityIcons 
                    name={passwordTieneNum ? 'check-circle' : 'circle-outline'} 
                    size={14} 
                    color={passwordTieneNum ? '#4CAF50' : '#BDBDBD'} 
                  />
                  <Text style={[styles.textoIndicador, passwordTieneNum && styles.indicadorOk]}>
                    Al menos un número
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Confirmar contraseña */}
          <Text style={styles.etiqueta}>Confirmar contraseña</Text>
          <View style={styles.inputContenedor}>
            <MaterialCommunityIcons name="lock" size={20} color="#9E9E9E" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="Repite la nueva contraseña"
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              secureTextEntry={!mostrarConfirmarPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}>
              <MaterialCommunityIcons 
                name={mostrarConfirmarPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#9E9E9E" 
              />
            </TouchableOpacity>
          </View>

          {/* Indicador de coincidencia */}
          {nuevaPassword.length > 0 && confirmarPassword.length > 0 && (
            <View style={[
              styles.coincidenciaContenedor,
              passwordsCoinciden ? styles.coincidenciaValida : styles.coincidenciaInvalida
            ]}>
              <MaterialCommunityIcons
                name={passwordsCoinciden ? 'check-circle' : 'alert-circle'}
                size={16}
                color={passwordsCoinciden ? '#4CAF50' : '#F44336'}
              />
              <Text style={[
                styles.textoCoincidencia,
                passwordsCoinciden ? styles.textoCoincidenciaValida : styles.textoCoincidenciaInvalida
              ]}>
                {' '}{passwordsCoinciden ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
              </Text>
            </View>
          )}

          {/* Información de seguridad */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#4CAF50" />
            <Text style={styles.infoTexto}>
              {' '}Por seguridad, no compartas tu contraseña con nadie. 
              El sistema nunca te pedirá tu contraseña por correo o teléfono.
            </Text>
          </View>
        </View>

        {/* Botones */}
        <View style={styles.botonesContenedor}>
          {/* Botón principal: Cambiar contraseña */}
          <TouchableOpacity
            style={[
              styles.botonPrincipal,
              (cargando || !passwordEsValida || !passwordsCoinciden || !passwordActual) && styles.botonDeshabilitado
            ]}
            onPress={handleCambiarPassword}
            disabled={cargando || !passwordEsValida || !passwordsCoinciden || !passwordActual}
          >
            {cargando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="lock" size={20} color="#FFFFFF" style={styles.botonIcono} />
                <Text style={styles.botonTexto}>Cambiar contraseña</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botón secundario: Cancelar */}
          <TouchableOpacity
            style={styles.botonSecundario}
            onPress={() => navigation.goBack()}
            disabled={cargando}
          >
            <MaterialCommunityIcons name="close-circle" size={16} color="#757575" style={styles.botonSecundarioIcono} />
            <Text style={styles.botonSecundarioTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  scrollContenedor: { flexGrow: 1, paddingBottom: 30 },
  
  botonRegresar: { padding: 16, marginTop: 10 },

  encabezado: { 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingBottom: 30 
  },
  iconoContenedor: { 
    backgroundColor: '#FFF3E0', 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  titulo: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1A237E', 
    marginBottom: 8 
  },
  subtitulo: { 
    fontSize: 14, 
    color: '#757575', 
    textAlign: 'center' 
  },

  formulario: { 
    backgroundColor: '#FFFFFF', 
    marginHorizontal: 16, 
    marginTop: 16, 
    borderRadius: 14, 
    padding: 20,
    elevation: 2 
  },
  etiqueta: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#424242', 
    marginBottom: 8, 
    marginTop: 16 
  },
  inputContenedor: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 10, 
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA' 
  },
  inputIcono: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    paddingVertical: 14, 
    fontSize: 15, 
    color: '#212121' 
  },

  indicadoresContenedor: { 
    marginTop: 16, 
    marginBottom: 8 
  },
  indicadoresTitulo: { 
    fontSize: 13, 
    color: '#757575', 
    marginBottom: 8 
  },
  indicadoresLista: { 
    paddingLeft: 4 
  },
  indicador: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  textoIndicador: { 
    fontSize: 12, 
    color: '#757575', 
    marginLeft: 6 
  },
  indicadorOk: { 
    color: '#4CAF50' 
  },

  coincidenciaContenedor: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    borderRadius: 8, 
    marginTop: 12 
  },
  coincidenciaValida: { 
    backgroundColor: '#E8F5E9' 
  },
  coincidenciaInvalida: { 
    backgroundColor: '#FFEBEE' 
  },
  textoCoincidencia: { 
    fontSize: 13, 
    fontWeight: '500' 
  },
  textoCoincidenciaValida: { 
    color: '#2E7D32' 
  },
  textoCoincidenciaInvalida: { 
    color: '#D32F2F' 
  },

  infoBox: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    backgroundColor: '#E8F5E9', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 20 
  },
  infoTexto: { 
    flex: 1, 
    fontSize: 12, 
    color: '#2E7D32', 
    lineHeight: 16 
  },

  botonesContenedor: { 
    marginHorizontal: 16, 
    marginTop: 30 
  },
  botonPrincipal: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FF9800', 
    paddingVertical: 16, 
    borderRadius: 12, 
    marginBottom: 12 
  },
  botonDeshabilitado: { 
    backgroundColor: '#B0BEC5' 
  },
  botonIcono: { 
    marginRight: 8 
  },
  botonTexto: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#FFFFFF' 
  },
  botonSecundario: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'transparent', 
    paddingVertical: 14 
  },
  botonSecundarioIcono: { 
    marginRight: 8 
  },
  botonSecundarioTexto: { 
    fontSize: 15, 
    color: '#757575' 
  },
});

export default CambiarPasswordScreen;