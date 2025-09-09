import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

// 定义数据库结构
interface MeowOSDB extends DBSchema {
  appData: {
    key: string;
    value: any;
  };
  systemSettings: {
    key: string;
    value: any;
  };
}

class StorageService {
  private db: IDBPDatabase<MeowOSDB> | null = null;
  private readonly DB_NAME = 'meowos_db';
  private readonly DB_VERSION = 1;

  constructor() {
    this.initDB();
  }

  private async initDB() {
    try {
      this.db = await openDB<MeowOSDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('appData')) {
            db.createObjectStore('appData');
          }
          if (!db.objectStoreNames.contains('systemSettings')) {
            db.createObjectStore('systemSettings');
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  // localStorage操作封装
  private ls = {
    get: (key: string): any => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch {
        return null;
      }
    },
    set: (key: string, value: any): void => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('localStorage.set error:', error);
      }
    },
    remove: (key: string): void => {
      localStorage.removeItem(key);
    },
    clear: (): void => {
      localStorage.clear();
    },
  };

  // IndexedDB操作封装
  private async idb(storeName: 'appData' | 'systemSettings') {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('IndexedDB is not available');
    }
    return {
      get: async (key: string): Promise<any> => {
        return await this.db!.get(storeName, key);
      },
      set: async (key: string, value: any): Promise<void> => {
        await this.db!.put(storeName, value, key);
      },
      remove: async (key: string): Promise<void> => {
        await this.db!.delete(storeName, key);
      },
      clear: async (): Promise<void> => {
        await this.db!.clear(storeName);
      },
    };
  }

  // 公共API - 默认使用IndexedDB确保数据持久化
  async get(key: string, useIDB = true): Promise<any> {
    if (useIDB) {
      const idb = await this.idb('appData');
      return await idb.get(key);
    }
    return this.ls.get(key);
  }

  async set(key: string, value: any, useIDB = true): Promise<void> {
    if (useIDB) {
      const idb = await this.idb('appData');
      await idb.set(key, value);
    } else {
      this.ls.set(key, value);
    }
  }

  async remove(key: string, useIDB = true): Promise<void> {
    if (useIDB) {
      const idb = await this.idb('appData');
      await idb.remove(key);
    } else {
      this.ls.remove(key);
    }
  }

  async clear(useIDB = true): Promise<void> {
    if (useIDB) {
      const idb = await this.idb('appData');
      await idb.clear();
    } else {
      this.ls.clear();
    }
  }

  // 系统设置专用方法
  async getSystemSetting(key: string): Promise<any> {
    const idb = await this.idb('systemSettings');
    return await idb.get(key);
  }

  async setSystemSetting(key: string, value: any): Promise<void> {
    const idb = await this.idb('systemSettings');
    await idb.set(key, value);
  }

  // 应用设置专用方法
  async getAppSetting(appId: string, key: string): Promise<any> {
    const idb = await this.idb('appData');
    return await idb.get(`${appId}:${key}`);
  }

  async setAppSetting(appId: string, key: string, value: any): Promise<void> {
    const idb = await this.idb('appData');
    await idb.set(`${appId}:${key}`, value);
  }

  async removeAppSetting(appId: string, key: string): Promise<void> {
    const idb = await this.idb('appData');
    await idb.remove(`${appId}:${key}`);
  }

  async clearAppData(appId: string): Promise<void> {
    if (!this.db) return;
    
    const tx = this.db.transaction(['appData'], 'readwrite');
    const store = tx.objectStore('appData');
    const keys = await store.getAllKeys();
    
    for (const key of keys) {
      if (typeof key === 'string' && key.startsWith(`${appId}:`)) {
        await store.delete(key);
      }
    }
    await tx.done;
  }

  // 深度合并对象
  private deepMerge(target: any, source: any): any {
    if (source === null || source === undefined) return target;
    if (target === null || target === undefined) return source;
    
    if (typeof target !== 'object' || typeof source !== 'object') {
      return source;
    }
    
    if (Array.isArray(source)) {
      return source;
    }
    
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  // 安全的合并设置
  async mergeData(key: string, newData: any, useIDB = true): Promise<void> {
    const existingData = await this.get(key, useIDB);
    const mergedData = this.deepMerge(existingData || {}, newData);
    await this.set(key, mergedData, useIDB);
  }

  // 安全的应用设置合并
  async mergeAppSettings(appId: string, newSettings: any): Promise<void> {
    const existingSettings = await this.getAppSetting(appId, 'settings') || {};
    const mergedSettings = this.deepMerge(existingSettings, newSettings);
    await this.setAppSetting(appId, 'settings', mergedSettings);
  }
}

export const storage = new StorageService();
