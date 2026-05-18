'use client';
import { MODES } from '@/lib/modes';

export default function ModeSwitchBanner({ fromMode, toMode, onDismiss, onNewThread }) {
  return (
    <div className="mode-switch-banner">
      <span className="msb-icon">⚠</span>
      <div className="msb-text">
        <strong>Switching to {MODES[toMode]?.label} mid-conversation</strong>
        <span>For better results, start a new thread in {MODES[toMode]?.label} mode.</span>
      </div>
      <div className="msb-actions">
        <button className="msb-new" onClick={onNewThread}>New thread</button>
        <button className="msb-continue" onClick={onDismiss}>Continue here</button>
      </div>
    </div>
  );
}
