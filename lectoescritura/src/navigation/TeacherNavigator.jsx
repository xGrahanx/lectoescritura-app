/**
 * TeacherNavigator.jsx - Navegación para el rol Docente
 *
 * Tabs: Dashboard, Mis Estudiantes, Alertas, Perfil
 * El stack de Estudiantes incluye: Lista → Detalle → Asignar Tarea
 * El stack de Perfil incluye: Perfil → EditarPerfil → CambiarPassword → Ayuda
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardDocenteScreen from '../screens/teacher/DashboardDocenteScreen';
import EstudiantesScreen from '../screens/teacher/EstudiantesScreen';
import DetalleEstudianteScreen from '../screens/teacher/DetalleEstudianteScreen';
import AlertasScreen from '../screens/teacher/AlertasScreen';
import AsignarTareaScreen from '../screens/teacher/AsignarTareaScreen';
import PerfilDocenteScreen from '../screens/teacher/PerfilDocenteScreen';
import AsistenteIAScreen from '../screens/teacher/AsistenteIAScreen';
import EditarPerfilScreen from '../screens/teacher/EditarPerfilScreen';
import CambiarPasswordScreen from '../screens/teacher/CambiarPasswordScreen';
import AyudaScreen from '../screens/teacher/AyudaScreen';
import BibliotecaOfflineScreen from '../screens/teacher/BibliotecaOfflineScreen';
import ChatScreen from '../screens/teacher/ChatScreen';
import ConversacionScreen from '../screens/teacher/ConversacionScreen';

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

// Stack para el módulo de perfil (perfil + editar + cambiar password + ayuda + biblioteca)
const PerfilStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PerfilPrincipal" component={PerfilDocenteScreen} />
    <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} />
    <Stack.Screen name="CambiarPassword" component={CambiarPasswordScreen} />
    <Stack.Screen name="Ayuda" component={AyudaScreen} />
    <Stack.Screen name="BibliotecaOffline" component={BibliotecaOfflineScreen} />
  </Stack.Navigator>
);

// Stack para el chat
const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerTitleAlign: 'center', headerBackTitleVisible: false }}>
    <Stack.Screen name="ChatLista" component={ChatScreen} options={{ title: 'Mensajes' }} />
    <Stack.Screen name="Conversacion" component={ConversacionScreen} />
  </Stack.Navigator>
);

const TeacherNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: { 
          paddingBottom: Math.max(insets.bottom, 5),
          height: 60 + Math.max(insets.bottom, 0),
        },
        tabBarIcon: ({ color, size }) => {
          const iconos = {
            Dashboard: 'view-dashboard',
            Estudiantes: 'account-group',
            AsistenteIA: 'robot',
            Chat: 'chat',
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
      <Tab.Screen name="AsistenteIA" component={AsistenteIAScreen} options={{ tabBarLabel: 'IA' }} />
      <Tab.Screen name="Chat" component={ChatStack} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="Alertas" component={AlertasScreen} options={{ tabBarLabel: 'Alertas' }} />
      <Tab.Screen name="Perfil" component={PerfilStack} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
};

export default TeacherNavigator;
