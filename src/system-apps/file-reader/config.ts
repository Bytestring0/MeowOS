// 文件阅读器配置接口
export interface FileReaderConfig {
  // 目录封面图
  folderCover: string;
  // Markdown文件封面图
  markdownCover: string;
}

// 默认配置
const defaultConfig: FileReaderConfig = {
  folderCover: 'https://t.alcy.cc/fj',
  markdownCover: 'https://t.alcy.cc/moez',
};

// 配置管理类
class FileReaderConfigManager {
  private config: FileReaderConfig;
  private readonly storageKey = 'fileReader_config';

  constructor() {
    this.config = this.loadConfig();
  }

  // 从本地存储加载配置
  private loadConfig(): FileReaderConfig {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        // 合并默认配置和存储的配置
        return {
          ...defaultConfig,
          ...parsedConfig,
        };
      }
    } catch (error) {
      console.warn('Failed to load file reader config:', error);
    }
    return { ...defaultConfig };
  }

  // 保存配置到本地存储
  private saveConfig(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save file reader config:', error);
    }
  }

  // 获取完整配置
  getConfig(): FileReaderConfig {
    return { ...this.config };
  }

  // 获取文件夹封面图
  getFolderCover(): string {
    return this.config.folderCover;
  }

  // 获取Markdown封面图
  getMarkdownCover(): string {
    return this.config.markdownCover;
  }

  // 设置文件夹封面图
  setFolderCover(coverUrl: string): void {
    this.config.folderCover = coverUrl;
    this.saveConfig();
  }

  // 设置Markdown封面图
  setMarkdownCover(coverUrl: string): void {
    this.config.markdownCover = coverUrl;
    this.saveConfig();
  }

  // 重置配置为默认值
  resetConfig(): void {
    this.config = { ...defaultConfig };
    this.saveConfig();
  }

  // 导出配置（用于备份）
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  // 导入配置（用于恢复）
  importConfig(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson);
      // 验证配置结构
      if (this.validateConfig(importedConfig)) {
        this.config = {
          ...defaultConfig,
          ...importedConfig,
        };
        this.saveConfig();
        return true;
      }
    } catch (error) {
      console.error('Failed to import config:', error);
    }
    return false;
  }

  // 验证配置结构
  private validateConfig(config: any): boolean {
    return (
      config &&
      typeof config === 'object' &&
      (config.folderCover === undefined || typeof config.folderCover === 'string') &&
      (config.markdownCover === undefined || typeof config.markdownCover === 'string')
    );
  }
}

// 创建配置管理器实例
export const fileReaderConfig = new FileReaderConfigManager();