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
