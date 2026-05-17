'use client';

// Configure ONNX to use the local /public path
if (typeof window !== 'undefined') {
  window.ortWasmPaths = {
    'ort-wasm.wasm':          '/ort-wasm/ort-wasm.wasm',
    'ort-wasm-simd.wasm':     '/ort-wasm/ort-wasm-simd.wasm',
    'ort-wasm-threaded.wasm': '/ort-wasm/ort-wasm-threaded.wasm',
    'ort-wasm-simd-threaded.wasm': '/ort-wasm/ort-wasm-simd-threaded.wasm',
  };
}

let vadInstance = null;
let vadInitPromise = null;
let currentStream = null;

/**
 * Check mic permission state before trying to init VAD.
 * Returns: 'granted' | 'denied' | 'prompt' | 'unknown'
 */
async function checkMicPermission() {
  if (!navigator.permissions) return 'unknown';
  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    return result.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    return 'unknown';
  }
}

/**
 * Request mic access explicitly first.
 * This ensures the browser permission dialog shows BEFORE
 * we try to initialize VAD.
 */
async function requestMicAccess() {
  try {
    currentStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    return { success: true, stream: currentStream };
  } catch (err) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return { success: false, reason: 'permission_denied' };
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return { success: false, reason: 'no_microphone' };
    }
    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      return { success: false, reason: 'mic_in_use' };
    }
    return { success: false, reason: 'unknown', error: err.message };
  }
}

/**
 * Fallback STT when VAD fails — uses browser's built-in Speech Recognition
 */
function initFallbackSTT({ onResult, onError }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError('Speech recognition not supported. Use Chrome or Edge.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-IN'; // Indian English

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    if (transcript.trim()) onResult(transcript.trim());
  };

  recognition.onerror = (event) => {
    if (event.error === 'not-allowed') {
      onError('Microphone permission denied. Allow microphone and try again.');
    }
  };

  // Auto-restart on end (continuous mode sometimes stops)
  recognition.onend = () => {
    try { recognition.start(); } catch {}
  };

  try {
    recognition.start();
    return recognition;
  } catch (e) {
    onError('Could not start speech recognition: ' + e.message);
    return null;
  }
}

/**
 * Main VAD initialization. Call this ONLY after user clicks the Duplex toggle.
 * Must be called inside a user gesture handler (click event).
 */
export async function initDuplex({ onSpeechStart, onSpeechEnd, onVADMisfire, onError }) {
  // Prevent double-init
  if (vadInitPromise) return vadInitPromise;

  vadInitPromise = _initDuplexInternal({ onSpeechStart, onSpeechEnd, onVADMisfire, onError });
  return vadInitPromise;
}

async function _initDuplexInternal({ onSpeechStart, onSpeechEnd, onVADMisfire, onError }) {
  try {
    // Step 1: Check if we're in a secure context
    if (!window.isSecureContext) {
      onError('HTTPS required for microphone access. Use localhost or a HTTPS URL.');
      return false;
    }

    // Step 2: Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      onError('Your browser doesn\'t support microphone access. Please use Chrome or Edge.');
      return false;
    }

    // Step 3: Check permission state
    const permState = await checkMicPermission();
    if (permState === 'denied') {
      onError('Microphone permission was denied. Click the 🔒 icon in your browser address bar → allow microphone → refresh the page.');
      return false;
    }

    // Step 4: Request mic access (shows browser dialog if needed)
    const micResult = await requestMicAccess();
    if (!micResult.success) {
      const messages = {
        permission_denied: 'Microphone access denied. Click the lock icon in the address bar, allow the microphone, and refresh.',
        no_microphone:     'No microphone found. Please connect a microphone and try again.',
        mic_in_use:        'Microphone is being used by another app. Close other apps using the mic and try again.',
        unknown:           'Could not access microphone. Check your browser settings.',
      };
      onError(messages[micResult.reason] || messages.unknown);
      return false;
    }

    // Step 5: Resume AudioContext (must be in user gesture)
    if (window.sharedAudioContext && window.sharedAudioContext.state === 'suspended') {
      await window.sharedAudioContext.resume();
    }

    // Step 6: Dynamic import VAD (avoids SSR issues)
    const vadModule = await import('@ricky0123/vad-web');

    // Step 7: Initialize VAD with the stream we already have
    vadInstance = await vadModule.MicVAD.new({
      stream: micResult.stream, // Pass existing stream — avoid double permission request

      // Paths for WASM/model files served from /public
      workletURL: '/vad/vad.worklet.bundle.min.js',
      modelURL:   '/vad/silero_vad.onnx',
      ortConfig:  (ort) => {
        ort.env.wasm.wasmPaths = '/ort-wasm/';
        ort.env.wasm.numThreads = 1; // Single thread — more compatible
      },

      // Detection thresholds
      positiveSpeechThreshold: 0.5,
      negativeSpeechThreshold: 0.35,
      redemptionFrames: 10,
      minSpeechFrames: 5,
      preSpeechPadFrames: 5,

      onSpeechStart,
      onSpeechEnd,
      onVADMisfire,
    });

    vadInstance.start();
    return true;

  } catch (err) {
    console.error('[Duplex] VAD init failed:', err);

    // Parse the error and give a human-readable message
    let userMessage = 'Duplex failed to start. ';

    if (err.message?.includes('wasm')) {
      userMessage += 'WASM files could not be loaded. Try refreshing the page.';
    } else if (err.message?.includes('AudioContext')) {
      userMessage += 'Audio system error. Try clicking somewhere on the page first, then toggle Duplex again.';
    } else if (err.message?.includes('SharedArrayBuffer')) {
      userMessage += 'Your browser needs HTTPS with specific headers. Check the setup guide.';
    } else {
      userMessage += err.message || 'Unknown error. Check the browser console for details.';
    }

    // Try fallback STT
    console.log('[Duplex] VAD failed, trying browser Speech Recognition fallback...');
    const fallbackResult = initFallbackSTT({
      onResult: (text) => onSpeechEnd(text),
      onError: (msg) => onError(msg),
    });
    if (fallbackResult) {
      console.log('[Duplex] Fallback STT active (browser built-in)');
      vadInitPromise = null; // Allow re-init attempt later
      return true; // Partial success — no VAD, but STT works
    }

    onError(userMessage);
    vadInitPromise = null; // Allow retry
    return false;
  }
}

export function stopDuplex() {
  if (vadInstance) {
    vadInstance.pause();
    vadInstance.destroy?.();
    vadInstance = null;
  }
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
    currentStream = null;
  }
  vadInitPromise = null;
}

export function pauseDuplex() {
  vadInstance?.pause();
}

export function resumeDuplex() {
  vadInstance?.start();
}
