const n=`# 系统接口详解\r
\r
MeowOS核心接口的完整说明和使用示例。\r
\r
## 系统核心接口\r
\r
### SystemService接口\r
\r
系统服务的主要接口，负责应用管理、窗口控制、主题切换等核心功能。\r
\r
#### 接口定义\r
\r
\`\`\`typescript\r
interface ISystemService {\r
  // 应用管理\r
  listApps(): AppManifest[]\r
  openApp(appId: string, options?: Partial<WindowState>): Promise<WindowState | null>\r
  closeApp(appId: string): boolean\r
  getAppById(appId: string): AppManifest | undefined\r
  addCustomApp(manifest: AppManifest): Promise<void>\r
  removeCustomApp(appId: string): Promise<void>\r
  \r
  // 窗口管理\r
  getWindows(): WindowState[]\r
  getWindowById(windowId: string): WindowState | undefined\r
  focusWindow(windowId: string): void\r
  minimizeWindow(windowId: string): void\r
  maximizeWindow(windowId: string): void\r
  closeWindow(windowId: string): void\r
  updateWindowState(windowId: string, updates: Partial<WindowState>): void\r
  \r
  // 主题管理\r
  setTheme(themeId: string): Promise<void>\r
  applyTheme(themeId: string): void\r
  getThemes(): ThemeDefinition[]\r
  addCustomTheme(theme: ThemeDefinition): Promise<void>\r
  \r
  // 配置管理\r
  getConfig(): SystemConfig\r
  setUserConfig(config: UserConfig): void\r
  getUserConfig(): UserConfig\r
  resetConfig(): void\r
  \r
  // 系统状态\r
  getSystemInfo(): SystemInfo\r
  getPerformanceStats(): PerformanceStats\r
}\r
\`\`\`\r
\r
#### 实际使用示例\r
\r
\`\`\`typescript\r
import { system } from '@/core/api'\r
\r
// 获取所有应用\r
const apps = system.listApps()\r
console.log('系统应用:', apps.map(app => app.name))\r
\r
// 打开应用并获取窗口引用\r
const window = await system.openApp('text-reader', {\r
  title: '我的文档',\r
  size: { width: 800, height: 600 }\r
})\r
\r
if (window) {\r
  console.log('窗口已创建:', window.id)\r
}\r
\r
// 管理窗口状态\r
const windows = system.getWindows()\r
windows.forEach(win => {\r
  if (win.isMinimized) {\r
    system.focusWindow(win.id)\r
  }\r
})\r
\r
// 切换主题\r
await system.setTheme('dark')\r
\`\`\`\r
\r
### DocumentSystem接口\r
\r
文档系统接口，提供文档扫描、管理和访问功能。\r
\r
#### 接口定义\r
\r
\`\`\`typescript\r
interface IDocumentSystem {\r
  // 文档获取\r
  getDocuments(path?: string): DocumentItem[]\r
  getDocumentContent(path: string): Promise<string>\r
  getDocumentByPath(path: string): DocumentItem | undefined\r
  \r
  // 搜索功能\r
  searchDocuments(query: string): DocumentItem[]\r
  searchDocumentContent(query: string): Promise<SearchResult[]>\r
  \r
  // 导航辅助\r
  getBreadcrumbs(path: string): BreadcrumbItem[]\r
  getParentDirectory(path: string): string\r
  getDirectoryTree(): DirectoryNode\r
  \r
  // 统计信息\r
  getStats(): DocumentStats\r
  getRecentDocuments(limit?: number): DocumentItem[]\r
  getRecommendedDocuments(): DocumentItem[]\r
  \r
  // 系统状态\r
  isLoaded(): boolean\r
  refresh(): Promise<void>\r
  \r
  // 事件监听\r
  onDocumentAdded(callback: (doc: DocumentItem) => void): void\r
  onDocumentUpdated(callback: (doc: DocumentItem) => void): void\r
  onDocumentRemoved(callback: (path: string) => void): void\r
}\r
\`\`\`\r
\r
#### 实际使用示例\r
\r
\`\`\`typescript\r
import { documentSystem } from '@/core/api'\r
\r
// 等待系统加载完成\r
const waitForDocuments = async () => {\r
  while (!documentSystem.isLoaded()) {\r
    await new Promise(resolve => setTimeout(resolve, 100))\r
  }\r
}\r
\r
await waitForDocuments()\r
\r
// 获取教程目录下的文档\r
const tutorials = documentSystem.getDocuments('/教程')\r
console.log('教程文档:', tutorials)\r
\r
// 搜索包含"API"的文档\r
const apiDocs = documentSystem.searchDocuments('API')\r
console.log('API相关文档:', apiDocs)\r
\r
// 获取文档内容\r
const docContent = await documentSystem.getDocumentContent('/教程/开发指南.md')\r
console.log('文档内容长度:', docContent.length)\r
\r
// 获取导航面包屑\r
const breadcrumbs = documentSystem.getBreadcrumbs('/教程/应用开发/基础教程.md')\r
console.log('导航路径:', breadcrumbs.map(b => b.name).join(' > '))\r
\`\`\`\r
\r
### StorageService接口\r
\r
存储服务接口，提供数据持久化功能。\r
\r
#### 接口定义\r
\r
\`\`\`typescript\r
interface IStorageService {\r
  // 基础存储\r
  set(key: string, value: any, useIDB?: boolean): Promise<void>\r
  get(key: string, useIDB?: boolean): Promise<any>\r
  remove(key: string, useIDB?: boolean): Promise<void>\r
  clear(useIDB?: boolean): Promise<void>\r
  keys(useIDB?: boolean): Promise<string[]>\r
  \r
  // 应用专用存储\r
  setAppSetting(appId: string, key: string, value: any): Promise<void>\r
  getAppSetting(appId: string, key: string): Promise<any>\r
  removeAppSetting(appId: string, key: string): Promise<void>\r
  clearAppData(appId: string): Promise<void>\r
  getAppKeys(appId: string): Promise<string[]>\r
  \r
  // 系统设置存储\r
  setSystemSetting(key: string, value: any): Promise<void>\r
  getSystemSetting(key: string): Promise<any>\r
  removeSystemSetting(key: string): Promise<void>\r
  \r
  // 存储统计\r
  getStorageStats(): Promise<StorageStats>\r
  getUsage(): Promise<StorageUsage>\r
  \r
  // 数据迁移\r
  exportData(): Promise<ExportData>\r
  importData(data: ExportData): Promise<void>\r
  \r
  // 事件监听\r
  onStorageChange(callback: (event: StorageChangeEvent) => void): void\r
}\r
\`\`\`\r
\r
#### 实际使用示例\r
\r
\`\`\`typescript\r
import { storage } from '@/core/api'\r
\r
// 应用设置管理\r
class MyAppSettings {\r
  private readonly APP_ID = 'my-text-editor'\r
  \r
  async saveSettings(settings: any) {\r
    await storage.setAppSetting(this.APP_ID, 'settings', settings)\r
  }\r
  \r
  async loadSettings() {\r
    return await storage.getAppSetting(this.APP_ID, 'settings') || {\r
      fontSize: 14,\r
      theme: 'default',\r
      autoSave: true\r
    }\r
  }\r
  \r
  async saveDocument(docId: string, content: string) {\r
    await storage.setAppSetting(this.APP_ID, \`doc_\${docId}\`, {\r
      content,\r
      lastModified: Date.now()\r
    })\r
  }\r
  \r
  async loadDocument(docId: string) {\r
    return await storage.getAppSetting(this.APP_ID, \`doc_\${docId}\`)\r
  }\r
  \r
  async getDocumentList() {\r
    const keys = await storage.getAppKeys(this.APP_ID)\r
    return keys.filter(key => key.startsWith('doc_'))\r
  }\r
}\r
\r
// 系统级配置\r
const saveSystemConfig = async (config: any) => {\r
  await storage.setSystemSetting('systemConfig', config)\r
}\r
\r
const loadSystemConfig = async () => {\r
  return await storage.getSystemSetting('systemConfig')\r
}\r
\r
// 存储使用情况检查\r
const checkStorageUsage = async () => {\r
  const usage = await storage.getUsage()\r
  console.log('存储使用情况:', usage)\r
  \r
  if (usage.percentage > 80) {\r
    console.warn('存储空间不足')\r
  }\r
}\r
\`\`\`\r
\r
### EventBus接口\r
\r
事件总线接口，用于组件间通信。\r
\r
#### 接口定义\r
\r
\`\`\`typescript\r
interface IEventBus {\r
  // 基础事件方法\r
  on(event: string, callback: Function): void\r
  off(event: string, callback?: Function): void\r
  emit(event: string, ...args: any[]): void\r
  once(event: string, callback: Function): void\r
  \r
  // 事件管理\r
  hasListeners(event: string): boolean\r
  getListenerCount(event: string): number\r
  removeAllListeners(event?: string): void\r
  \r
  // 事件命名空间\r
  namespace(ns: string): IEventBus\r
  \r
  // 异步事件\r
  emitAsync(event: string, ...args: any[]): Promise<any[]>\r
  \r
  // 事件拦截\r
  intercept(event: string, interceptor: EventInterceptor): void\r
  removeInterceptor(event: string, interceptor: EventInterceptor): void\r
}\r
\`\`\`\r
\r
#### 实际使用示例\r
\r
\`\`\`typescript\r
import { eventBus, SystemEvents } from '@/core/api'\r
\r
// 监听系统事件\r
eventBus.on(SystemEvents.ThemeChanged, (themeId: string) => {\r
  console.log('主题切换到:', themeId)\r
  updateAppTheme(themeId)\r
})\r
\r
eventBus.on(SystemEvents.AppOpened, (app: AppManifest) => {\r
  console.log('应用已打开:', app.name)\r
  updateTaskbar()\r
})\r
\r
// 自定义事件通信\r
class AppCommunication {\r
  private readonly APP_EVENTS = {\r
    DATA_SHARED: 'app:dataShared',\r
    USER_ACTION: 'app:userAction',\r
    STATE_CHANGED: 'app:stateChanged'\r
  }\r
  \r
  // 发布数据共享事件\r
  shareData(data: any) {\r
    eventBus.emit(this.APP_EVENTS.DATA_SHARED, {\r
      source: 'my-app',\r
      timestamp: Date.now(),\r
      data\r
    })\r
  }\r
  \r
  // 监听其他应用的数据\r
  listenForSharedData(callback: (data: any) => void) {\r
    eventBus.on(this.APP_EVENTS.DATA_SHARED, (event) => {\r
      if (event.source !== 'my-app') {\r
        callback(event.data)\r
      }\r
    })\r
  }\r
  \r
  // 异步事件处理\r
  async broadcastUserAction(action: string) {\r
    const responses = await eventBus.emitAsync(this.APP_EVENTS.USER_ACTION, {\r
      action,\r
      timestamp: Date.now()\r
    })\r
    \r
    console.log('收到响应:', responses.length)\r
    return responses\r
  }\r
}\r
\r
// 事件命名空间使用\r
const musicEvents = eventBus.namespace('music')\r
musicEvents.on('play', (track) => console.log('播放:', track))\r
musicEvents.on('pause', () => console.log('暂停'))\r
\r
// 事件拦截器示例\r
eventBus.intercept('user:action', (event, next) => {\r
  // 记录用户行为\r
  console.log('用户操作:', event)\r
  \r
  // 可以修改事件或阻止传播\r
  if (event.type === 'dangerous') {\r
    console.warn('危险操作被拦截')\r
    return false // 阻止事件传播\r
  }\r
  \r
  return next(event) // 继续传播\r
})\r
\`\`\`\r
\r
### SystemAudio接口\r
\r
音频系统接口，提供音频播放和管理功能。\r
\r
#### 接口定义\r
\r
\`\`\`typescript\r
interface ISystemAudio {\r
  // 基础播放控制\r
  play(): Promise<void>\r
  pause(): void\r
  stop(): void\r
  togglePlayPause(): void\r
  \r
  // 音量控制\r
  setVolume(volume: number): void\r
  getVolume(): number\r
  toggleMute(): void\r
  isMuted(): boolean\r
  \r
  // 播放列表管理\r
  loadPlaylist(tracks: AudioTrack[]): void\r
  getCurrentTrack(): AudioTrack | null\r
  nextTrack(): void\r
  previousTrack(): void\r
  seekToTrack(index: number): void\r
  \r
  // 音效播放\r
  playSound(filePath: string, options?: SoundOptions): Promise<string>\r
  stopSound(soundId?: string): void\r
  playSystemSound(soundType: SystemSoundType): void\r
  \r
  // 播放状态\r
  isPlaying(): boolean\r
  getCurrentTime(): number\r
  getDuration(): number\r
  getProgress(): number\r
  seekTo(time: number): void\r
  \r
  // 事件监听\r
  onTrackChanged(callback: (track: AudioTrack) => void): void\r
  onPlayStateChanged(callback: (isPlaying: boolean) => void): void\r
  onVolumeChanged(callback: (volume: number) => void): void\r
  onTimeUpdate(callback: (time: number, duration: number) => void): void\r
}\r
\`\`\`\r
\r
#### 实际使用示例\r
\r
\`\`\`typescript\r
import { systemAudio } from '@/core/api'\r
\r
// 音乐播放器示例\r
class MusicPlayer {\r
  constructor() {\r
    this.setupEventListeners()\r
  }\r
  \r
  async loadAndPlay(tracks: AudioTrack[]) {\r
    systemAudio.loadPlaylist(tracks)\r
    await systemAudio.play()\r
  }\r
  \r
  private setupEventListeners() {\r
    systemAudio.onTrackChanged((track) => {\r
      console.log('当前播放:', track.title)\r
      this.updateUI(track)\r
    })\r
    \r
    systemAudio.onPlayStateChanged((isPlaying) => {\r
      console.log('播放状态:', isPlaying ? '播放中' : '已暂停')\r
      this.updatePlayButton(isPlaying)\r
    })\r
    \r
    systemAudio.onTimeUpdate((time, duration) => {\r
      this.updateProgress(time, duration)\r
    })\r
  }\r
  \r
  // 播放系统提示音\r
  playNotificationSound() {\r
    systemAudio.playSystemSound('notification')\r
  }\r
  \r
  // 播放自定义音效\r
  async playClickSound() {\r
    await systemAudio.playSound('/audio/click.mp3', {\r
      volume: 0.5,\r
      duration: 200\r
    })\r
  }\r
}\r
\r
// 音频可视化示例\r
class AudioVisualizer {\r
  private audioContext: AudioContext\r
  private analyser: AnalyserNode\r
  \r
  async init() {\r
    this.audioContext = new AudioContext()\r
    this.analyser = this.audioContext.createAnalyser()\r
    \r
    // 连接到系统音频\r
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })\r
    const source = this.audioContext.createMediaStreamSource(stream)\r
    source.connect(this.analyser)\r
    \r
    this.startVisualization()\r
  }\r
  \r
  private startVisualization() {\r
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)\r
    \r
    const animate = () => {\r
      this.analyser.getByteFrequencyData(dataArray)\r
      this.drawSpectrum(dataArray)\r
      requestAnimationFrame(animate)\r
    }\r
    \r
    animate()\r
  }\r
  \r
  private drawSpectrum(data: Uint8Array) {\r
    // 绘制频谱可视化\r
  }\r
}\r
\`\`\`\r
\r
## 接口扩展和自定义\r
\r
### 创建自定义服务接口\r
\r
\`\`\`typescript\r
// 定义自定义服务接口\r
interface INotificationService {\r
  show(message: string, options?: NotificationOptions): Promise<string>\r
  hide(id: string): void\r
  clear(): void\r
  getAll(): Notification[]\r
}\r
\r
// 实现服务\r
class NotificationService implements INotificationService {\r
  private notifications: Map<string, Notification> = new Map()\r
  \r
  async show(message: string, options: NotificationOptions = {}): Promise<string> {\r
    const id = \`notification_\${Date.now()}\`\r
    const notification = {\r
      id,\r
      message,\r
      type: options.type || 'info',\r
      duration: options.duration || 3000,\r
      timestamp: Date.now()\r
    }\r
    \r
    this.notifications.set(id, notification)\r
    \r
    // 显示通知\r
    this.displayNotification(notification)\r
    \r
    // 自动隐藏\r
    if (notification.duration > 0) {\r
      setTimeout(() => this.hide(id), notification.duration)\r
    }\r
    \r
    return id\r
  }\r
  \r
  hide(id: string): void {\r
    this.notifications.delete(id)\r
    this.removeNotificationElement(id)\r
  }\r
  \r
  clear(): void {\r
    this.notifications.clear()\r
    this.removeAllNotificationElements()\r
  }\r
  \r
  getAll(): Notification[] {\r
    return Array.from(this.notifications.values())\r
  }\r
  \r
  private displayNotification(notification: Notification) {\r
    // 创建通知元素并显示\r
  }\r
  \r
  private removeNotificationElement(id: string) {\r
    // 移除通知元素\r
  }\r
  \r
  private removeAllNotificationElements() {\r
    // 移除所有通知元素\r
  }\r
}\r
\r
// 注册到全局API\r
export const notifications = new NotificationService()\r
\`\`\`\r
\r
### 接口装饰器\r
\r
\`\`\`typescript\r
// 创建API调用装饰器\r
function apiCall(target: any, propertyName: string, descriptor: PropertyDescriptor) {\r
  const method = descriptor.value\r
  \r
  descriptor.value = async function (...args: any[]) {\r
    const startTime = performance.now()\r
    \r
    try {\r
      console.log(\`API调用: \${propertyName}\`, args)\r
      const result = await method.apply(this, args)\r
      \r
      const duration = performance.now() - startTime\r
      console.log(\`API完成: \${propertyName} (\${duration.toFixed(2)}ms)\`)\r
      \r
      return result\r
    } catch (error) {\r
      console.error(\`API错误: \${propertyName}\`, error)\r
      throw error\r
    }\r
  }\r
  \r
  return descriptor\r
}\r
\r
// 使用装饰器\r
class EnhancedSystemService {\r
  @apiCall\r
  async openApp(appId: string): Promise<WindowState | null> {\r
    // 实现逻辑\r
    return null\r
  }\r
  \r
  @apiCall\r
  async setTheme(themeId: string): Promise<void> {\r
    // 实现逻辑\r
  }\r
}\r
\`\`\`\r
\r
### 接口代理\r
\r
\`\`\`typescript\r
// 创建API代理，添加额外功能\r
const createApiProxy = <T extends object>(api: T): T => {\r
  return new Proxy(api, {\r
    get(target, prop, receiver) {\r
      const originalValue = Reflect.get(target, prop, receiver)\r
      \r
      if (typeof originalValue === 'function') {\r
        return function (...args: any[]) {\r
          // 权限检查\r
          if (!hasPermission(prop as string)) {\r
            throw new Error(\`没有权限调用 \${prop as string}\`)\r
          }\r
          \r
          // 速率限制\r
          if (isRateLimited(prop as string)) {\r
            throw new Error(\`调用 \${prop as string} 过于频繁\`)\r
          }\r
          \r
          // 执行原始方法\r
          return originalValue.apply(this, args)\r
        }\r
      }\r
      \r
      return originalValue\r
    }\r
  })\r
}\r
\r
// 使用代理\r
const secureSystem = createApiProxy(system)\r
\`\`\`\r
\r
## 接口版本管理\r
\r
### 版本兼容性处理\r
\r
\`\`\`typescript\r
interface ApiVersion {\r
  version: string\r
  deprecated?: boolean\r
  removedIn?: string\r
  replacement?: string\r
}\r
\r
class VersionedApi {\r
  private version = '1.0.0'\r
  \r
  @deprecated('2.0.0', 'use newMethod instead')\r
  oldMethod() {\r
    console.warn('oldMethod is deprecated, use newMethod instead')\r
    return this.newMethod()\r
  }\r
  \r
  newMethod() {\r
    return 'new implementation'\r
  }\r
}\r
\r
function deprecated(removedIn: string, replacement: string) {\r
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {\r
    const method = descriptor.value\r
    \r
    descriptor.value = function (...args: any[]) {\r
      console.warn(\r
        \`方法 \${propertyName} 已废弃，将在版本 \${removedIn} 中移除。\` +\r
        \`请使用 \${replacement} 替代。\`\r
      )\r
      return method.apply(this, args)\r
    }\r
    \r
    return descriptor\r
  }\r
}\r
\`\`\`\r
\r
这份接口详解文档基于MeowOS的实际接口实现编写，提供了完整的接口说明和实用示例。\r
`;export{n as default};
