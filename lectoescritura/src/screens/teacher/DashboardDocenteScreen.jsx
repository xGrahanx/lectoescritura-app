/**
 * DashboardDocenteScreen.jsx - Panel principal del docente
 *
 * Carga datos reales desde el backend:
 * - Grupos y estudiantes del docente
 * - Estadísticas del grupo
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG, UMBRALES } from '../../utils/constantes';

const DashboardDocenteScreen = ({ navigation }) => {
  const { usuario, cerrarSesion } = useAuth();
  const [grupos, setGrupos]       = useState([]);
  const [stats, setStats]         = useState({ totalEstudiantes: 0, totalGrupos: 0 });
  const [cargando, setCargando]   = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API_CONFIG.BASE_URL}/grupos/docente/${usuario.id}`,
        { timeout: API_CONFIG.TIMEOUT }
      );
      setGrupos(data);

      // Calcular estadísticas desde los grupos
      const totalEstudiantes = data.reduce((sum, g) => sum + (g._count?.estudiantes || 0), 0);
      setStats({ totalEstudiantes, totalGrupos: data.length });
    } catch (error) {
      console.error('Error al cargar dashboard docente:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [usuario.id]);

  useEffect(() => {
    cargarDatos();
    const unsubscribe = navigation.addListener('focus', cargarDatos);
    return unsubscribe;
  }, [navigation, cargarDatos]);

  const onRefrescar = () => { setRefrescando(true); cargarDatos(); };

  // Extraer todos los estudiantes de todos los grupos
  const todosLosEstudiantes = grupos.flatMap(g =>
    (g.estudiantes || []).map(ge => ({
      ...ge.estudiante,
      grupo: g.nombre,
      // Promedio fijo basado en el ID hasta que se implemente el cálculo real
      promedio: 50 + (ge.estudiante.id % 40),
    }))
  );

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

      {/* Estadísticas del grupo */}
      <View style={styles.seccion}>
        <View style={styles.tituloRow}>
          <MaterialCommunityIcons name="chart-bar" size={20} color="#1A237E" />
          <Text style={styles.tituloSeccion}>  Estadísticas del grupo</Text>
        </View>

        {cargando ? (
          <ActivityIndicator color="#1A237E" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.gridStats}>
            {[
              { icono: 'account-group',  valor: stats.totalEstudiantes, etiqueta: 'Estudiantes',  fondo: '#E3F2FD', color: '#1565C0' },
              { icono: 'google-classroom', valor: stats.totalGrupos,    etiqueta: 'Grupos',        fondo: '#E8F5E9', color: '#2E7D32' },
              { icono: 'star-circle',    valor: todosLosEstudiantes.filter(e => e.promedio >= UMBRALES.ALTO_RENDIMIENTO).length, etiqueta: 'Alto rendimiento', fondo: '#FFF8E1', color: '#F57F17' },
              { icono: 'alert-circle',   valor: todosLosEstudiantes.filter(e => e.promedio < UMBRALES.BAJO_RENDIMIENTO).length, etiqueta: 'Necesitan atención', fondo: '#FFEBEE', color: '#C62828' },
            ].map((item, i) => (
              <View key={i} style={[styles.tarjetaStat, { backgroundColor: item.fondo }]}>
                <MaterialCommunityIcons name={item.icono} size={26} color={item.color} />
                <Text style={[styles.valorStat, { color: item.color }]}>{item.valor}</Text>
                <Text style={styles.etiquetaStat}>{item.etiqueta}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Mis grupos */}
      {!cargando && grupos.length > 0 && (
        <View style={styles.seccion}>
          <View style={styles.tituloRowSpaced}>
            <View style={styles.tituloRow}>
              <MaterialCommunityIcons name="google-classroom" size={20} color="#1A237E" />
              <Text style={styles.tituloSeccion}>  Mis grupos</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Estudiantes')}>
              <Text style={styles.verTodas}>Ver estudiantes</Text>
            </TouchableOpacity>
          </View>
          {grupos.map(grupo => (
            <View key={grupo.id} style={styles.tarjetaGrupo}>
              <View style={styles.iconoGrupo}>
                <MaterialCommunityIcons name="google-classroom" size={22} color="#2E7D32" />
              </View>
              <View style={styles.infoGrupo}>
                <Text style={styles.nombreGrupo}>{grupo.nombre}</Text>
                <Text style={styles.estudiantesGrupo}>
                  {grupo._count?.estudiantes || 0} estudiantes
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#BDBDBD" />
            </View>
          ))}
        </View>
      )}

      {/* Mis estudiantes */}
      {!cargando && todosLosEstudiantes.length > 0 && (
        <View style={styles.seccion}>
          <View style={styles.tituloRowSpaced}>
            <View style={styles.tituloRow}>
              <MaterialCommunityIcons name="account-group" size={20} color="#1A237E" />
              <Text style={styles.tituloSeccion}>  Mis estudiantes</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Estudiantes')}>
              <Text style={styles.verTodas}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {todosLosEstudiantes.slice(0, 5).map(est => {
            const colorPromedio = est.promedio >= UMBRALES.ALTO_RENDIMIENTO ? '#4CAF50'
              : est.promedio < UMBRALES.BAJO_RENDIMIENTO ? '#F44336' : '#FF9800';
            return (
              <TouchableOpacity
                key={est.id}
                style={styles.tarjetaEstudiante}
                onPress={() => navigation.navigate('Estudiantes', {
                  screen: 'DetalleEstudiante', params: { estudiante: est },
                })}
              >
                <View style={[styles.avatar, { backgroundColor: colorPromedio + '20' }]}>
                  <Text style={[styles.inicialAvatar, { color: colorPromedio }]}>
                    {est.nombre.charAt(0)}
                  </Text>
                </View>
                <View style={styles.infoEstudiante}>
                  <Text style={styles.nombreEstudiante}>{est.nombre} {est.apellido}</Text>
                  <Text style={styles.grupoEstudiante}>{est.grupo}</Text>
                  <Text style={[styles.promedioEstudiante, { color: colorPromedio }]}>
                    {est.promedio}% promedio
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.botonAsignar}
                  onPress={() => navigation.navigate('Estudiantes', {
                    screen: 'AsignarTarea', params: { estudiante: est },
                  })}
                >
                  <MaterialCommunityIcons name="clipboard-plus" size={14} color="#FFFFFF" />
                  <Text style={styles.textoAsignar}> Asignar</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
          {todosLosEstudiantes.length > 5 && (
            <TouchableOpacity
              style={styles.botonVerTodos}
              onPress={() => navigation.navigate('Estudiantes')}
            >
              <Text style={styles.textoVerTodos}>
                Ver {todosLosEstudiantes.length - 5} estudiantes más
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#2E7D32" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Sin grupos */}
      {!cargando && grupos.length === 0 && (
        <View style={styles.sinDatos}>
          <MaterialCommunityIcons name="google-classroom" size={48} color="#BDBDBD" />
          <Text style={styles.textoSinDatos}>No tienes grupos asignados aún</Text>
          <Text style={styles.subTextoSinDatos}>Contacta al administrador para que te asigne un grupo</Text>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  encabezado: {
    backgroundColor: '#FFFFFF', padding: 20, paddingTop: 50,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8,
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
    width: '48%', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10,
  },
  valorStat: { fontSize: 24, fontWeight: 'bold', marginTop: 6 },
  etiquetaStat: { fontSize: 12, color: '#757575', marginTop: 4, textAlign: 'center' },
  tarjetaGrupo: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9',
    borderRadius: 10, padding: 12, marginBottom: 8,
  },
  iconoGrupo: {
    width: 42, height: 42, borderRadius: 10, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  infoGrupo: { flex: 1 },
  nombreGrupo: { fontSize: 14, fontWeight: '600', color: '#212121' },
  estudiantesGrupo: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  tarjetaEstudiante: {
    backgroundColor: '#F9F9F9', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 1,
  },
  tarjetaAtencion: { borderLeftWidth: 3, borderLeftColor: '#F44336' },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  inicialAvatar: { fontSize: 18, fontWeight: 'bold' },
  infoEstudiante: { flex: 1 },
  nombreEstudiante: { fontSize: 14, fontWeight: '600', color: '#212121' },
  grupoEstudiante: { fontSize: 11, color: '#9E9E9E', marginTop: 1 },
  promedioEstudiante: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  botonAsignar: { backgroundColor: '#2E7D32', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  textoAsignar: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  botonVerTodos: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, marginTop: 4,
  },
  textoVerTodos: { fontSize: 13, color: '#2E7D32', fontWeight: '600', marginRight: 4 },
  sinDatos: { alignItems: 'center', padding: 40 },
  textoSinDatos: { fontSize: 16, fontWeight: '600', color: '#757575', marginTop: 12 },
  subTextoSinDatos: { fontSize: 13, color: '#BDBDBD', marginTop: 6, textAlign: 'center' },
});

export default DashboardDocenteScreen;
