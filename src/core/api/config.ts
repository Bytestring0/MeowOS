import type { SystemConfig, ThemeDefinition, WallpaperSource, UserConfig } from '../types/system';

// 默认主题定义 - 包含完整的CSS变量
export const defaultThemes: ThemeDefinition[] = [
  {
    id: 'light',
    name: '默认主题',
    variables: {
      '--primary-color': '#4a90e2',
      '--secondary-color': '#42b983',
      '--success-color': '#67c23a',
      '--warning-color': '#e6a23c',
      '--danger-color': '#f56c6c',
      '--info-color': '#909399',
      '--accent-color': '#4a90e2',
      '--accent-color-rgb': '74, 144, 226',
      
      '--bg-color': '#ffffff',
      '--bg-color-light': '#f5f7fa',
      '--bg-color-darker': '#e4e7ed',
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f5f7fa',
      '--bg-tertiary': '#e4e7ed',
      
      '--text-color': '#303133',
      '--text-color-light': '#606266',
      '--text-color-lighter': '#909399',
      '--text-primary': '#303133',
      '--text-secondary': '#606266',
      
      '--border-color': '#dcdfe6',
      '--border-color-light': '#e4e7ed',
      '--border-color-lighter': '#ebeef5',
      
      '--box-shadow': '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
      '--box-shadow-light': '0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)',
      '--box-shadow-dark': '0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .12)',
      
      '--window-header-height': '32px',
      '--window-min-width': '200px',
      '--window-min-height': '120px',
      '--window-bg-rgb': '255, 255, 255',
      '--window-bg-alpha': '0.92',
      '--window-backdrop-filter': 'none',
      
      '--taskbar-bg-rgb': '255, 255, 255',
      '--taskbar-bg-alpha': '0.85',
      '--taskbar-backdrop-filter': 'blur(20px) saturate(150%)',
      
      '--animation-duration': '0.3s',
      '--animation-easing': 'cubic-bezier(0.25, 0.8, 0.25, 1)'
    }
  },
  {
    id: 'dark',
    name: '深色主题',
    variables: {
      '--primary-color': '#4a90e2',
      '--secondary-color': '#42b983',
      '--success-color': '#67c23a',
      '--warning-color': '#e6a23c',
      '--danger-color': '#f56c6c',
      '--info-color': '#909399',
      '--accent-color': '#4a90e2',
      '--accent-color-rgb': '74, 144, 226',
      
      '--bg-color': '#1e1e1e',
      '--bg-color-light': '#2d2d2d',
      '--bg-color-darker': '#252525',
      '--bg-primary': '#1e1e1e',
      '--bg-secondary': '#2d2d2d',
      '--bg-tertiary': '#252525',
      
      '--text-color': '#ffffff',
      '--text-color-light': '#e0e0e0',
      '--text-color-lighter': '#a0a0a0',
      '--text-primary': '#ffffff',
      '--text-secondary': '#e0e0e0',
      
      '--border-color': '#333333',
      '--border-color-light': '#404040',
      '--border-color-lighter': '#4d4d4d',
      
      '--box-shadow': '0 2px 12px 0 rgba(0, 0, 0, 0.3)',
      '--box-shadow-light': '0 2px 4px rgba(0, 0, 0, .3), 0 0 6px rgba(0, 0, 0, .2)',
      '--box-shadow-dark': '0 2px 4px rgba(0, 0, 0, .3), 0 0 6px rgba(0, 0, 0, .3)',
      
      '--window-header-height': '32px',
      '--window-min-width': '200px',
      '--window-min-height': '120px',
      '--window-bg-rgb': '30, 30, 30',
      '--window-bg-alpha': '0.92',
      '--window-backdrop-filter': 'none',
      
      '--taskbar-bg-rgb': '30, 30, 30',
      '--taskbar-bg-alpha': '0.85',
      '--taskbar-backdrop-filter': 'blur(20px) saturate(150%)',
      
      '--animation-duration': '0.3s',
      '--animation-easing': 'cubic-bezier(0.25, 0.8, 0.25, 1)'
    }
  },
  {
    id: 'glass',
    name: '毛玻璃主题',
    variables: {
      '--primary-color': '#4a90e2',
      '--secondary-color': '#42b983',
      '--success-color': '#67c23a',
      '--warning-color': '#e6a23c',
      '--danger-color': '#f56c6c',
      '--info-color': '#909399',
      '--accent-color': '#4a90e2',
      '--accent-color-rgb': '74, 144, 226',
      
      '--bg-color': 'rgba(255, 255, 255, 0.5)',
      '--bg-color-light': 'rgba(255, 255, 255, 0.2)',
      '--bg-color-darker': 'rgba(255, 255, 255, 0.9)',
      '--bg-primary': 'rgba(255, 255, 255, 0.6)',
      '--bg-secondary': 'rgba(255, 255, 255, 0.8)',
      '--bg-tertiary': 'rgba(255, 255, 255, 0.9)',
      
      '--text-color': '#303133',
      '--text-color-light': '#606266',
      '--text-color-lighter': '#909399',
      '--text-primary': '#303133',
      '--text-secondary': '#606266',
      
      '--border-color': 'rgba(255, 255, 255, 0.2)',
      '--border-color-light': 'rgba(255, 255, 255, 0.3)',
      '--border-color-lighter': 'rgba(255, 255, 255, 0.4)',
      
      '--box-shadow': '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
      '--box-shadow-light': '0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)',
      '--box-shadow-dark': '0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .12)',
      
      '--window-header-height': '32px',
      '--window-min-width': '200px',
      '--window-min-height': '120px',
      '--window-bg-rgb': '255, 255, 255',
      '--window-bg-alpha': '0.1',
      '--window-backdrop-filter': 'blur(4px) saturate(400%)',
      
      '--taskbar-bg-rgb': '255, 255, 255',
      '--taskbar-bg-alpha': '0.2',
      '--taskbar-backdrop-filter': 'blur(4px) saturate(200%)',
      
      '--animation-duration': '0.3s',
      '--animation-easing': 'cubic-bezier(0.25, 0.8, 0.25, 1)'
    },
    effects: {
      windowBlur: true,
      translucency: 0.65
    }
  }
];

// 默认壁纸
export const defaultWallpapers: WallpaperSource[] = [
  {
    id: 'default',
    type: 'builtin',
    value: '/wallpapers/dark_theme.svg',
    name: '默认壁纸'
  }
];



// 系统默认配置
export const defaultSystemConfig: SystemConfig = {
  defaultTheme: 'light',
  themes: defaultThemes,
  wallpapers: defaultWallpapers,
  taskbar: {
    height: 48,
    position: 'bottom'
  }
};


// 合并用户配置的函数
export function mergeUserConfig(userConfig: UserConfig): SystemConfig {
  const config = { ...defaultSystemConfig };
  
  if (userConfig.themes) {
    config.themes = [...defaultThemes, ...userConfig.themes as ThemeDefinition[]];
  }
  
  if (userConfig.wallpapers) {
    config.wallpapers = [...defaultWallpapers, ...userConfig.wallpapers as WallpaperSource[]];
  }
  
  return config;
}

// 导出默认配置
export default defaultSystemConfig;
