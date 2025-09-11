import { ref, reactive } from 'vue';
import type {
  AppManifest,
  WindowState,
  SystemState,
  SystemConfig,
  TaskbarItem,
  ThemeDefinition,
  WallpaperSource,
} from '../types/system';
import { storage } from './storage';
import { eventBus, SystemEvents } from '../services/eventBus';
import { defaultSystemConfig, mergeUserConfig } from '../../config/system';
import type { UserConfig } from '../../config/system';
import { userConfig } from '../../config/user-config';

class SystemService {
  private state = reactive<SystemState>({
    apps: [],
    windows: [],
    theme: 'default',
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

  private createWindowState(app: AppManifest): WindowState {
    const id = `${app.id}-${this.nextWindowId++}`;
    return {
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
    this.state.wallpaper = wallpaper;
    await this.saveSettings();
    eventBus.emit(SystemEvents.WallpaperChanged, wallpaper);
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
