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

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';

const EjercicioEscrituraScreen = ({ route, navigation }) => {
  const { ejercicio, ejercicioId, tarea, tareaId } = route.params || {};
  const { usuario } = useAuth();

  const [ejercicioActual, setEjercicioActual] = useState(ejercicio || null);
  const [cargando, setCargando]               = useState(!ejercicio);
  const [respuesta, setRespuesta]             = useState('');
  const [evaluando, setEvaluando]             = useState(false);
  const [resultado, setResultado]             = useState(null);

  useEffect(() => {
    // Si ya viene el objeto completo, no hace falta cargar
    if (ejercicio) return;

    const cargar = async () => {
      // Si viene ejercicioId, cargarlo desde el backend
      if (ejercicioId) {
        try {
          const { data } = await axios.get(
            `${API_CONFIG.BASE_URL}/ejercicios/${ejercicioId}`,
            { timeout: API_CONFIG.TIMEOUT }
          );
          setEjercicioActual(data);
        } catch {
          Alert.alert('Error', 'No se pudo cargar el ejercicio.', [
            { text: 'Volver', onPress: () => navigation.goBack() },
          ]);
        } finally {
          setCargando(false);
        }
        return;
      }

      // Si viene de una tarea especial/ia sin ejercicioId, construir desde tarea
      if (tarea) {
        setEjercicioActual({
          id: tareaId,
          titulo: tarea.titulo || 'Ejercicio de escritura',
          tipo: tarea.tipo === 'especial' ? 'libre' : (tarea.tipo || 'libre'),
          descripcion: tarea.descripcion || '',
          contenido: null,
        });
      }
      setCargando(false);
    };

    cargar();
  }, [ejercicioId, ejercicio, tarea, tareaId]);

  const evaluarEscritura = async () => {
    if (!respuesta.trim()) {
      Alert.alert('Campo vacío', 'Por favor escribe tu respuesta antes de enviar.');
      return;
    }
    setEvaluando(true);

    // Marcar tarea como completada inmediatamente
    if (tareaId) {
      axios.put(
        `${API_CONFIG.BASE_URL}/tareas/${tareaId}/estado`,
        { estado: 'completada' },
        { timeout: API_CONFIG.TIMEOUT }
      ).catch(() => {});
    }

    let evaluacion = null;

    try {
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/ia/evaluar-escritura`,
        { ejercicio: ejercicioActual, respuesta },
        { timeout: 30000 }
      );
      evaluacion = data;
    } catch {
      setEvaluando(false);
      Alert.alert(
        'IA no disponible',
        'No se pudo evaluar tu ejercicio en este momento. Verifica tu conexión e intenta de nuevo.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Guardar resultado real en la BD
    if (ejercicioActual?.id && usuario?.id) {
      axios.post(
        `${API_CONFIG.BASE_URL}/progreso/${usuario.id}/escritura`,
        {
          ejercicio_id: ejercicioActual.id,
          puntaje: evaluacion.puntaje,
          respuesta,
          errores_ortograficos: evaluacion.erroresOrtograficos || [],
          retroalimentacion: evaluacion.retroalimentacion,
        },
        { timeout: API_CONFIG.TIMEOUT }
      ).catch(() => {});
    }

    setResultado(evaluacion);
    setEvaluando(false);
  };

  // --- CARGANDO ----------------------------------------------------------------
  if (cargando || !ejercicioActual) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.textoCargando}>Cargando ejercicio...</Text>
      </View>
    );
  }

  // --- VISTA DE RESULTADO -------------------------------------------------------
  if (resultado) {    return (
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
        <Text style={styles.tituloBar} numberOfLines={1}>{ejercicioActual.titulo}</Text>
        <View />
      </View>
      <ScrollView style={styles.scroll}>
        <View style={styles.instrucciones}>
          <MaterialCommunityIcons name={ejercicioActual.icono || 'pencil'} size={32} color={ejercicioActual.color || '#E91E63'} />
          <Text style={styles.textoInstrucciones}>
            {ejercicioActual.tipo === 'dictado' && 'Escucha el audio y escribe las palabras que escuches. Presta atención a la ortografía.'}
            {ejercicioActual.tipo === 'completar' && 'Lee las oraciones y completa los espacios en blanco con la palabra correcta.'}
            {(ejercicioActual.tipo === 'libre' || ejercicioActual.tipo === 'especial') && (ejercicioActual.descripcion || 'Escribe un párrafo sobre el tema indicado. Usa al menos 5 oraciones completas.')}
            {ejercicioActual.tipo === 'copia' && 'Copia el siguiente texto con la mayor precisión posible, respetando mayúsculas y puntuación.'}
          </Text>
        </View>
        {ejercicioActual.tipo === 'copia' && ejercicioActual.contenido && (
          <View style={styles.textoACopiar}>
            <Text style={styles.etiquetaCopiar}>Texto a copiar:</Text>
            <Text style={styles.contenidoCopiar}>{ejercicioActual.contenido}</Text>
          </View>
        )}
        {ejercicioActual.tipo === 'completar' && ejercicioActual.contenido && (
          <View style={styles.textoACopiar}>
            <Text style={styles.etiquetaCopiar}>Oraciones a completar:</Text>
            <Text style={styles.contenidoCopiar}>{ejercicioActual.contenido}</Text>
          </View>
        )}
        {ejercicioActual.tipo === 'dictado' && ejercicioActual.contenido && (
          <View style={styles.textoACopiar}>
            <Text style={styles.etiquetaCopiar}>Palabras del dictado:</Text>
            <Text style={styles.contenidoCopiar}>{ejercicioActual.contenido}</Text>
          </View>
        )}
        {ejercicioActual.tipo === 'dictado' && (
          <TouchableOpacity style={styles.botonAudio}>
            <MaterialCommunityIcons name="play-circle" size={48} color="#E91E63" />
            <Text style={styles.textoAudio}>Reproducir dictado</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.etiquetaEscritura}>Tu respuesta:</Text>
        <TextInput
          style={styles.areaEscritura}
          placeholder={ejercicioActual.tipo === 'dictado' ? 'Escribe las palabras del dictado aquí...' : 'Escribe aquí...'}
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
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F9FF' },
  textoCargando: { color: '#9E9E9E', marginTop: 12, fontSize: 14 },
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
