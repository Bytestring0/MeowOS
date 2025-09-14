/**
 * 系统音频API
 * 用于处理音频播放、音量控制等功能
 */

import { eventBus } from './event';

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  cover?: string;
}

export interface AudioState {
  volume: number;
  muted: boolean;
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  playlist: AudioTrack[];
  repeatMode: 'none' | 'one' | 'all';
  shuffleMode: boolean;
}

// 定义音频事件类型
export enum AudioEvents {
  VolumeChange = 'audio:volumeChange',
  MuteChange = 'audio:muteChange',
  TrackChange = 'audio:trackChange',
  PlayStateChange = 'audio:playStateChange',
  TimeUpdate = 'audio:timeUpdate',
  DurationChange = 'audio:durationChange',
  PlaylistChange = 'audio:playlistChange',
  RepeatModeChange = 'audio:repeatModeChange',
  ShuffleModeChange = 'audio:shuffleModeChange',
  Error = 'audio:error'
}

class SystemAudio {
  private audioElement: HTMLAudioElement;
  private state: AudioState;

  constructor() {
    this.audioElement = new Audio();
    this.state = {
      volume: 75,
      muted: false,
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      playlist: [],
      repeatMode: 'none',
      shuffleMode: false
    };

    this.initializeAudioElement();
    this.loadVolumeFromStorage();
  }

