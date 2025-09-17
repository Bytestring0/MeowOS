<template>
  <div class="music-player">
    <!-- 主要内容区域 -->
    <div class="main-content" :class="{ 'spectrum-active': isPlaying && currentTrack }">
      <!-- 封面区域 -->
      <div class="cover-section">
        <div class="album-cover" v-if="currentTrack">
          <img v-if="currentTrack.cover" :src="currentTrack.cover" :alt="currentTrack.title" />
          <div v-else class="default-cover">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        </div>
        <div v-else class="empty-cover">
          <div class="music-icon">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <p class="empty-text">选择音乐开始播放</p>
        </div>
        
        <!-- 音轨信息 -->
        <div class="track-info" v-if="currentTrack">
          <h2 class="track-title">{{ currentTrack.title }}</h2>
          <p class="track-artist">{{ currentTrack.artist }}</p>
        </div>
      </div>

      <!-- 控制面板 -->
      <div class="control-panel">
        <!-- 进度条 -->
        <div class="progress-section" v-if="currentTrack">
          <div class="time-info">
            <span class="current-time">{{ formatTime(currentTime) }}</span>
            <span class="total-time">{{ formatTime(duration) }}</span>
          </div>
          <div class="progress-bar" @click="seekTo">
            <div class="progress-track"></div>
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
          </div>
        </div>

        <!-- 主控制按钮 -->
        <div class="main-controls">
          <button @click="toggleShuffle" :class="{ active: shuffleMode }" class="control-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
            </svg>
          </button>
          <button @click="previous" class="control-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button @click="togglePlayPause" class="play-btn">
            <svg v-if="!isPlaying" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>
          <button @click="next" class="control-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
          <button @click="toggleRepeat" :class="{ active: repeatMode !== 'none' }" class="control-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path v-if="repeatMode === 'one'" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zM13 15.5h-2v-3.5h2v3.5zm0-5h-2V8h2v2.5z"/>
              <path v-else d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            </svg>
          </button>
        </div>

        <!-- 底部控制 -->
        <div class="bottom-controls">
          <div class="volume-control">
            <button @click="toggleMute" class="volume-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path v-if="!isMuted && volume > 50" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                <path v-else-if="!isMuted && volume > 0" d="M3 9v6h4l5 5V4L7 9H3z"/>
                <path v-else d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63z"/>
              </svg>
            </button>
            <input type="range" v-model="volume" @input="setVolume" min="0" max="100" class="volume-slider" />
          </div>
          
          <button @click="showPlaylist = !showPlaylist" class="playlist-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
            </svg>
            播放列表
          </button>
        </div>
      </div>
    </div>

    <!-- 频谱可视化侧边栏 -->
    <transition name="spectrum-slide">
      <div v-if="isPlaying && currentTrack" class="spectrum-sidebar">
        <div class="spectrum-header">
          <h3>音频频谱</h3>
          <button @click="toggleSpectrum" class="close-spectrum">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <!-- 频谱样式选择器 -->
        <div class="spectrum-controls">
          <div class="style-selector">
            <button 
              v-for="style in (['bars', 'circular'] as const)" 
              :key="style"
              @click="spectrumStyle = style"
              :class="['style-btn', { active: spectrumStyle === style }]"
            >
              <svg v-if="style === 'bars'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h2v8H3v-8zM7 7h2v14H7V7zM11 1h2v20h-2V1zM15 9h2v12h-2V9zM19 5h2v16h-2V5z"/>
              </svg>
              <svg v-else-if="style === 'circular'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {{ style === 'bars' ? '柱状' : '圆形' }}
            </button>
          </div>
        </div>
        
        <div ref="spectrumCanvas" class="spectrum-canvas"></div>
      </div>
    </transition>

    <!-- 播放列表覆盖层 -->
    <transition name="fade">
      <div v-if="showPlaylist" class="playlist-overlay" @click="showPlaylist = false">
        <div class="playlist-container" @click.stop>
          <div class="playlist-header">
            <h3>播放列表</h3>
            <div class="playlist-actions">
              <button @click="showAddTrackDialog = true" class="add-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                添加
              </button>
              <button @click="showPlaylist = false" class="close-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="playlist">
            <div 
              v-for="(track, index) in playlist" 
              :key="track.id"
              :class="['track-item', { active: currentTrack?.id === track.id }]"
              @click="playTrack(track)"
            >
              <div class="track-index">{{ index + 1 }}</div>
              <div class="track-details">
                <div class="track-name">{{ track.title }}</div>
                <div class="track-artist-name">{{ track.artist }}</div>
              </div>
              <button @click.stop="removeTrack(track.id)" class="remove-btn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div v-if="playlist.length === 0" class="empty-playlist">
              <p>播放列表为空</p>
              <button @click="showAddTrackDialog = true" class="add-first-btn">添加第一首音乐</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 添加音乐对话框 -->
    <transition name="fade">
      <div v-if="showAddTrackDialog" class="dialog-overlay" @click="showAddTrackDialog = false">
        <div class="dialog" @click.stop>
          <h3>添加音乐</h3>
          <form @submit.prevent="addTrack">
            <div class="form-group">
              <input v-model="newTrack.title" type="text" placeholder="歌曲名称" required />
            </div>
            <div class="form-group">
              <input v-model="newTrack.artist" type="text" placeholder="艺术家" required />
            </div>
            <div class="form-group">
              <input v-model="newTrack.url" type="url" placeholder="音频文件URL" required />
            </div>
            <div class="form-group">
              <input v-model="newTrack.cover" type="url" placeholder="封面图片URL (可选)" />
            </div>
            <div class="form-actions">
              <button type="button" @click="showAddTrackDialog = false">取消</button>
              <button type="submit">添加</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { systemAudio, AudioEvents, type AudioTrack } from '../../core/api/systemAudio';
