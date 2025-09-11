import { defineComponent, ref, onMounted, computed } from 'vue';
import { system } from '../api/system';
import { storage } from '../api/storage';
import { eventBus, SystemEvents } from '../services/eventBus';
import type { AppManifest } from '../types/system';

export default defineComponent({
  name: 'Desktop',
  
  setup() {
    const wallpaper = ref('/wallpapers/default.svg');

    const apps = ref<AppManifest[]>([]);
    const gridSize = ref({ columns: 6, rows: 4 });

    // 计算网格布局
    const gridStyle = computed(() => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${gridSize.value.columns}, 1fr)`,
      gridTemplateRows: `repeat(${gridSize.value.rows}, 1fr)`,
      gap: '20px',
      padding: '20px',
    }));

    // 加载壁纸
    const loadWallpaper = async () => {
      const saved = await storage.getSystemSetting('wallpaper');
      if (saved) {
        wallpaper.value = saved;
      }
    };

    // 加载应用列表
    const loadApps = () => {
      apps.value = system.listApps();
    };

    // 打开应用
    const openApp = async (appId: string) => {
      await system.openApp(appId);
    };

    // 监听事件
    onMounted(() => {    
      console.log('Default wallpaper path:', wallpaper.value);
      loadWallpaper();
      loadApps();

      // 监听壁纸变化
      eventBus.on(SystemEvents.WallpaperChanged, (newWallpaper: string) => {
        wallpaper.value = newWallpaper;
      });

      // 监听应用变化
      eventBus.on(SystemEvents.AppLoaded, () => loadApps());
      eventBus.on(SystemEvents.AppUnloaded, () => loadApps());
    });

    return {
      wallpaper,
      apps,
      gridStyle,
      openApp,
    };
  },
});
