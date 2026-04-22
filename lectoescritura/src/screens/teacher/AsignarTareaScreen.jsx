/**
 * AsignarTareaScreen.jsx - Pantalla para asignar tareas adicionales
 * El docente elige tipo, y luego selecciona un texto o ejercicio real de la BD.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';

const COLOR_NIVEL = { basico: '#4CAF50', intermedio: '#FF9800', avanzado: '#F44336' };
const ICONO_TIPO  = { dictado: 'microphone', completar: 'format-text', libre: 'pencil-box', copia: 'content-copy' };

const AsignarTareaScreen = ({ route, navigation }) => {
  const { usuario }    = useAuth();
  const { estudiante } = route.params;

  const [tipoTarea, setTipoTarea]           = useState('lectura');
  const [textos, setTextos]                 = useState([]);
  const [ejercicios, setEjercicios]         = useState([]);
  const [seleccionado, setSeleccionado]     = useState(null); // texto o ejercicio elegido
  const [fechaLimite, setFechaLimite]       = useState('');
  const [esAvanzada, setEsAvanzada]         = useState(true);
  const [cargandoItems, setCargandoItems]   = useState(false);
  const [asignando, setAsignando]           = useState(false);

  // Cargar textos o ejercicios según el tipo elegido
  useEffect(() => {
    setSeleccionado(null);
    if (tipoTarea === 'lectura') {
      cargarTextos();
    } else if (tipoTarea === 'escritura') {
      cargarEjercicios();
    }
  }, [tipoTarea]);

  const cargarTextos = async () => {
    setCargandoItems(true);
    try {
      const { data } = await axios.get(`${API_CONFIG.BASE_URL}/textos`, { timeout: API_CONFIG.TIMEOUT });
      setTextos(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los textos.');
    } finally {
      setCargandoItems(false);
    }
  };

  const cargarEjercicios = async () => {
    setCargandoItems(true);
    try {
      const { data } = await axios.get(`${API_CONFIG.BASE_URL}/ejercicios`, { timeout: API_CONFIG.TIMEOUT });
      setEjercicios(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los ejercicios.');
    } finally {
      setCargandoItems(false);
    }
  };

  const parsearFecha = (texto) => {
    if (!texto || texto.length < 10) return null;
    // Espera formato DD/MM/AAAA
    const partes = texto.split('/');
    if (partes.length !== 3) return null;
    const [dia, mes, anio] = partes;
    if (!dia || !mes || !anio || anio.length !== 4) return null;
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  };

  const asignarTarea = async () => {
    if ((tipoTarea === 'lectura' || tipoTarea === 'escritura') && !seleccionado) {
      Alert.alert('Selección requerida', `Por favor selecciona un ${tipoTarea === 'lectura' ? 'texto' : 'ejercicio'}.`);
      return;
    }
    if (!fechaLimite) {
      Alert.alert('Fecha requerida', 'Por favor indica la fecha límite.');
      return;
    }

    const fechaParseada = parsearFecha(fechaLimite);
    if (!fechaParseada) {
      Alert.alert('Fecha inválida', 'Ingresa la fecha en formato DD/MM/AAAA. Ejemplo: 30/05/2026');
      return;
    }

    const titulo = tipoTarea === 'lectura'
      ? `Lectura: ${seleccionado?.titulo}`
      : tipoTarea === 'escritura'
      ? `Escritura: ${seleccionado?.titulo}`
      : tipoTarea === 'ia'
      ? 'Ejercicios con IA'
      : 'Tarea especial';

    const descripcion = seleccionado?.descripcion || seleccionado?.contenido || `Realiza el ejercicio de ${tipoTarea} asignado.`;

    setAsignando(true);
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/tareas`, {
        titulo,
        descripcion,
        tipo: tipoTarea,
        docenteId:    usuario.id,
        estudianteId: estudiante.id,
        fecha_limite: fechaParseada,
        es_avanzada:  esAvanzada,
        texto_id:     tipoTarea === 'lectura'   ? seleccionado?.id : null,
        ejercicio_id: tipoTarea === 'escritura' ? seleccionado?.id : null,
      }, { timeout: API_CONFIG.TIMEOUT });

      Alert.alert(
        '✅ Tarea asignada',
        `La tarea fue asignada a ${estudiante.nombre} ${estudiante.apellido || ''}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'No se pudo asignar la tarea.';
      Alert.alert('Error', mensaje);
    } finally {
      setAsignando(false);
    }
  };

  const tipos = [
    { key: 'lectura',   label: 'Lectura',   icono: 'book-open-variant', color: '#4A90D9' },
    { key: 'escritura', label: 'Escritura', icono: 'pencil',            color: '#E91E63' },
    { key: 'ia',        label: 'IA',        icono: 'robot',             color: '#9C27B0' },
    { key: 'especial',  label: 'Especial',  icono: 'star',              color: '#FF9800' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.barraTop}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#424242" />
        </TouchableOpacity>
        <Text style={styles.tituloBar}>Asignar tarea</Text>
        <View />
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Info estudiante */}
        <View style={styles.tarjetaEstudiante}>
          <View style={styles.avatarEstudiante}>
            <Text style={styles.inicialAvatar}>{estudiante.nombre.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.nombreEstudiante}>{estudiante.nombre} {estudiante.apellido || ''}</Text>
            <Text style={styles.subEstudiante}>{estudiante.grupo || estudiante.grado || ''}</Text>
          </View>
        </View>

        {/* Selector de tipo */}
        <Text style={styles.etiqueta}>Tipo de tarea</Text>
        <View style={styles.gridTipos}>
          {tipos.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tarjetaTipo, tipoTarea === t.key && { borderColor: t.color, backgroundColor: t.color + '10' }]}
              onPress={() => setTipoTarea(t.key)}
            >
              <MaterialCommunityIcons name={t.icono} size={24} color={tipoTarea === t.key ? t.color : '#9E9E9E'} />
              <Text style={[styles.textoTipo, tipoTarea === t.key && { color: t.color, fontWeight: '700' }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de textos (lectura) */}
        {tipoTarea === 'lectura' && (
          <>
            <Text style={styles.etiqueta}>Selecciona un texto</Text>
            {cargandoItems ? (
              <ActivityIndicator color="#4A90D9" style={{ marginVertical: 16 }} />
            ) : textos.length === 0 ? (
              <Text style={styles.textoVacio}>No hay textos disponibles. Agrega textos desde el panel admin.</Text>
            ) : (
              textos.map(texto => (
                <TouchableOpacity
                  key={texto.id}
                  style={[styles.itemSeleccionable, seleccionado?.id === texto.id && styles.itemSeleccionado]}
                  onPress={() => setSeleccionado(texto)}
                >
                  <View style={styles.infoItem}>
                    <Text style={styles.tituloItem}>{texto.titulo}</Text>
                    <Text style={styles.subItem}>{texto.autor}</Text>
                  </View>
                  <View style={[styles.etiquetaNivel, { backgroundColor: (COLOR_NIVEL[texto.nivel] || '#9E9E9E') + '20' }]}>
                    <Text style={[styles.textoNivel, { color: COLOR_NIVEL[texto.nivel] || '#9E9E9E' }]}>
                      {texto.nivel}
                    </Text>
                  </View>
                  {seleccionado?.id === texto.id && (
                    <MaterialCommunityIcons name="check-circle" size={22} color="#4A90D9" style={{ marginLeft: 8 }} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {/* Lista de ejercicios (escritura) */}
        {tipoTarea === 'escritura' && (
          <>
            <Text style={styles.etiqueta}>Selecciona un ejercicio</Text>
            {cargandoItems ? (
              <ActivityIndicator color="#E91E63" style={{ marginVertical: 16 }} />
            ) : ejercicios.length === 0 ? (
              <Text style={styles.textoVacio}>No hay ejercicios disponibles.</Text>
            ) : (
              ejercicios.map(ej => (
                <TouchableOpacity
                  key={ej.id}
                  style={[styles.itemSeleccionable, seleccionado?.id === ej.id && styles.itemSeleccionado]}
                  onPress={() => setSeleccionado(ej)}
                >
                  <MaterialCommunityIcons
                    name={ICONO_TIPO[ej.tipo] || 'pencil'}
                    size={20} color="#E91E63"
                    style={{ marginRight: 10 }}
                  />
                  <View style={styles.infoItem}>
                    <Text style={styles.tituloItem}>{ej.titulo}</Text>
                    <Text style={styles.subItem}>{ej.tipo} · {ej.nivel}</Text>
                  </View>
                  {seleccionado?.id === ej.id && (
                    <MaterialCommunityIcons name="check-circle" size={22} color="#E91E63" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {/* IA y especial: solo info */}
        {(tipoTarea === 'ia' || tipoTarea === 'especial') && (
          <View style={styles.notaInfo}>
            <MaterialCommunityIcons name="information" size={16} color="#9C27B0" />
            <Text style={styles.textoNota}>
              {tipoTarea === 'ia'
                ? 'El estudiante realizará ejercicios generados por IA (sinónimos, oraciones, acentuación).'
                : 'Tarea especial: el estudiante verá el título y descripción que se guardará automáticamente.'}
            </Text>
          </View>
        )}

        {/* Marcar como avanzada */}
        <TouchableOpacity style={styles.checkAvanzada} onPress={() => setEsAvanzada(!esAvanzada)}>
          <MaterialCommunityIcons
            name={esAvanzada ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={22} color="#FF9800"
          />
          <Text style={styles.textoCheckAvanzada}>Marcar como tarea de alto rendimiento</Text>
        </TouchableOpacity>

        {/* Fecha límite */}
        <Text style={styles.etiqueta}>Fecha límite</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          value={fechaLimite}
          onChangeText={(texto) => {
            const soloNumeros = texto.replace(/\D/g, '');
            let formateado = soloNumeros;
            if (soloNumeros.length >= 3 && soloNumeros.length <= 4) {
              formateado = `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2)}`;
            } else if (soloNumeros.length >= 5) {
              formateado = `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2, 4)}/${soloNumeros.slice(4, 8)}`;
            }
            setFechaLimite(formateado);
          }}
          placeholderTextColor="#BDBDBD"
          keyboardType="numeric"
          maxLength={10}
        />

        {/* Botón asignar */}
        <TouchableOpacity
          style={[styles.botonAsignar, asignando && styles.botonDeshabilitado]}
          onPress={asignarTarea}
          disabled={asignando}
        >
          {asignando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.botonTexto}>  Asignar tarea</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  tarjetaEstudiante: {
    backgroundColor: '#E8F5E9', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12,
  },
  avatarEstudiante: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#2E7D32',
    justifyContent: 'center', alignItems: 'center',
  },
  inicialAvatar: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  nombreEstudiante: { fontSize: 15, fontWeight: 'bold', color: '#1B5E20' },
  subEstudiante: { fontSize: 12, color: '#2E7D32', marginTop: 2 },
  etiqueta: { fontSize: 14, fontWeight: '600', color: '#424242', marginBottom: 10, marginTop: 4 },
  gridTipos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  tarjetaTipo: {
    width: '47%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 2, borderColor: '#E0E0E0', elevation: 1, gap: 6,
  },
  textoTipo: { fontSize: 13, color: '#9E9E9E', fontWeight: '500' },
  itemSeleccionable: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
    borderWidth: 2, borderColor: 'transparent', elevation: 1,
  },
  itemSeleccionado: { borderColor: '#4A90D9', backgroundColor: '#E3F2FD' },
  infoItem: { flex: 1 },
  tituloItem: { fontSize: 14, fontWeight: '600', color: '#212121' },
  subItem: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  etiquetaNivel: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  textoNivel: { fontSize: 11, fontWeight: 'bold' },
  textoVacio: { fontSize: 13, color: '#9E9E9E', textAlign: 'center', padding: 20 },
  notaInfo: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F3E5F5',
    borderRadius: 10, padding: 12, marginBottom: 16, gap: 8,
  },
  textoNota: { flex: 1, fontSize: 12, color: '#6A1B9A', lineHeight: 18 },
  checkAvanzada: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF8E1', borderRadius: 10, padding: 12, marginBottom: 16,
  },
  textoCheckAvanzada: { fontSize: 13, color: '#E65100', fontWeight: '500' },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0',
    paddingHorizontal: 14, height: 48, fontSize: 15, color: '#212121', marginBottom: 20,
  },
  botonAsignar: {
    backgroundColor: '#2E7D32', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  botonDeshabilitado: { backgroundColor: '#A5D6A7' },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default AsignarTareaScreen;
