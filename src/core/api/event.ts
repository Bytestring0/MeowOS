type EventCallback = (...payload: any[]) => void;

interface EventMap {
  [key: string]: EventCallback[];
}

class EventBus {
  private events: EventMap = {};

  // 订阅事件
  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // 取消订阅
  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;
    
    const index = this.events[event].indexOf(callback);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }

    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  // 发布事件
  emit(event: string, ...payload: any[]): void {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        callback(...payload);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  once(event: string, callback: EventCallback): void {
    const onceCallback = (payload?: any) => {
      callback(payload);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  clear(event: string): void {
    delete this.events[event];
  }

  clearAll(): void {
    this.events = {};
  }

  listenerCount(event: string): number {
    return this.events[event]?.length || 0;
  }
}

export const eventBus = new EventBus();

// 定义系统事件类型
export enum SystemEvents {
  WallpaperChanged = 'wallpaperChanged',
  ThemeChanged = 'themeChanged',
  AppLoaded = 'appLoaded',
  AppUnloaded = 'appUnloaded',
  AppAdded = 'appAdded',
  AppRemoved = 'appRemoved',
  WindowOpened = 'windowOpened',
  WindowClosed = 'windowClosed',
  WindowFocused = 'windowFocused',
  WindowMinimized = 'windowMinimized',
  WindowMaximized = 'windowMaximized',
  WindowRestored = 'windowRestored', 
  IconDragStart = 'iconDragStart',
  IconDragEnd = 'iconDragEnd',
  IconPositionChanged = 'iconPositionChanged',
  IconOrderChanged = 'iconOrderChanged',
  DesktopLayoutSaved = 'desktopLayoutSaved',
  DesktopLayoutLoaded = 'desktopLayoutLoaded',
  SystemComponentStarted = 'systemComponentStarted',
  SystemComponentStopped = 'systemComponentStopped',
  SystemComponentMoved = 'systemComponentMoved',
}
export const UserEvents: { [key: string]: string } = {};