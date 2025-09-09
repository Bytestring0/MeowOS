<template>
  <div class="animation-settings">
    <h2>动画设置</h2>
    
    <div class="settings-section">
      <h3>预设方案</h3>
      <div class="presets-grid">
        <div 
          v-for="preset in presets" 
          :key="preset.id"
          class="preset-card"
          :class="{ active: currentPreset === preset.id }"
          @click="selectPreset(preset.id)"
        >
          <div class="preset-name">{{ preset.name }}</div>
          <div class="preset-description">{{ preset.description }}</div>
          <div class="preset-speed">
            窗口动画: {{ getSpeedText(preset.windowOpen.duration) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedPreset" class="settings-section">
      <h3>预览动画</h3>
      <div class="preview-buttons">
        <button @click="previewAnimation('open')" class="preview-btn">
          窗口打开
        </button>
        <button @click="previewAnimation('close')" class="preview-btn">
          窗口关闭
        </button>
        <button @click="previewAnimation('maximize')" class="preview-btn">
          窗口最大化
        </button>
      </div>
    </div>

    <div v-if="selectedPreset" class="settings-section">
      <h3>当前方案详情</h3>
      <div class="details-grid">
        <div class="detail-item">
          <label>窗口打开</label>
          <span>{{ selectedPreset.windowOpen.duration }}ms - {{ selectedPreset.windowOpen.easing }}</span>
        </div>
        <div class="detail-item">
          <label>窗口关闭</label>
          <span>{{ selectedPreset.windowClose.duration }}ms - {{ selectedPreset.windowClose.easing }}</span>
        </div>
        <div class="detail-item">
          <label>窗口最小化</label>
          <span>{{ selectedPreset.windowMinimize.duration }}ms - {{ selectedPreset.windowMinimize.easing }}</span>
        </div>
        <div class="detail-item">
          <label>窗口最大化</label>
          <span>{{ selectedPreset.windowMaximize.duration }}ms - {{ selectedPreset.windowMaximize.easing }}</span>
        </div>
        <div class="detail-item">
          <label>图标悬停</label>
          <span>{{ selectedPreset.desktopIconHover.duration }}ms - {{ selectedPreset.desktopIconHover.easing }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./AnimationSettingsApp.ts"></script>

<style scoped>
.animation-settings {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin: 0 0 24px 0;
  color: var(--text-color);
  font-size: 24px;
}

h3 {
  margin: 0 0 16px 0;
  color: var(--text-color);
  font-size: 18px;
}

.settings-section {
  margin-bottom: 32px;
  padding: 20px;
  background: var(--bg-color-light);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.preset-card {
  padding: 16px;
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 200ms ease;
}

.preset-card:hover {
  border-color: var(--primary-color, #4A90E2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.preset-card.active {
  border-color: var(--primary-color, #4A90E2);
  background: rgba(74, 144, 226, 0.1);
}

.preset-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

.preset-description {
  color: var(--text-color-light);
  font-size: 14px;
  margin-bottom: 8px;
}

.preset-speed {
  color: var(--text-color-lighter);
  font-size: 12px;
}

.preview-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.preview-btn {
  padding: 8px 16px;
  background: var(--primary-color, #4A90E2);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 200ms ease;
  font-size: 14px;
}

.preview-btn:hover {
  background: var(--primary-color-dark, #357ABD);
  transform: translateY(-1px);
}

.details-grid {
  display: grid;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color-lighter);
}

.detail-item label {
  font-weight: 500;
  color: var(--text-color);
}

.detail-item span {
  color: var(--text-color-light);
  font-family: monospace;
  font-size: 12px;
}
</style>
