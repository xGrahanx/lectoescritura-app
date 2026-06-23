/**
 * RestablecerPasswordScreen.jsx - Pantalla para restablecer contraseña
 *
 * Paso 3: Ingresar nueva contraseña después de validar código
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

const RestablecerPasswordScreen = ({ navigation, route }) => {
  const { correo, codigo } = route.params || {};
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Validar fortaleza de contraseña
  const validarPassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, message: 'Ingresa una contraseña' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const messages = {
      1: 'Muy débil',
      2: 'Débil',
      3: 'Aceptable',
      4: 'Fuerte',
    };

    return {
      score,
      message: messages[score] || 'Muy débil',
      color: score <= 1 ? '#F44336' : score <= 2 ? '#FF9800' : score <= 3 ? '#FFC107' : '#4CAF50',
    };
  };

  const handleRestablecer = async () => {
    // Validaciones
    if (!nuevaPassword || !confirmarPassword) {
      Alert.alert('Campos requeridos', 'Por favor ingresa y confirma tu nueva contraseña.');
      return;
    }

    if (!validarPassword(nuevaPassword)) {
      Alert.alert(
        'Contraseña inválida',
        'La contraseña debe tener al menos:\n• 8 caracteres\n• 1 letra mayúscula\n• 1 número'
      );
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      Alert.alert('Contraseñas no coinciden', 'Las contraseñas ingresadas no son iguales.');
      return;
    }

    setCargando(true);
    try {
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/restablecer`,
        {
          correo: correo.toLowerCase().trim(),
          codigo,
          nuevaPassword,
          confirmarPassword,
        },
        { timeout: API_CONFIG.TIMEOUT }
      );

      if (data.success) {
        Alert.alert(
          '¡Contraseña restablecida!',
          data.mensaje,
          [
            {
              text: 'Iniciar sesión',
              onPress: () => {
                // Limpiar stack de navegación y volver al login
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'No se pudo restablecer la contraseña.');
      }

    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo restablecer la contraseña. Intenta nuevamente.';
      Alert.alert('Error', mensaje);
      
      // Si el código ya fue usado o expiró
      if (error.response?.status === 400) {
        setTimeout(() => {
          navigation.navigate('RecuperarPassword');
        }, 2000);
      }
    } finally {
      setCargando(false);
    }
  };

  const strength = getPasswordStrength(nuevaPassword);

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
            <MaterialCommunityIcons name="lock" size={60} color="#4A90D9" />
          </View>
          <Text style={styles.titulo}>Nueva Contraseña</Text>
          <Text style={styles.subtitulo}>
            Crea una nueva contraseña segura para tu cuenta
          </Text>
          <Text style={styles.correo}>{correo}</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formulario}>
          {/* Nueva contraseña */}
          <Text style={styles.etiqueta}>Nueva contraseña</Text>
          <View style={styles.inputContenedor}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#9E9E9E" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="Ingresa nueva contraseña"
              value={nuevaPassword}
              onChangeText={setNuevaPassword}
              secureTextEntry={!mostrarNuevaPassword}
              placeholderTextColor="#BDBDBD"
              editable={!cargando}
            />
            <TouchableOpacity onPress={() => setMostrarNuevaPassword(!mostrarNuevaPassword)}>
              <MaterialCommunityIcons name={mostrarNuevaPassword ? 'eye-off' : 'eye'} size={20} color="#9E9E9E" />
            </TouchableOpacity>
          </View>

          {/* Indicador de fortaleza */}
          {nuevaPassword.length > 0 && (
            <View style={styles.fortalezaContenedor}>
              <View style={styles.fortalezaBarraContenedor}>
                {[1, 2, 3, 4].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.fortalezaBarra,
                      {
                        backgroundColor: level <= strength.score ? strength.color : '#E0E0E0',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.fortalezaTexto, { color: strength.color }]}>
                Fortaleza: {strength.message}
              </Text>
            </View>
          )}

          {/* Confirmar contraseña */}
          <Text style={styles.etiqueta}>Confirmar contraseña</Text>
          <View style={styles.inputContenedor}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#9E9E9E" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="Confirma tu contraseña"
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              secureTextEntry={!mostrarConfirmarPassword}
              placeholderTextColor="#BDBDBD"
              editable={!cargando}
            />
            <TouchableOpacity onPress={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}>
              <MaterialCommunityIcons name={mostrarConfirmarPassword ? 'eye-off' : 'eye'} size={20} color="#9E9E9E" />
            </TouchableOpacity>
          </View>

          {/* Indicador de coincidencia */}
          {nuevaPassword && confirmarPassword && (
            <View style={[
              styles.coincidenciaContenedor,
              nuevaPassword === confirmarPassword 
                ? styles.coincidenciaValida 
                : styles.coincidenciaInvalida
            ]}>
              <MaterialCommunityIcons
                name={nuevaPassword === confirmarPassword ? 'check-circle' : 'alert-circle'}
                size={16}
                color={nuevaPassword === confirmarPassword ? '#4CAF50' : '#F44336'}
              />
              <Text style={[
                styles.coincidenciaTexto,
                { color: nuevaPassword === confirmarPassword ? '#4CAF50' : '#F44336' }
              ]}>
                {nuevaPassword === confirmarPassword 
                  ? 'Las contraseñas coinciden'
                  : 'Las contraseñas no coinciden'
                }
              </Text>
            </View>
          )}

          {/* Requisitos de contraseña */}
          <View style={styles.requisitosContenedor}>
            <Text style={styles.requisitosTitulo}>La contraseña debe incluir:</Text>
            <View style={styles.requisitosLista}>
              <View style={styles.requisito}>
                <MaterialCommunityIcons
                  name={nuevaPassword.length >= 8 ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={nuevaPassword.length >= 8 ? '#4CAF50' : '#9E9E9E'}
                />
                <Text style={[
                  styles.requisitoTexto,
                  nuevaPassword.length >= 8 && styles.requisitoCumplido
                ]}>
                  Al menos 8 caracteres
                </Text>
              </View>
              <View style={styles.requisito}>
                <MaterialCommunityIcons
                  name={/[A-Z]/.test(nuevaPassword) ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={/[A-Z]/.test(nuevaPassword) ? '#4CAF50' : '#9E9E9E'}
                />
                <Text style={[
                  styles.requisitoTexto,
                  /[A-Z]/.test(nuevaPassword) && styles.requisitoCumplido
                ]}>
                  Al menos 1 letra mayúscula
                </Text>
              </View>
              <View style={styles.requisito}>
                <MaterialCommunityIcons
                  name={/\d/.test(nuevaPassword) ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={/\d/.test(nuevaPassword) ? '#4CAF50' : '#9E9E9E'}
                />
                <Text style={[
                  styles.requisitoTexto,
                  /\d/.test(nuevaPassword) && styles.requisitoCumplido
                ]}>
                  Al menos 1 número
                </Text>
              </View>
            </View>
          </View>

          {/* Botones */}
          <TouchableOpacity
            style={[
              styles.botonPrincipal,
              cargando && styles.botonDeshabilitado,
              (!validarPassword(nuevaPassword) || nuevaPassword !== confirmarPassword) && styles.botonDeshabilitado,
            ]}
            onPress={handleRestablecer}
            disabled={
              cargando || 
              !validarPassword(nuevaPassword) || 
              nuevaPassword !== confirmarPassword
            }
          >
            {cargando
              ? <ActivityIndicator color="#FFFFFF" />
              : (
                <>
                  <MaterialCommunityIcons name="lock" size={20} color="#FFFFFF" style={styles.botonIcono} />
                  <Text style={styles.botonTexto}>Restablecer contraseña</Text>
                </>
              )
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonSecundario}
            onPress={() => navigation.navigate('ValidarCodigo', { correo })}
            disabled={cargando}
          >
            <MaterialCommunityIcons name="arrow-left" size={16} color="#4A90D9" style={styles.botonSecundarioIcono} />
            <Text style={styles.botonSecundarioTexto}>Volver a validar código</Text>
          </TouchableOpacity>
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
  },
  correo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    marginTop: 4,
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
    marginTop: 12,
  },
  inputContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
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
  fortalezaContenedor: {
    marginBottom: 16,
  },
  fortalezaBarraContenedor: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  fortalezaBarra: {
    flex: 1,
    height: 4,
    marginRight: 4,
    borderRadius: 2,
  },
  fortalezaTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  coincidenciaContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  coincidenciaValida: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  coincidenciaInvalida: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  coincidenciaTexto: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  requisitosContenedor: {
    marginBottom: 24,
  },
  requisitosTitulo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 8,
  },
  requisitosLista: {
    marginLeft: 8,
  },
  requisito: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requisitoTexto: {
    fontSize: 13,
    color: '#9E9E9E',
    marginLeft: 8,
  },
  requisitoCumplido: {
    color: '#4CAF50',
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
});

export default RestablecerPasswordScreen;
