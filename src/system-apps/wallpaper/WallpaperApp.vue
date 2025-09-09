<template>
  <div class="wallpaper-app">
    <div class="wallpaper-header">
      <h2>壁纸设置</h2>
      <p>个性化您的桌面背景</p>
    </div>

    <div class="wallpaper-content">
      <!-- 预设壁纸 -->
      <div class="wallpaper-section">
        <h3>内置壁纸</h3>
        <div class="wallpaper-grid">
          <div
            v-for="wallpaper in builtinWallpapers"
            :key="wallpaper.id"
            class="wallpaper-card"
            :class="{ active: currentWallpaper === wallpaper.value }"
            @click="selectWallpaper(wallpaper.value)"
          >
            <div class="wallpaper-preview" :style="getPreviewStyle(wallpaper)">
              <div class="preview-overlay">
                <span class="wallpaper-name">{{ wallpaper.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 纯色背景 -->
      <div class="wallpaper-section">
        <h3>纯色背景</h3>
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
            ></div>
          </div>
          <div class="custom-color">
            <label>自定义颜色:</label>
            <input
              type="color"
              v-model="customColor"
              @change="selectWallpaper(customColor)"
              class="color-picker"
            />
            <span class="color-value">{{ customColor }}</span>
          </div>
        </div>
      </div>

      <!-- 渐变背景 -->
      <div class="wallpaper-section">
        <h3>渐变背景</h3>
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
            ></div>
          </div>
          <div class="custom-gradient">
            <label>自定义渐变:</label>
            <div class="gradient-controls">
              <input
                type="color"
                v-model="gradientColor1"
                @change="updateCustomGradient"
                class="color-picker"
              />
              <span>到</span>
              <input
                type="color"
                v-model="gradientColor2"
                @change="updateCustomGradient"
                class="color-picker"
              />
              <select v-model="gradientDirection" @change="updateCustomGradient">
                <option value="to right">水平</option>
                <option value="to bottom">垂直</option>
                <option value="45deg">对角线</option>
                <option value="135deg">反对角线</option>
              </select>
            </div>
            <div class="gradient-preview" :style="{ background: customGradient }"></div>
          </div>
        </div>
      </div>

      <!-- URL壁纸 -->
      <div class="wallpaper-section">
        <h3>网络图片</h3>
        <div class="url-section">
          <div class="url-input-group">
            <input
              type="url"
              v-model="urlInput"
              placeholder="输入图片URL..."
              class="url-input"
              @keyup.enter="loadUrlWallpaper"
            />
            <button @click="loadUrlWallpaper" class="load-btn" :disabled="!urlInput">
              加载
            </button>
          </div>
          <div v-if="urlPreview" class="url-preview">
            <img :src="urlPreview" @load="onUrlImageLoad" @error="onUrlImageError" />
            <div class="url-actions">
              <button @click="selectWallpaper(urlPreview)" class="apply-btn">
                应用为壁纸
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 本地文件 -->
      <div class="wallpaper-section">
        <h3>本地图片</h3>
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
                应用为壁纸
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

const builtinWallpapers = [
  { id: 'default', name: '默认', value: '/wallpapers/default.svg', type: 'image' },
  { id: 'landscape', name: '风景', value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', type: 'image' },
  { id: 'abstract', name: '抽象', value: 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', type: 'image' },
  { id: 'space', name: '星空', value: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', type: 'image' },
  { id: 'mountain', name: '山景', value: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', type: 'image' },
  { id: 'ocean', name: '海洋', value: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', type: 'image' }
];

const colorPresets = [
  { name: '纯黑', value: '#000000' },
  { name: '深灰', value: '#2d2d2d' },
  { name: '浅灰', value: '#f5f5f5' },
  { name: '纯白', value: '#ffffff' },
  { name: '海蓝', value: '#0077be' },
  { name: '森林绿', value: '#228b22' },
  { name: '紫色', value: '#9932cc' },
  { name: '橙色', value: '#ff8c00' }
];

const gradientPresets = [
  { name: '蓝色渐变', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: '紫色渐变', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: '橙色渐变', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { name: '绿色渐变', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: '日落渐变', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)' },
  { name: '极光渐变', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
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

// 加载保存的设置
onMounted(async () => {
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
  // 保存最近使用的壁纸
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

function loadUrlWallpaper() {
  if (!urlInput.value) return;
  urlPreview.value = urlInput.value;
}

function onUrlImageLoad() {
  console.log('URL图片加载成功');
}

function onUrlImageError() {
  console.error('URL图片加载失败');
  urlPreview.value = '';
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
  padding: 20px;
  overflow-y: auto;
  background: var(--bg-color);
}

.wallpaper-header {
  margin-bottom: 30px;
  text-align: center;
}

.wallpaper-header h2 {
  color: var(--text-color);
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
}

.wallpaper-header p {
  color: var(--text-color-light);
  font-size: 16px;
}

.wallpaper-content {
  max-width: 900px;
  margin: 0 auto;
}

.wallpaper-section {
  margin-bottom: 40px;
}

.wallpaper-section h3 {
  color: var(--text-color);
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.wallpaper-card {
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-color-light);
}

.wallpaper-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow);
}

.wallpaper-card.active {
  border-color: var(--primary-color);
  box-shadow: 0 4px 16px rgba(74, 144, 226, 0.3);
}

.wallpaper-preview {
  height: 120px;
  position: relative;
  background-size: cover;
  background-position: center;
}

.preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 12px;
  text-align: center;
}

.wallpaper-name {
  font-size: 14px;
  font-weight: 500;
}

.color-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.color-preset {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: border-color 0.3s ease;
}

.color-preset:hover {
  border-color: var(--primary-color);
}

.color-preset.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.custom-color {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-color label {
  color: var(--text-color);
  font-weight: 500;
}

.color-picker {
  width: 48px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-value {
  font-family: monospace;
  color: var(--text-color-light);
  font-size: 14px;
}

.gradient-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gradient-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.gradient-preset {
  width: 120px;
  height: 48px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: border-color 0.3s ease;
}

.gradient-preset:hover {
  border-color: var(--primary-color);
}

.gradient-preset.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.custom-gradient {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.custom-gradient label {
  color: var(--text-color);
  font-weight: 500;
}

.gradient-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.gradient-controls span {
  color: var(--text-color-light);
}

.gradient-controls select {
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
}

.gradient-preview {
  height: 48px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.url-section,
.file-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.url-input-group {
  display: flex;
  gap: 12px;
}

.url-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
}

.url-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.load-btn,
.file-btn,
.apply-btn {
  padding: 10px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.3s ease;
}

.load-btn:hover,
.file-btn:hover,
.apply-btn:hover {
  opacity: 0.9;
}

.load-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.url-preview,
.file-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.url-preview img,
.file-preview img {
  max-width: 300px;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  object-fit: cover;
}

.url-actions,
.file-actions {
  display: flex;
  gap: 12px;
}
</style>
