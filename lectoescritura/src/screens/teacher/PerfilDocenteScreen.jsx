/**
 * PerfilDocenteScreen.jsx - Perfil del docente
 *
 * Muestra los datos reales del docente desde el AuthContext.
 * El conteo de estudiantes se carga desde el backend.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../utils/constantes';

const PerfilDocenteScreen = () => {
  const { usuario, cerrarSesion } = useAuth();
  const [notifErrores, setNotifErrores]               = useState(true);
  const [notifLogros, setNotifLogros]                 = useState(true);
  const [notifInactividad, setNotifInactividad]       = useState(true);
  const [notifAltoRendimiento, setNotifAltoRendimiento] = useState(true);
  const [totalEstudiantes, setTotalEstudiantes]       = useState(0);

  // Cargar conteo real de estudiantes desde el backend
  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await axios.get(`${API_CONFIG.BASE_URL}/usuarios/estudiantes`, {
          timeout: API_CONFIG.TIMEOUT,
        });
        setTotalEstudiantes(data.length);
      } catch {
        setTotalEstudiantes(0);
      }
    };
    cargar();
  }, []);

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar sesion',
      'Estas seguro de que deseas cerrar sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesion', style: 'destructive', onPress: cerrarSesion },
      ]
    );
  };

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={styles.avatarGrande}>
          <Text style={styles.inicialAvatar}>{usuario?.nombre?.charAt(0) || 'D'}</Text>
        </View>
        <Text style={styles.nombre}>{usuario?.nombre} {usuario?.apellido}</Text>
        <Text style={styles.rol}>Docente</Text>
        <Text style={styles.correo}>{usuario?.correo || 'docente@escuela.edu'}</Text>
      </View>

      <View style={styles.estadisticas}>
        <View style={styles.stat}><Text style={styles.valorStat}>{totalEstudiantes}</Text><Text style={styles.etiquetaStat}>Estudiantes</Text></View>
        <View style={styles.separador} />
        <View style={styles.stat}><Text style={styles.valorStat}>--</Text><Text style={styles.etiquetaStat}>Promedio grupo</Text></View>
        <View style={styles.separador} />
        <View style={styles.stat}><Text style={styles.valorStat}>--</Text><Text style={styles.etiquetaStat}>Tareas asignadas</Text></View>
      </View>

      <View style={styles.seccion}>
        <View style={styles.tituloSeccionRow}>
          <MaterialCommunityIcons name="bell" size={18} color="#212121" />
          <Text style={styles.tituloSeccion}> Notificaciones</Text>
        </View>
        {[
          { label: 'Errores frecuentes', valor: notifErrores, setter: setNotifErrores },
          { label: 'Logros de estudiantes', valor: notifLogros, setter: setNotifLogros },
          { label: 'Inactividad prolongada', valor: notifInactividad, setter: setNotifInactividad },
          { label: 'Alto rendimiento', valor: notifAltoRendimiento, setter: setNotifAltoRendimiento },
        ].map((item, index) => (
          <View key={index} style={styles.filaConfig}>
            <Text style={styles.textoConfig}>{item.label}</Text>
            <Switch
              value={item.valor} onValueChange={item.setter}
              trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
              thumbColor={item.valor ? '#2E7D32' : '#BDBDBD'}
            />
          </View>
        ))}
      </View>

      <View style={styles.seccion}>
        <View style={styles.tituloSeccionRow}>
          <MaterialCommunityIcons name="account-cog" size={18} color="#212121" />
          <Text style={styles.tituloSeccion}> Cuenta</Text>
        </View>
        {[
          { icono: 'account-edit', label: 'Editar perfil', color: '#4A90D9' },
          { icono: 'lock-reset', label: 'Cambiar contrasena', color: '#FF9800' },
          { icono: 'help-circle', label: 'Ayuda y soporte', color: '#9C27B0' },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.opcionCuenta}>
            <MaterialCommunityIcons name={item.icono} size={22} color={item.color} />
            <Text style={styles.textoOpcion}>{item.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#BDBDBD" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.botonCerrarSesion} onPress={handleCerrarSesion}>
        <MaterialCommunityIcons name="logout" size={20} color="#F44336" />
        <Text style={styles.textoCerrarSesion}>  Cerrar sesion</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  encabezado: { backgroundColor: '#FFFFFF', alignItems: 'center', padding: 24, paddingTop: 50 },
  avatarGrande: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  inicialAvatar: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32' },
  nombre: { fontSize: 20, fontWeight: 'bold', color: '#1A237E' },
  rol: { fontSize: 13, color: '#2E7D32', fontWeight: '600', marginTop: 2 },
  correo: { fontSize: 13, color: '#9E9E9E', marginTop: 4 },
  estadisticas: { backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-around', padding: 16, marginTop: 8, marginBottom: 8 },
  stat: { alignItems: 'center' },
  valorStat: { fontSize: 20, fontWeight: 'bold', color: '#1A237E' },
  etiquetaStat: { fontSize: 11, color: '#757575', marginTop: 4 },
  separador: { width: 1, backgroundColor: '#E0E0E0' },
  seccion: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 16, elevation: 2 },
  tituloSeccionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  tituloSeccion: { fontSize: 15, fontWeight: 'bold', color: '#212121' },
  filaConfig: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  textoConfig: { fontSize: 14, color: '#424242' },
  opcionCuenta: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', marginBottom: 2 },
  textoOpcion: { flex: 1, fontSize: 14, color: '#424242' },
  botonCerrarSesion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFEBEE', marginHorizontal: 16, borderRadius: 12, padding: 14 },
  textoCerrarSesion: { fontSize: 15, color: '#F44336', fontWeight: '600' },
});

export default PerfilDocenteScreen;
