/**
 * ReportesScreen.jsx - Reportes y estadisticas del sistema
 *
 * El administrador puede ver reportes de rendimiento general,
 * exportar datos y visualizar tendencias de aprendizaje.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { API_CONFIG } from '../../utils/constantes';

const ReportesScreen = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [promedioMensual, setPromedioMensual] = useState([]);
  const [distribucionRendimiento, setDistribucionRendimiento] = useState([]);
  const [modulosMasUsados, setModulosMasUsados] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [totalEstudiantes, setTotalEstudiantes] = useState(0);
  const [descargandoPDF, setDescargandoPDF] = useState(false);

  const ALTURA_MAX = 80;

  const cargarDatos = useCallback(async () => {
    try {
      const [progresoRes, rendimientoRes, modulosRes, alertasRes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}/reportes/progreso-mensual`, { timeout: API_CONFIG.TIMEOUT }),
        axios.get(`${API_CONFIG.BASE_URL}/reportes/rendimiento`, { timeout: API_CONFIG.TIMEOUT }),
        axios.get(`${API_CONFIG.BASE_URL}/reportes/modulos`, { timeout: API_CONFIG.TIMEOUT }),
        axios.get(`${API_CONFIG.BASE_URL}/reportes/alertas`, { timeout: API_CONFIG.TIMEOUT }),
      ]);

      setPromedioMensual(progresoRes.data.promedioMensual || []);
      setDistribucionRendimiento(rendimientoRes.data.distribucion || []);
      setTotalEstudiantes(rendimientoRes.data.totalEstudiantes || 0);
      setModulosMasUsados(modulosRes.data.modulos || []);
      setAlertas(alertasRes.data.alertas || []);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      Alert.alert('Error', 'No se pudieron cargar los reportes');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const onRefrescar = () => {
    setRefrescando(true);
    cargarDatos();
  };

  const exportarReporte = async () => {
    try {
      setDescargandoPDF(true);

      // Generar nombre de archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `reporte-${fecha}.pdf`;
      const fileUri = FileSystem.documentDirectory + nombreArchivo;

      // Descargar el PDF desde el backend
      const downloadResumable = FileSystem.createDownloadResumable(
        `${API_CONFIG.BASE_URL}/reportes/pdf`,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`📥 Descargando PDF: ${Math.round(progress * 100)}%`);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      console.log('✅ PDF descargado en:', uri);

      // Verificar si el dispositivo puede compartir archivos
      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        // Compartir el PDF
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Guardar o compartir reporte',
          UTI: 'com.adobe.pdf',
        });
        Alert.alert('Éxito', 'Reporte PDF generado correctamente');
      } else {
        Alert.alert('Éxito', `Reporte guardado en: ${uri}`);
      }
    } catch (error) {
      console.error('❌ Error al exportar PDF:', error);
      Alert.alert('Error', 'No se pudo generar el reporte PDF. Intenta de nuevo.');
    } finally {
      setDescargandoPDF(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={styles.textoCargando}>Cargando reportes...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.contenedor}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefrescar} />}
    >
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="file-chart" size={26} color="#1A237E" />
          <Text style={styles.titulo}> Reportes</Text>
        </View>
        <TouchableOpacity 
          style={[styles.botonExportar, descargandoPDF && styles.botonExportarDeshabilitado]} 
          onPress={exportarReporte}
          disabled={descargandoPDF}
        >
          {descargandoPDF ? (
            <ActivityIndicator size="small" color="#6A1B9A" />
          ) : (
            <MaterialCommunityIcons name="download" size={18} color="#6A1B9A" />
          )}
          <Text style={styles.textoExportar}> {descargandoPDF ? 'Generando...' : 'Exportar'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.selectorPeriodo}>
        {['semana', 'mes', 'ano'].map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.botonPeriodo, periodoSeleccionado === p && styles.botonPeriodoActivo]}
            onPress={() => setPeriodoSeleccionado(p)}
          >
            <Text style={[styles.textoPeriodo, periodoSeleccionado === p && styles.textoPeriodoActivo]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tarjetaGrafica}>
        <Text style={styles.tituloTarjeta}>Promedio mensual del grupo</Text>
        {promedioMensual.length === 0 ? (
          <Text style={styles.sinDatos}>No hay datos disponibles</Text>
        ) : (
          <View style={styles.grafica}>
            {promedioMensual.map(item => (
              <View key={item.mes} style={styles.columnaGrafica}>
                <Text style={styles.valorBarra}>{item.promedio}%</Text>
                <View style={styles.contenedorBarra}>
                  <View style={[styles.barra, { height: (item.promedio / 100) * ALTURA_MAX, backgroundColor: item.promedio >= 70 ? '#4CAF50' : '#FF9800' }]} />
                </View>
                <Text style={styles.etiquetaBarra}>{item.mes}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.tarjetaDistribucion}>
        <Text style={styles.tituloTarjeta}>Distribucion de rendimiento</Text>
        <Text style={styles.subtituloTarjeta}>Total: {totalEstudiantes} estudiantes</Text>
        {distribucionRendimiento.map(item => (
          <View key={item.rango} style={styles.filaDistribucion}>
            <View style={[styles.puntito, { backgroundColor: item.color }]} />
            <Text style={styles.textoRango}>{item.rango}</Text>
            <View style={styles.barraDistribucion}>
              <View style={[styles.rellenoDistribucion, { flex: totalEstudiantes > 0 ? Math.round((item.cantidad / totalEstudiantes) * 100) : 0, backgroundColor: item.color }]} />
              <View style={{ flex: totalEstudiantes > 0 ? 100 - Math.round((item.cantidad / totalEstudiantes) * 100) : 100 }} />
            </View>
            <Text style={[styles.cantidadDistribucion, { color: item.color }]}>{item.cantidad}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tarjetaModulos}>
        <Text style={styles.tituloTarjeta}>Modulos mas utilizados</Text>
        {modulosMasUsados.map(item => (
          <View key={item.modulo} style={styles.filaModulo}>
            <Text style={styles.nombreModulo}>{item.modulo}</Text>
            <View style={styles.barraModulo}>
              <View style={[styles.rellenoModulo, { flex: item.porcentaje }]} />
              <View style={{ flex: 100 - item.porcentaje }} />
            </View>
            <Text style={styles.usosModulo}>{item.usos} usos</Text>
          </View>
        ))}
      </View>

      <View style={styles.tarjetaAlertas}>
        <Text style={styles.tituloTarjeta}>Resumen de alertas del mes</Text>
        <View style={styles.gridAlertas}>
          {alertas.map((item, index) => (
            <View key={index} style={[styles.tarjetaAlerta, { borderTopColor: item.color }]}>
              <MaterialCommunityIcons name={item.icono} size={22} color={item.color} />
              <Text style={styles.valorAlerta}>{item.valor}</Text>
              <Text style={styles.tipoAlerta}>{item.tipo}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F9FF' },
  textoCargando: { color: '#9E9E9E', marginTop: 12 },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tituloRow: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  botonExportar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E5F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  botonExportarDeshabilitado: { opacity: 0.6 },
  textoExportar: { fontSize: 13, color: '#6A1B9A', fontWeight: '600' },
  selectorPeriodo: { flexDirection: 'row', margin: 16, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, elevation: 1 },
  botonPeriodo: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  botonPeriodoActivo: { backgroundColor: '#6A1B9A' },
  textoPeriodo: { fontSize: 13, color: '#757575' },
  textoPeriodoActivo: { color: '#FFFFFF', fontWeight: '600' },
  tarjetaGrafica: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, elevation: 2 },
  tituloTarjeta: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  subtituloTarjeta: { fontSize: 12, color: '#9E9E9E', marginBottom: 16 },
  sinDatos: { fontSize: 13, color: '#9E9E9E', textAlign: 'center', paddingVertical: 20 },
  grafica: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120 },
  columnaGrafica: { alignItems: 'center', flex: 1 },
  valorBarra: { fontSize: 11, color: '#757575', marginBottom: 4 },
  contenedorBarra: { height: 80, justifyContent: 'flex-end', width: 24 },
  barra: { borderRadius: 4, width: '100%' },
  etiquetaBarra: { fontSize: 12, color: '#757575', marginTop: 4 },
  tarjetaDistribucion: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, elevation: 2 },
  filaDistribucion: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  puntito: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  textoRango: { fontSize: 12, color: '#424242', width: 110, marginRight: 8 },
  barraDistribucion: { flex: 1, height: 8, backgroundColor: '#F5F5F5', borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  rellenoDistribucion: { height: 8, borderRadius: 4 },
  cantidadDistribucion: { fontSize: 13, fontWeight: 'bold', width: 30, textAlign: 'right' },
  tarjetaModulos: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, elevation: 2 },
  filaModulo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  nombreModulo: { fontSize: 13, color: '#424242', width: 70 },
  barraModulo: { flex: 1, height: 8, backgroundColor: '#F5F5F5', borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  rellenoModulo: { height: 8, borderRadius: 4, backgroundColor: '#6A1B9A' },
  usosModulo: { fontSize: 12, color: '#9E9E9E', width: 60, textAlign: 'right' },
  tarjetaAlertas: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, elevation: 2 },
  gridAlertas: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  tarjetaAlerta: { width: '47%', backgroundColor: '#FAFAFA', borderRadius: 10, padding: 12, alignItems: 'center', borderTopWidth: 3, marginBottom: 12 },
  valorAlerta: { fontSize: 20, fontWeight: 'bold', color: '#212121' },
  tipoAlerta: { fontSize: 11, color: '#757575', textAlign: 'center' },
});

export default ReportesScreen;
