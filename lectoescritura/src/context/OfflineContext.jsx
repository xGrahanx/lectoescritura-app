/**
 * OfflineContext.jsx - Contexto para manejo de modo offline
 *
 * Detecta el estado de la conexión a internet usando expo-network
 * y expone funciones para guardar datos localmente y sincronizar
 * cuando se recupera la conexión.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Network from 'expo-network';

export const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [estaConectado, setEstaConectado] = useState(true); // Estado de conexión
  const [sincronizando, setSincronizando] = useState(false); // Estado de sincronización

  useEffect(() => {
    // Verificar conexión al montar
    verificarConexion();

    // Verificar cada 5 segundos
    const intervalo = setInterval(verificarConexion, 5000);
    return () => clearInterval(intervalo);
  }, []);

  /**
   * Verifica el estado actual de la conexión usando expo-network
   */
  const verificarConexion = async () => {
    try {
      const estado = await Network.getNetworkStateAsync();
      const conectado = estado.isConnected && estado.isInternetReachable;

      // Si se recuperó la conexión, sincronizar datos pendientes
      if (conectado && !estaConectado) {
        sincronizarDatosPendientes();
      }

      setEstaConectado(conectado ?? true);
    } catch (error) {
      console.error('Error al verificar conexión:', error);
    }
  };

  /**
   * Sincroniza los datos guardados offline con el servidor
   * Se llama automáticamente cuando se recupera la conexión
   */
  const sincronizarDatosPendientes = async () => {
    setSincronizando(true);
    try {
      // TODO: Implementar lógica de sincronización con SQLite -> PostgreSQL
      console.log('Sincronizando datos pendientes con el servidor...');
    } catch (error) {
      console.error('Error al sincronizar:', error);
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <OfflineContext.Provider value={{ estaConectado, sincronizando, sincronizarDatosPendientes }}>
      {children}
    </OfflineContext.Provider>
  );
};

// Hook personalizado
export const useOffline = () => useContext(OfflineContext);
