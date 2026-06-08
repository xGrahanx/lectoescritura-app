/**
 * auditoria.js - Rutas para consultar la bitácora de auditoría
 * 
 * Solo accesible para administradores
 * 
 * GET /api/auditoria              - Obtener todos los registros de auditoría (con filtros)
 * GET /api/auditoria/pdf          - Exportar auditoría a PDF
 * GET /api/auditoria/stats/resumen - Obtener estadísticas de auditoría
 * GET /api/auditoria/:id          - Obtener un registro específico
 * GET /api/auditoria/usuario/:id  - Obtener auditoría de un usuario específico
 * GET /api/auditoria/tabla/:tabla - Obtener auditoría de una tabla específica
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/auditoria ──────────────────────────────────────────────────────
// Obtener registros de auditoría con filtros opcionales
router.get('/', async (req, res) => {
  const { tabla, operacion, usuario_id, fecha_desde, fecha_hasta, limit = 100, offset = 0 } = req.query;

  try {
    const where = {};
    
    if (tabla) where.tabla = tabla;
    if (operacion) where.operacion = operacion;
    if (usuario_id) where.usuario_id = parseInt(usuario_id);
    
    if (fecha_desde || fecha_hasta) {
      where.creado_en = {};
      if (fecha_desde) where.creado_en.gte = new Date(fecha_desde);
      if (fecha_hasta) where.creado_en.lte = new Date(fecha_hasta);
    }

    const [registros, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              rol: true,
            },
          },
        },
        orderBy: { creado_en: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.auditoria.count({ where }),
    ]);

    res.json({
      registros,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Error al obtener auditoría:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/auditoria/pdf ──────────────────────────────────────────────────
// Exportar registros de auditoría a PDF
// IMPORTANTE: Esta ruta debe ir ANTES de /:id para que Express no la interprete como un parámetro
router.get('/pdf', async (req, res) => {
  const { tabla, operacion, usuario_id, fecha_desde, fecha_hasta } = req.query;

  try {
    const where = {};
    
    if (tabla) where.tabla = tabla;
    if (operacion) where.operacion = operacion;
    if (usuario_id) where.usuario_id = parseInt(usuario_id);
    
    if (fecha_desde || fecha_hasta) {
      where.creado_en = {};
      if (fecha_desde) where.creado_en.gte = new Date(fecha_desde);
      if (fecha_hasta) where.creado_en.lte = new Date(fecha_hasta);
    }

    const registros = await prisma.auditoria.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            rol: true,
          },
        },
      },
      orderBy: { creado_en: 'desc' },
      take: 300,
    });

    // Obtener estadísticas
    const [totalRegistros, registrosPorTabla, registrosPorOperacion] = await Promise.all([
      prisma.auditoria.count({ where }),
      prisma.auditoria.groupBy({
        by: ['tabla'],
        where,
        _count: { id: true },
      }),
      prisma.auditoria.groupBy({
        by: ['operacion'],
        where,
        _count: { id: true },
      }),
    ]);

    // Crear el PDF
    const doc = new PDFDocument({ 
      margin: 0,
      size: 'A4',
      info: {
        Title: 'Reporte de Auditoría',
        Author: 'Sistema Lectoescritura',
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=auditoria-${new Date().toISOString().split('T')[0]}.pdf`);

    doc.pipe(res);

    // Colores
    const COLORS = {
      primary: '#1A237E',
      secondary: '#4A90D9',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      dark: '#212121',
      gray: '#757575',
      lightGray: '#E0E0E0',
      white: '#FFFFFF',
    };

    // Nombres legibles
    const TABLAS_NOMBRES = {
      usuarios: 'Usuarios',
      tareas: 'Tareas',
      grupos: 'Grupos',
      grupos_estudiantes: 'Grupos - Estudiantes',
      alertas: 'Alertas',
      resultados_lectura: 'Resultados Lectura',
      resultados_escritura: 'Resultados Escritura',
      ejercicios_ia: 'Ejercicios IA',
      progreso_diario: 'Progreso Diario',
      textos: 'Textos',
      ejercicios_escritura: 'Ejercicios Escritura',
      configuracion_sistema: 'Configuración',
    };

    const OPERACIONES_LABELS = {
      INSERT: 'Creación',
      UPDATE: 'Modificación',
      DELETE: 'Eliminación',
    };

    // ─── ENCABEZADO ───────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(COLORS.primary);
    doc.rect(0, 80, doc.page.width, 10).fill(COLORS.secondary);

    doc.fontSize(28)
       .fillColor(COLORS.white)
       .font('Helvetica-Bold')
       .text('Reporte de Auditoria', 50, 25, { align: 'center' });

    doc.fontSize(11)
       .fillColor('#B3E5FC')
       .font('Helvetica')
       .text('Escuela Nacional Jose Gabriel Alviares', 50, 55, { align: 'center' });

    doc.fontSize(10)
       .fillColor(COLORS.gray)
       .font('Helvetica')
       .text(
         `Generado el ${new Date().toLocaleDateString('es-ES', { 
           day: '2-digit', 
           month: 'long', 
           year: 'numeric',
           hour: '2-digit',
           minute: '2-digit',
         })}`,
         50, 105,
         { align: 'center' }
       );

    let y = 140;

    // ─── TARJETAS DE ESTADISTICAS ─────────────────────────────────────────────
    doc.fontSize(14)
       .fillColor(COLORS.primary)
       .font('Helvetica-Bold')
       .text('Resumen General', 50, y);
    
    y += 30;

    // Calcular estadisticas
    const stats = {
      INSERT: registrosPorOperacion.find(o => o.operacion === 'INSERT')?._count.id || 0,
      UPDATE: registrosPorOperacion.find(o => o.operacion === 'UPDATE')?._count.id || 0,
      DELETE: registrosPorOperacion.find(o => o.operacion === 'DELETE')?._count.id || 0,
    };

    // Tarjetas en fila
    const cardW = 125;
    const cardH = 50;
    const gap = 10;

    // Total
    doc.rect(50, y, cardW, cardH).fill(COLORS.primary);
    doc.fontSize(10).fillColor(COLORS.white).font('Helvetica').text('TOTAL', 50, y + 8, { width: cardW, align: 'center' });
    doc.fontSize(20).fillColor(COLORS.white).font('Helvetica-Bold').text(`${totalRegistros}`, 50, y + 22, { width: cardW, align: 'center' });

    // Creaciones
    doc.rect(50 + cardW + gap, y, cardW, cardH).fill('#E8F5E9');
    doc.rect(50 + cardW + gap, y, 4, cardH).fill(COLORS.success);
    doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica').text('Creaciones', 50 + cardW + gap + 10, y + 8);
    doc.fontSize(20).fillColor(COLORS.success).font('Helvetica-Bold').text(`${stats.INSERT}`, 50 + cardW + gap + 10, y + 22);

    // Modificaciones
    doc.rect(50 + (cardW + gap) * 2, y, cardW, cardH).fill('#FFF8E1');
    doc.rect(50 + (cardW + gap) * 2, y, 4, cardH).fill(COLORS.warning);
    doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica').text('Modificaciones', 50 + (cardW + gap) * 2 + 10, y + 8);
    doc.fontSize(20).fillColor(COLORS.warning).font('Helvetica-Bold').text(`${stats.UPDATE}`, 50 + (cardW + gap) * 2 + 10, y + 22);

    // Eliminaciones
    doc.rect(50 + (cardW + gap) * 3, y, cardW, cardH).fill('#FFEBEE');
    doc.rect(50 + (cardW + gap) * 3, y, 4, cardH).fill(COLORS.error);
    doc.fontSize(10).fillColor(COLORS.gray).font('Helvetica').text('Eliminaciones', 50 + (cardW + gap) * 3 + 10, y + 8);
    doc.fontSize(20).fillColor(COLORS.error).font('Helvetica-Bold').text(`${stats.DELETE}`, 50 + (cardW + gap) * 3 + 10, y + 22);

    y += cardH + 25;

    // ─── ACTIVIDAD POR MODULO ─────────────────────────────────────────────────
    doc.fontSize(14)
       .fillColor(COLORS.primary)
       .font('Helvetica-Bold')
       .text('Actividad por Modulo', 50, y);
    
    y += 25;

    const topTablas = registrosPorTabla.slice(0, 5);

    topTablas.forEach((item, i) => {
      const name = TABLAS_NOMBRES[item.tabla] || item.tabla;
      const pct = Math.round((item._count.id / totalRegistros) * 100);
      const barColor = i === 0 ? COLORS.primary : i === 1 ? COLORS.secondary : '#9C27B0';
      
      // Fondo de la barra (gris claro)
      doc.rect(50, y, 350, 20).fill('#F0F0F0');
      
      // Barra de progreso (ancho proporcional al porcentaje)
      const barFillWidth = Math.max(30, (pct / 100) * 350);
      doc.rect(50, y, barFillWidth, 20).fill(barColor);
      
      // Nombre del módulo a la izquierda
      doc.fontSize(9).fillColor(COLORS.dark).font('Helvetica-Bold')
         .text(name.substring(0, 18), 55, y + 5);
      
      // Cantidad y porcentaje a la derecha
      doc.fontSize(9).fillColor(pct > 30 ? COLORS.white : COLORS.dark).font('Helvetica')
         .text(`${item._count.id} (${pct}%)`, 320, y + 5);
      
      y += 26;
    });

    y += 15;

    // ─── FILTROS APLICADOS ────────────────────────────────────────────────────
    if (tabla || operacion || usuario_id || fecha_desde || fecha_hasta) {
      doc.fontSize(14)
         .fillColor(COLORS.primary)
         .font('Helvetica-Bold')
         .text('Filtros Aplicados', 50, y);
      
      y += 20;

      doc.rect(50, y, 450, 30).fill('#E3F2FD');
      
      let filtros = [];
      if (tabla) filtros.push(`Tabla: ${TABLAS_NOMBRES[tabla] || tabla}`);
      if (operacion) filtros.push(`Operacion: ${OPERACIONES_LABELS[operacion]}`);
      if (usuario_id) filtros.push(`Usuario: ${usuario_id}`);
      if (fecha_desde) filtros.push(`Desde: ${new Date(fecha_desde).toLocaleDateString('es-ES')}`);
      if (fecha_hasta) filtros.push(`Hasta: ${new Date(fecha_hasta).toLocaleDateString('es-ES')}`);

      doc.fontSize(10).fillColor(COLORS.dark).font('Helvetica')
         .text(filtros.join('  |  '), 60, y + 10);

      y += 45;
    }

    // ─── DETALLE DE REGISTROS ─────────────────────────────────────────────────
    doc.fontSize(14)
       .fillColor(COLORS.primary)
       .font('Helvetica-Bold')
       .text('Detalle de Registros', 50, y);
    
    y += 20;

    // Función para extraer resumen
    const extraerResumen = (registro) => {
      const datos = registro.datos_nuevos || registro.datos_anteriores;
      if (!datos) return '-';
      switch (registro.tabla) {
        case 'usuarios': return datos.nombre ? `${datos.nombre} ${datos.apellido || ''}` : '-';
        case 'tareas': return datos.titulo ? `"${datos.titulo}"` : '-';
        case 'grupos': return datos.nombre ? `"${datos.nombre}"` : '-';
        case 'textos': return datos.titulo ? `"${datos.titulo}"` : '-';
        default: return '-';
      }
    };

    // Tabla de registros
    const col1 = 50, col2 = 130, col3 = 250, col4 = 350, col5 = 430;
    
    // Encabezado de tabla
    doc.rect(50, y, 495, 22).fill(COLORS.primary);
    doc.fontSize(9).fillColor(COLORS.white).font('Helvetica-Bold');
    doc.text('#', col1, y + 6, { width: 30 });
    doc.text('Fecha', col2, y + 6, { width: 110 });
    doc.text('Módulo', col3, y + 6, { width: 90 });
    doc.text('Operación', col4, y + 6, { width: 70 });
    doc.text('Usuario', col5, y + 6, { width: 70 });
    y += 22;

    // Filas
    registros.slice(0, 100).forEach((registro, index) => {
      // Nueva página si es necesario
      if (y > 750) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 30).fill(COLORS.primary);
        doc.fontSize(10).fillColor(COLORS.white).font('Helvetica-Bold')
           .text('Reporte de Auditoría - Continuación', 50, 10, { align: 'center' });
        y = 50;
        
        // Repetir encabezado
        doc.rect(50, y, 495, 22).fill(COLORS.primary);
        doc.fontSize(9).fillColor(COLORS.white).font('Helvetica-Bold');
        doc.text('#', col1, y + 6, { width: 30 });
        doc.text('Fecha', col2, y + 6, { width: 110 });
        doc.text('Módulo', col3, y + 6, { width: 90 });
        doc.text('Operación', col4, y + 6, { width: 70 });
        doc.text('Usuario', col5, y + 6, { width: 70 });
        y += 22;
      }

      const bgColor = index % 2 === 0 ? '#FAFAFA' : '#FFFFFF';
      const operacionColor = registro.operacion === 'INSERT' ? COLORS.success : 
                             registro.operacion === 'UPDATE' ? COLORS.warning : COLORS.error;
      
      doc.rect(50, y, 495, 20).fill(bgColor);
      
      // Número
      doc.fontSize(8).fillColor(COLORS.gray).font('Helvetica').text(`${index + 1}`, col1, y + 5, { width: 30 });
      
      // Fecha
      const fecha = new Date(registro.creado_en).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      doc.fontSize(8).fillColor(COLORS.dark).font('Helvetica').text(fecha, col2, y + 5, { width: 110 });
      
      // Módulo
      doc.fontSize(8).fillColor(COLORS.secondary).font('Helvetica')
         .text(TABLAS_NOMBRES[registro.tabla] || registro.tabla, col3, y + 5, { width: 90 });
      
      // Operación con color
      doc.rect(col4, y + 3, 65, 14).fill(operacionColor);
      doc.fontSize(8).fillColor(COLORS.white).font('Helvetica-Bold')
         .text(OPERACIONES_LABELS[registro.operacion] || registro.operacion, col4, y + 5, { width: 65, align: 'center' });
      
      // Usuario
      if (registro.usuario) {
        doc.fontSize(8).fillColor(COLORS.gray).font('Helvetica')
           .text(`${registro.usuario.nombre} ${registro.usuario.apellido || ''}`.substring(0, 20), col5, y + 5, { width: 100 });
      }

      y += 20;
    });

    // ─── PIE DE PÁGINA ────────────────────────────────────────────────────────
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(COLORS.primary);
    doc.fontSize(9).fillColor('#B3E5FC').font('Helvetica')
       .text('Sistema de Lectoescritura - Reporte generado automáticamente', 50, doc.page.height - 28, { align: 'center' });
    doc.fontSize(8).fillColor('#8CB8E8')
       .text(`Registros: ${registros.length} | ${new Date().toLocaleDateString('es-ES')}`, 50, doc.page.height - 15, { align: 'center' });

    doc.end();
    console.log(`✅ PDF de auditoría generado: ${registros.length} registros`);
  } catch (error) {
    console.error('❌ Error al generar PDF de auditoría:', error);
    res.status(500).json({ mensaje: 'Error al generar el reporte PDF' });
  }
});

// ─── GET /api/auditoria/stats/resumen ─────────────────────────────────────────
// IMPORTANTE: Esta ruta debe ir ANTES de /:id
router.get('/stats/resumen', async (req, res) => {
  try {
    const [
      totalRegistros,
      registrosPorTabla,
      registrosPorOperacion,
      registrosRecientes,
    ] = await Promise.all([
      prisma.auditoria.count(),
      prisma.$queryRaw`
        SELECT tabla, COUNT(*)::int as total
        FROM auditoria
        GROUP BY tabla
        ORDER BY total DESC
      `,
      prisma.$queryRaw`
        SELECT operacion, COUNT(*)::int as total
        FROM auditoria
        GROUP BY operacion
      `,
      prisma.auditoria.findMany({
        take: 10,
        orderBy: { creado_en: 'desc' },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              rol: true,
            },
          },
        },
      }),
    ]);

    res.json({
      totalRegistros,
      registrosPorTabla,
      registrosPorOperacion,
      registrosRecientes,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de auditoría:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/auditoria/usuario/:id ──────────────────────────────────────────
// IMPORTANTE: Esta ruta debe ir ANTES de /:id
router.get('/usuario/:id', async (req, res) => {
  const usuario_id = parseInt(req.params.id);
  if (isNaN(usuario_id)) return res.status(400).json({ mensaje: 'ID inválido' });

  const { limit = 50, offset = 0 } = req.query;

  try {
    const [registros, total] = await Promise.all([
      prisma.auditoria.findMany({
        where: { usuario_id },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              rol: true,
            },
          },
        },
        orderBy: { creado_en: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.auditoria.count({ where: { usuario_id } }),
    ]);

    res.json({
      registros,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Error al obtener auditoría del usuario:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/auditoria/tabla/:tabla ─────────────────────────────────────────
// IMPORTANTE: Esta ruta debe ir ANTES de /:id
router.get('/tabla/:tabla', async (req, res) => {
  const { tabla } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const [registros, total] = await Promise.all([
      prisma.auditoria.findMany({
        where: { tabla },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              rol: true,
            },
          },
        },
        orderBy: { creado_en: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.auditoria.count({ where: { tabla } }),
    ]);

    res.json({
      registros,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Error al obtener auditoría de la tabla:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// ─── GET /api/auditoria/:id ──────────────────────────────────────────────────
// IMPORTANTE: Esta ruta con parámetro debe ir AL FINAL
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido' });

  try {
    const registro = await prisma.auditoria.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            rol: true,
          },
        },
      },
    });

    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado' });

    res.json(registro);
  } catch (error) {
    console.error('Error al obtener registro de auditoría:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
