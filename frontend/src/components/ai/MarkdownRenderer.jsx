import React from 'react';

/**
 * Formateador de texto enriquecido / Markdown para el asistente BMW Genius AI
 * Soporta tablas, títulos, viñetas, negritas, citas y bloques de código
 */
export default function MarkdownRenderer({ content = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let tableBuffer = [];
  let listBuffer = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${key}`} style={{ margin: '8px 0 12px 20px', paddingLeft: '8px', lineHeight: 1.6 }}>
          {listBuffer.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '4px', color: '#e2e8f0' }}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const flushTable = (key) => {
    if (tableBuffer.length >= 2) {
      const headerRow = tableBuffer[0]
        .split('|')
        .map(c => c.trim())
        .filter((c, i, arr) => i > 0 && i < arr.length - 1 || (arr.length === 2 && c));
      
      const bodyRows = tableBuffer.slice(2).map(row => 
        row.split('|')
           .map(c => c.trim())
           .filter((c, i, arr) => i > 0 && i < arr.length - 1 || (arr.length === 2 && c))
      );

      elements.push(
        <div key={`table-wrapper-${key}`} style={{ overflowX: 'auto', margin: '14px 0' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderBottom: '2px solid rgba(0, 102, 177, 0.5)' }}>
                {headerRow.map((cell, cIdx) => (
                  <th key={cIdx} style={{ padding: '8px 12px', textAlign: 'left', color: '#93c5fd', fontWeight: 600 }}>
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  backgroundColor: rIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                }}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '8px 12px', color: '#cbd5e1' }}>
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableBuffer = [];
    } else {
      tableBuffer.forEach((tblLine, idx) => {
        elements.push(<p key={`tbl-raw-${key}-${idx}`} style={{ margin: '6px 0' }}>{renderInline(tblLine)}</p>);
      });
      tableBuffer = [];
    }
  };

  const flushCodeBlock = (key) => {
    if (codeBuffer.length > 0) {
      elements.push(
        <pre key={`code-${key}`} style={{
          backgroundColor: '#0b1120',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '12px',
          borderRadius: '6px',
          overflowX: 'auto',
          fontSize: '12px',
          color: '#38bdf8',
          margin: '10px 0',
          fontFamily: 'Consolas, Monaco, monospace'
        }}>
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      );
      codeBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Bloques de código ```
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(i);
        inCodeBlock = false;
      } else {
        flushList(i);
        flushTable(i);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Tablas Markdown
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(i);
      tableBuffer.push(trimmed);
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable(i);
    }

    // Listas desordenadas
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listBuffer.push(trimmed.slice(2));
      continue;
    } else if (listBuffer.length > 0) {
      flushList(i);
    }

    // Encabezados
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={i} style={{ color: '#60a5fa', fontSize: '15px', fontWeight: 600, margin: '14px 0 6px 0' }}>
          {renderInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={i} style={{
          color: '#f8fafc',
          fontSize: '17px',
          fontWeight: 700,
          margin: '18px 0 8px 0',
          paddingBottom: '4px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          {renderInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={i} style={{ color: '#ffffff', fontSize: '19px', fontWeight: 800, margin: '20px 0 10px 0' }}>
          {renderInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // Separadores
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={i} style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '14px 0' }} />);
      continue;
    }

    // Citas / Blockquotes
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={i} style={{
          borderLeft: '3px solid #0066b1',
          paddingLeft: '12px',
          margin: '10px 0',
          color: '#94a3b8',
          fontStyle: 'italic',
          backgroundColor: 'rgba(0, 102, 177, 0.05)',
          padding: '8px 12px',
          borderRadius: '0 4px 4px 0'
        }}>
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Líneas vacías
    if (!trimmed) {
      continue;
    }

    // Párrafos normales
    elements.push(
      <p key={i} style={{ margin: '6px 0', lineHeight: 1.6, color: '#e2e8f0' }}>
        {renderInline(rawLine)}
      </p>
    );
  }

  // Descargas finales pendientes
  flushList('end');
  flushTable('end');
  flushCodeBlock('end');

  return <div style={{ fontSize: '14px' }}>{elements}</div>;
}

/**
 * Renderiza texto inline formateando **negritas**, *cursivas* y `código`
 */
function renderInline(text) {
  if (typeof text !== 'string') return text;

  // Regex para negrita, cursiva, y codigo inline
  const tokens = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Negrita **texto**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/);
    // Codigo `codigo`
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)$/);

    if (boldMatch && (!codeMatch || remaining.indexOf('**') < remaining.indexOf('`'))) {
      if (boldMatch[1]) tokens.push(<span key={key++}>{boldMatch[1]}</span>);
      tokens.push(<strong key={key++} style={{ color: '#ffffff', fontWeight: 600 }}>{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
      continue;
    }

    if (codeMatch) {
      if (codeMatch[1]) tokens.push(<span key={key++}>{codeMatch[1]}</span>);
      tokens.push(
        <code key={key++} style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#38bdf8',
          fontFamily: 'monospace'
        }}>
          {codeMatch[2]}
        </code>
      );
      remaining = codeMatch[3];
      continue;
    }

    tokens.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return tokens.length > 0 ? tokens : text;
}
