/**
 * security.js - Middleware de seguridad para proteger contra ataques comunes
 * 
 * - Rate limiting (limitar solicitudes por IP)
 * - Bloqueo temporal tras intentos fallidos de login
 * - Headers de seguridad HTTP
 * - Sanitización de inputs
 */

const rateLimit = require('express-rate-limit');

// Almacenamiento en memoria para intentos fallidos (en producción usar Redis)
const failedAttempts = new Map();

// ─── RATE LIMITING GENERAL ─────────────────────────────────────────────────────
// Limita solicitudes generales por IP
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 solicitudes por ventana
  message: {
    error: 'Demasiadas solicitudes. Por favor espera un momento.',
    retryAfter: '15 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── RATE LIMITING ESTRICTO PARA LOGIN ───────────────────────────────────────────
// Limita intentos de login por IP
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por ventana
  message: {
    error: 'Demasiados intentos de login. Por favor espera 15 minutos.',
    retryAfter: '15 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No cuenta intentos exitosos
});

// ─── BLOQUEO TEMPORAL POR INTENTOS FALLIDOS ─────────────────────────────────────
// Bloquea temporalmente una IP tras múltiples intentos fallidos
const checkFailedAttempts = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `login_${ip}`;
  
  const attempts = failedAttempts.get(key);
  
  if (attempts && attempts.count >= 5) {
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    const blockTime = 30 * 60 * 1000; // 30 minutos de bloqueo
    
    if (timeSinceLastAttempt < blockTime) {
      const remainingTime = Math.ceil((blockTime - timeSinceLastAttempt) / 60000);
      return res.status(429).json({
        error: 'Demasiados intentos fallidos. Tu IP ha sido bloqueada temporalmente.',
        retryAfter: `${remainingTime} minutos`,
        blockedUntil: new Date(attempts.lastAttempt + blockTime).toISOString(),
      });
    } else {
      // Reiniciar contador si ya pasó el tiempo de bloqueo
      failedAttempts.delete(key);
    }
  }
  
  next();
};

// ─── REGISTRAR INTENTO FALLIDO ─────────────────────────────────────────────────
const recordFailedAttempt = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `login_${ip}`;
  
  const attempts = failedAttempts.get(key) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  
  failedAttempts.set(key, attempts);
  
  // Limpiar automáticamente después de 1 hora
  setTimeout(() => {
    failedAttempts.delete(key);
  }, 60 * 60 * 1000);
};

// ─── LIMPIAR INTENTOS FALLIDOS AL EXITO ─────────────────────────────────────────
const clearFailedAttempts = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `login_${ip}`;
  failedAttempts.delete(key);
};

// ─── HEADERS DE SEGURIDAD HTTP ───────────────────────────────────────────────────
const securityHeaders = (req, res, next) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Habilitar XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Política de referencia
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HSTS (solo en HTTPS)
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy (básico)
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
};

// ─── SANITIZACIÓN DE INPUTS BÁSICA ───────────────────────────────────────────────
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    const sanitized = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Eliminar caracteres peligrosos
        sanitized[key] = obj[key]
          .replace(/[<>]/g, '') // Eliminar < y >
          .trim();
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitize(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  };
  
  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }
  
  next();
};

// ─── VALIDAR IP DE CONFIANZA (opcional) ───────────────────────────────────────────
const trustedIPs = ['127.0.0.1', '::1']; // localhost

const isTrustedIP = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  if (!trustedIPs.includes(ip)) {
    return res.status(403).json({
      error: 'Acceso denegado. IP no autorizada.',
    });
  }
  
  next();
};

module.exports = {
  generalRateLimit,
  loginRateLimit,
  checkFailedAttempts,
  recordFailedAttempt,
  clearFailedAttempts,
  securityHeaders,
  sanitizeInput,
  isTrustedIP,
};
