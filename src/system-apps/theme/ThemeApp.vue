<template>
  <div class="theme-app">
    <div class="theme-header">
      <h2>主题设置</h2>
      <p>选择您喜欢的主题外观</p>
      <div class="config-info">
        <span class="info-badge">💡 提示</span>
        <span>您可以在 <code>src/config/user-config.ts</code> 文件中添加自定义主题</span>
      </div>
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
            <div class="theme-preview" :style="getThemePreviewStyle(theme.id)">
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

// 动态获取所有可用主题（包括系统默认主题和用户自定义主题）
const themes = computed(() => system.themes.map(theme => ({
  id: theme.id,
  name: theme.name,
  description: getThemeDescription(theme.id)
})));

function getThemeDescription(themeId: string): string {
  const descriptions: Record<string, string> = {
    light: '清新明亮的浅色主题',
    dark: '护眼的深色界面',
    glass: '半透明的现代玻璃效果',
    'custom-blue': '专业的深蓝色商务主题',
    cyberpunk: '未来科技感的霓虹主题',
    pink: '温柔浪漫的粉色主题'
  };
  return descriptions[themeId] || '自定义主题';
}

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
  
  // 根据主题特性自动调整效果
  const theme = system.themes.find(t => t.id === themeId);
  if (theme?.effects?.windowBlur) {
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
  
  // 更新系统动画配置
  const easing = 'cubic-bezier(0.25, 0.8, 0.25, 1)';
  system.config.windowAnimations = {
    open: `fade-in ${duration} ${easing}`,
    close: `fade-out ${duration} ${easing}`,
    minimize: `scale-down ${duration} ${easing}`,
    maximize: `scale-up ${duration} ${easing}`,
    restore: `scale-up ${duration} ${easing}`
  };
  
  // 更新CSS变量
  document.documentElement.style.setProperty('--animation-duration', duration);
}

function getThemePreviewStyle(themeId: string) {
  const theme = system.themes.find(t => t.id === themeId);
  if (!theme) return {};
  
  const vars = theme.variables;
  return {
    '--preview-bg': vars['--bg-color'] || '#ffffff',
    '--preview-bg-light': vars['--bg-color-light'] || '#f5f7fa',
    '--preview-primary': vars['--primary-color'] || '#4a90e2',
    '--preview-text': vars['--text-color'] || '#303133',
    '--preview-border': vars['--border-color'] || '#dcdfe6'
  };
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
  margin-bottom: 16px;
}

.config-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-color-light);
  max-width: 600px;
  margin: 0 auto;
}

.info-badge {
  padding: 2px 6px;
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.config-info code {
  background: var(--bg-color-darker);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: var(--primary-color);
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
  background: var(--preview-bg, #ffffff);
  border-bottom: 1px solid var(--preview-border, #dcdfe6);
}

.preview-header {
  height: 24px;
  background: var(--preview-primary, #4a90e2);
  opacity: 0.8;
  border-bottom: 1px solid var(--preview-border, #dcdfe6);
}

.preview-content {
  display: flex;
  height: 96px;
  padding: 8px;
  gap: 8px;
  background: var(--preview-bg-light, #f5f7fa);
}

.preview-sidebar {
  width: 60px;
  background: var(--preview-primary, #4a90e2);
  opacity: 0.6;
  border-radius: 4px;
}

.preview-main {
  flex: 1;
  background: var(--preview-bg, #ffffff);
  border: 1px solid var(--preview-border, #dcdfe6);
  border-radius: 4px;
  position: relative;
}

.preview-main::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  height: 8px;
  background: var(--preview-primary, #4a90e2);
  opacity: 0.3;
  border-radius: 2px;
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
