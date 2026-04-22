/**
 * ProgresoScreen.jsx - Pantalla de progreso del estudiante
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';

const ALTURA_MAX_BARRA = 100;
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ProgresoScreen = () => {
  const { usuario } = useAuth();
  const [resumen, setResumen]             = useState(null);
  const [progresoDiario, setProgresoDiario] = useState([]);
  const [resultadosLectura, setResultadosLectura]   = useState([]);
  const [resultadosEscritura, setResultadosEscritura] = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [refrescando, setRefrescando]     = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('semana');

  const cargarDatos = useCallback(async () => {
    try {
      const [resumenRes, diarioRes, lecturaRes, escrituraRes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}/progreso/${usuario.id}/resumen`, { timeout: API_CONFIG.TIMEOUT }),
        axios.get(`${API_CONFIG.BASE_URL}/progreso/${usuario.id}`, { timeout: API_CONFIG.TIMEOUT }),
        axios.get(`${API_CONFIG.BASE_URL}/progreso/${usuario.id}/lectura`, { timeout: API_CONFIG.TIMEOUT }),
        axios.get(`${API_CONFIG.BASE_URL}/progreso/${usuario.id}/escritura`, { timeout: API_CONFIG.TIMEOUT }),
      ]);
      setResumen(resumenRes.data);
      setProgresoDiario(diarioRes.data);
      setResultadosLectura(lecturaRes.data);
      setResultadosEscritura(escrituraRes.data);
    } catch (error) {
      console.error('Error al cargar progreso:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [usuario.id]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const onRefrescar = () => { setRefrescando(true); cargarDatos(); };

  // Construir datos de la semana actual desde progreso_diario
  const datosSemana = () => {
    const hoy = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - (6 - i));
      const registro = progresoDiario.find(p => {
        const d = new Date(p.fecha);
        return d.toDateString() === fecha.toDateString();
      });
      return {
        dia: DIAS_SEMANA[fecha.getDay()],
        puntaje: registro?.puntaje_promedio || 0,
      };
    });
  };

  // Últimas actividades combinando lectura y escritura
  const actividadesRecientes = () => {
    const lectura = resultadosLectura.slice(0, 3).map(r => ({
      id: `l-${r.id}`, tipo: 'lectura',
      titulo: r.textos?.titulo || 'Texto de lectura',
      puntaje: r.puntaje,
      fecha: r.creado_en,
    }));
    const escritura = resultadosEscritura.slice(0, 3).map(r => ({
      id: `e-${r.id}`, tipo: 'escritura',
      titulo: r.ejercicios_escritura?.titulo || 'Ejercicio de escritura',
      puntaje: r.puntaje,
      fecha: r.creado_en,
    }));
    return [...lectura, ...escritura]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5);
  };

  const formatearFechaRelativa = (fecha) => {
    if (!fecha) return '';
    const diff = Math.floor((Date.now() - new Date(fecha)) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return `Hace ${diff} días`;
  };

  const progresoModulos = () => {
    const promsLectura = resultadosLectura.length
      ? Math.round(resultadosLectura.reduce((s, r) => s + (r.puntaje || 0), 0) / resultadosLectura.length)
      : 0;
    const promsEscritura = resultadosEscritura.length
      ? Math.round(resultadosEscritura.reduce((s, r) => s + (r.puntaje || 0), 0) / resultadosEscritura.length)
      : 0;
    return [
      { nombre: 'Lectura',  progreso: promsLectura,  color: '#4A90D9', icono: 'book-open-variant' },
      { nombre: 'Escritura', progreso: promsEscritura, color: '#E91E63', icono: 'pencil' },
    ];
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.textoCargando}>Cargando progreso...</Text>
      </View>
    );
  }

  const semana = datosSemana();
  const actividades = actividadesRecientes();
  const modulos = progresoModulos();

  return (
    <ScrollView
      style={styles.contenedor}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefrescar} />}
    >
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="chart-line" size={26} color="#1A237E" />
          <Text style={styles.titulo}> Mi Progreso</Text>
        </View>
        <Text style={styles.subtitulo}>Sigue tu avance en lectoescritura</Text>
      </View>

      {/* Resumen general */}
      <View style={styles.resumenGeneral}>
        <View style={styles.statResumen}>
          <Text style={styles.valorResumen}>{resumen?.promedioGeneral ?? 0}%</Text>
          <Text style={styles.etiquetaResumen}>Promedio</Text>
        </View>
        <View style={styles.separador} />
        <View style={styles.statResumen}>
          <Text style={styles.valorResumen}>{resumen?.totalEjercicios ?? 0}</Text>
          <Text style={styles.etiquetaResumen}>Ejercicios</Text>
        </View>
        <View style={styles.separador} />
        <View style={styles.statResumen}>
          <MaterialCommunityIcons name="fire" size={20} color="#FF9800" />
          <Text style={styles.valorResumen}>{resumen?.rachaDias ?? 0}</Text>
          <Text style={styles.etiquetaResumen}>Racha</Text>
        </View>
      </View>

      {/* Selector de periodo */}
      <View style={styles.selectorPeriodo}>
        {['semana', 'mes', 'total'].map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.botonPeriodo, periodoSeleccionado === p && styles.botonPeriodoActivo]}
            onPress={() => setPeriodoSeleccionado(p)}
          >
            <Text style={[styles.textoPeriodo, periodoSeleccionado === p && styles.textoPeriodoActivo]}>
              {{ semana: 'Esta semana', mes: 'Este mes', total: 'Total' }[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Gráfica de barras semanal */}
      <View style={styles.tarjetaGrafica}>
        <Text style={styles.tituloTarjeta}>Puntaje diario</Text>
        <View style={styles.grafica}>
          {semana.map((item) => (
            <View key={item.dia} style={styles.columnaGrafica}>
              <Text style={styles.valorBarra}>{item.puntaje > 0 ? item.puntaje : ''}</Text>
              <View style={styles.contenedorBarra}>
                <View style={[styles.barra, {
                  height: (item.puntaje / 100) * ALTURA_MAX_BARRA,
                  backgroundColor: item.puntaje >= 80 ? '#4CAF50' : item.puntaje >= 60 ? '#FF9800' : '#E0E0E0',
                }]} />
              </View>
              <Text style={styles.etiquetaBarra}>{item.dia}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Progreso por módulo */}
      <View style={styles.tarjetaModulos}>
        <Text style={styles.tituloTarjeta}>Progreso por módulo</Text>
        {modulos.map(modulo => (
          <View key={modulo.nombre} style={styles.filaModulo}>
            <MaterialCommunityIcons name={modulo.icono} size={20} color={modulo.color} />
            <Text style={styles.nombreModulo}>{modulo.nombre}</Text>
            <View style={styles.barraProgreso}>
              <View style={[styles.relleno, { flex: modulo.progreso, backgroundColor: modulo.color }]} />
              <View style={{ flex: 100 - modulo.progreso }} />
            </View>
            <Text style={[styles.porcentajeModulo, { color: modulo.color }]}>{modulo.progreso}%</Text>
          </View>
        ))}
      </View>

      {/* Actividades recientes */}
      <View style={styles.tituloSeccionRow}>
        <MaterialCommunityIcons name="history" size={20} color="#212121" />
        <Text style={styles.tituloSeccion}> Actividades recientes</Text>
      </View>

      {actividades.length === 0 ? (
        <View style={styles.sinActividad}>
          <MaterialCommunityIcons name="clipboard-text-off" size={36} color="#BDBDBD" />
          <Text style={styles.textoSinActividad}>Aún no hay actividades registradas</Text>
        </View>
      ) : (
        actividades.map(actividad => (
          <View key={actividad.id} style={styles.tarjetaActividad}>
            <MaterialCommunityIcons
              name={actividad.tipo === 'lectura' ? 'book-open-variant' : 'pencil'}
              size={22}
              color={actividad.tipo === 'lectura' ? '#4A90D9' : '#E91E63'}
            />
            <View style={styles.infoActividad}>
              <Text style={styles.tituloActividad}>{actividad.titulo}</Text>
              <Text style={styles.fechaActividad}>{formatearFechaRelativa(actividad.fecha)}</Text>
            </View>
            <View style={[styles.puntajeActividad, { backgroundColor: actividad.puntaje >= 80 ? '#E8F5E9' : '#FFF8E1' }]}>
              <Text style={[styles.textoPuntajeActividad, { color: actividad.puntaje >= 80 ? '#2E7D32' : '#F57F17' }]}>
                {actividad.puntaje}%
              </Text>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F9FF' },
  textoCargando: { color: '#9E9E9E', marginTop: 12 },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50 },
  tituloRow: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  subtitulo: { fontSize: 13, color: '#757575', marginTop: 2 },
  resumenGeneral: {
    backgroundColor: '#FFFFFF', margin: 16, borderRadius: 16, padding: 16,
    flexDirection: 'row', justifyContent: 'space-around', elevation: 3,
  },
  statResumen: { alignItems: 'center' },
  valorResumen: { fontSize: 22, fontWeight: 'bold', color: '#1A237E' },
  etiquetaResumen: { fontSize: 12, color: '#757575', marginTop: 4 },
  separador: { width: 1, backgroundColor: '#E0E0E0' },
  selectorPeriodo: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, elevation: 1,
  },
  botonPeriodo: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  botonPeriodoActivo: { backgroundColor: '#4A90D9' },
  textoPeriodo: { fontSize: 13, color: '#757575' },
  textoPeriodoActivo: { color: '#FFFFFF', fontWeight: '600' },
  tarjetaGrafica: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, elevation: 2 },
  tituloTarjeta: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 16 },
  grafica: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 140 },
  columnaGrafica: { alignItems: 'center', flex: 1 },
  valorBarra: { fontSize: 10, color: '#757575', marginBottom: 4 },
  contenedorBarra: { height: 100, justifyContent: 'flex-end', width: 24 },
  barra: { borderRadius: 4, width: '100%' },
  etiquetaBarra: { fontSize: 11, color: '#757575', marginTop: 4 },
  tarjetaModulos: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, elevation: 2 },
  filaModulo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  nombreModulo: { fontSize: 13, color: '#424242', width: 70 },
  barraProgreso: { flex: 1, height: 8, backgroundColor: '#F5F5F5', borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  relleno: { height: 8, borderRadius: 4 },
  porcentajeModulo: { fontSize: 13, fontWeight: 'bold', width: 36, textAlign: 'right' },
  tituloSeccionRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 14, marginTop: 4 },
  tituloSeccion: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  sinActividad: { alignItems: 'center', padding: 30 },
  textoSinActividad: { color: '#9E9E9E', fontSize: 14, marginTop: 10 },
  tarjetaActividad: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 2,
  },
  infoActividad: { flex: 1, marginLeft: 12 },
  tituloActividad: { fontSize: 14, fontWeight: '500', color: '#212121' },
  fechaActividad: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  puntajeActividad: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  textoPuntajeActividad: { fontSize: 13, fontWeight: 'bold' },
});

export default ProgresoScreen;
