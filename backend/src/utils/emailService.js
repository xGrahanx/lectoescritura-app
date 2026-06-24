/**
 * emailService.js - Servicio real de envío de correos electrónicos
 * 
 * Usa Nodemailer con SMTP (Gmail, SendGrid, Mailgun, Amazon SES, etc.)
 * Configuración en .env:
 * - EMAIL_HOST=smtp.gmail.com
 * - EMAIL_PORT=587
 * - EMAIL_USER=tu_correo@gmail.com
 * - EMAIL_PASSWORD=tu_contraseña_app
 * - EMAIL_FROM=no-reply@lectoescritura.edu
 * - EMAIL_FROM_NAME=Sistema de Lectoescritura
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Configuración del transporter SMTP
let transporter;

try {
  // Validar que las variables de entorno existen
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Configuración de email incompleta. Usando modo simulación.');
    transporter = null;
  } else {
    // Configurar transporter SMTP real
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === '465', // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Para desarrollo con certificados auto-firmados
      },
    });

    // Verificar conexión al iniciar
    transporter.verify((error) => {
      if (error) {
        console.error('❌ Error conectando al servidor SMTP:', error.message);
        console.warn('⚠️  Usando modo simulación. Verifica tu configuración de email.');
        transporter = null;
      } else {
        console.log('✅ Servidor de correo conectado exitosamente');
      }
    });
  }
} catch (error) {
  console.error('❌ Error configurando servicio de email:', error.message);
  transporter = null;
}

// Directorio para logs de correos en desarrollo
const EMAIL_LOGS_DIR = path.join(__dirname, '../../logs/emails');

// Crear directorio si no existe
if (!fs.existsSync(EMAIL_LOGS_DIR)) {
  fs.mkdirSync(EMAIL_LOGS_DIR, { recursive: true });
}

/**
 * Generar plantilla HTML para correo de recuperación
 * @param {string} username - Nombre del usuario
 * @param {string} code - Código de 6 dígitos
 * @returns {string} - HTML del correo
 */
