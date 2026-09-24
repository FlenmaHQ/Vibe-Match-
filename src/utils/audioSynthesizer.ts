// Lightweight browser Web Audio API melodic synthesizer for previewing vibe tones

class VibeAudioPlayer {
  private ctx: AudioContext | null = null;
  private currentGain: GainNode | null = null;
  private timer: number | null = null;
  private isPlaying: boolean = false;
  private currentSongId: string | null = null;
  private onStateChange: ((isPlaying: boolean, songId: string | null) => void) | null = null;

  public subscribe(cb: (isPlaying: boolean, songId: string | null) => void) {
    this.onStateChange = cb;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTone(toneType: string, songId: string, durationSeconds: number = 18) {
    this.stop();
    this.initContext();

    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentSongId = songId;
    if (this.onStateChange) this.onStateChange(true, songId);

    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.18, now + 1.2);
    masterGain.connect(this.ctx.destination);
    this.currentGain = masterGain;

    // Chord root frequencies (in Hz)
    const chords: { [key: string]: number[][] } = {
      dreamy: [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [220.0, 261.63, 329.63, 392.0], // Am7
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [196.0, 246.94, 293.66, 392.0], // G
      ],
      chill: [
        [146.83, 220.0, 261.63, 329.63], // Dm7
        [196.0, 246.94, 293.66, 349.23], // G7
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [220.0, 261.63, 329.63, 392.0], // Am7
      ],
      cinematic: [
        [130.81, 196.0, 261.63, 311.13], // Cm
        [116.54, 174.61, 233.08, 277.18], // Bb
        [103.83, 155.56, 207.65, 261.63], // Ab
        [196.0, 246.94, 293.66, 392.0], // G
      ],
      upbeat: [
        [261.63, 329.63, 392.0], // C
        [196.0, 246.94, 293.66], // G
        [220.0, 261.63, 329.63], // Am
        [174.61, 220.0, 261.63], // F
      ],
      acoustic: [
        [196.0, 246.94, 293.66, 392.0], // G
        [146.83, 220.0, 293.66, 369.99], // D
        [164.81, 196.0, 246.94, 329.63], // Em
        [130.81, 164.81, 196.0, 261.63], // C
      ],
      dark: [
        [110.0, 164.81, 220.0, 261.63], // Am
        [103.83, 155.56, 207.65], // Ab dim
        [98.0, 146.83, 196.0], // G
        [92.5, 138.59, 185.0], // F#
      ],
      ambient: [
        [220.0, 277.18, 329.63, 415.3], // A maj7
        [164.81, 207.65, 246.94, 329.63], // E
        [146.83, 185.0, 220.0, 277.18], // D maj7
        [220.0, 277.18, 329.63, 440.0], // A
      ],
      synth: [
        [130.81, 196.0, 261.63, 329.63], // C
        [155.56, 233.08, 311.13], // Eb
        [174.61, 261.63, 349.23], // F
        [196.0, 293.66, 392.0], // G
      ],
    };

    const progression = chords[toneType] || chords.dreamy;
    const oscType: OscillatorType =
      toneType === 'dark' || toneType === 'synth'
        ? 'sawtooth'
        : toneType === 'acoustic'
        ? 'triangle'
        : 'sine';

    let step = 0;
    const stepInterval = 2.4; // seconds per chord
    const totalSteps = Math.floor(durationSeconds / stepInterval);

    for (let s = 0; s < totalSteps; s++) {
      const chord = progression[s % progression.length];
      const chordStart = now + s * stepInterval;

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = oscType;
        // subtle detune for warm vintage vibe
        osc.frequency.setValueAtTime(freq + (idx % 2 === 0 ? 0.4 : -0.4), chordStart);

        // Lowpass filter for smooth warmth
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(toneType === 'synth' ? 1400 : 850, chordStart);

        // Envelope
        noteGain.gain.setValueAtTime(0.001, chordStart);
        noteGain.gain.linearRampToValueAtTime(0.12 / chord.length, chordStart + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.001, chordStart + stepInterval);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(chordStart);
        osc.stop(chordStart + stepInterval);
      });
      step++;
    }

    // Auto cleanup after duration
    this.timer = window.setTimeout(() => {
      this.stop();
    }, durationSeconds * 1000);
  }

  public stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.currentGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, now);
        this.currentGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      } catch {
        // Safe ignore
      }
      this.currentGain = null;
    }
    this.isPlaying = false;
    this.currentSongId = null;
    if (this.onStateChange) this.onStateChange(false, null);
  }

  public toggle(toneType: string, songId: string) {
    if (this.isPlaying && this.currentSongId === songId) {
      this.stop();
    } else {
      this.playTone(toneType, songId);
    }
  }

  public getActiveSongId() {
    return this.currentSongId;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }
}

export const audioPlayer = new VibeAudioPlayer();
