/**
 * AsistenteIAScreen.jsx - Asistente de IA para docentes
 *
 * Permite al docente:
 * 1. Ver sugerencias de tareas para todos sus estudiantes
 * 2. Generar ejercicios nuevos con Gemini
 * 3. Chat libre con Gemini para pedir ideas pedagógicas
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';

const TIPOS_EJERCICIO = [
  { key: 'sinonimos',   label: 'Sinónimos',    icono: 'swap-horizontal', color: '#4A90D9' },
  { key: 'oraciones',   label: 'Oraciones',    icono: 'format-text',     color: '#E91E63' },
  { key: 'acentuacion', label: 'Acentuación',  icono: 'alphabetical',    color: '#FF9800' },
  { key: 'comprension', label: 'Comprensión',  icono: 'book-open-variant', color: '#4CAF50' },
];

const AsistenteIAScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const [tabActiva, setTabActiva]         = useState('sugerencias');
  const [estudiantes, setEstudiantes]     = useState([]);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(true);
  const [sugerenciasPor, setSugerenciasPor] = useState({}); // { estudianteId: sugerencias }
  const [cargandoSugerencia, setCargandoSugerencia] = useState(null); // id del que está cargando
  const [tipoEjercicio, setTipoEjercicio] = useState('sinonimos');
  const [ejercicioGenerado, setEjercicioGenerado] = useState(null);
  const [generando, setGenerando]         = useState(false);
  const [mensajesChat, setMensajesChat]   = useState([
    { id: 1, rol: 'ia', texto: '¡Hola! Soy tu asistente educativo. Puedo ayudarte con ideas de actividades, estrategias pedagógicas o cualquier consulta sobre tus estudiantes. ¿En qué te puedo ayudar?' },
  ]);
  const [inputChat, setInputChat]         = useState('');
  const [enviandoChat, setEnviandoChat]   = useState(false);
  const scrollRef = useRef(null);

  // Cargar estudiantes del docente
  const cargarEstudiantes = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API_CONFIG.BASE_URL}/grupos/docente/${usuario.id}`,
        { timeout: API_CONFIG.TIMEOUT }
      );
      const lista = data.flatMap(g =>
        (g.estudiantes || []).map(ge => ({ ...ge.estudiante, grupo: g.nombre }))
      );
      // Cargar promedio real de cada estudiante
      const conPromedios = await Promise.all(
        lista.map(async (est) => {
          try {
            const { data: p } = await axios.get(
              `${API_CONFIG.BASE_URL}/usuarios/${est.id}/promedio`,
              { timeout: 5000 }
            );
            return { ...est, promedio: p.promedio };
          } catch { return { ...est, promedio: 0 }; }
        })
      );
      setEstudiantes(conPromedios);
    } catch {
      setEstudiantes([]);
    } finally {
      setCargandoEstudiantes(false);
    }
  }, [usuario.id]);

  useEffect(() => { cargarEstudiantes(); }, [cargarEstudiantes]);

  // Pedir sugerencias para un estudiante específico
  const pedirSugerencias = async (estudiante) => {
    setCargandoSugerencia(estudiante.id);
    try {
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/ia/sugerir-tarea`,
        { estudianteId: estudiante.id },
        { timeout: 30000 }
      );
      setSugerenciasPor(prev => ({ ...prev, [estudiante.id]: data }));
    } catch {
      Alert.alert('Error', 'No se pudieron obtener sugerencias.');
    } finally {
      setCargandoSugerencia(null);
    }
  };

  // Generar ejercicio con IA
  const generarEjercicio = async () => {
    setGenerando(true);
    setEjercicioGenerado(null);
    try {
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/ia/generar-ejercicio`,
        { tipo: tipoEjercicio },
        { timeout: 30000 }
      );
      setEjercicioGenerado(data);
    } catch {
      Alert.alert('Error', 'No se pudo generar el ejercicio.');
    } finally {
      setGenerando(false);
    }
  };

  // Chat con Gemini
  const enviarMensaje = async () => {
    if (!inputChat.trim()) return;
    const mensajeUsuario = inputChat.trim();
    setInputChat('');
    setMensajesChat(prev => [...prev, { id: Date.now(), rol: 'usuario', texto: mensajeUsuario }]);
    setEnviandoChat(true);

    try {
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/ia/chat-docente`,
        { mensaje: mensajeUsuario },
        { timeout: 30000 }
      );
      setMensajesChat(prev => [...prev, { id: Date.now() + 1, rol: 'ia', texto: data.respuesta }]);
    } catch {
      setMensajesChat(prev => [...prev, {
        id: Date.now() + 1, rol: 'ia',
        texto: 'Lo siento, no pude procesar tu consulta. Verifica tu conexión e intenta de nuevo.',
      }]);
    } finally {
      setEnviandoChat(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const colorRendimiento = (promedio) =>
    promedio >= 80 ? '#4CAF50' : promedio >= 60 ? '#FF9800' : '#F44336';

  return (
    <View style={styles.contenedor}>
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="robot" size={26} color="#9C27B0" />
          <Text style={styles.titulo}> Asistente IA</Text>
        </View>
        <Text style={styles.subtitulo}>Powered by Google Gemini</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'sugerencias', label: 'Sugerencias', icono: 'lightbulb' },
          { key: 'generar',     label: 'Generar',     icono: 'creation' },
          { key: 'chat',        label: 'Chat',         icono: 'chat' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, tabActiva === tab.key && styles.tabActiva]}
            onPress={() => setTabActiva(tab.key)}
          >
            <MaterialCommunityIcons
              name={tab.icono}
              size={18}
              color={tabActiva === tab.key ? '#9C27B0' : '#9E9E9E'}
            />
            <Text style={[styles.textoTab, tabActiva === tab.key && styles.textoTabActivo]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── TAB: SUGERENCIAS ─────────────────────────────────────────────── */}
      {tabActiva === 'sugerencias' && (
        <ScrollView style={styles.scroll}>
          <Text style={styles.descripcionTab}>
            Selecciona un estudiante para que la IA analice su rendimiento y sugiera tareas personalizadas.
          </Text>

          {cargandoEstudiantes ? (
            <ActivityIndicator color="#9C27B0" style={{ marginTop: 30 }} />
          ) : estudiantes.length === 0 ? (
            <View style={styles.sinDatos}>
              <MaterialCommunityIcons name="account-off" size={40} color="#BDBDBD" />
              <Text style={styles.textoSinDatos}>No tienes estudiantes asignados</Text>
            </View>
          ) : (
            estudiantes.map(est => (
              <View key={est.id} style={styles.tarjetaEstudiante}>
                {/* Info del estudiante */}
                <View style={styles.filaEstudiante}>
                  <View style={[styles.avatar, { backgroundColor: colorRendimiento(est.promedio) + '20' }]}>
                    <Text style={[styles.inicial, { color: colorRendimiento(est.promedio) }]}>
                      {est.nombre.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.infoEstudiante}>
                    <Text style={styles.nombreEstudiante}>{est.nombre} {est.apellido}</Text>
                    <Text style={styles.grupoEstudiante}>{est.grupo} · {est.promedio}% promedio</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.botonSugerir, cargandoSugerencia === est.id && styles.botonDeshabilitado]}
                    onPress={() => pedirSugerencias(est)}
                    disabled={cargandoSugerencia === est.id}
                  >
                    {cargandoSugerencia === est.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <MaterialCommunityIcons name="robot" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Sugerencias de la IA para este estudiante */}
                {sugerenciasPor[est.id] && (
                  <View style={styles.sugerenciasContenedor}>
                    <Text style={styles.resumenIA}>{sugerenciasPor[est.id].resumen}</Text>
                    {sugerenciasPor[est.id].sugerencias?.map((s, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.itemSugerencia}
                        onPress={() => navigation.navigate('AsignarTarea', { estudiante: est })}
                      >
                        <View style={styles.infoSugerencia}>
                          <Text style={styles.tituloSugerencia}>{s.titulo}</Text>
                          <Text style={styles.razonSugerencia}>{s.razon}</Text>
                        </View>
                        <MaterialCommunityIcons name="arrow-right-circle" size={20} color="#9C27B0" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* ── TAB: GENERAR EJERCICIO ───────────────────────────────────────── */}
      {tabActiva === 'generar' && (
        <ScrollView style={styles.scroll}>
          <Text style={styles.descripcionTab}>
            Genera ejercicios nuevos con IA para usar en tus clases o asignar como tareas.
          </Text>

          <Text style={styles.etiqueta}>Tipo de ejercicio</Text>
          <View style={styles.gridTipos}>
            {TIPOS_EJERCICIO.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tarjetaTipo, tipoEjercicio === t.key && { borderColor: t.color, backgroundColor: t.color + '10' }]}
                onPress={() => { setTipoEjercicio(t.key); setEjercicioGenerado(null); }}
              >
                <MaterialCommunityIcons name={t.icono} size={24} color={tipoEjercicio === t.key ? t.color : '#9E9E9E'} />
                <Text style={[styles.textoTipo, tipoEjercicio === t.key && { color: t.color, fontWeight: '700' }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.botonGenerar, generando && styles.botonDeshabilitado]}
            onPress={generarEjercicio}
            disabled={generando}
          >
            {generando ? (
              <><ActivityIndicator color="#FFFFFF" /><Text style={styles.textoBoton}>  Generando...</Text></>
            ) : (
              <><MaterialCommunityIcons name="creation" size={18} color="#FFFFFF" /><Text style={styles.textoBoton}>  Generar ejercicio</Text></>
            )}
          </TouchableOpacity>

          {/* Resultado del ejercicio generado */}
          {ejercicioGenerado && (
            <View style={styles.tarjetaEjercicio}>
              <View style={styles.encabezadoEjercicio}>
                <MaterialCommunityIcons name="robot" size={18} color="#9C27B0" />
                <Text style={styles.tituloEjercicio}> {ejercicioGenerado.titulo}</Text>
              </View>
              <Text style={styles.instruccionesEjercicio}>{ejercicioGenerado.instrucciones}</Text>

              {ejercicioGenerado.preguntas?.map((p, i) => (
                <View key={i} style={styles.preguntaGenerada}>
                  <Text style={styles.numeroPregunta}>Pregunta {i + 1}</Text>
                  {p.palabra && <Text style={styles.textoPregunta}>Palabra: <Text style={{ fontWeight: 'bold' }}>{p.palabra}</Text></Text>}
                  {p.palabras && <Text style={styles.textoPregunta}>Palabras: {p.palabras.join(' - ')}</Text>}
                  {p.pregunta && <Text style={styles.textoPregunta}>{p.pregunta}</Text>}
                  {p.opciones && (
                    <View style={styles.opcionesGeneradas}>
                      {p.opciones.map((op, j) => (
                        <View key={j} style={[styles.opcion, j === p.correcta && styles.opcionCorrecta]}>
                          <Text style={[styles.textoOpcion, j === p.correcta && styles.textoOpcionCorrecta]}>{op}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {p.correcta !== undefined && typeof p.correcta === 'string' && (
                    <Text style={styles.respuestaCorrecta}>✓ {p.correcta}</Text>
                  )}
                  {p.llevaTilde !== undefined && (
                    <Text style={styles.respuestaCorrecta}>
                      {p.llevaTilde ? '✓ Lleva tilde' : '✗ No lleva tilde'} — {p.explicacion}
                    </Text>
                  )}
                </View>
              ))}

              {ejercicioGenerado.texto && (
                <View style={styles.textoComprension}>
                  <Text style={styles.etiquetaTexto}>Texto:</Text>
                  <Text style={styles.contenidoTexto}>{ejercicioGenerado.texto}</Text>
                </View>
              )}
            </View>
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* ── TAB: CHAT ────────────────────────────────────────────────────── */}
      {tabActiva === 'chat' && (
        <KeyboardAvoidingView
          style={styles.chatContenedor}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.mensajesScroll}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {mensajesChat.map(msg => (
              <View
                key={msg.id}
                style={[styles.burbuja, msg.rol === 'usuario' ? styles.burbujaUsuario : styles.burbujaIA]}
              >
                {msg.rol === 'ia' && (
                  <MaterialCommunityIcons name="robot" size={16} color="#9C27B0" style={{ marginBottom: 4 }} />
                )}
                <Text style={[styles.textoMensaje, msg.rol === 'usuario' && styles.textoMensajeUsuario]}>
                  {msg.texto}
                </Text>
              </View>
            ))}
            {enviandoChat && (
              <View style={styles.burbujaIA}>
                <ActivityIndicator size="small" color="#9C27B0" />
              </View>
            )}
            <View style={{ height: 10 }} />
          </ScrollView>

          {/* Input del chat */}
          <View style={styles.inputChatContenedor}>
            <TextInput
              style={styles.inputChat}
              placeholder="Escribe tu consulta..."
              value={inputChat}
              onChangeText={setInputChat}
              placeholderTextColor="#BDBDBD"
              multiline
              maxLength={500}
              onSubmitEditing={enviarMensaje}
            />
            <TouchableOpacity
              style={[styles.botonEnviarChat, (!inputChat.trim() || enviandoChat) && styles.botonDeshabilitado]}
              onPress={enviarMensaje}
              disabled={!inputChat.trim() || enviandoChat}
            >
              <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50 },
  tituloRow: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  subtitulo: { fontSize: 12, color: '#9C27B0', marginTop: 2 },
  tabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', gap: 2 },
  tabActiva: { borderBottomColor: '#9C27B0' },
  textoTab: { fontSize: 12, color: '#9E9E9E' },
  textoTabActivo: { color: '#9C27B0', fontWeight: '600' },
  scroll: { flex: 1, padding: 16 },
  descripcionTab: { fontSize: 13, color: '#757575', marginBottom: 16, lineHeight: 20 },
  etiqueta: { fontSize: 14, fontWeight: '600', color: '#424242', marginBottom: 10 },
  sinDatos: { alignItems: 'center', padding: 40 },
  textoSinDatos: { color: '#9E9E9E', fontSize: 14, marginTop: 10 },

  // Sugerencias
  tarjetaEstudiante: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    marginBottom: 12, elevation: 2,
  },
  filaEstudiante: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  inicial: { fontSize: 16, fontWeight: 'bold' },
  infoEstudiante: { flex: 1 },
  nombreEstudiante: { fontSize: 14, fontWeight: '600', color: '#212121' },
  grupoEstudiante: { fontSize: 12, color: '#9E9E9E', marginTop: 1 },
  botonSugerir: { backgroundColor: '#9C27B0', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  sugerenciasContenedor: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  resumenIA: { fontSize: 12, color: '#6A1B9A', lineHeight: 18, marginBottom: 10, fontStyle: 'italic' },
  itemSugerencia: {
    backgroundColor: '#F3E5F5', borderRadius: 10, padding: 10,
    flexDirection: 'row', alignItems: 'center', marginBottom: 6,
  },
  infoSugerencia: { flex: 1 },
  tituloSugerencia: { fontSize: 13, fontWeight: '600', color: '#212121' },
  razonSugerencia: { fontSize: 11, color: '#757575', marginTop: 2 },

  // Generar ejercicio
  gridTipos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  tarjetaTipo: {
    width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 2, borderColor: '#E0E0E0', elevation: 1, gap: 6,
  },
  textoTipo: { fontSize: 13, color: '#9E9E9E', fontWeight: '500' },
  botonGenerar: {
    backgroundColor: '#9C27B0', borderRadius: 12, padding: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  textoBoton: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  botonDeshabilitado: { opacity: 0.6 },
  tarjetaEjercicio: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, elevation: 2 },
  encabezadoEjercicio: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tituloEjercicio: { fontSize: 15, fontWeight: 'bold', color: '#6A1B9A' },
  instruccionesEjercicio: { fontSize: 13, color: '#757575', marginBottom: 14, lineHeight: 20 },
  preguntaGenerada: { backgroundColor: '#F9F9F9', borderRadius: 10, padding: 12, marginBottom: 8 },
  numeroPregunta: { fontSize: 11, color: '#9C27B0', fontWeight: 'bold', marginBottom: 4 },
  textoPregunta: { fontSize: 14, color: '#212121', marginBottom: 8 },
  opcionesGeneradas: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  opcion: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: '#F0F0F0' },
  opcionCorrecta: { backgroundColor: '#E8F5E9' },
  textoOpcion: { fontSize: 13, color: '#424242' },
  textoOpcionCorrecta: { color: '#2E7D32', fontWeight: '600' },
  respuestaCorrecta: { fontSize: 13, color: '#2E7D32', fontWeight: '600', marginTop: 4 },
  textoComprension: { backgroundColor: '#E3F2FD', borderRadius: 10, padding: 12, marginTop: 8 },
  etiquetaTexto: { fontSize: 12, fontWeight: 'bold', color: '#1565C0', marginBottom: 4 },
  contenidoTexto: { fontSize: 14, color: '#212121', lineHeight: 22 },

  // Chat
  chatContenedor: { flex: 1 },
  mensajesScroll: { flex: 1, padding: 16 },
  burbuja: { maxWidth: '80%', borderRadius: 14, padding: 12, marginBottom: 10 },
  burbujaIA: { backgroundColor: '#F3E5F5', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  burbujaUsuario: { backgroundColor: '#9C27B0', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  textoMensaje: { fontSize: 14, color: '#212121', lineHeight: 20 },
  textoMensajeUsuario: { color: '#FFFFFF' },
  inputChatContenedor: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 8,
  },
  inputChat: {
    flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    color: '#212121', maxHeight: 100,
  },
  botonEnviarChat: {
    backgroundColor: '#9C27B0', width: 42, height: 42,
    borderRadius: 21, justifyContent: 'center', alignItems: 'center',
  },
});

export default AsistenteIAScreen;
