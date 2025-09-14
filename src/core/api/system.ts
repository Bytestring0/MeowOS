import { ref, reactive } from 'vue';
import type {
  AppManifest,
  WindowState,
  SystemState,
  SystemConfig,
  TaskbarItem,
  ThemeDefinition,
  WallpaperSource,
  UserConfig
} from '../types/system';
import { storage } from './storage';
import { eventBus, SystemEvents } from './event';
import { defaultSystemConfig, mergeUserConfig } from './config';
import { userConfig } from '../../config/user-config';

class SystemService {
  private state = reactive<SystemState>({
    apps: [],
    windows: [],
    theme: '',
    wallpaper: '',
    settings: {},
    config: defaultSystemConfig,
  });

  private nextWindowId = 0;
  private nextZIndex = 1000;
  private userConfig: UserConfig = {};
  private initialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.initialized) return;
    
    // 加载用户配置
    this.userConfig = userConfig;
    this.state.config = mergeUserConfig(userConfig);
    
    await this.loadSettings();
    await this.loadApps();
    
    // 应用用户配置的默认主题
    if (userConfig.defaultTheme) {
      this.state.theme = userConfig.defaultTheme;
    }
    
    this.initialized = true;
  }

  // 用户配置接口
  setUserConfig(config: UserConfig) {
    this.userConfig = config;
    this.state.config = mergeUserConfig(config);
    this.applyTheme(this.state.theme);
  }

  getUserConfig(): UserConfig {
    return this.userConfig;
  }

  private async loadApps() {
    this.state.apps = this.getDefaultSystemApps();
    // 初始化图标位置
    this.initializeIconPositions();
  }

  // 初始化图标位置（为没有位置信息的应用分配位置）
  private initializeIconPositions() {
    const visibleApps = this.state.apps.filter(a => 
      (a.showOnDesktop !== false) && !a.isSystemComponent
    );

    visibleApps.forEach((app, index) => {
      if (!app.desktopPosition) {
        app.desktopPosition = {
          x: 0,
          y: 0,
          gridIndex: index
        };
      }
    });
  }

  private getDefaultSystemApps(): AppManifest[] {
    // 扫描 system-apps 下所有 manifest.json
    const modules = import.meta.glob('../../system-apps/*/manifest.json', { eager: true });

    const apps: AppManifest[] = [];
    for (const path in modules) {
      const mod: any = modules[path];
      const manifest: AppManifest = mod.default || mod;

      apps.push(manifest);
    }
    console.log('Loaded system apps:', apps);
    return apps;
  }
  private async loadSettings() {
    const savedSettings = await storage.getSystemSetting('systemSettings');
    if (savedSettings) {
      console.log('Loaded system settings:', savedSettings);
      this.state.theme = savedSettings.theme || 'light';
      this.state.wallpaper = savedSettings.wallpaper || '/wallpapers/default.svg';
      this.state.settings = { ...this.state.settings, ...savedSettings.settings };
    } else {
      // 如果没有保存的设置，使用默认值
      this.state.theme = 'light';
      this.state.wallpaper = '/wallpapers/default.svg';
    }

    // 加载图标位置信息
    await this.loadIconPositions();

    // 应用已保存的主题
    this.applyTheme(this.state.theme);
  }

  private async saveSettings() {
    const settings = {
      theme: this.state.theme,
      wallpaper: this.state.wallpaper,
      settings: this.state.settings,
    };
    await storage.setSystemSetting('systemSettings', settings);
  }

  // 加载图标位置信息
  private async loadIconPositions() {
    const savedPositions = await storage.getSystemSetting('iconPositions');
    if (savedPositions) {
      console.log('Loaded icon positions:', savedPositions);
      // 将保存的位置信息应用到应用列表中
      this.state.apps.forEach(app => {
        const savedPos = savedPositions[app.id];
        if (savedPos) {
          app.desktopPosition = savedPos;
        }
      });
      eventBus.emit(SystemEvents.DesktopLayoutLoaded, savedPositions);
    }
  }

  // 保存图标位置信息
  public async saveIconPositions() {
    const positions: Record<string, any> = {};
    const metadata = {
      savedAt: new Date().toISOString(),
      version: '1.0',
      totalApps: 0
    };

    this.state.apps.forEach(app => {
      if (app.desktopPosition) {
        positions[app.id] = {
          ...app.desktopPosition,
          appName: app.name, // 保存应用名称用于调试
          appVersion: app.version
        };
        metadata.totalApps++;
      }
    });

    // 保存位置数据和元数据
    await storage.setSystemSetting('iconPositions', positions);
    await storage.setSystemSetting('iconPositionsMetadata', metadata);
    
    console.log('Saved icon positions:', positions);
    console.log('Saved metadata:', metadata);
    
    eventBus.emit(SystemEvents.DesktopLayoutSaved, { positions, metadata });
  }

  // 更新单个应用的桌面位置
  public updateAppPosition(appId: string, position: { x: number; y: number; gridIndex?: number }) {
    const app = this.state.apps.find(a => a.id === appId);
    if (app) {
      const oldPosition = app.desktopPosition;
      app.desktopPosition = position;
      
      // 发布位置变更事件
      eventBus.emit(SystemEvents.IconPositionChanged, {
        appId,
        oldPosition,
        newPosition: position
      });
      
      this.saveIconPositions(); // 自动保存
    }
  }

  // 交换两个应用的位置
  public swapAppPositions(appId1: string, appId2: string) {
    const app1 = this.state.apps.find(a => a.id === appId1);
    const app2 = this.state.apps.find(a => a.id === appId2);
    
    if (app1 && app2) {
      const temp = app1.desktopPosition;
      app1.desktopPosition = app2.desktopPosition;
      app2.desktopPosition = temp;
      
      // 发布交换事件
      eventBus.emit(SystemEvents.IconOrderChanged, {
        app1: appId1,
        app2: appId2,
        position1: app1.desktopPosition,
        position2: app2.desktopPosition
      });
      
      this.saveIconPositions(); // 自动保存
    }
  }

  // 批量更新图标位置（用于拖拽排序）
  public updateMultipleAppPositions(updates: Array<{ appId: string; position: { x: number; y: number; gridIndex?: number } }>) {
    const changedApps: Array<{ appId: string; oldPosition: any; newPosition: any }> = [];
    
    updates.forEach(({ appId, position }) => {
      const app = this.state.apps.find(a => a.id === appId);
      if (app) {
        const oldPosition = app.desktopPosition;
        app.desktopPosition = position;
        changedApps.push({ appId, oldPosition, newPosition: position });
      }
    });

    if (changedApps.length > 0) {
      // 发布批量更新事件
      eventBus.emit(SystemEvents.IconOrderChanged, {
        type: 'batch',
        changes: changedApps
      });
      
      this.saveIconPositions(); // 自动保存
    }
  }

  private createWindowState(app: AppManifest): WindowState {
    const id = `${app.id}-${this.nextWindowId++}`;
    return {
      app,
      id,
      title: app.name,
      icon: app.icon,
      component: app.entry,
      position: {
        x: 60 + (this.nextWindowId % 8) * 30,
        y: 50 + (this.nextWindowId % 6) * 30,
      },
      size: { width: 840, height: 620 },
      isMinimized: false,
      isMaximized: false,
      zIndex: this.nextZIndex++,
    };
  }

  // 公共API
  listApps(): AppManifest[] {
    return this.state.apps;
  }
  getWindows(): WindowState[] {
    return this.state.windows;
  }
  get config() {
    return this.state.config;
  }
  get theme() {
    return this.state.theme;
  }
  get wallpaper() {
    return this.state.wallpaper;
  }
  get themes() {
    return this.state.config.themes;
  }
  async openApp(appId: string, options?: Partial<WindowState>): Promise<WindowState | null> {
    const app = this.state.apps.find(a => a.id === appId);
    if (!app) {
      console.error(`App not found: ${appId}`);
      return null;
    }
    if (app.singleInstance) {
      const existing = this.state.windows.find(w => w.id.startsWith(appId));
      if (existing) {
        existing.isMinimized = false;
        existing.isHidden = false;
        existing.zIndex = this.nextZIndex++;
        return existing;
      }
    }
    const windowState = this.createWindowState(app);
    if (options) Object.assign(windowState, options);
    this.state.windows.push(windowState);
    eventBus.emit(SystemEvents.WindowOpened, windowState);
    return windowState;
  }

  closeApp(appId: string): boolean {
    const index = this.state.windows.findIndex(w => w.id.startsWith(appId));
    if (index !== -1) {
      const removed = this.state.windows.splice(index, 1)[0];
      eventBus.emit(SystemEvents.WindowClosed, removed);
      return true;
    }
    return false;
  }

  focusWindow(windowId: string) {
    const w = this.state.windows.find(w => w.id === windowId);
    if (w) {
      w.zIndex = this.nextZIndex++;
      w.isMinimized = false;
      w.isHidden = false;
      eventBus.emit(SystemEvents.WindowFocused, w);
    }
  }
  minimizeWindow(windowId: string) {
    const w = this.state.windows.find(w => w.id === windowId);
    if (w) {
      w.isMinimized = true;
      w.isHidden = true;
      eventBus.emit(SystemEvents.WindowMinimized, w);
    }
  }
  maximizeWindow(windowId: string) {
    const w = this.state.windows.find(w => w.id === windowId);
    if (w) {
      eventBus.emit(SystemEvents.WindowMaximized, w);
    }
  }

  async setTheme(themeId: string) {
    this.state.theme = themeId;
    await this.saveSettings();
    eventBus.emit(SystemEvents.ThemeChanged, themeId);
    this.applyTheme(themeId);
  }

  async setWallpaper(wallpaper: string) {
    const oldWallpaper = this.state.wallpaper;
    this.state.wallpaper = wallpaper;
    await this.saveSettings();
    eventBus.emit(SystemEvents.WallpaperChanged, oldWallpaper, wallpaper);
  }

  applyTheme(themeId: string) {
    const theme = this.state.config.themes.find(t => t.id === themeId);
    const root = document.documentElement;
    console.log('Applying theme:', themeId, theme);
    if (theme) {
      root.removeAttribute('data-theme');

      Object.entries(theme.variables || {}).forEach(([key, value]) => {
        if (key.startsWith('--')) {
          root.style.setProperty(key, value);
        } else if (key === 'data-theme') {
          root.setAttribute('data-theme', value);
        }
      });

      this.state.themeEffects = theme.effects;

      eventBus.emit(SystemEvents.ThemeChanged, themeId);
    }
  }

  getTaskbarItems(): TaskbarItem[] {
    return this.state.windows.map(w => ({
      windowId: w.id,
      appId: w.id.split('-')[0],
      title: w.title,
      icon: w.icon,
      isActive: !w.isMinimized && !w.isHidden,
      isMinimized: w.isMinimized,
    }));
  }

  toggleMinimize(windowId: string) {
    const w = this.state.windows.find(w => w.id === windowId);
    if (!w) return;
    if (w.isMinimized) {
      this.focusWindow(windowId);
    } else {
      this.minimizeWindow(windowId);
    }
  }

  public async getDefaultWallpapers() {
    return [
      { id: 'default', name: '默认', value: 'wallpapers/default.svg', type: 'image' },
      {
        id: 'abstract_waves',
        name: '抽象波浪',
        value: 'wallpapers/abstract_waves.svg',
        type: 'image',
      },
      { id: 'cyberpunk', name: '赛博朋克', value: 'wallpapers/cyberpunk.svg', type: 'image' },
      { id: 'dark_theme', name: '暗夜主题', value: 'wallpapers/dark_theme.svg', type: 'image' },
      { id: 'lowpoly', name: '低多边形', value: 'wallpapers/lowpoly.svg', type: 'image' },
      {
        id: 'geometric_theme',
        name: '几何主题',
        value: 'wallpapers/geometric_theme.svg',
        type: 'image',
      },
      { id: 'space_nebula', name: '太空星云', value: 'wallpapers/space_nebula.svg', type: 'image' },
      {
        id: 'pastel_circles',
        name: '粉彩圆圈',
        value: 'wallpapers/pastel_circles.svg',
        type: 'image',
      },
      { id: 'neon_grid', name: '霓虹网格', value: 'wallpapers/neon_grid.svg', type: 'image' },
    ];
  }

  resetWallpaper() {
    const defaultWallpaper = 'wallpapers/default.svg';
    this.setWallpaper(defaultWallpaper);
    return defaultWallpaper;
  }
}

export const system = new SystemService();
