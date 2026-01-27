
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

export const playStampSound = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Filter to make it sound more like paper/ink thud
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Deep "thud" sound
    osc.type = 'triangle'; // Triangle has a bit more body than sine
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);

    // Quick attack, quick decay
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
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