import { eventBus, SystemEvents } from '../../core/api/event';

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
const showPlaylist = ref(false);
const showSpectrum = ref(true);
const newTrack = ref({
  title: '',
  artist: '',
  url: '',
  cover: ''
});

// 频谱可视化相关
const spectrumCanvas = ref<HTMLElement>();
const spectrumStyle = ref<'bars' | 'circular'>('bars');
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array | null = null;
let animationId: number | null = null;
let canvas: HTMLCanvasElement | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;
let mockDataInterval: number | null = null;
let mediaElementSource: MediaElementAudioSourceNode | null = null; // 添加对MediaElementSource的引用

// 计算属性
const progressPercent = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

// 初始化音频频谱分析
async function initAudioContext() {
  try {
    console.log('开始初始化音频上下文...');
    
    // 获取音频元素
    const audioElement = systemAudio.getAudioElement();
    if (!audioElement) {
      console.warn('无法获取音频元素');
      return false;
    }
    
    // 检查音频元素是否处于错误状态
    if (audioElement.error) {
      console.warn('音频元素处于错误状态，尝试重新加载', audioElement.error);
      // 重新加载音频
      if (audioElement.src) {
        const currentSrc = audioElement.src;
        audioElement.load();
        audioElement.src = currentSrc;
      }
    }
    
    // 检查音频元素是否有有效的音频源
    if (!audioElement.src || audioElement.src === '') {
      console.warn('音频元素没有有效的音频源，使用模拟数据');
      return false;
    }
    
    // 检查是否已经有可用的音频上下文和连接
    if (audioContext && audioContext.state !== 'closed' && analyser && mediaElementSource) {
      console.log('复用现有的音频上下文');
      // 确保音频上下文是活跃的
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      return true;
    }
    
    // 清理旧的连接
    if (audioContext && audioContext.state !== 'closed') {
      try {
        await audioContext.close();
        console.log('已关闭旧的音频上下文');
      } catch (error) {
        console.warn('关闭旧音频上下文失败:', error);
      }
    }
    
    // 重置所有变量
    audioContext = null;
    analyser = null;
    dataArray = null;
    mediaElementSource = null;
    
    // 创建新的音频上下文
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('创建新的音频上下文，状态:', audioContext.state);
    
    // 确保音频上下文已恢复
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
      console.log('音频上下文已恢复');
    }
    
    // 创建分析器
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    console.log('分析器创建完成，缓冲区长度:', bufferLength);
    
    // 尝试连接到音频元素
    try {
      // 检查元素是否已经连接到其他源
      if ((audioElement as any)._connectedToMeowOS) {
        console.log('音频元素已经连接过，清理并重新连接');
        (audioElement as any)._connectedToMeowOS = false;
      }
      
      // 创建媒体元素源
      mediaElementSource = audioContext.createMediaElementSource(audioElement);
      console.log('创建MediaElementSource成功');
      
      // 连接音频路径: 源 -> 分析器 -> 目标
      mediaElementSource.connect(analyser);
      mediaElementSource.connect(audioContext.destination);
      
      // 标记已连接
      (audioElement as any)._connectedToMeowOS = true;
      
      console.log('音频频谱分析连接成功');
      return true;
      
    } catch (error) {
      console.warn('音频频谱连接失败，使用模拟数据:', error);
      
      // 如果连接失败，清理并使用模拟数据
      if (mediaElementSource) {
        try {
          mediaElementSource.disconnect();
        } catch (e) {
          // 忽略断开连接的错误
        }
      }
      mediaElementSource = null;
      return false;
    }
    
  } catch (error) {
    console.error('初始化音频上下文失败:', error);
    return false;
  }
}

