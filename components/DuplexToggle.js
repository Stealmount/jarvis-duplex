'use client';
import { useState, useEffect } from 'react';

export default function DuplexToggle({ isDuplex, onToggle, voiceGender, onVoiceGenderChange }) {
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const voices = speechSynthesis?.getVoices() || [];
      setAvailableVoices(voices);
    };
    if (typeof window !== 'undefined' && speechSynthesis) {
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => { if (speechSynthesis) speechSynthesis.onvoiceschanged = null; };
  }, []);

  const currentGender = voiceGender || 'female';

  return (
    <div className={`duplex-card ${isDuplex ? 'on' : ''}`} id="duplex-toggle">
      <div className="duplex-title">
        <span>FULL DUPLEX</span>
        {isDuplex && <span className="duplex-pulse" />}
      </div>
      <p className="duplex-desc">
        {isDuplex
          ? <>Always listening. <strong>Speak whenever you want.</strong> JARVIS will adjust mid-sentence. No buttons. No waiting.</>
          : <>Mic is off. <strong>Hold mic button 2 sec</strong> to record, release to send.</>
        }
      </p>
      <div className="toggle-switch" onClick={onToggle} role="button" tabIndex={0}>
        <div className={`toggle-track ${isDuplex ? 'on' : ''}`}>
          <div className="toggle-thumb" />
        </div>
        <span className="toggle-label">{isDuplex ? 'ON' : 'OFF'}</span>
      </div>

      {/* Voice Agent Gender Selection */}
      <div className="voice-gender-section">
        <div className="voice-gender-label">VOICE AGENT</div>
        <div className="voice-gender-subtitle">Indian Neutral English Accent</div>
        <div className="voice-gender-options">
          <button
            className={`voice-gender-btn ${currentGender === 'female' ? 'active' : ''}`}
            onClick={() => onVoiceGenderChange('female')}
            id="voice-female-btn"
          >
            <div className="voice-gender-icon">♀</div>
            <div className="voice-gender-name">Female</div>
            <div className="voice-gender-desc">Soft & Natural</div>
          </button>
          <button
            className={`voice-gender-btn ${currentGender === 'male' ? 'active' : ''}`}
            onClick={() => onVoiceGenderChange('male')}
            id="voice-male-btn"
          >
            <div className="voice-gender-icon">♂</div>
            <div className="voice-gender-name">Male</div>
            <div className="voice-gender-desc">Calm & Clear</div>
          </button>
        </div>
      </div>
    </div>
  );
}
