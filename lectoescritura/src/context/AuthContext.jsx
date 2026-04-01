/**
 * AuthContext.jsx - Contexto de autenticación global
 *
 * Maneja el estado del usuario autenticado, su rol y token JWT.
 * Persiste la sesión usando AsyncStorage para que el usuario
 * no tenga que iniciar sesión cada vez que abre la app.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Creamos el contexto
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);   // Datos del usuario logueado
  const [token, setToken] = useState(null);        // Token JWT
  const [cargando, setCargando] = useState(true);  // Estado de carga inicial

  // Al montar, intentamos recuperar la sesión guardada
  useEffect(() => {
    cargarSesion();
  }, []);

  /**
   * Carga la sesión guardada en AsyncStorage
   */
  const cargarSesion = async () => {
    try {
      const tokenGuardado = await AsyncStorage.getItem('token');
      const usuarioGuardado = await AsyncStorage.getItem('usuario');
      if (tokenGuardado && usuarioGuardado) {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
    } finally {
      setCargando(false);
    }
  };

  /**
   * Inicia sesión y guarda los datos en AsyncStorage
   * @param {object} datosUsuario - Datos del usuario retornados por el backend
   * @param {string} tokenJWT - Token JWT de autenticación
   */
  const iniciarSesion = async (datosUsuario, tokenJWT) => {
    try {
      await AsyncStorage.setItem('token', tokenJWT);
      await AsyncStorage.setItem('usuario', JSON.stringify(datosUsuario));
      setToken(tokenJWT);
      setUsuario(datosUsuario);
    } catch (error) {
      console.error('Error al guardar sesión:', error);
    }
  };

  /**
   * Cierra la sesión y limpia AsyncStorage
   */
  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
      setToken(null);
      setUsuario(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);
