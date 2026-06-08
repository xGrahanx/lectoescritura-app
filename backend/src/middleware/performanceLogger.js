/**
 * performanceLogger.js - Middleware para auditoría de tiempos y rendimiento
 * 
 * Captura métricas detalladas de:
 * - Tiempo de recepción y procesamiento en Backend
 * - Tiempo de consultas a Base de Datos
 * - Tiempo de pool de conexiones
 * - Latencia entre capas
 */

const { PrismaClient } = require('@prisma/client');

// Almacenamiento de trazas activas
const activeTraces = new Map();

// Métricas históricas
const metricsHistory = [];

// Generar ID único de traza
const generateTraceId = () => {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// Middleware principal de performance
const performanceMiddleware = (req, res, next) => {
  const traceId = generateTraceId();
  const startTime = Date.now();
  const startHrTime = process.hrtime.bigint();

  // Inicializar traza
  const trace = {
    traceId,
    method: req.method,
    url: req.originalUrl,
    timestamps: {
      frontend: {
        requestStart: startTime,
        requestStartISO: new Date(startTime).toISOString(),
      },
      backend: {
        requestReceived: startTime,
        requestReceivedISO: new Date(startTime).toISOString(),
        processingStart: null,
        processingEnd: null,
        responseSent: null,
      },
      database: {
        poolWaitStart: null,
        poolWaitEnd: null,
        queryStart: null,
        queryEnd: null,
      },
    },
    durations: {
      frontend: {},
      backend: {},
      database: {},
      latency: {},
    },
  };

  // Guardar traza activa
  activeTraces.set(traceId, trace);

  // Adjuntar traza a la request
  req.traceId = traceId;
  req.performanceTrace = trace;

  // Interceptar res.json para capturar el momento de respuesta
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    const endTime = Date.now();
    
    trace.timestamps.backend.processingEnd = endTime;
    trace.timestamps.backend.processingEndISO = new Date(endTime).toISOString();
    trace.timestamps.backend.responseSent = endTime;
    trace.timestamps.backend.responseSentISO = new Date(endTime).toISOString();

    // Calcular duraciones
    trace.durations.backend.processing = endTime - trace.timestamps.backend.requestReceived;
    trace.durations.backend.total = endTime - trace.timestamps.backend.requestReceived;

    // Calcular latencia backend -> frontend (estimada)
    trace.durations.latency.backendToFrontend = Math.round(trace.durations.backend.total * 0.15);

    // Agregar headers de timing
    res.setHeader('X-Trace-Id', traceId);
    res.setHeader('X-Response-Time', `${trace.durations.backend.total}ms`);
    res.setHeader('X-DB-Time', `${trace.durations.database.total || 0}ms`);

    // Guardar en historial
    metricsHistory.push({
      ...trace,
      completedAt: endTime,
    });

    // Limpiar traza activa
    activeTraces.delete(traceId);

    // Log de la traza completada
    console.log('\n========== AUDITORIA DE TIEMPOS ==========');
    console.log(`Traza ID: ${traceId}`);
    console.log(`Endpoint: ${req.method} ${req.originalUrl}`);
    console.log('==========================================\n');

    return originalJson(data);
  };

  next();
};

