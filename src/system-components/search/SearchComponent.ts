import { defineComponent, ref, reactive, onMounted, nextTick } from 'vue';
import { storage } from '../../core/api/storage';

export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export default defineComponent({
  name: 'SearchComponent',
  setup() {
    const isExpanded = ref(false);
    const showSettings = ref(false);
    const searchQuery = ref('');
    const searchInputRef = ref<HTMLInputElement | null>(null);
    
    const searchEngines = ref<SearchEngine[]>([
      {
        id: 'google',
        name: 'Google',
        url: 'https://www.google.com/search?q=',
        icon: 'https://www.google.com/favicon.ico'
      },
      {
        id: 'baidu',
        name: '百度',
        url: 'https://www.baidu.com/s?wd=',
        icon: 'https://www.baidu.com/favicon.ico'
      },
      {
        id: 'bing',
        name: 'Bing',
        url: 'https://www.bing.com/search?q=',
        icon: 'https://www.bing.com/favicon.ico'
      },
      {
        id: 'duckduckgo',
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q=',
        icon: 'https://duckduckgo.com/favicon.ico'
      }
    ]);

    const currentEngine = ref<SearchEngine>(searchEngines.value[0]);
    
    const newEngine = reactive({
      name: '',
      url: ''
    });

    // 加载保存的设置
    onMounted(async () => {
      try {
        const savedEngine = await storage.getAppSetting('system-search', 'currentEngine');
        if (savedEngine) {
          const engine = searchEngines.value.find(e => e.id === savedEngine.id);
          if (engine) {
            currentEngine.value = engine;
          }
        }

        const customEngines = await storage.getAppSetting('system-search', 'customEngines');
        if (customEngines && Array.isArray(customEngines)) {
          searchEngines.value.push(...customEngines);
        }
      } catch (error) {
        console.error('加载搜索设置失败:', error);
      }
    });

    async function saveSettings() {
      try {
        await storage.setAppSetting('system-search', 'currentEngine', currentEngine.value);
        
        const customEngines = searchEngines.value.filter(e => !['google', 'baidu', 'bing', 'duckduckgo'].includes(e.id));
        await storage.setAppSetting('system-search', 'customEngines', customEngines);
      } catch (error) {
        console.error('保存搜索设置失败:', error);
      }
    }

    function toggleExpand() {
      isExpanded.value = !isExpanded.value;
      showSettings.value = false;
      
      if (isExpanded.value) {
        nextTick(() => {
          if (searchInputRef.value) {
            searchInputRef.value.focus();
          }
        });
      } else {
        searchQuery.value = '';
      }
    }

    function toggleSettings() {
      showSettings.value = !showSettings.value;
      if (showSettings.value) {
        isExpanded.value = true;
      }
    }

    function handleSearch() {
      if (!searchQuery.value.trim()) return;
      
      const url = currentEngine.value.url + encodeURIComponent(searchQuery.value.trim());
      window.open(url, '_blank', 'noopener,noreferrer');
      
      // 搜索后收起
      isExpanded.value = false;
      searchQuery.value = '';
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        handleSearch();
      } else if (event.key === 'Escape') {
        isExpanded.value = false;
        showSettings.value = false;
        searchQuery.value = '';
      }
    }

    async function selectEngine(engine: SearchEngine) {
      currentEngine.value = engine;
      await saveSettings();
    }

    function addCustomEngine() {
      if (!newEngine.name.trim() || !newEngine.url.trim()) {
        alert('请填写完整的搜索引擎信息');
        return;
      }

      try {
        new URL(newEngine.url + 'test');
      } catch {
        alert('请输入有效的搜索URL（应包含查询参数）');
        return;
      }

      const engine: SearchEngine = {
        id: `custom-${Date.now()}`,
        name: newEngine.name.trim(),
        url: newEngine.url.trim()
      };

      searchEngines.value.push(engine);
      newEngine.name = '';
      newEngine.url = '';
      
      saveSettings();
    }

    function removeCustomEngine(engineId: string) {
      if (['google', 'baidu', 'bing', 'duckduckgo'].includes(engineId)) {
        alert('不能删除内置搜索引擎');
        return;
      }

      if (confirm('确定要删除这个搜索引擎吗？')) {
        searchEngines.value = searchEngines.value.filter(e => e.id !== engineId);
        
        if (currentEngine.value.id === engineId) {
          currentEngine.value = searchEngines.value[0];
        }
        
        saveSettings();
      }
    }

    function handleIconError(event: Event) {
      const target = event.target as HTMLImageElement;
      target.style.display = 'none';
    }

    return {
      isExpanded,
      showSettings,
      searchQuery,
      searchInputRef,
      searchEngines,
      currentEngine,
      newEngine,
      toggleExpand,
      toggleSettings,
      handleSearch,
      handleKeydown,
      selectEngine,
      addCustomEngine,
      removeCustomEngine,
      handleIconError
    };
  }
});