// 创建模拟频谱数据用于测试
function createMockSpectrumData() {
  if (!dataArray) {
    // 如果还没有 dataArray，创建一个默认的
    dataArray = new Uint8Array(256);
    console.log('创建默认数据数组，长度:', dataArray.length);
  }
  
  console.log('准备模拟频谱数据（在动画循环中生成）');
}

// 初始化频谱画布
function initSpectrumCanvas() {
  if (!spectrumCanvas.value) {
    console.log('频谱画布容器未准备好，稍后重试');
    return;
  }
  
  if (canvas && canvasContext) {
    console.log('频谱画布已经初始化');
    return;
  }
  
  canvas = document.createElement('canvas');
  canvas.width = 260;
  canvas.height = 280;
  canvasContext = canvas.getContext('2d');
  
  if (spectrumCanvas.value && canvas) {
    // 清空容器
    spectrumCanvas.value.innerHTML = '';
    spectrumCanvas.value.appendChild(canvas);
    console.log('频谱画布初始化完成');
  }
}

// 开始频谱动画
function startSpectrumAnimation() {
  if (!canvasContext || !canvas) {
    console.warn('画布未初始化');
    return;
  }
  
  console.log('开始频谱动画');
  
  const draw = () => {
    if (!canvasContext || !canvas) return;
    
    animationId = requestAnimationFrame(draw);
    
    let hasRealData = false;
    
    // 获取频谱数据
    if (analyser && dataArray) {
      try {
        analyser.getByteFrequencyData(dataArray);
        // 检查是否有真实的音频数据（不是全为0）
        const hasAudioActivity = Array.from(dataArray).some(value => value > 0);
        if (hasAudioActivity) {
          hasRealData = true;
        }
      } catch (error) {
        console.warn('获取频谱数据失败:', error);
      }
    }
    
    // 如果没有真实数据，生成模拟数据
    if (!hasRealData) {
      if (!dataArray) {
        dataArray = new Uint8Array(256);
      }
      // 生成模拟数据（仅当播放状态时）
      if (isPlaying.value) {
        const time = Date.now() * 0.003;
        for (let i = 0; i < dataArray.length; i++) {
          const frequency = i / dataArray.length;
          const wave1 = Math.sin(time + frequency * 12) * 0.4 + 0.4;
          const wave2 = Math.sin(time * 1.7 + frequency * 8) * 0.3 + 0.3;
          const wave3 = Math.sin(time * 0.8 + frequency * 16) * 0.2 + 0.2;
          dataArray[i] = Math.floor((wave1 + wave2 + wave3) * 90 + Math.random() * 30);
        }
      }
    }
    
    // 清除画布
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景渐变
    const bgGradient = canvasContext.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, 'rgba(26, 26, 46, 0.1)');
    bgGradient.addColorStop(1, 'rgba(15, 52, 96, 0.1)');
    canvasContext.fillStyle = bgGradient;
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    
    // 根据选择的样式绘制频谱
    if (!dataArray) return;
    
    switch (spectrumStyle.value) {
      case 'bars':
        drawBarsSpectrum(hasRealData);
        break;
      case 'circular':
        drawCircularSpectrum(hasRealData);
        break;
    }
  };
  
  draw();
}

