import type { AppManifest } from '../types/system';
import { system } from '../api/system';
import { eventBus } from './eventBus';

export class PluginLoader {
  private loadedApps = new Map<string, AppManifest>();
  private readonly SYSTEM_APPS_PATH = '/system-apps';
  private readonly USER_APPS_PATH = '/user-apps';

  constructor() {
    this.watchUserAppsChanges();
  }

  // 加载所有应用
  async loadAllApps(): Promise<AppManifest[]> {
    const [systemApps, userApps] = await Promise.all([
      this.loadSystemApps(),
      this.loadUserApps()
    ]);

    // 用户应用可以覆盖系统应用
    const allApps = [...systemApps];
    for (const userApp of userApps) {
      const index = allApps.findIndex(app => 
        app.id === userApp.id || app.id === userApp.replace
      );
      if (index !== -1) {
        allApps[index] = userApp;
      } else {
        allApps.push(userApp);
      }
    }

    // 注册到系统
    this.registerApps(allApps);
    return allApps;
  }

  // 加载单个应用
  async loadApp(appPath: string): Promise<AppManifest | null> {
    try {
      const manifest = await this.loadManifest(appPath);
      if (!manifest) return null;

      // 检查是否需要卸载被覆盖的应用
      if (manifest.replace) {
        await this.unloadApp(manifest.replace);
      }

      // 注册到系统
      this.registerApp(manifest);
      return manifest;
    } catch (error) {
      console.error(`Failed to load app from ${appPath}:`, error);
      return null;
    }
  }

  // 卸载应用
  async unloadApp(appId: string): Promise<boolean> {
    const app = this.loadedApps.get(appId);
    if (!app) return false;

    // 关闭所有相关窗口
    system.closeApp(appId);

    // 从注册表中移除
    this.loadedApps.delete(appId);
    
    // 触发事件
    eventBus.emit('appUnloaded', { appId });
    return true;
  }

  private async loadSystemApps(): Promise<AppManifest[]> {
    const defaultSystemApps: AppManifest[] = [
      {
        id: 'system-notes',
        name: '记事本',
        description: '简单的笔记应用',
        version: '1.0.0',
        icon: '/icons/notes.svg',
        type: 'app',
        entry: 'NotesApp.vue',
        commands: {
          notes: {
            description: '打开记事本',
            alias: ['note', 'notepad']
          }
        }
      }
    ];
    
    return defaultSystemApps;
  }

  private async loadUserApps(): Promise<AppManifest[]> {
    // 用户应用是可选的，如果不存在就返回空数组
    return [];
  }

  private async loadManifest(appPath: string): Promise<AppManifest | null> {
    try {
      const manifest = await import(`${appPath}/manifest.json`);
      return manifest.default;
    } catch {
      return null;
    }
  }

  private registerApps(apps: AppManifest[]) {
    apps.forEach(app => this.registerApp(app));
  }

  private registerApp(app: AppManifest) {
    // 添加到加载记录
    this.loadedApps.set(app.id, app);

    // 触发事件
    eventBus.emit('appLoaded', { app });
  }

  private watchUserAppsChanges() {
    // 在实际环境中，这里可以使用 WebSocket 或轮询来监听用户应用目录的变化
    // 为了演示，这里使用一个简单的定时器
    setInterval(async () => {
      const userApps = await this.loadUserApps();
      const currentAppIds = Array.from(this.loadedApps.keys());
      
      // 检查新增的应用
      for (const app of userApps) {
        if (!this.loadedApps.has(app.id)) {
          await this.loadApp(`${this.USER_APPS_PATH}/${app.id}`);
        }
      }

      // 检查移除的应用
      for (const appId of currentAppIds) {
        const stillExists = userApps.some(app => app.id === appId);
        if (!stillExists) {
          await this.unloadApp(appId);
        }
      }
    }, 5000); // 每5秒检查一次
  }
}

export const pluginLoader = new PluginLoader();
