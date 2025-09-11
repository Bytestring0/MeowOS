<template>
  <div class="wallpaper-app">
    <div class="wallpaper-header">
      <h2>壁纸设置</h2>
      <p>个性化您的桌面背景</p>
      <div class="header-actions">
        <button @click="resetToDefault" class="reset-btn">
          重置为默认
        </button>
      </div>
    </div>

    <div class="wallpaper-content">
      <!-- 内置壁纸 -->
      <div class="wallpaper-section">
        <div class="section-header">
          <h3>内置壁纸</h3>
          <span class="section-count">{{ builtinWallpapers.length }} 张</span>
        </div>
        <div class="wallpaper-grid" v-if="!isLoadingWallpapers">
          <div
            v-for="wallpaper in builtinWallpapers"
            :key="wallpaper.id"
            class="wallpaper-card"
            :class="{ active: currentWallpaper === wallpaper.value }"
            @click="selectWallpaper(wallpaper.value)"
          >
            <div class="wallpaper-preview" :style="getPreviewStyle(wallpaper)">
              <div class="preview-overlay">
                <div class="wallpaper-info">
                  <span class="wallpaper-name">{{ wallpaper.name }}</span>
                  <div class="wallpaper-actions">
                    <button 
                      v-if="currentWallpaper === wallpaper.value" 
                      class="current-indicator"
                    >
                      ✓ 当前
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在加载壁纸...</p>
        </div>
      </div>

      <!-- 纯色背景 -->
      <div class="wallpaper-section">
        <div class="section-header">
          <h3>纯色背景</h3>
        </div>
        <div class="color-section">
          <div class="color-presets">
            <div
              v-for="color in colorPresets"
              :key="color.name"
              class="color-preset"
              :style="{ backgroundColor: color.value }"
              :class="{ active: currentWallpaper === color.value }"
              @click="selectWallpaper(color.value)"
              :title="color.name"
            >
              <div v-if="currentWallpaper === color.value" class="active-indicator">✓</div>
            </div>
          </div>
          <div class="custom-color">
            <label>自定义颜色:</label>
            <div class="color-input-group">
              <input
                type="color"
                v-model="customColor"
                @change="selectWallpaper(customColor)"
                class="color-picker"
              />
              <input
                type="text"
                v-model="customColor"
                @change="selectWallpaper(customColor)"
                class="color-input"
                placeholder="#4a90e2"
              />
              <button @click="selectWallpaper(customColor)" class="apply-color-btn">
                应用
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 渐变背景 -->
      <div class="wallpaper-section">
        <div class="section-header">
          <h3>渐变背景</h3>
        </div>
        <div class="gradient-section">
          <div class="gradient-presets">
            <div
              v-for="gradient in gradientPresets"
              :key="gradient.name"
              class="gradient-preset"
              :style="{ background: gradient.value }"
              :class="{ active: currentWallpaper === gradient.value }"
              @click="selectWallpaper(gradient.value)"
              :title="gradient.name"
            >
              <div v-if="currentWallpaper === gradient.value" class="active-indicator">✓</div>
            </div>
          </div>
          <div class="custom-gradient">
            <label>自定义渐变:</label>
            <div class="gradient-controls">
              <div class="gradient-colors">
                <input
                  type="color"
                  v-model="gradientColor1"
                  @change="updateCustomGradient"
                  class="color-picker small"
                />
                <span class="gradient-arrow">→</span>
                <input
                  type="color"
                  v-model="gradientColor2"
                  @change="updateCustomGradient"
                  class="color-picker small"
                />
              </div>
              <select v-model="gradientDirection" @change="updateCustomGradient" class="direction-select">
                <option value="to right">→ 水平</option>
                <option value="to bottom">↓ 垂直</option>
                <option value="45deg">↗ 对角线</option>
                <option value="135deg">↘ 反对角线</option>
                <option value="to top right">↗ 右上</option>
                <option value="to bottom left">↙ 左下</option>
              </select>
            </div>
            <div class="gradient-preview-container">
              <div class="gradient-preview" :style="{ background: customGradient }"></div>
              <button @click="selectWallpaper(customGradient)" class="apply-gradient-btn">
                应用渐变
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 网络图片 -->
      <div class="wallpaper-section">
        <div class="section-header">
          <h3>网络图片</h3>
        </div>
        <div class="url-section">
          <div class="url-input-group">
            <input
              type="url"
              v-model="urlInput"
              placeholder="输入图片URL (支持 jpg, png, gif, webp 格式)..."
              class="url-input"
              @keyup.enter="loadUrlWallpaper"
            />
            <button @click="loadUrlWallpaper" class="load-btn" :disabled="!urlInput.trim()">
              <span v-if="!isLoadingUrl">加载</span>
              <span v-else>加载中...</span>
            </button>
          </div>
          <div v-if="urlPreview" class="url-preview">
            <img :src="urlPreview" @load="onUrlImageLoad" @error="onUrlImageError" />
            <div class="url-actions">
              <button @click="selectWallpaper(urlPreview)" class="apply-btn">
                ✓ 应用为壁纸
              </button>
              <button @click="clearUrlPreview" class="clear-btn">
                ✕ 清除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 本地文件 -->
      <div class="wallpaper-section">
        <div class="section-header">
          <h3>本地图片</h3>
        </div>
        <div class="file-section">
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            @change="handleFileUpload"
            style="display: none"
          />
          <button @click="selectFile" class="file-btn">
            选择本地图片
          </button>
          <div v-if="filePreview" class="file-preview">
            <img :src="filePreview" />
            <div class="file-actions">
              <button @click="selectWallpaper(filePreview)" class="apply-btn">
                ✓ 应用为壁纸
              </button>
              <button @click="clearFilePreview" class="clear-btn">
                ✕ 清除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { system } from '../../core/api/system';