// 柱状频谱
function drawBarsSpectrum(hasRealData: boolean) {
  if (!canvasContext || !canvas || !dataArray) return;
  
  const barCount = Math.min(64, dataArray.length);
  const barWidth = Math.max(2, (canvas.width - (barCount - 1) * 2) / barCount);
  
  for (let i = 0; i < barCount; i++) {
    const dataIndex = Math.floor((i / barCount) * dataArray.length);
    const normalizedValue = dataArray[dataIndex] / 255;
    const barHeight = Math.max(2, normalizedValue * canvas.height * 0.8);
    const x = i * (barWidth + 2);
    const y = canvas.height - barHeight;
    
    // 紫色渐变配色
    const intensity = hasRealData ? 1 : 0.7;
    const baseHue = 280; // 紫色基调
    const hueVariation = (i / barCount) * 40 - 20; // -20 to +20 的色相变化
    const hue = baseHue + hueVariation;
    
    // 创建每个条的渐变色
    const gradient = canvasContext.createLinearGradient(0, y, 0, canvas.height);
    gradient.addColorStop(0, `hsla(${hue}, 75%, ${80 * intensity}%, 0.9)`);
    gradient.addColorStop(0.3, `hsla(${hue + 10}, 80%, ${70 * intensity}%, 0.85)`);
    gradient.addColorStop(0.7, `hsla(${hue + 15}, 85%, ${60 * intensity}%, 0.8)`);
    gradient.addColorStop(1, `hsla(${hue + 20}, 90%, ${50 * intensity}%, 0.75)`);
    
    // 绘制频谱条
    canvasContext.fillStyle = gradient;
    canvasContext.fillRect(x, y, barWidth, barHeight);
    
    // 添加发光效果
    canvasContext.shadowColor = `hsla(${hue}, 80%, ${75 * intensity}%, ${0.5 * intensity})`;
    canvasContext.shadowBlur = 6;
    canvasContext.fillRect(x, y, barWidth, barHeight);
    canvasContext.shadowBlur = 0;
    
    // 绘制顶部亮点
    if (barHeight > 10) {
      canvasContext.fillStyle = `hsla(${hue}, 90%, ${Math.min(95, 85 + normalizedValue * 10)}%, 0.95)`;
      canvasContext.fillRect(x, y, barWidth, Math.min(4, barHeight * 0.12));
    }
    
    // 添加底部反光效果
    if (barHeight > 20) {
      const reflectionGradient = canvasContext.createLinearGradient(0, canvas.height - 5, 0, canvas.height);
      reflectionGradient.addColorStop(0, `hsla(${hue}, 70%, 90%, 0.3)`);
      reflectionGradient.addColorStop(1, `hsla(${hue}, 70%, 90%, 0.1)`);
      canvasContext.fillStyle = reflectionGradient;
      canvasContext.fillRect(x, canvas.height - 5, barWidth, 5);
    }
  }
}

