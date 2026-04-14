/**
 * CrearGrupoScreen.jsx - Crear nuevo grupo/seccion
 *
 * El admin define el nombre del grupo y selecciona el docente responsable.
 * Los estudiantes se agregan despues desde DetalleGrupoScreen.
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

const CrearGrupoScreen = ({ navigation }) => {
  const [nombre, setNombre]           = useState('');
  const [docentes, setDocentes]       = useState([]);
  const [docenteId, setDocenteId]     = useState(null);
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

  const crearGrupo = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre del grupo.');
      return;
    }
    if (!docenteId) {
      Alert.alert('Docente requerido', 'Selecciona un docente para el grupo.');
      return;
    }

    setCargando(true);
    try {
      await axios.post(
        `${API_CONFIG.BASE_URL}/grupos`,
        { nombre: nombre.trim(), docenteId },
        { timeout: API_CONFIG.TIMEOUT }
      );
      Alert.alert('Grupo creado', `El grupo "${nombre}" fue creado exitosamente.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo crear el grupo.';
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
          <Text style={styles.tituloBar}>Crear grupo</Text>
          <View />
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.etiqueta}>Nombre del grupo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 3er Grado - Seccion A"
            value={nombre}
            onChangeText={setNombre}
            placeholderTextColor="#BDBDBD"
          />

          <Text style={styles.etiqueta}>Docente responsable *</Text>
          {cargandoDoc ? (
            <ActivityIndicator color="#6A1B9A" style={{ marginVertical: 16 }} />
          ) : docentes.length === 0 ? (
            <View style={styles.sinDocentes}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#FF9800" />
              <Text style={styles.textoSinDocentes}>  No hay docentes registrados aun</Text>
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

          <View style={styles.notaInfo}>
            <MaterialCommunityIcons name="information" size={16} color="#4A90D9" />
            <Text style={styles.textoNota}>
              Despues de crear el grupo podras agregar estudiantes desde el detalle del grupo.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.botonCrear, cargando && styles.botonDeshabilitado]}
            onPress={crearGrupo}
            disabled={cargando}
          >
            {cargando
              ? <ActivityIndicator color="#FFFFFF" />
              : <><MaterialCommunityIcons name="plus-circle" size={18} color="#FFFFFF" /><Text style={styles.botonTexto}>  Crear grupo</Text></>
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
  notaInfo: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#E3F2FD',
    borderRadius: 10, padding: 12, marginTop: 16, marginBottom: 16,
  },
  textoNota: { flex: 1, fontSize: 12, color: '#1565C0', lineHeight: 18, marginLeft: 8 },
  botonCrear: {
    backgroundColor: '#6A1B9A', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  botonDeshabilitado: { backgroundColor: '#CE93D8' },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default CrearGrupoScreen;
