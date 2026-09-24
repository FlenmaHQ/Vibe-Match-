// Real Audio Player Service for in-app legitimate 30-second music previews
import { Song } from '../types';
import { audioPlayer } from './audioSynthesizer';

export interface PlaybackState {
  activeSongId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0 to 1
  error: string | null;
  isSynthesizerMode?: boolean;
}

type Listener = (state: PlaybackState) => void;

function moodToToneType(mood?: string): 'dreamy' | 'chill' | 'cinematic' | 'upbeat' | 'acoustic' | 'ambient' | 'dark' | 'synth' {
  switch (mood) {
    case 'Cute': return 'acoustic';
    case 'Happy': return 'upbeat';
    case 'Peaceful': return 'ambient';
    case 'Energetic': return 'synth';
    case 'Romantic': return 'chill';
    case 'Nostalgic': return 'acoustic';
    case 'Cinematic': return 'cinematic';
    case 'Dark': return 'dark';
    case 'Travel': return 'upbeat';
    case 'Friendship': return 'acoustic';
    case 'Dreamy':
    default:
      return 'dreamy';
  }
}

class AudioPlayerService {
  private audio: HTMLAudioElement | null = null;
  private synthInterval: any = null;
  private state: PlaybackState = {
    activeSongId: null,
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 30,
    progress: 0,
    error: null,
    isSynthesizerMode: false,
  };
  private listeners = new Set<Listener>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'none';

      this.audio.addEventListener('loadstart', () => {
        this.updateState({ isLoading: true, error: null });
      });

      this.audio.addEventListener('canplay', () => {
        this.updateState({ isLoading: false });
      });

      this.audio.addEventListener('play', () => {
        this.updateState({ isPlaying: true, isLoading: false, error: null, isSynthesizerMode: false });
      });

      this.audio.addEventListener('pause', () => {
        this.updateState({ isPlaying: false, isLoading: false });
      });

      this.audio.addEventListener('timeupdate', () => {
        if (!this.audio) return;
        const current = this.audio.currentTime;
        const dur = this.audio.duration || 30;
        this.updateState({
          currentTime: current,
          duration: dur,
          progress: dur > 0 ? Math.min(1, current / dur) : 0,
        });
      });

      this.audio.addEventListener('ended', () => {
        this.updateState({
          isPlaying: false,
          currentTime: 0,
          progress: 0,
        });
      });

