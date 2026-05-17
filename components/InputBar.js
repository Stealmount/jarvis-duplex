'use client';
import { useState, useRef, useEffect } from 'react';

const FILE_TYPES = [
  { label: '🖼 Image', accept: 'image/jpeg,image/png,image/webp,image/gif' },
  { label: '📄 PDF', accept: 'application/pdf' },
  { label: '🎵 Audio', accept: 'audio/*' },
  { label: '🎬 Video', accept: 'video/mp4,video/webm' },
  { label: '📝 Document', accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { label: '📊 Presentation', accept: '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation' },
];

export default function InputBar({ onSend, onFileSelect, attachments, onRemoveAttachment, isDuplex, isLoading, onPTTStart, onPTTEnd }) {
  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef(null);
  const fileRefs = useRef([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const autoGrow = () => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 144) + 'px'; }
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

  return (
    <div className="input-bar-wrapper" id="input-bar">
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
          <button className="attach-btn" onClick={() => setMenuOpen(!menuOpen)} title="Attach file" id="attach-btn">📎</button>
          <div className={`attach-menu ${menuOpen ? 'open' : ''}`}>
            {FILE_TYPES.map((ft, i) => (
              <button key={ft.label} className="attach-menu-item" onClick={() => { fileRefs.current[i]?.click(); setMenuOpen(false); }}>
                {ft.label}
                <input
                  type="file"
                  accept={ft.accept}
                  hidden
                  ref={el => fileRefs.current[i] = el}
                  onChange={(e) => { if (e.target.files[0]) onFileSelect(e.target.files[0]); e.target.value = ''; }}
                />
              </button>
            ))}
          </div>
        </div>
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Message JARVIS..."
          rows={1}
          value={text}
          onChange={(e) => { setText(e.target.value); autoGrow(); }}
          onKeyDown={handleKeyDown}
          id="chat-input"
        />
        {!isDuplex && (
          <button
            className="mic-btn"
            onPointerDown={onPTTStart}
            onPointerUp={onPTTEnd}
            onPointerLeave={onPTTEnd}
            title="Hold 2s to record"
            id="mic-btn"
          >
            🎤
          </button>
        )}
        <button className="send-btn" onClick={handleSend} disabled={isLoading || (!text.trim() && attachments.length === 0)} id="send-btn">
          ➤
        </button>
      </div>
    </div>
  );
}
