import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Cpu,
  Database,
  Car,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { BmwRoundel, BmwMEmblem } from '../components/common/BmwLogos';
import MarkdownRenderer from '../components/ai/MarkdownRenderer';
import { aiService } from '../services/aiService';
import { extractErrorMessage } from '../services/api';

export default function AsistenteIA() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `# ¡Bienvenido a BMW Genius AI! 🏎️

Soy el **Asesor Ejecutivo de Inteligencia Artificial** de **BMW Premium Motors**, impulsado por los modelos avanzados de **DeepSeek AI** y conectado en tiempo real a las **24 entidades** de nuestra base de datos corporativa.

### ¿En qué puedo asistirte hoy?
- 🏁 **Gama BMW & División ///M:** Fichas técnicas, motorizaciones TwinPower Turbo y la edición especial de honor **BMW X5 M 2012 E70 en Titanium Silver Metallic (555 CV)**.
- 📦 **Inventario en Vivo:** Disponibilidad, precios de lista, kilometraje y unidades destacadas en piso de venta.
- 💼 **Estrategia Comercial:** Generación de guiones y argumentos de venta para clientes VIP.
- 💰 **Finanzas:** Esquemas *BMW Select*, arrendamiento puro y opciones de valor futuro garantizado.
- 🔧 **Taller & Posventa:** Diagnóstico preventivo con sistema oficial **ISTA+**, inspección de 110 puntos CPO y garantías.

*Selecciona una de las consultas rápidas a continuación o escribe tu pregunta.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [estadoIA, setEstadoIA] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Cargar sugerencias y estado inicial
  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [sugRes, estRes] = await Promise.all([
        aiService.getSuggestions(),
        aiService.getStatus()
      ]);
      if (sugRes?.data) setSugerencias(sugRes.data);
      if (estRes) setEstadoIA(estRes);
    } catch (err) {
      console.warn('No se pudieron cargar sugerencias/estado:', err);
    }
  };

  const handleSend = async (messageToSend = null) => {
    const text = (typeof messageToSend === 'string' ? messageToSend : inputMessage).trim();
    if (!text || loading) return;

    setError('');
    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Actualizar conversación en pantalla
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      // Formato para historial de API
      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await aiService.sendMessage(text, historyPayload);
      const replyContent = res?.data?.reply || 'Respuesta recibida sin contenido.';
      const tokensUsage = res?.data?.usage;
      const modelUsed = res?.data?.model;

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: replyContent,
          model: modelUsed,
          tokens: tokensUsage?.total_tokens,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      const errMsg = extractErrorMessage(err) || 'Error al comunicarse con el Agente DeepSeek.';
      setError(errMsg);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          isError: true,
          content: `⚠️ **Error en la consulta:** ${errMsg}\n\nPor favor verifica tu conexión a internet o intenta nuevamente en unos momentos.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('¿Deseas reiniciar la sesión de conversación con el Asistente IA?')) {
      setMessages([
        {
          role: 'assistant',
          content: 'Sesión reiniciada. ¿En qué vehículo, consulta comercial o análisis de inventario BMW te puedo asesorar ahora?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setError('');
    }
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header Corporativo del Asistente */}
      <div style={{
        background: 'linear-gradient(135deg, #090e17 0%, #151f30 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '16px 24px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BmwRoundel size={36} />
            <BmwMEmblem width={34} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
                BMW Genius AI Advisor
              </h1>
              <span style={{
                background: 'linear-gradient(90deg, #0066b1, #47a0ff)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Cpu size={12} /> DeepSeek V3 / Flash
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
              Asistente comercial y técnico conectado a las 24 entidades y base de datos en tiempo real.
            </p>
          </div>
        </div>

        {/* Estatus e Indicadores */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {estadoIA?.contexto_resumen && (
            <div style={{
              display: 'flex',
              gap: '12px',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px'
            }}>
              <span style={{ color: '#cbd5e1' }}>
                <strong style={{ color: '#60a5fa' }}>{estadoIA.contexto_resumen.unidades_disponibles}</strong> Disp.
              </span>
              <span style={{ color: '#475569' }}>|</span>
              <span style={{ color: '#cbd5e1' }}>
                <strong style={{ color: '#f43f5e' }}>{estadoIA.contexto_resumen.modelos_m}</strong> ///M
              </span>
              <span style={{ color: '#475569' }}>|</span>
              <span style={{ color: '#cbd5e1' }}>
                <strong style={{ color: '#10b981' }}>{estadoIA.contexto_resumen.ventas_registradas}</strong> Ventas
              </span>
            </div>
          )}

          <button
            onClick={loadMetadata}
            title="Refrescar estado"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={handleClearChat}
            title="Reiniciar chat"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600
            }}
          >
            <Trash2 size={14} /> Limpiar
          </button>
        </div>
      </div>

      {/* Sugerencias Rápidas / Quick Prompts */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '12px'
      }}>
        {sugerencias.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSend(sug.prompt)}
            disabled={loading}
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(0, 102, 177, 0.4)',
              color: '#e2e8f0',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0066b1'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 102, 177, 0.4)'}
          >
            <Sparkles size={12} color="#38bdf8" />
            <strong style={{ color: '#93c5fd' }}>{sug.titulo}</strong>
          </button>
        ))}
      </div>

      {/* Ventana Principal de Conversación */}
      <div style={{
        flex: 1,
        background: '#0a0f19',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
      }}>
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              {/* Encabezado del emisor */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
                fontSize: '12px',
                color: '#64748b'
              }}>
                {!isUser && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BmwRoundel size={16} />
                    <span style={{ color: '#93c5fd', fontWeight: 700 }}>BMW Genius AI</span>
                    {msg.model && (
                      <span style={{ fontSize: '10px', color: '#475569', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '4px' }}>
                        {msg.model}
                      </span>
                    )}
                  </div>
                )}
                {isUser && <span style={{ color: '#94a3b8', fontWeight: 600 }}>Tú (Asesor / Ejecutivo)</span>}
                <span>{msg.timestamp}</span>
              </div>

              {/* Burbuja del mensaje */}
              <div style={{
                maxWidth: isUser ? '75%' : '88%',
                backgroundColor: isUser ? '#004a80' : 'rgba(20, 29, 46, 0.95)',
                color: '#ffffff',
                padding: isUser ? '12px 18px' : '18px 24px',
                borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                border: isUser ? '1px solid rgba(0, 102, 177, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isUser 
                  ? '0 4px 12px rgba(0, 102, 177, 0.25)' 
                  : '0 6px 16px rgba(0, 0, 0, 0.35)',
                position: 'relative'
              }}>
                {isUser ? (
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </p>
                ) : (
                  <div>
                    <MarkdownRenderer content={msg.content} />
                    
                    {/* Barra inferior de acciones del mensaje */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {msg.tokens && <span>Tokens: {msg.tokens}</span>}
                      </div>

                      <button
                        onClick={() => handleCopyMessage(msg.content, index)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedIndex === index ? '#10b981' : '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                        title="Copiar respuesta"
                      >
                        {copiedIndex === index ? <Check size={12} /> : <Copy size={12} />}
                        {copiedIndex === index ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Indicador de carga cuando la IA está pensando */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '12px', color: '#64748b' }}>
              <BmwRoundel size={16} />
              <span style={{ color: '#93c5fd', fontWeight: 700 }}>BMW Genius AI</span>
              <span style={{ fontSize: '11px', color: '#38bdf8' }}>Consultando telemetría y base de datos...</span>
            </div>
            <div style={{
              backgroundColor: 'rgba(20, 29, 46, 0.8)',
              border: '1px solid rgba(0, 102, 177, 0.3)',
              padding: '16px 20px',
              borderRadius: '4px 16px 16px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#0066b1', borderRadius: '50%', animation: 'pulse 1.4s infinite 0s' }} />
                <span style={{ width: '8px', height: '8px', backgroundColor: '#002663', borderRadius: '50%', animation: 'pulse 1.4s infinite 0.2s' }} />
                <span style={{ width: '8px', height: '8px', backgroundColor: '#e21b23', borderRadius: '50%', animation: 'pulse 1.4s infinite 0.4s' }} />
              </div>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                DeepSeek analizando catálogo BMW, inventario e ingeniería...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Barra de Entrada / Input */}
      <div style={{
        marginTop: '14px',
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '12px',
        padding: '8px 12px 8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
      }}>
        <textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe una pregunta sobre la gama BMW, disponibilidad en inventario, ventas o mantenimiento..."
          rows={1}
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontSize: '14px',
            resize: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.4,
            maxHeight: '100px'
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputMessage.trim() || loading}
          style={{
            background: !inputMessage.trim() || loading
              ? 'rgba(255, 255, 255, 0.05)'
              : 'linear-gradient(135deg, #0066b1 0%, #004a80 100%)',
            color: !inputMessage.trim() || loading ? '#475569' : '#ffffff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: !inputMessage.trim() || loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '13px',
            transition: 'all 0.2s ease',
            boxShadow: inputMessage.trim() && !loading ? '0 4px 12px rgba(0, 102, 177, 0.3)' : 'none'
          }}
        >
          <span>Enviar</span>
          <Send size={15} />
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

