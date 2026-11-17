const assert = require('assert');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = require('../src/app');
const { pool } = require('../src/config/db');
const ragService = require('../src/services/ragService');
const localEmbeddingService = require('../src/services/localEmbeddingService');
const tokenCryptoService = require('../src/services/tokenCryptoService');
const googleDriveService = require('../src/services/googleDriveService');

function reqJson(port, method, route, { token = null, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body !== null ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:5173'
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (payload !== null) headers['Content-Length'] = Buffer.byteLength(payload);

    const req = http.request(
      { hostname: '127.0.0.1', port, path: route, method, headers, timeout: 15000 },
      (res) => {
        let raw = '';
        res.on('data', (c) => { raw += c; });
        res.on('end', () => {
          let parsed = raw;
          try { parsed = JSON.parse(raw); } catch { /* noop */ }
          resolve({ statusCode: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (payload !== null) req.write(payload);
    req.end();
  });
}

(async () => {
  // 1. Chunking 1500 / 200 + sub-ventanas E5
  const longText = Array.from({ length: 120 }, (_, i) => `Cláusula corporativa número ${i + 1} sobre políticas internas.`).join(' ');
  const chunks = ragService.chunkText(longText, 1500, 200);
  assert(chunks.length >= 3, `Se esperaban >= 3 fragmentos, obtenidos: ${chunks.length}`);
  for (const ch of chunks) assert(ch.contenido.length <= 1500);
  const longEmbed = await localEmbeddingService.generateDocumentEmbedding(chunks[0].contenido);
  assert.strictEqual(longEmbed.length, 384);
  console.log(`✓ Chunking 1500/200 y embedding E5 de fragmento largo (384 dims) verificado.`);

  // 2. Recuperación semántica en español + similitud coseno correcta
  const vacDoc = await localEmbeddingService.generateDocumentEmbedding('Los empleados reciben 18 días hábiles de vacaciones al año.');
  const telDoc = await localEmbeddingService.generateDocumentEmbedding('Política de teletrabajo híbrido hasta 2 días semanales y bono de conectividad.');
  const qVac = await localEmbeddingService.generateQueryEmbedding('¿Cuántos días de vacaciones anuales tienen los empleados?');
  const simVac = localEmbeddingService.calculateCosineSimilarity(vacDoc, qVac);
  const simTel = localEmbeddingService.calculateCosineSimilarity(telDoc, qVac);
  assert(simVac > simTel, `Similitud de vacaciones (${simVac}) debe superar teletrabajo (${simTel})`);
  console.log(`✓ Similitud coseno en español verificada: vacaciones=${simVac.toFixed(4)} > teletrabajo=${simTel.toFixed(4)}`);

  // 3. Reindexación completa y ausencia de vectores obsoletos de 1024 dims en MySQL
  const [obsoleteRows] = await pool.execute(
    "SELECT COUNT(*) AS cnt FROM fragmentos WHERE embedding_dimensions <> 384 OR embedding_dim <> 384 OR embedding_model <> 'Xenova/multilingual-e5-small'"
  );
  assert.strictEqual(Number(obsoleteRows[0].cnt), 0, 'No debe haber embeddings obsoletos distintos de 384 dims E5');

  const [sampleRows] = await pool.execute('SELECT embedding, embedding_dimensions, embedding_model FROM fragmentos LIMIT 3');
  assert(sampleRows.length > 0, 'Debe haber fragmentos indexados en MySQL');
  for (const row of sampleRows) {
    const vec = typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding;
    assert.strictEqual(row.embedding_dimensions, 384);
    assert.strictEqual(row.embedding_model, 'Xenova/multilingual-e5-small');
    assert.strictEqual(vec.length, 384, 'Vector JSON en MySQL debe tener exactamente 384 dimensiones');
  }
  console.log('✓ Reindexación MySQL verificada: 0 vectores obsoletos, todos los fragmentos son de 384 dims (Xenova/multilingual-e5-small).');

  // 4. Cifrado AES-256-GCM y state anti-CSRF de Google Drive OAuth
  const sampleSecret = 'ya29.test-access-token-sample';
  const encrypted = tokenCryptoService.encryptToken(sampleSecret);
  assert(encrypted && !encrypted.includes(sampleSecret) && encrypted.split(':').length === 3);
  assert.strictEqual(tokenCryptoService.decryptToken(encrypted), sampleSecret);

  const csrfState = googleDriveService.generateOAuthState({ id_empresa: 2, id_usuario: 5 });
  const verified = googleDriveService.verifyAndConsumeOAuthState(csrfState);
  assert.strictEqual(verified.id_empresa, 2);
  assert.throws(() => googleDriveService.verifyAndConsumeOAuthState(csrfState), /expirado|inválido/i);
  console.log('✓ Cifrado AES-256-GCM de tokens y state anti-CSRF de un solo uso verificados.');

  // 5. Seguridad HTTP: extensión peligrosa (.exe), rol plan (403), borrado cruzado (404)
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  try {
    const cafeAdmin = await reqJson(port, 'POST', '/api/auth/login', {
      body: { correo: 'admin@cafemontana.com', password: 'AdminCafe2026!' }
    });
    const cafeColab = await reqJson(port, 'POST', '/api/auth/login', {
      body: { correo: 'colab@cafemontana.com', password: 'ColabCafe2026!' }
    });
    const logAdmin = await reqJson(port, 'POST', '/api/auth/login', {
      body: { correo: 'admin@logisticapacifico.com', password: 'AdminLogistica2026!' }
    });

    const dangerousUpload = await reqJson(port, 'POST', '/api/documentos/upload', {
      token: cafeAdmin.body.token,
      body: { nombre_archivo: 'malware.exe', contenido_texto: 'MZ...' }
    });
    assert.strictEqual(dangerousUpload.statusCode, 400);

    const colabPlanChange = await reqJson(port, 'PUT', '/api/empresa/plan', {
      token: cafeColab.body.token,
      body: { plan: 'Pro' }
    });
    assert.strictEqual(colabPlanChange.statusCode, 403);

    const logDocs = await reqJson(port, 'GET', '/api/documentos', { token: logAdmin.body.token });
    const otherDocId = logDocs.body.data[0].id_documento;
    const crossDelete = await reqJson(port, 'DELETE', `/api/documentos/${otherDocId}`, {
      token: cafeAdmin.body.token
    });
    assert.strictEqual(crossDelete.statusCode, 404);

    console.log('✓ Seguridad HTTP verificada: rechazo .exe (400), rol plan (403), borrado cruzado (404).');
  } finally {
    server.close();
    await pool.end();
  }
})().catch((err) => {
  console.error('[FALLO SECURITY & RAG TEST]:', err);
  process.exit(1);
});
