/**
 * ConfiguracionScreen.jsx - Configuracion del sistema
 *
 * El administrador puede configurar parametros del sistema:
 * umbrales de alertas de la IA, notificaciones y sincronizacion offline.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ConfiguracionScreen = () => {
  const [umbralAltoRendimiento, setUmbralAltoRendimiento] = useState('80');
  const [umbralBajoRendimiento, setUmbralBajoRendimiento] = useState('60');
  const [diasInactividad, setDiasInactividad] = useState('3');
  const [notifActivas, setNotifActivas] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [syncAutomatica, setSyncAutomatica] = useState(true);
  const [intervaloSync, setIntervaloSync] = useState('30');

  const guardarConfiguracion = () => {
    Alert.alert('Configuracion guardada', 'Los cambios han sido aplicados al sistema.');
  };

  const limpiarCacheOffline = () => {
    Alert.alert(
      'Limpiar cache',
      'Estas seguro? Se eliminaran los datos offline no sincronizados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpiar', style: 'destructive', onPress: () => Alert.alert('Cache limpiado', 'Los datos offline fueron eliminados.') },
      ]
    );
  };

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="cog" size={26} color="#1A237E" />
          <Text style={styles.titulo}> Configuracion</Text>
        </View>
      </View>

      <View style={styles.seccion}>
        <View style={styles.encabezadoSeccion}>
          <MaterialCommunityIcons name="robot" size={20} color="#9C27B0" />
          <Text style={styles.tituloSeccion}> Parametros de la IA</Text>
        </View>
        <Text style={styles.etiqueta}>Umbral de alto rendimiento (%)</Text>
        <TextInput style={styles.input} value={umbralAltoRendimiento} onChangeText={setUmbralAltoRendimiento} keyboardType="numeric" placeholder="80" placeholderTextColor="#BDBDBD" />
        <Text style={styles.ayuda}>Estudiantes con promedio igual o mayor recibiran tareas adicionales.</Text>

        <Text style={styles.etiqueta}>Umbral de bajo rendimiento (%)</Text>
        <TextInput style={styles.input} value={umbralBajoRendimiento} onChangeText={setUmbralBajoRendimiento} keyboardType="numeric" placeholder="60" placeholderTextColor="#BDBDBD" />
        <Text style={styles.ayuda}>Estudiantes por debajo de este umbral generaran alertas de atencion.</Text>

        <Text style={styles.etiqueta}>Dias de inactividad para alerta</Text>
        <TextInput style={styles.input} value={diasInactividad} onChangeText={setDiasInactividad} keyboardType="numeric" placeholder="3" placeholderTextColor="#BDBDBD" />
        <Text style={styles.ayuda}>Se enviara alerta al docente si el estudiante no practica en este numero de dias.</Text>
      </View>

      <View style={styles.seccion}>
        <View style={styles.encabezadoSeccion}>
          <MaterialCommunityIcons name="bell" size={20} color="#FF9800" />
          <Text style={styles.tituloSeccion}> Notificaciones</Text>
        </View>
        {[
          { label: 'Notificaciones activas', valor: notifActivas, setter: setNotifActivas },
          { label: 'Notificaciones por correo', valor: notifEmail, setter: setNotifEmail },
          { label: 'Notificaciones push', valor: notifPush, setter: setNotifPush },
        ].map((item, index) => (
          <View key={index} style={styles.filaSwitch}>
            <Text style={styles.textoSwitch}>{item.label}</Text>
            <Switch value={item.valor} onValueChange={item.setter} trackColor={{ false: '#E0E0E0', true: '#FFE0B2' }} thumbColor={item.valor ? '#FF9800' : '#BDBDBD'} />
          </View>
        ))}
      </View>

      <View style={styles.seccion}>
        <View style={styles.encabezadoSeccion}>
          <MaterialCommunityIcons name="wifi-off" size={20} color="#4A90D9" />
          <Text style={styles.tituloSeccion}> Modo Offline</Text>
        </View>
        <View style={styles.filaSwitch}>
          <Text style={styles.textoSwitch}>Sincronizacion automatica</Text>
          <Switch value={syncAutomatica} onValueChange={setSyncAutomatica} trackColor={{ false: '#E0E0E0', true: '#BBDEFB' }} thumbColor={syncAutomatica ? '#4A90D9' : '#BDBDBD'} />
        </View>
        <Text style={styles.etiqueta}>Intervalo de sincronizacion (minutos)</Text>
        <TextInput style={styles.input} value={intervaloSync} onChangeText={setIntervaloSync} keyboardType="numeric" placeholder="30" placeholderTextColor="#BDBDBD" />
        <TouchableOpacity style={styles.botonLimpiar} onPress={limpiarCacheOffline}>
          <MaterialCommunityIcons name="delete-sweep" size={18} color="#F44336" />
          <Text style={styles.textoLimpiar}>  Limpiar cache offline</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.seccion}>
        <View style={styles.encabezadoSeccion}>
          <MaterialCommunityIcons name="information" size={20} color="#607D8B" />
          <Text style={styles.tituloSeccion}> Informacion del sistema</Text>
        </View>
        {[
          { label: 'Version de la app', valor: '1.0.0' },
          { label: 'Base de datos', valor: 'PostgreSQL 14' },
          { label: 'Ultima sincronizacion', valor: 'Hace 5 min' },
          { label: 'Registros offline pendientes', valor: '0' },
        ].map((item, index) => (
          <View key={index} style={styles.filaInfo}>
            <Text style={styles.etiquetaInfo}>{item.label}</Text>
            <Text style={styles.valorInfo}>{item.valor}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.botonGuardar} onPress={guardarConfiguracion}>
        <MaterialCommunityIcons name="content-save" size={18} color="#FFFFFF" />
        <Text style={styles.botonTexto}>  Guardar configuracion</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  encabezado: { backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50 },
  tituloRow: { flexDirection: 'row', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1A237E' },
  seccion: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 12, marginBottom: 4, borderRadius: 14, padding: 16, elevation: 2 },
  encabezadoSeccion: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  tituloSeccion: { fontSize: 15, fontWeight: 'bold', color: '#212121' },
  etiqueta: { fontSize: 13, fontWeight: '600', color: '#424242', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: '#FAFAFA', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 12, height: 44, fontSize: 15, color: '#212121' },
  ayuda: { fontSize: 11, color: '#9E9E9E', marginTop: 4, lineHeight: 16 },
  filaSwitch: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', marginBottom: 2 },
  textoSwitch: { fontSize: 14, color: '#424242' },
  botonLimpiar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', borderRadius: 8, padding: 10, marginTop: 12, justifyContent: 'center' },
  textoLimpiar: { fontSize: 14, color: '#F44336', fontWeight: '600' },
  filaInfo: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', marginBottom: 2 },
  etiquetaInfo: { fontSize: 13, color: '#757575' },
  valorInfo: { fontSize: 13, color: '#212121', fontWeight: '500' },
  botonGuardar: { backgroundColor: '#6A1B9A', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 16 },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default ConfiguracionScreen;
