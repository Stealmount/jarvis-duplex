'use client';
import { useState, useRef, useEffect, useMemo } from 'react';

// Upload types with their required model capabilities
const FILE_TYPES = [
  { label: '🖼 Image', accept: 'image/jpeg,image/png,image/webp,image/gif', capability: 'image_input', fallbackMsg: 'Current model doesn\'t support images — will extract via OCR' },
  { label: '📄 PDF', accept: 'application/pdf', capability: 'pdf', fallbackMsg: 'PDF will be extracted client-side' },
  { label: '🎵 Audio', accept: 'audio/*', capability: 'audio_input', fallbackMsg: 'Audio will be transcribed first' },
  { label: '🎬 Video', accept: 'video/mp4,video/webm', capability: null, fallbackMsg: null },
  { label: '📝 Document', accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document', capability: null, fallbackMsg: null },
  { label: '📊 Presentation', accept: '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation', capability: null, fallbackMsg: null },
];

export default function InputBar({ onSend, onFileSelect, attachments, onRemoveAttachment, isDuplex, isLoading, onPTTStart, onPTTEnd, currentModelCapabilities, onShowToast }) {
  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef(null);
  const fileRefs = useRef([]);
  const menuRef = useRef(null);

  // Check if model supports a capability
  const caps = useMemo(() => currentModelCapabilities || ['text'], [currentModelCapabilities]);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Prevent viewport shift when keyboard opens
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      const keyboardHeight = window.innerHeight - window.visualViewport.height;
      const inputArea = document.getElementById('input-bar-area') || document.getElementById('input-bar');
      if (inputArea) {
        inputArea.style.bottom = keyboardHeight + 'px';
      }
    };

    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }, []);

  const handleInputChange = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    setText(el.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleFileClick = (ft, i) => {
    // Check capability gating
    if (ft.capability && !caps.includes(ft.capability)) {
      // Show fallback message but still allow the upload (client-side extraction)
      if (ft.fallbackMsg && onShowToast) onShowToast(`ℹ️ ${ft.fallbackMsg}`);
    }
    fileRefs.current[i]?.click();
    setMenuOpen(false);
  };

  return (
    <div className="input-bar-area" id="input-bar-area">
      {attachments.length > 0 && (
        <div className="attachment-strip">
          {attachments.map((a, i) => (
            <div key={i} className="attachment-chip">
              <span>{a.fileName}</span>
              <button className="remove" onClick={() => onRemoveAttachment(i)}>×</button>
            </div>
          ))}
        </div>
      )}
      <div className="input-bar">
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button className="input-btn attach-btn" onClick={() => setMenuOpen(!menuOpen)} title="Attach file" id="attach-btn">📎</button>
          <div className={`attach-menu ${menuOpen ? 'open' : ''}`}>
            {FILE_TYPES.map((ft, i) => {
              const supported = !ft.capability || caps.includes(ft.capability);
              return (
                <button
                  key={ft.label}
                  className="attach-menu-item"
                  onClick={() => handleFileClick(ft, i)}
                  style={!supported ? { opacity: 0.6 } : undefined}
                  title={!supported ? ft.fallbackMsg : undefined}
                >
                  {ft.label}
                  {!supported && <span style={{ fontSize: 9, color: 'var(--text-3)', marginLeft: 'auto' }}>⚠</span>}
                  <input
                    type="file"
                    accept={ft.accept}
                    hidden
                    ref={el => fileRefs.current[i] = el}
                    onChange={(e) => { if (e.target.files[0]) onFileSelect(e.target.files[0]); e.target.value = ''; }}
                  />
                </button>
              );
            })}
          </div>
        </div>
        <textarea
          ref={textareaRef}
          className="input-textarea"
          placeholder="Message JARVIS..."
          rows={1}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          id="chat-input"
        />
        {!isDuplex && (
          <button
            className="input-btn mic-btn"
            onPointerDown={onPTTStart}
            onPointerUp={onPTTEnd}
            onPointerLeave={onPTTEnd}
            title="Hold 2s to record"
            id="mic-btn"
          >
            🎤
          </button>
        )}
        <button className="input-btn send-btn" onClick={handleSend} disabled={isLoading || (!text.trim() && attachments.length === 0)} id="send-btn">
          ➤
        </button>
      </div>
    </div>
  );
}
