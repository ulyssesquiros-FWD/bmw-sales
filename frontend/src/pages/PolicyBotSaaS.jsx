import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bot,
  FileText,
  FolderSync,
  Users,
  Gauge,
  Upload,
  RefreshCw,
  Trash2,
  Send,
  Square,
  CheckCircle2,
  ShieldCheck,
  Plus,
  BookOpen,
  Link2,
  Unlink,
  Cpu,
  Eye,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import policyBotService from '../services/policyBotService';
import { extractErrorMessage } from '../services/api';
import AlertBanner from '../components/common/AlertBanner';
import MarkdownRenderer from '../components/ai/MarkdownRenderer';

const TABS = [
  { id: 'chat', label: 'Chat RAG (DeepSeek SSE)', icon: Bot },
  { id: 'documentos', label: 'Documentos e Indexación', icon: FileText },
  { id: 'drive', label: 'Google Drive OAuth 2.0', icon: FolderSync },
  { id: 'colaboradores', label: 'Colaboradores y Roles', icon: Users },
  { id: 'plan', label: 'Plan SaaS y Cuotas', icon: Gauge }
];

export default function PolicyBotSaaS() {
  const { usuario } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = (usuario?.rol || 'admin') === 'admin';

  const [activeTab, setActiveTab] = useState('chat');
  const [empresa, setEmpresa] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [driveStatus, setDriveStatus] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState({ type: '', message: '' });

  const [question, setQuestion] = useState('');
  const [streaming, setStreaming] = useState(false);
  const abortControllerRef = useRef(null);
  const chatEndRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [textDocName, setTextDocName] = useState('');
  const [textDocContent, setTextDocContent] = useState('');
  const [uploading, setUploading] = useState(false);

  const [driveFolderInput, setDriveFolderInput] = useState('');
  const [driveFolderName, setDriveFolderName] = useState('');
  const [syncingDrive, setSyncingDrive] = useState(false);

  const [newColab, setNewColab] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol: 'colaborador'
  });
  const [savingColab, setSavingColab] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [emp, docs, drv, colabs, hist] = await Promise.all([
        policyBotService.getMiEmpresa(),
        policyBotService.getDocumentos(),
        policyBotService.getDriveStatus(),
        policyBotService.getColaboradores(),
        policyBotService.getChatHistorial()
      ]);
      setEmpresa(emp);
      setDocumentos(docs);
      setDriveStatus(drv);
      setDriveFolderInput(drv?.folder_id || '');
      setDriveFolderName(drv?.folder_name || '');
      setColaboradores(colabs);
      setHistorial(hist);
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const driveEvt = searchParams.get('drive');
    const driveErr = searchParams.get('drive_error');
    if (driveEvt === 'connected') {
      setActiveTab('drive');
      setBanner({ type: 'success', message: 'Cuenta de Google Drive conectada vía OAuth 2.0.' });
      setSearchParams({});
    } else if (driveErr) {
      setActiveTab('drive');
      setBanner({ type: 'error', message: `Error OAuth Google Drive: ${driveErr}` });
      setSearchParams({});
    }
    loadAll();
  }, [loadAll, searchParams, setSearchParams]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historial, streaming]);

  const handleSendChat = async (e) => {
    if (e) e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || streaming) return;

    setBanner({ type: '', message: '' });
    setQuestion('');
    setStreaming(true);

    const tempUserId = `u-${Date.now()}`;
    const tempBotId = `a-${Date.now()}`;
    setHistorial((prev) => [
      ...prev,
      { id_mensaje: tempUserId, rol_mensaje: 'user', contenido: trimmed, citas_json: [] },
      { id_mensaje: tempBotId, rol_mensaje: 'assistant', contenido: '', citas_json: [] }
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await policyBotService.streamChat({
        message: trimmed,
        signal: controller.signal,
        onCitations: (citas) => {
          setHistorial((prev) =>
            prev.map((m) => (m.id_mensaje === tempBotId ? { ...m, citas_json: citas } : m))
          );
        },
        onToken: (delta) => {
          setHistorial((prev) =>
            prev.map((m) =>
              m.id_mensaje === tempBotId ? { ...m, contenido: `${m.contenido}${delta}` } : m
            )
          );
        },
        onUsage: (usage) => {
          setHistorial((prev) =>
            prev.map((m) =>
              m.id_mensaje === tempBotId
                ? {
                    ...m,
                    tokens_entrada: usage.tokens_entrada,
                    tokens_salida: usage.tokens_salida,
                    modelo_usado: usage.modelo
                  }
                : m
            )
          );
          if (usage?.apiWarning) {
            setBanner({
              type: 'warning',
              message: `Aviso de proveedor DeepSeek: ${usage.apiWarning}`
            });
          }
        },
        onDone: () => {
          policyBotService.getMiEmpresa().then(setEmpresa).catch(() => {});
        }
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        setBanner({ type: 'info', message: 'Generación SSE detenida por el usuario.' });
      } else {
        setBanner({ type: 'error', message: err.message || extractErrorMessage(err) });
        setHistorial((prev) => prev.filter((m) => m.id_mensaje !== tempBotId || m.contenido));
      }
    } finally {
      setStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setBanner({ type: '', message: '' });
    try {
      const res = await policyBotService.uploadFile(selectedFile);
      setBanner({ type: 'success', message: res.message || 'Documento indexado con multilingual-e5-small (384 dims).' });
      setSelectedFile(null);
      await loadAll();
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadText = async (e) => {
    e.preventDefault();
    if (!textDocName.trim() || !textDocContent.trim()) return;
    setUploading(true);
    setBanner({ type: '', message: '' });
    try {
      const res = await policyBotService.uploadTextDocument({
        nombre_archivo: textDocName.trim(),
        contenido_texto: textDocContent.trim()
      });
      setBanner({ type: 'success', message: res.message || 'Política indexada correctamente.' });
      setTextDocName('');
      setTextDocContent('');
      await loadAll();
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setUploading(false);
    }
  };

  const handleReindex = async (idDoc) => {
    setBanner({ type: '', message: '' });
    try {
      const res = await policyBotService.reindexDocumento(idDoc);
      setBanner({ type: 'success', message: res.message });
      await loadAll();
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    }
  };

  const handleDeleteDoc = async (idDoc) => {
    if (!window.confirm('¿Eliminar este documento y sus fragmentos de MySQL?')) return;
    setBanner({ type: '', message: '' });
    try {
      const res = await policyBotService.deleteDocumento(idDoc);
      setBanner({ type: 'success', message: res.message });
      await loadAll();
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    }
  };

  const handleConnectGoogleOAuth = async () => {
    setBanner({ type: '', message: '' });
    try {
      const data = await policyBotService.startDriveOAuth();
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    }
  };

  const handleSaveDriveFolder = async (e) => {
    e.preventDefault();
    setBanner({ type: '', message: '' });
    try {
      const res = await policyBotService.connectDriveFolder({
        folder_id: driveFolderInput,
        folder_name: driveFolderName
      });
      setBanner({ type: driveStatus?.connected ? 'success' : 'warning', message: res.message });
      await loadAll();
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    }
  };

  const handleSyncDrive = async () => {
    setSyncingDrive(true);
    setBanner({ type: '', message: '' });
    try {
      const res = await policyBotService.syncDriveNow();
      setBanner({ type: res.ok ? 'success' : 'warning', message: res.message });
      await loadAll();
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setSyncingDrive(false);
    }
  };

  const handleDisconnectDrive = async () => {
    if (!window.confirm('¿Desconectar la cuenta de Google Drive OAuth 2.0 de esta empresa?')) return;
    try {
      const res = await policyBotService.disconnectDrive();
      setBanner({ type: 'info', message: res.message });
      await loadAll();
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    }
  };

  const handleCreateColab = async (e) => {
    e.preventDefault();
    setSavingColab(true);
    setBanner({ type: '', message: '' });
    try {
      const res = await policyBotService.createColaborador(newColab);
      setBanner({ type: 'success', message: res.message });
      setNewColab({ nombre: '', correo: '', password: '', rol: 'colaborador' });
      await loadAll();
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setSavingColab(false);
    }
  };

  const handleDeleteColab = async (id) => {
    if (!window.confirm('¿Eliminar a este usuario de la empresa?')) return;
    try {
      const res = await policyBotService.deleteColaborador(id);
      setBanner({ type: 'success', message: res.message });
      await loadAll();
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    }
  };

  const handleChangePlan = async (planNombre) => {
    try {
      const res = await policyBotService.updatePlan(planNombre);
      setBanner({ type: 'success', message: res.message });
      await loadAll();
    } catch (err) {
      setBanner({ type: 'error', message: extractErrorMessage(err) });
    }
  };

  const stack = empresa?.ai_stack || {};
  const docPercent = empresa ? Math.min(100, Math.round((empresa.total_documentos / empresa.max_documentos) * 100)) : 0;
  const msgPercent = empresa ? Math.min(100, Math.round((empresa.preguntas_mes_actual / empresa.max_preguntas_mes) * 100)) : 0;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Cabecera PolicyBot con Arquitectura Definitiva */}
      <div
        className="card"
        style={{
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #090e17 0%, #152238 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.12)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <ShieldCheck size={24} color="#38bdf8" />
              <h1 style={{ margin: 0, fontSize: '21px', fontWeight: 800 }}>
                PolicyBot — SaaS RAG Multiempresa (MySQL + DeepSeek + E5 Local)
              </h1>
              <span className="badge badge-primary">{empresa?.nombre || usuario?.empresa_nombre}</span>
              <span
                className="badge"
                style={{
                  background: isAdmin ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: isAdmin ? '#6ee7b7' : '#fcd34d',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}
              >
                Rol: {usuario?.rol || 'admin'}
              </span>
            </div>

            {/* Telemetría oficial de arquitectura */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px', fontSize: '12px', color: '#cbd5e1' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px' }}>
                <Bot size={13} color="#38bdf8" />
                Generativo: <strong>{stack.generative_provider || 'DeepSeek'}</strong> ({stack.generative_model || 'deepseek-flash'})
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px' }}>
                <Eye size={13} color="#c084fc" />
                Visión: <strong>{stack.vision_model || 'gpt-4o'}</strong> {!stack.vision_configured && '(sin API Key)'}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px' }}>
                <Cpu size={13} color="#34d399" />
                Embeddings: <strong>{stack.embedding_model || 'Xenova/multilingual-e5-small'}</strong> ({stack.embedding_dimensions || 384} dims ONNX)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '6px' }}>
                <Database size={13} color="#60a5fa" />
                BD: <strong>{stack.database || 'MySQL (bmw_premium_motors)'}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {empresa && (
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', background: 'rgba(0,0,0,0.35)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span>Plan: <strong style={{ color: '#38bdf8' }}>{empresa.plan_nombre}</strong></span>
                <span>Docs: <strong>{empresa.total_documentos}/{empresa.max_documentos}</strong></span>
                <span>Preguntas: <strong>{empresa.preguntas_mes_actual}/{empresa.max_preguntas_mes}</strong></span>
                <span>
                  Drive:{' '}
                  <strong style={{ color: driveStatus?.connected ? '#34d399' : '#f87171' }}>
                    {driveStatus?.connected ? `Conectado (${driveStatus.google_email || 'OAuth'})` : 'Desconectado'}
                  </strong>
                </span>
              </div>
            )}
            <button type="button" className="btn btn-secondary btn-sm" onClick={loadAll}>
              <RefreshCw size={14} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {banner.message && (
        <AlertBanner
          type={banner.type || 'info'}
          message={banner.message}
          onClose={() => setBanner({ type: '', message: '' })}
        />
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${active ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading && !empresa ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <span>Cargando espacio de trabajo PolicyBot (MySQL + E5 local)...</span>
        </div>
      ) : (
        <>
          {/* 1. CHAT RAG STREAMING SSE */}
          {activeTab === 'chat' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px' }}>Asistente Documental RAG — DeepSeek ({stack.generative_model || 'deepseek-flash'})</h2>
                  <small style={{ color: '#64748b' }}>
                    Similitud coseno local (384 dims E5) sobre MySQL para {empresa?.nombre} · Top-6 fragmentos aislados.
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    await policyBotService.clearChatHistorial();
                    setHistorial([]);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Limpiar historial</span>
                </button>
              </div>

              {!stack.deepseek_configured && (
                <AlertBanner
                  type="warning"
                  message="DEEPSEEK_API_KEY no está configurada en backend/.env. Configúrala para generación conversacional completa con DeepSeek."
                />
              )}

              <div
                style={{
                  background: '#0a0f19',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '18px',
                  minHeight: '360px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                {historial.length === 0 && (
                  <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '48px 16px' }}>
                    Consulta las políticas internas de <strong>{empresa?.nombre}</strong> con recuperación semántica E5 + citas verificables.
                  </div>
                )}

                {historial.map((msg) => {
                  const isUser = msg.rol_mensaje === 'user';
                  return (
                    <div
                      key={msg.id_mensaje}
                      style={{
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: isUser ? '75%' : '90%',
                        background: isUser ? '#004a80' : '#131d31',
                        color: '#ffffff',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {isUser ? (
                        <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{msg.contenido}</div>
                      ) : (
                        <div>
                          <MarkdownRenderer content={msg.contenido || (streaming ? 'Generando respuesta...' : '')} />
                          {Array.isArray(msg.citas_json) && msg.citas_json.length > 0 && (
                            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}>
                              <div style={{ color: '#93c5fd', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <BookOpen size={13} /> Fuentes recuperadas (E5 384 dims):
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {msg.citas_json.slice(0, 4).map((cita, cIdx) => (
                                  <span
                                    key={cIdx}
                                    style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#bae6fd', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}
                                    title={cita.extracto}
                                  >
                                    {cita.nombre_archivo} (Frag #{cita.indice_fragmento} · sim {cita.similitud})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {(msg.modelo_usado || msg.tokens_salida > 0) && (
                            <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
                              Modelo: {msg.modelo_usado} · Tokens in/out: {msg.tokens_entrada || 0}/{msg.tokens_salida || 0}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-control"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={`Pregunta sobre políticas internas de ${empresa?.nombre || 'su empresa'}...`}
                  disabled={streaming}
                  style={{ flex: 1 }}
                />
                {streaming ? (
                  <button type="button" className="btn btn-danger" onClick={handleStopStream} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Square size={14} />
                    <span>Abortar Stream</span>
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary" disabled={!question.trim()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Send size={14} />
                    <span>Enviar SSE</span>
                  </button>
                )}
              </form>
            </div>
          )}

          {/* 2. DOCUMENTOS E INDEXACIÓN */}
          {activeTab === 'documentos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card">
                <h2 style={{ margin: '0 0 8px 0', fontSize: '17px' }}>
                  Carga e Indexación (PDF, DOCX, TXT e Imágenes vía GPT-4o Vision)
                </h2>
                <small style={{ color: '#64748b', display: 'block', marginBottom: '12px' }}>
                  PDFs con texto usan extracción nativa; PDFs escaneados o imágenes PNG/JPG usan OpenAI GPT-4o Vision ({stack.vision_configured ? 'configurado' : 'OPENAI_API_KEY pendiente'}).
                </small>

                {!isAdmin ? (
                  <AlertBanner
                    type="warning"
                    message="Su rol es 'colaborador'. Solo los administradores pueden subir, reindexar o eliminar documentos."
                  />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    <form onSubmit={handleUploadFile} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <strong style={{ fontSize: '14px' }}>Subir Archivo (PDF / DOCX / TXT / PNG / JPG)</strong>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="form-control"
                      />
                      <button type="submit" className="btn btn-primary" disabled={!selectedFile || uploading}>
                        <Upload size={14} />
                        <span>{uploading ? 'Procesando e indexando E5...' : 'Subir e Indexar'}</span>
                      </button>
                    </form>

                    <form onSubmit={handleUploadText} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <strong style={{ fontSize: '14px' }}>Carga Directa de Política (.txt)</strong>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. Politica_Horarios.txt"
                        value={textDocName}
                        onChange={(e) => setTextDocName(e.target.value)}
                      />
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Pegue el texto de la política corporativa..."
                        value={textDocContent}
                        onChange={(e) => setTextDocContent(e.target.value)}
                      />
                      <button type="submit" className="btn btn-secondary" disabled={!textDocName.trim() || !textDocContent.trim() || uploading}>
                        <Plus size={14} />
                        <span>Indexar Texto</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
                  Documentos de {empresa?.nombre} ({documentos.length} / {empresa?.max_documentos})
                </h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Archivo</th>
                        <th>Tipo / Origen</th>
                        <th>Extracción</th>
                        <th>Fragmentos (384 dims)</th>
                        <th>Estado</th>
                        {isAdmin && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {documentos.map((doc) => (
                        <tr key={doc.id_documento}>
                          <td><strong>{doc.nombre_archivo}</strong></td>
                          <td>{String(doc.tipo_archivo || '').toUpperCase()} · {doc.origen}</td>
                          <td><span className="badge">{doc.metodo_extraccion || 'texto_nativo'}</span></td>
                          <td>{doc.total_fragmentos}</td>
                          <td>
                            <span className={`badge ${doc.estado_indexacion === 'indexado' ? 'badge-success' : 'badge-warning'}`}>
                              {doc.estado_indexacion}
                            </span>
                          </td>
                          {isAdmin && (
                            <td style={{ display: 'flex', gap: '6px' }}>
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleReindex(doc.id_documento)}>
                                <RefreshCw size={13} />
                                <span>Reindexar</span>
                              </button>
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteDoc(doc.id_documento)}>
                                <Trash2 size={13} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {documentos.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>
                            No hay documentos indexados en esta empresa aún.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. GOOGLE DRIVE OAUTH 2.0 */}
          {activeTab === 'drive' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px' }}>Conexión Google Drive mediante OAuth 2.0</h2>
                  <small style={{ color: '#64748b' }}>
                    Estado real:{' '}
                    <strong style={{ color: driveStatus?.connected ? '#059669' : '#dc2626' }}>
                      {driveStatus?.connected
                        ? `Conectado (${driveStatus.google_email || 'Cuenta Google'})`
                        : 'No conectado'}
                    </strong>{' '}
                    · Cron automático: {driveStatus?.cron_horario}
                  </small>
                </div>

                {isAdmin && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {!driveStatus?.connected ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleConnectGoogleOAuth}
                        disabled={!driveStatus?.oauth_configured}
                      >
                        <Link2 size={14} />
                        <span>Conectar Google Drive</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSyncDrive}
                          disabled={syncingDrive || !driveStatus?.folder_id}
                        >
                          <RefreshCw size={14} />
                          <span>{syncingDrive ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
                        </button>
                        <button type="button" className="btn btn-danger" onClick={handleDisconnectDrive}>
                          <Unlink size={14} />
                          <span>Desconectar</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {!driveStatus?.oauth_configured && (
                <AlertBanner
                  type="warning"
                  message="Google OAuth 2.0 no está configurado en el servidor (faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en backend/.env). Aunque guarde un ID de carpeta, la conexión permanecerá desconectada hasta completar el flujo OAuth real."
                />
              )}

              {isAdmin && (
                <form onSubmit={handleSaveDriveFolder} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 2, minWidth: '220px' }}>
                    <label className="form-label" htmlFor="drive-folder-id">
                      ID de Carpeta de Google Drive autorizada
                    </label>
                    <input
                      id="drive-folder-id"
                      type="text"
                      className="form-control"
                      value={driveFolderInput}
                      onChange={(e) => setDriveFolderInput(e.target.value)}
                      placeholder="Ej. 1AbCdeFgHiJkLmNoPqRsTuVwXyZ"
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <label className="form-label" htmlFor="drive-folder-name">
                      Nombre descriptivo (opcional)
                    </label>
                    <input
                      id="drive-folder-name"
                      type="text"
                      className="form-control"
                      value={driveFolderName}
                      onChange={(e) => setDriveFolderName(e.target.value)}
                      placeholder="Políticas Corporativas"
                    />
                  </div>
                  <button type="submit" className="btn btn-secondary">
                    <CheckCircle2 size={14} />
                    <span>Guardar Carpeta</span>
                  </button>
                </form>
              )}

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Documento en Drive</th>
                      <th>Drive File ID</th>
                      <th>Extracción</th>
                      <th>Fragmentos</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(driveStatus?.documentos_drive || []).map((d) => (
                      <tr key={d.id_documento}>
                        <td><strong>{d.nombre_archivo}</strong></td>
                        <td><code>{d.drive_file_id}</code></td>
                        <td>{d.metodo_extraccion || 'texto_nativo'}</td>
                        <td>{d.total_fragmentos}</td>
                        <td><span className="badge badge-success">{d.estado_indexacion}</span></td>
                      </tr>
                    ))}
                    {(!driveStatus?.documentos_drive || driveStatus.documentos_drive.length === 0) && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>
                          No hay documentos sincronizados desde Google Drive OAuth todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. COLABORADORES */}
          {activeTab === 'colaboradores' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isAdmin && (
                <div className="card">
                  <h2 style={{ margin: '0 0 12px 0', fontSize: '17px' }}>Registrar Colaborador o Administrador</h2>
                  <form
                    onSubmit={handleCreateColab}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'end' }}
                  >
                    <div>
                      <label className="form-label">Nombre</label>
                      <input type="text" className="form-control" required value={newColab.nombre} onChange={(e) => setNewColab((p) => ({ ...p, nombre: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label">Correo</label>
                      <input type="email" className="form-control" required value={newColab.correo} onChange={(e) => setNewColab((p) => ({ ...p, correo: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label">Contraseña (mín. 8)</label>
                      <input type="password" className="form-control" required minLength={8} value={newColab.password} onChange={(e) => setNewColab((p) => ({ ...p, password: e.target.value }))} />
                    </div>
                    <div>
                      <label className="form-label">Rol</label>
                      <select className="form-control" value={newColab.rol} onChange={(e) => setNewColab((p) => ({ ...p, rol: e.target.value }))}>
                        <option value="colaborador">Colaborador (solo chat)</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={savingColab}>
                      <Plus size={14} />
                      <span>{savingColab ? 'Guardando...' : 'Agregar'}</span>
                    </button>
                  </form>
                </div>
              )}

              <div className="card">
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
                  Miembros de {empresa?.nombre} ({colaboradores.length})
                </h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Fecha Registro</th>
                        {isAdmin && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {colaboradores.map((c) => (
                        <tr key={c.id_usuario}>
                          <td><strong>{c.nombre}</strong></td>
                          <td>{c.correo}</td>
                          <td><span className="badge badge-primary">{c.rol}</span></td>
                          <td>{new Date(c.fecha_creacion).toLocaleDateString()}</td>
                          {isAdmin && (
                            <td>
                              {c.id_usuario !== usuario?.id_usuario && (
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteColab(c.id_usuario)}>
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. PLAN SAAS Y CUOTAS */}
          {activeTab === 'plan' && empresa && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '17px' }}>Consumo y Límites del Plan SaaS — {empresa.nombre}</h2>
                <small style={{ color: '#64748b' }}>
                  Mes actual: {empresa.mes_control} · Al superar el límite mensual, /api/chat/stream responde HTTP 429.
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>Documentos Indexados</strong>
                    <span>{empresa.total_documentos} / {empresa.max_documentos}</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${docPercent}%`, height: '100%', background: docPercent >= 90 ? '#ef4444' : '#0066b1' }} />
                  </div>
                  <small style={{ color: '#64748b', display: 'block', marginTop: '6px' }}>
                    Fragmentos (384 dims E5) en MySQL: {empresa.total_fragmentos}
                  </small>
                </div>

                <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>Preguntas Mensuales</strong>
                    <span>{empresa.preguntas_mes_actual} / {empresa.max_preguntas_mes}</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${msgPercent}%`, height: '100%', background: msgPercent >= 90 ? '#ef4444' : '#10b981' }} />
                  </div>
                  <small style={{ color: '#64748b', display: 'block', marginTop: '6px' }}>
                    Plan activo: <strong>{empresa.plan_nombre}</strong>
                  </small>
                </div>
              </div>

              {isAdmin && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {(empresa.planes_disponibles || []).map((pl) => {
                    const isCurrent = pl.nombre === empresa.plan_nombre;
                    return (
                      <div
                        key={pl.id_plan}
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          border: isCurrent ? '2px solid #0066b1' : '1px solid #cbd5e1',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '16px' }}>Plan {pl.nombre}</strong>
                          <span className="badge badge-primary">${pl.precio_mensual}/mes</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#475569' }}>
                          • Hasta <strong>{pl.max_documentos}</strong> documentos indexados
                          <br />• Hasta <strong>{pl.max_preguntas_mes}</strong> preguntas RAG mensuales
                        </div>
                        <button
                          type="button"
                          className={`btn ${isCurrent ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                          disabled={isCurrent}
                          onClick={() => handleChangePlan(pl.nombre)}
                        >
                          {isCurrent ? 'Plan Activo Actual' : `Cambiar a Plan ${pl.nombre}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