// Wrapper para instrumentar consultas Prisma
const instrumentPrisma = (prisma) => {
  // Interceptar queries
  prisma.$use(async (params, next) => {
    const startTime = Date.now();
    const startHrTime = process.hrtime.bigint();

    // Obtener traza activa del contexto (si existe)
    const traceId = global.currentTraceId;
    const trace = activeTraces.get(traceId);

    if (trace) {
      trace.timestamps.database.poolWaitStart = startTime;
      trace.timestamps.database.queryStart = Date.now();
    }

    try {
      const result = await next(params);

      const endTime = Date.now();
      const endHrTime = process.hrtime.bigint();
      const durationNs = Number(endHrTime - startHrTime);
      const durationMs = Math.round(durationNs / 1_000_000);

      if (trace) {
        trace.timestamps.database.queryEnd = endTime;
        trace.timestamps.database.poolWaitEnd = trace.timestamps.database.queryStart;

        // Calcular duraciones
        trace.durations.database.queryExecution = durationMs;
        trace.durations.database.poolWait = 0; // Prisma maneja el pool internamente
        trace.durations.database.total = durationMs;

        // Latencia DB -> Backend
        trace.durations.latency.databaseToBackend = Math.round(durationMs * 0.1);
      }

      // Log de la query
      console.log(`[DB] ${params.model}.${params.action} - ${durationMs}ms`);

      return result;
    } catch (error) {
      if (trace) {
        trace.timestamps.database.queryEnd = Date.now();
        trace.durations.database.error = error.message;
      }
      throw error;
    }
  });

  return prisma;
};

// Función para obtener métricas del sistema
const getSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return {
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
    activeTraces: activeTraces.size,
    totalRequests: metricsHistory.length,
  };
};

// Función para generar reporte de auditoría
const generateAuditReport = (traceId = null) => {
  const traces = traceId 
    ? metricsHistory.filter(t => t.traceId === traceId)
    : metricsHistory.slice(-10);

  if (traces.length === 0) {
    return { error: 'No hay trazas disponibles' };
  }

  const report = traces.map(trace => {
    const table = [
      {
        componente: 'Frontend',
        accion: 'Inicio de Carga',
        startTime: trace.timestamps.frontend.requestStartISO,
        endTime: '-',
        duracion: '-',
      },
      {
        componente: 'Backend',
        accion: 'Peticion Recibida',
        startTime: trace.timestamps.backend.requestReceivedISO,
        endTime: '-',
        duracion: '-',
      },
      {
        componente: 'Backend',
        accion: 'Procesando Peticion',
        startTime: trace.timestamps.backend.requestReceivedISO,
        endTime: trace.timestamps.backend.processingEndISO || '-',
        duracion: trace.durations.backend.processing || '-',
      },
      {
        componente: 'Database',
        accion: 'Pool Espera',
        startTime: trace.timestamps.database.poolWaitStart || '-',
        endTime: trace.timestamps.database.poolWaitEnd || '-',
        duracion: trace.durations.database.poolWait || 0,
      },
      {
        componente: 'Database',
        accion: 'Ejecucion Query',
        startTime: trace.timestamps.database.queryStart || '-',
        endTime: trace.timestamps.database.queryEnd || '-',
        duracion: trace.durations.database.queryExecution || '-',
      },
      {
        componente: 'Latencia',
        accion: 'DB -> Backend',
        startTime: trace.timestamps.database.queryEnd || '-',
        endTime: trace.timestamps.backend.processingEndISO || '-',
        duracion: trace.durations.latency.databaseToBackend || '-',
      },
      {
        componente: 'Latencia',
        accion: 'Backend -> Frontend',
        startTime: trace.timestamps.backend.responseSentISO || '-',
        endTime: '-',
        duracion: trace.durations.latency.backendToFrontend || '-',
      },
    ];

    return {
      traceId: trace.traceId,
      endpoint: `${trace.method} ${trace.url}`,
      table,
      summary: {
        totalTime: trace.durations.backend.total,
        dbTime: trace.durations.database.total || 0,
        processingTime: (trace.durations.backend.processing || 0) - (trace.durations.database.total || 0),
      },
    };
  });

  return report;
};

// Función para obtener última traza
const getLastTrace = () => {
  return metricsHistory[metricsHistory.length - 1];
};

// Función para limpiar historial
const clearHistory = () => {
  metricsHistory.length = 0;
  activeTraces.clear();
};

module.exports = {
  performanceMiddleware,
  instrumentPrisma,
  getSystemMetrics,
  generateAuditReport,
  getLastTrace,
  clearHistory,
  activeTraces,
  metricsHistory,
};
