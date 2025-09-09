<template>
  <div class="theme-app">
    <div class="theme-header">
      <h2>主题设置</h2>
      <p>选择您喜欢的主题外观</p>
    </div>
    
    <div class="theme-content">
      <div class="theme-section">
        <h3>主题选择</h3>
        <div class="theme-grid">
          <div
            v-for="theme in themes"
            :key="theme.id"
            class="theme-card"
            :class="{ active: currentTheme === theme.id }"
            @click="selectTheme(theme.id)"
          >
            <div class="theme-preview" :class="`theme-${theme.id}`">
              <div class="preview-header"></div>
              <div class="preview-content">
                <div class="preview-sidebar"></div>
                <div class="preview-main"></div>
              </div>
            </div>
            <div class="theme-info">
              <h4>{{ theme.name }}</h4>
              <p>{{ theme.description }}</p>
            </div>
            <div class="theme-status" v-if="currentTheme === theme.id">
              <span class="status-badge">当前主题</span>
            </div>
          </div>
        </div>
      </div>

      <div class="theme-section">
        <h3>窗口效果</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label>
              <input
                type="checkbox"
                v-model="enableShadow"
                @change="updateShadow"
              />
              <span>窗口阴影</span>
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input
                type="checkbox"
                v-model="enableGlass"
                @change="updateGlass"
              />
              <span>毛玻璃效果</span>
            </label>
          </div>
        </div>
      </div>

      <div class="theme-section">
        <h3>动画设置</h3>
        <div class="animation-controls">
          <div class="control-group">
            <label>动画速度</label>
            <select v-model="animationSpeed" @change="updateAnimationSpeed">
              <option value="fast">快速 (0.15s)</option>
              <option value="normal">正常 (0.3s)</option>
              <option value="slow">慢速 (0.5s)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { system } from '../../core/api/system';

const themes = [
  {
    id: 'light',
    name: '默认主题',
    description: '清新明亮的浅色主题'
  },
  {
    id: 'dark',
    name: '深色主题',
    description: '护眼的深色界面'
  },
  {
    id: 'glass',
    name: '毛玻璃主题',
    description: '半透明的现代玻璃效果'
  }
];

const currentTheme = computed(() => system.theme);
const enableShadow = ref(system.config.enableWindowShadow);
const enableGlass = ref(system.config.enableGlassEffect);
const animationSpeed = ref('normal');

onMounted(() => {
  // 根据当前动画持续时间设置速度
  const duration = system.config.windowAnimations.open;
  if (duration.includes('0.15')) animationSpeed.value = 'fast';
  else if (duration.includes('0.5')) animationSpeed.value = 'slow';
  else animationSpeed.value = 'normal';
});

function selectTheme(themeId: string) {
  system.setTheme(themeId);
  
  // 如果选择毛玻璃主题，自动开启毛玻璃效果
  if (themeId === 'glass') {
    enableGlass.value = true;
    updateGlass();
  }
}

function updateShadow() {
  system.config.enableWindowShadow = enableShadow.value;
  // 触发重新渲染窗口阴影
  document.documentElement.style.setProperty(
    '--enable-window-shadow',
    enableShadow.value ? '1' : '0'
  );
}

function updateGlass() {
  system.config.enableGlassEffect = enableGlass.value;
  // 触发重新渲染毛玻璃效果
  document.documentElement.style.setProperty(
    '--enable-glass-effect',
    enableGlass.value ? '1' : '0'
  );
}

function updateAnimationSpeed() {
  const speeds = {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s'
  };
  
  const duration = speeds[animationSpeed.value as keyof typeof speeds];
  
  // 更新所有动画持续时间
  system.config.windowAnimations = {
    open: `fade-in ${duration} ease`,
    close: `fade-out ${duration} ease`,
    minimize: `scale-down ${duration} ease`,
    maximize: `scale-up ${duration} ease`,
    restore: `scale-up ${duration} ease`
  };
  
  // 应用到CSS变量
  document.documentElement.style.setProperty('--animation-duration', duration);
}
</script>

<style scoped>
.theme-app {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  background: var(--bg-color);
}

.theme-header {
  margin-bottom: 30px;
  text-align: center;
}

.theme-header h2 {
  color: var(--text-color);
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
}

.theme-header p {
  color: var(--text-color-light);
  font-size: 16px;
}

.theme-content {
  max-width: 800px;
  margin: 0 auto;
}

.theme-section {
  margin-bottom: 40px;
}

.theme-section h3 {
  color: var(--text-color);
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.theme-card {
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-color-light);
}

.theme-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow);
}

.theme-card.active {
  border-color: var(--primary-color);
  box-shadow: 0 4px 16px rgba(74, 144, 226, 0.3);
}

.theme-preview {
  height: 120px;
  position: relative;
  overflow: hidden;
}

.theme-light {
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
}

.theme-dark {
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
}

.theme-glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%);
  backdrop-filter: blur(10px);
}

.preview-header {
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.preview-content {
  display: flex;
  height: 96px;
  padding: 8px;
  gap: 8px;
}

.preview-sidebar {
  width: 60px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.preview-main {
  flex: 1;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
}

.theme-info {
  padding: 16px;
}

.theme-info h4 {
  color: var(--text-color);
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
}

.theme-info p {
  color: var(--text-color-light);
  font-size: 14px;
}

.theme-status {
  padding: 0 16px 16px;
}

.status-badge {
  background: var(--primary-color);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-color);
  font-size: 14px;
}

.setting-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color);
}

.animation-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  color: var(--text-color);
  font-size: 14px;
  font-weight: 500;
}

.control-group select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
}

.control-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}
</style>
