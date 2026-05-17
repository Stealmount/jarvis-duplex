'use client';
import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const modeColors = {
  general: 'var(--mode-general)', therapy: 'var(--mode-therapy)',
  deep: 'var(--mode-deep)', study: 'var(--mode-study)', research: 'var(--mode-research)',
};

const modePillBg = {
  general: 'rgba(232,87,42,0.1)', therapy: 'rgba(110,191,139,0.1)',
  deep: 'rgba(123,143,255,0.1)', study: 'rgba(245,200,66,0.1)', research: 'rgba(74,189,232,0.1)',
};

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatFeed({ messages, mode, streamingText, streamingModel }) {
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  if (messages.length === 0 && !streamingText) {
    return (
      <div className="chat-feed" ref={feedRef}>
        <div className="chat-empty">
          <div className="chat-empty-title">Kya baat hai?</div>
          <div className="chat-empty-sub">Start speaking or type below</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-feed" ref={feedRef} id="chat-feed">
      {messages.map((msg, i) => (
        <div key={msg.id || i} className={`msg ${msg.role}`}>
          <div className="msg-bubble">
            {msg.role === 'assistant' && (
              <>
                <div className="msg-mode-border" style={{ background: modeColors[msg.mode] || modeColors.general }} />
                <div className="msg-header">
                  <span className="msg-header-name">JARVIS</span>
                  {/* Model name intentionally hidden — never show specific model names */}
                </div>
              </>
            )}
            <div className="msg-body">
              {msg.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
            {msg.attachments?.map((att, j) => (
              <div key={j} className="attachment-chip" style={{ marginTop: 8 }}>
                {att.fileType === 'pdf' && '📄'}
                {att.fileType === 'image' && '🖼'}
                {att.fileType === 'audio' && '🎵'}
                {att.fileType === 'video' && '🎬'}
                {att.fileType === 'docx' && '📝'}
                {att.fileType === 'pptx' && '📊'}
                {att.fileType === 'text' && '📝'}
                <span>{att.fileName}</span>
              </div>
            ))}
          </div>
          <div className="msg-time">
            {formatTime(msg.created_at)}
            {msg.role === 'assistant' && msg.mode && (
              <span className="msg-mode-pill" style={{ background: modePillBg[msg.mode], color: modeColors[msg.mode], marginLeft: 8 }}>
                {msg.mode?.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      ))}

      {streamingText && (
        <div className="msg assistant">
          <div className="msg-bubble">
            <div className="msg-mode-border" style={{ background: modeColors[mode] || modeColors.general }} />
            <div className="msg-header">
              <span className="msg-header-name">JARVIS</span>
              {/* Model name intentionally hidden during streaming too */}
            </div>
            <div className="msg-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingText}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
