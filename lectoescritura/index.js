/**
 * index.js - Entry point de la aplicación Expo
 * Registra el componente raíz de la app
 */
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent llama a AppRegistry.registerComponent('main', () => App)
// También asegura que el entorno esté configurado correctamente para Expo Go y builds nativos
registerRootComponent(App);
