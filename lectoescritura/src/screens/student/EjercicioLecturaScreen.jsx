/**
 * EjercicioLecturaScreen.jsx - Pantalla de ejercicio de lectura con IA
 *
 * El estudiante lee un texto y responde preguntas de comprension.
 * La IA (Google Gemini) evalua las respuestas abiertas y genera
 * retroalimentacion personalizada. Los resultados se envian al docente.
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PREGUNTAS_EJEMPLO = [
  { id: 1, tipo: 'opcion_multiple', pregunta: 'Cual es el tema principal del texto?', opciones: ['La amistad', 'La imaginacion infantil', 'Los viajes espaciales', 'Los animales'], respuestaCorrecta: 1 },
  { id: 2, tipo: 'verdadero_falso', pregunta: 'El narrador dibujo una boa que se comio un elefante.', respuestaCorrecta: true },
  { id: 3, tipo: 'respuesta_abierta', pregunta: 'Que crees que quiso decir el autor con "Lo esencial es invisible a los ojos"? Explica con tus propias palabras.' },
];

const EjercicioLecturaScreen = ({ route, navigation }) => {
  const { texto } = route.params;
  const [fase, setFase] = useState('lectura'); // 'lectura' | 'preguntas' | 'resultado'
  const [respuestas, setRespuestas] = useState({});
  const [evaluando, setEvaluando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const guardarRespuesta = (preguntaId, respuesta) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: respuesta }));
  };

  const evaluarRespuestas = async () => {
    const sinResponder = PREGUNTAS_EJEMPLO.filter(p => respuestas[p.id] === undefined);
    if (sinResponder.length > 0) {
      Alert.alert('Preguntas sin responder', 'Por favor responde todas las preguntas antes de continuar.');
      return;
    }
    setEvaluando(true);
    try {
      // TODO: Llamar al servicio de IA para evaluar respuestas
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResultado({
        puntaje: 78,
        retroalimentacion: 'Muy bien. Comprendiste los puntos principales del texto. Tu respuesta sobre el significado de la frase fue reflexiva.',
        errores: ['En la pregunta 1, el tema principal es la imaginacion infantil, no los viajes.'],
        recomendacion: 'Te recomendamos leer "La Tortuga y la Liebre" para reforzar la comprension de moralejas.',
      });
      setFase('resultado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo evaluar. Intenta de nuevo.');
    } finally {
      setEvaluando(false);
    }
  };

  // --- FASE: LECTURA -----------------------------------------------------------
  if (fase === 'lectura') {
    return (
      <View style={styles.contenedor}>
        <View style={styles.barraTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
          </TouchableOpacity>
          <Text style={styles.tituloBar} numberOfLines={1}>{texto.titulo}</Text>
          <View style={[styles.etiquetaNivel, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.textoNivel}>{texto.nivel}</Text>
          </View>
        </View>
        <ScrollView style={styles.scrollTexto}>
          <Text style={styles.autorTexto}>por {texto.autor}</Text>
          <Text style={styles.cuerpoTexto}>
            {`Cuando yo tenia seis anos vi en un libro sobre la selva virgen que se titulaba "Historias vividas", una magnifica lamina. Representaba una serpiente boa que se tragaba a una fiera.\n\nEn el libro se afirmaba: "Las serpientes boas se tragan su presa entera, sin masticarla. Luego ya no pueden moverse y duermen durante los seis meses que dura su digestion."\n\nReflexione mucho en ese entonces sobre las aventuras de la jungla y a mi vez logre trazar con un lapiz de colores mi primer dibujo.\n\nMostre mi obra de arte a las personas mayores y les pregunte si mi dibujo les daba miedo.\n\nMe respondieron: "Por que habria de asustar un sombrero?"\n\nMi dibujo no representaba un sombrero. Representaba una serpiente boa que digeria un elefante.`}
          </Text>
          <TouchableOpacity style={styles.botonContinuar} onPress={() => setFase('preguntas')}>
            <Text style={styles.botonTexto}>Responder preguntas</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    );
  }

  // --- FASE: PREGUNTAS ---------------------------------------------------------
  if (fase === 'preguntas') {
    return (
      <View style={styles.contenedor}>
        <View style={styles.barraTop}>
          <TouchableOpacity onPress={() => setFase('lectura')}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
          </TouchableOpacity>
          <Text style={styles.tituloBar}>Preguntas de comprension</Text>
          <Text style={styles.contadorPreguntas}>{Object.keys(respuestas).length}/{PREGUNTAS_EJEMPLO.length}</Text>
        </View>
        <ScrollView style={styles.scrollPreguntas}>
          {PREGUNTAS_EJEMPLO.map((pregunta, index) => (
            <View key={pregunta.id} style={styles.tarjetaPregunta}>
              <Text style={styles.numeroPregunta}>Pregunta {index + 1}</Text>
              <Text style={styles.textoPregunta}>{pregunta.pregunta}</Text>
              {pregunta.tipo === 'opcion_multiple' && (
                <View style={styles.opciones}>
                  {pregunta.opciones.map((opcion, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.opcion, respuestas[pregunta.id] === i && styles.opcionSeleccionada]}
                      onPress={() => guardarRespuesta(pregunta.id, i)}
                    >
                      <View style={[styles.radio, respuestas[pregunta.id] === i && styles.radioActivo]} />
                      <Text style={styles.textoOpcion}>{opcion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {pregunta.tipo === 'verdadero_falso' && (
                <View style={styles.verdaderoFalso}>
                  {[true, false].map(valor => (
                    <TouchableOpacity
                      key={valor.toString()}
                      style={[styles.botonVF, respuestas[pregunta.id] === valor && (valor ? styles.botonVerdadero : styles.botonFalso)]}
                      onPress={() => guardarRespuesta(pregunta.id, valor)}
                    >
                      <Text style={[styles.textoVF, respuestas[pregunta.id] === valor && styles.textoVFActivo]}>
                        {valor ? 'Verdadero' : 'Falso'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {pregunta.tipo === 'respuesta_abierta' && (
                <TextInput
                  style={styles.inputAbierto}
                  placeholder="Escribe tu respuesta aqui..."
                  multiline numberOfLines={4}
                  value={respuestas[pregunta.id] || ''}
                  onChangeText={text => guardarRespuesta(pregunta.id, text)}
                  placeholderTextColor="#BDBDBD"
                />
              )}
            </View>
          ))}
          <TouchableOpacity
            style={[styles.botonEnviar, evaluando && styles.botonDeshabilitado]}
            onPress={evaluarRespuestas} disabled={evaluando}
          >
            {evaluando
              ? <><ActivityIndicator color="#FFFFFF" /><Text style={styles.botonTexto}>  Evaluando con IA...</Text></>
              : <><MaterialCommunityIcons name="robot" size={20} color="#FFFFFF" /><Text style={styles.botonTexto}>  Enviar y evaluar</Text></>
            }
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    );
  }

  // --- FASE: RESULTADO ---------------------------------------------------------
  return (
    <View style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.scrollResultado}>
        <View style={[styles.circuloPuntaje, { borderColor: resultado.puntaje >= 70 ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.numeroPuntaje}>{resultado.puntaje}%</Text>
          <Text style={styles.etiquetaPuntaje}>Puntaje</Text>
        </View>
        <Text style={styles.tituloResultado}>
          {resultado.puntaje >= 70 ? 'Muy bien hecho!' : 'Sigue practicando'}
        </Text>
        <View style={styles.tarjetaRetro}>
          <View style={styles.encabezadoRetro}>
            <MaterialCommunityIcons name="robot" size={20} color="#9C27B0" />
            <Text style={styles.tituloRetro}>Retroalimentacion de la IA</Text>
          </View>
          <Text style={styles.textoRetro}>{resultado.retroalimentacion}</Text>
        </View>
        {resultado.errores.length > 0 && (
          <View style={styles.tarjetaErrores}>
            <View style={styles.tituloErroresRow}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#C62828" />
              <Text style={styles.tituloErrores}> Puntos a mejorar</Text>
            </View>
            {resultado.errores.map((error, i) => (
              <Text key={i} style={styles.textoError}>- {error}</Text>
            ))}
          </View>
        )}
        <View style={styles.tarjetaRecomendacion}>
          <MaterialCommunityIcons name="lightbulb" size={20} color="#FF9800" />
          <Text style={styles.textoRecomendacion}>{resultado.recomendacion}</Text>
        </View>
        <View style={styles.notaDocente}>
          <MaterialCommunityIcons name="bell-check" size={16} color="#4A90D9" />
          <Text style={styles.textoNotaDocente}>  Tu docente ha sido notificado de tu resultado.</Text>
        </View>
        <TouchableOpacity style={styles.botonFinalizar} onPress={() => navigation.goBack()}>
          <Text style={styles.botonTexto}>Volver a lecturas</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  barraTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', padding: 16, paddingTop: 50, elevation: 2,
  },
  tituloBar: { fontSize: 16, fontWeight: 'bold', color: '#212121', flex: 1, marginHorizontal: 12 },
  etiquetaNivel: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  textoNivel: { fontSize: 11, color: '#4A90D9', fontWeight: 'bold' },
  contadorPreguntas: { fontSize: 14, color: '#4A90D9', fontWeight: 'bold' },
  scrollTexto: { padding: 20 },
  autorTexto: { fontSize: 13, color: '#9E9E9E', marginBottom: 16, fontStyle: 'italic' },
  cuerpoTexto: { fontSize: 16, color: '#212121', lineHeight: 28, marginBottom: 24 },
  botonContinuar: {
    backgroundColor: '#4A90D9', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  scrollPreguntas: { padding: 16 },
  tarjetaPregunta: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  numeroPregunta: { fontSize: 12, color: '#4A90D9', fontWeight: 'bold', marginBottom: 6 },
  textoPregunta: { fontSize: 15, color: '#212121', lineHeight: 22, marginBottom: 12 },
  opciones: { marginTop: 4 },
  opcion: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 8,
  },
  opcionSeleccionada: { borderColor: '#4A90D9', backgroundColor: '#E3F2FD' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#BDBDBD' },
  radioActivo: { borderColor: '#4A90D9', backgroundColor: '#4A90D9' },
  textoOpcion: { fontSize: 14, color: '#424242' },
  verdaderoFalso: { flexDirection: 'row' },
  botonVF: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  botonVerdadero: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  botonFalso: { backgroundColor: '#FFEBEE', borderColor: '#F44336' },
  textoVF: { fontSize: 14, color: '#757575', fontWeight: '500' },
  textoVFActivo: { color: '#212121', fontWeight: 'bold' },
  inputAbierto: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    padding: 12, fontSize: 14, color: '#212121', textAlignVertical: 'top', minHeight: 100,
  },
  botonEnviar: {
    backgroundColor: '#9C27B0', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  botonDeshabilitado: { backgroundColor: '#CE93D8' },
  scrollResultado: { alignItems: 'center', padding: 24 },
  circuloPuntaje: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 6,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16, backgroundColor: '#FFFFFF',
  },
  numeroPuntaje: { fontSize: 32, fontWeight: 'bold', color: '#1A237E' },
  etiquetaPuntaje: { fontSize: 12, color: '#757575' },
  tituloResultado: { fontSize: 22, fontWeight: 'bold', color: '#212121', marginBottom: 20 },
  tarjetaRetro: { backgroundColor: '#F3E5F5', borderRadius: 14, padding: 16, width: '100%', marginBottom: 12 },
  encabezadoRetro: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tituloRetro: { fontSize: 14, fontWeight: 'bold', color: '#6A1B9A' },
  textoRetro: { fontSize: 14, color: '#424242', lineHeight: 22 },
  tarjetaErrores: { backgroundColor: '#FFEBEE', borderRadius: 14, padding: 16, width: '100%', marginBottom: 12 },
  tituloErroresRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tituloErrores: { fontSize: 14, fontWeight: 'bold', color: '#C62828' },
  textoError: { fontSize: 13, color: '#424242', lineHeight: 20 },
  tarjetaRecomendacion: {
    backgroundColor: '#FFF8E1', borderRadius: 14, padding: 16,
    width: '100%', flexDirection: 'row', marginBottom: 12,
  },
  textoRecomendacion: { flex: 1, fontSize: 13, color: '#424242', lineHeight: 20 },
  notaDocente: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  textoNotaDocente: { fontSize: 12, color: '#4A90D9' },
  botonFinalizar: { backgroundColor: '#4A90D9', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center' },
});

export default EjercicioLecturaScreen;
