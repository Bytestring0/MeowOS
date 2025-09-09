import { ref, reactive } from 'vue';
import type { AppManifest, WindowState, SystemState, SystemConfig, TaskbarItem, ThemeDefinition, WallpaperSource } from '../types/system';
import { storage } from './storage';
import { eventBus, SystemEvents } from '../services/eventBus';
import { defaultSystemConfig, mergeUserConfig } from '../../config/system';
import type { UserConfig } from '../../config/system';
import { defaultIcons } from '../services/defaultIcons';

class SystemService {
  private state = reactive<SystemState>({
    apps: [],
    windows: [],
    theme: '', // 不设置默认值，等待从存储加载
    wallpaper: '', // 不设置默认值，等待从存储加载
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
    await this.loadSettings();
    this.loadApps();
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
    // 内置终端作为系统应用
    if (!this.state.apps.find(a => a.id === 'system-terminal')) {
      this.state.apps.push({
        id: 'system-terminal',
        name: '终端',
        description: '系统命令行',
        version: '1.0.0',
        icon: 'icons/terminal.svg',
        type: 'app',
        entry: 'TerminalApp',
        hiddenFromDesktop: false,
        singleInstance: true,
      });
    }
  }

  private getDefaultSystemApps(): AppManifest[] {
    // 扫描 system-apps 下所有 manifest.json
    const modules = import.meta.glob('../../system-apps/*/manifest.json', { eager: true });

    const apps: AppManifest[] = [];
    for (const path in modules) {
      const mod: any = modules[path];
      const manifest: AppManifest = mod.default || mod;

      // 确保应用有默认图标
      if (!manifest.icon || manifest.icon.trim() === '' || manifest.icon.startsWith('/icons/')) {
        // 如果没有图标或者是不存在的图标文件，使用默认图标
        manifest.icon = defaultIcons.getDefaultIcon(manifest);
      }

      apps.push(manifest);
    }

    return apps;
  }
  private async loadSettings() {
    const savedSettings = await storage.getSystemSetting('systemSettings');
    if (savedSettings) {
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
  listApps(): AppManifest[] { return this.state.apps; }
  getWindows(): WindowState[] { return this.state.windows; }
  get config() { return this.state.config; }
  get theme() { return this.state.theme; }
  get wallpaper() { return this.state.wallpaper; }

  async openApp(appId: string, options?: Partial<WindowState>): Promise<WindowState | null> {
    const app = this.state.apps.find(a => a.id === appId);
    if (!app) { console.error(`App not found: ${appId}`); return null; }
    if (app.singleInstance) {
      const existing = this.state.windows.find(w => w.id.startsWith(appId));
      if (existing) {
        existing.isMinimized = false; existing.isHidden = false; existing.zIndex = this.nextZIndex++; return existing;
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
    if (index !== -1) { const removed = this.state.windows.splice(index, 1)[0]; eventBus.emit(SystemEvents.WindowClosed, removed); return true; }
    return false;
  }

  focusWindow(windowId: string) {
    const w = this.state.windows.find(w => w.id === windowId); if (w) { w.zIndex = this.nextZIndex++; w.isMinimized = false; w.isHidden = false; eventBus.emit(SystemEvents.WindowFocused, w); }
  }
  minimizeWindow(windowId: string) {
    const w = this.state.windows.find(w => w.id === windowId); if (w) { w.isMinimized = true; w.isHidden = true; eventBus.emit(SystemEvents.WindowMinimized, w); }
  }
  maximizeWindow(windowId: string) {
    const w = this.state.windows.find(w => w.id === windowId);
    if (w) {
      // 不在这里切换状态，状态已经在Window.ts中处理了
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
    
    if (theme) {
      // 重置所有主题相关的属性
      root.removeAttribute('data-theme');
      
      // 应用主题变量
      Object.entries(theme.variables || {}).forEach(([key, value]) => {
        if (key.startsWith('--')) {
          root.style.setProperty(key, value);
        } else if (key === 'data-theme') {
          root.setAttribute('data-theme', value);
        }
      });
      
      // 应用主题效果
      this.state.themeEffects = theme.effects;
      
      // 触发主题变更事件
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
      isMinimized: !!w.isMinimized,
    }));
  }

  toggleMinimize(windowId: string) {
    const w = this.state.windows.find(w => w.id === windowId); if (!w) return; if (w.isMinimized) { this.focusWindow(windowId); } else { this.minimizeWindow(windowId); }
  }
}

export const system = new SystemService();
