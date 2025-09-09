export interface AppManifest {
  id: string;
  name: string;
  description?: string;
  version: string;
  icon: string;
  type: 'app' | 'widget' | 'cli' | 'service';
  entry: string;
  replace?: string;
  commands?: {
    [key: string]: {
      description: string;
      alias?: string[];
    };
  };
  settings?: {
    [key: string]: any;
  };
  hiddenFromDesktop?: boolean; // 例如终端不在桌面显示
  singleInstance?: boolean; // 强制单实例
  showOnDesktop?: boolean; // 是否在桌面显示图标
  isSystemComponent?: boolean; // 是否是系统组件
  autoStart?: boolean; // 是否自动启动
  visible?: boolean; // 是否可见（用于服务类应用）
  permissions?: string[]; // 权限列表
  category?: string; // 应用分类
  singleton?: boolean; // 是否单例
}

export interface WindowState {
  id: string;
  title: string;
  icon: string;
  component: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  isHidden?: boolean; // 最小化后窗口本身隐藏
  previousPosition?: { x: number; y: number; width: number; height: number }; // 最大化前记录
}

export interface SystemState {
  apps: AppManifest[];
  windows: WindowState[];
  theme: string;
  wallpaper: string;
  settings: {
    [key: string]: any;
  };
  config: SystemConfig;
  themeEffects?: ThemeDefinition['effects'];
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  variables: Record<string, string>; // CSS 变量覆写
  effects?: {
    windowBlur?: boolean; // 毛玻璃
    translucency?: number; // 0-1 透明度
  };
}

export interface WallpaperSource {
  id: string;
  type: 'builtin' | 'color' | 'gradient' | 'url' | 'file';
  value: string; // 路径、颜色、渐变、URL
  thumb?: string;
  name?: string;
}

export interface WindowAnimationConfig {
  open: string;
  close: string;
  minimize: string;
  maximize: string;
  restore: string;
}

export interface SystemConfig {
  defaultTheme: string;
  themes: ThemeDefinition[];
  wallpapers: WallpaperSource[];
  windowAnimations: WindowAnimationConfig;
  enableWindowShadow: boolean;
  enableGlassEffect: boolean;
  taskbar: {
    height: number;
    position: 'bottom' | 'top' | 'left' | 'right';
  };
}

export interface TaskbarItem {
  windowId: string;
  appId: string;
  title: string;
  icon: string;
  isActive: boolean;
  isMinimized: boolean;
}
