/**
 * EditarPerfilScreen.jsx - Pantalla para editar perfil del docente
 * 
 * Permite actualizar nombre, apellido y otros datos básicos
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

const EditarPerfilScreen = ({ navigation }) => {
  const { usuario, actualizarUsuario } = useAuth();
  const [cargando, setCargando] = useState(false);
  
  // Estado para los campos del formulario
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [apellido, setApellido] = useState(usuario?.apellido || '');
  const [correo, setCorreo] = useState(usuario?.correo || '');

  const handleGuardarCambios = async () => {
    // Validaciones básicas
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert('Campos requeridos', 'Nombre y apellido son obligatorios');
      return;
    }

    const regexNombre = /^[a-zA-Z\s]{2,50}$/;
    if (!regexNombre.test(nombre.trim())) {
      Alert.alert('Nombre inválido', 'El nombre solo puede contener letras y debe tener al menos 2 caracteres');
      return;
    }
    if (!regexNombre.test(apellido.trim())) {
      Alert.alert('Apellido inválido', 'El apellido solo puede contener letras y debe tener al menos 2 caracteres');
      return;
    }

    setCargando(true);
    try {
      const { data } = await axios.put(
        `${API_CONFIG.BASE_URL}/usuarios/${usuario.id}/perfil`,
        {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
        },
        { timeout: API_CONFIG.TIMEOUT }
      );

      // Actualizar contexto de autenticación
      actualizarUsuario({
        ...usuario,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
      });

      Alert.alert(
        'Perfil actualizado',
        'Tus datos se han actualizado correctamente.',
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      
      let mensajeError = 'Error al actualizar el perfil';
      if (error.response?.status === 400) {
        mensajeError = 'Datos inválidos. Verifica la información.';
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
            <MaterialCommunityIcons name="account-edit" size={60} color="#4A90D9" />
          </View>
          <Text style={styles.titulo}>Editar Perfil</Text>
          <Text style={styles.subtitulo}>
            Actualiza tu información personal
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formulario}>
          {/* Nombre */}
          <Text style={styles.etiqueta}>Nombre</Text>
          <View style={styles.inputContenedor}>
            <MaterialCommunityIcons name="account" size={20} color="#9E9E9E" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="Tu nombre"
              value={nombre}
              onChangeText={setNombre}
              maxLength={50}
              autoCapitalize="words"
            />
          </View>

          {/* Apellido */}
          <Text style={styles.etiqueta}>Apellido</Text>
          <View style={styles.inputContenedor}>
            <MaterialCommunityIcons name="account" size={20} color="#9E9E9E" style={styles.inputIcono} />
            <TextInput
              style={styles.input}
              placeholder="Tu apellido"
              value={apellido}
              onChangeText={setApellido}
              maxLength={50}
              autoCapitalize="words"
            />
          </View>

          {/* Correo (solo lectura) */}
          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <View style={[styles.inputContenedor, styles.inputDeshabilitado]}>
            <MaterialCommunityIcons name="email" size={20} color="#9E9E9E" style={styles.inputIcono} />
            <TextInput
              style={[styles.input, styles.textoDeshabilitado]}
              value={correo}
              editable={false}
              selectTextOnFocus={false}
            />
            <Text style={styles.textoSoloLectura}>No editable</Text>
          </View>

          {/* Información */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information" size={16} color="#2196F3" />
            <Text style={styles.infoTexto}>
              {' '}El correo electrónico no puede ser modificado por seguridad.
              Contacta al administrador si necesitas cambiarlo.
            </Text>
          </View>
        </View>

        {/* Botones */}
        <View style={styles.botonesContenedor}>
          {/* Botón principal: Guardar cambios */}
          <TouchableOpacity
            style={[
              styles.botonPrincipal,
              cargando && styles.botonDeshabilitado
            ]}
            onPress={handleGuardarCambios}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" style={styles.botonIcono} />
                <Text style={styles.botonTexto}>Guardar cambios</Text>
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
    backgroundColor: '#E8F5E9', 
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
  inputDeshabilitado: { 
    backgroundColor: '#F5F5F5' 
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
  textoDeshabilitado: { 
    color: '#9E9E9E' 
  },
  textoSoloLectura: { 
    fontSize: 12, 
    color: '#757575', 
    marginLeft: 10 
  },

  infoBox: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    backgroundColor: '#E3F2FD', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 20 
  },
  infoTexto: { 
    flex: 1, 
    fontSize: 12, 
    color: '#1976D2', 
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
    backgroundColor: '#4A90D9', 
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

export default EditarPerfilScreen;