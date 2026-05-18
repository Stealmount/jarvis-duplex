'use client';

/**
 * ElevenLabs WebSocket TTS for real-time duplex conversation
 * Provides sentence-level streaming with low latency audio playback.
 * Falls back gracefully to browser TTS if unavailable.
 */

const ELEVENLABS_WS_URL = 'wss://api.elevenlabs.io/v1/text-to-speech/{voiceId}/stream-input';

const VOICE_IDS = {
  male:   'TX3LPaxmHKxFdv7VOQHJ',  // Liam — neutral, clear
  female: 'Xb7hH8MSUJpSbSDYk0k2',  // Alice — clear, neutral
};

class ElevenLabsDuplexTTS {
  constructor(apiKey, voiceGender = 'male') {
    this.apiKey = apiKey;
    this.voiceId = VOICE_IDS[voiceGender] || VOICE_IDS.male;
    this.ws = null;
    this.audioContext = null;
    this.audioQueue = [];
    this.isPlaying = false;
    this.onStart = null;
    this.onEnd = null;
    this.isCancelled = false;
    this._startTime = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const url = ELEVENLABS_WS_URL.replace('{voiceId}', this.voiceId);

      this.ws = new WebSocket(`${url}?model_id=eleven_turbo_v2&output_format=pcm_24000`);

      this.ws.onopen = () => {
        // Send initial config
        this.ws.send(JSON.stringify({
          text: ' ',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: 0.95,
          },
          xi_api_key: this.apiKey,
          generation_config: {
            chunk_length_schedule: [120, 160, 250, 290],
          },
        }));
        resolve(true);
      };

      this.ws.onerror = (e) => {
        console.error('[EL Duplex] WebSocket error:', e);
        reject(new Error('ElevenLabs WebSocket connection failed'));
      };

      this.ws.onmessage = (event) => {
        this._handleMessage(event.data);
      };

      this.ws.onclose = () => {
        if (!this.isCancelled && this.audioQueue.length === 0) {
          this.onEnd?.();
        }
      };

      setTimeout(() => reject(new Error('ElevenLabs connection timeout')), 5000);
    });
  }

  async _handleMessage(data) {
    try {
      const msg = JSON.parse(data);

      if (msg.audio) {
        const pcmData = atob(msg.audio);
        const buffer = new ArrayBuffer(pcmData.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < pcmData.length; i++) {
          view[i] = pcmData.charCodeAt(i);
        }
        await this._playPCMChunk(buffer);
      }

      if (msg.isFinal) {
        if (this.audioQueue.length === 0 && !this.isPlaying) {
          this.onEnd?.();
        }
      }
    } catch {}
  }

  async _playPCMChunk(pcmBuffer) {
    if (this.isCancelled) return;

    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 24000 });
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Convert PCM Int16 to Float32
    const int16Array = new Int16Array(pcmBuffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    this.audioQueue.push(audioBuffer);
    if (!this.isPlaying) {
      this._drainQueue();
    }
  }

  _drainQueue() {
    if (this.audioQueue.length === 0 || this.isCancelled) {
      this.isPlaying = false;
      if (this.audioQueue.length === 0 && !this.isCancelled) {
        this.onEnd?.();
      }
      return;
    }

    this.isPlaying = true;
    this.onStart?.();
    const buffer = this.audioQueue.shift();
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    if (!this._startTime || this._startTime < this.audioContext.currentTime) {
      this._startTime = this.audioContext.currentTime;
    }

    source.start(this._startTime);
    this._startTime += buffer.duration;

    source.onended = () => {
      if (!this.isCancelled) this._drainQueue();
    };
  }

  /**
   * Stream text to ElevenLabs sentence by sentence.
   */
  sendText(text) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.isCancelled) return;
    this.ws.send(JSON.stringify({ text: text + ' ' }));
  }

  /**
   * Signal end of text stream.
   */
  flush() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ text: '' }));
  }

  /**
   * Immediately stop playback and cancel all queued audio.
   */
  cancel() {
    this.isCancelled = true;
    this.audioQueue = [];
    this.isPlaying = false;

    if (this.audioContext) {
      this.audioContext.suspend();
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  /**
   * Reset for reuse (same connection session).
   */
  reset() {
    this.isCancelled = false;
    this.audioQueue = [];
    this.isPlaying = false;
    this._startTime = null;
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  destroy() {
    this.cancel();
    this.audioContext?.close();
    this.audioContext = null;
  }
}

// Singleton instance per session
let elInstance = null;

export async function initElevenLabsDuplex(apiKey, voiceGender) {
  if (elInstance) {
    elInstance.destroy();
  }
  elInstance = new ElevenLabsDuplexTTS(apiKey, voiceGender);
  try {
    await elInstance.connect();
    return elInstance;
  } catch (err) {
    console.error('[EL Duplex] Init failed:', err);
    elInstance = null;
    return null;
  }
}

export function getElevenLabsInstance() {
  return elInstance;
}

export function destroyElevenLabsDuplex() {
  elInstance?.destroy();
  elInstance = null;
}
