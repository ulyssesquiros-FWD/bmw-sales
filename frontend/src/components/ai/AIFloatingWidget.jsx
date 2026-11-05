import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Maximize2,
  Cpu,
  Bot
} from 'lucide-react';
import { BmwRoundel, BmwMEmblem } from '../common/BmwLogos';
import MarkdownRenderer from './MarkdownRenderer';
import { aiService } from '../../services/aiService';

export default function AIFloatingWidget() {
  const location = useLocation();
  // No mostrar widget flotante si ya estamos en la página completa del Asistente
  if (location.pathname === '/asistente-ia') {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy **BMW Genius AI**. Puedo resolver dudas sobre cualquier modelo, disponibilidad de inventario o asistencia de ventas mientras navegas.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    const text = inputMessage.trim();
    if (!text || loading) return;

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await aiService.sendMessage(text, historyPayload);
      const reply = res?.data?.reply || 'Respuesta no disponible.';

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Error de comunicación con DeepSeek. Abre la vista completa o intenta nuevamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botón Flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9990,
            background: 'linear-gradient(135deg, #090e17 0%, #0066b1 100%)',
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50px',
            padding: '12px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(0, 102, 177, 0.4), 0 4px 10px rgba(0,0,0,0.5)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
        >
          <BmwRoundel size={24} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              BMW Genius AI <Sparkles size={12} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '10px', color: '#93c5fd' }}>DeepSeek Asistente</div>
          </div>
        </button>
      )}

      {/* Drawer / Mini Chat Flotante */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          height: '520px',
          maxHeight: 'calc(100vh - 48px)',
          maxWidth: 'calc(100vw - 32px)',
          backgroundColor: '#0c1322',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 102, 177, 0.25)',
          overflow: 'hidden'
        }}>
          {/* Header del Mini Chat */}
          <div style={{
            background: 'linear-gradient(135deg, #090e17 0%, #152238 100%)',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BmwRoundel size={22} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  BMW Genius AI
                  <span style={{ fontSize: '9px', background: '#0066b1', color: '#fff', padding: '1px 5px', borderRadius: '8px' }}>
                    DeepSeek
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>En línea • 24 Entidades</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Link
                to="/asistente-ia"
                onClick={() => setIsOpen(false)}
                title="Expandir a pantalla completa"
                style={{
                  color: '#94a3b8',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Maximize2 size={15} />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                title="Cerrar"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  padding: '4px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '13px'
          }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: m.role === 'user' ? '#004a80' : 'rgba(255, 255, 255, 0.05)',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
                  border: m.role === 'user' ? '1px solid rgba(0, 102, 177, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#e2e8f0',
                  lineHeight: 1.4
                }}
              >
                {m.role === 'user' ? (
                  m.content
                ) : (
                  <MarkdownRenderer content={m.content} />
                )}
              </div>
            ))}

            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                fontSize: '11px',
                color: '#38bdf8',
                fontStyle: 'italic',
                padding: '4px 8px'
              }}>
                BMW Genius AI pensando...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#090e17',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta algo sobre BMW..."
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#ffffff',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim() || loading}
              style={{
                background: '#0066b1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: !inputMessage.trim() || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                opacity: !inputMessage.trim() || loading ? 0.5 : 1
              }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
