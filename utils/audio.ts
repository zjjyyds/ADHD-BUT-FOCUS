export const playChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playNote = (frequency: number, delay: number, maxVol: number) => {
      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const duration = 2.5;

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine'; // Sine waves are the most soothing
      osc.frequency.setValueAtTime(frequency, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      // Gentle attack (fade in)
      gain.gain.linearRampToValueAtTime(maxVol, startTime + 0.2);
      // Long soothing decay (fade out)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Play a gentle C Major arpeggio: C5, E5, G5
    playNote(523.25, 0, 0.15);       // C5
    playNote(659.25, 0.15, 0.12);    // E5
    playNote(783.99, 0.3, 0.08);     // G5

  } catch (e) {
    console.error('Audio play failed', e);
  }
};
