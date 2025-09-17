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

  // 完全清理音频系统 - 用于应用关闭时
  cleanup() {
    console.log('开始清理SystemAudio...');
    
    try {
      // 停止当前播放
      this.stop();
      
      // 停止所有音效
      this.stopSound();
      
      // 不要清空音频元素的src，只是暂停它
      // 清理连接标记，但保持音频元素可用
      (this.audioElement as any)._connectedToMeowOS = false;
      (this.audioElement as any)._meowosAudioSource = null;
      
      // 重置播放状态，但保留音轨信息和音量设置
      this.state.isPlaying = false;
      this.state.currentTime = 0;
      
      console.log('SystemAudio清理完成');
    } catch (error) {
      console.error('SystemAudio清理失败:', error);
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

  getAudioElement(): HTMLAudioElement {
    return this.audioElement;
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

  // 简单音频播放 API
  private soundElements: Map<string, HTMLAudioElement> = new Map();
  private soundTimeouts: Map<string, number> = new Map();

  /**
   * 播放音频文件
   * @param filePath 音频文件路径（相对于 public 目录）
   * @param options 播放选项
   */
  playSound(filePath: string, options: {
    loop?: boolean;          // 是否循环播放，默认 false
    duration?: number;       // 播放时长（秒），undefined 表示播放完整音频
    volume?: number;         // 音量 0-100，默认使用系统音量
    fade?: boolean;          // 是否淡入淡出效果，默认 false
    onEnd?: () => void;      // 播放结束回调
  } = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // 生成唯一标识符
        const soundId = `sound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 创建音频元素
        const audio = new Audio();
        
        // 设置音频源路径
        if (filePath.startsWith('/')) {
          audio.src = filePath;
        } else {
          audio.src = `/audio/${filePath}`;
        }
        
        // 应用选项
        audio.loop = options.loop || false;
        audio.volume = options.volume ? (options.volume / 100) : (this.state.volume / 100);
        
        // 存储音频元素
        this.soundElements.set(soundId, audio);
        
        // 播放完成处理
        const handleEnded = () => {
          if (!options.loop) {
            this.soundElements.delete(soundId);
            if (this.soundTimeouts.has(soundId)) {
              clearTimeout(this.soundTimeouts.get(soundId)!);
              this.soundTimeouts.delete(soundId);
            }
          }
          options.onEnd?.();
        };
        
        // 监听事件
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', (e) => {
          console.error('Sound playback error:', e);
          this.soundElements.delete(soundId);
          reject(new Error(`Failed to play sound: ${filePath}`));
        });
        
        audio.addEventListener('canplaythrough', () => {
          // 如果指定了播放时长，设置定时器
          if (options.duration && options.duration > 0) {
            const timeout = setTimeout(() => {
              if (options.fade) {
                this.fadeOutSound(soundId, 0.5).then(() => {
                  this.stopSound(soundId);
                });
              } else {
                this.stopSound(soundId);
              }
            }, options.duration * 1000);
            
            this.soundTimeouts.set(soundId, timeout);
          }
          
          resolve(soundId);
        });
        
        // 开始播放
        if (options.fade) {
          audio.volume = 0;
          audio.play().then(() => {
            this.fadeInSound(soundId, 0.5, options.volume ? (options.volume / 100) : (this.state.volume / 100));
          });
        } else {
          audio.play();
        }
        
      } catch (error) {
        console.error('Error creating sound:', error);
        reject(error);
      }
    });
  }

  /**
   * 停止指定音频
   * @param soundId 音频ID，如果不提供则停止所有音频
   */
  stopSound(soundId?: string): void {
    if (soundId) {
      const audio = this.soundElements.get(soundId);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        this.soundElements.delete(soundId);
        
        if (this.soundTimeouts.has(soundId)) {
          clearTimeout(this.soundTimeouts.get(soundId)!);
          this.soundTimeouts.delete(soundId);
        }
      }
    } else {
      // 停止所有音频
      this.soundElements.forEach((audio, id) => {
        audio.pause();
        audio.currentTime = 0;
        
        if (this.soundTimeouts.has(id)) {
          clearTimeout(this.soundTimeouts.get(id)!);
          this.soundTimeouts.delete(id);
        }
      });
      
      this.soundElements.clear();
      this.soundTimeouts.clear();
    }
  }

  /**
   * 暂停指定音频
   * @param soundId 音频ID
   */
  pauseSound(soundId: string): void {
    const audio = this.soundElements.get(soundId);
    if (audio) {
      audio.pause();
    }
  }

  /**
   * 恢复播放指定音频
   * @param soundId 音频ID
   */
  resumeSound(soundId: string): void {
    const audio = this.soundElements.get(soundId);
    if (audio) {
      audio.play();
    }
  }

  /**
   * 设置指定音频的音量
   * @param soundId 音频ID
   * @param volume 音量 0-100
   */
  setSoundVolume(soundId: string, volume: number): void {
    const audio = this.soundElements.get(soundId);
    if (audio) {
      audio.volume = Math.max(0, Math.min(100, volume)) / 100;
    }
  }

  /**
   * 获取当前播放的音频列表
   */
  getActiveSounds(): string[] {
    return Array.from(this.soundElements.keys());
  }

  /**
   * 检查指定音频是否正在播放
   * @param soundId 音频ID
   */
  isSoundPlaying(soundId: string): boolean {
    const audio = this.soundElements.get(soundId);
    return audio ? !audio.paused : false;
  }

  /**
   * 淡入效果
   * @param soundId 音频ID
   * @param duration 淡入时长（秒）
   * @param targetVolume 目标音量
   */
  private fadeInSound(soundId: string, duration: number, targetVolume: number): Promise<void> {
    return new Promise((resolve) => {
      const audio = this.soundElements.get(soundId);
      if (!audio) {
        resolve();
        return;
      }

      const startVolume = 0;
      const volumeStep = targetVolume / (duration * 20); // 50ms 间隔
      let currentVolume = startVolume;

      const fadeInterval = setInterval(() => {
        currentVolume += volumeStep;
        if (currentVolume >= targetVolume) {
          audio.volume = targetVolume;
          clearInterval(fadeInterval);
          resolve();
        } else {
          audio.volume = currentVolume;
        }
      }, 50);
    });
  }

  /**
   * 淡出效果
   * @param soundId 音频ID
   * @param duration 淡出时长（秒）
   */
  private fadeOutSound(soundId: string, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const audio = this.soundElements.get(soundId);
      if (!audio) {
        resolve();
        return;
      }

      const startVolume = audio.volume;
      const volumeStep = startVolume / (duration * 20); // 50ms 间隔
      let currentVolume = startVolume;

      const fadeInterval = setInterval(() => {
        currentVolume -= volumeStep;
        if (currentVolume <= 0) {
          audio.volume = 0;
          clearInterval(fadeInterval);
          resolve();
        } else {
          audio.volume = currentVolume;
        }
      }, 50);
    });
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
