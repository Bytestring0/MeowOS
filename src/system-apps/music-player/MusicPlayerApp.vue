<template>
  <div class="music-player">
    <!-- 当前播放信息 -->
    <div class="now-playing" v-if="currentTrack">
      <div class="track-cover">
        <img v-if="currentTrack.cover" :src="currentTrack.cover" :alt="currentTrack.title" />
        <div v-else class="default-cover">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
      </div>
      <div class="track-info">
        <h3 class="track-title">{{ currentTrack.title }}</h3>
        <p class="track-artist">{{ currentTrack.artist }}</p>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-section" v-if="currentTrack">
      <div class="time-display">
        <span class="current-time">{{ formatTime(currentTime) }}</span>
        <span class="duration">{{ formatTime(duration) }}</span>
      </div>
      <div class="progress-bar" @click="seekTo">
        <div class="progress-track"></div>
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- 播放控制 -->
    <div class="player-controls">
      <button @click="toggleShuffle" :class="{ active: shuffleMode }" class="control-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
        </svg>
      </button>
      <button @click="previous" class="control-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
        </svg>
      </button>
      <button @click="togglePlayPause" class="play-btn">
        <svg v-if="!isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      </button>
      <button @click="next" class="control-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
        </svg>
      </button>
      <button @click="toggleRepeat" :class="{ active: repeatMode !== 'none' }" class="control-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path v-if="repeatMode === 'one'" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zM13 15.5h-2v-3.5h2v3.5zm0-5h-2V8h2v2.5z"/>
          <path v-else d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
        </svg>
      </button>
    </div>

    <!-- 音量控制 -->
    <div class="volume-section">
      <button @click="toggleMute" class="volume-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path v-if="!isMuted && volume > 50" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          <path v-else-if="!isMuted && volume > 0" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          <path v-else-if="!isMuted" d="M3 9v6h4l5 5V4L7 9H3z"/>
          <path v-else d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      </button>
      <div class="volume-slider">
        <input type="range" v-model="volume" @input="setVolume" min="0" max="100" />
      </div>
    </div>

    <!-- 播放列表 -->
    <div class="playlist-section">
      <div class="section-header">
        <h3>播放列表</h3>
        <button @click="showAddTrackDialog = true" class="add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>
      <div class="playlist">
        <div 
          v-for="(track, index) in playlist" 
          :key="track.id"
          :class="['track-item', { active: currentTrack?.id === track.id }]"
          @click="playTrack(track)"
          @dblclick="playTrack(track)"
        >
          <div class="track-number">{{ index + 1 }}</div>
          <div class="track-details">
            <div class="track-name">{{ track.title }}</div>
            <div class="track-artist-name">{{ track.artist }}</div>
          </div>
          <div class="track-duration">{{ formatTime(track.duration) }}</div>
          <button @click.stop="removeTrack(track.id)" class="remove-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div v-if="playlist.length === 0" class="empty-playlist">
          <p>播放列表为空</p>
          <p>点击 + 添加音乐</p>
        </div>
      </div>
    </div>

    <!-- 添加音乐对话框 -->
    <div v-if="showAddTrackDialog" class="dialog-overlay" @click="showAddTrackDialog = false">
      <div class="dialog" @click.stop>
        <h3>添加音乐</h3>
        <form @submit.prevent="addTrack">
          <div class="form-group">
            <label>歌曲名称:</label>
            <input v-model="newTrack.title" type="text" required />
          </div>
          <div class="form-group">
            <label>艺术家:</label>
            <input v-model="newTrack.artist" type="text" required />
          </div>
          <div class="form-group">
            <label>音频文件URL:</label>
            <input v-model="newTrack.url" type="url" required />
          </div>
          <div class="form-group">
            <label>封面图片URL (可选):</label>
            <input v-model="newTrack.cover" type="url" />
          </div>
          <div class="form-actions">
            <button type="button" @click="showAddTrackDialog = false">取消</button>
            <button type="submit">添加</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { systemAudio, AudioEvents, type AudioTrack } from '../../core/api/systemAudio';
