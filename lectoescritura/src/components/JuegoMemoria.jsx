import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Subcomponente de tarjeta animada con efecto de volteo 3D
const CardItem = React.memo(({ carta, index, onPress, size, disabled, tieneErrorImagen, handleImageError }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const currentFlipped = useRef(false);

  const esVolteada = carta.volteada || carta.emparejada;

  useEffect(() => {
    if (esVolteada !== currentFlipped.current) {
      currentFlipped.current = esVolteada;
      Animated.spring(animatedValue, {
        toValue: esVolteada ? 180 : 0,
        friction: 8,
        tension: 15,
        useNativeDriver: true,
      }).start();
    }
  }, [esVolteada]);

  // Interpolación de la rotación 3D para el dorso (de 0deg a 180deg)
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  // Interpolación de la rotación 3D para el frente (de 180deg a 360deg)
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  // Control de opacidad para resolver el bug de backfaceVisibility en Android
  const frontOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const backOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: frontOpacity,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: backOpacity,
  };

  return (
    <TouchableOpacity
      style={[styles.cartaContainer, { width: size, height: size }]}
      onPress={() => onPress(index)}
      disabled={carta.emparejada || carta.volteada || disabled}
      activeOpacity={0.9}
    >
      <View style={styles.cardInner}>
        {/* DORSO DE LA CARTA (Help Icon) */}
        <Animated.View
          style={[
            styles.carta,
            styles.cardAbsolute,
            frontAnimatedStyle,
            { width: size, height: size },
          ]}
        >
          <View style={styles.cartaTrasera}>
            <MaterialCommunityIcons name="help" size={Math.min(44, size * 0.4)} color="#FFF" />
          </View>
        </Animated.View>

        {/* FRENTE DE LA CARTA (Imagen/Palabra) */}
        <Animated.View
          style={[
            styles.carta,
            styles.cardAbsolute,
            carta.emparejada && styles.cartaEmparejada,
            backAnimatedStyle,
            { width: size, height: size },
          ]}
        >
          <View style={styles.cartaContenido}>
            {carta.imagen_url && !tieneErrorImagen ? (
              <Image
                source={{ uri: carta.imagen_url }}
                style={styles.imagen}
                resizeMode="cover"
                onError={() => handleImageError(carta.posicionId)}
              />
            ) : (
              <Text style={styles.palabra} numberOfLines={4} adjustsFontSizeToFit minimumFontScale={0.7}>
                {carta.palabra}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
});

const JuegoMemoria = ({ nivel, onCompletado }) => {
  const { width } = useWindowDimensions();
  const [cartas, setCartas] = useState([]);
  const [paresEncontrados, setParesEncontrados] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [movimientos, setMovimientos] = useState(0);
  const [tiempo, setTiempo] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [erroresImagen, setErroresImagen] = useState({});

  // Refs para evitar stale closures en la lógica de volteo
  const cartasVolteadasRef = useRef([]);
  const cartasRef = useRef([]);
  const timeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const notificadoRef = useRef(false);

  // Sincronizar ref de cartas con el estado
  useEffect(() => {
    cartasRef.current = cartas;
  }, [cartas]);

  // Control de montaje/desmontaje
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cargar cartas cuando cambia el nivel
  useEffect(() => {
    cargarCartas();
  }, [nivel]);

  // Temporizador estable - solo depende de si el juego terminó
  useEffect(() => {
    if (cargando || cartas.length === 0) return;
    const totalPares = cartas.length / 2;
    if (paresEncontrados >= totalPares) return;

    const intervalo = setInterval(() => {
      if (mountedRef.current) {
        setTiempo(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [cargando, cartas.length, paresEncontrados]);

  // Lógica para evaluar estrellas al ganar
  const calcularEstrellas = (movs, lvl) => {
    if (lvl === 'basico') {
      if (movs <= 5) return 3;
      if (movs <= 8) return 2;
      return 1;
    } else if (lvl === 'intermedio') {
      if (movs <= 9) return 3;
      if (movs <= 14) return 2;
      return 1;
    } else { // avanzado
      if (movs <= 7) return 3;
      if (movs <= 11) return 2;
      return 1;
    }
  };

  // Notificar completado con estrellas y puntaje promedio (usando notificadoRef para evitar llamadas múltiples)
  useEffect(() => {
    if (cartas.length > 0 && paresEncontrados === cartas.length / 2) {
      if (notificadoRef.current) return;
      notificadoRef.current = true;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current && onCompletado) {
          const estrellas = calcularEstrellas(movimientos, nivel);
          const puntaje = estrellas === 3 ? 100 : estrellas === 2 ? 80 : 60;
          onCompletado({ movimientos, tiempo, estrellas, puntaje });
        }
      }, 500);
    }
  }, [paresEncontrados, cartas.length, movimientos, tiempo, nivel, onCompletado]);

  const cargarCartas = async () => {
    try {
      setCargando(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cartasVolteadasRef.current = [];
      setParesEncontrados(0);
      setMovimientos(0);
      setTiempo(0);
      setBloqueado(false);
      setErroresImagen({});
      notificadoRef.current = false;

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cartas-memoria/juego/${nivel}`);
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        console.error('No se recibieron cartas válidas');
        if (mountedRef.current) setCargando(false);
        return;
      }

      // Precargar imágenes
      const urls = data.map(c => c.imagen_url).filter(Boolean);
      if (urls.length > 0) {
        await Promise.allSettled(urls.map(url => Image.prefetch(url)));
      }

      // Mezclar cartas
      const cartasMezcladas = [...data].sort(() => Math.random() - 0.5).map((carta, index) => ({
        ...carta,
        posicionId: `${carta.id || index}-${index}`,
        volteada: false,
        emparejada: false
      }));

      if (mountedRef.current) {
        setCartas(cartasMezcladas);
        cartasRef.current = cartasMezcladas;
        setCargando(false);
      }
    } catch (error) {
      console.error('Error al cargar cartas:', error);
      if (mountedRef.current) setCargando(false);
    }
  };

  const verificarPar = (carta1, carta2) => {
    if (!carta1 || !carta2) return false;

    const id1 = Number(carta1.id);
    const id2 = Number(carta2.id);
    const parId1 = carta1.par_id != null ? Number(carta1.par_id) : null;
    const parId2 = carta2.par_id != null ? Number(carta2.par_id) : null;

    // Verificar por par_id bidireccional
    if (parId1 != null && parId2 != null) {
      return parId1 === id2 || parId2 === id1;
    }
    if (parId1 != null && parId2 == null) {
      return parId1 === id2;
    }
    if (parId1 == null && parId2 != null) {
      return parId2 === id1;
    }

    // Fallback por misma palabra
    return carta1.palabra === carta2.palabra;
  };

  const voltearCarta = (index) => {
    const volteadasActuales = cartasVolteadasRef.current;
    const cartasActuales = cartasRef.current;
    const carta = cartasActuales[index];

    // Validaciones de guardia
    if (
      !carta ||
      carta.volteada ||
      carta.emparejada ||
      volteadasActuales.length >= 2 ||
      volteadasActuales.includes(index) ||
      bloqueado
    ) {
      return;
    }

    // Voltear la carta inmutablemente
    const nuevasCartas = cartasActuales.map((c, idx) =>
      idx === index ? { ...c, volteada: true } : c
    );
    setCartas(nuevasCartas);
    cartasRef.current = nuevasCartas;

    if (volteadasActuales.length === 0) {
      // Primera carta
      cartasVolteadasRef.current = [index];
    } else {
      // Segunda carta - evaluar par
      const primerIndex = volteadasActuales[0];
      cartasVolteadasRef.current = [primerIndex, index];
      setBloqueado(true);
      setMovimientos(prev => prev + 1);

      const primeraCarta = nuevasCartas[primerIndex];
      const segundaCarta = nuevasCartas[index];
      const esPar = verificarPar(primeraCarta, segundaCarta);

      if (esPar) {
        // Emparejar ambas cartas
        const cartasEmparejadas = nuevasCartas.map((c, i) =>
          i === primerIndex || i === index ? { ...c, emparejada: true } : c
        );
        setCartas(cartasEmparejadas);
        cartasRef.current = cartasEmparejadas;
        cartasVolteadasRef.current = [];
        setBloqueado(false);
        setParesEncontrados(prev => prev + 1);
      } else {
        // Des-voltear tras pausa
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          const cartasDesvueltas = cartasRef.current.map((c, i) =>
            i === primerIndex || i === index ? { ...c, volteada: false } : c
          );
          setCartas(cartasDesvueltas);
          cartasRef.current = cartasDesvueltas;
          cartasVolteadasRef.current = [];
          setBloqueado(false);
        }, 1000);
      }
    }
  };

  const handleImageError = (cartaId) => {
    setErroresImagen(prev => ({ ...prev, [cartaId]: true }));
  };

  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  if (cargando) {
    return (
      <View style={styles.contenedor}>
        <View style={styles.cargandoContainer}>
          <MaterialCommunityIcons name="loading" size={50} color="#4A90D9" />
          <Text style={styles.cargandoTexto}>Cargando cartas...</Text>
        </View>
      </View>
    );
  }

  if (cartas.length === 0) {
    return (
      <View style={styles.contenedor}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={50} color="#F44336" />
          <Text style={styles.errorTexto}>No hay cartas disponibles</Text>
          <TouchableOpacity style={styles.botonReintentar} onPress={cargarCartas}>
            <Text style={styles.botonReintentarTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 3 columnas
  const columnas = 3;
  const gap = 10;
  const cartaSize = Math.max(70, Math.floor((width - 20 - gap * (columnas - 1)) / columnas));

  return (
    <View style={styles.contenedor}>
      <View style={styles.infoBar}>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{formatearTiempo(tiempo)}</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="gesture-tap" size={20} color="#666" />
          <Text style={styles.infoText}>{movimientos}</Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="cards" size={20} color="#666" />
          <Text style={styles.infoText}>{paresEncontrados}/{cartas.length / 2}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {cartas.map((carta, index) => (
          <CardItem
            key={carta.posicionId}
            carta={carta}
            index={index}
            onPress={voltearCarta}
            size={cartaSize}
            disabled={bloqueado}
            tieneErrorImagen={erroresImagen[carta.posicionId]}
            handleImageError={handleImageError}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  cargandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cargandoTexto: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTexto: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  botonReintentar: {
    marginTop: 20,
    backgroundColor: '#4A90D9',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  botonReintentarTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 20,
  },
  cartaContainer: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardInner: {
    flex: 1,
  },
  cardAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  carta: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cartaEmparejada: {
    opacity: 0.7,
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  cartaContenido: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  palabra: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    textTransform: 'capitalize',
    lineHeight: 17,
  },
  cartaTrasera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90D9',
  },
});

export default JuegoMemoria;
