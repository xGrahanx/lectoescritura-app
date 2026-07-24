import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';

export default function ConversacionScreen({ route, navigation }) {
  const { contacto } = route.params;
  const { usuario } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const flatListRef = useRef(null);
  
  const titulo = contacto.rol === 'docente' 
    ? `Prof. ${contacto.nombre} ${contacto.apellido}`
    : `${contacto.nombre} ${contacto.apellido}`;

  useEffect(() => {
    navigation.setOptions({ title: titulo });
  }, [navigation, titulo]);

  const cargarMensajes = async () => {
    try {
      const { data } = await axios.get(`${API_CONFIG.BASE_URL}/mensajes/${usuario.id}/${contacto.id}`);
      setMensajes(data);
      
      // Marcar como leídos
      await axios.put(`${API_CONFIG.BASE_URL}/mensajes/leer/${usuario.id}/${contacto.id}`);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMensajes();
    
    // Polling cada 5 segundos
    const intervalo = setInterval(cargarMensajes, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const enviarMensaje = async () => {
    if (!mensajeTexto.trim() || enviando) return;
    
    setEnviando(true);
    try {
      const { data } = await axios.post(`${API_CONFIG.BASE_URL}/mensajes`, {
        remitente_id: usuario.id,
        destinatario_id: contacto.id,
        contenido: mensajeTexto.trim()
      });
      
      setMensajes([...mensajes, data]);
      setMensajeTexto('');
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setEnviando(false);
    }
  };

  const confirmarEliminar = (mensaje) => {
    if (mensaje.remitente_id !== usuario.id) return;

    Alert.alert(
      'Eliminar mensaje',
      '¿Deseas eliminar este mensaje para todos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => eliminarMensaje(mensaje.id)
        }
      ]
    );
  };

  const eliminarMensaje = async (mensajeId) => {
    try {
      await axios.delete(`${API_CONFIG.BASE_URL}/mensajes/${mensajeId}?remitente_id=${usuario.id}`);
      setMensajes(prev => prev.filter(m => m.id !== mensajeId));
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      Alert.alert('Error', 'No se pudo eliminar el mensaje');
    }
  };

  const renderItem = ({ item }) => {
    const esMio = item.remitente_id === usuario.id;
    
    const fecha = new Date(item.creado_en);
    const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <View style={[styles.mensajeWrapper, esMio ? styles.mensajeMioWrapper : styles.mensajeOtroWrapper]}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onLongPress={() => confirmarEliminar(item)}
          disabled={!esMio}
          style={[styles.burbuja, esMio ? styles.burbujaMia : styles.burbujaOtra]}
        >
          <Text style={[styles.textoMensaje, esMio ? styles.textoMio : styles.textoOtro]}>
            {item.contenido}
          </Text>
          <Text style={[styles.hora, esMio ? styles.horaMia : styles.horaOtra]}>
            {hora} {esMio && (item.leido ? '✓✓' : '✓')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {cargando && mensajes.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={mensajes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay mensajes aún. ¡Escribe algo para empezar!</Text>
            </View>
          }
        />
      )}

      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={mensajeTexto}
          onChangeText={setMensajeTexto}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.botonEnviar, (!mensajeTexto.trim() || enviando) && styles.botonDeshabilitado]} 
          onPress={enviarMensaje}
          disabled={!mensajeTexto.trim() || enviando}
        >
          {enviando ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFF" style={styles.iconoEnviar} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5DDD5', // Color fondo WhatsApp
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listaContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  mensajeWrapper: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  mensajeMioWrapper: {
    justifyContent: 'flex-end',
  },
  mensajeOtroWrapper: {
    justifyContent: 'flex-start',
  },
  burbuja: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  burbujaMia: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 0,
  },
  burbujaOtra: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 0,
  },
  textoMensaje: {
    fontSize: 16,
    lineHeight: 22,
  },
  textoMio: {
    color: '#000',
  },
  textoOtro: {
    color: '#000',
  },
  hora: {
    fontSize: 11,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  horaMia: {
    color: '#666',
  },
  horaOtra: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 45,
    maxHeight: 120,
    fontSize: 16,
    marginRight: 10,
  },
  botonEnviar: {
    backgroundColor: '#007BFF',
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  botonDeshabilitado: {
    backgroundColor: '#A0C4FF',
  },
  iconoEnviar: {
    marginLeft: 3,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
