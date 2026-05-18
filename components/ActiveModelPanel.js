'use client';

export default function ActiveModelPanel({ activeModel, activeProvider }) {
  return (
    <div className="panel-section">
      <div className="panel-label">ACTIVE MODEL</div>
      <div className="active-model-card">
        <div className="am-dot" />
        <div className="am-info">
          <span className="am-name">{activeModel || 'Auto-routed'}</span>
          <span className="am-provider">{activeProvider || 'JARVIS selects best'}</span>
        </div>
      </div>
    </div>
  );
}
