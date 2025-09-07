export interface AppManifest {
  id: string;
  name: string;
  description?: string;
  version: string;
  icon: string;
  type: 'app' | 'widget' | 'cli';
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
}

export interface SystemState {
  apps: AppManifest[];
  windows: WindowState[];
  theme: string;
  wallpaper: string;
  settings: {
    [key: string]: any;
  };
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}
