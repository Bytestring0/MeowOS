<template>
  <div class="search-component" :class="{
    expanded: isExpanded,
    'settings-open': showSettings,
    dragging: isDragging
  }" :style="componentStyle">
    <!-- 搜索图标按钮 -->
    <div class="search-icon" :class="{ moved: isExpanded }" @mousedown="startDrag" @click="handleIconClick">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
        <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>

    <!-- 搜索框容器 -->
    <div class="search-container" :class="{ visible: isExpanded }">
      <div class="search-input-wrapper">
        <input ref="searchInput" v-model="searchQuery" type="text" :placeholder="`使用 ${getCurrentEngineName()} 搜索...`"
          class="search-input" @keyup.enter="performSearch" @input="onSearchInput" />
        <button class="search-submit" @click="performSearch" :disabled="!searchQuery.trim()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- 搜索建议 -->
      <div v-if="suggestions.length > 0 && isExpanded" class="suggestions">
        <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item"
          @click="selectSuggestion(suggestion)">
          {{ suggestion }}
        </div>
      </div>
    </div>

    <!-- 设置按钮 -->
    <div class="settings-trigger" :class="{ visible: isExpanded }" @click="toggleSettings">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
        <path
          d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
          stroke="currentColor" stroke-width="2" />
      </svg>
    </div>

    <!-- 设置面板 -->
    <div class="settings-panel" :class="{ visible: showSettings }">
      <div class="settings-content">
        <h3>搜索引擎</h3>

        <div class="engine-list">
          <div v-for="engine in searchEngines" :key="engine.id" class="engine-item"
            :class="{ active: engine.id === currentEngine }" @click="setSearchEngine(engine.id)">
            <div class="engine-indicator"></div>
            <span class="engine-name">{{ engine.name }}</span>
          </div>
        </div>

        <div class="settings-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.openInNewTab" @change="saveSettings" />
            <span class="checkmark"></span>
            新标签页打开
          </label>

          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.showSuggestions" @change="saveSettings" />
            <span class="checkmark"></span>
            显示搜索建议
          </label>
        </div>

        <div class="history-section" v-if="searchHistory.length > 0">
          <div class="history-header">
            <span>搜索历史 ({{ searchHistory.length }})</span>
            <button @click="clearHistory" class="clear-btn">清除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { storage } from '../../core/api/storage';

// Props
interface Props {
  componentState?: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
  };
}

const props = defineProps<Props>();

// 响应式数据
const isExpanded = ref(false);
const showSettings = ref(false);
const searchQuery = ref('');
const searchInput = ref<HTMLInputElement>();
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

// 搜索引擎配置
const searchEngines = ref([
  {
    id: 'bing',
    name: 'Bing',
    url: 'https://www.bing.com/search?q={query}'
  }, {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q={query}'
  }
  ,
  {
    id: 'baidu',
    name: '百度',
    url: 'https://www.baidu.com/s?wd={query}'
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q={query}'
  }
]);

const currentEngine = ref('google');
const searchHistory = ref<string[]>([]);
const suggestions = ref<string[]>([]);

// 设置
const settings = reactive({
  openInNewTab: true,
  showSuggestions: true,
  position: { x: 100, y: 100 }
});

// 计算属性
const componentStyle = computed(() => {
  return {
    left: settings.position.x + 'px',
    top: settings.position.y + 'px',
    zIndex: props.componentState?.zIndex || 100
  };
});

// 方法
const getCurrentEngineName = () => {
  const engine = searchEngines.value.find(e => e.id === currentEngine.value);
  return engine?.name || 'Bing';
};

// 方法
const toggleExpanded = async () => {
  isExpanded.value = !isExpanded.value;
  showSettings.value = false;

  if (isExpanded.value) {
    await nextTick();
    searchInput.value?.focus();
  } else {
    searchQuery.value = '';
    suggestions.value = [];
  }
};

const handleIconClick = (event: MouseEvent) => {
  if (isDragging.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (isExpanded.value) {
    toggleExpanded();
  }
};

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

const performSearch = () => {
  const query = searchQuery.value.trim();
  if (!query) return;

  // 添加到搜索历史
  if (!searchHistory.value.includes(query)) {
    searchHistory.value.unshift(query);
    if (searchHistory.value.length > 20) {
      searchHistory.value = searchHistory.value.slice(0, 20);
    }
    saveSettings();
  }

  // 获取搜索引擎
  const engine = searchEngines.value.find(e => e.id === currentEngine.value);
  if (engine) {
    const searchUrl = engine.url.replace('{query}', encodeURIComponent(query));

    if (settings.openInNewTab) {
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = searchUrl;
    }
  }

  searchQuery.value = '';
  suggestions.value = [];
};

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion;
  performSearch();
};

