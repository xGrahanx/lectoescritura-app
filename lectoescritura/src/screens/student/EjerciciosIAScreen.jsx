/**
 * EjerciciosIAScreen.jsx - Módulo de Ejercicios generados por IA (Google Gemini)
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';

const TIPOS_EJERCICIO_IA = [
  { id: 'sinonimos',   titulo: 'Sinónimos y Antónimos', descripcion: 'La IA genera pares de palabras según tu nivel', icono: 'swap-horizontal',         color: '#4A90D9' },
  { id: 'oraciones',   titulo: 'Construye oraciones',   descripcion: 'Ordena palabras para formar oraciones correctas', icono: 'sort',                color: '#E91E63' },
  { id: 'acentuacion', titulo: 'Acentuación',           descripcion: 'Practica el uso correcto de tildes',              icono: 'format-letter-case-upper', color: '#FF9800' },
  { id: 'comprension', titulo: 'Comprensión rápida',    descripcion: 'Micro-textos con preguntas de comprensión',       icono: 'lightning-bolt',          color: '#9C27B0' },
];

const EjerciciosIAScreen = ({ route }) => {
  const { usuario } = useAuth();
  const tareaId = route?.params?.tareaId || null;
  
  // Debug: ver qué parámetros llegan
  console.log('📋 Parámetros recibidos en EjerciciosIA:', route?.params);
  console.log('🎯 tareaId extraído:', tareaId);
  
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [generando, setGenerando]               = useState(false);
  const [ejercicio, setEjercicio]               = useState(null);
  const [respuestas, setRespuestas]             = useState({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const generarEjercicio = async (tipo) => {
    setTipoSeleccionado(tipo);
    setGenerando(true);
    setEjercicio(null);
    setRespuestas({});
    setMostrarResultado(false);
    try {
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/ia/generar-ejercicio`,
        { tipo, estudianteId: usuario.id },
        { timeout: 30000 }
      );
      setEjercicio(data);
    } catch (error) {
      const msg = error.response?.data?.mensaje || 'No se pudo generar el ejercicio. Intenta de nuevo.';
      Alert.alert('Error', msg);
      setTipoSeleccionado(null);
    } finally {
      setGenerando(false);
    }
  };

  const verificarRespuestas = async () => {
    const preguntas = ejercicio.preguntas || [];
    const sinResponder = preguntas.filter(p => {
      // Para inputs de texto, verificar que no esté vacío
      if (p.palabras) return !respuestas[p.id]?.trim();
      // Para preguntas abiertas de comprensión, no bloquear
      if (!p.opciones && p.llevaTilde === undefined && !p.palabras) return false;
      return respuestas[p.id] === undefined;
    });
    if (sinResponder.length > 0) {
      Alert.alert('Incompleto', 'Responde todas las preguntas antes de verificar.');
      return;
    }

    // Calcular puntaje
    const puntajeObtenido = calcularPuntajeConRespuestas(respuestas);

    // Guardar resultado en BD (incluye actualización de progreso y tarea)
    try {
      console.log('Guardando resultado con tareaId:', tareaId);
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/ia/guardar-resultado`,
        {
          estudiante_id: usuario.id,
          tipo: tipoSeleccionado,
          preguntas: ejercicio.preguntas,
          respuestas,
          puntaje: puntajeObtenido,
          tarea_id: tareaId, // Enviar tarea_id si existe
        },
        { timeout: API_CONFIG.TIMEOUT }
      );
      console.log('Respuesta del servidor:', response.data);
    } catch (error) {
      console.error('Error al guardar resultado:', error);
      console.error('Detalles del error:', error.response?.data);
      Alert.alert('Advertencia', 'El ejercicio se completó pero hubo un problema al guardar el resultado.');
    }

    setMostrarResultado(true);
  };
  const calcularPuntaje = () => {
    return calcularPuntajeConRespuestas(respuestas);
  };

  const calcularPuntajeConRespuestas = (resp) => {
    if (!ejercicio?.preguntas) return 0;
    const correctas = ejercicio.preguntas.filter(p => {
      if (p.correcta !== undefined && typeof p.correcta === 'number') return resp[p.id] === p.correcta;
      if (p.llevaTilde !== undefined) return resp[p.id] === p.llevaTilde;
      if (p.palabras) {
        const escrita = (resp[p.id] || '').trim().toLowerCase();
        const correcta = (p.correcta || '').trim().toLowerCase();
        return escrita === correcta;
      }
      return false;
    }).length;
    const evaluables = ejercicio.preguntas.filter(p =>
      p.correcta !== undefined || p.llevaTilde !== undefined || p.palabras
    );
    return evaluables.length > 0 ? Math.round((correctas / evaluables.length) * 100) : 0;
  };

  const renderPregunta = (pregunta, index) => {
    // Sinónimos / comprensión — opción múltiple
    if (pregunta.opciones) {
      return (
        <View key={pregunta.id} style={styles.tarjetaPregunta}>
          <Text style={styles.numeroPregunta}>Pregunta {index + 1}</Text>
          {pregunta.palabra && <Text style={styles.palabraPregunta}>{pregunta.palabra}</Text>}
          {pregunta.pregunta && <Text style={styles.textoPregunta}>{pregunta.pregunta}</Text>}
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
      );
    }

    // Acentuación — sí/no
    if (pregunta.llevaTilde !== undefined) {
      return (
        <View key={pregunta.id} style={styles.tarjetaPregunta}>
          <Text style={styles.numeroPregunta}>Pregunta {index + 1}</Text>
          <Text style={styles.palabraPregunta}>{pregunta.palabra}</Text>
          <View style={styles.opcionesVF}>
            {[true, false].map(val => (
              <TouchableOpacity
                key={String(val)}
                style={[styles.botonVF, respuestas[pregunta.id] === val && (val ? styles.botonSi : styles.botonNo)]}
                onPress={() => setRespuestas(prev => ({ ...prev, [pregunta.id]: val }))}
              >
                <Text style={[styles.textoVF, respuestas[pregunta.id] === val && styles.textoVFActivo]}>
                  {val ? 'Lleva tilde' : 'No lleva tilde'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // Oraciones — mostrar palabras desordenadas con input de texto
    if (pregunta.palabras) {
      return (
        <View key={pregunta.id} style={styles.tarjetaPregunta}>
          <Text style={styles.numeroPregunta}>Pregunta {index + 1}</Text>
          <Text style={styles.textoPregunta}>Ordena estas palabras para formar una oración:</Text>
          <View style={styles.palabrasDesordenadas}>
            {pregunta.palabras.map((p, i) => (
              <View key={i} style={styles.chipPalabra}>
                <Text style={styles.textoPalabra}>{p}</Text>
              </View>
            ))}
          </View>
          <TextInput
            style={styles.inputOracion}
            placeholder="Escribe la oración ordenada aquí..."
            value={respuestas[pregunta.id] || ''}
            onChangeText={text => setRespuestas(prev => ({ ...prev, [pregunta.id]: text }))}
            placeholderTextColor="#BDBDBD"
            autoCapitalize="sentences"
          />
        </View>
      );
    }

    // Respuesta abierta (comprensión)
    return (
      <View key={pregunta.id} style={styles.tarjetaPregunta}>
        <Text style={styles.numeroPregunta}>Pregunta {index + 1} (abierta)</Text>
        <Text style={styles.textoPregunta}>{pregunta.pregunta}</Text>
        <Text style={styles.notaAbierta}>Esta pregunta será evaluada por la IA al finalizar.</Text>
      </View>
    );
  };

  // ── Selección de tipo ─────────────────────────────────────────────────────
  if (!tipoSeleccionado && !generando) {
    return (
      <ScrollView style={styles.contenedor}>
        <View style={styles.encabezado}>
          <View style={styles.tituloRow}>
            <MaterialCommunityIcons name="robot" size={26} color="#1A237E" />
            <Text style={styles.titulo}> Ejercicios con IA</Text>
          </View>
          <Text style={styles.subtitulo}>
            La inteligencia artificial genera ejercicios personalizados según tu nivel y tus errores frecuentes.
          </Text>
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

  // ── Generando ─────────────────────────────────────────────────────────────
  if (generando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.textoCargando}>La IA está generando tu ejercicio...</Text>
        <Text style={styles.subTextoCargando}>Personalizando según tu historial de aprendizaje</Text>
      </View>
    );
  }

  // ── Ejercicio ─────────────────────────────────────────────────────────────
  if (ejercicio && !mostrarResultado) {
    return (
      <KeyboardAvoidingView
        style={styles.contenedor}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.barraTop}>
          <TouchableOpacity onPress={() => setTipoSeleccionado(null)}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
          </TouchableOpacity>
          <Text style={styles.tituloBar} numberOfLines={1}>{ejercicio.titulo || 'Ejercicio IA'}</Text>
          <View style={styles.etiquetaIA}>
            <MaterialCommunityIcons name="robot" size={14} color="#9C27B0" />
            <Text style={styles.textoIA}> IA</Text>
          </View>
        </View>
        <ScrollView style={styles.scrollEjercicio}>
          {ejercicio.instrucciones && (
            <Text style={styles.instruccion}>{ejercicio.instrucciones}</Text>
          )}
          {ejercicio.texto && (
            <View style={styles.textoComprension}>
              <Text style={styles.textoContenido}>{ejercicio.texto}</Text>
            </View>
          )}
          {(ejercicio.preguntas || []).map((pregunta, index) => renderPregunta(pregunta, index))}
          <TouchableOpacity style={styles.botonVerificar} onPress={verificarRespuestas}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
            <Text style={styles.botonTexto}>  Verificar respuestas</Text>
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Resultado ─────────────────────────────────────────────────────────────
  const puntaje = calcularPuntaje();
  return (
    <ScrollView contentContainerStyle={styles.scrollResultado}>
      <View style={[styles.circuloPuntaje, { borderColor: puntaje >= 70 ? '#4CAF50' : '#FF9800' }]}>
        <Text style={styles.numeroPuntaje}>{puntaje}%</Text>
        <Text style={styles.etiquetaPuntaje}>Puntaje</Text>
      </View>
      <Text style={styles.tituloResultado}>{puntaje >= 70 ? '¡Excelente trabajo!' : '¡Sigue practicando!'}</Text>
      {(ejercicio?.preguntas || []).filter(p => p.opciones || p.llevaTilde !== undefined || p.palabras).map(pregunta => {
        let correcto = false;
        let respuestaCorrecta = '';

        if (typeof pregunta.correcta === 'number' && pregunta.opciones) {
          correcto = respuestas[pregunta.id] === pregunta.correcta;
          respuestaCorrecta = pregunta.opciones[pregunta.correcta];
        } else if (pregunta.llevaTilde !== undefined) {
          correcto = respuestas[pregunta.id] === pregunta.llevaTilde;
          respuestaCorrecta = pregunta.llevaTilde ? 'Lleva tilde' : 'No lleva tilde';
        } else if (pregunta.palabras) {
          const escrita = (respuestas[pregunta.id] || '').trim().toLowerCase();
          const esperada = (pregunta.correcta || '').trim().toLowerCase();
          correcto = escrita === esperada;
          respuestaCorrecta = pregunta.correcta;
        }

        return (
          <View key={pregunta.id} style={[styles.revisionItem, { borderLeftColor: correcto ? '#4CAF50' : '#F44336' }]}>
            <MaterialCommunityIcons name={correcto ? 'check-circle' : 'close-circle'} size={20} color={correcto ? '#4CAF50' : '#F44336'} />
            <View style={styles.infoRevision}>
              <Text style={styles.palabraRevision}>{pregunta.palabra || (pregunta.palabras ? pregunta.palabras.join(' ') : pregunta.pregunta)}</Text>
              <Text style={styles.respuestaRevision}>Respuesta correcta: {respuestaCorrecta}</Text>
              {!correcto && respuestas[pregunta.id] !== undefined && (
                <Text style={[styles.respuestaRevision, { color: '#F44336' }]}>
                  Tu respuesta: {typeof respuestas[pregunta.id] === 'boolean'
                    ? (respuestas[pregunta.id] ? 'Lleva tilde' : 'No lleva tilde')
                    : (pregunta.opciones ? pregunta.opciones[respuestas[pregunta.id]] : respuestas[pregunta.id])}
                </Text>
              )}
            </View>
          </View>
        );
      })}
      <TouchableOpacity style={styles.botonNuevo} onPress={() => { setTipoSeleccionado(null); setEjercicio(null); }}>
        <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
        <Text style={styles.botonTexto}>  Nuevo ejercicio</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.botonFinalizar} onPress={() => { setTipoSeleccionado(null); setEjercicio(null); setMostrarResultado(false); }}>
        <MaterialCommunityIcons name="check-circle" size={18} color="#2E7D32" />
        <Text style={styles.botonTextoFinalizar}>  Finalizar</Text>
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
  tituloSeccion: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginHorizontal: 16, marginBottom: 8, marginTop: 16 },
  tarjetaTipo: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 2,
  },
  iconoTipo: { width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  infoTipo: { flex: 1 },
  tituloTipo: { fontSize: 15, fontWeight: '600', color: '#212121' },
  descripcionTipo: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  cargando: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F9FF', gap: 12 },
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
  textoComprension: { backgroundColor: '#E3F2FD', borderRadius: 12, padding: 14, marginBottom: 16 },
  textoContenido: { fontSize: 14, color: '#212121', lineHeight: 22 },
  tarjetaPregunta: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  numeroPregunta: { fontSize: 12, color: '#9C27B0', fontWeight: 'bold', marginBottom: 4 },
  palabraPregunta: { fontSize: 20, fontWeight: 'bold', color: '#1A237E', marginBottom: 12 },
  textoPregunta: { fontSize: 14, color: '#424242', marginBottom: 12, lineHeight: 20 },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcion: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FAFAFA' },
  opcionSeleccionada: { backgroundColor: '#9C27B0', borderColor: '#9C27B0' },
  textoOpcion: { fontSize: 14, color: '#424242' },
  textoOpcionActivo: { color: '#FFFFFF', fontWeight: '600' },
  opcionesVF: { flexDirection: 'row', gap: 10 },
  botonVF: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  botonSi: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  botonNo: { backgroundColor: '#FFEBEE', borderColor: '#F44336' },
  textoVF: { fontSize: 13, color: '#757575' },
  textoVFActivo: { fontWeight: 'bold', color: '#212121' },
  palabrasDesordenadas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chipPalabra: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  textoPalabra: { fontSize: 14, color: '#1565C0', fontWeight: '500' },
  inputOracion: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#212121', marginTop: 8,
    backgroundColor: '#FAFAFA',
  },
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
    borderRadius: 10, padding: 12, width: '100%', marginBottom: 8, borderLeftWidth: 4, elevation: 1, gap: 10,
  },
  infoRevision: { flex: 1 },
  palabraRevision: { fontSize: 15, fontWeight: '600', color: '#212121' },
  respuestaRevision: { fontSize: 12, color: '#757575', marginTop: 2 },
  botonNuevo: {
    backgroundColor: '#9C27B0', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 12,
  },
  botonFinalizar: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 8,
    borderWidth: 2, borderColor: '#2E7D32',
  },
  botonTextoFinalizar: { color: '#2E7D32', fontSize: 16, fontWeight: 'bold' },
});

export default EjerciciosIAScreen;
