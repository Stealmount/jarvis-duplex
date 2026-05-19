'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ThemeToggle from './ThemeToggle';

function SettingsSection({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', margin: 0 }}>
        {title}
      </h4>
      <div style={{ background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
        {children}
      </div>
    </div>
  );
}

export default function SettingsModal({ isOpen, onClose, voiceGender, onVoiceGenderChange, usage, userInfo }) {
  const [mounted, setMounted] = useState(false);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      // Fetch active API provider status
      fetch('/api/usage')
        .then(r => r.json())
        .then(data => {
          if (data.providers) setProviders(data.providers);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="settings-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="settings-panel">
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-body">
          <SettingsSection title="API Providers">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {providers.length === 0 ? (
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-3)' }}>Checking provider keys...</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {providers.map(p => (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: p.active ? '#00e5b0' : 'var(--text-3)',
                          boxShadow: p.active ? '0 0 6px #00e5b0' : 'none',
                        }}
                      />
                      <span style={{ color: 'var(--text-2)', textTransform: 'capitalize' }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SettingsSection>

          <SettingsSection title="Voice Settings">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Assistant Voice</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className={`preset-pill ${voiceGender === 'male' ? 'active' : ''}`}
                    onClick={() => onVoiceGenderChange('male')}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Male
                  </button>
                  <button
                    className={`preset-pill ${voiceGender === 'female' ? 'active' : ''}`}
                    onClick={() => onVoiceGenderChange('female')}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Appearance">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Visual Theme</span>
              <ThemeToggle />
            </div>
          </SettingsSection>

          <SettingsSection title="Account Tier">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-3)' }}>Current User</span>
                <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{userInfo?.name || 'Guest'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-3)' }}>Tier Status</span>
                <span style={{ color: 'var(--text-1)', fontWeight: 500, textTransform: 'uppercase' }}>
                  {userInfo?.role === 'developer' ? 'Developer Console' : userInfo?.role === 'guest' ? 'Guest Tier' : 'Pro Member'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed var(--border)' }}>
                <span style={{ color: 'var(--text-3)' }}>Usage Limit</span>
                <span style={{ color: 'var(--text-2)' }}>
                  {userInfo?.role === 'developer' ? '0 / Unlimited' : `${usage.count} / ${usage.limit} messages used`}
                </span>
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>,
    document.body
  );
}
