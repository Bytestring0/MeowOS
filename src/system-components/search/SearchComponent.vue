<template>
  <div 
    class="search-component"
    :class="{ expanded: isExpanded }"
    :style="componentStyle"
  >
    <!-- 搜索图标按钮 -->
    <div 
      class="search-icon"
      @click="toggleExpanded"
      @mousedown="startDrag"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
        <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>

    <!-- 展开的搜索界面 -->
    <div v-if="isExpanded" class="search-panel">
      <!-- 搜索框 -->
      <div class="search-input-container">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="搜索网络..."
          class="search-input"
          @keyup.enter="performSearch"
          @input="onSearchInput"
        />
        <button 
          class="search-btn"
          @click="performSearch"
          :disabled="!searchQuery.trim()"
        >
          搜索
        </button>
      </div>

      <!-- 搜索建议 -->
      <div v-if="suggestions.length > 0" class="suggestions">
        <div 
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="suggestion-item"
          @click="selectSuggestion(suggestion)"
        >
          {{ suggestion }}
        </div>
      </div>

      <!-- 快速搜索按钮 -->
      <div class="quick-search">
        <button 
          v-for="engine in searchEngines"
          :key="engine.id"
          class="quick-btn"
          :class="{ active: engine.id === currentEngine }"
          @click="setSearchEngine(engine.id)"
          :title="engine.name"
        >
          <img :src="engine.icon" :alt="engine.name" class="engine-icon" />
        </button>
      </div>

      <!-- 设置按钮 -->
      <div class="panel-footer">
        <button class="settings-btn" @click="toggleSettings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="currentColor" stroke-width="2"/>
          </svg>
          设置
        </button>
        <button class="close-btn" @click="closePanel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <!-- 设置面板 -->
      <div v-if="showSettings" class="settings-panel">
        <h3>搜索设置</h3>
        
        <div class="setting-group">
          <label>默认搜索引擎：</label>
          <select v-model="currentEngine" @change="saveSettings">
            <option v-for="engine in searchEngines" :key="engine.id" :value="engine.id">
              {{ engine.name }}
            </option>
          </select>
        </div>

        <div class="setting-group">
          <label>
            <input 
              type="checkbox" 
              v-model="settings.openInNewTab"
              @change="saveSettings"
            />
            在新标签页中打开结果
          </label>
        </div>

        <div class="setting-group">
          <label>
            <input 
              type="checkbox" 
              v-model="settings.showSuggestions"
              @change="saveSettings"
            />
            显示搜索建议
          </label>
        </div>

        <div class="setting-group">
          <label>搜索历史记录：</label>
          <div class="history-controls">
            <button @click="clearHistory" class="clear-btn">清除历史</button>
            <span class="history-count">{{ searchHistory.length }} 条记录</span>
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
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q={query}',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiM0Mjg1RjQiLz48L3N2Zz4='
  },
  {
    id: 'bing',
    name: 'Bing',
    url: 'https://www.bing.com/search?q={query}',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMwMDc4RDQiLz48L3N2Zz4='
  },
  {
    id: 'baidu',
    name: '百度',
    url: 'https://www.baidu.com/s?wd={query}',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMyMzE5REMiLz48L3N2Zz4='
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q={query}',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNERTU4MzMiLz48L3N2Zz4='
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
  const baseStyle = {
    left: settings.position.x + 'px',
    top: settings.position.y + 'px',
    zIndex: props.componentState?.zIndex || 100
  };

  if (isExpanded.value) {
    return {
      ...baseStyle,
      width: '320px',
      height: 'auto'
    };
  }

  return {
    ...baseStyle,
    width: '60px',
    height: '60px'
  };
});

// 方法
const toggleExpanded = async () => {
  isExpanded.value = !isExpanded.value;
  showSettings.value = false;
  
  if (isExpanded.value) {
    await nextTick();
    searchInput.value?.focus();
  }
};

const closePanel = () => {
  isExpanded.value = false;
  showSettings.value = false;
  searchQuery.value = '';
  suggestions.value = [];
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

  // 清除搜索框和建议
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

  // 从搜索历史中生成建议
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
  if (isExpanded.value) return; // 展开时不允许拖拽
  
  isDragging.value = true;
  dragOffset.value = {
    x: event.clientX - settings.position.x,
    y: event.clientY - settings.position.y
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return;
    
    settings.position.x = e.clientX - dragOffset.value.x;
    settings.position.y = e.clientY - dragOffset.value.y;
    
    // 限制在屏幕范围内
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    
    settings.position.x = Math.max(0, Math.min(settings.position.x, maxX));
    settings.position.y = Math.max(0, Math.min(settings.position.y, maxY));
  };

  const handleMouseUp = () => {
    isDragging.value = false;
    saveSettings();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  event.preventDefault();
};

// 存储管理
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
  
  // 点击外部关闭面板
  const handleClickOutside = (event: MouseEvent) => {
    if (isExpanded.value) {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-component')) {
        closePanel();
      }
    }
  };
  
  document.addEventListener('click', handleClickOutside);
  
  // 组件销毁时移除监听器
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
});

// 监听设置变化自动保存
watch([currentEngine, searchHistory, settings], () => {
  saveSettings();
}, { deep: true });
</script>

<style scoped>
.search-component {
  position: fixed;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--box-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  backdrop-filter: blur(20px);
  z-index: 1000;
}

.search-component.expanded {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.search-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.2s ease;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-secondary, #667eea));
}

.search-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
}

.search-icon svg {
  color: white;
}

.search-panel {
  position: absolute;
  top: 70px;
  left: 0;
  width: 320px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--box-shadow);
  backdrop-filter: blur(20px);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-input-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: var(--accent-color);
}

.search-btn {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.suggestions {
  max-height: 120px;
  overflow-y: auto;
  margin-bottom: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s ease;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: var(--bg-tertiary);
}

.quick-search {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.quick-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.quick-btn:hover {
  border-color: var(--accent-color);
}

.engine-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.panel-footer {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
}

.settings-btn,
.close-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.settings-btn:hover,
.close-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.settings-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.settings-panel h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: var(--text-primary);
}

.setting-group {
  margin-bottom: 12px;
}

.setting-group label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.setting-group select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
}

.setting-group input[type="checkbox"] {
  margin-right: 8px;
}

.history-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-btn {
  padding: 4px 8px;
  background: var(--danger-color, #e74c3c);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.history-count {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 响应式 */
@media (max-width: 768px) {
  .search-panel {
    width: 280px;
  }
  
  .search-component {
    max-width: calc(100vw - 20px);
  }
}
</style>
