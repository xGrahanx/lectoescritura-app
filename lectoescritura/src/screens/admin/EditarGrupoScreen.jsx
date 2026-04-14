/**
 * EditarGrupoScreen.jsx - Editar nombre y docente de un grupo existente
 *
 * Permite al administrador cambiar el nombre del grupo
 * o reasignarlo a otro docente.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';

const EditarGrupoScreen = ({ route, navigation }) => {
  const { grupo } = route.params;

  const [nombre, setNombre]           = useState(grupo.nombre);
  const [docentes, setDocentes]       = useState([]);
  const [docenteId, setDocenteId]     = useState(grupo.docente?.id || null);
  const [cargando, setCargando]       = useState(false);
  const [cargandoDoc, setCargandoDoc] = useState(true);

  // Cargar lista de docentes disponibles
  useEffect(() => {
    const cargarDocentes = async () => {
      try {
        const { data } = await axios.get(`${API_CONFIG.BASE_URL}/usuarios`, {
          timeout: API_CONFIG.TIMEOUT,
        });
        setDocentes(data.filter(u => u.rol === 'docente'));
      } catch {
        Alert.alert('Error', 'No se pudieron cargar los docentes.');
      } finally {
        setCargandoDoc(false);
      }
    };
    cargarDocentes();
  }, []);

  const guardarCambios = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campo requerido', 'El nombre del grupo no puede estar vacio.');
      return;
    }
    if (!docenteId) {
      Alert.alert('Docente requerido', 'Selecciona un docente para el grupo.');
      return;
    }

    setCargando(true);
    try {
      await axios.put(
        `${API_CONFIG.BASE_URL}/grupos/${grupo.id}`,
        { nombre: nombre.trim(), docenteId },
        { timeout: API_CONFIG.TIMEOUT }
      );
      Alert.alert('Grupo actualizado', `El grupo "${nombre}" fue actualizado correctamente.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo actualizar el grupo.';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.contenedor}>
        <View style={styles.barraTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
          </TouchableOpacity>
          <Text style={styles.tituloBar}>Editar grupo</Text>
          <View />
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.etiqueta}>Nombre del grupo *</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: 3er Grado - Seccion A"
            placeholderTextColor="#BDBDBD"
          />

          <Text style={styles.etiqueta}>Docente responsable *</Text>
          {cargandoDoc ? (
            <ActivityIndicator color="#6A1B9A" style={{ marginVertical: 16 }} />
          ) : docentes.length === 0 ? (
            <View style={styles.sinDocentes}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#FF9800" />
              <Text style={styles.textoSinDocentes}>  No hay docentes registrados</Text>
            </View>
          ) : (
            docentes.map(doc => (
              <TouchableOpacity
                key={doc.id}
                style={[styles.tarjetaDocente, docenteId === doc.id && styles.docenteSeleccionado]}
                onPress={() => setDocenteId(doc.id)}
              >
                <View style={styles.avatarDocente}>
                  <Text style={styles.inicialDocente}>{doc.nombre.charAt(0)}</Text>
                </View>
                <View style={styles.infoDocente}>
                  <Text style={styles.nombreDocente}>{doc.nombre} {doc.apellido}</Text>
                  <Text style={styles.correoDocente}>{doc.correo}</Text>
                </View>
                {docenteId === doc.id && (
                  <MaterialCommunityIcons name="check-circle" size={22} color="#6A1B9A" />
                )}
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            style={[styles.botonGuardar, cargando && styles.botonDeshabilitado]}
            onPress={guardarCambios}
            disabled={cargando}
          >
            {cargando
              ? <ActivityIndicator color="#FFFFFF" />
              : <><MaterialCommunityIcons name="content-save" size={18} color="#FFFFFF" /><Text style={styles.botonTexto}>  Guardar cambios</Text></>
            }
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  barraTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', padding: 16, paddingTop: 50, elevation: 2,
  },
  tituloBar: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  scroll: { padding: 16 },
  etiqueta: { fontSize: 14, fontWeight: '600', color: '#424242', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#E0E0E0', paddingHorizontal: 14, height: 48, fontSize: 15, color: '#212121',
  },
  tarjetaDocente: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
    borderWidth: 2, borderColor: 'transparent', elevation: 1,
  },
  docenteSeleccionado: { borderColor: '#6A1B9A', backgroundColor: '#F3E5F5' },
  avatarDocente: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  inicialDocente: { fontSize: 16, fontWeight: 'bold', color: '#3949AB' },
  infoDocente: { flex: 1 },
  nombreDocente: { fontSize: 14, fontWeight: '600', color: '#212121' },
  correoDocente: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  sinDocentes: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E1',
    borderRadius: 10, padding: 14, marginBottom: 8,
  },
  textoSinDocentes: { fontSize: 13, color: '#F57F17' },
  botonGuardar: {
    backgroundColor: '#1A237E', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24,
  },
  botonDeshabilitado: { backgroundColor: '#9FA8DA' },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default EditarGrupoScreen;