  private initializeAudioElement() {
    this.audioElement.volume = this.state.volume / 100;
    this.audioElement.muted = this.state.muted;

    // 监听音频事件
    this.audioElement.addEventListener('loadedmetadata', () => {
      eventBus.emit(AudioEvents.DurationChange, this.audioElement.duration);
    });

    this.audioElement.addEventListener('timeupdate', () => {
      this.state.currentTime = this.audioElement.currentTime;
      eventBus.emit(AudioEvents.TimeUpdate, this.audioElement.currentTime);
    });

    this.audioElement.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audioElement.addEventListener('play', () => {
      this.state.isPlaying = true;
      eventBus.emit(AudioEvents.PlayStateChange, true);
    });

    this.audioElement.addEventListener('pause', () => {
      this.state.isPlaying = false;
      eventBus.emit(AudioEvents.PlayStateChange, false);
    });

    this.audioElement.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      eventBus.emit(AudioEvents.Error, e);
    });
  }

  private loadVolumeFromStorage() {
    const savedVolume = localStorage.getItem('system-volume');
    const savedMuted = localStorage.getItem('system-muted');
    
    if (savedVolume) {
      this.state.volume = parseInt(savedVolume);
      this.audioElement.volume = this.state.volume / 100;
    }
    
    if (savedMuted) {
      this.state.muted = savedMuted === 'true';
      this.audioElement.muted = this.state.muted;
    }
  }

  private saveVolumeToStorage() {
    localStorage.setItem('system-volume', this.state.volume.toString());
    localStorage.setItem('system-muted', this.state.muted.toString());
  }

  // 事件系统 - 使用全局事件总线
  on(event: string, callback: (...args: any[]) => void) {
    eventBus.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    eventBus.off(event, callback);
  }

  // 音量控制
  setVolume(volume: number) {
    volume = Math.max(0, Math.min(100, volume));
    this.state.volume = volume;
    this.audioElement.volume = volume / 100;
    this.saveVolumeToStorage();
    eventBus.emit(AudioEvents.VolumeChange, volume);
  }

  getVolume(): number {
    return this.state.volume;
  }

  toggleMute() {
    this.state.muted = !this.state.muted;
    this.audioElement.muted = this.state.muted;
    this.saveVolumeToStorage();
    eventBus.emit(AudioEvents.MuteChange, this.state.muted);
  }

  isMuted(): boolean {
    return this.state.muted;
  }

  // 播放控制
  async play() {
    if (this.state.currentTrack) {
      try {
        await this.audioElement.play();
      } catch (error) {
        console.error('Failed to play audio:', error);
        eventBus.emit(AudioEvents.Error, error);
      }
    }
  }

  pause() {
    this.audioElement.pause();
  }

  stop() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.state.currentTime = 0;
  }

  togglePlayPause() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // 进度控制
  seek(time: number) {
    if (this.audioElement.duration) {
      this.audioElement.currentTime = Math.max(0, Math.min(time, this.audioElement.duration));
    }
  }

  seekToPercent(percent: number) {
    if (this.audioElement.duration) {
      const time = (percent / 100) * this.audioElement.duration;
      this.seek(time);
    }
  }

  // 播放列表管理
  loadTrack(track: AudioTrack) {
    this.state.currentTrack = track;
    this.audioElement.src = track.url;
    eventBus.emit(AudioEvents.TrackChange, track);
  }

  setPlaylist(tracks: AudioTrack[]) {
    this.state.playlist = tracks;
    eventBus.emit(AudioEvents.PlaylistChange, tracks);
  }

  addToPlaylist(track: AudioTrack) {
    this.state.playlist.push(track);
    eventBus.emit(AudioEvents.PlaylistChange, this.state.playlist);
  }

  removeFromPlaylist(trackId: string) {
    this.state.playlist = this.state.playlist.filter(track => track.id !== trackId);
    eventBus.emit(AudioEvents.PlaylistChange, this.state.playlist);
  }

  // 播放模式
  setRepeatMode(mode: 'none' | 'one' | 'all') {
    this.state.repeatMode = mode;
    eventBus.emit(AudioEvents.RepeatModeChange, mode);
  }

  toggleShuffle() {
    this.state.shuffleMode = !this.state.shuffleMode;
    eventBus.emit(AudioEvents.ShuffleModeChange, this.state.shuffleMode);
  }

  // 下一首/上一首
  next() {
    if (this.state.playlist.length === 0) return;

    const currentIndex = this.getCurrentTrackIndex();
    let nextIndex: number;

    if (this.state.shuffleMode) {
      nextIndex = Math.floor(Math.random() * this.state.playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % this.state.playlist.length;
    }

    this.loadTrack(this.state.playlist[nextIndex]);
    if (this.state.isPlaying) {
      this.play();
    }
  }

  previous() {
    if (this.state.playlist.length === 0) return;

    const currentIndex = this.getCurrentTrackIndex();
    let prevIndex: number;

    if (this.state.shuffleMode) {
      prevIndex = Math.floor(Math.random() * this.state.playlist.length);
    } else {
      prevIndex = currentIndex > 0 ? currentIndex - 1 : this.state.playlist.length - 1;
    }

    this.loadTrack(this.state.playlist[prevIndex]);
    if (this.state.isPlaying) {
      this.play();
    }
  }

  private getCurrentTrackIndex(): number {
    if (!this.state.currentTrack) return -1;
    return this.state.playlist.findIndex(track => track.id === this.state.currentTrack!.id);
  }

  private handleTrackEnded() {
    switch (this.state.repeatMode) {
      case 'one':
        this.seek(0);
        this.play();
        break;
      case 'all':
        this.next();
        break;
      default:
        const currentIndex = this.getCurrentTrackIndex();
        if (currentIndex < this.state.playlist.length - 1) {
          this.next();
        } else {
          this.stop();
        }
        break;
    }
  }

  // 获取状态
  getState(): AudioState {
    return { ...this.state };
  }

  getCurrentTime(): number {
    return this.audioElement.currentTime;
  }

  getDuration(): number {
    return this.audioElement.duration || 0;
  }

  isPlaying(): boolean {
    return this.state.isPlaying;
  }

  getCurrentTrack(): AudioTrack | null {
    return this.state.currentTrack;
  }

  // 格式化时间
  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // 播放系统提示音
  playSystemSound(soundType: 'notification' | 'error' | 'success' | 'click') {
    // 这里可以播放系统提示音
    const frequencies = {
      notification: 800,
      error: 300,
      success: 1000,
      click: 1200
    };

    this.playTone(frequencies[soundType], 0.1, 0.1);
  }

  private playTone(frequency: number, duration: number, volume: number = 0.1) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }
}

// 创建全局实例
export const systemAudio = new SystemAudio();

// 默认导出
export default systemAudio;
