export const playNotificationSound = (type: 'slice' | 'break' | 'work') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'slice') {
      // rapid sci-fi rising square wave
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(880, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.25);
      gain2.gain.setValueAtTime(0, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.1, now + 0.17);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.3);
    } else if (type === 'break') {
      // three descending sine wave tones
      const now = ctx.currentTime;
      const playSine = (freq: number, delay: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.3, now + delay + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);
        osc.start(now + delay);
        osc.stop(now + delay + 0.6);
      };
      playSine(659.25, 0);   // E5
      playSine(523.25, 0.4); // C5
      playSine(440.00, 0.8); // A4
    } else if (type === 'work') {
      // three rapid ascending triangle wave tones
      const now = ctx.currentTime;
      const playTri = (freq: number, delay: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
        osc.start(now + delay);
        osc.stop(now + delay + 0.3);
      };
      playTri(440.00, 0);    // A4
      playTri(554.37, 0.15); // C#5
      playTri(659.25, 0.3);  // E5
    }
  } catch (e) {
    console.error('Audio play failed', e);
  }
};

export const playChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playNote = (frequency: number, delay: number, duration: number, maxVol: number) => {
      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      // Gentle attack
      gain.gain.linearRampToValueAtTime(maxVol, startTime + 0.05);
      // Soothing decay
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Soothing but audible "Ding-Ding"
    playNote(1046.50, 0, 1.5, 0.3);       // C6
    playNote(1318.51, 0.2, 2.0, 0.3);     // E6

  } catch (e) {
    console.error('Audio play failed', e);
  }
};
