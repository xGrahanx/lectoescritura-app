/**
 * EjercicioEscrituraScreen.jsx - Pantalla de ejercicio de escritura
 *
 * Maneja los distintos tipos de ejercicios de escritura:
 * - Dictado: el estudiante escucha y escribe
 * - Completar oraciones: rellena espacios en blanco
 * - Escritura libre: redaccion con evaluacion de IA
 * - Copia: transcripcion de un texto
 *
 * La IA detecta errores ortograficos y gramaticales y genera retroalimentacion.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EjercicioEscrituraScreen = ({ route, navigation }) => {
  const { ejercicio } = route.params;
  const [respuesta, setRespuesta] = useState('');
  const [evaluando, setEvaluando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const evaluarEscritura = async () => {
    if (!respuesta.trim()) {
      Alert.alert('Campo vacio', 'Por favor escribe tu respuesta antes de enviar.');
      return;
    }
    setEvaluando(true);
    try {
      // TODO: Llamar al servicio de IA para evaluar la escritura
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResultado({
        puntaje: 82,
        erroresOrtograficos: ['gato ? correcto', 'perro ? correcto', 'arbol ? arbol (falta tilde)'],
        erroresGramaticales: [],
        retroalimentacion: 'Excelente escritura. Solo recuerda colocar tildes en palabras esdrujulas como "arbol".',
        palabrasCorrectas: 18,
        totalPalabras: 20,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo evaluar la escritura. Intenta de nuevo.');
    } finally {
      setEvaluando(false);
    }
  };

  // --- VISTA DE RESULTADO -------------------------------------------------------
  if (resultado) {
    return (
      <View style={styles.contenedor}>
        <View style={styles.barraTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
          </TouchableOpacity>
          <Text style={styles.tituloBar}>Resultado</Text>
          <View />
        </View>
        <ScrollView contentContainerStyle={styles.scrollResultado}>
          <View style={[styles.circuloPuntaje, { borderColor: resultado.puntaje >= 70 ? '#4CAF50' : '#FF9800' }]}>
            <Text style={styles.numeroPuntaje}>{resultado.puntaje}%</Text>
            <Text style={styles.etiquetaPuntaje}>Puntaje</Text>
          </View>
          <View style={styles.estadisticas}>
            <View style={styles.stat}>
              <Text style={styles.valorStat}>{resultado.palabrasCorrectas}/{resultado.totalPalabras}</Text>
              <Text style={styles.etiquetaStat}>Palabras correctas</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.valorStat}>{resultado.erroresOrtograficos.length}</Text>
              <Text style={styles.etiquetaStat}>Errores ortograficos</Text>
            </View>
          </View>
          <View style={styles.tarjetaRetro}>
            <View style={styles.encabezadoRetro}>
              <MaterialCommunityIcons name="robot" size={18} color="#9C27B0" />
              <Text style={styles.tituloRetro}>Retroalimentacion de la IA</Text>
            </View>
            <Text style={styles.textoRetro}>{resultado.retroalimentacion}</Text>
          </View>
          {resultado.erroresOrtograficos.length > 0 && (
            <View style={styles.tarjetaErrores}>
              <Text style={styles.tituloErrores}>?? Correcciones ortograficas</Text>
              {resultado.erroresOrtograficos.map((error, i) => (
                <Text key={i} style={styles.textoError}>- {error}</Text>
              ))}
            </View>
          )}
          <View style={styles.notaDocente}>
            <MaterialCommunityIcons name="bell-check" size={16} color="#4A90D9" />
            <Text style={styles.textoNota}>  Tu docente ha sido notificado de tu resultado.</Text>
          </View>
          <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.goBack()}>
            <Text style={styles.botonTexto}>Volver a ejercicios</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // --- VISTA DEL EJERCICIO ------------------------------------------------------
  return (
    <View style={styles.contenedor}>
      <View style={styles.barraTop}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
        </TouchableOpacity>
        <Text style={styles.tituloBar} numberOfLines={1}>{ejercicio.titulo}</Text>
        <View />
      </View>
      <ScrollView style={styles.scroll}>
        <View style={styles.instrucciones}>
          <MaterialCommunityIcons name={ejercicio.icono} size={32} color={ejercicio.color} />
          <Text style={styles.textoInstrucciones}>
            {ejercicio.tipo === 'dictado' && 'Escucha el audio y escribe las palabras que escuches. Presta atencion a la ortografia.'}
            {ejercicio.tipo === 'completar' && 'Lee las oraciones y completa los espacios en blanco con la palabra correcta.'}
            {ejercicio.tipo === 'libre' && 'Escribe un parrafo sobre el tema indicado. Usa al menos 5 oraciones completas.'}
            {ejercicio.tipo === 'copia' && 'Copia el siguiente texto con la mayor precision posible, respetando mayusculas y puntuacion.'}
          </Text>
        </View>
        {ejercicio.tipo === 'copia' && (
          <View style={styles.textoACopiar}>
            <Text style={styles.etiquetaCopiar}>Texto original:</Text>
            <Text style={styles.contenidoCopiar}>
              "El sol brillaba intensamente sobre el jardin. Las flores de colores se mecian suavemente con la brisa de la manana. Un pequeno pajaro cantaba desde la rama mas alta del arbol."
            </Text>
          </View>
        )}
        {ejercicio.tipo === 'dictado' && (
          <TouchableOpacity style={styles.botonAudio}>
            <MaterialCommunityIcons name="play-circle" size={48} color="#E91E63" />
            <Text style={styles.textoAudio}>Reproducir dictado</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.etiquetaEscritura}>Tu respuesta:</Text>
        <TextInput
          style={styles.areaEscritura}
          placeholder={ejercicio.tipo === 'dictado' ? 'Escribe las palabras del dictado aqui...' : 'Escribe aqui...'}
          multiline numberOfLines={8}
          value={respuesta} onChangeText={setRespuesta}
          placeholderTextColor="#BDBDBD" textAlignVertical="top"
        />
        <Text style={styles.contadorPalabras}>
          {respuesta.trim() ? respuesta.trim().split(/\s+/).length : 0} palabras
        </Text>
        <TouchableOpacity
          style={[styles.botonEnviar, evaluando && styles.botonDeshabilitado]}
          onPress={evaluarEscritura} disabled={evaluando}
        >
          {evaluando
            ? <><ActivityIndicator color="#FFFFFF" /><Text style={styles.botonTexto}>  Evaluando...</Text></>
            : <><MaterialCommunityIcons name="send" size={18} color="#FFFFFF" /><Text style={styles.botonTexto}>  Enviar y evaluar</Text></>
          }
        </TouchableOpacity>
        <View style={{ height: 30 }} />
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
  scroll: { padding: 16 },
  instrucciones: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, elevation: 2,
  },
  textoInstrucciones: { flex: 1, fontSize: 14, color: '#424242', lineHeight: 22 },
  textoACopiar: { backgroundColor: '#F3E5F5', borderRadius: 12, padding: 14, marginBottom: 16 },
  etiquetaCopiar: { fontSize: 12, fontWeight: 'bold', color: '#6A1B9A', marginBottom: 6 },
  contenidoCopiar: { fontSize: 15, color: '#212121', lineHeight: 24, fontStyle: 'italic' },
  botonAudio: { alignItems: 'center', padding: 20 },
  textoAudio: { fontSize: 14, color: '#E91E63', fontWeight: '600' },
  etiquetaEscritura: { fontSize: 14, fontWeight: '600', color: '#424242', marginBottom: 8 },
  areaEscritura: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1,
    borderColor: '#E0E0E0', padding: 14, fontSize: 15, color: '#212121', minHeight: 160, elevation: 1,
  },
  contadorPalabras: { fontSize: 12, color: '#9E9E9E', textAlign: 'right', marginTop: 4, marginBottom: 16 },
  botonEnviar: {
    backgroundColor: '#E91E63', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  botonDeshabilitado: { backgroundColor: '#F48FB1' },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  scrollResultado: { alignItems: 'center', padding: 24 },
  circuloPuntaje: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 6,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16, backgroundColor: '#FFFFFF',
  },
  numeroPuntaje: { fontSize: 32, fontWeight: 'bold', color: '#1A237E' },
  etiquetaPuntaje: { fontSize: 12, color: '#757575' },
  estadisticas: { flexDirection: 'row', marginBottom: 20 },
  stat: { alignItems: 'center' },
  valorStat: { fontSize: 20, fontWeight: 'bold', color: '#1A237E' },
  etiquetaStat: { fontSize: 12, color: '#757575' },
  tarjetaRetro: { backgroundColor: '#F3E5F5', borderRadius: 14, padding: 16, width: '100%', marginBottom: 12 },
  encabezadoRetro: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tituloRetro: { fontSize: 14, fontWeight: 'bold', color: '#6A1B9A' },
  textoRetro: { fontSize: 14, color: '#424242', lineHeight: 22 },
  tarjetaErrores: { backgroundColor: '#FFEBEE', borderRadius: 14, padding: 16, width: '100%', marginBottom: 12 },
  tituloErrores: { fontSize: 14, fontWeight: 'bold', color: '#C62828', marginBottom: 8 },
  textoError: { fontSize: 13, color: '#424242', lineHeight: 20 },
  notaDocente: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  textoNota: { fontSize: 12, color: '#4A90D9' },
  botonVolver: { backgroundColor: '#E91E63', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center' },
});

export default EjercicioEscrituraScreen;
