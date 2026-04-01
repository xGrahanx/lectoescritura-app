/**
 * RootNavigator.jsx - Navegador raíz de la aplicación
 *
 * Decide qué stack de navegación mostrar según:
 * - Si el usuario está autenticado o no
 * - El rol del usuario (estudiante, docente, administrador)
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Stacks de navegación por rol
import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import TeacherNavigator from './TeacherNavigator';
import AdminNavigator from './AdminNavigator';

const RootNavigator = () => {
  const { usuario, cargando } = useAuth();

  // Mostrar spinner mientras se carga la sesión guardada
  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  // Si no hay usuario autenticado, mostrar pantallas de auth
  if (!usuario) {
    return <AuthNavigator />;
  }

  // Redirigir según el rol del usuario
  switch (usuario.rol) {
    case 'estudiante':
      return <StudentNavigator />;
    case 'docente':
      return <TeacherNavigator />;
    case 'administrador':
      return <AdminNavigator />;
    default:
      return <AuthNavigator />;
  }
};

const styles = StyleSheet.create({
  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
  },
});

export default RootNavigator;
