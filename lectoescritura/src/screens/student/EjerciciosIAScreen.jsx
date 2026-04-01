/**
 * EjerciciosIAScreen.jsx - Modulo de Ejercicios generados por Inteligencia Artificial
 *
 * La IA genera ejercicios personalizados segun el nivel y los errores
 * frecuentes del estudiante. Los ejercicios se adaptan dinamicamente
 * para reforzar las areas de mayor dificultad.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TIPOS_EJERCICIO_IA = [
  { id: 'sinonimos', titulo: 'Sinonimos y Antonimos', descripcion: 'La IA genera pares de palabras segun tu nivel', icono: 'swap-horizontal', color: '#4A90D9' },
  { id: 'oraciones', titulo: 'Construye oraciones', descripcion: 'Ordena palabras para formar oraciones correctas', icono: 'sort', color: '#E91E63' },
  { id: 'acentuacion', titulo: 'Acentuacion', descripcion: 'Practica el uso correcto de tildes', icono: 'format-letter-case-upper', color: '#FF9800' },
  { id: 'comprension', titulo: 'Comprension rapida', descripcion: 'Micro-textos con preguntas de comprension', icono: 'lightning-bolt', color: '#9C27B0' },
];

const EJERCICIO_GENERADO_EJEMPLO = {
  tipo: 'sinonimos',
  instruccion: 'Selecciona el sinonimo correcto para cada palabra:',
  preguntas: [
    { id: 1, palabra: 'Feliz', opciones: ['Triste', 'Contento', 'Enojado', 'Cansado'], correcta: 1 },
    { id: 2, palabra: 'Rapido', opciones: ['Lento', 'Veloz', 'Pesado', 'Quieto'], correcta: 1 },
    { id: 3, palabra: 'Grande', opciones: ['Pequeno', 'Enorme', 'Delgado', 'Corto'], correcta: 1 },
  ],
};

const EjerciciosIAScreen = () => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [ejercicio, setEjercicio] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const generarEjercicio = async (tipo) => {
    setTipoSeleccionado(tipo);
    setGenerando(true);
    setEjercicio(null);
    setRespuestas({});
    setMostrarResultado(false);
    try {
      // TODO: Llamar al servicio de IA para generar ejercicio personalizado
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEjercicio(EJERCICIO_GENERADO_EJEMPLO);
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el ejercicio. Intenta de nuevo.');
      setTipoSeleccionado(null);
    } finally {
      setGenerando(false);
    }
  };

  const verificarRespuestas = () => {
    if (Object.keys(respuestas).length < ejercicio.preguntas.length) {
      Alert.alert('Incompleto', 'Responde todas las preguntas antes de verificar.');
      return;
    }
    setMostrarResultado(true);
  };

  const calcularPuntaje = () => {
    if (!ejercicio) return 0;
    const correctas = ejercicio.preguntas.filter(p => respuestas[p.id] === p.correcta).length;
    return Math.round((correctas / ejercicio.preguntas.length) * 100);
  };

  // --- SELECCION DE TIPO --------------------------------------------------------
  if (!tipoSeleccionado && !generando) {
    return (
      <ScrollView style={styles.contenedor}>
        <View style={styles.encabezado}>
          <View style={styles.tituloRow}>
            <MaterialCommunityIcons name="robot" size={26} color="#1A237E" />
            <Text style={styles.titulo}> Ejercicios con IA</Text>
          </View>
          <Text style={styles.subtitulo}>La inteligencia artificial genera ejercicios personalizados segun tu nivel y tus errores frecuentes.</Text>
        </View>
        <View style={styles.tarjetaNivel}>
          <MaterialCommunityIcons name="trending-up" size={24} color="#4CAF50" />
          <View style={styles.infoNivel}>
            <Text style={styles.textoNivelActual}>Tu nivel actual: Basico-Intermedio</Text>
            <Text style={styles.textoAreaMejora}>Area a reforzar: Acentuacion y tildes</Text>
          </View>
        </View>
        <Text style={styles.tituloSeccion}>Elige un tipo de ejercicio:</Text>
        {TIPOS_EJERCICIO_IA.map(tipo => (
          <TouchableOpacity key={tipo.id} style={styles.tarjetaTipo} onPress={() => generarEjercicio(tipo.id)}>
            <View style={[styles.iconoTipo, { backgroundColor: tipo.color + '20' }]}>
              <MaterialCommunityIcons name={tipo.icono} size={28} color={tipo.color} />
            </View>
            <View style={styles.infoTipo}>
              <Text style={styles.tituloTipo}>{tipo.titulo}</Text>
              <Text style={styles.descripcionTipo}>{tipo.descripcion}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#BDBDBD" />
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    );
  }

  // --- GENERANDO ----------------------------------------------------------------
  if (generando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.textoCargando}>La IA esta generando tu ejercicio...</Text>
        <Text style={styles.subTextoCargando}>Personalizando segun tu historial de aprendizaje</Text>
      </View>
    );
  }

  // --- EJERCICIO ----------------------------------------------------------------
  if (ejercicio && !mostrarResultado) {
    return (
      <View style={styles.contenedor}>
        <View style={styles.barraTop}>
          <TouchableOpacity onPress={() => setTipoSeleccionado(null)}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
          </TouchableOpacity>
          <Text style={styles.tituloBar}>Ejercicio IA</Text>
          <View style={styles.etiquetaIA}>
            <MaterialCommunityIcons name="robot" size={14} color="#9C27B0" />
            <Text style={styles.textoIA}> IA</Text>
          </View>
        </View>
        <ScrollView style={styles.scrollEjercicio}>
          <Text style={styles.instruccion}>{ejercicio.instruccion}</Text>
          {ejercicio.preguntas.map((pregunta, index) => (
            <View key={pregunta.id} style={styles.tarjetaPregunta}>
              <Text style={styles.numeroPregunta}>Pregunta {index + 1}</Text>
              <Text style={styles.palabraPregunta}>{pregunta.palabra}</Text>
              <View style={styles.opciones}>
                {pregunta.opciones.map((opcion, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.opcion, respuestas[pregunta.id] === i && styles.opcionSeleccionada]}
                    onPress={() => setRespuestas(prev => ({ ...prev, [pregunta.id]: i }))}
                  >
                    <Text style={[styles.textoOpcion, respuestas[pregunta.id] === i && styles.textoOpcionActivo]}>
                      {opcion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.botonVerificar} onPress={verificarRespuestas}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
            <Text style={styles.botonTexto}>  Verificar respuestas</Text>
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    );
  }

  // --- RESULTADO ----------------------------------------------------------------
  const puntaje = calcularPuntaje();
  return (
    <ScrollView contentContainerStyle={styles.scrollResultado}>
      <View style={[styles.circuloPuntaje, { borderColor: puntaje >= 70 ? '#4CAF50' : '#FF9800' }]}>
        <Text style={styles.numeroPuntaje}>{puntaje}%</Text>
        <Text style={styles.etiquetaPuntaje}>Puntaje</Text>
      </View>
      <Text style={styles.tituloResultado}>{puntaje >= 70 ? 'Excelente trabajo!' : 'Sigue practicando!'}</Text>
      {ejercicio.preguntas.map((pregunta) => {
        const esCorrecta = respuestas[pregunta.id] === pregunta.correcta;
        return (
          <View key={pregunta.id} style={[styles.revisionItem, { borderLeftColor: esCorrecta ? '#4CAF50' : '#F44336' }]}>
            <MaterialCommunityIcons name={esCorrecta ? 'check-circle' : 'close-circle'} size={20} color={esCorrecta ? '#4CAF50' : '#F44336'} />
            <View style={styles.infoRevision}>
              <Text style={styles.palabraRevision}>{pregunta.palabra}</Text>
              <Text style={styles.respuestaRevision}>Respuesta correcta: {pregunta.opciones[pregunta.correcta]}</Text>
            </View>
          </View>
        );
      })}
      <TouchableOpacity style={styles.botonNuevo} onPress={() => setTipoSeleccionado(null)}>
        <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
        <Text style={styles.botonTexto}>  Nuevo ejercicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50 },
  tituloRow: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  subtitulo: { fontSize: 13, color: '#757575', marginTop: 4, lineHeight: 20 },
  tarjetaNivel: { backgroundColor: '#E8F5E9', margin: 16, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center' },
  infoNivel: { flex: 1 },
  textoNivelActual: { fontSize: 14, fontWeight: '600', color: '#2E7D32' },
  textoAreaMejora: { fontSize: 12, color: '#4CAF50', marginTop: 2 },
  tituloSeccion: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginHorizontal: 16, marginBottom: 8 },
  tarjetaTipo: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 2,
  },
  iconoTipo: { width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  infoTipo: { flex: 1 },
  tituloTipo: { fontSize: 15, fontWeight: '600', color: '#212121' },
  descripcionTipo: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  cargando: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F9FF' },
  textoCargando: { fontSize: 16, fontWeight: '600', color: '#6A1B9A' },
  subTextoCargando: { fontSize: 13, color: '#9E9E9E' },
  barraTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', padding: 16, paddingTop: 50, elevation: 2,
  },
  tituloBar: { fontSize: 16, fontWeight: 'bold', color: '#212121', flex: 1, marginHorizontal: 12 },
  etiquetaIA: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  textoIA: { fontSize: 12, color: '#9C27B0', fontWeight: 'bold' },
  scrollEjercicio: { padding: 16 },
  instruccion: { fontSize: 15, color: '#424242', marginBottom: 16, lineHeight: 22 },
  tarjetaPregunta: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  numeroPregunta: { fontSize: 12, color: '#9C27B0', fontWeight: 'bold', marginBottom: 4 },
  palabraPregunta: { fontSize: 20, fontWeight: 'bold', color: '#1A237E', marginBottom: 12 },
  opciones: { flexDirection: 'row', flexWrap: 'wrap' },
  opcion: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FAFAFA' },
  opcionSeleccionada: { backgroundColor: '#9C27B0', borderColor: '#9C27B0' },
  textoOpcion: { fontSize: 14, color: '#424242' },
  textoOpcionActivo: { color: '#FFFFFF', fontWeight: '600' },
  botonVerificar: {
    backgroundColor: '#9C27B0', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  scrollResultado: { alignItems: 'center', padding: 24 },
  circuloPuntaje: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 6,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16, backgroundColor: '#FFFFFF',
  },
  numeroPuntaje: { fontSize: 32, fontWeight: 'bold', color: '#1A237E' },
  etiquetaPuntaje: { fontSize: 12, color: '#757575' },
  tituloResultado: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginBottom: 20 },
  revisionItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 10, padding: 12, width: '100%', marginBottom: 8, borderLeftWidth: 4, elevation: 1,
  },
  infoRevision: { flex: 1 },
  palabraRevision: { fontSize: 15, fontWeight: '600', color: '#212121' },
  respuestaRevision: { fontSize: 12, color: '#757575', marginTop: 2 },
  botonNuevo: {
    backgroundColor: '#9C27B0', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 12,
  },
});

export default EjerciciosIAScreen;
