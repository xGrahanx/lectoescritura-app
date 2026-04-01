/**
 * IndicadorOffline.jsx - Componente reutilizable de indicador offline
 *
 * Muestra un banner en la parte superior cuando el dispositivo
 * no tiene conexión a internet. Se usa en múltiples pantallas.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useOffline } from '../context/OfflineContext';

const IndicadorOffline = () => {
  const { estaConectado, sincronizando } = useOffline();

  // No mostrar nada si hay conexión
  if (estaConectado) return null;

  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons
        name={sincronizando ? 'sync' : 'wifi-off'}
        size={16}
        color="#FFFFFF"
      />
      <Text style={styles.texto}>
        {sincronizando ? '  Sincronizando datos...' : '  Sin conexión - Modo offline activo'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  texto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default IndicadorOffline;
