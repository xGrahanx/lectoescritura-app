/**
 * RecuperarPasswordScreen.jsx - Pantalla de recuperacion de contrasena
 *
 * El usuario ingresa su correo y recibe un enlace para restablecer su contrasena.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RecuperarPasswordScreen = ({ navigation }) => {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async () => {
    if (!correo.trim()) {
      Alert.alert('Campo requerido', 'Ingresa tu correo electronico.');
      return;
    }
    setCargando(true);
    try {
      // TODO: Llamar al endpoint de recuperacion de contrasena
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEnviado(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el correo. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
      </TouchableOpacity>

      <View style={styles.iconoContenedor}>
        <MaterialCommunityIcons name="lock-reset" size={60} color="#4A90D9" />
      </View>

      <Text style={styles.titulo}>Recuperar contrasena</Text>

      {!enviado ? (
        <>
          <Text style={styles.descripcion}>
            Ingresa tu correo electronico y te enviaremos instrucciones para restablecer tu contrasena.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="correo@escuela.edu"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#BDBDBD"
          />
          <TouchableOpacity
            style={[styles.boton, cargando && styles.botonDeshabilitado]}
            onPress={handleEnviar}
            disabled={cargando}
          >
            {cargando
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.botonTexto}>Enviar instrucciones</Text>
            }
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.confirmacion}>
          <MaterialCommunityIcons name="check-circle" size={50} color="#4CAF50" />
          <Text style={styles.textoConfirmacion}>
            Hemos enviado las instrucciones a {correo}. Revisa tu bandeja de entrada.
          </Text>
          <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.botonTexto}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF', padding: 24, paddingTop: 50 },
  botonVolver: { marginBottom: 24 },
  iconoContenedor: { alignItems: 'center', marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E', marginBottom: 12, textAlign: 'center' },
  descripcion: { fontSize: 14, color: '#757575', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 14, height: 48, fontSize: 15, color: '#212121',
    backgroundColor: '#FFFFFF', marginBottom: 16,
  },
  boton: { backgroundColor: '#4A90D9', borderRadius: 10, height: 50, justifyContent: 'center', alignItems: 'center' },
  botonDeshabilitado: { backgroundColor: '#90CAF9' },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  confirmacion: { alignItems: 'center' },
  textoConfirmacion: { fontSize: 14, color: '#424242', textAlign: 'center', lineHeight: 22 },
});

export default RecuperarPasswordScreen;
