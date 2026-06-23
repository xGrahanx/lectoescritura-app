/**
 * AyudaScreen.jsx - Pantalla de ayuda y soporte para docentes
 * 
 * Proporciona información de contacto, FAQs y recursos de ayuda
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, Linking,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AyudaScreen = ({ navigation }) => {
  // Información de contacto actualizada
  const contactoAdmin = {
    nombre: 'Soporte Técnico del Sistema',
    correo: 'gabrielrey1305@gmail.com',
    telefono: '+58 412-755-6191',
    horario: 'Lunes a Viernes, 7:00 AM - 6:00 PM',
    whatsapp: '+584127556191', // Sin espacios ni guiones para WhatsApp
  };

  // FAQs comunes
  const faqs = [
    {
      pregunta: '¿Cómo asigno una tarea a mis estudiantes?',
      respuesta: 'Ve a la pantalla "Asignar Tarea" desde el menú principal. Selecciona el grupo, tipo de tarea y completa los detalles requeridos.',
    },
    {
      pregunta: '¿Cómo veo el progreso de mis estudiantes?',
      respuesta: 'En la pantalla "Estudiantes", selecciona un estudiante para ver su progreso detallado en lectura y escritura.',
    },
    {
      pregunta: '¿Qué hago si un estudiante no puede acceder a la app?',
      respuesta: 'Verifica que el estudiante tenga conexión a internet y esté usando las credenciales correctas. Si persiste, contacta al administrador.',
    },
    {
      pregunta: '¿Cómo cambio mi contraseña?',
      respuesta: 'Ve a tu perfil > "Cambiar contraseña". Necesitarás ingresar tu contraseña actual antes de establecer una nueva.',
    },
    {
      pregunta: '¿El sistema funciona sin internet?',
      respuesta: 'Algunas funciones básicas funcionan offline, pero para sincronizar datos y usar IA necesitas conexión a internet.',
    },
  ];

  const handleContactarCorreo = () => {
    Linking.openURL(`mailto:${contactoAdmin.correo}?subject=Soporte Sistema Lectoescritura&body=Hola, necesito ayuda con:`).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de correo');
    });
  };

  const handleLlamarSoporte = () => {
    Linking.openURL(`tel:${contactoAdmin.telefono}`).catch(() => {
      Alert.alert('Error', 'No se pudo realizar la llamada');
    });
  };

  const handleEnviarWhatsApp = () => {
    const mensaje = 'Hola, necesito ayuda con el Sistema de Lectoescritura';
    // Usar el número específico para WhatsApp (sin espacios, guiones, ni +)
    const numeroWhatsApp = contactoAdmin.whatsapp.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`).catch(() => {
      Alert.alert('Error', 'No se pudo abrir WhatsApp. Verifica que tienes la aplicación instalada.');
    });
  };

  return (
    <ScrollView style={styles.contenedor}>
      {/* Botón de regresar */}
      <TouchableOpacity style={styles.botonRegresar} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
      </TouchableOpacity>

      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View style={styles.iconoContenedor}>
          <MaterialCommunityIcons name="help-circle" size={60} color="#4A90D9" />
        </View>
        <Text style={styles.titulo}>Ayuda y Soporte</Text>
        <Text style={styles.subtitulo}>
          Estamos aquí para ayudarte con cualquier duda o problema
        </Text>
      </View>

      {/* Sección: Contacto directo */}
      <View style={styles.seccion}>
        <View style={styles.tituloSeccionRow}>
          <MaterialCommunityIcons name="headset" size={18} color="#212121" />
          <Text style={styles.tituloSeccion}> Contacto de soporte</Text>
        </View>

        <View style={styles.infoContactoContainer}>
          <View style={styles.infoContacto}>
            <MaterialCommunityIcons name="account" size={18} color="#4A90D9" />
            <View style={styles.infoContactoTexto}>
              <Text style={styles.infoContactoEtiqueta}>Responsable:</Text>
              <Text style={styles.infoContactoValor}>{contactoAdmin.nombre}</Text>
            </View>
          </View>
          
          <View style={styles.infoContacto}>
            <MaterialCommunityIcons name="email" size={18} color="#4A90D9" />
            <View style={styles.infoContactoTexto}>
              <Text style={styles.infoContactoEtiqueta}>Correo electrónico:</Text>
              <Text style={styles.infoContactoValor}>{contactoAdmin.correo}</Text>
            </View>
          </View>
          
          <View style={styles.infoContacto}>
            <MaterialCommunityIcons name="phone" size={18} color="#4CAF50" />
            <View style={styles.infoContactoTexto}>
              <Text style={styles.infoContactoEtiqueta}>Teléfono de contacto:</Text>
              <Text style={styles.infoContactoValor}>{contactoAdmin.telefono}</Text>
            </View>
          </View>
          
          <View style={styles.infoContacto}>
            <MaterialCommunityIcons name="clock-outline" size={18} color="#FF9800" />
            <View style={styles.infoContactoTexto}>
              <Text style={styles.infoContactoEtiqueta}>Horario de atención:</Text>
              <Text style={styles.infoContactoValor}>{contactoAdmin.horario}</Text>
            </View>
          </View>
        </View>

        {/* Botones de acción rápida - Diseño mejorado */}
        <View style={styles.botonesAccion}>
          <TouchableOpacity style={[styles.botonAccion, styles.botonCorreo]} onPress={handleContactarCorreo}>
            <View style={styles.iconoContenedorAccion}>
              <MaterialCommunityIcons name="email" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.botonAccionTexto}>Correo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.botonAccion, styles.botonLlamar]} onPress={handleLlamarSoporte}>
            <View style={styles.iconoContenedorAccion}>
              <MaterialCommunityIcons name="phone" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.botonAccionTexto}>Llamar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.botonAccion, styles.botonWhatsApp]} onPress={handleEnviarWhatsApp}>
            <View style={styles.iconoContenedorAccion}>
              <MaterialCommunityIcons name="whatsapp" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.botonAccionTexto}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sección: Preguntas frecuentes */}
      <View style={styles.seccion}>
        <View style={styles.tituloSeccionRow}>
          <MaterialCommunityIcons name="help-circle" size={18} color="#212121" />
          <Text style={styles.tituloSeccion}> Preguntas frecuentes (FAQ)</Text>
        </View>

        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <View style={styles.faqPregunta}>
              <MaterialCommunityIcons name="help-circle-outline" size={16} color="#4A90D9" />
              <Text style={styles.faqPreguntaTexto}>{faq.pregunta}</Text>
            </View>
            <Text style={styles.faqRespuesta}>{faq.respuesta}</Text>
          </View>
        ))}
      </View>

      {/* Sección: Recursos adicionales */}
      <View style={styles.seccion}>
        <View style={styles.tituloSeccionRow}>
          <MaterialCommunityIcons name="update" size={18} color="#212121" />
          <Text style={styles.tituloSeccion}> Información del sistema</Text>
        </View>

        <TouchableOpacity 
          style={styles.recursoItem}
          onPress={() => {
            Alert.alert(
              'Actualizaciones del Sistema',
              'Versión 2.1.0 (Junio 2026)\n\n• Mejorado sistema de recuperación de contraseña\n• Nuevo módulo de auditoría de rendimiento\n• Interfaz optimizada para docentes\n• Corrección de iconos en pantallas de ayuda\n\nPróximas mejoras:\n• Estadísticas avanzadas de estudiantes\n• Exportación de reportes en múltiples formatos\n• Integración con plataformas educativas'
            );
          }}
        >
          <MaterialCommunityIcons name="update" size={22} color="#4CAF50" />
          <View style={styles.recursoInfo}>
            <Text style={styles.recursoTitulo}>Actualizaciones del sistema</Text>
            <Text style={styles.recursoDesc}>Ver versiones y novedades</Text>
          </View>
          <MaterialCommunityIcons name="information" size={20} color="#BDBDBD" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.recursoItem}
          onPress={() => {
            Alert.alert(
              'Estadísticas del Sistema',
              'Datos generales del sistema:\n\n• Usuarios activos: 85\n• Estudiantes: 72\n• Docentes: 12\n• Administradores: 1\n\n• Tareas asignadas esta semana: 34\n• Ejercicios completados: 128\n• Puntuación promedio: 78%\n\n• Tiempo de actividad: 99.8%\n• Última actualización: Hoy'
            );
          }}
        >
          <MaterialCommunityIcons name="chart-line" size={22} color="#FF9800" />
          <View style={styles.recursoInfo}>
            <Text style={styles.recursoTitulo}>Estadísticas del sistema</Text>
            <Text style={styles.recursoDesc}>Ver métricas y datos generales</Text>
          </View>
          <MaterialCommunityIcons name="chart-bar" size={20} color="#BDBDBD" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.recursoItem}
          onPress={() => {
            Alert.alert(
              'Consejos para Docentes',
              'Tips para usar mejor el sistema:\n\n1. Asigna tareas cortas y frecuentes\n2. Revisa el progreso semanalmente\n3. Usa el módulo de IA para ejercicios personalizados\n4. Configura alertas para estudiantes con bajo rendimiento\n5. Exporta reportes mensuales para seguimiento\n\n💡 Recomendación: Mantén un registro de los estudiantes que necesitan apoyo adicional.'
            );
          }}
        >
          <MaterialCommunityIcons name="lightbulb-on" size={22} color="#9C27B0" />
          <View style={styles.recursoInfo}>
            <Text style={styles.recursoTitulo}>Consejos para docentes</Text>
            <Text style={styles.recursoDesc}>Tips y recomendaciones de uso</Text>
          </View>
          <MaterialCommunityIcons name="lightbulb" size={20} color="#BDBDBD" />
        </TouchableOpacity>
      </View>

      {/* Información de emergencia */}
      <View style={styles.infoEmergencia}>
        <MaterialCommunityIcons name="alert-circle" size={20} color="#FF9800" />
        <Text style={styles.infoEmergenciaTexto}>
          {' '}Para problemas críticos fuera del horario de atención, contacta al número de emergencia: +58 412-755-6191 (mismo número de soporte)
        </Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F9FF' },
  
  botonRegresar: { padding: 16, marginTop: 10 },

  encabezado: { 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingBottom: 30 
  },
  iconoContenedor: { 
    backgroundColor: '#F3E5F5', 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  titulo: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1A237E', 
    marginBottom: 8 
  },
  subtitulo: { 
    fontSize: 14, 
    color: '#757575', 
    textAlign: 'center' 
  },

  seccion: { 
    backgroundColor: '#FFFFFF', 
    marginHorizontal: 16, 
    marginBottom: 16, 
    borderRadius: 14, 
    padding: 20,
    elevation: 2 
  },
  tituloSeccionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  tituloSeccion: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#212121' 
  },

  infoContactoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  infoContacto: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 14,
  },
  infoContactoTexto: {
    flex: 1,
    marginLeft: 12,
  },
  infoContactoEtiqueta: { 
    fontSize: 12, 
    color: '#757575', 
    fontWeight: '500',
    marginBottom: 2,
  },
  infoContactoValor: { 
    fontSize: 14, 
    color: '#212121', 
    fontWeight: '600',
    lineHeight: 20,
  },

  botonesAccion: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 20,
    gap: 8,
  },
  botonAccion: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#4A90D9', 
    paddingVertical: 14, 
    borderRadius: 12, 
    elevation: 2,
  },
  iconoContenedorAccion: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  botonCorreo: { 
    backgroundColor: '#4A90D9' 
  },
  botonLlamar: { 
    backgroundColor: '#4CAF50' 
  },
  botonWhatsApp: { 
    backgroundColor: '#25D366' 
  },
  botonAccionTexto: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#FFFFFF', 
    marginTop: 2,
  },

  faqItem: { 
    marginBottom: 20, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  faqPregunta: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 8 
  },
  faqPreguntaTexto: { 
    flex: 1, 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#1A237E', 
    marginLeft: 8 
  },
  faqRespuesta: { 
    fontSize: 13, 
    color: '#616161', 
    lineHeight: 18, 
    paddingLeft: 24 
  },

  recursoItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5' 
  },
  recursoInfo: { 
    flex: 1, 
    marginLeft: 12 
  },
  recursoTitulo: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#212121' 
  },
  recursoDesc: { 
    fontSize: 12, 
    color: '#757575', 
    marginTop: 2 
  },

  infoEmergencia: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    backgroundColor: '#FFF3E0', 
    marginHorizontal: 16, 
    padding: 16, 
    borderRadius: 10, 
    marginTop: 8 
  },
  infoEmergenciaTexto: { 
    flex: 1, 
    fontSize: 13, 
    color: '#FF9800', 
    marginLeft: 8, 
    lineHeight: 18 
  },
});

export default AyudaScreen;