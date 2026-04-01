/**
 * authService.js - Servicio de autenticación
 *
 * Maneja las llamadas a la API del backend para login y registro.
 * En modo offline, intenta usar credenciales guardadas localmente.
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../utils/constantes';

/**
 * Inicia sesión en el servidor
 * @param {string} correo
 * @param {string} password
 * @returns {{ usuario: object, token: string }}
 */
export const apiLogin = async (correo, password) => {
  try {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/auth/login`,
      { correo, password },
      { timeout: API_CONFIG.TIMEOUT }
    );
    return response.data; // { usuario, token }
  } catch (error) {
    // Si no hay conexión, intentar login offline con credenciales guardadas
    if (!error.response) {
      const credencialesGuardadas = await AsyncStorage.getItem('credenciales_offline');
      if (credencialesGuardadas) {
        const { correoGuardado, usuario, token } = JSON.parse(credencialesGuardadas);
        if (correoGuardado === correo) {
          return { usuario, token };
        }
      }
      throw new Error('Sin conexión y no hay credenciales guardadas para modo offline.');
    }
    throw new Error(error.response?.data?.mensaje || 'Error al iniciar sesión.');
  }
};

/**
 * Registra un nuevo usuario
 * @param {object} datos - Datos del nuevo usuario
 */
export const apiRegistro = async (datos) => {
  try {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/auth/registro`,
      datos,
      { timeout: API_CONFIG.TIMEOUT }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.mensaje || 'Error al registrar usuario.');
  }
};

/**
 * Solicita recuperación de contraseña
 * @param {string} correo
 */
export const apiRecuperarPassword = async (correo) => {
  try {
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/auth/recuperar-password`,
      { correo },
      { timeout: API_CONFIG.TIMEOUT }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.mensaje || 'Error al enviar correo de recuperación.');
  }
};
