/**
 * AlertasScreen.jsx - Centro de alertas del docente
 *
 * Carga alertas reales desde el backend y permite generarlas automáticamente.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert, Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';

const CONFIG_ALERTA = {
  error:            { color: '#F44336', icono: 'alert-circle',  fondo: '#FFEBEE', etiqueta: 'Error' },
  logro:            { color: '#4CAF50', icono: 'star-circle',   fondo: '#E8F5E9', etiqueta: 'Logro' },
  inactividad:      { color: '#FF9800', icono: 'clock-alert',   fondo: '#FFF8E1', etiqueta: 'Inactividad' },
  mejora:           { color: '#2196F3', icono: 'trending-up',   fondo: '#E3F2FD', etiqueta: 'Mejora' },
  alto_rendimiento: { color: '#9C27B0', icono: 'trophy',        fondo: '#F3E5F5', etiqueta: 'Alto rendimiento' },
};

const AlertasScreen = () => {
  const { usuario } = useAuth();
  const [alertas, setAlertas]         = useState([]);
  const [filtro, setFiltro]           = useState('todas');
  const [cargando, setCargando]       = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [generando, setGenerando]     = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);

  const cargarAlertas = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API_CONFIG.BASE_URL}/alertas/docente/${usuario.id}`,
        { timeout: API_CONFIG.TIMEOUT }
      );
      setAlertas(data);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [usuario.id]);

  useEffect(() => { cargarAlertas(); }, [cargarAlertas]);

  const onRefrescar = () => { setRefrescando(true); cargarAlertas(); };

  const marcarLeida = async (id) => {
    try {
      await axios.put(
        `${API_CONFIG.BASE_URL}/alertas/${id}/leer`,
        {},
        { timeout: API_CONFIG.TIMEOUT }
      );
      setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a));
    } catch {
      console.error('Error al marcar alerta');
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await axios.put(
        `${API_CONFIG.BASE_URL}/alertas/docente/${usuario.id}/leer-todas`,
        {},
        { timeout: API_CONFIG.TIMEOUT }
      );
      setAlertas(prev => prev.map(a => ({ ...a, leida: true })));
    } catch {
      Alert.alert('Error', 'No se pudieron marcar las alertas.');
    }
  };

  const generarAlertas = async () => {
    setGenerando(true);
    try {
      const { data } = await axios.post(
        `${API_CONFIG.BASE_URL}/alertas/generar/${usuario.id}`,
        {},
        { timeout: API_CONFIG.TIMEOUT }
      );
      Alert.alert('Análisis completado', data.mensaje);
      cargarAlertas();
    } catch {
      Alert.alert('Error', 'No se pudo generar el análisis.');
    } finally {
      setGenerando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const ahora = new Date();
    const diff = Math.floor((ahora - d) / 60000); // minutos
    if (diff < 60) return `Hace ${diff} min`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`;
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  const alertasFiltradas = filtro === 'todas' ? alertas
    : filtro === 'noLeidas' ? alertas.filter(a => !a.leida)
    : alertas.filter(a => a.tipo === filtro);

  const noLeidas = alertas.filter(a => !a.leida).length;

  const abrirAlerta = (item) => {
    setAlertaSeleccionada(item);
    if (!item.leida) marcarLeida(item.id);
  };

  const renderAlerta = ({ item }) => {
    const config = CONFIG_ALERTA[item.tipo] || CONFIG_ALERTA.error;
    return (
      <TouchableOpacity
        style={[styles.tarjeta, !item.leida && styles.tarjetaNoLeida]}
        onPress={() => abrirAlerta(item)}
      >
        {!item.leida && <View style={styles.puntito} />}
        <View style={[styles.iconoContenedor, { backgroundColor: config.fondo }]}>
          <MaterialCommunityIcons name={config.icono} size={24} color={config.color} />
        </View>
        <View style={styles.contenido}>
          <View style={styles.encabezadoAlerta}>
            <View style={[styles.etiquetaTipo, { backgroundColor: config.fondo }]}>
              <Text style={[styles.textoEtiqueta, { color: config.color }]}>{config.etiqueta}</Text>
            </View>
            <Text style={styles.hora}>{formatearFecha(item.creado_en)}</Text>
          </View>
          {item.estudiante && (
            <Text style={styles.nombreEstudiante}>
              {item.estudiante.nombre} {item.estudiante.apellido}
            </Text>
          )}
          <Text style={styles.tituloAlerta}>{item.titulo}</Text>
          <Text style={styles.mensajeAlerta}>{item.mensaje}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.contenedor}>
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="bell-alert" size={24} color="#1A237E" />
          <Text style={styles.titulo}> Alertas</Text>
          {noLeidas > 0 && (
            <View style={styles.badgeNoLeidas}>
              <Text style={styles.textoBadge}>{noLeidas}</Text>
            </View>
          )}
        </View>
        <View style={styles.accionesEncabezado}>
          {noLeidas > 0 && (
            <TouchableOpacity onPress={marcarTodasLeidas} style={styles.botonLeerTodas}>
              <Text style={styles.textoLeerTodas}>Leer todas</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.botonGenerar, generando && styles.botonDeshabilitado]}
            onPress={generarAlertas}
            disabled={generando}
          >
            {generando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="refresh" size={16} color="#FFFFFF" />
            )}
            <Text style={styles.textoBotonGenerar}> Analizar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtros}>
        {[
          { key: 'todas',    label: 'Todas' },
          { key: 'noLeidas', label: 'No leídas' },
          { key: 'error',    label: 'Errores' },
          { key: 'logro',    label: 'Logros' },
          { key: 'inactividad', label: 'Inactividad' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.botonFiltro, filtro === f.key && styles.botonFiltroActivo]}
            onPress={() => setFiltro(f.key)}
          >
            <Text style={[styles.textoFiltro, filtro === f.key && styles.textoFiltroActivo]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.textoCargando}>Cargando alertas...</Text>
        </View>
      ) : (
        <FlatList
          data={alertasFiltradas}
          renderItem={renderAlerta}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefrescar} />}
          ListEmptyComponent={
            <View style={styles.sinAlertas}>
              <MaterialCommunityIcons name="bell-check" size={48} color="#4CAF50" />
              <Text style={styles.textoSinAlertas}>No hay alertas en esta categoría</Text>
              {filtro === 'todas' && (
                <Text style={styles.subTextoSinAlertas}>
                  Toca "Analizar" para revisar el rendimiento de tus estudiantes
                </Text>
              )}
            </View>
          }
        />
      )}
      {/* Modal de detalle */}
      <Modal
        visible={!!alertaSeleccionada}
        transparent
        animationType="fade"
        onRequestClose={() => setAlertaSeleccionada(null)}
      >
        <TouchableOpacity
          style={styles.modalFondo}
          activeOpacity={1}
          onPress={() => setAlertaSeleccionada(null)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContenido}>
            {alertaSeleccionada && (() => {
              const config = CONFIG_ALERTA[alertaSeleccionada.tipo] || CONFIG_ALERTA.error;
              return (
                <>
                  <View style={[styles.modalEncabezado, { backgroundColor: config.fondo }]}>
                    <MaterialCommunityIcons name={config.icono} size={32} color={config.color} />
                    <View style={styles.modalTituloContenedor}>
                      <View style={[styles.etiquetaTipo, { backgroundColor: config.color + '20' }]}>
                        <Text style={[styles.textoEtiqueta, { color: config.color }]}>{config.etiqueta}</Text>
                      </View>
                      <Text style={styles.modalTitulo}>{alertaSeleccionada.titulo}</Text>
                    </View>
                  </View>
                  {alertaSeleccionada.estudiante && (
                    <View style={styles.modalEstudiante}>
                      <MaterialCommunityIcons name="account" size={16} color="#757575" />
                      <Text style={styles.modalNombreEstudiante}>
                        {alertaSeleccionada.estudiante.nombre} {alertaSeleccionada.estudiante.apellido}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.modalMensaje}>{alertaSeleccionada.mensaje}</Text>
                  <Text style={styles.modalFecha}>{formatearFecha(alertaSeleccionada.creado_en)}</Text>
                  <TouchableOpacity
                    style={[styles.botonCerrarModal, { backgroundColor: config.color }]}
                    onPress={() => setAlertaSeleccionada(null)}
                  >
                    <Text style={styles.textoBotonCerrar}>Cerrar</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textoCargando: { color: '#9E9E9E', marginTop: 12 },
  encabezado: {
    backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  tituloRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  badgeNoLeidas: {
    backgroundColor: '#F44336', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2, marginLeft: 8,
  },
  textoBadge: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  accionesEncabezado: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botonLeerTodas: { paddingHorizontal: 10, paddingVertical: 6 },
  textoLeerTodas: { fontSize: 12, color: '#4A90D9', fontWeight: '600' },
  botonGenerar: {
    backgroundColor: '#2E7D32', borderRadius: 8, paddingHorizontal: 10,
    paddingVertical: 6, flexDirection: 'row', alignItems: 'center',
  },
  botonDeshabilitado: { opacity: 0.6 },
  textoBotonGenerar: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  filtros: { flexDirection: 'row', padding: 12, flexWrap: 'wrap', gap: 6 },
  botonFiltro: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0',
  },
  botonFiltroActivo: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  textoFiltro: { fontSize: 12, color: '#757575' },
  textoFiltroActivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20, paddingTop: 4 },
  tarjeta: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    flexDirection: 'row', marginBottom: 10, elevation: 1, position: 'relative',
  },
  tarjetaNoLeida: { borderLeftWidth: 3, borderLeftColor: '#4A90D9' },
  puntito: {
    position: 'absolute', top: 12, right: 12,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#4A90D9',
  },
  iconoContenedor: {
    width: 48, height: 48, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  contenido: { flex: 1 },
  encabezadoAlerta: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  etiquetaTipo: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  textoEtiqueta: { fontSize: 11, fontWeight: 'bold' },
  hora: { fontSize: 11, color: '#9E9E9E' },
  nombreEstudiante: { fontSize: 13, fontWeight: 'bold', color: '#1A237E', marginBottom: 2 },
  tituloAlerta: { fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 4 },
  mensajeAlerta: { fontSize: 12, color: '#757575', lineHeight: 18 },
  sinAlertas: { alignItems: 'center', padding: 40 },
  textoSinAlertas: { color: '#757575', fontSize: 15, fontWeight: '600', marginTop: 12 },
  subTextoSinAlertas: { color: '#BDBDBD', fontSize: 13, marginTop: 6, textAlign: 'center' },
  // Modal
  modalFondo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalContenido: {
    backgroundColor: '#FFFFFF', borderRadius: 20,
    width: '100%', overflow: 'hidden', elevation: 10,
  },
  modalEncabezado: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, gap: 14,
  },
  modalTituloContenedor: { flex: 1 },
  modalTitulo: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginTop: 4 },
  modalEstudiante: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, gap: 6,
  },
  modalNombreEstudiante: { fontSize: 14, fontWeight: '600', color: '#1A237E' },
  modalMensaje: {
    fontSize: 14, color: '#424242', lineHeight: 22,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  modalFecha: { fontSize: 12, color: '#BDBDBD', paddingHorizontal: 20, marginBottom: 16 },
  botonCerrarModal: {
    margin: 16, borderRadius: 12, padding: 14,
    alignItems: 'center',
  },
  textoBotonCerrar: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});

export default AlertasScreen;
