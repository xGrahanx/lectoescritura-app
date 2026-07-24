import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, useWindowDimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import JuegoMemoria from '../../components/JuegoMemoria';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../utils/constantes';

// Componente individual de partícula de confeti
const ParticulaConfeti = ({ delay, screenWidth, screenHeight }) => {
  const animatedY = useRef(new Animated.Value(-20)).current;
  const animatedX = useRef(new Animated.Value(Math.random() * screenWidth)).current;
  const rotateVal = useRef(new Animated.Value(0)).current;
  
  const colors = ['#FFD700', '#FF5722', '#4CAF50', '#00BCD4', '#9C27B0', '#E91E63', '#FFEB3B'];
  const color = useRef(colors[Math.floor(Math.random() * colors.length)]).current;
  const size = useRef(Math.random() * 14 + 10).current;
  const isStar = useRef(Math.random() > 0.4).current;

  useEffect(() => {
    const iniciarAnimacion = () => {
      animatedY.setValue(-20);
      animatedX.setValue(Math.random() * screenWidth);
      rotateVal.setValue(0);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animatedY, {
            toValue: screenHeight + 50,
            duration: Math.random() * 1500 + 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedX, {
            toValue: Math.random() * screenWidth,
            duration: Math.random() * 1500 + 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateVal, {
            toValue: 1,
            duration: Math.random() * 1500 + 1500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        iniciarAnimacion();
      });
    };

    iniciarAnimacion();
  }, [screenWidth, screenHeight]);

  const spin = rotateVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        transform: [
          { translateY: animatedY },
          { translateX: animatedX },
          { rotate: spin }
        ],
      }}
    >
      <MaterialCommunityIcons 
        name={isStar ? 'star' : 'brightness-1'} 
        size={size} 
        color={color} 
      />
    </Animated.View>
  );
};

// Lluvia de confeti
const ConfetiVictoria = () => {
  const { width, height } = useWindowDimensions();
  const particulas = Array.from({ length: 40 });

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }]}>
      {particulas.map((_, index) => {
        const delay = index * 100;
        return <ParticulaConfeti key={index} delay={delay} screenWidth={width} screenHeight={height} />;
      })}
    </View>
  );
};

