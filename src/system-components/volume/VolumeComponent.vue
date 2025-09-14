<template>
  <div class="volume-component" @click="toggleMute">
    <div class="volume-icon" :class="{ 'muted': isMuted }">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path v-if="!isMuted && volume > 50" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        <path v-else-if="!isMuted && volume > 0" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        <path v-else-if="!isMuted" d="M3 9v6h4l5 5V4L7 9H3z"/>
        <path v-else d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      </svg>
    </div>
    <div class="volume-slider" @click.stop>
      <input 
        type="range" 
        min="0" 
        max="100" 
        v-model="volume" 
        @input="handleVolumeChange"
        :disabled="isMuted"
      />
    </div>
    <span class="volume-text">{{ isMuted ? 'X' : volume }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { SystemComponentState } from '../../core/types/system';
import { systemAudio, AudioEvents } from '../../core/api/systemAudio';

interface Props {
  componentState: SystemComponentState;
}

const props = defineProps<Props>();

const volume = ref(systemAudio.getVolume());
const isMuted = ref(systemAudio.isMuted());
const previousVolume = ref(75);

function toggleMute() {
  systemAudio.toggleMute();
}

function handleVolumeChange() {
  if (volume.value > 0) {
    isMuted.value = false;
    systemAudio.setVolume(volume.value);
  }
}

// 监听音频系统事件
function handleVolumeChangeEvent(newVolume: number) {
  volume.value = newVolume;
}

function handleMuteChangeEvent(muted: boolean) {
  isMuted.value = muted;
  if (muted) {
    previousVolume.value = volume.value;
    volume.value = 0;
  } else {
    volume.value = previousVolume.value;
  }
}

onMounted(() => {
  systemAudio.on(AudioEvents.VolumeChange, handleVolumeChangeEvent);
  systemAudio.on(AudioEvents.MuteChange, handleMuteChangeEvent);
});

onUnmounted(() => {
  systemAudio.off(AudioEvents.VolumeChange, handleVolumeChangeEvent);
  systemAudio.off(AudioEvents.MuteChange, handleMuteChangeEvent);
});
</script>

<style scoped>
.volume-component {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  user-select: none;
  cursor: pointer;
}

.volume-component:hover {
  background: rgba(255, 255, 255, 0.15);
}

.volume-icon {
  color: var(--text-color, #333);
  transition: color 0.3s ease;
}

.volume-icon.muted {
  color: #ef4444;
}

.volume-slider {
  width: 60px;
}

.volume-slider input[type="range"] {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.volume-slider input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: var(--accent-color, #4A90E2);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.volume-slider input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.volume-slider input[type="range"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.volume-text {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-color, #333);
  min-width: 20px;
  text-align: center;
}

/* 主题适配 */
[data-theme="dark"] .volume-component {
  background: rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .volume-icon {
  color: #fff;
}

[data-theme="dark"] .volume-text {
  color: #fff;
}

[data-theme="dark"] .volume-slider input[type="range"] {
  background: rgba(255, 255, 255, 0.2);
}

[data-theme="glass"] .volume-component {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme="custom-blue"] .volume-component {
  background: rgba(74, 144, 226, 0.2);
}

[data-theme="custom-blue"] .volume-icon,
[data-theme="custom-blue"] .volume-text {
  color: #fff;
}
</style>