      this.audio.addEventListener('error', () => {
        console.warn('[AudioPlayerService] Audio playback error on URL:', this.audio?.src);
        // If external audio stream fails, fallback smoothly to mood harmonic synthesizer
        if (this.state.activeSongId) {
          this.playSynthesizerFallback(this.state.activeSongId, 'dreamy');
        }
      });
    }
  }

  private updateState(partial: Partial<PlaybackState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('[AudioPlayerService] Listener error:', err);
      }
    }
  }

  public subscribe(cb: Listener): () => void {
    this.listeners.add(cb);
    cb(this.state);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public getState(): PlaybackState {
    return this.state;
  }

  private playSynthesizerFallback(songId: string, toneType: string = 'dreamy') {
    if (this.audio) {
      this.audio.pause();
    }
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }

    audioPlayer.playTone(toneType, songId, 30);

    const startTime = Date.now();
    this.updateState({
      activeSongId: songId,
      isPlaying: true,
      isLoading: false,
      isSynthesizerMode: true,
      duration: 30,
      currentTime: 0,
      progress: 0,
      error: null,
    });

    this.synthInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= 30) {
        this.stop();
      } else {
        this.updateState({
          currentTime: elapsed,
          progress: Math.min(1, elapsed / 30),
        });
      }
    }, 200);
  }

  public async playSong(song: Song): Promise<void> {
    const songId = song.id;

    if (this.state.activeSongId === songId && this.state.isPlaying) {
      return;
    }

    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    audioPlayer.stop();

    let previewUrl = song.previewUrl;

    // If previewUrl is not yet resolved, dynamically query server endpoint
    if (!previewUrl) {
      this.updateState({
        activeSongId: songId,
        isLoading: true,
        error: null,
      });

      try {
        const queryParams = new URLSearchParams({
          title: song.title,
          artist: song.artist,
          language: song.language || '',
          genre: song.genre || '',
        });
        const res = await fetch(`/api/music/resolve-preview?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.previewUrl) {
            previewUrl = data.previewUrl;
            song.previewUrl = data.previewUrl;
            if (data.artworkUrl && !song.artworkUrl) song.artworkUrl = data.artworkUrl;
            if (data.listenUrl) song.listenUrl = data.listenUrl;
          }
        }
      } catch (err) {
        console.warn('[AudioPlayerService] resolve error:', err);
      }
    }

    // Play real audio stream if found
    if (previewUrl && this.audio) {
      try {
        if (this.audio.src !== previewUrl || this.state.activeSongId !== songId) {
          this.audio.pause();
          this.audio.src = previewUrl;
          this.audio.currentTime = 0;
        }

        this.updateState({
          activeSongId: songId,
          isLoading: true,
          isSynthesizerMode: false,
          error: null,
        });

        await this.audio.play();
        this.updateState({ isPlaying: true, isLoading: false });
        return;
      } catch (err) {
        console.warn('[AudioPlayerService] HTMLAudio play failed, activating smooth harmonic mood fallback:', err);
      }
    }

    // Fallback if audio URL is blocked, offline, or unavailable: Web Audio melodic mood synth
    const toneType = song.audioToneType || moodToToneType(song.mood);
    this.playSynthesizerFallback(songId, toneType);
  }

  public async play(songId: string, previewUrl?: string | null): Promise<void> {
    if (previewUrl && this.audio) {
      if (this.audio.src !== previewUrl || this.state.activeSongId !== songId) {
        this.audio.pause();
        this.audio.src = previewUrl;
        this.audio.currentTime = 0;
      }
      this.updateState({
        activeSongId: songId,
        isLoading: true,
        isSynthesizerMode: false,
        error: null,
      });
      try {
        await this.audio.play();
        this.updateState({ isPlaying: true, isLoading: false });
        return;
      } catch (err) {
        console.warn('[AudioPlayerService] play error:', err);
      }
    }

    this.playSynthesizerFallback(songId, 'dreamy');
  }

  public pause(): void {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    audioPlayer.stop();

    if (this.audio && this.state.isPlaying) {
      this.audio.pause();
    }
    this.updateState({ isPlaying: false, isLoading: false });
  }

  public toggleSong(song: Song): void {
    if (this.state.activeSongId === song.id) {
      if (this.state.isPlaying) {
        this.pause();
      } else {
        this.playSong(song);
      }
    } else {
      this.playSong(song);
    }
  }

  public toggle(songId: string, previewUrl?: string | null): void {
    if (this.state.activeSongId === songId && this.state.isPlaying) {
      this.pause();
    } else {
      this.play(songId, previewUrl);
    }
  }

  public stop(): void {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    audioPlayer.stop();

    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.updateState({
      activeSongId: null,
      isPlaying: false,
      isLoading: false,
      isSynthesizerMode: false,
      currentTime: 0,
      progress: 0,
      error: null,
    });
  }

  public seek(ratio: number): void {
    if (this.state.isSynthesizerMode) {
      const target = Math.max(0, Math.min(30, ratio * 30));
      this.updateState({
        currentTime: target,
        progress: ratio,
      });
      return;
    }

    if (this.audio && this.audio.duration) {
      const target = Math.max(0, Math.min(this.audio.duration, ratio * this.audio.duration));
      this.audio.currentTime = target;
      this.updateState({
        currentTime: target,
        progress: target / this.audio.duration,
      });
    }
  }
}

export const audioPlayerService = new AudioPlayerService();
