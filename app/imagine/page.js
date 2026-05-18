'use client';

import { useState } from 'react';
import TopNav from '@/components/TopNav';
import { getGuestUsage, incrementGuestImage, isGuestLimitReached } from '@/lib/guest';

const STYLE_PRESETS = ['Photorealistic', 'Digital Art', 'Oil Painting', 'Anime', 'Sketch', 'Cinematic'];

const SAMPLE_PROMPTS = [
  { prompt: 'a serene japanese garden at sunrise, photorealistic', label: 'Photorealistic' },
  { prompt: 'cyberpunk city at night with neon lights, digital art', label: 'Digital Art' },
  { prompt: 'a majestic lion portrait, oil painting style', label: 'Oil Painting' },
  { prompt: 'minimalist mountain landscape, flat design', label: 'Minimalist' },
  { prompt: 'astronaut floating in colorful nebula, cinematic', label: 'Cinematic' },
  { prompt: 'cozy coffee shop interior, warm lighting, illustration', label: 'Illustration' },
];

function SampleGallery({ onUsePrompt }) {
  return (
    <div className="sample-gallery">
      <p className="sample-label">What you can create</p>
      <div className="sample-scroll">
        {SAMPLE_PROMPTS.map((sample, i) => (
          <div key={i} className="sample-card">
            <img
              src={`https://image.pollinations.ai/prompt/${encodeURIComponent(sample.prompt)}?width=512&height=512&seed=${i * 7 + 42}&nologo=true`}
              alt={sample.label}
              className="sample-img"
              loading="lazy"
            />
            <div className="sample-info">
              <span className="sample-style">{sample.label}</span>
              <button
                className="sample-try"
                onClick={() => onUsePrompt(sample.prompt)}
              >
                Try this
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

    // Guest Limit Check
    const localUser = localStorage.getItem('jarvis_user');
    const isGuest = localUser && JSON.parse(localUser).role === 'guest';
    if (isGuest && isGuestLimitReached('image')) {
      setError('Guest image limit reached (10/10). Please sign up.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/imagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, mode: 'text-to-image' }),
      });
      const data = await res.json();
      if (data.images) {
        setImages(prev => [...data.images, ...prev]);
        if (isGuest) incrementGuestImage();
      }
      else setError(data.error || 'All image providers failed');
    } catch { setError('Generation failed'); }
    setLoading(false);
  };

  const handleUsePrompt = (selectedPrompt) => {
    setPrompt(selectedPrompt);
    // Auto-detect style from label if possible
    const matched = STYLE_PRESETS.find(s => selectedPrompt.toLowerCase().includes(s.toLowerCase()));
    if (matched) setStyle(matched);
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
              <button
                key={s}
                className={`preset-pill ${style === s ? 'active' : ''}`}
                onClick={() => setStyle(style === s ? '' : s)}
              >
                {s}
              </button>
            ))}
          </div>

          <button className="generate-btn" onClick={generate} disabled={loading || !prompt.trim()}>
            <span>✦</span> {loading ? 'Generating...' : 'Generate'}
          </button>

          {error && <p style={{ color: '#ff5555', fontSize: 13, marginTop: 12, fontFamily: 'var(--font-mono)' }}>{error}</p>}

          {/* Sample Gallery */}
          <SampleGallery onUsePrompt={handleUsePrompt} />

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
