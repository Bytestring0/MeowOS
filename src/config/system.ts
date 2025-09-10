import type { SystemConfig, ThemeDefinition, WallpaperSource, WindowAnimationConfig } from '../core/types/system';

// 默认主题定义
export const defaultThemes: ThemeDefinition[] = [
  {
    id: 'light',
    name: '默认主题',
    variables: {
      '--bg-color': '#ffffff',
      '--bg-color-light': '#f5f7fa',
      '--bg-color-darker': '#e4e7ed',
      '--text-color': '#303133',
      '--text-color-light': '#606266',
      '--text-color-lighter': '#909399',
      '--border-color': '#dcdfe6',
      '--border-color-light': '#e4e7ed',
      '--border-color-lighter': '#ebeef5',
      '--window-bg-rgb': '255, 255, 255',
      '--window-bg-alpha': '0.95'
    }
  },
  {
    id: 'dark',
    name: '深色主题',
    variables: {
      '--bg-color': '#1e1e1e',
      '--bg-color-light': '#2d2d2d',
      '--bg-color-darker': '#252525',
      '--text-color': '#ffffff',
      '--text-color-light': '#e0e0e0',
      '--text-color-lighter': '#a0a0a0',
      '--border-color': '#333333',
      '--border-color-light': '#404040',
      '--border-color-lighter': '#4d4d4d',
      '--window-bg-rgb': '30, 30, 30',
      '--window-bg-alpha': '0.95'
    }
  },
  {
    id: 'glass',
    name: '毛玻璃主题',
    variables: {
      '--bg-color': 'rgba(255, 255, 255, 0.85)',
      '--bg-color-light': 'rgba(255, 255, 255, 0.95)',
      '--bg-color-darker': 'rgba(255, 255, 255, 0.75)',
      '--text-color': '#1a1a1a',
      '--text-color-light': '#4a4a4a',
      '--text-color-lighter': '#6a6a6a',
      '--border-color': 'rgba(255, 255, 255, 0.4)',
      '--border-color-light': 'rgba(255, 255, 255, 0.6)',
      '--border-color-lighter': 'rgba(255, 255, 255, 0.8)',
      '--window-backdrop-filter': 'blur(25px) saturate(200%) brightness(1.1)',
      '--window-bg-rgb': '255, 255, 255',
      '--window-bg-alpha': '0.65',
      '--taskbar-backdrop-filter': 'blur(30px) saturate(180%)',
      '--taskbar-bg-alpha': '0.8'
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

// 默认动画配置
export const defaultAnimations: WindowAnimationConfig = {
  open: 'fade-in 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  close: 'fade-out 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  minimize: 'scale-down 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  maximize: 'scale-up 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  restore: 'scale-up 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
};

// 系统默认配置
export const defaultSystemConfig: SystemConfig = {
  defaultTheme: 'light',
  themes: defaultThemes,
  wallpapers: defaultWallpapers,
  windowAnimations: defaultAnimations,
  enableWindowShadow: true,
  enableGlassEffect: true,
  taskbar: {
    height: 48,
    position: 'bottom'
  }
};

// 用户可以覆盖的配置接口
export interface UserConfig {
  defaultTheme?: string;
  themes?: Partial<ThemeDefinition>[];
  wallpapers?: Partial<WallpaperSource>[];
  windowAnimations?: Partial<WindowAnimationConfig>;
  taskbar?: {
    height?: number;
    position?: 'bottom' | 'top' | 'left' | 'right';
    autoHide?: boolean;
    showClock?: boolean;
    showSystemTray?: boolean;
  };
  desktop?: {
    showDesktopIcons?: boolean;
    iconSize?: 'small' | 'medium' | 'large';
    gridSnap?: boolean;
    layout?: 'grid' | 'list' | 'large-icons';
  };
  window?: {
    animationEnabled?: boolean;
    snapToEdge?: boolean;
    transparencyEffects?: boolean;
  };
  enableWindowShadow?: boolean;
  enableGlassEffect?: boolean;
  mouse?: {
    enableUserSelect?: boolean;
    enableContextMenu?: boolean;
    enableDragSelect?: boolean;
  };
}

// 合并用户配置的函数
export function mergeUserConfig(userConfig: UserConfig): SystemConfig {
  const config = { ...defaultSystemConfig };
  
  if (userConfig.themes) {
    config.themes = [...defaultThemes, ...userConfig.themes as ThemeDefinition[]];
  }
  
  if (userConfig.wallpapers) {
    config.wallpapers = [...defaultWallpapers, ...userConfig.wallpapers as WallpaperSource[]];
  }
  
  if (userConfig.windowAnimations) {
    config.windowAnimations = { ...defaultAnimations, ...userConfig.windowAnimations };
  }
  
  if (userConfig.taskbar) {
    config.taskbar = { ...config.taskbar, ...userConfig.taskbar };
  }
  
  if (userConfig.enableWindowShadow !== undefined) {
    config.enableWindowShadow = userConfig.enableWindowShadow;
  }
  
  if (userConfig.enableGlassEffect !== undefined) {
    config.enableGlassEffect = userConfig.enableGlassEffect;
  }
  
  // 应用鼠标设置
  if (userConfig.mouse) {
    const root = document.documentElement;
    if (userConfig.mouse.enableUserSelect !== undefined) {
      root.style.setProperty('--user-select', userConfig.mouse.enableUserSelect ? 'text' : 'none');
    }
    if (userConfig.mouse.enableContextMenu === false) {
      document.addEventListener('contextmenu', e => e.preventDefault());
    }
    if (userConfig.mouse.enableDragSelect === false) {
      document.addEventListener('dragstart', e => e.preventDefault());
    }
  }
  
  return config;
}

// 导出默认配置
export default defaultSystemConfig;
