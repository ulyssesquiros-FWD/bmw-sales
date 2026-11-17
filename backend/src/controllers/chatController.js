const { pool } = require('../config/db');
const empresaModel = require('../models/empresaModel');
const ragService = require('../services/ragService');
const deepseekService = require('../services/deepseekService');
const localEmbeddingService = require('../services/localEmbeddingService');
const visionService = require('../services/visionService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/chat/historial
 * Lista el historial de conversación RAG aislado exclusivamente para req.user.empresa_id.
 */
const getHistorial = asyncHandler(async (req, res) => {
  const sessionId = req.query.session_id ? String(req.query.session_id).trim() : null;
  const params = [req.user.empresa_id];
  let whereExtra = '';

  if (sessionId) {
    whereExtra = 'AND m.session_id = ?';
    params.push(sessionId);
  }

  const [rows] = await pool.execute(
    `SELECT
       m.id_mensaje,
       m.id_empresa,
       m.id_usuario,
       u.nombre AS usuario_nombre,
       m.session_id,
       m.rol_mensaje,
       m.contenido,
       m.citas_json,
       m.tokens_entrada,
       m.tokens_salida,
       m.modelo_usado,
       m.abortado,
       m.created_at
     FROM mensajes m
     LEFT JOIN usuarios u ON u.id_usuario = m.id_usuario
     WHERE m.id_empresa = ? ${whereExtra}
     ORDER BY m.id_mensaje ASC
     LIMIT 100`,
    params
  );

  const parsed = rows.map((row) => {
    let citas = row.citas_json;
    if (typeof citas === 'string') {
      try {
        citas = JSON.parse(citas);
      } catch {
        citas = [];
      }
    }
    return {
      ...row,
      citas_json: Array.isArray(citas) ? citas : []
    };
  });

  return res.status(200).json({
    ok: true,
    data: parsed
  });
});

/**
 * DELETE /api/chat/historial
 * Limpia el historial de mensajes únicamente de la empresa del usuario actual.
 */
const clearHistorial = asyncHandler(async (req, res) => {
  await pool.execute('DELETE FROM mensajes WHERE id_empresa = ?', [req.user.empresa_id]);
  return res.status(200).json({
    ok: true,
    message: 'Historial de chat de la empresa eliminado correctamente.'
  });
});

/**
 * POST /api/chat/stream
 * Streaming SSE multiempresa con:
 * - Embeddings locales multilingual-e5-small (384 dims) en MySQL
 * - Top-6 fragmentos aislados por id_empresa
 * - Generación con DeepSeek (`deepseek-flash`)
 * - Control mensual de cuotas (HTTP 429) y aborto en desconexión
 */
async function streamChat(req, res, next) {
  try {
    const idEmpresa = req.user.empresa_id;
    const idUsuario = req.user.id_usuario;
    const question = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const sessionId = typeof req.body?.session_id === 'string' && req.body.session_id.trim()
      ? req.body.session_id.trim().slice(0, 64)
      : 'default';

    if (!question) {
      return res.status(400).json({
        ok: false,
        error: 'El campo "message" es obligatorio.'
      });
    }

    const empresa = await empresaModel.getEmpresaWithStats(idEmpresa);
    if (!empresa) {
      return res.status(404).json({ ok: false, error: 'Empresa no encontrada.' });
    }

    if (Number(empresa.preguntas_mes_actual) >= Number(empresa.max_preguntas_mes)) {
      return res.status(429).json({
        ok: false,
        error: `Límite mensual de preguntas alcanzado (${empresa.preguntas_mes_actual}/${empresa.max_preguntas_mes}) para el plan ${empresa.plan_nombre}.`
      });
    }

    await empresaModel.incrementMonthlyQuestions(idEmpresa);
    await pool.execute(
      `INSERT INTO mensajes (id_empresa, id_usuario, session_id, rol_mensaje, contenido)
       VALUES (?, ?, ?, 'user', ?)`,
      [idEmpresa, idUsuario, sessionId, question]
    );

    const [recentHistory] = await pool.execute(
      `SELECT rol_mensaje, contenido
       FROM mensajes
       WHERE id_empresa = ? AND session_id = ?
       ORDER BY id_mensaje DESC
       LIMIT 8`,
      [idEmpresa, sessionId]
    );

    const retrieval = await ragService.retrieveRelevantChunks({
      id_empresa: idEmpresa,
      queryText: question,
      topK: ragService.TOP_K
    });

    const retrievedChunks = retrieval.chunks || [];
    const citations = retrievedChunks.map((c) => ({
      id_documento: c.id_documento,
      nombre_archivo: c.nombre_archivo,
      indice_fragmento: c.indice_fragmento,
      similitud: c.similitud,
      extracto: String(c.contenido || '').slice(0, 220)
    }));

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    const abortController = new AbortController();
    let streamFinished = false;
    let clientDisconnected = false;
    let partialReply = '';

    const handleClientDisconnect = () => {
      if (streamFinished || clientDisconnected) return;
      clientDisconnected = true;
      abortController.abort();
    };

    req.on('aborted', handleClientDisconnect);
    res.on('close', () => {
      if (!streamFinished && !res.writableEnded) {
        handleClientDisconnect();
      }
    });

    const sendSse = (eventName, payload) => {
      if (clientDisconnected || abortController.signal.aborted || res.writableEnded) {
        return;
      }
      res.write(`event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`);
    };

    const deepseekCfg = deepseekService.getDeepSeekConfig();
    const visionCfg = visionService.getVisionConfig();

    sendSse('meta', {
      empresa: empresa.nombre,
      plan: empresa.plan_nombre,
      preguntas_mes_actual: Number(empresa.preguntas_mes_actual) + 1,
      max_preguntas_mes: empresa.max_preguntas_mes,
      generative_provider: 'DeepSeek',
      generative_model: deepseekCfg.model,
      vision_model: visionCfg.model,
      embedding_model: localEmbeddingService.EMBEDDING_MODEL,
      embedding_dimensions: localEmbeddingService.EMBEDDING_DIMENSIONS,
      database: 'MySQL (bmw_premium_motors)',
      vector_backend: retrieval.vectorBackend
    });

    sendSse('citations', { citas: citations });

    try {
      const result = await deepseekService.streamPolicyBotRag({
        empresaNombre: empresa.nombre,
        question,
        retrievedChunks,
        history: recentHistory.reverse().slice(0, -1),
        abortSignal: abortController.signal,
        onToken: (delta) => {
          partialReply += delta;
          sendSse('token', { text: delta });
        }
      });

      streamFinished = true;

      await pool.execute(
        `INSERT INTO mensajes
           (id_empresa, id_usuario, session_id, rol_mensaje, contenido, citas_json, tokens_entrada, tokens_salida, modelo_usado, abortado)
         VALUES (?, ?, ?, 'assistant', ?, ?, ?, ?, ?, 0)`,
        [
          idEmpresa,
          idUsuario,
          sessionId,
          result.fullText,
          JSON.stringify(citations),
          result.inputTokens,
          result.outputTokens,
          result.model
        ]
      );

      sendSse('usage', {
        tokens_entrada: result.inputTokens,
        tokens_salida: result.outputTokens,
        modelo: result.model,
        provider: result.provider,
        apiWarning: result.apiWarning || null
      });
      sendSse('done', {
        ok: true,
        citas: citations
      });

      if (!res.writableEnded) {
        res.end();
      }
    } catch (err) {
      if (clientDisconnected || err.name === 'AbortError' || abortController.signal.aborted) {
        streamFinished = true;
        await pool.execute(
          `INSERT INTO mensajes
             (id_empresa, id_usuario, session_id, rol_mensaje, contenido, citas_json, modelo_usado, abortado)
           VALUES (?, ?, ?, 'assistant', ?, ?, ?, 1)`,
          [
            idEmpresa,
            idUsuario,
            sessionId,
            partialReply || '[Generación abortada por desconexión del cliente]',
            JSON.stringify(citations),
            deepseekCfg.model
          ]
        );
        if (!res.writableEnded) {
          res.end();
        }
        return;
      }

      sendSse('error', { message: err.message || 'Error generando respuesta RAG con DeepSeek' });
      if (!res.writableEnded) {
        res.end();
      }
    }
  } catch (outerErr) {
    return next(outerErr);
  }
}

module.exports = {
  getHistorial,
  clearHistorial,
  streamChat
};