// 圆形频谱
function drawCircularSpectrum(hasRealData: boolean) {
  if (!canvasContext || !canvas || !dataArray) return;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const baseRadius = Math.min(centerX, centerY) * 0.3;
  const maxRadius = Math.min(centerX, centerY) * 0.8;
  
  const segments = Math.min(128, dataArray.length);
  const angleStep = (Math.PI * 2) / segments;
  
  canvasContext.save();
  canvasContext.translate(centerX, centerY);
  
  // 彩虹色配置
  for (let i = 0; i < segments; i++) {
    const dataIndex = Math.floor((i / segments) * dataArray.length);
    const normalizedValue = dataArray[dataIndex] / 255;
    const radius = baseRadius + normalizedValue * (maxRadius - baseRadius);
    const angle = i * angleStep;
    
    // 彩虹色相变化
    const hue = (i / segments) * 360;
    const intensity = hasRealData ? 1 : 0.7;
    
    // 绘制从中心到边缘的线条
    canvasContext.beginPath();
    canvasContext.moveTo(
      Math.cos(angle) * baseRadius,
      Math.sin(angle) * baseRadius
    );
    canvasContext.lineTo(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
    
    const gradient = canvasContext.createLinearGradient(
      Math.cos(angle) * baseRadius,
      Math.sin(angle) * baseRadius,
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
    gradient.addColorStop(0, `hsla(${hue}, 70%, ${50 * intensity}%, 0.6)`);
    gradient.addColorStop(1, `hsla(${hue}, 90%, ${75 * intensity}%, 0.9)`);
    
    canvasContext.strokeStyle = gradient;
    canvasContext.lineWidth = Math.max(1.5, (canvas.width / segments) * 0.8);
    canvasContext.lineCap = 'round';
    canvasContext.stroke();
    
    // 添加端点光效
    if (normalizedValue > 0.1) {
      canvasContext.beginPath();
      canvasContext.arc(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        2.5,
        0,
        Math.PI * 2
      );
      canvasContext.fillStyle = `hsla(${hue}, 100%, ${85 * intensity}%, ${0.8 * intensity})`;
      canvasContext.fill();
    }
  }
  
  canvasContext.restore();
}

// 环形柱状频谱
function drawRadialSpectrum(hasRealData: boolean) {
  if (!canvasContext || !canvas || !dataArray) return;
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const innerRadius = Math.min(centerX, centerY) * 0.2;
  const outerRadius = Math.min(centerX, centerY) * 0.9;
  
  const segments = Math.min(128, dataArray.length);
  const angleStep = (Math.PI * 2) / segments;
  const barWidth = (angleStep * innerRadius) * 0.8;
  
  canvasContext.save();
  canvasContext.translate(centerX, centerY);
  
  // 清淡颜色配置
  const radialColors = [
    { h: 205, s: 48, l: 76 }, // 淡蓝色
    { h: 190, s: 44, l: 79 }, // 淡青蓝色
    { h: 175, s: 42, l: 81 }, // 淡青色
    { h: 220, s: 46, l: 74 }  // 淡紫蓝色
  ];
  
  for (let i = 0; i < segments; i++) {
    const dataIndex = Math.floor((i / segments) * dataArray.length);
    const normalizedValue = dataArray[dataIndex] / 255;
    const barLength = normalizedValue * (outerRadius - innerRadius);
    const angle = i * angleStep;
    
    const colorIndex = Math.floor(i / (segments / radialColors.length));
    const color = radialColors[colorIndex] || radialColors[0];
    const intensity = hasRealData ? 1 : 0.7;
    
    // 计算柱状图的四个顶点
    const innerX1 = Math.cos(angle - barWidth / 2 / innerRadius) * innerRadius;
    const innerY1 = Math.sin(angle - barWidth / 2 / innerRadius) * innerRadius;
    const innerX2 = Math.cos(angle + barWidth / 2 / innerRadius) * innerRadius;
    const innerY2 = Math.sin(angle + barWidth / 2 / innerRadius) * innerRadius;
    
    const outerRadius2 = innerRadius + barLength;
    const outerX1 = Math.cos(angle - barWidth / 2 / outerRadius2) * outerRadius2;
    const outerY1 = Math.sin(angle - barWidth / 2 / outerRadius2) * outerRadius2;
    const outerX2 = Math.cos(angle + barWidth / 2 / outerRadius2) * outerRadius2;
    const outerY2 = Math.sin(angle + barWidth / 2 / outerRadius2) * outerRadius2;
    
    // 绘制柱状
    canvasContext.beginPath();
    canvasContext.moveTo(innerX1, innerY1);
    canvasContext.lineTo(outerX1, outerY1);
    canvasContext.lineTo(outerX2, outerY2);
    canvasContext.lineTo(innerX2, innerY2);
    canvasContext.closePath();
    
    const gradient = canvasContext.createRadialGradient(0, 0, innerRadius, 0, 0, outerRadius2);
    gradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${(color.l - 20) * intensity}%, 0.6)`);
    gradient.addColorStop(1, `hsla(${color.h}, ${color.s + 10}%, ${color.l * intensity}%, 0.9)`);
    
    canvasContext.fillStyle = gradient;
    canvasContext.fill();
    
    // 添加边框光效
    if (normalizedValue > 0.1) {
      canvasContext.strokeStyle = `hsla(${color.h}, ${color.s + 20}%, ${Math.min(95, color.l + 15)}%, ${0.6 * intensity})`;
      canvasContext.lineWidth = 1;
      canvasContext.stroke();
    }
    
    // 绘制内圆边缘亮点
    if (barLength > 5) {
      canvasContext.beginPath();
      canvasContext.arc(
        Math.cos(angle) * (innerRadius + barLength * 0.95),
        Math.sin(angle) * (innerRadius + barLength * 0.95),
        1.5,
        0,
        Math.PI * 2
      );
      canvasContext.fillStyle = `hsla(${color.h}, ${color.s + 25}%, ${Math.min(98, color.l + 18)}%, 0.9)`;
      canvasContext.fill();
    }
  }
  
  // 绘制中心圆
  canvasContext.beginPath();
  canvasContext.arc(0, 0, innerRadius, 0, Math.PI * 2);
  const centerGradient = canvasContext.createRadialGradient(0, 0, 0, 0, 0, innerRadius);
  centerGradient.addColorStop(0, 'rgba(200, 230, 255, 0.15)');
  centerGradient.addColorStop(1, 'rgba(180, 220, 255, 0.08)');
  canvasContext.fillStyle = centerGradient;
  canvasContext.fill();
  
  canvasContext.restore();
}

// 停止频谱动画
function stopSpectrumAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  if (mockDataInterval) {
    clearInterval(mockDataInterval);
    mockDataInterval = null;
  }
  
  console.log('频谱动画已停止');
}

// 方法
async function togglePlayPause() {
  // 总是重新初始化音频上下文以确保连接正确
  try {
    await initAudioContext();
  } catch (error) {
    console.warn('音频上下文初始化失败:', error);
  }
  
  // 确保音频上下文已恢复（需要用户交互）
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      console.log('音频上下文已恢复');
    } catch (error) {
      console.warn('恢复音频上下文失败:', error);
    }
  }
  
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

function toggleSpectrum() {
  showSpectrum.value = !showSpectrum.value;
}

function changeSpectrumStyle(style: 'bars' | 'circular') {
  spectrumStyle.value = style;
}

async function playTrack(track: AudioTrack) {
  console.log('开始播放音轨:', track.title);
  
  try {
    // 加载音轨
    systemAudio.loadTrack(track);
    
    // 等待音频元素准备就绪
    const audioElement = systemAudio.getAudioElement();
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('音频加载超时'));
      }, 5000);
      
      const onCanPlay = () => {
        clearTimeout(timeout);
        audioElement.removeEventListener('canplay', onCanPlay);
        audioElement.removeEventListener('error', onError);
        resolve(true);
      };
      
      const onError = (e: Event) => {
        clearTimeout(timeout);
        audioElement.removeEventListener('canplay', onCanPlay);
        audioElement.removeEventListener('error', onError);
        reject(new Error('音频加载失败'));
      };
      
      audioElement.addEventListener('canplay', onCanPlay);
      audioElement.addEventListener('error', onError);
      
      // 如果已经可以播放，立即解决
      if (audioElement.readyState >= 3) {
        onCanPlay();
      }
    });
    
    // 初始化音频上下文
    try {
      await initAudioContext();
    } catch (error) {
      console.warn('音频上下文初始化失败，但继续播放:', error);
    }
    
    // 确保音频上下文已恢复
    if (audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch (error) {
        console.warn('恢复音频上下文失败:', error);
      }
    }
    
    // 开始播放
    await systemAudio.play();
    showPlaylist.value = false;
    
    console.log('音轨播放成功');
  } catch (error) {
    console.error('播放音轨失败:', error);
    // 可以在这里显示错误提示给用户
  }
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
    const response = await fetch('audio/playlist.json');
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
      title: '一花一世界',
      artist: '阿鲲',
      url: 'audio/一花一世界.mp3',
      cover: 'audio/covers/一花一世界.jpg',
      duration: 180
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
  if (playing) {
    // 初始化或重新初始化音频上下文
    initAudioContext().then((hasRealConnection) => {
      // 确保画布已初始化
      nextTick(() => {
        if (!canvas || !canvasContext) {
          initSpectrumCanvas();
        }
        if (!animationId) {
          startSpectrumAnimation();
        }
      });
    }).catch(error => {
      console.error('音频上下文初始化失败:', error);
      // 即使失败也启动动画（使用模拟数据）
      nextTick(() => {
        if (!canvas || !canvasContext) {
          initSpectrumCanvas();
        }
        if (!animationId) {
          startSpectrumAnimation();
        }
      });
    });
  } else if (animationId) {
    stopSpectrumAnimation();
  }
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

// 彻底清理音频系统
function cleanupAudioSystem() {
  console.log('开始彻底清理音频系统...');
  
  try {
    // 1. 调用SystemAudio的清理方法
    systemAudio.cleanup();
    
    // 2. 清理频谱动画
    stopSpectrumAnimation();
    
    // 3. 清理模拟数据定时器
    if (mockDataInterval) {
      clearInterval(mockDataInterval);
      mockDataInterval = null;
    }
    
    // 4. 断开MediaElementSource连接
    if (mediaElementSource) {
      try {
        mediaElementSource.disconnect();
        console.log('MediaElementSource已断开');
      } catch (error) {
        console.warn('断开MediaElementSource失败:', error);
      }
      mediaElementSource = null;
    }
    
    // 5. 断开分析器
    if (analyser) {
      try {
        analyser.disconnect();
        console.log('分析器已断开');
      } catch (error) {
        console.warn('断开分析器失败:', error);
      }
      analyser = null;
    }
    
    // 6. 关闭音频上下文
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().then(() => {
        console.log('音频上下文已关闭');
      }).catch(error => {
        console.warn('关闭音频上下文失败:', error);
      });
    }
    audioContext = null;
    dataArray = null;
    
    // 7. 清理画布引用
    canvas = null;
    canvasContext = null;
    
    console.log('音频系统清理完成');
  } catch (error) {
    console.error('清理音频系统失败:', error);
  }
}

// 监听窗口关闭事件
function handleWindowClosed(closedWindow: any) {
  // 检查是否是音乐播放器窗口被关闭
  if (closedWindow && closedWindow.id && closedWindow.id.includes('music-player')) {
    console.log('音乐播放器窗口被关闭，执行音频系统清理');
    cleanupAudioSystem();
  }
}

// 音频错误恢复函数
async function recoverAudioSystem() {
  console.log('尝试恢复音频系统...');
  
  try {
    // 获取当前音轨
    const currentTrack = systemAudio.getCurrentTrack();
    if (!currentTrack) {
      console.log('没有当前音轨，无需恢复');
      return;
    }
    
    // 重新加载音轨
    systemAudio.loadTrack(currentTrack);
    
    // 延迟一段时间后重新初始化音频上下文
    setTimeout(async () => {
      try {
        await initAudioContext();
        console.log('音频系统恢复成功');
      } catch (error) {
        console.error('音频系统恢复失败:', error);
      }
    }, 1000);
    
  } catch (error) {
    console.error('音频恢复过程失败:', error);
  }
}

// 生命周期
onMounted(async () => {
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
  
  // 监听音频错误事件
  systemAudio.on(AudioEvents.Error, (error) => {
    console.error('检测到音频错误:', error);
    // 延迟恢复，避免立即重试
    setTimeout(() => {
      recoverAudioSystem();
    }, 2000);
  });

  // 监听系统窗口关闭事件
  eventBus.on(SystemEvents.WindowClosed, handleWindowClosed);

  console.log('音乐播放器组件已挂载');
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

  // 移除系统窗口关闭事件监听
  eventBus.off(SystemEvents.WindowClosed, handleWindowClosed);

  // 执行音频系统清理
  cleanupAudioSystem();
  
  console.log('音乐播放器组件已清理');
});

// 监听播放状态变化
watch(isPlaying, (playing) => {
  if (playing && currentTrack.value) {
    // 确保音频上下文正确初始化
    initAudioContext().catch(error => {
      console.warn('音频上下文初始化失败:', error);
    });
  }
});

// 监听当前音轨变化
watch(currentTrack, (newTrack) => {
  if (newTrack && isPlaying.value) {
    // 音轨变化时重新初始化音频连接
    initAudioContext().catch(error => {
      console.warn('音频上下文重新初始化失败:', error);
    });
  }
});
</script>

<style scoped>
.music-player {
  height: 100%;
  display: flex;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: hidden;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 32px;
  transition: margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content.spectrum-active {
  margin-right: 300px;
}

/* 封面区域 */
.cover-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 40px;
}

.album-cover {
  width: 240px;
  height: 240px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  margin-bottom: 24px;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.album-cover:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
}

.empty-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}

.music-icon {
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-text {
  font-size: 16px;
  font-weight: 300;
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
}

/* 音轨信息 */
.track-info {
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.track-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
}

.track-artist {
  margin: 0;
  font-size: 16px;
  opacity: 0.8;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
}

/* 控制面板 */
.control-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* 进度条区域 */
.progress-section {
  margin-bottom: 24px;
}

.time-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 500;
  opacity: 0.8;
  letter-spacing: 0.5px;
}

.progress-bar {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.progress-bar:hover {
  height: 8px;
  margin-top: -1px;
}

.progress-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 3px;
  transition: width 0.1s ease;
}

.progress-thumb {
  position: absolute;
  top: -3px;
  width: 12px;
  height: 12px;
  background: #ffffff;
  border-radius: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
}

/* 主控制按钮 */
.main-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.control-btn, .play-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.control-btn {
  width: 48px;
  height: 48px;
}

.play-btn {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 8px 32px rgba(79, 172, 254, 0.3);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.play-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 40px rgba(79, 172, 254, 0.4);
}

.control-btn.active {
  background: rgba(79, 172, 254, 0.3);
  color: #4facfe;
  border-color: #4facfe;
}

/* 底部控制 */
.bottom-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-btn, .playlist-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.volume-btn:hover, .playlist-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.volume-slider {
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
  transition: all 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.5);
}

/* 频谱可视化侧边栏 */
.spectrum-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(10, 10, 30, 0.95));
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.spectrum-slide-enter-active, .spectrum-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.spectrum-slide-enter-from, .spectrum-slide-leave-to {
  transform: translateX(100%);
}

.spectrum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.spectrum-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.close-spectrum {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-spectrum:hover {
  background: rgba(255, 255, 255, 0.2);
}

.spectrum-controls {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.style-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.style-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 36px;
  backdrop-filter: blur(10px);
}

.style-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.style-btn.active {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(0, 242, 254, 0.2));
  border-color: rgba(79, 172, 254, 0.5);
  color: #4facfe;
  box-shadow: 0 4px 16px rgba(79, 172, 254, 0.3);
}

.style-btn.active:hover {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.4), rgba(0, 242, 254, 0.3));
  border-color: rgba(79, 172, 254, 0.7);
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.style-btn svg {
  flex-shrink: 0;
}

.spectrum-canvas {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.spectrum-canvas canvas {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(5px);
}

/* 播放列表覆盖层 */
.playlist-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.playlist-container {
  background: rgba(30, 30, 46, 0.95);
  border-radius: 20px;
  padding: 28px;
  width: 90%;
  max-width: 500px;
  max-height: 70vh;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.playlist-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.playlist-actions {
  display: flex;
  gap: 8px;
}

.add-btn, .close-btn {
  background: rgba(79, 172, 254, 0.2);
  border: 1px solid rgba(79, 172, 254, 0.3);
  color: #4facfe;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.close-btn {
  background: rgba(255, 99, 99, 0.2);
  border-color: rgba(255, 99, 99, 0.3);
  color: #ff6363;
}

.add-btn:hover {
  background: rgba(79, 172, 254, 0.3);
  transform: translateY(-1px);
}

.close-btn:hover {
  background: rgba(255, 99, 99, 0.3);
  transform: translateY(-1px);
}

.playlist {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.track-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin-bottom: 4px;
}

.track-item:hover {
  background: rgba(255, 255, 255, 0.05);
  padding-left: 12px;
  padding-right: 12px;
}

.track-item.active {
  background: rgba(79, 172, 254, 0.2);
  color: #4facfe;
  padding-left: 12px;
  padding-right: 12px;
}

.track-index {
  width: 32px;
  font-size: 13px;
  opacity: 0.6;
  font-weight: 500;
}

.track-details {
  flex: 1;
  margin-left: 12px;
}

.track-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1.3;
}

.track-artist-name {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 400;
}

.remove-btn {
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.2s ease;
}

.track-item:hover .remove-btn {
  opacity: 0.6;
}

.remove-btn:hover {
  background: rgba(255, 99, 99, 0.2);
  color: #ff6363;
  opacity: 1 !important;
}

.empty-playlist {
  text-align: center;
  padding: 40px 20px;
  opacity: 0.6;
}

.empty-playlist p {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 300;
}

.add-first-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.add-first-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.dialog {
  background: rgba(30, 30, 46, 0.95);
  border-radius: 20px;
  padding: 28px;
  width: 90%;
  max-width: 420px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.dialog h3 {
  margin: 0 0 24px;
  font-size: 20px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 16px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 14px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.form-group input:focus {
  outline: none;
  border-color: #4facfe;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 28px;
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.form-actions button[type="button"] {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-actions button[type="submit"] {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.form-actions button:hover {
  transform: translateY(-1px);
}

.form-actions button[type="button"]:hover {
  background: rgba(255, 255, 255, 0.15);
}

.form-actions button[type="submit"]:hover {
  box-shadow: 0 6px 16px rgba(79, 172, 254, 0.4);
}

/* 滚动条样式 */
.playlist::-webkit-scrollbar {
  width: 4px;
}

.playlist::-webkit-scrollbar-track {
  background: transparent;
}

.playlist::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.playlist::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 20px;
  }
  
  .main-content.spectrum-active {
    margin-right: 0;
  }
  
  .spectrum-sidebar {
    width: 100%;
  }
  
  .album-cover {
    width: 200px;
    height: 200px;
  }
  
  .track-title {
    font-size: 20px;
  }
  
  .main-controls {
    gap: 12px;
  }
  
  .play-btn {
    width: 56px;
    height: 56px;
  }
  
  .control-btn {
    width: 44px;
    height: 44px;
  }
  
  .playlist-container {
    width: 95%;
    max-height: 80vh;
    padding: 20px;
  }
  
  .style-selector {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  
  .style-btn {
    min-height: 40px;
    font-size: 13px;
  }
  
  .spectrum-canvas {
    padding: 15px;
    min-height: 250px;
  }
}

@media (max-width: 480px) {
  .album-cover {
    width: 160px;
    height: 160px;
  }
  
  .track-title {
    font-size: 18px;
  }
  
  .control-panel {
    padding: 20px;
  }
  
  .play-btn {
    width: 52px;
    height: 52px;
  }
  
  .control-btn {
    width: 40px;
    height: 40px;
  }
  
  .spectrum-controls {
    padding: 12px 16px;
  }
  
  .style-btn {
    padding: 6px 10px;
    font-size: 11px;
    min-height: 36px;
  }
  
  .spectrum-canvas {
    padding: 10px;
    min-height: 220px;
  }
}
</style>