const generarPlantillaRecuperacion = (username, code) => {
  const fecha = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña</title>
    <style>
        /* Estilos optimizados para clientes de correo */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f9ff;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin: 20px auto;
        }
        .header {
            background: linear-gradient(135deg, #1A237E 0%, #4A90D9 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }
        .header p {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .saludo {
            font-size: 16px;
            margin-bottom: 20px;
            color: #424242;
        }
        .saludo strong {
            color: #1A237E;
        }
        .message {
            font-size: 15px;
            color: #616161;
            margin-bottom: 25px;
            line-height: 1.7;
        }
        .code-container {
            background-color: #f8f9fa;
            border: 2px dashed #4A90D9;
            border-radius: 10px;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
        }
        .code-label {
            font-size: 14px;
            color: #757575;
            margin-bottom: 10px;
            font-weight: 600;
        }
        .code {
            font-family: 'Courier New', monospace;
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #1A237E;
            margin: 15px 0;
            padding: 10px 20px;
            background-color: #ffffff;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .expiration {
            font-size: 14px;
            color: #f57c00;
            font-weight: 600;
            margin-top: 10px;
        }
        .warning-box {
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning-title {
            font-size: 14px;
            font-weight: 700;
            color: #ff8f00;
            margin-bottom: 8px;
        }
        .warning-text {
            font-size: 13px;
            color: #ff8f00;
            line-height: 1.5;
        }
        .steps {
            margin: 25px 0;
        }
        .step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        .step-number {
            background-color: #4CAF50;
            color: #ffffff;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            margin-right: 12px;
            flex-shrink: 0;
        }
        .step-text {
            font-size: 14px;
            color: #424242;
            line-height: 1.5;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }
        .footer-text {
            font-size: 12px;
            color: #757575;
            margin: 5px 0;
        }
        .timestamp {
            font-size: 11px;
            color: #bdbdbd;
            margin-top: 15px;
        }
        .support {
            margin-top: 20px;
            padding: 15px;
            background-color: #e8f5e9;
            border-radius: 8px;
            text-align: center;
        }
        .support-text {
            font-size: 13px;
            color: #2e7d32;
        }
        
        /* Responsive */
        @media (max-width: 480px) {
            .header h1 { font-size: 20px; }
            .code { font-size: 28px; letter-spacing: 6px; }
            .content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sistema de Lectoescritura</h1>
            <p>Escuela Nacional Jose Alvares de lugo</p>
        </div>
        
        <div class="content">
            <div class="saludo">
                Hola <strong>${username}</strong>,
            </div>
            
            <div class="message">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el Sistema de Lectoescritura.
            </div>
            
            <div class="code-container">
                <div class="code-label">Tu código de verificación es:</div>
                <div class="code">${code}</div>
                <div class="expiration">⏰ Válido por 15 minutos</div>
            </div>
            
            <div class="warning-box">
                <div class="warning-title">⚠️ IMPORTANTE DE SEGURIDAD</div>
                <div class="warning-text">
                    • No compartas este código con nadie.<br>
                    • El código expirará en 15 minutos.<br>
                    • Si no solicitaste este restablecimiento, ignora este correo.<br>
                    • Este es un correo automático, por favor no respondas.
                </div>
            </div>
            
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-text">Ingresa el código de 6 dígitos en la aplicación</div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-text">Crea una nueva contraseña segura</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-text">Confirma tu nueva contraseña para completar el proceso</div>
                </div>
            </div>
            
            <div class="support">
                <div class="support-text">
                    ¿Problemas con el código o preguntas?<br>
                    Contacta al administrador del sistema o a tu docente.
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">© ${new Date().getFullYear()} Sistema de Lectoescritura</div>
            <div class="footer-text">Escuela Nacional Jose Alvares de lugo</div>
            <div class="footer-text">Este es un correo automático del sistema</div>
            <div class="timestamp">Solicitud realizada el ${fecha}</div>
        </div>
    </div>
</body>
</html>`;
};

/**
 * Enviar correo de recuperación de contraseña REAL
 * @param {string} to - Correo destinatario
 * @param {string} code - Código de 6 dígitos
 * @param {string} username - Nombre del usuario
 * @returns {Promise<Object>} - Resultado del envío
 */
const enviarCorreoRecuperacion = async (to, code, username) => {
  const fecha = new Date().toISOString();
  const logId = Date.now();
  
  // Configuración del correo
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Sistema de Lectoescritura'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Recuperación de Contraseña - Sistema de Lectoescritura',
    html: generarPlantillaRecuperacion(username, code),
    text: `Hola ${username},\n\nHemos recibido una solicitud para restablecer tu contraseña.\n\nTu código de verificación es: ${code}\n\nVálido por 15 minutos.\n\nNo compartas este código con nadie.\n\nSi no solicitaste este cambio, ignora este mensaje.\n\nSaludos,\nSistema de Lectoescritura\nEscuela Nacional Jose Alvares de lugo`,
  };

  try {
    let resultado;
    
    if (transporter) {
      // Envío REAL con SMTP
      resultado = await transporter.sendMail(mailOptions);
      console.log(`✅ Correo REAL enviado a: ${to}`);
      console.log(`   📧 ID Mensaje: ${resultado.messageId}`);
    } else {
      // Modo simulación (fallback)
      resultado = {
        messageId: `simulado-${logId}`,
        response: 'Modo simulación - Configuración SMTP no disponible',
      };
      console.log(`📧 Correo SIMULADO para: ${to}`);
      console.log(`   Código: ${code} (Válido por 15 minutos)`);
    }

    // Guardar log del correo
    const logContent = `
===================================================
${transporter ? 'CORREO REAL ENVIADO' : 'CORREO SIMULADO'}
===================================================
Fecha: ${fecha}
ID Log: ${logId}
ID Mensaje: ${resultado.messageId}
Destinatario: ${to}
Asunto: ${mailOptions.subject}
Código: ${code}
Usuario: ${username}
Modo: ${transporter ? 'REAL (SMTP)' : 'SIMULACIÓN'}
Respuesta: ${resultado.response || 'N/A'}
===================================================
`;

    const logFile = path.join(EMAIL_LOGS_DIR, `recuperacion_${logId}.log`);
    fs.writeFileSync(logFile, logContent);

    return {
      success: true,
      real: transporter !== null,
      message: transporter 
        ? 'Correo de recuperación enviado exitosamente' 
        : 'Correo simulado (configuración SMTP no disponible)',
      messageId: resultado.messageId,
      timestamp: fecha,
      logId,
    };

  } catch (error) {
    console.error('❌ Error enviando correo:', error.message);
    
    // Guardar log de error
    const errorLog = `
===================================================
ERROR ENVIANDO CORREO
===================================================
Fecha: ${fecha}
ID Log: ${logId}
Destinatario: ${to}
Error: ${error.message}
Código: ${code}
Usuario: ${username}
===================================================
`;

    const errorFile = path.join(EMAIL_LOGS_DIR, `error_${logId}.log`);
    fs.writeFileSync(errorFile, errorLog);

    // Fallback a modo simulación
    console.log('⚠️  Usando modo simulación como fallback');
    return {
      success: true, // Para no romper el flujo del usuario
      real: false,
      message: 'Correo simulado (error en servidor SMTP)',
      messageId: `fallback-${logId}`,
      timestamp: fecha,
      logId,
      warning: 'El correo no se pudo enviar realmente. Verifica la configuración SMTP.',
    };
  }
};

/**
 * Enviar correo de bienvenida a nuevo usuario
 * @param {string} to - Correo destinatario
 * @param {string} username - Nombre del usuario
 * @param {string} rol - Rol del usuario (estudiante)
 * @returns {Promise<Object>} - Resultado del envío
 */
const enviarCorreoBienvenida = async (to, username, rol) => {
  const fecha = new Date().toISOString();
  const logId = Date.now();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Sistema de Lectoescritura'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Bienvenido al Sistema de Lectoescritura',
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenida</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1A237E 0%, #4A90D9 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
        h1 { margin: 0; }
        .welcome { font-size: 18px; margin: 20px 0; }
        .steps { margin: 25px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>¡Bienvenido!</h1>
        <p>Sistema de Lectoescritura</p>
    </div>
    <div class="content">
        <div class="welcome">Hola <strong>${username}</strong>,</div>
        <p>Tu cuenta de <strong>${rol}</strong> ha sido creada exitosamente en el Sistema de Lectoescritura.</p>
        <div class="steps">
            <p><strong>Para comenzar:</strong></p>
            <ol>
                <li>Ve a la aplicación o sitio web</li>
                <li>Inicia sesión con tu correo y contraseña</li>
                <li>Explora los módulos disponibles</li>
                <li>Completa tus primeras actividades</li>
            </ol>
        </div>
        <p>Si tienes preguntas o necesitas ayuda, contacta a tu docente o administrador.</p>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Sistema de Lectoescritura - Escuela Nacional Jose Alvares de lugo</p>
        </div>
    </div>
</body>
</html>`,
    text: `¡Bienvenido ${username}!\n\nTu cuenta de ${rol} ha sido creada exitosamente en el Sistema de Lectoescritura.\n\nPara comenzar:\n1. Ve a la aplicación o sitio web\n2. Inicia sesión con tu correo y contraseña\n3. Explora los módulos disponibles\n4. Completa tus primeras actividades\n\nSi tienes preguntas, contacta a tu docente o administrador.\n\nSaludos,\nSistema de Lectoescritura\nEscuela Nacional Jose Alvares de lugo`,
  };

  try {
    let resultado;
    
    if (transporter) {
      resultado = await transporter.sendMail(mailOptions);
      console.log(`✅ Correo de bienvenida REAL enviado a: ${to}`);
    } else {
      resultado = { messageId: `simulado-bienvenida-${logId}` };
      console.log(`📧 Correo de bienvenida SIMULADO para: ${to}`);
    }

    // Guardar log
    const logFile = path.join(EMAIL_LOGS_DIR, `bienvenida_${logId}.log`);
    fs.writeFileSync(logFile, JSON.stringify({
      fecha,
      logId,
      destinatario: to,
      username,
      rol,
      modo: transporter ? 'REAL' : 'SIMULACIÓN',
      messageId: resultado.messageId,
    }, null, 2));

    return {
      success: true,
      real: transporter !== null,
      messageId: resultado.messageId,
      timestamp: fecha,
    };

  } catch (error) {
    console.error('❌ Error enviando correo de bienvenida:', error.message);
    return {
      success: false,
      real: false,
      error: error.message,
      timestamp: fecha,
    };
  }
};

/**
 * Verificar configuración del servicio de email
 * @returns {Object} - Estado del servicio
 */
const verificarConfiguracionEmail = () => {
  const config = {
    servicio: transporter ? 'ACTIVO (SMTP)' : 'SIMULACIÓN',
    host: process.env.EMAIL_HOST || 'No configurado',
    usuario: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}...` : 'No configurado',
    desde: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'No configurado',
    logsDir: EMAIL_LOGS_DIR,
    totalLogs: 0,
  };

  try {
    if (fs.existsSync(EMAIL_LOGS_DIR)) {
      config.totalLogs = fs.readdirSync(EMAIL_LOGS_DIR).length;
    }
  } catch (error) {
    // Ignorar errores de lectura
  }

  return config;
};

/**
 * Listar todos los correos en logs
 * @returns {Array} - Lista de logs
 */
const listarCorreosEnviados = () => {
  try {
    const files = fs.readdirSync(EMAIL_LOGS_DIR);
    return files.map(file => {
      const stats = fs.statSync(path.join(EMAIL_LOGS_DIR, file));
      return {
        archivo: file,
        tamaño: `${(stats.size / 1024).toFixed(2)} KB`,
        creado: stats.birthtime.toLocaleString('es-ES'),
        modificado: stats.mtime.toLocaleString('es-ES'),
      };
    });
  } catch (error) {
    return [];
  }
};

/**
 * Obtener contenido de un log específico
 * @param {string} filename - Nombre del archivo
 * @returns {string} - Contenido del log
 */
const obtenerLogCorreo = (filename) => {
  try {
    const filePath = path.join(EMAIL_LOGS_DIR, filename);
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return `Error leyendo log: ${error.message}`;
  }
};

module.exports = {
  enviarCorreoRecuperacion,
  enviarCorreoBienvenida,
  verificarConfiguracionEmail,
  listarCorreosEnviados,
  obtenerLogCorreo,
  // Alias para compatibilidad
  listarCorreosSimulados: listarCorreosEnviados,
  obtenerCorreoSimulado: obtenerLogCorreo,
};
