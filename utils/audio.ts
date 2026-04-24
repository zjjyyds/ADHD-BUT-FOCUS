export const playChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Crisp, short bell sound
    const playNote = (frequency: number, delay: number, duration: number) => {
      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      // Fast attack for crispness, with moderate volume
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.01);
      // Quick decay to make it short
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Very short, crisp high-pitched "Ding-Ding"
    playNote(1046.50, 0, 0.3);       // C6
    playNote(1318.51, 0.15, 0.5);    // E6

  } catch (e) {
    console.error('Audio play failed', e);
  }
};
