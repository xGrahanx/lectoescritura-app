/**
 * AsignarTareaScreen.jsx - Pantalla para asignar tareas adicionales
 *
 * El docente puede asignar tareas a estudiantes con alto rendimiento.
 * Puede elegir entre plantillas predefinidas o crear una tarea personalizada.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PLANTILLAS_TAREAS = [
  { id: 1, titulo: 'Lectura avanzada: Fabulas de Esopo', tipo: 'lectura', descripcion: 'Lee las primeras 3 fabulas y responde las preguntas de comprension.', nivel: 'Avanzado' },
  { id: 2, titulo: 'Redaccion extendida', tipo: 'escritura', descripcion: 'Escribe una redaccion de al menos 15 oraciones sobre un tema libre.', nivel: 'Avanzado' },
  { id: 3, titulo: 'Poesia: Rima y metrica', tipo: 'especial', descripcion: 'Completa los ejercicios de rima y metrica basica.', nivel: 'Avanzado' },
  { id: 4, titulo: 'Vocabulario enriquecido', tipo: 'ia', descripcion: 'Ejercicios de sinonimos, antonimos y palabras compuestas generados por IA.', nivel: 'Avanzado' },
];

const AsignarTareaScreen = ({ route, navigation }) => {
  const { estudiante } = route.params;
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [modoPersonalizado, setModoPersonalizado] = useState(false);
  const [tituloPersonalizado, setTituloPersonalizado] = useState('');
  const [descripcionPersonalizada, setDescripcionPersonalizada] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [asignando, setAsignando] = useState(false);

  const asignarTarea = async () => {
    const titulo = modoPersonalizado ? tituloPersonalizado : plantillaSeleccionada?.titulo;
    const descripcion = modoPersonalizado ? descripcionPersonalizada : plantillaSeleccionada?.descripcion;
    if (!titulo || !descripcion) {
      Alert.alert('Campos requeridos', 'Por favor completa el titulo y la descripcion de la tarea.');
      return;
    }
    if (!fechaLimite) {
      Alert.alert('Fecha requerida', 'Por favor indica la fecha limite de la tarea.');
      return;
    }
    setAsignando(true);
    try {
      // TODO: Llamar al endpoint de asignacion de tareas
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(
        'Tarea asignada',
        `La tarea "${titulo}" fue asignada a ${estudiante.nombre}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo asignar la tarea. Intenta de nuevo.');
    } finally {
      setAsignando(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.barraTop}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
        </TouchableOpacity>
        <Text style={styles.tituloBar}>Asignar tarea</Text>
        <View />
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.tarjetaEstudiante}>
          <View style={styles.avatarEstudiante}>
            <Text style={styles.inicialAvatar}>{estudiante.nombre.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.nombreEstudiante}>{estudiante.nombre}</Text>
            <Text style={styles.promedioEstudiante}>Promedio: {estudiante.promedio}%</Text>
          </View>
        </View>

        <View style={styles.selectorModo}>
          <TouchableOpacity
            style={[styles.botonModo, !modoPersonalizado && styles.botonModoActivo]}
            onPress={() => setModoPersonalizado(false)}
          >
            <MaterialCommunityIcons name="format-list-bulleted" size={18} color={!modoPersonalizado ? '#FFFFFF' : '#757575'} />
            <Text style={[styles.textoModo, !modoPersonalizado && styles.textoModoActivo]}>Plantillas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botonModo, modoPersonalizado && styles.botonModoActivo]}
            onPress={() => setModoPersonalizado(true)}
          >
            <MaterialCommunityIcons name="pencil-plus" size={18} color={modoPersonalizado ? '#FFFFFF' : '#757575'} />
            <Text style={[styles.textoModo, modoPersonalizado && styles.textoModoActivo]}>Personalizada</Text>
          </TouchableOpacity>
        </View>

        {!modoPersonalizado && (
          <>
            <Text style={styles.etiqueta}>Selecciona una plantilla:</Text>
            {PLANTILLAS_TAREAS.map(plantilla => (
              <TouchableOpacity
                key={plantilla.id}
                style={[styles.tarjetaPlantilla, plantillaSeleccionada?.id === plantilla.id && styles.plantillaSeleccionada]}
                onPress={() => setPlantillaSeleccionada(plantilla)}
              >
                <View style={styles.encabezadoPlantilla}>
                  <Text style={styles.tituloPlantilla}>{plantilla.titulo}</Text>
                  {plantillaSeleccionada?.id === plantilla.id && (
                    <MaterialCommunityIcons name="check-circle" size={20} color="#2E7D32" />
                  )}
                </View>
                <Text style={styles.descripcionPlantilla}>{plantilla.descripcion}</Text>
                <View style={styles.etiquetaNivel}>
                  <Text style={styles.textoNivel}>{plantilla.nivel}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {modoPersonalizado && (
          <>
            <Text style={styles.etiqueta}>Titulo de la tarea</Text>
            <TextInput style={styles.input} placeholder="Ej: Lectura especial: El Quijote" value={tituloPersonalizado} onChangeText={setTituloPersonalizado} placeholderTextColor="#BDBDBD" />
            <Text style={styles.etiqueta}>Descripcion e instrucciones</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              placeholder="Describe que debe hacer el estudiante..."
              value={descripcionPersonalizada} onChangeText={setDescripcionPersonalizada}
              multiline numberOfLines={4} placeholderTextColor="#BDBDBD" textAlignVertical="top"
            />
          </>
        )}

        <Text style={styles.etiqueta}>Fecha limite</Text>
        <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={fechaLimite} onChangeText={setFechaLimite} placeholderTextColor="#BDBDBD" />

        <View style={styles.notaInfo}>
          <MaterialCommunityIcons name="information" size={16} color="#4A90D9" />
          <Text style={styles.textoNota}>El estudiante recibira una notificacion push con la nueva tarea asignada.</Text>
        </View>

        <TouchableOpacity
          style={[styles.botonAsignar, asignando && styles.botonDeshabilitado]}
          onPress={asignarTarea} disabled={asignando}
        >
          {asignando
            ? <ActivityIndicator color="#FFFFFF" />
            : <><MaterialCommunityIcons name="send" size={18} color="#FFFFFF" /><Text style={styles.botonTexto}>  Asignar tarea</Text></>
          }
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  barraTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 16, paddingTop: 50, elevation: 2 },
  tituloBar: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  scroll: { padding: 16 },
  tarjetaEstudiante: { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarEstudiante: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },
  inicialAvatar: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  nombreEstudiante: { fontSize: 15, fontWeight: 'bold', color: '#1B5E20' },
  promedioEstudiante: { fontSize: 12, color: '#2E7D32', marginTop: 2 },
  selectorModo: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, marginBottom: 16, elevation: 1 },
  botonModo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
  botonModoActivo: { backgroundColor: '#2E7D32' },
  textoModo: { fontSize: 14, color: '#757575' },
  textoModoActivo: { color: '#FFFFFF', fontWeight: '600' },
  etiqueta: { fontSize: 14, fontWeight: '600', color: '#424242', marginBottom: 8, marginTop: 4 },
  tarjetaPlantilla: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 2, borderColor: 'transparent', elevation: 2 },
  plantillaSeleccionada: { borderColor: '#2E7D32', backgroundColor: '#F1F8E9' },
  encabezadoPlantilla: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tituloPlantilla: { fontSize: 14, fontWeight: '600', color: '#212121', flex: 1 },
  descripcionPlantilla: { fontSize: 12, color: '#757575', lineHeight: 18, marginBottom: 8 },
  etiquetaNivel: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  textoNivel: { fontSize: 11, color: '#2E7D32', fontWeight: 'bold' },
  input: { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 14, height: 48, fontSize: 15, color: '#212121', marginBottom: 12 },
  inputMultilinea: { height: 100, paddingTop: 12 },
  notaInfo: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#E3F2FD', borderRadius: 10, padding: 12, marginBottom: 16 },
  textoNota: { flex: 1, fontSize: 12, color: '#1565C0', lineHeight: 18 },
  botonAsignar: { backgroundColor: '#2E7D32', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  botonDeshabilitado: { backgroundColor: '#A5D6A7' },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default AsignarTareaScreen;
