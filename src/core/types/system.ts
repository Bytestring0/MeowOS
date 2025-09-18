export interface AppManifest {
  id: string;
  name: string;
  description?: string;
  version: string;
  icon: string;
  type: 'app' |'system-component';
  entry: string;
  settings?: {
    [key: string]: any;
  };
  singleInstance?: boolean; 
  showOnDesktop?: boolean; 
  isSystemComponent?: boolean; 
  autoStart?: boolean; 
  visible?: boolean; 
  category?: string; 
  singleton?: boolean; 
  desktopPosition?: {
    x: number;
    y: number;
    gridIndex?: number;
  };
  systemComponent?: SystemComponentConfig;
}

export interface WindowState {
  app: AppManifest;
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
  isHidden?: boolean; 
  previousPosition?: { x: number; y: number; width: number; height: number }; 
  isPinned?: boolean; 
  componentState?: any; 
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

export interface SystemConfig {
  defaultTheme: string;
  themes: ThemeDefinition[];
  wallpapers: WallpaperSource[];
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
// 用户可以覆盖的配置接口
export interface UserConfig {
  defaultTheme?: string;
  themes?: Partial<ThemeDefinition>[];
  wallpapers?: Partial<WallpaperSource>[];
}

export interface AnimationConfig {
  duration: number 
  easing: string 
  enabled: boolean
  keyframes?: Keyframe[]
  options?: Partial<KeyframeAnimationOptions>
  description?: string
  customAnimation?: (element: HTMLElement, ...args: any[]) => Animation
}

export interface AnimationPreset {
  id: string
  name: string
  description: string
  // 支持不定长的动画配置
  [animationType: string]: string | AnimationConfig
}

export interface SystemComponentConfig {
  position: {
    type: 'desktop' | 'taskbar' | 'overlay';
    x?: number;
    y?: number;
    anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    placement?: 'left' | 'right' | 'center';
    order?: number; // 在taskbar中的顺序
  };
  display: {
    zIndex?: number;
    always?: boolean;
    draggable?: boolean;
    resizable?: boolean;
    opacity?: number; 
  };
  size?: {
    width?: number | string;
    height?: number | string;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
}

export interface SystemComponentState {
  id: string;
  manifest: AppManifest;
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}