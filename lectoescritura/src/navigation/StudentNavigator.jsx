/**
 * StudentNavigator.jsx - Navegación para el rol Estudiante
 *
 * Usa un Tab Navigator en la parte inferior con los módulos principales:
 * Inicio, Lectura, Escritura, Ejercicios IA y Mi Progreso
 *
 * Usa @expo/vector-icons (MaterialCommunityIcons) en lugar de
 * react-native-vector-icons para compatibilidad con Expo.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Pantallas del estudiante
import InicioEstudianteScreen from '../screens/student/InicioEstudianteScreen';
import LecturaScreen from '../screens/student/LecturaScreen';
import EjercicioLecturaScreen from '../screens/student/EjercicioLecturaScreen';
import EscrituraScreen from '../screens/student/EscrituraScreen';
import EjercicioEscrituraScreen from '../screens/student/EjercicioEscrituraScreen';
import EjerciciosIAScreen from '../screens/student/EjerciciosIAScreen';
import ProgresoScreen from '../screens/student/ProgresoScreen';
import TareasScreen from '../screens/student/TareasScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack interno para el módulo de Lectura
const LecturaStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListaLecturas" component={LecturaScreen} />
    <Stack.Screen name="EjercicioLectura" component={EjercicioLecturaScreen} />
  </Stack.Navigator>
);

// Stack interno para el módulo de Escritura
const EscrituraStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListaEscritura" component={EscrituraScreen} />
    <Stack.Screen name="EjercicioEscritura" component={EjercicioEscrituraScreen} />
  </Stack.Navigator>
);

const StudentNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4A90D9',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarIcon: ({ color, size }) => {
          const iconos = {
            Inicio: 'home',
            Lectura: 'book-open-variant',
            Escritura: 'pencil',
            EjerciciosIA: 'robot',
            Progreso: 'chart-line',
            Tareas: 'clipboard-list',
          };
          return (
            <MaterialCommunityIcons
              name={iconos[route.name] || 'circle'}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Inicio" component={InicioEstudianteScreen} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Lectura" component={LecturaStack} options={{ tabBarLabel: 'Lectura' }} />
      <Tab.Screen name="Escritura" component={EscrituraStack} options={{ tabBarLabel: 'Escritura' }} />
      <Tab.Screen name="Tareas" component={TareasScreen} options={{ tabBarLabel: 'Tareas' }} />
      <Tab.Screen name="EjerciciosIA" component={EjerciciosIAScreen} options={{ tabBarLabel: 'IA' }} />
      <Tab.Screen name="Progreso" component={ProgresoScreen} options={{ tabBarLabel: 'Progreso' }} />
    </Tab.Navigator>
  );
};

export default StudentNavigator;