import { storage } from '../../core/api/storage';

const currentWallpaper = computed(() => system.wallpaper);

// 动态加载的内置壁纸
const builtinWallpapers = ref<any[]>([]);
const isLoadingWallpapers = ref(true);

const colorPresets = [
  { name: '纯黑', value: '#000000' },
  { name: '深灰', value: '#2d2d2d' },
  { name: '浅灰', value: '#f5f5f5' },
  { name: '纯白', value: '#ffffff' },
  { name: '海蓝', value: '#0077be' },
  { name: '森林绿', value: '#228b22' },
  { name: '紫色', value: '#9932cc' },
  { name: '橙色', value: '#ff8c00' },
  { name: '玫瑰金', value: '#e8b4b8' },
  { name: '薄荷绿', value: '#98fb98' },
  { name: '天空蓝', value: '#87ceeb' },
  { name: '珊瑚色', value: '#ff7f50' }
];

const gradientPresets = [
  { name: '蓝色渐变', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: '紫色渐变', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: '橙色渐变', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { name: '绿色渐变', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: '日落渐变', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)' },
  { name: '极光渐变', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: '海洋渐变', value: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)' },
  { name: '火焰渐变', value: 'linear-gradient(135deg, #ff512f 0%, #f09819 100%)' }
];

const customColor = ref('#4a90e2');
const gradientColor1 = ref('#667eea');
const gradientColor2 = ref('#764ba2');
const gradientDirection = ref('135deg');
const customGradient = ref('');

const urlInput = ref('');
const urlPreview = ref('');
const filePreview = ref('');
const fileInput = ref<HTMLInputElement>();
const isLoadingUrl = ref(false);

// 加载内置壁纸
const loadBuiltinWallpapers = async () => {
  try {
    isLoadingWallpapers.value = true;
    builtinWallpapers.value = await system.getDefaultWallpapers();
  } catch (error) {
    console.error('Failed to load builtin wallpapers:', error);
    // 使用默认壁纸列表作为备用
    builtinWallpapers.value = [
      { id: 'default', name: '默认', value: 'wallpapers/default.svg', type: 'image' }
    ];
  } finally {
    isLoadingWallpapers.value = false;
  }
};

// 加载保存的设置
onMounted(async () => {
  await loadBuiltinWallpapers();
  
  const savedSettings = await storage.getAppSetting('system-wallpaper', 'settings');
  if (savedSettings) {
    customColor.value = savedSettings.customColor || '#4a90e2';
    gradientColor1.value = savedSettings.gradientColor1 || '#667eea';
    gradientColor2.value = savedSettings.gradientColor2 || '#764ba2';
    gradientDirection.value = savedSettings.gradientDirection || '135deg';
    updateCustomGradient();
  }
});

async function saveSettings() {
  await storage.setAppSetting('system-wallpaper', 'settings', {
    customColor: customColor.value,
    gradientColor1: gradientColor1.value,
    gradientColor2: gradientColor2.value,
    gradientDirection: gradientDirection.value
  });
}

// 重置为默认壁纸
function resetToDefault() {
  const defaultWallpaper = system.resetWallpaper();
  console.log('已重置为默认壁纸:', defaultWallpaper);
}

function selectFile() {
  fileInput.value?.click();
}

function getPreviewStyle(wallpaper: any) {
  if (wallpaper.type === 'image') {
    return {
      backgroundImage: `url(${wallpaper.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  return { background: wallpaper.value };
}

function selectWallpaper(value: string) {
  system.setWallpaper(value);
  saveRecentWallpaper(value);
}

function updateCustomGradient() {
  customGradient.value = `linear-gradient(${gradientDirection.value}, ${gradientColor1.value} 0%, ${gradientColor2.value} 100%)`;
  saveSettings();
}

async function saveRecentWallpaper(wallpaper: string) {
  const recent = await storage.getAppSetting('system-wallpaper', 'recent') || [];
  const filtered = recent.filter((w: string) => w !== wallpaper);
  filtered.unshift(wallpaper);
  await storage.setAppSetting('system-wallpaper', 'recent', filtered.slice(0, 10));
}

async function loadUrlWallpaper() {
  if (!urlInput.value.trim()) return;
  
  isLoadingUrl.value = true;
  try {
    // 简单的URL验证
    const url = new URL(urlInput.value);
    urlPreview.value = url.toString();
  } catch (error) {
    console.error('Invalid URL:', error);
    alert('请输入有效的图片URL');
  } finally {
    isLoadingUrl.value = false;
  }
}

function onUrlImageLoad() {
  console.log('URL图片加载成功');
  isLoadingUrl.value = false;
}

function onUrlImageError() {
  console.error('URL图片加载失败');
  urlPreview.value = '';
  isLoadingUrl.value = false;
  alert('图片加载失败，请检查URL是否正确');
}

function clearUrlPreview() {
  urlPreview.value = '';
  urlInput.value = '';
}

function clearFilePreview() {
  filePreview.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      filePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

// 初始化自定义渐变
updateCustomGradient();
</script>

<style scoped>
.wallpaper-app {
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  background: var(--bg-color);
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

.wallpaper-app::-webkit-scrollbar {
  width: 8px;
}

.wallpaper-app::-webkit-scrollbar-track {
  background: transparent;
}

.wallpaper-app::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.wallpaper-header {
  margin-bottom: 32px;
  text-align: center;
  position: relative;
}

.wallpaper-header h2 {
  color: var(--text-color);
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.wallpaper-header p {
  color: var(--text-color-light);
  font-size: 16px;
  margin-bottom: 16px;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.reset-btn {
  padding: 10px 20px;
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: #e04141;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.wallpaper-content {
  max-width: 1000px;
  margin: 0 auto;
}

.wallpaper-section {
  margin-bottom: 48px;
  background: var(--bg-color-light);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-color-light);
  transition: all 0.3s ease;
}

.wallpaper-section:hover {
  border-color: var(--border-color);
  box-shadow: var(--box-shadow-light);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header h3 {
  color: var(--text-color);
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.section-count {
  background: var(--accent-color);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.wallpaper-card {
  border: 2px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-color);
  position: relative;
}

.wallpaper-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(74, 144, 226, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.wallpaper-card:hover {
  border-color: var(--accent-color);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 32px rgba(74, 144, 226, 0.2);
}

.wallpaper-card:hover::before {
  opacity: 1;
}

.wallpaper-card.active {
  border-color: var(--accent-color);
  box-shadow: 0 6px 24px rgba(74, 144, 226, 0.3);
  transform: translateY(-2px);
}

.wallpaper-preview {
  height: 140px;
  position: relative;
  background-size: cover;
  background-position: center;
  z-index: 2;
}

.preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 16px;
  z-index: 3;
}

.wallpaper-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wallpaper-name {
  font-size: 14px;
  font-weight: 600;
}

.current-indicator {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--text-color-light);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.color-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.color-preset {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-preset:hover {
  border-color: var(--accent-color);
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.color-preset.active {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
}

.active-indicator {
  color: white;
  font-weight: bold;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  font-size: 18px;
}

.custom-color {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.custom-color label {
  color: var(--text-color);
  font-weight: 600;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.color-picker {
  width: 48px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-picker:hover {
  transform: scale(1.05);
}

.color-picker.small {
  width: 40px;
  height: 32px;
}

.color-input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-family: monospace;
  font-size: 14px;
  min-width: 100px;
}

.color-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.apply-color-btn {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.apply-color-btn:hover {
  background: #3a7bc8;
  transform: translateY(-1px);
}

.gradient-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.gradient-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.gradient-preset {
  width: 140px;
  height: 56px;
  border-radius: 12px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gradient-preset:hover {
  border-color: var(--accent-color);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.gradient-preset.active {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
}

.custom-gradient {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.custom-gradient label {
  color: var(--text-color);
  font-weight: 600;
}

.gradient-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.gradient-colors {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gradient-arrow {
  color: var(--text-color-light);
  font-size: 18px;
  font-weight: bold;
}

.direction-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
  cursor: pointer;
}

.direction-select:focus {
  outline: none;
  border-color: var(--accent-color);
}

.gradient-preview-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.gradient-preview {
  flex: 1;
  height: 56px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  min-width: 200px;
}

.apply-gradient-btn {
  padding: 12px 20px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.apply-gradient-btn:hover {
  background: #3a7bc8;
  transform: translateY(-1px);
}

.url-section,
.file-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.url-input-group {
  display: flex;
  gap: 12px;
}

.url-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.url-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.load-btn,
.file-btn,
.apply-btn,
.clear-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.load-btn,
.file-btn,
.apply-btn {
  background: var(--accent-color);
  color: white;
}

.load-btn:hover,
.file-btn:hover,
.apply-btn:hover {
  background: #3a7bc8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.clear-btn {
  background: var(--border-color);
  color: var(--text-color);
}

.clear-btn:hover {
  background: var(--border-color-light);
}

.load-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.url-preview,
.file-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  padding: 20px;
  background: var(--bg-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.url-preview img,
.file-preview img {
  max-width: 400px;
  max-height: 240px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  object-fit: cover;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.url-actions,
.file-actions {
  display: flex;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wallpaper-app {
    padding: 16px;
  }
  
  .wallpaper-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
  
  .gradient-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .gradient-preview-container {
    flex-direction: column;
  }
  
  .url-input-group {
    flex-direction: column;
  }
}
</style>
