/**
 * AuthNavigator.jsx - Navegación para pantallas de autenticación
 * Incluye: Login, Registro, Recuperar Contraseña
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegistroScreen from '../screens/auth/RegistroScreen';
import RecuperarPasswordScreen from '../screens/auth/RecuperarPasswordScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }} // Sin header nativo en pantallas de auth
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registro" component={RegistroScreen} />
      <Stack.Screen name="RecuperarPassword" component={RecuperarPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
