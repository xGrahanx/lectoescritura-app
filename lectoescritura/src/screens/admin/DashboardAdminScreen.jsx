/**
 * DashboardAdminScreen.jsx - Panel de administracion del sistema
 *
 * El administrador gestiona la plataforma:
 * - Estado del sistema (usuarios, sincronizacion, servidor)
 * - Accesos rapidos a gestion de usuarios, reportes y configuracion
 * - Actividad reciente del sistema
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const STATS_SISTEMA = {
  totalUsuarios: 155,
  totalDocentes: 8,
  totalEstudiantes: 145,
  totalAdmins: 2,
  servidorEstado: 'En linea',
  sincronizacionPendiente: 0,
  ultimaSync: 'Hace 5 min',
  versionApp: '1.0.0',
};

const ACTIVIDAD_RECIENTE = [
  { id: 1, tipo: 'registro',  mensaje: 'Nuevo estudiante registrado: Juan Perez',          hora: 'Hace 10 min' },
  { id: 2, tipo: 'tarea',     mensaje: 'Prof. Gonzalez asigno 3 tareas nuevas',             hora: 'Hace 30 min' },
  { id: 3, tipo: 'alerta',    mensaje: 'IA genero 5 alertas de rendimiento',                hora: 'Hace 1h' },
  { id: 4, tipo: 'sistema',   mensaje: 'Sincronizacion offline completada (23 registros)',  hora: 'Hace 2h' },
  { id: 5, tipo: 'registro',  mensaje: 'Docente Prof. Silva actualizo su perfil',           hora: 'Hace 3h' },
];

const CONFIG_ACTIVIDAD = {
  registro: { icono: 'account-plus',    color: '#4A90D9' },
  tarea:    { icono: 'clipboard-plus',  color: '#2E7D32' },
  alerta:   { icono: 'bell',            color: '#FF9800' },
  sistema:  { icono: 'sync',            color: '#9C27B0' },
};

const DashboardAdminScreen = ({ navigation }) => {
  const { usuario, cerrarSesion } = useAuth();

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

      {/* Estado del sistema */}
      <View style={styles.seccion}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="server" size={20} color="#1A237E" />
          <Text style={styles.tituloSeccion}>  Estado del sistema</Text>
        </View>
        <View style={styles.gridStats}>
          {[
            { icono: 'account-multiple', valor: STATS_SISTEMA.totalUsuarios,    etiqueta: 'Usuarios totales',  fondo: '#E3F2FD', color: '#1565C0' },
            { icono: 'account-tie',      valor: STATS_SISTEMA.totalDocentes,    etiqueta: 'Docentes',          fondo: '#E8F5E9', color: '#2E7D32' },
            { icono: 'school',           valor: STATS_SISTEMA.totalEstudiantes, etiqueta: 'Estudiantes',       fondo: '#F3E5F5', color: '#6A1B9A' },
            { icono: 'shield-account',   valor: STATS_SISTEMA.totalAdmins,      etiqueta: 'Administradores',   fondo: '#FFF8E1', color: '#F57F17' },
          ].map((item, i) => (
            <View key={i} style={[styles.tarjetaStat, { backgroundColor: item.fondo }]}>
              <MaterialCommunityIcons name={item.icono} size={26} color={item.color} />
              <Text style={[styles.valorStat, { color: item.color }]}>{item.valor}</Text>
              <Text style={styles.etiquetaStat}>{item.etiqueta}</Text>
            </View>
          ))}
        </View>

        {/* Info del servidor */}
        <View style={styles.infoServidor}>
          <View style={styles.filaServidor}>
            <MaterialCommunityIcons name="circle" size={12} color="#4CAF50" />
            <Text style={styles.textoServidor}>  Servidor: {STATS_SISTEMA.servidorEstado}</Text>
          </View>
          <View style={styles.filaServidor}>
            <MaterialCommunityIcons name="sync" size={14} color="#4A90D9" />
            <Text style={styles.textoServidor}>  Ultima sincronizacion: {STATS_SISTEMA.ultimaSync}</Text>
          </View>
          <View style={styles.filaServidor}>
            <MaterialCommunityIcons name="database" size={14} color="#9C27B0" />
            <Text style={styles.textoServidor}>  Registros offline pendientes: {STATS_SISTEMA.sincronizacionPendiente}</Text>
          </View>
          <View style={styles.filaServidor}>
            <MaterialCommunityIcons name="cellphone" size={14} color="#607D8B" />
            <Text style={styles.textoServidor}>  Version de la app: {STATS_SISTEMA.versionApp}</Text>
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
          { label: 'Gestionar usuarios', desc: 'Crear, editar y desactivar cuentas', icono: 'account-multiple', color: '#4A90D9', ruta: 'Usuarios' },
          { label: 'Ver reportes',       desc: 'Estadisticas y exportacion de datos', icono: 'file-chart',       color: '#2E7D32', ruta: 'Reportes' },
          { label: 'Configuracion',      desc: 'Parametros de IA y sincronizacion',   icono: 'cog',              color: '#9C27B0', ruta: 'Configuracion' },
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
