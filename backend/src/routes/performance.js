/**
 * performance.js - Rutas para auditoría de tiempos y rendimiento
 * 
 * GET /api/performance/metrics       - Métricas actuales del sistema
 * GET /api/performance/traces        - Últimas trazas de rendimiento
 * GET /api/performance/traces/:id    - Traza específica
 * GET /api/performance/report        - Reporte formateado de auditoría
 */

const express = require('express');
const router = express.Router();
const { 
  performanceMiddleware,
  getSystemMetrics, 
  generateAuditReport, 
  getLastTrace,
  clearHistory,
  metricsHistory 
} = require('../middleware/performanceLogger');

// ─── GET /api/performance/metrics ───────────────────────────────────────────
router.get('/metrics', (req, res) => {
  const metrics = getSystemMetrics();
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    metrics,
  });
});

// ─── GET /api/performance/traces ────────────────────────────────────────────
router.get('/traces', (req, res) => {
  const { limit = 20 } = req.query;
  const traces = metricsHistory.slice(-parseInt(limit)).map(t => ({
    traceId: t.traceId,
    endpoint: `${t.method} ${t.url}`,
    duration: t.durations.backend.total,
    dbTime: t.durations.database.total || 0,
    timestamp: t.timestamps.frontend.requestStartISO,
  }));

  res.json({
    success: true,
    count: traces.length,
    traces,
  });
});

// ─── GET /api/performance/traces/:id ────────────────────────────────────────
router.get('/traces/:id', (req, res) => {
  const { id } = req.params;
  const report = generateAuditReport(id);

  if (report.error) {
    return res.status(404).json(report);
  }

  res.json({
    success: true,
    report: report[0],
  });
});

// ─── GET /api/performance/report ────────────────────────────────────────────
router.get('/report', (req, res) => {
  const { traceId, format = 'json' } = req.query;
  const report = generateAuditReport(traceId || null);

  if (report.error) {
    return res.status(404).json(report);
  }

  // Si es formato texto, generar tabla formateada
  if (format === 'text') {
    let textReport = '';
    
    report.forEach(trace => {
      textReport += `\n${'='.repeat(80)}\n`;
      textReport += `TRAZA: ${trace.traceId}\n`;
      textReport += `ENDPOINT: ${trace.endpoint}\n`;
      textReport += `${'='.repeat(80)}\n\n`;
      
      textReport += `${'Componente'.padEnd(15)} | ${'Accion'.padEnd(25)} | ${'Start Time'.padEnd(25)} | ${'End Time'.padEnd(25)} | Duracion (ms)\n`;
      textReport += `${'-'.repeat(15)}-+-${'-'.repeat(25)}-+-${'-'.repeat(25)}-+-${'-'.repeat(25)}-+-------------\n`;
      
      trace.table.forEach(row => {
        const start = typeof row.startTime === 'string' ? row.startTime.substring(11, 23) : row.startTime;
        const end = typeof row.endTime === 'string' ? row.endTime.substring(11, 23) : row.endTime;
        textReport += `${row.componente.padEnd(15)} | ${row.accion.padEnd(25)} | ${(start + '').padEnd(25)} | ${(end + '').padEnd(25)} | ${row.duracion}\n`;
      });
      
      textReport += `\nRESUMEN:\n`;
      textReport += `  Tiempo Total Backend: ${trace.summary.totalTime}ms\n`;
      textReport += `  Tiempo Base de Datos: ${trace.summary.dbTime}ms\n`;
      textReport += `  Tiempo Procesamiento: ${trace.summary.processingTime}ms\n`;
    });

    res.setHeader('Content-Type', 'text/plain');
    return res.send(textReport);
  }

  res.json({
    success: true,
    count: report.length,
    reports: report,
  });
});

// ─── GET /api/performance/last ──────────────────────────────────────────────
router.get('/last', (req, res) => {
  const trace = getLastTrace();

  if (!trace) {
    return res.status(404).json({ 
      success: false, 
      message: 'No hay trazas disponibles. Realiza algunas peticiones primero.' 
    });
  }

  const report = generateAuditReport(trace.traceId);
  
  // Generar tabla formateada
  const tableData = report[0].table.map(row => ({
    Componente: row.componente,
    Accion: row.accion,
    'Start Time': row.startTime,
    'End Time': row.endTime,
    'Duracion (ms)': row.duracion,
  }));

  res.json({
    success: true,
    traceId: trace.traceId,
    endpoint: `${trace.method} ${trace.url}`,
    summary: report[0].summary,
    table: tableData,
  });
});

// ─── GET /api/performance/table ─────────────────────────────────────────────
// Endpoint que devuelve SOLO la tabla de tiempos como la solicitaste
router.get('/table', (req, res) => {
  const trace = getLastTrace();

  if (!trace) {
    return res.json({
      success: false,
      message: 'No hay datos disponibles. Realiza peticiones a la API primero.',
      hint: 'Los tiempos se capturan automaticamente en cada peticion.',
    });
  }

  const report = generateAuditReport(trace.traceId);
  const data = report[0];

  // Formatear timestamps para mejor legibilidad
  const formatTime = (iso) => {
    if (!iso || iso === '-') return '-';
    const date = new Date(iso);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      fractionalSecondDigits: 3 
    });
  };

  // Tabla exacta como la solicitaste
  const table = [
    {
      Componente: 'Frontend',
      Accion: 'Inicio Carga Interfaz',
      'Start Time': formatTime(data.table[0].startTime),
      'End Time': '-',
      'Duracion (ms)': data.summary.totalTime + ' (estimado)'
    },
    {
      Componente: 'Backend',
      Accion: 'Peticion Recibida',
      'Start Time': formatTime(data.table[1].startTime),
      'End Time': '-',
      'Duracion (ms)': '-'
    },
    {
      Componente: 'Backend',
      Accion: 'Procesado de Peticiones',
      'Start Time': formatTime(data.table[2].startTime),
      'End Time': formatTime(data.table[2].endTime),
      'Duracion (ms)': data.table[2].duracion
    },
    {
      Componente: 'Database',
      Accion: 'Pool Inactivo',
      'Start Time': formatTime(data.table[3].startTime),
      'End Time': formatTime(data.table[3].endTime),
      'Duracion (ms)': data.table[3].duracion
    },
    {
      Componente: 'Database',
      Accion: 'Query Execution',
      'Start Time': formatTime(data.table[4].startTime),
      'End Time': formatTime(data.table[4].endTime),
      'Duracion (ms)': data.table[4].duracion
    },
    {
      Componente: 'Latencia',
      Accion: 'DB -> Backend',
      'Start Time': '-',
      'End Time': '-',
      'Duracion (ms)': data.table[5].duracion
    },
    {
      Componente: 'Latencia',
      Accion: 'Backend -> Frontend',
      'Start Time': '-',
      'End Time': '-',
      'Duracion (ms)': data.table[6].duracion
    },
  ];

  res.json({
    success: true,
    traceId: data.traceId,
    endpoint: data.endpoint,
    tabla: table,
    resumen: {
      tiempoTotalBackend: data.summary.totalTime + 'ms',
      tiempoBaseDatos: data.summary.dbTime + 'ms',
      tiempoProcesamiento: data.summary.processingTime + 'ms',
    }
  });
});

// ─── DELETE /api/performance/clear ──────────────────────────────────────────
router.delete('/clear', (req, res) => {
  clearHistory();
  res.json({ 
    success: true, 
    message: 'Historial de trazas limpiado' 
  });
});

module.exports = router;
