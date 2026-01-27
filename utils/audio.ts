
// Simple synthesizer for UI sound effects using Web Audio API
// This avoids external dependencies and ensures offline functionality

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
};

export const SOUND_OPTIONS = [
  { id: 'thud', label: '沉穩' },
  { id: 'pop', label: '氣泡' },
  { id: 'ding', label: '清脆' },
  { id: 'retro', label: '復古' },
  { id: 'soft', label: '輕柔' },
];

export const playStampSound = (soundId: string = 'thud') => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    switch (soundId) {
      case 'pop':
        // Pop sound: Sine wave with quick frequency drop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'ding':
        // Ding sound: High sine wave with longer decay
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.0);
        break;

      case 'retro':
        // Retro sound: Square wave arpeggio (Coin style)
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;

      case 'soft':
        // Soft sound: Sine wave, lower frequency, gentle envelope
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.2);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case 'thud':
      default:
        // Default "Thud": Filtered triangle wave
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.8, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.25);
        break;
    }

  } catch (e) {
    console.warn("Audio play failed", e);
  }
};

export const playUnlockSound = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    
    // Simple arpeggio (C Major 7: C, E, G, B)
    [523.25, 659.25, 783.99, 987.77].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } catch (e) {
    console.warn("Audio play failed", e);
  }
};
