'use client';
import { useState } from 'react';
import TopNav from '@/components/TopNav';

const STYLE_PRESETS = ['Photorealistic', 'Digital Art', 'Oil Painting', 'Anime', 'Sketch', 'Cinematic'];

export default function ImaginePage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/imagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, mode: 'text-to-image' }),
      });
      const data = await res.json();
      if (data.images) setImages(prev => [...data.images, ...prev]);
      else setError(data.error || 'Generation failed');
    } catch { setError('Generation failed'); }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <TopNav status="idle" onToggleSidebar={() => {}} onTogglePanel={() => {}} />
      <div className="imagine-page">
        <div className="imagine-header">
          <h1 className="imagine-title">Imagine</h1>
          <p className="imagine-sub">Generate images from text descriptions</p>
        </div>
        <div className="imagine-workspace">
          <textarea
            className="imagine-prompt"
            placeholder="Describe the image you want to create..."
            rows={3}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
          <div className="imagine-presets">
            {STYLE_PRESETS.map(s => (
              <button key={s} className={`preset-pill ${style === s ? 'active' : ''}`} onClick={() => setStyle(style === s ? '' : s)}>{s}</button>
            ))}
          </div>
          <button className="generate-btn" onClick={generate} disabled={loading || !prompt.trim()}>
            <span>✦</span> {loading ? 'Generating...' : 'Generate'}
          </button>
          {error && <p style={{ color: '#ff5555', fontSize: 13, marginTop: 12 }}>{error}</p>}
          <div className="imagine-results">
            {images.map((img, i) => (
              <div key={i} className="result-card">
                <img src={img} alt={`Generated ${i}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