const setSearchEngine = (engineId: string) => {
  currentEngine.value = engineId;
  saveSettings();
};

const onSearchInput = () => {
  if (!settings.showSuggestions || !searchQuery.value.trim()) {
    suggestions.value = [];
    return;
  }

  const query = searchQuery.value.toLowerCase();
  suggestions.value = searchHistory.value
    .filter(item => item.toLowerCase().includes(query) && item !== searchQuery.value)
    .slice(0, 5);
};

const clearHistory = () => {
  searchHistory.value = [];
  suggestions.value = [];
  saveSettings();
};

// 拖拽功能
const startDrag = (event: MouseEvent) => {
  if (isExpanded.value) return;

  const startX = event.clientX;
  const startY = event.clientY;
  const startTime = Date.now();

  event.preventDefault();
  event.stopPropagation();

  dragOffset.value = {
    x: event.clientX - settings.position.x,
    y: event.clientY - settings.position.y
  };

  let hasMoved = false;

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = Math.abs(e.clientX - startX);
    const deltaY = Math.abs(e.clientY - startY);

    if (deltaX > 5 || deltaY > 5) {
      hasMoved = true;
      isDragging.value = true;
    }

    if (isDragging.value) {
      e.preventDefault();

      const newX = e.clientX - dragOffset.value.x;
      const newY = e.clientY - dragOffset.value.y;

      // 限制在屏幕范围内
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;

      settings.position.x = Math.max(0, Math.min(newX, maxX));
      settings.position.y = Math.max(0, Math.min(newY, maxY));
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    const endTime = Date.now();
    const deltaTime = endTime - startTime;

    if (isDragging.value) {
      isDragging.value = false;
      saveSettings();
    }

    if (!hasMoved && deltaTime < 200 && !isExpanded.value) {
      setTimeout(() => toggleExpanded(), 0);
    }

    setTimeout(() => {
      isDragging.value = false;
    }, 50);

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};


const saveSettings = async () => {
  try {
    await storage.set('search-component-settings', {
      currentEngine: currentEngine.value,
      searchHistory: searchHistory.value,
      settings: settings
    });
  } catch (error) {
    console.error('保存搜索组件设置失败:', error);
  }
};

const loadSettings = async () => {
  try {
    const saved = await storage.get('search-component-settings');
    if (saved) {
      currentEngine.value = saved.currentEngine || 'google';
      searchHistory.value = saved.searchHistory || [];
      Object.assign(settings, saved.settings || {});
    }
  } catch (error) {
    console.error('加载搜索组件设置失败:', error);
  }
};

// 生命周期
onMounted(() => {
  loadSettings();

  const handleClickOutside = (event: MouseEvent) => {
    if (isExpanded.value) {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-component')) {
        isExpanded.value = false;
        showSettings.value = false;
        searchQuery.value = '';
        suggestions.value = [];
      }
    }
  };

  document.addEventListener('click', handleClickOutside);

  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
});

watch([currentEngine, searchHistory, settings], () => {
  saveSettings();
}, { deep: true });
</script>

<style scoped>
.search-component {
  position: fixed;
  display: flex;
  align-items: flex-start;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  user-select: none;
}

.search-component.dragging {
  transition: none;
}

.search-component.expanded {
  width: 350px;
}

/* 搜索图标 */
.search-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--accent-color, #4A90E2), var(--accent-secondary, #667eea));
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 4px 20px rgba(74, 144, 226, 0.3);
  color: white;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  transform-origin: center;
}

.search-icon:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 30px rgba(74, 144, 226, 0.5);
}

.search-icon:active {
  transform: scale(0.95);
}

