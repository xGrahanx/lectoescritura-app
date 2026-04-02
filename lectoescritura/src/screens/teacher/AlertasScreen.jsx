/**
 * AlertasScreen.jsx - Centro de alertas del docente
 *
 * Muestra todas las alertas generadas automaticamente por la IA sobre:
 * errores frecuentes, logros, inactividad y alto rendimiento.
 */

import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ALERTAS_EJEMPLO = [
  { id: 1, tipo: 'error', estudiante: 'Pedro Martinez', titulo: 'Errores ortograficos frecuentes', mensaje: 'Pedro cometio 8 errores ortograficos en el ultimo dictado. La IA detecta dificultad con el uso de "b" y "v".', fecha: '01/04/2026', hora: '10:30', leida: false },
  { id: 2, tipo: 'logro', estudiante: 'Ana Garcia', titulo: 'Rendimiento sobresaliente', mensaje: 'Ana obtuvo 100% en ejercicios de IA por 3 dias consecutivos. Se recomienda asignarle tareas de nivel avanzado.', fecha: '01/04/2026', hora: '09:15', leida: true },
  { id: 3, tipo: 'inactividad', estudiante: 'Luisa Rodriguez', titulo: 'Inactividad prolongada', mensaje: 'Luisa no ha completado ningun ejercicio en los ultimos 5 dias. Se recomienda contactar al estudiante.', fecha: '31/03/2026', hora: '18:00', leida: true },
  { id: 4, tipo: 'mejora', estudiante: 'Carlos Lopez', titulo: 'Mejora significativa', mensaje: 'Carlos mejoro su promedio de 65% a 91% en la ultima semana. La IA detecta progreso en comprension lectora.', fecha: '30/03/2026', hora: '14:20', leida: true },
];

const CONFIG_ALERTA = {
  error: { color: '#F44336', icono: 'alert-circle', fondo: '#FFEBEE', etiqueta: 'Error' },
  logro: { color: '#4CAF50', icono: 'star-circle', fondo: '#E8F5E9', etiqueta: 'Logro' },
  inactividad: { color: '#FF9800', icono: 'clock-alert', fondo: '#FFF8E1', etiqueta: 'Inactividad' },
  mejora: { color: '#2196F3', icono: 'trending-up', fondo: '#E3F2FD', etiqueta: 'Mejora' },
};

const AlertasScreen = () => {
  const [filtro, setFiltro] = useState('todas');
  const [alertas, setAlertas] = useState(ALERTAS_EJEMPLO);

  const alertasFiltradas = filtro === 'todas' ? alertas
    : filtro === 'noLeidas' ? alertas.filter(a => !a.leida)
    : alertas.filter(a => a.tipo === filtro);

  const marcarLeida = (id) => {
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a));
  };

  const noLeidas = alertas.filter(a => !a.leida).length;

  const renderAlerta = ({ item }) => {
    const config = CONFIG_ALERTA[item.tipo];
    return (
      <TouchableOpacity
        style={[styles.tarjeta, !item.leida && styles.tarjetaNoLeida]}
        onPress={() => marcarLeida(item.id)}
      >
        <View style={[styles.iconoContenedor, { backgroundColor: config.fondo }]}>
          <MaterialCommunityIcons name={config.icono} size={24} color={config.color} />
        </View>
        <View style={styles.contenido}>
          <View style={styles.encabezadoAlerta}>
            <View style={[styles.etiquetaTipo, { backgroundColor: config.fondo }]}>
              <Text style={[styles.textoEtiqueta, { color: config.color }]}>{config.etiqueta}</Text>
            </View>
            <Text style={styles.hora}>{item.hora}</Text>
          </View>
          <Text style={styles.nombreEstudiante}>{item.estudiante}</Text>
          <Text style={styles.tituloAlerta}>{item.titulo}</Text>
          <Text style={styles.mensajeAlerta} numberOfLines={2}>{item.mensaje}</Text>
          <Text style={styles.fecha}>{item.fecha}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="bell-alert" size={24} color="#1A237E" />
          <Text style={styles.titulo}> Alertas</Text>
        </View>
        {noLeidas > 0 && (
          <View style={styles.badgeNoLeidas}>
            <Text style={styles.textoBadge}>{noLeidas} nuevas</Text>
          </View>
        )}
      </View>
      <View style={styles.filtros}>
        {[{ key: 'todas', label: 'Todas' }, { key: 'noLeidas', label: 'No leidas' }, { key: 'error', label: 'Errores' }, { key: 'logro', label: 'Logros' }].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.botonFiltro, filtro === f.key && styles.botonFiltroActivo]}
            onPress={() => setFiltro(f.key)}
          >
            <Text style={[styles.textoFiltro, filtro === f.key && styles.textoFiltroActivo]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={alertasFiltradas}
        renderItem={renderAlerta}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.sinAlertas}>
            <MaterialCommunityIcons name="bell-check" size={40} color="#4CAF50" />
            <Text style={styles.textoSinAlertas}>No hay alertas en esta categoria</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  tituloRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  badgeNoLeidas: { backgroundColor: '#F44336', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  textoBadge: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  filtros: { flexDirection: 'row', padding: 16, flexWrap: 'wrap' },
  botonFiltro: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' },
  botonFiltroActivo: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  textoFiltro: { fontSize: 12, color: '#757575' },
  textoFiltroActivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { padding: 16, paddingBottom: 20, paddingTop: 8 },
  tarjeta: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, flexDirection: 'row', marginBottom: 12, elevation: 1 },
  tarjetaNoLeida: { borderLeftWidth: 3, borderLeftColor: '#4A90D9' },
  puntito: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#4A90D9' },
  iconoContenedor: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  contenido: { flex: 1 },
  encabezadoAlerta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  etiquetaTipo: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  textoEtiqueta: { fontSize: 11, fontWeight: 'bold' },
  hora: { fontSize: 11, color: '#9E9E9E' },
  nombreEstudiante: { fontSize: 13, fontWeight: 'bold', color: '#1A237E', marginBottom: 2 },
  tituloAlerta: { fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 4 },
  mensajeAlerta: { fontSize: 12, color: '#757575', lineHeight: 18, marginBottom: 4 },
  fecha: { fontSize: 11, color: '#BDBDBD' },
  sinAlertas: { alignItems: 'center', padding: 40 },
  textoSinAlertas: { color: '#9E9E9E', fontSize: 14 },
});

export default AlertasScreen;
