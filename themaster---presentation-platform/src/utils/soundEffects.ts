// Web Audio API Sound Effects Engine for Executive Presentations (Zero external file dependencies)
class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Sound effect for wheel rotation / dial ratchet swoosh
   */
  public playRotateSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Soft whoosh sweep filter
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.3);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);

      // 2. High-precision mechanical click / tactile pulse
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();

      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(950, now);
      clickOsc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

      clickGain.gain.setValueAtTime(0.12, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);

      clickOsc.start(now);
      clickOsc.stop(now + 0.07);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Sound effect for slide transition
   */
  public playSlideSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.22);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  /**
   * Crisp tactile mechanical typewriter keystroke sound effect (Procedural Web Audio)
   */
  public playKeyClickSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Randomized subtle pitch variation for realistic tactile keystrokes
      const baseFreq = 950 + (Math.random() * 350 - 175);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  private kindredAudio: HTMLAudioElement | null = null;
  private beautifulThingsAudio: HTMLAudioElement | null = null;
  private beautifulThingsVolume: number = 0.03; // Nhạc nền nhỏ nhẹ, êm ái mức 3% theo yêu cầu
  private kindredVolume: number = 0.15; // Giảm âm lượng nhạc kịch tính tránh chói tai
  private isMuted: boolean = false;
  private listeners: (() => void)[] = [];

  public subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {}
    });
  }

  public getBgmVolume(): number {
    return this.beautifulThingsVolume;
  }

  public setBgmVolume(volume: number) {
    this.beautifulThingsVolume = Math.max(0, Math.min(1, volume));
    if (this.beautifulThingsAudio) {
      this.beautifulThingsAudio.volume = this.isMuted ? 0 : this.beautifulThingsVolume;
    }
    this.notify();
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.beautifulThingsAudio) {
      this.beautifulThingsAudio.volume = this.isMuted ? 0 : this.beautifulThingsVolume;
    }
    if (this.kindredAudio) {
      this.kindredAudio.volume = this.isMuted ? 0 : this.kindredVolume;
    }
    this.notify();
    return this.isMuted;
  }

  /**
   * Play Beautiful Things background music gently (0.07 volume)
   */
  public playBeautifulThingsBgm(restartFromBeginning: boolean = false) {
    if (!this.enabled) return;
    try {
      if (!this.beautifulThingsAudio) {
        this.beautifulThingsAudio = new Audio(
          '/assets/sounds/Benson Boone - Beautiful Things (Lyrics) - 7clouds Rock.mp3'
        );
        this.beautifulThingsAudio.loop = true;
      }
      this.beautifulThingsAudio.volume = this.isMuted ? 0 : this.beautifulThingsVolume;
      if (!this.beautifulThingsAudio.paused && !restartFromBeginning) {
        return;
      }
      if (restartFromBeginning) {
        this.beautifulThingsAudio.currentTime = 0;
      }
      this.beautifulThingsAudio.play().catch(() => {});
    } catch (e) {}
  }

  public pauseBeautifulThingsBgm() {
    try {
      if (this.beautifulThingsAudio && !this.beautifulThingsAudio.paused) {
        this.beautifulThingsAudio.pause();
      }
    } catch (e) {}
  }

  public stopBeautifulThingsBgm() {
    try {
      if (this.beautifulThingsAudio) {
        this.beautifulThingsAudio.pause();
        this.beautifulThingsAudio.currentTime = 0;
      }
    } catch (e) {}
  }

  // Aliases for compatibility with earlier calls
  public playWindyHillBgm(restartFromBeginning: boolean = false) {
    this.playBeautifulThingsBgm(restartFromBeginning);
  }

  public pauseWindyHillBgm() {
    this.pauseBeautifulThingsBgm();
  }

  public stopWindyHillBgm() {
    this.stopBeautifulThingsBgm();
  }

  public playKindredBgm(restartFromBeginning: boolean = false) {
    if (!this.enabled) return;
    try {
      if (!this.kindredAudio) {
        this.kindredAudio = new Audio(
          '/assets/sounds/Kindred, the Eternal Hunters (From League of Legends Season 5) - League Of Legends.mp3'
        );
        this.kindredAudio.loop = true;
      }
      this.kindredAudio.volume = this.isMuted ? 0 : this.kindredVolume;
      if (!this.kindredAudio.paused && !restartFromBeginning) {
        return;
      }
      if (restartFromBeginning) {
        this.kindredAudio.currentTime = 0;
      }
      this.kindredAudio.play().catch(() => {});
    } catch (e) {}
  }

  public pauseKindredBgm() {
    try {
      if (this.kindredAudio && !this.kindredAudio.paused) {
        this.kindredAudio.pause();
      }
    } catch (e) {}
  }

  public stopKindredBgm() {
    try {
      if (this.kindredAudio) {
        this.kindredAudio.pause();
        this.kindredAudio.currentTime = 0;
      }
    } catch (e) {}
  }

  private failAudio: HTMLAudioElement | null = null;

  /**
   * Play Fail Sound Effect
   */
  public playFailSound() {
    if (!this.enabled) return;
    try {
      if (!this.failAudio) {
        this.failAudio = new Audio(
          '/assets/sounds/Fail Sound Effect - Sound Effects.mp3'
        );
        this.failAudio.volume = 0.35;
      }
      this.failAudio.currentTime = 0;
      this.failAudio.play().catch(() => {});
    } catch (e) {}
  }

  public playCreepyTypeSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Hollow tactile mechanical clack
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      const baseFreq = 340 + Math.random() * 120;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.Q.setValueAtTime(5.0, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);

      // 2. High-frequency typewriter metal snap
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'square';
      snapOsc.frequency.setValueAtTime(1800 + Math.random() * 400, now);
      snapOsc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

      snapGain.gain.setValueAtTime(0.06, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);

      snapOsc.start(now);
      snapOsc.stop(now + 0.025);
    } catch (e) {}
  }
}

export const soundEffects = new SoundEffectsEngine();