.search-icon.moved {
  transform: translateX(280px) scale(0.9);
  border-radius: 15px 25px 25px 15px;
  animation: iconBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes iconBounce {
  0% {
    transform: translateX(0) scale(1);
  }

  50% {
    transform: translateX(300px) scale(1.1) rotate(10deg);
  }

  100% {
    transform: translateX(280px) scale(0.9);
  }
}

/* 搜索容器 */
.search-container {
  position: absolute;
  left: 60px;
  top: 0;
  height: 50px;
  width: 280px;
  background: var(--bg-color, rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 25px;
  overflow: hidden;
  transform: scaleX(0);
  transform-origin: left center;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-container.visible {
  transform: scaleX(1);
  animation: containerSlide 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes containerSlide {
  0% {
    transform: scaleX(0) translateX(-20px);
    opacity: 0;
  }

  50% {
    transform: scaleX(1.05) translateX(0);
    opacity: 0.8;
  }

  100% {
    transform: scaleX(1) translateX(0);
    opacity: 1;
  }
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  gap: 12px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: var(--text-primary, #333);
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: var(--text-secondary, #888);
}

.search-input:focus {
  transform: scale(1.02);
}

.search-submit {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--accent-color, #4A90E2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  color: white;
}

.search-submit:hover:not(:disabled) {
  background: var(--accent-hover, #357abd);
  transform: scale(1.2) rotate(10deg);
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
}

.search-submit:active {
  transform: scale(0.9);
}

.search-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: scale(0.9);
}

/* 搜索建议 */
.suggestions {
  position: absolute;
  top: 60px;
  left: 60px;
  width: 280px;
  background: var(--bg-color, rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 9;
  animation: suggestionsSlide 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  pointer-events: auto;
  /* 建议框始终可点击 */
}

@keyframes suggestionsSlide {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.suggestion-item {
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary, #333);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.05));
  transition: all 0.2s ease;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: var(--bg-hover, rgba(74, 144, 226, 0.1));
  transform: translateX(8px);
}

/* 设置触发按钮 */
.settings-trigger {
  position: absolute;
  top: 65px;
  left: 15px;
  width: 40px;
  height: 40px;
  background: var(--bg-color, rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: translateY(-20px) scale(0.8);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  color: var(--text-secondary, #666);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  /* 默认不可点击 */
}

.settings-trigger.visible {
  transform: translateY(0) scale(1);
  opacity: 1;
  transition-delay: 0.3s;
  animation: settingsBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s;
  pointer-events: auto;
  /* 可见时可点击 */
}

@keyframes settingsBounce {
  0% {
    transform: translateY(-20px) scale(0.8);
  }

  50% {
    transform: translateY(-5px) scale(1.1);
  }

  100% {
    transform: translateY(0) scale(1);
  }
}

.settings-trigger:hover {
  background: var(--accent-color, #4A90E2);
  color: white;
  transform: translateY(0) scale(1.15) rotate(180deg);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

/* 设置面板 */
.settings-panel {
  position: absolute;
  top: 65px;
  left: 70px;
  width: 260px;
  background: var(--bg-color, rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-20px) scale(0.9);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 8;
  pointer-events: none;
  /* 默认不可点击 */
}

.settings-panel.visible {
  transform: translateY(0) scale(1);
  opacity: 1;
  pointer-events: auto;
  /* 可见时可点击 */
  animation: panelSlide 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes panelSlide {
  0% {
    opacity: 0;
    transform: translateY(-30px) scale(0.8);
  }

  50% {
    transform: translateY(5px) scale(1.05);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.settings-content {
  padding: 20px;
}

.settings-content h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #333);
}

/* 搜索引擎列表 */
.engine-list {
  margin-bottom: 20px;
}

.engine-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding-left: 12px;
}

.engine-item:hover {
  background: var(--bg-hover, rgba(74, 144, 226, 0.05));
}

.engine-indicator {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color, #ddd);
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
}

.engine-item.active .engine-indicator {
  border-color: var(--accent-color, #4A90E2);
  background: var(--accent-color, #4A90E2);
}

.engine-item.active .engine-indicator::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.engine-name {
  font-size: 14px;
  color: var(--text-primary, #333);
  font-weight: 500;
}

/* 设置选项 */
.settings-options {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary, #333);
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color, #ddd);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-label input[type="checkbox"]:checked+.checkmark {
  background: var(--accent-color, #4A90E2);
  border-color: var(--accent-color, #4A90E2);
}

.checkbox-label input[type="checkbox"]:checked+.checkmark::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* 历史记录部分 */
.history-section {
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  padding-top: 16px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-header span {
  font-size: 14px;
  color: var(--text-secondary, #666);
}

.clear-btn {
  padding: 4px 12px;
  background: var(--danger-color, #e74c3c);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: var(--danger-hover, #c0392b);
}

/* 响应式 */
@media (max-width: 768px) {
  .search-component.expanded {
    width: 300px;
  }

  .search-container {
    width: 230px;
  }

  .search-icon.moved {
    transform: translateX(230px);
  }

  .suggestions {
    width: 230px;
  }

  .settings-panel {
    width: 220px;
  }
}
</style>
