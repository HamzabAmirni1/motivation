// ZenStep Relaxation Sound Engine
// Uses Web Audio API synthesis for 100% reliable, instant, offline-capable relaxation sounds.
// Zero large downloads, zero broken URLs, infinite smooth loops!

let audioCtx = null;
let currentSound = null;
let masterGain = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.connect(audioCtx.destination);
      masterGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const SOUND_TRACKS = [
  { id: 'rain', name: 'مطر ناعم', nameEn: 'Gentle Rain', icon: '🌧️', category: 'nature', color: '#7dd3fc', desc: 'صوت قطرات المطر الهادئة لتصفية الذهن' },
  { id: 'ocean', name: 'أمواج المحيط', nameEn: 'Ocean Waves', icon: '🌊', category: 'nature', color: '#6ee7b7', desc: 'أمواج بحرية متتابعة لتهدئة الأعصاب' },
  { id: 'wind', name: 'نسيم الرياح', nameEn: 'Calm Wind', icon: '💨', category: 'nature', color: '#a78bfa', desc: 'رياح طبيعية هادئة تريح النفس' },
  { id: 'drone', name: 'تأمل زن (432Hz)', nameEn: 'Zen Meditation (432Hz)', icon: '🎵', category: 'music', color: '#fcd34d', desc: 'نغمات استرخاء نقية بتردد 432Hz للسلام الداخلي' },
  { id: 'night', name: 'هدوء الليل', nameEn: 'Night Serenade', icon: '🌙', category: 'nature', color: '#fda4af', desc: 'أجواء ليلية ساكنة للمساعدة على النوم العميق' },
];

export function setMasterVolume(volume) {
  const ctx = getAudioContext();
  if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);
  }
}

export function stopCurrentSound() {
  if (currentSound) {
    try {
      currentSound.stop();
    } catch (e) {}
    currentSound = null;
  }
}

export function playSound(trackId, volume = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  stopCurrentSound();
  setMasterVolume(volume);

  const gain = ctx.createGain();
  gain.connect(masterGain);

  if (trackId === 'rain') {
    // Generate pink noise filtered for rain
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    whiteNoise.start();

    currentSound = {
      stop: () => {
        try { whiteNoise.stop(); whiteNoise.disconnect(); } catch (e) {}
      }
    };
  } else if (trackId === 'ocean') {
    // Ocean: Brownian noise modulated by slow LFO
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 2.8;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    // LFO to swell wave
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 8 second wave cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(250, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(gain);
    noise.start();
    lfo.start();

    currentSound = {
      stop: () => {
        try { noise.stop(); lfo.stop(); noise.disconnect(); } catch (e) {}
      }
    };
  } else if (trackId === 'wind') {
    // Wind: Sweeping bandpass filtered noise
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(300, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(gain);
    noise.start();
    lfo.start();

    currentSound = {
      stop: () => {
        try { noise.stop(); lfo.stop(); noise.disconnect(); } catch (e) {}
      }
    };
  } else if (trackId === 'drone') {
    // 432 Hz Solfeggio / Zen chords
    const freqs = [216, 432, 540, 648];
    const oscs = freqs.map((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      return osc;
    });

    currentSound = {
      stop: () => {
        oscs.forEach(o => {
          try { o.stop(); o.disconnect(); } catch (e) {}
        });
      }
    };
  } else if (trackId === 'night') {
    // Night crickets / soothing ambient night tone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(4500, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(4530, ctx.currentTime);

    const amLfo = ctx.createOscillator();
    amLfo.type = 'square';
    amLfo.frequency.setValueAtTime(14, ctx.currentTime);

    const amGain = ctx.createGain();
    amGain.gain.setValueAtTime(0.04, ctx.currentTime);
    amLfo.connect(amGain.gain);

    osc1.connect(amGain);
    osc2.connect(amGain);
    amGain.connect(gain);

    osc1.start();
    osc2.start();
    amLfo.start();

    currentSound = {
      stop: () => {
        try { osc1.stop(); osc2.stop(); amLfo.stop(); } catch (e) {}
      }
    };
  }
}
