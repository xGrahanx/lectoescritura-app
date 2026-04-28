/**
 * ia.js - Rutas de integración con Google Gemini
 * Contenido adaptado para estudiantes de 1er a 3er grado
 */

const express = require('express');
const axios   = require('axios');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

const CONTEXTO_GRADO = `Estás trabajando con niños de 1er a 3er grado de primaria (6 a 9 años) en Venezuela.
Usa vocabulario muy sencillo, oraciones cortas y ejemplos del mundo cotidiano del niño (animales, familia, naturaleza, juegos).
El lenguaje debe ser amigable, motivador y apropiado para su edad.`;

const CONTEXTO_DOCENTE = `Eres un asistente educativo especializado para docentes de Venezuela que trabajan con niños de 1er a 3er grado (6-9 años).
Responde de forma profesional, clara y práctica en español.`;

const llamarGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const { data } = await axios.post(
      `${GEMINI_URL}?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 30000 }
    );
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    if (error.response?.status === 429) throw new Error('RATE_LIMIT');
    throw error;
  }
};

// ─── POST /api/ia/evaluar-lectura ─────────────────────────────────────────────
router.post('/evaluar-lectura', async (req, res) => {
  const { texto, preguntas, respuestas } = req.body;
  if (!texto || !preguntas || !respuestas) {
    return res.status(400).json({ mensaje: 'Faltan datos para evaluar.' });
  }

  try {
    const preguntasTexto = preguntas.map((p, i) => {
      const respuesta = respuestas[p.id];
      if (p.tipo === 'opcion_multiple') {
        return `Pregunta ${i + 1}: ${p.pregunta}\nRespuesta correcta: ${p.opciones[p.respuestaCorrecta]}\nRespuesta del niño: ${p.opciones[respuesta] || 'Sin responder'}`;
      }
      if (p.tipo === 'verdadero_falso') {
        return `Pregunta ${i + 1}: ${p.pregunta}\nRespuesta correcta: ${p.respuestaCorrecta ? 'Verdadero' : 'Falso'}\nRespuesta del niño: ${respuesta === true ? 'Verdadero' : respuesta === false ? 'Falso' : 'Sin responder'}`;
      }
      return `Pregunta ${i + 1} (abierta): ${p.pregunta}\nRespuesta del niño: ${respuesta || 'Sin responder'}`;
    }).join('\n\n');

    const prompt = `${CONTEXTO_GRADO}
Evalúa las respuestas de comprensión lectora del texto: "${texto.titulo}".
Semilla: ${Math.random()}.

${preguntasTexto}

Responde ÚNICAMENTE con JSON válido:
{
  "puntaje": número entre 0 y 100,
  "retroalimentacion": "mensaje muy motivador y sencillo para un niño de 6-9 años, máximo 2 oraciones cortas",
  "errores": ["correcciones simples y amables si las hay"],
  "recomendacion": "sugerencia breve y alentadora para mejorar"
}`;

    const texto_respuesta = await llamarGemini(prompt);
    const jsonMatch = texto_respuesta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Respuesta de IA inválida');
    res.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Error en evaluar-lectura:', error);
    if (error.message === 'RATE_LIMIT') return res.status(429).json({ mensaje: 'La IA está ocupada. Espera unos segundos e intenta de nuevo.' });
    res.status(500).json({ mensaje: 'Error al evaluar con IA. Intenta de nuevo.' });
  }
});

// ─── POST /api/ia/evaluar-escritura ──────────────────────────────────────────
router.post('/evaluar-escritura', async (req, res) => {
  const { ejercicio, respuesta } = req.body;
  if (!ejercicio || !respuesta) {
    return res.status(400).json({ mensaje: 'Faltan datos para evaluar.' });
  }

  try {
    const prompt = `${CONTEXTO_GRADO}
Evalúa la escritura de un niño de 1er a 3er grado. Semilla: ${Math.random()}.
Sé muy comprensivo — es normal que cometan errores a esta edad.

Tipo de ejercicio: ${ejercicio.tipo}
${ejercicio.contenido ? `Texto original: ${ejercicio.contenido}` : ''}
Lo que escribió el niño: "${respuesta}"

Responde ÚNICAMENTE con JSON válido:
{
  "puntaje": número entre 0 y 100,
  "erroresOrtograficos": ["máximo 3 errores, explicados de forma simple"],
  "erroresGramaticales": ["máximo 2 errores simples"],
  "retroalimentacion": "mensaje muy motivador para un niño, máximo 2 oraciones cortas y positivas",
  "palabrasCorrectas": número,
  "totalPalabras": número
}`;

    const texto_respuesta = await llamarGemini(prompt);
    const jsonMatch = texto_respuesta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Respuesta de IA inválida');
    res.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Error en evaluar-escritura:', error);
    if (error.message === 'RATE_LIMIT') return res.status(429).json({ mensaje: 'La IA está ocupada. Espera unos segundos e intenta de nuevo.' });
    res.status(500).json({ mensaje: 'Error al evaluar escritura con IA.' });
  }
});

// ─── POST /api/ia/generar-ejercicio ──────────────────────────────────────────
router.post('/generar-ejercicio', async (req, res) => {
  const { tipo } = req.body;
  const tiposValidos = ['sinonimos', 'oraciones', 'acentuacion', 'comprension'];
  if (!tipo || !tiposValidos.includes(tipo)) {
    return res.status(400).json({ mensaje: 'Tipo de ejercicio inválido.' });
  }

  try {
    const semilla = Math.random();
    const prompts = {
      sinonimos: `${CONTEXTO_GRADO}
Genera un ejercicio de sinónimos para niños de 1er a 3er grado. Semilla: ${semilla}.
Usa palabras MUY SENCILLAS y cotidianas (animales, colores, acciones del día a día).
NO repitas siempre las mismas palabras. Varía cada vez.
Responde ÚNICAMENTE con JSON:
{
  "titulo": "¿Cuál palabra significa lo mismo?",
  "instrucciones": "Elige la palabra que significa lo mismo",
  "preguntas": [
    { "id": 1, "palabra": "contento", "opciones": ["triste", "feliz", "enojado", "dormido"], "correcta": 1 },
    { "id": 2, "palabra": "...", "opciones": ["...","...","...","..."], "correcta": 0 },
    { "id": 3, "palabra": "...", "opciones": ["...","...","...","..."], "correcta": 0 },
    { "id": 4, "palabra": "...", "opciones": ["...","...","...","..."], "correcta": 0 },
    { "id": 5, "palabra": "...", "opciones": ["...","...","...","..."], "correcta": 0 }
  ]
}`,
      oraciones: `${CONTEXTO_GRADO}
Genera un ejercicio de ordenar oraciones para niños de 1er a 3er grado. Semilla: ${semilla}.
Las oraciones deben ser MUY CORTAS (3-5 palabras) y sobre temas que conocen los niños.
Responde ÚNICAMENTE con JSON:
{
  "titulo": "Ordena las palabras",
  "instrucciones": "Ordena las palabras para formar una oración",
  "preguntas": [
    { "id": 1, "palabras": ["el", "perro", "corre"], "correcta": "El perro corre" },
    { "id": 2, "palabras": ["...","...","..."], "correcta": "..." },
    { "id": 3, "palabras": ["...","...","..."], "correcta": "..." },
    { "id": 4, "palabras": ["...","...","...","..."], "correcta": "..." }
  ]
}`,
      acentuacion: `${CONTEXTO_GRADO}
Genera un ejercicio de tildes para niños de 2do o 3er grado. Semilla: ${semilla}.
Usa palabras simples y conocidas. Varía las palabras cada vez.
Responde ÚNICAMENTE con JSON:
{
  "titulo": "¿Lleva tilde?",
  "instrucciones": "Indica si la palabra lleva tilde o no",
  "preguntas": [
    { "id": 1, "palabra": "mamá", "llevaTilde": true, "explicacion": "La última sílaba suena fuerte" },
    { "id": 2, "palabra": "casa", "llevaTilde": false, "explicacion": "No necesita tilde" },
    { "id": 3, "palabra": "...", "llevaTilde": true, "explicacion": "..." },
    { "id": 4, "palabra": "...", "llevaTilde": false, "explicacion": "..." },
    { "id": 5, "palabra": "...", "llevaTilde": true, "explicacion": "..." }
  ]
}`,
      comprension: `${CONTEXTO_GRADO}
Genera un texto MUY CORTO (3-4 oraciones simples) y 3 preguntas para niños de 1er a 3er grado. Semilla: ${semilla}.
El texto debe ser sobre animales, naturaleza, familia o situaciones cotidianas. Varía el tema cada vez.
Responde ÚNICAMENTE con JSON:
{
  "titulo": "Lee y responde",
  "texto": "texto corto de 3-4 oraciones muy simples",
  "preguntas": [
    { "id": 1, "tipo": "opcion_multiple", "pregunta": "pregunta simple sobre el texto", "opciones": ["a","b","c","d"], "correcta": 0 },
    { "id": 2, "tipo": "verdadero_falso", "pregunta": "afirmación simple sobre el texto", "correcta": true },
    { "id": 3, "tipo": "respuesta_abierta", "pregunta": "pregunta sencilla que el niño pueda responder con pocas palabras" }
  ]
}`,
    };

    const texto_respuesta = await llamarGemini(prompts[tipo]);
    const jsonMatch = texto_respuesta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Respuesta de IA inválida');
    res.json({ tipo, ...JSON.parse(jsonMatch[0]) });
  } catch (error) {
    console.error('Error en generar-ejercicio:', error);
    if (error.message === 'RATE_LIMIT') return res.status(429).json({ mensaje: 'La IA está ocupada. Espera unos segundos e intenta de nuevo.' });
    res.status(500).json({ mensaje: 'Error al generar ejercicio con IA.' });
  }
});

// ─── POST /api/ia/generar-preguntas ──────────────────────────────────────────
router.post('/generar-preguntas', async (req, res) => {
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ mensaje: 'El texto es requerido.' });

  try {
    const prompt = `${CONTEXTO_GRADO}
Basándote ÚNICAMENTE en el siguiente texto, genera 3 preguntas de comprensión lectora apropiadas para niños de 1er a 3er grado.
Las preguntas deben ser simples y directas. Semilla: ${Math.random()}.

TEXTO: "${texto.contenido || texto}"

Responde ÚNICAMENTE con JSON válido:
{
  "preguntas": [
    { "id": 1, "tipo": "opcion_multiple", "pregunta": "pregunta simple sobre el texto", "opciones": ["opción a","opción b","opción c","opción d"], "respuestaCorrecta": 0 },
    { "id": 2, "tipo": "verdadero_falso", "pregunta": "afirmación simple sobre el texto", "respuestaCorrecta": true },
    { "id": 3, "tipo": "respuesta_abierta", "pregunta": "pregunta sencilla que el niño pueda responder con pocas palabras" }
  ]
}`;

    const texto_respuesta = await llamarGemini(prompt);
    const jsonMatch = texto_respuesta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Respuesta de IA inválida');
    res.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Error en generar-preguntas:', error);
    if (error.message === 'RATE_LIMIT') return res.status(429).json({ mensaje: 'La IA está ocupada. Espera unos segundos.' });
    res.status(500).json({ mensaje: 'Error al generar preguntas.' });
  }
});

// ─── POST /api/ia/sugerir-tarea ───────────────────────────────────────────────
router.post('/sugerir-tarea', async (req, res) => {
  const { estudianteId } = req.body;
  if (!estudianteId) return res.status(400).json({ mensaje: 'estudianteId es requerido.' });

  try {
    const [estudiante, progreso, resultadosLectura, resultadosEscritura] = await Promise.all([
      prisma.usuario.findUnique({ where: { id: parseInt(estudianteId) }, select: { nombre: true, grado: true } }),
      prisma.progreso_diario.findMany({ where: { estudiante_id: parseInt(estudianteId) }, orderBy: { fecha: 'desc' }, take: 7 }),
      prisma.resultados_lectura.findMany({ where: { estudiante_id: parseInt(estudianteId) }, orderBy: { creado_en: 'desc' }, take: 5 }),
      prisma.resultados_escritura.findMany({ where: { estudiante_id: parseInt(estudianteId) }, orderBy: { creado_en: 'desc' }, take: 5 }),
    ]);

    if (!estudiante) return res.status(404).json({ mensaje: 'Estudiante no encontrado.' });

    const promedioLectura = resultadosLectura.length
      ? Math.round(resultadosLectura.reduce((s, r) => s + (r.puntaje || 0), 0) / resultadosLectura.length) : null;
    const promedioEscritura = resultadosEscritura.length
      ? Math.round(resultadosEscritura.reduce((s, r) => s + (r.puntaje || 0), 0) / resultadosEscritura.length) : null;

    const prompt = `${CONTEXTO_DOCENTE}
Eres un asistente para docentes de Venezuela. Sugiere 3 tareas apropiadas para este niño. Semilla: ${Math.random()}.

Estudiante: ${estudiante.nombre}, Grado: ${estudiante.grado || '1er a 3er grado'}
Promedio lectura: ${promedioLectura !== null ? promedioLectura + '%' : 'Sin datos'}
Promedio escritura: ${promedioEscritura !== null ? promedioEscritura + '%' : 'Sin datos'}
Días activo esta semana: ${progreso.length}

Responde ÚNICAMENTE con JSON:
{
  "resumen": "análisis breve del rendimiento del estudiante en 2 oraciones",
  "sugerencias": [
    {
      "titulo": "título de la tarea",
      "tipo": "lectura" o "escritura" o "especial" o "ia",
      "descripcion": "descripción clara de la actividad para el estudiante",
      "razon": "justificación pedagógica de por qué esta tarea beneficia al estudiante"
    }
  ]
}`;

    const texto_respuesta = await llamarGemini(prompt);
    const jsonMatch = texto_respuesta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Respuesta de IA inválida');
    res.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Error en sugerir-tarea:', error);
    if (error.message === 'RATE_LIMIT') return res.status(429).json({ mensaje: 'La IA está ocupada. Espera unos segundos e intenta de nuevo.' });
    res.status(500).json({ mensaje: 'Error al generar sugerencias con IA.' });
  }
});

// ─── POST /api/ia/chat-docente ────────────────────────────────────────────────
router.post('/chat-docente', async (req, res) => {
  const { mensaje } = req.body;
  if (!mensaje) return res.status(400).json({ mensaje: 'El mensaje es requerido.' });

  try {
    const prompt = `${CONTEXTO_DOCENTE}
Ayuda con estrategias pedagógicas, actividades y ejercicios apropiados para niños de 1er a 3er grado.
Responde de forma concisa y práctica. Máximo 4 oraciones. Semilla: ${Math.random()}.

Consulta del docente: ${mensaje}`;

    const respuesta = await llamarGemini(prompt);
    res.json({ respuesta });
  } catch (error) {
    console.error('Error en chat-docente:', error);
    if (error.message === 'RATE_LIMIT') return res.status(429).json({ mensaje: 'La IA está ocupada. Espera unos segundos e intenta de nuevo.' });
    res.status(500).json({ mensaje: 'Error al procesar la consulta.' });
  }
});

// ─── POST /api/ia/guardar-resultado ──────────────────────────────────────────
router.post('/guardar-resultado', async (req, res) => {
  const { estudiante_id, tipo, preguntas, respuestas, puntaje, tarea_id } = req.body;
  console.log('📝 Guardando resultado IA:', { estudiante_id, tipo, puntaje, tarea_id });
  
  if (!estudiante_id || !tipo) return res.status(400).json({ mensaje: 'Faltan datos.' });

  try {
    // Guardar resultado del ejercicio IA
    const resultado = await prisma.ejercicios_ia.create({
      data: {
        estudiante_id: parseInt(estudiante_id),
        tipo,
        preguntas: preguntas || [],
        respuestas: respuestas || {},
        puntaje: puntaje || 0,
      },
    });
    console.log('✅ Resultado guardado:', resultado.id);

    // Actualizar progreso diario del estudiante
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const progresoHoy = await prisma.progreso_diario.findFirst({
      where: { estudiante_id: parseInt(estudiante_id), fecha: hoy },
    });

    if (progresoHoy) {
      // Actualizar progreso existente
      const nuevoTotal = progresoHoy.ejercicios_completados + 1;
      const nuevoPuntaje = Math.round(
        ((progresoHoy.puntaje_promedio * progresoHoy.ejercicios_completados) + puntaje) / nuevoTotal
      );
      
      await prisma.progreso_diario.update({
        where: { id: progresoHoy.id },
        data: {
          ejercicios_completados: nuevoTotal,
          puntaje_promedio: nuevoPuntaje,
        },
      });
      console.log('✅ Progreso actualizado:', { nuevoTotal, nuevoPuntaje });
    } else {
      // Crear nuevo registro de progreso
      await prisma.progreso_diario.create({
        data: {
          estudiante_id: parseInt(estudiante_id),
          fecha: hoy,
          puntaje_promedio: puntaje || 0,
          ejercicios_completados: 1,
          racha_dias: 1,
        },
      });
      console.log('✅ Progreso creado para hoy');
    }

    // Marcar tarea como completada si viene de una tarea
    if (tarea_id) {
      console.log('🎯 Intentando marcar tarea como completada:', tarea_id);
      const tareaActualizada = await prisma.tareas.update({
        where: { id: parseInt(tarea_id) },
        data: { estado: 'completada' },
      });
      console.log('✅ Tarea marcada como completada:', tareaActualizada);
    } else {
      console.log('⚠️ No se proporcionó tarea_id');
    }

    res.status(201).json({ mensaje: 'Resultado guardado y progreso actualizado.', resultado });
  } catch (error) {
    console.error('❌ Error al guardar resultado IA:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.', error: error.message });
  }
});

module.exports = router;
