import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../utils/constantes';
import { useAuth } from '../../context/AuthContext';

export default function ChatScreen({ navigation }) {
  const { usuario } = useAuth();
  const [conversaciones, setConversaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargarConversaciones = async () => {
    if (!usuario?.id) return;
    try {
      const { data } = await axios.get(`${API_CONFIG.BASE_URL}/mensajes/conversaciones/${usuario.id}`);
      setConversaciones(data);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarConversaciones();
    }, [usuario])
  );

  const onRefresh = () => {
    setRefrescando(true);
    cargarConversaciones();
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return '';
    const fecha = new Date(fechaString);
    const hoy = new Date();
    
    // Si es hoy, mostrar hora
    if (fecha.toDateString() === hoy.toDateString()) {
      return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si fue ayer
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    if (fecha.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    }
    
    // Si es más antiguo, mostrar fecha
    return fecha.toLocaleDateString();
  };

  const filtradas = conversaciones.filter(conv => {
    const nombreCompleto = `${conv.contacto.nombre} ${conv.contacto.apellido}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('Conversacion', { 
        contacto: item.contacto 
      })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.contacto.nombre.charAt(0)}{item.contacto.apellido.charAt(0)}
        </Text>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.nombre}>
            {item.contacto.nombre} {item.contacto.apellido}
          </Text>
          {item.ultimoMensaje && (
            <Text style={styles.fecha}>
              {formatearFecha(item.ultimoMensaje.creado_en)}
            </Text>
          )}
        </View>
        
        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.ultimoMensaje, 
              item.noLeidos > 0 && styles.mensajeNoLeido
            ]}
            numberOfLines={1}
          >
            {item.ultimoMensaje 
              ? (item.ultimoMensaje.remitente_id === usuario.id ? 'Tú: ' : '') + item.ultimoMensaje.contenido
              : 'Toca para iniciar una conversación'}
          </Text>
          
          {item.noLeidos > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.noLeidos}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={usuario?.rol === 'docente' ? "Buscar estudiante..." : "Buscar docente..."}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {cargando && !refrescando ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.contacto.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>
                {busqueda 
                  ? 'No se encontraron resultados' 
                  : (usuario?.rol === 'docente' ? 'No tienes estudiantes asignados' : 'No tienes docentes asignados')}
              </Text>
            </View>
          }
          contentContainerStyle={filtradas.length === 0 ? { flex: 1 } : {}}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 15,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fecha: {
    fontSize: 12,
    color: '#888',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ultimoMensaje: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  mensajeNoLeido: {
    color: '#333',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
