export interface AppManifest {
  id: string;
  name: string;
  description?: string;
  version: string;
  icon: string;
  type: 'app' | 'widget' | 'cli' | 'service';
  entry: string;
  replace?: string;
  settings?: {
    [key: string]: any;
  };
  singleInstance?: boolean; 
  showOnDesktop?: boolean; 
  isSystemComponent?: boolean; 
  autoStart?: boolean; 
  visible?: boolean; 
  permissions?: string[]; 
  category?: string; 
  singleton?: boolean; 
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


export interface ThemeDefinition {
  id: string;
  name: string;
  variables: Record<string, string>; 
  effects?: {
    windowBlur?: boolean; 
    translucency?: number; 
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
