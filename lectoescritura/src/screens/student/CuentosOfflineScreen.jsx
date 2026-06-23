/**
 * CuentosOfflineScreen.jsx - Pantalla para estudiantes para ver cuentos offline
 * 
 * Los estudiantes pueden leer cuentos guardados por el profesor
 * Funciona completamente sin conexión a internet
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, FlatList,
  Modal, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIBLIOTECA_KEY = '@lectoescritura:biblioteca_offline';

const CuentosOfflineScreen = ({ navigation }) => {
  const [cuentos, setCuentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cuentoSeleccionado, setCuentoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtroGrado, setFiltroGrado] = useState('Todos');

  // Cargar cuentos al iniciar
  useEffect(() => {
    cargarCuentos();
  }, []);

  const cargarCuentos = async () => {
    try {
      setCargando(true);
      const cuentosJson = await AsyncStorage.getItem(BIBLIOTECA_KEY);
      const cuentosCargados = cuentosJson ? JSON.parse(cuentosJson) : [];
      setCuentos(cuentosCargados);
    } catch (error) {
      console.error('Error cargando cuentos offline:', error);
    } finally {
      setCargando(false);
    }
  };

  const abrirCuento = (cuento) => {
    setCuentoSeleccionado(cuento);
    setModalVisible(true);
  };

  // Filtrar cuentos por grado
  const cuentosFiltrados = filtroGrado === 'Todos' 
    ? cuentos 
    : cuentos.filter(cuento => cuento.grado === filtroGrado);

  // Grados disponibles
  const grados = ['Todos', '1ro', '2do', '3ro', '4to', '5to', '6to', 'General'];

  if (cargando) {
    return (
      <View style={styles.cargandoContainer}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.cargandoTexto}>Cargando cuentos...</Text>
      </View>
    );
  }

  if (cuentos.length === 0) {
    return (
      <View style={styles.contenedor}>
        <TouchableOpacity style={styles.botonRegresar} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
        </TouchableOpacity>

        <View style={styles.vacioContainer}>
          <MaterialCommunityIcons name="book-open" size={80} color="#E0E0E0" />
          <Text style={styles.vacioTitulo}>No hay cuentos disponibles</Text>
          <Text style={styles.vacioTexto}>
            Tu profesor aún no ha agregado cuentos a la biblioteca offline.
            {"\n"}Pídele que agregue algunos cuentos para que puedas leerlos sin internet.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      {/* Botón de regresar */}
      <TouchableOpacity style={styles.botonRegresar} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
      </TouchableOpacity>

      {/* Encabezado */}
      <View style={styles.encabezado}>
        <MaterialCommunityIcons name="book-off" size={50} color="#4A90D9" />
        <Text style={styles.titulo}>Cuentos Offline</Text>
        <Text style={styles.subtitulo}>
          Puedes leer estos cuentos sin conexión a internet
        </Text>
        
        <View style={styles.contador}>
          <MaterialCommunityIcons name="book-open-variant" size={16} color="#4CAF50" />
          <Text style={styles.contadorTexto}>
            {cuentosFiltrados.length} cuentos disponibles
          </Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <Text style={styles.filtrosTitulo}>Filtrar por grado:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosScroll}>
          {grados.map((gradoItem) => (
            <TouchableOpacity
              key={gradoItem}
              style={[
                styles.filtroBoton,
                filtroGrado === gradoItem && styles.filtroBotonActivo,
              ]}
              onPress={() => setFiltroGrado(gradoItem)}
            >
              <Text style={[
                styles.filtroTexto,
                filtroGrado === gradoItem && styles.filtroTextoActivo,
              ]}>
                {gradoItem}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de cuentos */}
      <FlatList
        data={cuentosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaContenedor}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cuentoCard}
            onPress={() => abrirCuento(item)}
          >
            <View style={styles.cuentoHeader}>
              <MaterialCommunityIcons 
                name="book-open-page-variant" 
                size={22} 
                color="#4A90D9" 
              />
              <View style={styles.cuentoInfo}>
                <Text style={styles.cuentoTitulo} numberOfLines={1}>
                  {item.titulo}
                </Text>
                <View style={styles.cuentoMeta}>
                  <View style={styles.cuentoMetaItem}>
                    <MaterialCommunityIcons name="account" size={12} color="#757575" />
                    <Text style={styles.cuentoMetaTexto}>{item.autor}</Text>
                  </View>
                  <View style={styles.cuentoMetaItem}>
                    <MaterialCommunityIcons name="school" size={12} color="#757575" />
                    <Text style={styles.cuentoMetaTexto}>{item.grado}</Text>
                  </View>
                  <View style={styles.cuentoMetaItem}>
                    <MaterialCommunityIcons name="chart-bar" size={12} color="#757575" />
                    <Text style={styles.cuentoMetaTexto}>{item.palabras} palabras</Text>
                  </View>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#BDBDBD" />
            </View>
            
            <Text style={styles.cuentoResumen} numberOfLines={2}>
              {item.contenido.substring(0, 100)}...
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal para leer cuento completo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContenedor}>
          <View style={styles.modalContenido}>
            {cuentoSeleccionado && (
              <>
                {/* Encabezado modal */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalTituloContainer}>
                    <Text style={styles.modalTitulo} numberOfLines={2}>
                      {cuentoSeleccionado.titulo}
                    </Text>
                    <Text style={styles.modalSubtitulo}>
                      {cuentoSeleccionado.autor} • {cuentoSeleccionado.grado} • {cuentoSeleccionado.nivel}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <MaterialCommunityIcons name="close" size={24} color="#212121" />
                  </TouchableOpacity>
                </View>

                {/* Contenido del cuento */}
                <ScrollView style={styles.modalCuerpo}>
                  <Text style={styles.cuentoCompleto}>
                    {cuentoSeleccionado.contenido}
                  </Text>
                  
                  <View style={styles.cuentoStats}>
                    <View style={styles.stat}>
                      <MaterialCommunityIcons name="format-text" size={16} color="#757575" />
                      <Text style={styles.statTexto}>{cuentoSeleccionado.palabras} palabras</Text>
                    </View>
                    <View style={styles.stat}>
                      <MaterialCommunityIcons name="counter" size={16} color="#757575" />
                      <Text style={styles.statTexto}>{cuentoSeleccionado.caracteres} caracteres</Text>
                    </View>
                    <View style={styles.stat}>
                      <MaterialCommunityIcons name="book-open" size={16} color="#757575" />
                      <Text style={styles.statTexto}>{cuentoSeleccionado.categoria}</Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Pie del modal */}
                <View style={styles.modalPie}>
                  <Text style={styles.modalPieTexto}>
                    📚 Este cuento está disponible sin conexión a internet
                  </Text>
                  <TouchableOpacity
                    style={styles.modalBotonCerrar}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalBotonCerrarTexto}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  
  cargandoContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  cargandoTexto: { 
    marginTop: 12, 
    color: '#757575', 
    fontSize: 14 
  },
  
  botonRegresar: { padding: 16, marginTop: 10 },

  encabezado: { 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingBottom: 20 
  },
  titulo: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1A237E', 
    marginTop: 12,
    marginBottom: 6,
  },
  subtitulo: { 
    fontSize: 14, 
    color: '#757575', 
    textAlign: 'center',
    marginBottom: 12,
  },
  contador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  contadorTexto: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
    marginLeft: 6,
  },

  filtrosContainer: { 
    paddingHorizontal: 16, 
    marginBottom: 16 
  },
  filtrosTitulo: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#424242', 
    marginBottom: 8 
  },
  filtrosScroll: { 
    marginBottom: 8 
  },
  filtroBoton: { 
    backgroundColor: '#F5F5F5', 
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filtroBotonActivo: { 
    backgroundColor: '#4A90D9' 
  },
  filtroTexto: { 
    fontSize: 13, 
    color: '#757575' 
  },
  filtroTextoActivo: { 
    color: '#FFFFFF', 
    fontWeight: '600' 
  },

  vacioContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40 
  },
  vacioTitulo: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#616161', 
    marginTop: 20,
    marginBottom: 12,
  },
  vacioTexto: { 
    fontSize: 15, 
    color: '#9E9E9E', 
    textAlign: 'center', 
    lineHeight: 22 
  },

  listaContenedor: { 
    paddingHorizontal: 16, 
    paddingBottom: 30 
  },
  cuentoCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    elevation: 2,
  },
  cuentoHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  cuentoInfo: { 
    flex: 1, 
    marginLeft: 12 
  },
  cuentoTitulo: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#212121', 
    marginBottom: 4 
  },
  cuentoMeta: { 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  cuentoMetaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 12 
  },
  cuentoMetaTexto: { 
    fontSize: 11, 
    color: '#757575', 
    marginLeft: 4 
  },
  cuentoResumen: { 
    fontSize: 14, 
    color: '#616161', 
    lineHeight: 20 
  },

  // Modal styles
  modalContenedor: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  modalContenido: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    marginTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  modalTituloContainer: { 
    flex: 1, 
    marginRight: 12 
  },
  modalTitulo: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1A237E', 
    marginBottom: 4 
  },
  modalSubtitulo: { 
    fontSize: 13, 
    color: '#757575' 
  },
  
  modalCuerpo: { 
    flex: 1, 
    padding: 20 
  },
  cuentoCompleto: { 
    fontSize: 16, 
    lineHeight: 26, 
    color: '#424242',
    textAlign: 'justify',
  },
  cuentoStats: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginTop: 30, 
    paddingTop: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#F0F0F0' 
  },
  stat: { 
    alignItems: 'center' 
  },
  statTexto: { 
    fontSize: 12, 
    color: '#757575', 
    marginTop: 6 
  },
  
  modalPie: { 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#F0F0F0' 
  },
  modalPieTexto: { 
    fontSize: 13, 
    color: '#9E9E9E', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  modalBotonCerrar: { 
    backgroundColor: '#4A90D9', 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  modalBotonCerrarTexto: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '600' 
  },
});

export default CuentosOfflineScreen;