/**
 * App.jsx - Punto de entrada principal de la aplicación
 * LectoEscritura App - Escuela Nacional Jose Alvares de lugo
 *
 * Inicializa la navegación principal y los proveedores de contexto globales.
 * Usa Expo como plataforma base para mayor compatibilidad y facilidad de despliegue.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Proveedores de contexto global
import { AuthProvider } from './src/context/AuthContext';

// Navegación principal
import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  return (
    // GestureHandlerRootView requerido por react-native-gesture-handler en Expo
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* SafeAreaProvider maneja los márgenes seguros en distintos dispositivos */}
      <SafeAreaProvider>
        {/* AuthProvider provee el estado de autenticación a toda la app */}
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            {/* Navegador raíz que decide qué stack mostrar según el rol */}
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