import { eventBus } from '../../core/api/event';

// 响应式数据
const currentTrack = ref(systemAudio.getCurrentTrack());
const isPlaying = ref(systemAudio.isPlaying());
const currentTime = ref(systemAudio.getCurrentTime());
const duration = ref(systemAudio.getDuration());
const volume = ref(systemAudio.getVolume());
const isMuted = ref(systemAudio.isMuted());
const playlist = ref(systemAudio.getState().playlist);
const shuffleMode = ref(systemAudio.getState().shuffleMode);
const repeatMode = ref(systemAudio.getState().repeatMode);

const showAddTrackDialog = ref(false);
const newTrack = ref({
  title: '',
  artist: '',
  url: '',
  cover: ''
});

// 计算属性
const progressPercent = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

// 方法
function togglePlayPause() {
  systemAudio.togglePlayPause();
}

function previous() {
  systemAudio.previous();
}

function next() {
  systemAudio.next();
}

function toggleShuffle() {
  systemAudio.toggleShuffle();
}

function toggleRepeat() {
  const modes = ['none', 'all', 'one'] as const;
  const currentIndex = modes.indexOf(repeatMode.value);
  const nextMode = modes[(currentIndex + 1) % modes.length];
  systemAudio.setRepeatMode(nextMode);
}

function toggleMute() {
  systemAudio.toggleMute();
}

function setVolume() {
  systemAudio.setVolume(volume.value);
}

function seekTo(event: MouseEvent) {
  const progressBar = event.currentTarget as HTMLElement;
  const rect = progressBar.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  systemAudio.seekToPercent(percent * 100);
}

function playTrack(track: AudioTrack) {
  systemAudio.loadTrack(track);
  systemAudio.play();
}

function removeTrack(trackId: string) {
  systemAudio.removeFromPlaylist(trackId);
}

function addTrack() {
  if (newTrack.value.title && newTrack.value.artist && newTrack.value.url) {
    const track: AudioTrack = {
      id: Date.now().toString(),
      title: newTrack.value.title,
      artist: newTrack.value.artist,
      url: newTrack.value.url,
      cover: newTrack.value.cover || undefined,
      duration: 0 // 将在加载时更新
    };
    
    systemAudio.addToPlaylist(track);
    
    // 重置表单
    newTrack.value = {
      title: '',
      artist: '',
      url: '',
      cover: ''
    };
    showAddTrackDialog.value = false;
  }
}

function formatTime(seconds: number): string {
  return systemAudio.formatTime(seconds);
}

// 从public/audio加载音乐列表
async function loadAudioPlaylist() {
  try {
    const response = await fetch('/MeowOS/audio/playlist.json');
    if (response.ok) {
      const tracks = await response.json();
      systemAudio.setPlaylist(tracks);
      console.log('音乐列表加载成功:', tracks);
    } else {
      console.warn('无法加载音乐列表，使用默认示例');
      loadDefaultPlaylist();
    }
  } catch (error) {
    console.error('加载音乐列表失败:', error);
    loadDefaultPlaylist();
  }
}

// 加载默认示例音乐
function loadDefaultPlaylist() {
  const sampleTracks: AudioTrack[] = [
    {
      id: '1',
      title: '示例音乐 1',
      artist: '示例艺术家',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      duration: 30
    },
    {
      id: '2',
      title: '示例音乐 2',
      artist: '另一个艺术家',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      duration: 45
    }
  ];
  systemAudio.setPlaylist(sampleTracks);
}

// 事件监听器
function handleTrackChange(track: AudioTrack) {
  currentTrack.value = track;
}

function handlePlayStateChange(playing: boolean) {
  isPlaying.value = playing;
}

function handleTimeUpdate(time: number) {
  currentTime.value = time;
}

function handleDurationChange(dur: number) {
  duration.value = dur;
}

function handleVolumeChange(vol: number) {
  volume.value = vol;
}

function handleMuteChange(muted: boolean) {
  isMuted.value = muted;
}

function handlePlaylistChange(newPlaylist: AudioTrack[]) {
  playlist.value = newPlaylist;
}

