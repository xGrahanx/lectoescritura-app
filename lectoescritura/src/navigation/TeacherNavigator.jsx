/**
 * TeacherNavigator.jsx - Navegación para el rol Docente
 *
 * Tabs: Dashboard, Mis Estudiantes, Alertas, Perfil
 * El stack de Estudiantes incluye: Lista → Detalle → Asignar Tarea
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import DashboardDocenteScreen from '../screens/teacher/DashboardDocenteScreen';
import EstudiantesScreen from '../screens/teacher/EstudiantesScreen';
import DetalleEstudianteScreen from '../screens/teacher/DetalleEstudianteScreen';
import AlertasScreen from '../screens/teacher/AlertasScreen';
import AsignarTareaScreen from '../screens/teacher/AsignarTareaScreen';
import PerfilDocenteScreen from '../screens/teacher/PerfilDocenteScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack para el módulo de estudiantes (lista + detalle + asignar tarea)
const EstudiantesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListaEstudiantes" component={EstudiantesScreen} />
    <Stack.Screen name="DetalleEstudiante" component={DetalleEstudianteScreen} />
    <Stack.Screen name="AsignarTarea" component={AsignarTareaScreen} />
  </Stack.Navigator>
);

const TeacherNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarIcon: ({ color, size }) => {
          const iconos = {
            Dashboard: 'view-dashboard',
            Estudiantes: 'account-group',
            Alertas: 'bell',
            Perfil: 'account-circle',
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
      <Tab.Screen name="Dashboard" component={DashboardDocenteScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Estudiantes" component={EstudiantesStack} options={{ tabBarLabel: 'Estudiantes' }} />
      <Tab.Screen name="Alertas" component={AlertasScreen} options={{ tabBarLabel: 'Alertas', tabBarBadge: '3' }} />
      <Tab.Screen name="Perfil" component={PerfilDocenteScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
};

export default TeacherNavigator;
