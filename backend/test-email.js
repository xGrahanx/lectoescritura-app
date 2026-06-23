/**
 * Script para probar el servicio de email
 * Ejecutar: node test-email.js
 */

require('dotenv').config();
const { enviarCorreoRecuperacion, verificarConfiguracionEmail } = require('./src/utils/emailService');

async function probarServicioEmail() {
  console.log('🚀 Probando servicio de email...\n');
  
  // 1. Verificar configuración
  console.log('📋 CONFIGURACIÓN ACTUAL:');
  const config = verificarConfiguracionEmail();
  console.log(JSON.stringify(config, null, 2));
  
  // 2. Probar envío de correo
  console.log('\n📧 PROBANDO ENVÍO DE CORREO:');
  console.log('-------------------------');
  
  const correoPrueba = process.env.EMAIL_USER || 'test@example.com';
  const codigoPrueba = '123456';
  const nombrePrueba = 'Usuario de Prueba';
  
  try {
    console.log(`Enviando correo a: ${correoPrueba}`);
    console.log(`Código: ${codigoPrueba}`);
    console.log(`Usuario: ${nombrePrueba}\n`);
    
    const resultado = await enviarCorreoRecuperacion(correoPrueba, codigoPrueba, nombrePrueba);
    
    console.log('✅ RESULTADO DEL ENVÍO:');
    console.log(JSON.stringify(resultado, null, 2));
    
    if (resultado.real) {
      console.log('\n🎉 ¡CORREO REAL ENVIADO EXITOSAMENTE!');
      console.log('El servicio de email está funcionando correctamente con SMTP.');
    } else {
      console.log('\n⚠️  MODO SIMULACIÓN ACTIVADO');
      console.log('El servicio está funcionando en modo simulación.');
      console.log('Para usar correo real, configura las variables de entorno:');
      console.log('1. EMAIL_HOST (ej: smtp.gmail.com)');
      console.log('2. EMAIL_PORT (ej: 587)');
      console.log('3. EMAIL_USER (tu correo Gmail)');
      console.log('4. EMAIL_PASSWORD (contraseña de aplicación de Google)');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
  }
  
  console.log('\n📁 Logs de correos disponibles en:');
  console.log(`${config.logsDir}`);
  
  // Listar logs si existen
  if (config.totalLogs > 0) {
    const { listarCorreosEnviados } = require('./src/utils/emailService');
    const logs = listarCorreosEnviados();
    console.log(`\n📊 Logs disponibles (${logs.length}):`);
    logs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.archivo} - ${log.tamaño} - ${log.creado}`);
    });
  }
}

// Ejecutar prueba
probarServicioEmail();