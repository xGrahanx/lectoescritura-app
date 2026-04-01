/**
 * ReportesScreen.jsx - Reportes y estadisticas del sistema
 *
 * El administrador puede ver reportes de rendimiento general,
 * exportar datos y visualizar tendencias de aprendizaje.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DATOS_REPORTE = {
  promedioMensual: [
    { mes: 'Ene', promedio: 65 }, { mes: 'Feb', promedio: 68 },
    { mes: 'Mar', promedio: 72 }, { mes: 'Abr', promedio: 71 },
  ],
  distribucionRendimiento: [
    { rango: 'Alto (80-100%)', cantidad: 42, color: '#4CAF50' },
    { rango: 'Medio (60-79%)', cantidad: 68, color: '#FF9800' },
    { rango: 'Bajo (0-59%)', cantidad: 35, color: '#F44336' },
  ],
  modulosMasUsados: [
    { modulo: 'Lectura', usos: 1240, porcentaje: 45 },
    { modulo: 'Escritura', usos: 890, porcentaje: 32 },
    { modulo: 'Ejercicios IA', usos: 630, porcentaje: 23 },
  ],
};

const ReportesScreen = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const ALTURA_MAX = 80;

  const exportarReporte = () => {
    Alert.alert('Exportar reporte', 'El reporte sera enviado a tu correo electronico en formato PDF.');
  };

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="file-chart" size={26} color="#1A237E" />
          <Text style={styles.titulo}> Reportes</Text>
        </View>
        <TouchableOpacity style={styles.botonExportar} onPress={exportarReporte}>
          <MaterialCommunityIcons name="download" size={18} color="#6A1B9A" />
          <Text style={styles.textoExportar}> Exportar</Text>
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
        <View style={styles.grafica}>
          {DATOS_REPORTE.promedioMensual.map(item => (
            <View key={item.mes} style={styles.columnaGrafica}>
              <Text style={styles.valorBarra}>{item.promedio}%</Text>
              <View style={styles.contenedorBarra}>
                <View style={[styles.barra, { height: (item.promedio / 100) * ALTURA_MAX, backgroundColor: item.promedio >= 70 ? '#4CAF50' : '#FF9800' }]} />
              </View>
              <Text style={styles.etiquetaBarra}>{item.mes}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.tarjetaDistribucion}>
        <Text style={styles.tituloTarjeta}>Distribucion de rendimiento</Text>
        <Text style={styles.subtituloTarjeta}>Total: 145 estudiantes</Text>
        {DATOS_REPORTE.distribucionRendimiento.map(item => (
          <View key={item.rango} style={styles.filaDistribucion}>
            <View style={[styles.puntito, { backgroundColor: item.color }]} />
            <Text style={styles.textoRango}>{item.rango}</Text>
            <View style={styles.barraDistribucion}>
              <View style={[styles.rellenoDistribucion, { flex: Math.round((item.cantidad / 145) * 100), backgroundColor: item.color }]} />
              <View style={{ flex: 100 - Math.round((item.cantidad / 145) * 100) }} />
            </View>
            <Text style={[styles.cantidadDistribucion, { color: item.color }]}>{item.cantidad}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tarjetaModulos}>
        <Text style={styles.tituloTarjeta}>Modulos mas utilizados</Text>
        {DATOS_REPORTE.modulosMasUsados.map(item => (
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
          {[
            { tipo: 'Errores detectados', valor: 47, color: '#F44336', icono: 'alert-circle' },
            { tipo: 'Logros registrados', valor: 89, color: '#4CAF50', icono: 'star-circle' },
            { tipo: 'Inactividades', valor: 12, color: '#FF9800', icono: 'clock-alert' },
            { tipo: 'Mejoras notables', valor: 34, color: '#2196F3', icono: 'trending-up' },
          ].map((item, index) => (
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
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tituloRow: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  botonExportar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E5F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  textoExportar: { fontSize: 13, color: '#6A1B9A', fontWeight: '600' },
  selectorPeriodo: { flexDirection: 'row', margin: 16, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4, elevation: 1 },
  botonPeriodo: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  botonPeriodoActivo: { backgroundColor: '#6A1B9A' },
  textoPeriodo: { fontSize: 13, color: '#757575' },
  textoPeriodoActivo: { color: '#FFFFFF', fontWeight: '600' },
  tarjetaGrafica: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, elevation: 2 },
  tituloTarjeta: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  subtituloTarjeta: { fontSize: 12, color: '#9E9E9E', marginBottom: 16 },
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
