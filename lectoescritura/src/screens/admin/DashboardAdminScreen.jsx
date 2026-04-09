/**
 * DashboardAdminScreen.jsx - Panel de administracion del sistema
 *
 * Carga estadisticas reales desde el backend (conteo de usuarios por rol).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../utils/constantes';

const ACTIVIDAD_RECIENTE = [
  { id: 1, tipo: 'registro',  mensaje: 'Nuevo estudiante registrado: Juan Perez',          hora: 'Hace 10 min' },
  { id: 2, tipo: 'tarea',     mensaje: 'Prof. Gonzalez asigno 3 tareas nuevas',             hora: 'Hace 30 min' },
  { id: 3, tipo: 'alerta',    mensaje: 'IA genero 5 alertas de rendimiento',                hora: 'Hace 1h' },
  { id: 4, tipo: 'sistema',   mensaje: 'Sincronizacion offline completada (23 registros)',  hora: 'Hace 2h' },
];

const CONFIG_ACTIVIDAD = {
  registro: { icono: 'account-plus',   color: '#4A90D9' },
  tarea:    { icono: 'clipboard-plus', color: '#2E7D32' },
  alerta:   { icono: 'bell',           color: '#FF9800' },
  sistema:  { icono: 'sync',           color: '#9C27B0' },
};

const DashboardAdminScreen = ({ navigation }) => {
  const { usuario, cerrarSesion } = useAuth();
  const [stats, setStats]           = useState(null);
  const [cargando, setCargando]     = useState(true);
  const [servidorOnline, setServidorOnline] = useState(false);

  // Cargar estadisticas reales desde el backend
  const cargarStats = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_CONFIG.BASE_URL}/usuarios/stats`, {
        timeout: API_CONFIG.TIMEOUT,
      });
      setStats(data);
      setServidorOnline(true);
    } catch (error) {
      // Si falla la conexion, mostrar ceros y marcar servidor offline
      setStats({ totalUsuarios: 0, totalDocentes: 0, totalEstudiantes: 0, totalAdmins: 0 });
      setServidorOnline(false);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarStats();
    const unsubscribe = navigation.addListener('focus', cargarStats);
    return unsubscribe;
  }, [navigation, cargarStats]);

  return (
    <ScrollView style={styles.contenedor}>
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View>
          <Text style={styles.saludo}>Panel de Administracion</Text>
          <Text style={styles.nombre}>{usuario?.nombre}</Text>
          <Text style={styles.subtituloHeader}>Gestion del sistema</Text>
        </View>
        <TouchableOpacity onPress={cerrarSesion} style={styles.botonLogout}>
          <MaterialCommunityIcons name="logout" size={22} color="#757575" />
        </TouchableOpacity>
      </View>

      {/* Estado del sistema con datos reales */}
      <View style={styles.seccion}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="server" size={20} color="#1A237E" />
          <Text style={styles.tituloSeccion}>  Estado del sistema</Text>
        </View>

        {cargando ? (
          <ActivityIndicator color="#6A1B9A" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.gridStats}>
            {[
              { icono: 'account-multiple', valor: stats?.totalUsuarios,    etiqueta: 'Usuarios totales',  fondo: '#E3F2FD', color: '#1565C0' },
              { icono: 'account-tie',      valor: stats?.totalDocentes,    etiqueta: 'Docentes',          fondo: '#E8F5E9', color: '#2E7D32' },
              { icono: 'school',           valor: stats?.totalEstudiantes, etiqueta: 'Estudiantes',       fondo: '#F3E5F5', color: '#6A1B9A' },
              { icono: 'shield-account',   valor: stats?.totalAdmins,      etiqueta: 'Administradores',   fondo: '#FFF8E1', color: '#F57F17' },
            ].map((item, i) => (
              <View key={i} style={[styles.tarjetaStat, { backgroundColor: item.fondo }]}>
                <MaterialCommunityIcons name={item.icono} size={26} color={item.color} />
                <Text style={[styles.valorStat, { color: item.color }]}>{item.valor ?? 0}</Text>
                <Text style={styles.etiquetaStat}>{item.etiqueta}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Info del servidor */}
        <View style={styles.infoServidor}>
          <View style={styles.filaServidor}>
            <MaterialCommunityIcons name="circle" size={12} color={servidorOnline ? '#4CAF50' : '#F44336'} />
            <Text style={styles.textoServidor}>  Servidor: {servidorOnline ? 'En linea' : 'Desconectado'}</Text>
          </View>
          <View style={styles.filaServidor}>
            <MaterialCommunityIcons name="database" size={14} color="#9C27B0" />
            <Text style={styles.textoServidor}>  Base de datos: PostgreSQL conectada</Text>
          </View>
          <View style={styles.filaServidor}>
            <MaterialCommunityIcons name="cellphone" size={14} color="#607D8B" />
            <Text style={styles.textoServidor}>  Version de la app: 1.0.0</Text>
          </View>
        </View>
      </View>

      {/* Accesos rapidos */}
      <View style={styles.seccion}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color="#1A237E" />
          <Text style={styles.tituloSeccion}>  Accesos rapidos</Text>
        </View>
        {[
          { label: 'Gestionar usuarios', desc: 'Crear, editar y eliminar cuentas', icono: 'account-multiple', color: '#4A90D9', ruta: 'Usuarios' },
          { label: 'Ver reportes',       desc: 'Estadisticas y exportacion',       icono: 'file-chart',       color: '#2E7D32', ruta: 'Reportes' },
          { label: 'Configuracion',      desc: 'Parametros de IA y sistema',       icono: 'cog',              color: '#9C27B0', ruta: 'Configuracion' },
        ].map((acceso, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tarjetaAcceso, { borderLeftColor: acceso.color }]}
            onPress={() => navigation.navigate(acceso.ruta)}
          >
            <View style={[styles.iconoAcceso, { backgroundColor: acceso.color + '15' }]}>
              <MaterialCommunityIcons name={acceso.icono} size={26} color={acceso.color} />
            </View>
            <View style={styles.infoAcceso}>
              <Text style={styles.labelAcceso}>{acceso.label}</Text>
              <Text style={styles.descAcceso}>{acceso.desc}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#BDBDBD" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Actividad reciente */}
      <View style={styles.seccion}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="history" size={20} color="#1A237E" />
          <Text style={styles.tituloSeccion}>  Actividad reciente</Text>
        </View>
        {ACTIVIDAD_RECIENTE.map(item => {
          const cfg = CONFIG_ACTIVIDAD[item.tipo];
          return (
            <View key={item.id} style={styles.tarjetaActividad}>
              <View style={[styles.iconoActividad, { backgroundColor: cfg.color + '15' }]}>
                <MaterialCommunityIcons name={cfg.icono} size={18} color={cfg.color} />
              </View>
              <View style={styles.infoActividad}>
                <Text style={styles.mensajeActividad}>{item.mensaje}</Text>
                <Text style={styles.horaActividad}>{item.hora}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },

  encabezado: {
    backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 8,
  },
  saludo: { fontSize: 13, color: '#757575' },
  nombre: { fontSize: 24, fontWeight: 'bold', color: '#1A237E', marginTop: 2 },
  subtituloHeader: { fontSize: 12, color: '#9C27B0', marginTop: 4 },
  botonLogout: { padding: 8, marginTop: 4 },

  seccion: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 16,
    borderRadius: 16, padding: 16, elevation: 2,
  },

  tituloRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  tituloSeccion: { fontSize: 16, fontWeight: 'bold', color: '#1A237E' },

  gridStats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  tarjetaStat: {
    width: '48%', borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 10,
  },
  valorStat: { fontSize: 24, fontWeight: 'bold', marginTop: 6 },
  etiquetaStat: { fontSize: 12, color: '#757575', marginTop: 4, textAlign: 'center' },

  infoServidor: {
    backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12,
  },
  filaServidor: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  textoServidor: { fontSize: 13, color: '#424242' },

  tarjetaAcceso: {
    backgroundColor: '#F9F9F9', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
    borderLeftWidth: 4, elevation: 1,
  },
  iconoAcceso: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  infoAcceso: { flex: 1 },
  labelAcceso: { fontSize: 14, fontWeight: '600', color: '#212121' },
  descAcceso: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },

  tarjetaActividad: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  iconoActividad: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoActividad: { flex: 1 },
  mensajeActividad: { fontSize: 13, color: '#212121', lineHeight: 18 },
  horaActividad: { fontSize: 11, color: '#9E9E9E', marginTop: 4 },
});

export default DashboardAdminScreen;
