/**
 * BibliotecaOfflineScreen.jsx - Pantalla para gestionar cuentos offline
 * 
 * Permite al profesor:
 * 1. Ver cuentos guardados offline
 * 2. Agregar nuevos cuentos
 * 3. Eliminar cuentos existentes
 * 4. Filtrar por grado/nivel
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, FlatList,
  Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIBLIOTECA_KEY = '@lectoescritura:biblioteca_offline';

const BibliotecaOfflineScreen = ({ navigation }) => {
  const [cuentos, setCuentos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtroGrado, setFiltroGrado] = useState('Todos');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  
  // Formulario para nuevo cuento
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [grado, setGrado] = useState('1ro');
  const [categoria, setCategoria] = useState('Cuento');
  const [nivel, setNivel] = useState('Básico');
  const [autor, setAutor] = useState('');

  // Cargar cuentos al iniciar
  useEffect(() => {
    cargarCuentos();
  }, []);

  const cargarCuentos = async () => {
    try {
      const cuentosJson = await AsyncStorage.getItem(BIBLIOTECA_KEY);
      const cuentosCargados = cuentosJson ? JSON.parse(cuentosJson) : [];
      setCuentos(cuentosCargados);
    } catch (error) {
      console.error('Error cargando cuentos:', error);
      Alert.alert('Error', 'No se pudieron cargar los cuentos');
    }
  };

  const guardarCuento = async () => {
    // Validaciones
    if (!titulo.trim() || !contenido.trim()) {
      Alert.alert('Campos requeridos', 'Título y contenido son obligatorios');
      return;
    }

    if (contenido.length < 50) {
      Alert.alert('Contenido muy corto', 'El cuento debe tener al menos 50 caracteres');
      return;
    }

    try {
      const nuevoCuento = {
        id: `cuento_${Date.now()}`,
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        grado,
        categoria,
        nivel,
        autor: autor.trim() || 'Anónimo',
        fecha_agregado: new Date().toISOString(),
        caracteres: contenido.length,
        palabras: contenido.split(/\s+/).length,
      };

      const nuevaBiblioteca = [...cuentos, nuevoCuento];
      await AsyncStorage.setItem(BIBLIOTECA_KEY, JSON.stringify(nuevaBiblioteca));
      
      setCuentos(nuevaBiblioteca);
      
      // Limpiar formulario
      setTitulo('');
      setContenido('');
      setGrado('1ro');
      setCategoria('Cuento');
      setNivel('Básico');
      setAutor('');
      
      setModalVisible(false);
      
      Alert.alert(
        '✅ Cuento guardado',
        `"${nuevoCuento.titulo}" se agregó a la biblioteca offline.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error guardando cuento:', error);
      Alert.alert('Error', 'No se pudo guardar el cuento');
    }
  };

  const eliminarCuento = async (cuentoId) => {
    Alert.alert(
      'Eliminar cuento',
      '¿Estás seguro de eliminar este cuento de la biblioteca offline?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const nuevaBiblioteca = cuentos.filter(c => c.id !== cuentoId);
              await AsyncStorage.setItem(BIBLIOTECA_KEY, JSON.stringify(nuevaBiblioteca));
              setCuentos(nuevaBiblioteca);
              Alert.alert('✅ Cuento eliminado', 'El cuento fue removido de la biblioteca offline');
            } catch (error) {
              console.error('Error eliminando cuento:', error);
              Alert.alert('Error', 'No se pudo eliminar el cuento');
            }
          },
        },
      ]
    );
  };

  const verDetalleCuento = (cuento) => {
    Alert.alert(
      cuento.titulo,
      `📚 ${cuento.contenido.substring(0, 300)}${cuento.contenido.length > 300 ? '...' : ''}\n\n` +
      `👨‍🏫 Autor: ${cuento.autor}\n` +
      `🎓 Grado: ${cuento.grado}\n` +
      `📖 Categoría: ${cuento.categoria}\n` +
      `⭐ Nivel: ${cuento.nivel}\n` +
      `📊 ${cuento.palabras} palabras • ${cuento.caracteres} caracteres\n` +
      `📅 Agregado: ${new Date(cuento.fecha_agregado).toLocaleDateString('es-ES')}`,
      [
        { text: 'Cerrar' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarCuento(cuento.id),
        },
      ]
    );
  };

  // Filtrar cuentos
  const cuentosFiltrados = cuentos.filter(cuento => {
    if (filtroGrado !== 'Todos' && cuento.grado !== filtroGrado) return false;
    if (filtroNivel !== 'Todos' && cuento.nivel !== filtroNivel) return false;
    return true;
  });

  // Opciones de filtro
  const grados = ['Todos', '1ro', '2do', '3ro', '4to', '5to', '6to', 'General'];
  const niveles = ['Todos', 'Básico', 'Intermedio', 'Avanzado'];
  const categorias = ['Cuento', 'Poema', 'Ejercicio', 'Lectura', 'Texto informativo'];

  // Estadísticas
  const estadisticas = {
    total: cuentos.length,
    caracteres: cuentos.reduce((sum, c) => sum + c.caracteres, 0),
    palabras: cuentos.reduce((sum, c) => sum + c.palabras, 0),
    porGrado: {},
  };

  cuentos.forEach(cuento => {
    estadisticas.porGrado[cuento.grado] = (estadisticas.porGrado[cuento.grado] || 0) + 1;
  });

  return (
    <View style={styles.contenedor}>
      {/* Botón de regresar */}
      <TouchableOpacity style={styles.botonRegresar} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
      </TouchableOpacity>

      {/* Encabezado */}
      <View style={styles.encabezado}>
        <MaterialCommunityIcons name="book-open-variant" size={50} color="#4A90D9" />
        <Text style={styles.titulo}>Biblioteca Offline</Text>
        <Text style={styles.subtitulo}>
          Cuentos y materiales disponibles sin conexión
        </Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.estadisticasContainer}>
        <View style={styles.estadistica}>
          <Text style={styles.estadisticaNumero}>{cuentos.length}</Text>
          <Text style={styles.estadisticaTexto}>Cuentos</Text>
        </View>
        <View style={styles.separador} />
        <View style={styles.estadistica}>
          <Text style={styles.estadisticaNumero}>{estadisticas.palabras.toLocaleString()}</Text>
          <Text style={styles.estadisticaTexto}>Palabras</Text>
        </View>
        <View style={styles.separador} />
        <View style={styles.estadistica}>
          <Text style={styles.estadisticaNumero}>
            {Math.round(estadisticas.caracteres / 1000)}K
          </Text>
          <Text style={styles.estadisticaTexto}>Caracteres</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <Text style={styles.filtrosTitulo}>Filtrar por:</Text>
        
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosScroll}>
          {niveles.map((nivelItem) => (
            <TouchableOpacity
              key={nivelItem}
              style={[
                styles.filtroBoton,
                filtroNivel === nivelItem && styles.filtroBotonActivo,
              ]}
              onPress={() => setFiltroNivel(nivelItem)}
            >
              <Text style={[
                styles.filtroTexto,
                filtroNivel === nivelItem && styles.filtroTextoActivo,
              ]}>
                {nivelItem}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Botón para agregar nuevo cuento */}
      <TouchableOpacity
        style={styles.botonAgregar}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus-circle" size={22} color="#FFFFFF" />
        <Text style={styles.botonAgregarTexto}>Agregar nuevo cuento</Text>
      </TouchableOpacity>

      {/* Lista de cuentos */}
      {cuentosFiltrados.length === 0 ? (
        <View style={styles.vacioContainer}>
          <MaterialCommunityIcons name="book-open" size={60} color="#E0E0E0" />
          <Text style={styles.vacioTexto}>
            {cuentos.length === 0 
              ? 'No hay cuentos en la biblioteca offline.\nPresiona "Agregar nuevo cuento" para comenzar.'
              : 'No hay cuentos que coincidan con los filtros.'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={cuentosFiltrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listaContenedor}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cuentoCard}
              onPress={() => verDetalleCuento(item)}
              onLongPress={() => eliminarCuento(item.id)}
            >
              <View style={styles.cuentoHeader}>
                <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#4A90D9" />
                <Text style={styles.cuentoTitulo} numberOfLines={1}>
                  {item.titulo}
                </Text>
                <MaterialCommunityIcons name="dots-vertical" size={20} color="#BDBDBD" />
              </View>
              
              <Text style={styles.cuentoContenido} numberOfLines={2}>
                {item.contenido}
              </Text>
              
              <View style={styles.cuentoFooter}>
                <View style={styles.cuentoInfo}>
                  <MaterialCommunityIcons name="account" size={14} color="#757575" />
                  <Text style={styles.cuentoInfoTexto}>{item.autor}</Text>
                </View>
                
                <View style={styles.cuentoInfo}>
                  <MaterialCommunityIcons name="school" size={14} color="#757575" />
                  <Text style={styles.cuentoInfoTexto}>{item.grado}</Text>
                </View>
                
                <View style={styles.cuentoInfo}>
                  <MaterialCommunityIcons name="chart-bar" size={14} color="#757575" />
                  <Text style={styles.cuentoInfoTexto}>{item.palabras} palabras</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal para agregar nuevo cuento */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContenedor}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContenido}>
            {/* Encabezado modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Agregar cuento offline</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#212121" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalFormulario}>
              {/* Título */}
              <Text style={styles.etiqueta}>Título del cuento *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: La liebre y la tortuga"
                value={titulo}
                onChangeText={setTitulo}
                maxLength={100}
              />

              {/* Contenido */}
              <Text style={styles.etiqueta}>Contenido *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Escribe aquí el cuento completo..."
                value={contenido}
                onChangeText={setContenido}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text style={styles.contadorCaracteres}>
                {contenido.length} caracteres • {contenido.split(/\s+/).length} palabras
              </Text>

              {/* Autor */}
              <Text style={styles.etiqueta}>Autor (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Autor anónimo"
                value={autor}
                onChangeText={setAutor}
                maxLength={50}
              />

              {/* Selectores */}
              <View style={styles.selectoresContainer}>
                <View style={styles.selector}>
                  <Text style={styles.etiqueta}>Grado</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['1ro', '2do', '3ro', '4to', '5to', '6to', 'General'].map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[
                          styles.selectorBoton,
                          grado === g && styles.selectorBotonActivo,
                        ]}
                        onPress={() => setGrado(g)}
                      >
                        <Text style={[
                          styles.selectorTexto,
                          grado === g && styles.selectorTextoActivo,
                        ]}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.selector}>
                  <Text style={styles.etiqueta}>Nivel</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Básico', 'Intermedio', 'Avanzado'].map((n) => (
                      <TouchableOpacity
                        key={n}
                        style={[
                          styles.selectorBoton,
                          nivel === n && styles.selectorBotonActivo,
                        ]}
                        onPress={() => setNivel(n)}
                      >
                        <Text style={[
                          styles.selectorTexto,
                          nivel === n && styles.selectorTextoActivo,
                        ]}>
                          {n}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.selector}>
                  <Text style={styles.etiqueta}>Categoría</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categorias.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.selectorBoton,
                          categoria === cat && styles.selectorBotonActivo,
                        ]}
                        onPress={() => setCategoria(cat)}
                      >
                        <Text style={[
                          styles.selectorTexto,
                          categoria === cat && styles.selectorTextoActivo,
                        ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Información */}
              <View style={styles.infoBox}>
                <MaterialCommunityIcons name="information" size={16} color="#2196F3" />
                <Text style={styles.infoTexto}>
                  {' '}Este cuento estará disponible OFFLINE para todos los estudiantes del grado seleccionado.
                </Text>
              </View>
            </ScrollView>

            {/* Botones del modal */}
            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={[styles.modalBoton, styles.modalBotonCancelar]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBotonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBoton, styles.modalBotonGuardar]}
                onPress={guardarCuento}
              >
                <MaterialCommunityIcons name="content-save" size={18} color="#FFFFFF" />
                <Text style={styles.modalBotonGuardarTexto}>Guardar cuento</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  
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
    textAlign: 'center' 
  },

  estadisticasContainer: { 
    backgroundColor: '#FFFFFF', 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 16, 
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  estadistica: { alignItems: 'center' },
  estadisticaNumero: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1A237E' 
  },
  estadisticaTexto: { 
    fontSize: 12, 
    color: '#757575', 
    marginTop: 4 
  },
  separador: { 
    width: 1, 
    backgroundColor: '#E0E0E0' 
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

  botonAgregar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#4CAF50', 
    marginHorizontal: 16, 
    paddingVertical: 14, 
    borderRadius: 12, 
    marginBottom: 16,
    elevation: 2,
  },
  botonAgregarTexto: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#FFFFFF', 
    marginLeft: 8 
  },

  vacioContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40 
  },
  vacioTexto: { 
    fontSize: 15, 
    color: '#9E9E9E', 
    textAlign: 'center', 
    marginTop: 16, 
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
  cuentoTitulo: { 
    flex: 1, 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#212121', 
    marginLeft: 10 
  },
  cuentoContenido: { 
    fontSize: 14, 
    color: '#616161', 
    lineHeight: 20, 
    marginBottom: 12 
  },
  cuentoFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  cuentoInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  cuentoInfoTexto: { 
    fontSize: 12, 
    color: '#757575', 
    marginLeft: 4 
  },

  // Modal styles
  modalContenedor: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContenido: { 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    maxHeight: '90%',
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  modalTitulo: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1A237E' 
  },
  
  modalFormulario: { 
    padding: 20, 
    maxHeight: 500 
  },
  etiqueta: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#424242', 
    marginBottom: 8, 
    marginTop: 16 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 15, 
    color: '#212121',
    backgroundColor: '#FAFAFA',
  },
  textArea: { 
    minHeight: 120 
  },
  contadorCaracteres: { 
    fontSize: 12, 
    color: '#9E9E9E', 
    textAlign: 'right', 
    marginTop: 4 
  },
  
  selectoresContainer: { 
    marginTop: 16 
  },
  selector: { 
    marginBottom: 20 
  },
  selectorBoton: { 
    backgroundColor: '#F5F5F5', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 8, 
    marginRight: 8 
  },
  selectorBotonActivo: { 
    backgroundColor: '#4A90D9' 
  },
  selectorTexto: { 
    fontSize: 13, 
    color: '#757575' 
  },
  selectorTextoActivo: { 
    color: '#FFFFFF', 
    fontWeight: '600' 
  },
  
  infoBox: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    backgroundColor: '#E3F2FD', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 20 
  },
  infoTexto: { 
    flex: 1, 
    fontSize: 12, 
    color: '#1976D2', 
    lineHeight: 16, 
    marginLeft: 8 
  },
  
  modalBotones: { 
    flexDirection: 'row', 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#F0F0F0' 
  },
  modalBoton: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  modalBotonCancelar: { 
    backgroundColor: '#F5F5F5', 
    marginRight: 8 
  },
  modalBotonCancelarTexto: { 
    color: '#757575', 
    fontSize: 15, 
    fontWeight: '600' 
  },
  modalBotonGuardar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#4A90D9', 
    marginLeft: 8 
  },
  modalBotonGuardarTexto: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '600', 
    marginLeft: 8 
  },
});

export default BibliotecaOfflineScreen;