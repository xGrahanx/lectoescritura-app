/**
 * DashboardDocenteScreen.jsx - Panel principal del docente
 *
 * El docente monitorea el rendimiento de sus estudiantes:
 * - Estadisticas del grupo
 * - Alertas de la IA sobre errores, logros e inactividad
 * - Estudiantes de alto rendimiento (candidatos a tareas adicionales)
 * - Estudiantes que necesitan atencion
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const DATOS_GRUPO = {
  totalEstudiantes: 28,
  promedioGrupo: 74,
  estudiantesActivos: 22,
  alertasPendientes: 3,
  ejerciciosHoy: 47,
  estudiantesAltoRendimiento: [
    { id: 1, nombre: 'Ana Garcia', promedio: 95, racha: 7 },
    { id: 2, nombre: 'Carlos Lopez', promedio: 91, racha: 5 },
  ],
  estudiantesNecesitanAtencion: [
    { id: 3, nombre: 'Pedro Martinez', promedio: 42, problema: 'Dificultad en escritura' },
    { id: 4, nombre: 'Luisa Rodriguez', promedio: 38, problema: 'Baja comprension lectora' },
  ],
  alertasRecientes: [
    { id: 1, estudiante: 'Pedro Martinez', mensaje: 'Cometio 8 errores ortograficos en el ultimo dictado', tipo: 'error', hora: 'Hace 2h' },
    { id: 2, estudiante: 'Ana Garcia', mensaje: 'Obtuvo 100% en ejercicios de IA por 3 dias consecutivos', tipo: 'logro', hora: 'Hace 3h' },
    { id: 3, estudiante: 'Luisa Rodriguez', mensaje: 'No ha completado ejercicios en 5 dias', tipo: 'inactividad', hora: 'Hace 1 dia' },
  ],
};

const CONFIG_ALERTA = {
  error:      { color: '#F44336', icono: 'alert-circle',  fondo: '#FFEBEE' },
  logro:      { color: '#4CAF50', icono: 'star-circle',   fondo: '#E8F5E9' },
  inactividad:{ color: '#FF9800', icono: 'clock-alert',   fondo: '#FFF8E1' },
};

const DashboardDocenteScreen = ({ navigation }) => {
  const { usuario, cerrarSesion } = useAuth();
  const [refrescando, setRefrescando] = useState(false);

  const onRefrescar = async () => {
    setRefrescando(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefrescando(false);
  };

  return (
    <ScrollView
      style={styles.contenedor}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefrescar} />}
    >
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View>
          <Text style={styles.saludo}>Bienvenido/a,</Text>
          <Text style={styles.nombre}>{usuario?.nombre}</Text>
          <Text style={styles.subtituloHeader}>Panel de monitoreo del grupo</Text>
        </View>
        <TouchableOpacity onPress={cerrarSesion} style={styles.botonLogout}>
          <MaterialCommunityIcons name="logout" size={22} color="#757575" />
        </TouchableOpacity>
      </View>

      {/* Estadisticas del grupo */}
      <View style={styles.seccion}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="chart-bar" size={20} color="#1A237E" />
          <Text style={styles.tituloSeccion}>  Estadisticas del grupo</Text>
        </View>
        <View style={styles.gridStats}>
          {[
            { icono: 'account-group',  valor: DATOS_GRUPO.totalEstudiantes,  etiqueta: 'Estudiantes',    fondo: '#E3F2FD', color: '#1565C0' },
            { icono: 'chart-line',     valor: `${DATOS_GRUPO.promedioGrupo}%`, etiqueta: 'Promedio grupo', fondo: '#E8F5E9', color: '#2E7D32' },
            { icono: 'account-check',  valor: DATOS_GRUPO.estudiantesActivos, etiqueta: 'Activos hoy',    fondo: '#F3E5F5', color: '#6A1B9A' },
            { icono: 'pencil-outline', valor: DATOS_GRUPO.ejerciciosHoy,      etiqueta: 'Ejercicios hoy', fondo: '#FFF8E1', color: '#F57F17' },
          ].map((item, i) => (
            <View key={i} style={[styles.tarjetaStat, { backgroundColor: item.fondo }]}>
              <MaterialCommunityIcons name={item.icono} size={26} color={item.color} />
              <Text style={[styles.valorStat, { color: item.color }]}>{item.valor}</Text>
              <Text style={styles.etiquetaStat}>{item.etiqueta}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Alertas recientes */}
      <View style={styles.seccion}>
        <View style={styles.tituloRowSpaced}>
          <View style={styles.tituloRow}>
            <MaterialCommunityIcons name="bell-alert" size={20} color="#1A237E" />
            <Text style={styles.tituloSeccion}>  Alertas recientes</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Alertas')}>
            <Text style={styles.verTodas}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        {DATOS_GRUPO.alertasRecientes.map(alerta => {
          const cfg = CONFIG_ALERTA[alerta.tipo];
          return (
            <View key={alerta.id} style={[styles.tarjetaAlerta, { backgroundColor: cfg.fondo, borderLeftColor: cfg.color }]}>
              <MaterialCommunityIcons name={cfg.icono} size={22} color={cfg.color} />
              <View style={styles.infoAlerta}>
                <Text style={styles.nombreAlerta}>{alerta.estudiante}</Text>
                <Text style={styles.mensajeAlerta}>{alerta.mensaje}</Text>
                <Text style={styles.horaAlerta}>{alerta.hora}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Alto rendimiento */}
      <View style={styles.seccion}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="star-circle" size={20} color="#1A237E" />
          <Text style={styles.tituloSeccion}>  Alto rendimiento</Text>
        </View>
        <Text style={styles.subtituloSeccion}>Considera asignarles tareas adicionales</Text>
        {DATOS_GRUPO.estudiantesAltoRendimiento.map(est => (
          <TouchableOpacity
            key={est.id}
            style={styles.tarjetaEstudiante}
            onPress={() => navigation.navigate('Estudiantes', { screen: 'DetalleEstudiante', params: { estudiante: est } })}
          >
            <View style={[styles.avatar, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.inicialAvatar, { color: '#2E7D32' }]}>{est.nombre.charAt(0)}</Text>
            </View>
            <View style={styles.infoEstudiante}>
              <Text style={styles.nombreEstudiante}>{est.nombre}</Text>
              <View style={styles.rachaRow}>
                <MaterialCommunityIcons name="fire" size={14} color="#FF9800" />
                <Text style={styles.datosEstudiante}>  {est.racha} dias seguidos</Text>
              </View>
              <Text style={styles.promedioEstudiante}>{est.promedio}% promedio</Text>
            </View>
            <TouchableOpacity
              style={styles.botonAsignar}
              onPress={() => navigation.navigate('Estudiantes', { screen: 'AsignarTarea', params: { estudiante: est } })}
            >
              <Text style={styles.textoAsignar}>Asignar tarea</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Necesitan atencion */}
      <View style={styles.seccion}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#1A237E" />
          <Text style={styles.tituloSeccion}>  Necesitan atencion</Text>
        </View>
        {DATOS_GRUPO.estudiantesNecesitanAtencion.map(est => (
          <TouchableOpacity
            key={est.id}
            style={[styles.tarjetaEstudiante, styles.tarjetaAtencion]}
            onPress={() => navigation.navigate('Estudiantes', { screen: 'DetalleEstudiante', params: { estudiante: est } })}
          >
            <View style={[styles.avatar, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.inicialAvatar, { color: '#F44336' }]}>{est.nombre.charAt(0)}</Text>
            </View>
            <View style={styles.infoEstudiante}>
              <Text style={styles.nombreEstudiante}>{est.nombre}</Text>
              <Text style={[styles.datosEstudiante, { color: '#F44336' }]}>{est.problema}</Text>
              <Text style={styles.promedioAtencion}>Promedio: {est.promedio}%</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#BDBDBD" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },

  encabezado: {
    backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 8,
  },
  saludo: { fontSize: 14, color: '#757575' },
  nombre: { fontSize: 24, fontWeight: 'bold', color: '#1A237E', marginTop: 2 },
  subtituloHeader: { fontSize: 12, color: '#4A90D9', marginTop: 4 },
  botonLogout: { padding: 8, marginTop: 4 },

  seccion: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 16,
    borderRadius: 16, padding: 16, elevation: 2,
  },

  tituloRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  tituloRowSpaced: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  tituloSeccion: { fontSize: 16, fontWeight: 'bold', color: '#1A237E' },
  subtituloSeccion: { fontSize: 12, color: '#9E9E9E', marginBottom: 12, marginTop: -8 },
  verTodas: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },

  gridStats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tarjetaStat: {
    width: '48%', borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 10,
  },
  valorStat: { fontSize: 24, fontWeight: 'bold', marginTop: 6 },
  etiquetaStat: { fontSize: 12, color: '#757575', marginTop: 4, textAlign: 'center' },

  tarjetaAlerta: {
    borderRadius: 12, padding: 14, flexDirection: 'row',
    marginBottom: 10, borderLeftWidth: 4,
  },
  infoAlerta: { flex: 1, marginLeft: 12 },
  nombreAlerta: { fontSize: 13, fontWeight: 'bold', color: '#212121' },
  mensajeAlerta: { fontSize: 12, color: '#424242', lineHeight: 18, marginTop: 4 },
  horaAlerta: { fontSize: 11, color: '#9E9E9E', marginTop: 6 },

  tarjetaEstudiante: {
    backgroundColor: '#F9F9F9', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 1,
  },
  tarjetaAtencion: { borderLeftWidth: 3, borderLeftColor: '#F44336' },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  inicialAvatar: { fontSize: 18, fontWeight: 'bold' },
  infoEstudiante: { flex: 1 },
  rachaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  nombreEstudiante: { fontSize: 14, fontWeight: '600', color: '#212121' },
  datosEstudiante: { fontSize: 12, color: '#757575' },
  promedioEstudiante: { fontSize: 12, color: '#2E7D32', fontWeight: '600', marginTop: 2 },
  promedioAtencion: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  botonAsignar: {
    backgroundColor: '#2E7D32', paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 8,
  },
  textoAsignar: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
});

export default DashboardDocenteScreen;
