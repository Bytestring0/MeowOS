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

    // 如果没有监听器了，删除这个事件
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  // 发布事件
  emit(event: string, ...payload: any[]): void {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        console.log(`Emitting event: ${event} with payload:`, payload);
        callback(...payload);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  // 只监听一次
  once(event: string, callback: EventCallback): void {
    const onceCallback = (payload?: any) => {
      callback(payload);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  // 清除某个事件的所有监听器
  clear(event: string): void {
    delete this.events[event];
  }

  // 清除所有事件监听器
  clearAll(): void {
    this.events = {};
  }

  // 获取某个事件的监听器数量
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
  WindowOpened = 'windowOpened',
  WindowClosed = 'windowClosed',
  WindowFocused = 'windowFocused',
  WindowMinimized = 'windowMinimized',
  WindowMaximized = 'windowMaximized',
  // 桌面图标相关事件
  IconDragStart = 'iconDragStart',
  IconDragEnd = 'iconDragEnd',
  IconPositionChanged = 'iconPositionChanged',
  IconOrderChanged = 'iconOrderChanged',
  DesktopLayoutSaved = 'desktopLayoutSaved',
  DesktopLayoutLoaded = 'desktopLayoutLoaded',
}
export const UserEvents: { [key: string]: string } = {};