'use client';
import { useState, useEffect, useCallback } from 'react';
import { initDuplex, stopDuplex } from '@/lib/duplex';

export default function DuplexToggle({ isDuplex, onToggle, voiceGender, onVoiceGenderChange, onDuplexStateChange }) {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleToggle = useCallback(async () => {
    setError(null);

    if (isDuplex) {
      // Turn off — use parent handler
      onToggle();
      return;
    }

    // Turn on — MUST be inside click handler (user gesture)
    setIsLoading(true);

    const success = await initDuplex({
      onSpeechStart: () => onDuplexStateChange?.('speech_start'),
      onSpeechEnd:   (audio) => onDuplexStateChange?.('speech_end', audio),
      onVADMisfire:  () => {},
      onError: (msg) => {
        setError(msg);
        setIsLoading(false);
      },
    });

    setIsLoading(false);
    if (success) {
      onToggle(); // Tell parent duplex is on
    }
  }, [isDuplex, onToggle, onDuplexStateChange]);

  return (
    <div className={`duplex-card ${isDuplex ? 'on' : ''} ${error ? 'error' : ''}`} id="duplex-toggle">
      <div className="duplex-header">
        <div className="duplex-title">
          <span>FULL DUPLEX</span>
          {isDuplex && <span className="duplex-live-dot" />}
        </div>
      </div>

      <p className="duplex-desc">
        {isDuplex
          ? <>Always listening. <strong>Speak anytime</strong>, interrupt freely.
          JARVIS adapts mid-sentence.</>
          : <>Like a phone call — speak anytime, interrupt freely.
          <em>Hold mic 2s</em> when off.</>
        }
      </p>

      {error && (
        <div className="duplex-error">
          <span className="duplex-error-icon">⚠</span>
          <span className="duplex-error-text">{error}</span>
        </div>
      )}

      <div className="toggle-switch" onClick={handleToggle} role="button" tabIndex={0}>
        <div className={`toggle-track ${isDuplex ? 'on' : ''} ${isLoading ? 'loading' : ''}`}>
          <div className="toggle-thumb" />
        </div>
        <span className="toggle-label">
          {isLoading ? 'STARTING...' : isDuplex ? 'ON' : 'OFF'}
        </span>
      </div>

      {!isDuplex && !error && (
        <p className="duplex-hint">
          First time? Browser will ask for mic permission — click Allow.
        </p>
      )}

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