const JuegoMemoriaScreen = ({ navigation }) => {
  const { usuario } = useAuth();
  const [nivelSeleccionado, setNivelSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [juegoKey, setJuegoKey] = useState(0);

  const niveles = [
    { id: 'basico', nombre: 'Básico', descripcion: 'Imagen ↔ Palabra', icon: 'star-outline', color: '#4CAF50', bgColor: '#E8F5E9' },
    { id: 'intermedio', nombre: 'Intermedio', descripcion: 'Sinónimos', icon: 'star-half-full', color: '#FF9800', bgColor: '#FFF3E0' },
    { id: 'avanzado', nombre: 'Avanzado', descripcion: 'Definiciones', icon: 'star', color: '#F44336', bgColor: '#FFEBEE' },
  ];

  const seleccionarNivel = (nivel) => {
    setNivelSeleccionado(nivel);
    setJuegoKey(prev => prev + 1);
  };

  const handleCompletado = useCallback(async (data) => {
    setResultado(data);
    setMostrarModal(true);

    // Guardar progreso en el backend
    if (usuario?.id) {
      try {
        await axios.post(`${API_CONFIG.BASE_URL}/progreso/${usuario.id}`, {
          puntaje_promedio: data.puntaje,
          ejercicios_completados: 1,
        });
        console.log('Progreso registrado con éxito en la DB');
      } catch (error) {
        console.error('Error al registrar progreso en la DB:', error);
      }
    }
  }, [usuario]);

  const reiniciar = () => {
    setMostrarModal(false);
    setResultado(null);
    setJuegoKey(prev => prev + 1);
  };

  const volverAlMenu = () => {
    setNivelSeleccionado(null);
    setMostrarModal(false);
    setResultado(null);
  };

  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  if (nivelSeleccionado) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <View style={styles.header}>
          <TouchableOpacity onPress={volverAlMenu} style={styles.botonVolver}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Juego de Memoria</Text>
          <View style={styles.espaciador} />
        </View>
        
        <View style={[styles.nivelInfo, { backgroundColor: niveles.find(n => n.id === nivelSeleccionado)?.color }]}>
          <MaterialCommunityIcons name={niveles.find(n => n.id === nivelSeleccionado)?.icon} size={20} color="#FFF" />
          <Text style={styles.nivelTexto}>
            {niveles.find(n => n.id === nivelSeleccionado)?.nombre}
          </Text>
        </View>

        <JuegoMemoria key={`${nivelSeleccionado}-${juegoKey}`} nivel={nivelSeleccionado} onCompletado={handleCompletado} />

        {mostrarModal && <ConfetiVictoria />}

        <Modal
          visible={mostrarModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMostrarModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContenido}>
              {/* Estrellas animadas en base a puntuación */}
              <View style={styles.estrellasContainer}>
                <MaterialCommunityIcons 
                  name={resultado?.estrellas >= 1 ? 'star' : 'star-outline'} 
                  size={50} 
                  color={resultado?.estrellas >= 1 ? '#FFD700' : '#E0E0E0'} 
                />
                <MaterialCommunityIcons 
                  name={resultado?.estrellas >= 2 ? 'star' : 'star-outline'} 
                  size={70} 
                  color={resultado?.estrellas >= 2 ? '#FFD700' : '#E0E0E0'} 
                  style={styles.estrellaCentro}
                />
                <MaterialCommunityIcons 
                  name={resultado?.estrellas >= 3 ? 'star' : 'star-outline'} 
                  size={50} 
                  color={resultado?.estrellas >= 3 ? '#FFD700' : '#E0E0E0'} 
                />
              </View>

              <Text style={styles.modalTitulo}>¡Excelente!</Text>
              <Text style={styles.modalTexto}>Completaste el juego</Text>
              
              <View style={styles.estadisticas}>
                <View style={styles.estadisticaItem}>
                  <View style={styles.estadisticaIcono}>
                    <MaterialCommunityIcons name="clock-outline" size={28} color="#FFF" />
                  </View>
                  <Text style={styles.estadisticaValor}>{formatearTiempo(resultado?.tiempo || 0)}</Text>
                  <Text style={styles.estadisticaLabel}>Tiempo</Text>
                </View>
                <View style={styles.estadisticaItem}>
                  <View style={styles.estadisticaIcono}>
                    <MaterialCommunityIcons name="gesture-tap" size={28} color="#FFF" />
                  </View>
                  <Text style={styles.estadisticaValor}>{resultado?.movimientos || 0}</Text>
                  <Text style={styles.estadisticaLabel}>Movimientos</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.botonPrimario} onPress={reiniciar}>
                <MaterialCommunityIcons name="refresh" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.botonTexto}>Jugar de nuevo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonSecundario} onPress={volverAlMenu}>
                <MaterialCommunityIcons name="home" size={20} color="#666" style={{ marginRight: 8 }} />
                <Text style={styles.botonTextoSecundario}>Volver al menú</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonVolver}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.titulo}>Juego de Memoria</Text>
        <View style={styles.espaciador} />
      </View>

      <ScrollView style={styles.contenido} showsVerticalScrollIndicator={false}>
        <View style={styles.bienvenida}>
          <MaterialCommunityIcons name="gamepad-variant" size={60} color="#4A90D9" />
          <Text style={styles.bienvenidaTitulo}>¡A jugar!</Text>
          <Text style={styles.descripcion}>
            Encuentra las parejas de cartas. ¡Mejora tu memoria mientras aprendes!
          </Text>
        </View>

        <Text style={styles.seccionTitulo}>Selecciona un nivel</Text>

        <View style={styles.nivelesContainer}>
          {niveles.map((nivel) => (
            <TouchableOpacity
              key={nivel.id}
              style={[styles.nivelCard, { backgroundColor: nivel.bgColor, borderColor: nivel.color }]}
              onPress={() => seleccionarNivel(nivel.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconoContainer, { backgroundColor: nivel.color }]}>
                <MaterialCommunityIcons name={nivel.icon} size={36} color="#FFF" />
              </View>
              <View style={styles.nivelInfoContainer}>
                <Text style={styles.nivelNombre}>{nivel.nombre}</Text>
                <Text style={styles.nivelDescripcion}>{nivel.descripcion}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={28} color={nivel.color} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.instrucciones}>
          <Text style={styles.instruccionesTitulo}>¿Cómo jugar?</Text>
          <View style={styles.instruccionItem}>
            <View style={[styles.instruccionNumero, { backgroundColor: '#4A90D9' }]}>
              <Text style={styles.instruccionNumeroTexto}>1</Text>
            </View>
            <Text style={styles.instruccionTexto}>Toca una carta para voltearla</Text>
          </View>
          <View style={styles.instruccionItem}>
            <View style={[styles.instruccionNumero, { backgroundColor: '#4A90D9' }]}>
              <Text style={styles.instruccionNumeroTexto}>2</Text>
            </View>
            <Text style={styles.instruccionTexto}>Busca su pareja (imagen-palabra, sinónimos, etc.)</Text>
          </View>
          <View style={styles.instruccionItem}>
            <View style={[styles.instruccionNumero, { backgroundColor: '#4A90D9' }]}>
              <Text style={styles.instruccionNumeroTexto}>3</Text>
            </View>
            <Text style={styles.instruccionTexto}>Encuentra todas las parejas para ganar</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4A90D9',
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  botonVolver: {
    padding: 5,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  espaciador: {
    width: 34,
  },
  nivelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 10,
  },
  nivelTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  contenido: {
    flex: 1,
    padding: 20,
  },
  bienvenida: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bienvenidaTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  descripcion: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5,
  },
  nivelesContainer: {
    gap: 15,
    marginBottom: 25,
  },
  nivelCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  nivelInfoContainer: {
    flex: 1,
  },
  nivelNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  nivelDescripcion: {
    fontSize: 14,
    color: '#666',
  },
  instrucciones: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  instruccionesTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  instruccionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 15,
  },
  instruccionNumero: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instruccionNumeroTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instruccionTexto: {
    fontSize: 15,
    color: '#666',
    flex: 1,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContenido: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 35,
    width: '90%',
    alignItems: 'center',
  },
  estrellasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  estrellaCentro: {
    transform: [{ translateY: -10 }],
  },
  modalTitulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  modalTexto: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    marginBottom: 25,
  },
  estadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  estadisticaItem: {
    alignItems: 'center',
  },
  estadisticaIcono: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  estadisticaValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  estadisticaLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  botonPrimario: {
    backgroundColor: '#4A90D9',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  botonTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonSecundario: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  botonTextoSecundario: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JuegoMemoriaScreen;
