export interface AppManifest {
  id: string;
  name: string;
  description?: string;
  version: string;
  icon: string;
  type: 'app' | 'widget' | 'cli' | 'service' | 'system-component';
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
  // 桌面图标位置信息
  desktopPosition?: {
    x: number;
    y: number;
    gridIndex?: number; // 在网格中的索引，用于排序
  };
  // 系统组件配置
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
  isHidden?: boolean; // 最小化后窗口本身隐藏
  previousPosition?: { x: number; y: number; width: number; height: number }; // 最大化前记录
  isPinned?: boolean; // 是否置顶
  componentState?: any; // 保存组件内部状态
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

export interface SystemConfig {
  defaultTheme: string;
  themes: ThemeDefinition[];
  wallpapers: WallpaperSource[];
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
// 用户可以覆盖的配置接口
export interface UserConfig {
  defaultTheme?: string;
  themes?: Partial<ThemeDefinition>[];
  wallpapers?: Partial<WallpaperSource>[];
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

export interface AnimationConfig {
  duration: number 
  easing: string 
  enabled: boolean
  // 添加自定义样式配置
  keyframes?: Keyframe[]
  options?: Partial<KeyframeAnimationOptions>
  description?: string
  // 或者使用函数来动态生成样式
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
  // 组件位置
  position: {
    type: 'desktop' | 'taskbar' | 'overlay';
    // 对于 desktop 类型
    x?: number;
    y?: number;
    anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    // 对于 taskbar 类型
    placement?: 'left' | 'right' | 'center';
    order?: number; // 在taskbar中的顺序
  };
  // 显示设置
  display: {
    zIndex?: number;
    always?: boolean; // 是否总是显示
    draggable?: boolean; // 是否可拖拽
    resizable?: boolean; // 是否可调整大小
    opacity?: number; // 透明度
  };
  // 组件大小
  size?: {
    width?: number | string;
    height?: number | string;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
  // 行为设置
  behavior?: {
    clickThrough?: boolean; // 点击穿透
    hideOnBlur?: boolean; // 失去焦点时隐藏
    autoHide?: boolean; // 自动隐藏
    showOnHover?: boolean; // 悬停显示
  };
}

export interface SystemComponentState {
  id: string;
  manifest: AppManifest;
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isDragging?: boolean;
  isResizing?: boolean;
}