function handleShuffleModeChange(shuffle: boolean) {
  shuffleMode.value = shuffle;
}

function handleRepeatModeChange(repeat: 'none' | 'one' | 'all') {
  repeatMode.value = repeat;
}

// 生命周期
onMounted(() => {
  // 从public/audio加载音乐列表
  loadAudioPlaylist();

  // 监听音频事件
  systemAudio.on(AudioEvents.TrackChange, handleTrackChange);
  systemAudio.on(AudioEvents.PlayStateChange, handlePlayStateChange);
  systemAudio.on(AudioEvents.TimeUpdate, handleTimeUpdate);
  systemAudio.on(AudioEvents.DurationChange, handleDurationChange);
  systemAudio.on(AudioEvents.VolumeChange, handleVolumeChange);
  systemAudio.on(AudioEvents.MuteChange, handleMuteChange);
  systemAudio.on(AudioEvents.PlaylistChange, handlePlaylistChange);
  systemAudio.on(AudioEvents.ShuffleModeChange, handleShuffleModeChange);
  systemAudio.on(AudioEvents.RepeatModeChange, handleRepeatModeChange);
});

onUnmounted(() => {
  // 清理事件监听器
  systemAudio.off(AudioEvents.TrackChange, handleTrackChange);
  systemAudio.off(AudioEvents.PlayStateChange, handlePlayStateChange);
  systemAudio.off(AudioEvents.TimeUpdate, handleTimeUpdate);
  systemAudio.off(AudioEvents.DurationChange, handleDurationChange);
  systemAudio.off(AudioEvents.VolumeChange, handleVolumeChange);
  systemAudio.off(AudioEvents.MuteChange, handleMuteChange);
  systemAudio.off(AudioEvents.PlaylistChange, handlePlaylistChange);
  systemAudio.off(AudioEvents.ShuffleModeChange, handleShuffleModeChange);
  systemAudio.off(AudioEvents.RepeatModeChange, handleRepeatModeChange);
});
</script>

<style scoped>
.music-player {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.now-playing {
  padding: 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.1);
}

.track-cover {
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  color: rgba(255, 255, 255, 0.6);
}

.track-info {
  margin-bottom: 16px;
}

.track-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.track-artist {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.progress-section {
  padding: 0 20px 20px;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 8px;
  opacity: 0.8;
}

.progress-bar {
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
}

.progress-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: white;
  border-radius: 2px;
  transition: width 0.1s ease;
}

.progress-thumb {
  position: absolute;
  top: -4px;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
}

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 0 20px 20px;
}

.play-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0;
}

.play-btn:hover {
  background: white;
  transform: scale(1.05);
}

.control-btn.active {
  background: rgba(255, 255, 255, 0.2);
}

.volume-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 20px;
}

.volume-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
}

.volume-slider {
  flex: 1;
}

.volume-slider input[type="range"] {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.volume-slider input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

.playlist-section {
  flex: 1;
  padding: 0 20px 20px;
  min-height: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.add-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.playlist {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.track-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.track-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.track-item.active {
  background: rgba(255, 255, 255, 0.15);
}

.track-number {
  width: 24px;
  font-size: 12px;
  opacity: 0.6;
}

.track-details {
  flex: 1;
  margin-left: 8px;
}

.track-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.track-artist-name {
  font-size: 12px;
  opacity: 0.7;
}

.track-duration {
  font-size: 12px;
  opacity: 0.6;
  margin-right: 8px;
}

.remove-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

.empty-playlist {
  text-align: center;
  padding: 40px 20px;
  opacity: 0.6;
}

.empty-playlist p {
  margin: 4px 0;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  color: white;
}

.dialog h3 {
  margin: 0 0 20px;
  font-size: 18px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  opacity: 0.9;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-actions button[type="button"] {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.form-actions button[type="submit"] {
  background: #667eea;
  color: white;
}

.form-actions button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 滚动条样式 */
.playlist::-webkit-scrollbar {
  width: 6px;
}

.playlist::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.playlist::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.playlist::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
