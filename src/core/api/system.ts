import { ref, reactive } from 'vue';
import type { AppManifest, WindowState, SystemState } from '../types/system';
import { storage } from './storage';

class SystemService {
  private state = reactive<SystemState>({
    apps: [],
    windows: [],
    theme: 'light',
    wallpaper: '/wallpapers/default.jpg',
    settings: {},
  });

  private nextWindowId = 0;
  private nextZIndex = 1000;

  constructor() {
    this.loadApps();
    this.loadSettings();
  }

  private async loadApps() {
    // 加载默认系统应用
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
      this.state.theme = savedSettings.theme || this.state.theme;
      this.state.wallpaper = savedSettings.wallpaper || this.state.wallpaper;
      this.state.settings = savedSettings.settings || this.state.settings;
    }
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
        x: 50 + (this.nextWindowId % 10) * 30,
        y: 50 + (this.nextWindowId % 10) * 30,
      },
      size: {
        width: 800,
        height: 600,
      },
      isMinimized: false,
      isMaximized: false,
      zIndex: this.nextZIndex++,
    };
  }

  // 公共API

  async openApp(appId: string, options?: any): Promise<WindowState | null> {
    const app = this.state.apps.find(a => a.id === appId);
    if (!app) {
      console.error(`App not found: ${appId}`);
      return null;
    }

    // 检查是否已有窗口打开
    const existingWindow = this.state.windows.find(w => w.id.startsWith(appId));
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        existingWindow.isMinimized = false;
      }
      existingWindow.zIndex = this.nextZIndex++;
      return existingWindow;
    }

    // 创建新窗口
    const windowState = this.createWindowState(app);
    if (options) {
      Object.assign(windowState, options);
    }
    this.state.windows.push(windowState);
    return windowState;
  }

  closeApp(appId: string): boolean {
    const index = this.state.windows.findIndex(w => w.id.startsWith(appId));
    if (index !== -1) {
      this.state.windows.splice(index, 1);
      return true;
    }
    return false;
  }

  listApps(): AppManifest[] {
    return this.state.apps;
  }

  getAppInfo(appId: string): AppManifest | null {
    return this.state.apps.find(a => a.id === appId) || null;
  }

  // 主题相关
  async setTheme(theme: string) {
    this.state.theme = theme;
    await this.saveSettings();
  }

  async setWallpaper(wallpaper: string) {
    this.state.wallpaper = wallpaper;
    await this.saveSettings();
  }

  // 窗口管理
  getWindows(): WindowState[] {
    return this.state.windows;
  }

  focusWindow(windowId: string) {
    const window = this.state.windows.find(w => w.id === windowId);
    if (window) {
      window.zIndex = this.nextZIndex++;
    }
  }

  minimizeWindow(windowId: string) {
    const window = this.state.windows.find(w => w.id === windowId);
    if (window) {
      window.isMinimized = true;
    }
  }

  maximizeWindow(windowId: string) {
    const window = this.state.windows.find(w => w.id === windowId);
    if (window) {
      window.isMaximized = !window.isMaximized;
    }
  }
}

export const system = new SystemService();
