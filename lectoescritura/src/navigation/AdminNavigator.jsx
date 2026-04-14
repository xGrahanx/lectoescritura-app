/**
 * AdminNavigator.jsx - Navegacion para el rol Administrador
 *
 * Tabs: Dashboard, Usuarios, Grupos, Reportes, Configuracion
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import DashboardAdminScreen   from '../screens/admin/DashboardAdminScreen';
import GestionUsuariosScreen  from '../screens/admin/GestionUsuariosScreen';
import CrearUsuarioScreen     from '../screens/admin/CrearUsuarioScreen';
import EditarUsuarioScreen    from '../screens/admin/EditarUsuarioScreen';
import GestionGruposScreen    from '../screens/admin/GestionGruposScreen';
import CrearGrupoScreen       from '../screens/admin/CrearGrupoScreen';
import EditarGrupoScreen      from '../screens/admin/EditarGrupoScreen';
import DetalleGrupoScreen     from '../screens/admin/DetalleGrupoScreen';
import ReportesScreen         from '../screens/admin/ReportesScreen';
import ConfiguracionScreen    from '../screens/admin/ConfiguracionScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack para gestion de usuarios
const UsuariosStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListaUsuarios"  component={GestionUsuariosScreen} />
    <Stack.Screen name="CrearUsuario"   component={CrearUsuarioScreen} />
    <Stack.Screen name="EditarUsuario"  component={EditarUsuarioScreen} />
  </Stack.Navigator>
);

// Stack para gestion de grupos
const GruposStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListaGrupos"   component={GestionGruposScreen} />
    <Stack.Screen name="CrearGrupo"    component={CrearGrupoScreen} />
    <Stack.Screen name="EditarGrupo"   component={EditarGrupoScreen} />
    <Stack.Screen name="DetalleGrupo"  component={DetalleGrupoScreen} />
  </Stack.Navigator>
);

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6A1B9A',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarIcon: ({ color, size }) => {
          const iconos = {
            Dashboard:     'view-dashboard',
            Usuarios:      'account-multiple',
            Grupos:        'account-group',
            Reportes:      'file-chart',
            Configuracion: 'cog',
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
      <Tab.Screen name="Dashboard"     component={DashboardAdminScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Usuarios"      component={UsuariosStack}        options={{ tabBarLabel: 'Usuarios' }} />
      <Tab.Screen name="Grupos"        component={GruposStack}          options={{ tabBarLabel: 'Grupos' }} />
      <Tab.Screen name="Reportes"      component={ReportesScreen}       options={{ tabBarLabel: 'Reportes' }} />
      <Tab.Screen name="Configuracion" component={ConfiguracionScreen}  options={{ tabBarLabel: 'Config' }} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
