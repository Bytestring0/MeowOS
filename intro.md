# MeowOS API 指南

MeowOS 是一个基于 Vue 3 的桌面操作系统模拟器，提供了完整的系统API、存储API、文件系统API、右键菜单API、动画服务和事件系统。本文档详细介绍所有可用的API接口和使用方法。

## 目录

1. [系统API (System API)](#系统api-system-api)
2. [存储API (Storage API)](#存储api-storage-api)
3. [文件系统API (FileSystem API)](#文件系统api-filesystem-api)
4. [右键菜单API (Context Menu API)](#右键菜单api-context-menu-api)
5. [动画服务 (Animation Service)](#动画服务-animation-service)
6. [事件系统 (Event Bus)](#事件系统-event-bus)
7. [彩蛋系统 (Easter Eggs)](#彩蛋系统-easter-eggs)
8. [默认图标服务](#默认图标服务-default-icons)
9. [类型定义](#类型定义)

---

## 系统API (System API)

系统API是MeowOS的核心，负责管理应用程序、窗口、主题、壁纸和系统配置。

### 导入方式
```typescript
import { system } from '@/core/api/system';
```

### 核心方法

#### 应用管理

##### `listApps(): AppManifest[]`
获取所有已注册的应用程序列表。

```typescript
const apps = system.listApps();
console.log(apps); // [{ id: 'notes', name: '记事本', ... }, ...]
```

##### `openApp(appId: string, options?: Partial<WindowState>): Promise<WindowState | null>`
打开指定的应用程序。

```typescript
// 打开记事本
const window = await system.openApp('system-notes');

// 打开应用并指定窗口位置和大小
const window = await system.openApp('system-calculator', {
  position: { x: 100, y: 100 },
  size: { width: 400, height: 300 }
});
```

##### `closeApp(appId: string): boolean`
关闭指定的应用程序。

```typescript
const closed = system.closeApp('system-notes');
```

#### 窗口管理

##### `getWindows(): WindowState[]`
获取所有打开的窗口列表。

```typescript
const windows = system.getWindows();
```

##### `focusWindow(windowId: string): void`
聚焦指定窗口。

```typescript
system.focusWindow('system-notes-1');
```

##### `minimizeWindow(windowId: string): void`
最小化指定窗口。

```typescript
system.minimizeWindow('system-notes-1');
```

##### `maximizeWindow(windowId: string): void`
最大化指定窗口。

```typescript
system.maximizeWindow('system-notes-1');
```

##### `toggleMinimize(windowId: string): void`
切换窗口的最小化状态。

```typescript
system.toggleMinimize('system-notes-1');
```

#### 主题管理

##### `get theme(): string`
获取当前主题ID。

```typescript
const currentTheme = system.theme; // 'light', 'dark', 'glass'
```

##### `get themes(): ThemeDefinition[]`
获取所有可用主题。

```typescript
const themes = system.themes;
themes.forEach(theme => {
  console.log(`${theme.id}: ${theme.name}`);
});
```

##### `setTheme(themeId: string): Promise<void>`
设置系统主题。

```typescript
await system.setTheme('dark');
```

##### `applyTheme(themeId: string): void`
立即应用主题样式。

```typescript
system.applyTheme('glass');
```

#### 壁纸管理

##### `get wallpaper(): string`
获取当前壁纸。

```typescript
const currentWallpaper = system.wallpaper;
```

##### `setWallpaper(wallpaper: string): Promise<void>`
设置系统壁纸。

```typescript
// 设置图片壁纸
await system.setWallpaper('/wallpapers/nature.jpg');

// 设置纯色壁纸
await system.setWallpaper('#4a90e2');

// 设置渐变壁纸
await system.setWallpaper('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
```

##### `getBuiltinWallpapers(): Promise<WallpaperSource[]>`
获取所有内置壁纸。

```typescript
const wallpapers = await system.getBuiltinWallpapers();
wallpapers.forEach(wp => {
  console.log(`${wp.name}: ${wp.value}`);
});
```

##### `resetWallpaper(): string`
重置壁纸为默认。

```typescript
const defaultWallpaper = system.resetWallpaper();
```

#### 任务栏管理

##### `getTaskbarItems(): TaskbarItem[]`
获取任务栏项目。

```typescript
const taskbarItems = system.getTaskbarItems();
```

#### 配置管理

##### `get config(): SystemConfig`
获取系统配置。

```typescript
const config = system.config;
console.log(config.taskbar.height); // 48
```

##### `setUserConfig(config: UserConfig): void`
设置用户配置。

```typescript
system.setUserConfig({
  defaultTheme: 'dark',
  taskbar: {
    height: 56,
    position: 'top'
  },
  enableGlassEffect: true
});
```

##### `getUserConfig(): UserConfig`
获取用户配置。

```typescript
const userConfig = system.getUserConfig();
```

---

## 存储API (Storage API)

存储API提供了持久化数据存储功能，支持LocalStorage和IndexedDB两种存储方式。

### 导入方式
```typescript
import { storage } from '@/core/api/storage';
```

### 基础存储方法

##### `get(key: string, useIDB = true): Promise<any>`
获取存储的数据。

```typescript
// 使用 IndexedDB（推荐）
const data = await storage.get('my-data');

// 使用 localStorage
const data = await storage.get('my-data', false);
```

##### `set(key: string, value: any, useIDB = true): Promise<void>`
存储数据。

```typescript
// 存储对象
await storage.set('user-settings', {
  theme: 'dark',
  language: 'zh-CN'
});

// 存储到 localStorage
await storage.set('temp-data', 'some value', false);
```

##### `remove(key: string, useIDB = true): Promise<void>`
删除存储的数据。

```typescript
await storage.remove('my-data');
```

##### `clear(useIDB = true): Promise<void>`
清空所有存储数据。

```typescript
await storage.clear(); // 清空 IndexedDB
await storage.clear(false); // 清空 localStorage
```

### 系统设置专用方法

##### `getSystemSetting(key: string): Promise<any>`
获取系统设置。

```typescript
const systemSettings = await storage.getSystemSetting('systemSettings');
```

##### `setSystemSetting(key: string, value: any): Promise<void>`
设置系统设置。

```typescript
await storage.setSystemSetting('systemSettings', {
  theme: 'dark',
  wallpaper: '/wallpapers/space.jpg'
});
```

### 应用设置专用方法

##### `getAppSetting(appId: string, key: string): Promise<any>`
获取应用设置。

```typescript
const notesContent = await storage.getAppSetting('system-notes', 'content');
```

##### `setAppSetting(appId: string, key: string, value: any): Promise<void>`
设置应用设置。

```typescript
await storage.setAppSetting('system-notes', 'content', 'Hello World!');
```

##### `removeAppSetting(appId: string, key: string): Promise<void>`
删除应用设置。

```typescript
await storage.removeAppSetting('system-notes', 'content');
```

##### `clearAppData(appId: string): Promise<void>`
清空指定应用的所有数据。

```typescript
await storage.clearAppData('system-notes');
```

### 高级存储方法

##### `mergeData(key: string, newData: any, useIDB = true): Promise<void>`
合并存储数据。

```typescript
// 原数据: { theme: 'light', lang: 'en' }
await storage.mergeData('settings', { theme: 'dark' });
// 结果: { theme: 'dark', lang: 'en' }
```

##### `mergeAppSettings(appId: string, newSettings: any): Promise<void>`
合并应用设置。

```typescript
await storage.mergeAppSettings('my-app', {
  fontSize: 14,
  wordWrap: true
});
```

---

## 文件系统API (FileSystem API)

文件系统API提供了虚拟文件系统功能，支持文件和目录的增删改查操作。

### 导入方式
```typescript
import { fileSystem } from '@/core/api/filesystem';
```

### 文件节点接口
```typescript
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  parentId?: string;
  size?: number;
  mimeType?: string;
  content?: string | Uint8Array;
  createdAt: Date;
  modifiedAt: Date;
  permissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
  metadata?: Record<string, any>;
}
```

### 基础文件操作

##### `getRoot(): Promise<FileNode>`
获取根目录节点。

```typescript
const root = await fileSystem.getRoot();
console.log(root.path); // '/'
```

##### `getNodeByPath(path: string): Promise<FileNode | null>`
根据路径获取文件节点。

```typescript
const node = await fileSystem.getNodeByPath('/Documents/readme.txt');
```

##### `getNodeById(id: string): Promise<FileNode | null>`
根据ID获取文件节点。

```typescript
const node = await fileSystem.getNodeById('fs_123456789_abc123');
```

##### `getChildren(parentId: string): Promise<FileNode[]>`
获取目录的子节点。

```typescript
const children = await fileSystem.getChildren('root');
children.forEach(child => {
  console.log(`${child.type}: ${child.name}`);
});
```

### 文件和目录创建

##### `createDirectory(name: string, parentId: string): Promise<FileNode>`
创建目录。

```typescript
const newDir = await fileSystem.createDirectory('MyFolder', 'root');
console.log(newDir.path); // '/MyFolder'
```

##### `createFile(name: string, parentId: string, content?: string | Uint8Array, mimeType?: string): Promise<FileNode>`
创建文件。

```typescript
// 创建文本文件
const textFile = await fileSystem.createFile(
  'hello.txt',
  'root',
  'Hello, World!',
  'text/plain'
);

// 创建空文件
const emptyFile = await fileSystem.createFile('empty.txt', 'root');
```

### 文件读写操作

##### `readFile(id: string): Promise<string | Uint8Array | null>`
读取文件内容。

```typescript
const content = await fileSystem.readFile(fileId);
console.log(content); // 'Hello, World!'
```

##### `writeFile(id: string, content: string | Uint8Array): Promise<void>`
写入文件内容。

```typescript
await fileSystem.writeFile(fileId, 'New content here!');
```

### 文件和目录操作

##### `deleteNode(id: string): Promise<void>`
删除文件或目录。

```typescript
await fileSystem.deleteNode(fileId);
```

##### `renameNode(id: string, newName: string): Promise<void>`
重命名文件或目录。

```typescript
await fileSystem.renameNode(fileId, 'new-name.txt');
```

##### `moveNode(id: string, newParentId: string): Promise<void>`
移动文件或目录。

```typescript
await fileSystem.moveNode(fileId, newParentId);
```

### 文件系统统计和搜索

##### `getStats(): Promise<FileSystemStats>`
获取文件系统统计信息。

```typescript
const stats = await fileSystem.getStats();
console.log(`总文件数: ${stats.totalFiles}`);
console.log(`总目录数: ${stats.totalDirectories}`);
console.log(`已用空间: ${stats.usedSize} bytes`);
```

##### `search(query: string, parentId?: string): Promise<FileNode[]>`
搜索文件。

```typescript
// 全局搜索
const results = await fileSystem.search('readme');

// 在指定目录搜索
const results = await fileSystem.search('config', documentsId);
```

---

## 右键菜单API (Context Menu API)

右键菜单API提供了创建和管理上下文菜单的功能。

### 导入方式
```typescript
import { 
  contextMenuAPI, 
  showContextMenu, 
  hideContextMenu, 
  addContextMenu 
} from '@/core/api/contextmenu';
```

### 菜单项接口
```typescript
interface ContextMenuItem {
  label?: string;
  icon?: string;
  action?: () => void;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: string;
  submenu?: ContextMenuItem[];
  type?: 'separator';
}

interface ContextMenuOptions {
  x: number;
  y: number;
  items: ContextMenuItem[];
  title?: string;
  target?: HTMLElement;
}
```

### 基础方法

##### `showContextMenu(options: ContextMenuOptions): void`
显示右键菜单。

```typescript
showContextMenu({
  x: event.clientX,
  y: event.clientY,
  items: [
    {
      label: '打开',
      icon: '📂',
      action: () => console.log('打开文件')
    },
    { type: 'separator' },
    {
      label: '删除',
      icon: '🗑️',
      danger: true,
      action: () => console.log('删除文件')
    }
  ]
});
```

##### `hideContextMenu(): void`
隐藏右键菜单。

```typescript
hideContextMenu();
```

##### `addContextMenu(element: HTMLElement, menuProvider: (event: MouseEvent) => ContextMenuItem[]): () => void`
为元素添加右键菜单支持。

```typescript
const cleanup = addContextMenu(fileElement, (event) => [
  {
    label: '重命名',
    action: () => renameFile()
  },
  {
    label: '删除',
    danger: true,
    action: () => deleteFile()
  }
]);

// 清理事件监听器
cleanup();
```

### 预定义菜单创建器

##### `createFileContextMenu(file, actions): ContextMenuItem[]`
创建文件右键菜单。

```typescript
const fileMenu = contextMenuAPI.createFileContextMenu(
  { id: 'file1', name: 'document.txt', type: 'file' },
  {
    onOpen: () => openFile(),
    onRename: () => renameFile(),
    onDelete: () => deleteFile(),
    onCopy: () => copyFile(),
    onCut: () => cutFile(),
    onProperties: () => showProperties()
  }
);

showContextMenu({
  x: event.clientX,
  y: event.clientY,
  items: fileMenu
});
```

##### `createDesktopContextMenu(actions): ContextMenuItem[]`
创建桌面右键菜单。

```typescript
const desktopMenu = contextMenuAPI.createDesktopContextMenu({
  onRefresh: () => refreshDesktop(),
  onNewFolder: () => createNewFolder(),
  onNewFile: () => createNewFile(),
  onPersonalize: () => openPersonalization(),
  onSystemInfo: () => showSystemInfo()
});
```

---

## 动画服务 (Animation Service)

动画服务提供了统一的动画管理功能，支持预设和自定义动画配置。

### 导入方式
```typescript
import { animationService } from '@/core/services/animationService';
```

### 动画配置接口
```typescript
interface AnimationConfig {
  duration: number; // 毫秒
  easing: string;   // CSS 缓动函数
  enabled: boolean;
}

interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  windowOpen: AnimationConfig;
  windowClose: AnimationConfig;
  windowMinimize: AnimationConfig;
  windowMaximize: AnimationConfig;
  windowMove: AnimationConfig;
  windowResize: AnimationConfig;
  desktopIconHover: AnimationConfig;
  taskbarTransition: AnimationConfig;
}
```

### 基础方法

##### `getCurrentConfig(): AnimationPreset`
获取当前动画配置。

```typescript
const config = animationService.getCurrentConfig();
console.log(config.windowOpen.duration); // 300
```

##### `setPreset(presetId: string): Promise<void>`
设置动画预设。

```typescript
// 可用预设: 'none', 'default', 'smooth', 'fast', 'bouncy'
await animationService.setPreset('smooth');
```

##### `setCustomConfig(config: Partial<AnimationPreset>): Promise<void>`
设置自定义动画配置。

```typescript
await animationService.setCustomConfig({
  windowOpen: {
    duration: 500,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    enabled: true
  }
});
```

##### `getPresets(): AnimationPreset[]`
获取所有预设。

```typescript
const presets = animationService.getPresets();
presets.forEach(preset => {
  console.log(`${preset.id}: ${preset.name}`);
});
```

### 动画执行方法

##### `animateElement(element, type, keyframes, options?): Animation`
执行元素动画。

```typescript
const animation = animationService.animateElement(
  windowElement,
  'windowOpen',
  [
    { opacity: 0, transform: 'scale(0.8)' },
    { opacity: 1, transform: 'scale(1)' }
  ]
);
```

##### `animateWindowOpen(element: HTMLElement): Animation`
窗口打开动画。

```typescript
const animation = animationService.animateWindowOpen(windowElement);
```

##### `animateWindowClose(element: HTMLElement): Animation`
窗口关闭动画。

```typescript
const animation = animationService.animateWindowClose(windowElement);
```

##### `animateWindowMinimize(element: HTMLElement, targetRect: DOMRect): Animation`
窗口最小化动画。

```typescript
const taskbarRect = taskbarButton.getBoundingClientRect();
const animation = animationService.animateWindowMinimize(windowElement, taskbarRect);
```

##### `animateWindowMaximize(element: HTMLElement, isMaximizing: boolean): Animation`
窗口最大化动画。

```typescript
const animation = animationService.animateWindowMaximize(windowElement, true);
```

---

## 事件系统 (Event Bus)

事件系统提供了组件间通信的功能，支持发布订阅模式。

### 导入方式
```typescript
import { eventBus, SystemEvents } from '@/core/services/eventBus';
```

### 系统事件类型
```typescript
enum SystemEvents {
  WallpaperChanged = 'wallpaperChanged',
  ThemeChanged = 'themeChanged',
  AppLoaded = 'appLoaded',
  AppUnloaded = 'appUnloaded',
  WindowOpened = 'windowOpened',
  WindowClosed = 'windowClosed',
  WindowFocused = 'windowFocused',
  WindowMinimized = 'windowMinimized',
  WindowMaximized = 'windowMaximized',
}
```

### 基础方法

##### `on(event: string, callback: EventCallback): void`
订阅事件。

```typescript
eventBus.on(SystemEvents.ThemeChanged, (themeId) => {
  console.log(`主题切换到: ${themeId}`);
});

// 自定义事件
eventBus.on('my-custom-event', (data) => {
  console.log('接收到数据:', data);
});
```

##### `emit(event: string, payload?: any): void`
发布事件。

```typescript
eventBus.emit(SystemEvents.WindowOpened, windowState);

// 发布自定义事件
eventBus.emit('my-custom-event', { message: 'Hello!' });
```

##### `off(event: string, callback: EventCallback): void`
取消订阅。

```typescript
const handler = (data) => console.log(data);
eventBus.on('test-event', handler);

// 取消订阅
eventBus.off('test-event', handler);
```

##### `once(event: string, callback: EventCallback): void`
只监听一次事件。

```typescript
eventBus.once(SystemEvents.AppLoaded, (app) => {
  console.log('应用首次加载:', app);
});
```

##### `clear(event: string): void`
清除某个事件的所有监听器。

```typescript
eventBus.clear('my-event');
```

##### `clearAll(): void`
清除所有事件监听器。

```typescript
eventBus.clearAll();
```

##### `listenerCount(event: string): number`
获取事件的监听器数量。

```typescript
const count = eventBus.listenerCount(SystemEvents.ThemeChanged);
```

### 在Vue组件中使用

```typescript
import { onMounted, onUnmounted } from 'vue';

export default {
  setup() {
    const handleThemeChange = (themeId) => {
      console.log('主题变更:', themeId);
    };

    onMounted(() => {
      eventBus.on(SystemEvents.ThemeChanged, handleThemeChange);
    });

    onUnmounted(() => {
      eventBus.off(SystemEvents.ThemeChanged, handleThemeChange);
    });
  }
};
```

---

## 彩蛋系统 (Easter Eggs)

彩蛋系统为用户提供隐藏的趣味功能。

### 导入方式
```typescript
import { easterEggs } from '@/core/services/easterEggs';
```

### 内置彩蛋

#### 键盘序列彩蛋
- **Konami Code**: ↑↑↓↓←→←→BA - 激活彩虹模式
- **MEOW Code**: M-E-O-W - 切换猫咪模式

#### 交互彩蛋
- **Logo点击**: 连续点击5次MeowOS logo触发浮动猫咪
- **时间彩蛋**: 
  - 11:11 - "许愿时间"通知
  - 00:00 - "午夜喵"通知  
  - 15:00 - "下午茶时间"通知

### 猫咪模式效果
- 鼠标指针变为猫爪
- 窗口标题栏变为彩虹渐变
- 任务栏背景变为彩虹渐变
- 桌面图标添加跳动动画

---

## 默认图标服务 (Default Icons)

默认图标服务为应用提供图标回退和分类图标。

### 导入方式
```typescript
import { defaultIcons } from '@/core/services/defaultIcons';
```

### 主要方法

##### `getDefaultIcon(manifest): string`
根据应用信息获取默认图标。

```typescript
const icon = defaultIcons.getDefaultIcon({
  type: 'app',
  category: 'productivity',
  name: 'Text Editor'
});
```

##### `generateThemeIcon(type: string, color?: string): string`
生成主题相关的SVG图标。

```typescript
const appIcon = defaultIcons.generateThemeIcon('app', '#4A90E2');
```

##### `getMeowOSIcon(variant): string`
获取MeowOS主题的猫咪图标。

```typescript
const icon = defaultIcons.getMeowOSIcon('happy'); // 😸
```

---

## 类型定义

### 应用清单 (AppManifest)
```typescript
interface AppManifest {
  id: string;
  name: string;
  description?: string;
  version: string;
  icon: string;
  type: 'app' | 'widget' | 'cli' | 'service';
  entry: string;
  settings?: Record<string, any>;
  hiddenFromDesktop?: boolean;
  singleInstance?: boolean;
  showOnDesktop?: boolean;
  isSystemComponent?: boolean;
  autoStart?: boolean;
  visible?: boolean;
  permissions?: string[];
  category?: string;
}
```

### 窗口状态 (WindowState)
```typescript
interface WindowState {
  id: string;
  title: string;
  icon: string;
  component: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  isHidden?: boolean;
  previousPosition?: { x: number; y: number; width: number; height: number };
}
```

### 主题定义 (ThemeDefinition)
```typescript
interface ThemeDefinition {
  id: string;
  name: string;
  variables: Record<string, string>; // CSS 变量
  effects?: {
    windowBlur?: boolean;
    translucency?: number; // 0-1
  };
}
```

### 壁纸源 (WallpaperSource)
```typescript
interface WallpaperSource {
  id: string;
  type: 'builtin' | 'color' | 'gradient' | 'url' | 'file';
  value: string;
  thumb?: string;
  name?: string;
}
```

### 系统配置 (SystemConfig)
```typescript
interface SystemConfig {
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
```

### 用户配置 (UserConfig)
```typescript
interface UserConfig {
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
```

---

## 使用示例

### 创建一个简单的应用

```typescript
// MyApp.ts
import { defineComponent, ref, onMounted } from 'vue';
import { storage } from '@/core/api/storage';
import { eventBus, SystemEvents } from '@/core/services/eventBus';

export default defineComponent({
  name: 'MyApp',
  setup() {
    const data = ref('');
    const APP_ID = 'my-custom-app';

    // 加载保存的数据
    onMounted(async () => {
      const savedData = await storage.getAppSetting(APP_ID, 'data');
      if (savedData) {
        data.value = savedData;
      }

      // 监听主题变更
      eventBus.on(SystemEvents.ThemeChanged, (themeId) => {
        console.log('主题切换到:', themeId);
      });
    });

    // 保存数据
    const saveData = async () => {
      await storage.setAppSetting(APP_ID, 'data', data.value);
    };

    return {
      data,
      saveData
    };
  }
});
```

### 创建自定义右键菜单

```typescript
import { addContextMenu } from '@/core/api/contextmenu';

// 为元素添加右键菜单
const cleanup = addContextMenu(elementRef.value, (event) => [
  {
    label: '编辑',
    icon: '✏️',
    action: () => editItem(),
    shortcut: 'Ctrl+E'
  },
  { type: 'separator' },
  {
    label: '更多选项',
    icon: '⚙️',
    submenu: [
      {
        label: '复制',
        action: () => copyItem()
      },
      {
        label: '移动',
        action: () => moveItem()
      }
    ]
  },
  { type: 'separator' },
  {
    label: '删除',
    icon: '🗑️',
    danger: true,
    action: () => deleteItem()
  }
]);
```

### 使用文件系统API

```typescript
import { fileSystem } from '@/core/api/filesystem';

// 创建文件管理器功能
async function createFileManager() {
  // 获取根目录
  const root = await fileSystem.getRoot();
  
  // 获取目录内容
  const children = await fileSystem.getChildren(root.id);
  
  // 创建新文件夹
  const newFolder = await fileSystem.createDirectory('My Documents', root.id);
  
  // 创建文本文件
  const textFile = await fileSystem.createFile(
    'note.txt',
    newFolder.id,
    'Hello World!',
    'text/plain'
  );
  
  // 读取文件
  const content = await fileSystem.readFile(textFile.id);
  console.log(content); // 'Hello World!'
  
  // 搜索文件
  const searchResults = await fileSystem.search('note');
  console.log(searchResults);
}
```

---

## 总结

MeowOS提供了完整的桌面操作系统API，包括：

- **系统管理**: 应用、窗口、主题、壁纸管理
- **数据持久化**: IndexedDB和localStorage支持
- **文件系统**: 虚拟文件系统，支持文件操作
- **用户交互**: 右键菜单、动画效果
- **事件通信**: 发布订阅模式的事件系统
- **趣味功能**: 彩蛋系统和主题图标

所有API都经过精心设计，提供了TypeScript类型支持，确保开发体验的一致性和类型安全。开发者可以基于这些API构建功能丰富的桌面应用程序。
