# Utils工具函数详解

MeowOS中所有工具函数的详细说明和使用指南。

## 时间工具 (time.ts)

### TimeUtils类

提供时间格式化、计算和处理功能。

#### 核心方法

```typescript
class TimeUtils {
  // 格式化时间
  static format(date: Date | number, format: string): string
  
  // 相对时间显示
  static formatRelative(date: Date | number): string
  
  // 时间差计算
  static diff(date1: Date | number, date2: Date | number, unit: string): number
  
  // 格式化持续时间
  static formatDuration(milliseconds: number): string
  
  // 获取时间段
  static getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night'
  
  // 时区转换
  static toTimezone(date: Date, timezone: string): Date
  
  // 工作日判断
  static isWorkday(date: Date): boolean
  
  // 获取本周开始时间
  static getWeekStart(date: Date): Date
  
  // 获取月份天数
  static getDaysInMonth(year: number, month: number): number
}
```

#### 实际使用示例

```typescript
import { TimeUtils } from '@/utils/time'

// 基础时间格式化
const now = new Date()
console.log(TimeUtils.format(now, 'YYYY-MM-DD HH:mm:ss'))
// 输出: "2024-01-15 14:30:25"

console.log(TimeUtils.format(now, 'MM/DD/YYYY'))
// 输出: "01/15/2024"

console.log(TimeUtils.format(now, 'HH:mm'))
// 输出: "14:30"

// 相对时间显示
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
console.log(TimeUtils.formatRelative(yesterday))
// 输出: "1天前"

const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
console.log(TimeUtils.formatRelative(oneHourAgo))
// 输出: "1小时前"

// 时间差计算
const startTime = new Date('2024-01-01')
const endTime = new Date('2024-01-15')
console.log(TimeUtils.diff(endTime, startTime, 'days'))
// 输出: 14

console.log(TimeUtils.diff(endTime, startTime, 'hours'))
// 输出: 336

// 持续时间格式化
console.log(TimeUtils.formatDuration(75000))
// 输出: "1分15秒"

console.log(TimeUtils.formatDuration(3661000))
// 输出: "1小时1分1秒"

// 实际应用场景
class DocumentViewer {
  private openTime = new Date()
  
  getReadingTime(): string {
    const duration = Date.now() - this.openTime.getTime()
    return TimeUtils.formatDuration(duration)
  }
  
  getLastModifiedText(docDate: Date): string {
    return `最后修改: ${TimeUtils.formatRelative(docDate)}`
  }
  
  formatCreationDate(date: Date): string {
    return `创建于 ${TimeUtils.format(date, 'YYYY年MM月DD日 HH:mm')}`
  }
}
```

## 打字机效果 (typeEffect.ts)

### TypeEffect类

提供文字逐字显示的动画效果。

#### 核心方法

```typescript
class TypeEffect {
  constructor(element: HTMLElement, options: TypeEffectOptions)
  
  // 开始动画
  async start(): Promise<void>
  
  // 停止动画
  stop(): void
  
  // 暂停/恢复
  pause(): void
  resume(): void
  
  // 重置状态
  reset(): void
  
  // 设置新文本
  setText(text: string | string[]): void
  
  // 获取状态
  isRunning(): boolean
  isPaused(): boolean
}

interface TypeEffectOptions {
  text: string | string[];           // 要显示的文本
  speed: number | SpeedRange;        // 打字速度
  cursor?: boolean;                  // 是否显示光标
  cursorChar?: string;               // 光标字符
  loop?: boolean;                    // 是否循环
  loopDelay?: number;                // 循环间隔
  deleteSpeed?: number;              // 删除速度
  onComplete?: () => void;           // 完成回调
  onCharTyped?: (char: string) => void; // 字符回调
}

interface SpeedRange {
  min: number;
  max: number;
}
```

#### 实际使用示例

```typescript
import { TypeEffect } from '@/utils/typeEffect'

// 基础打字机效果
const welcomeElement = document.getElementById('welcome')
const typeEffect = new TypeEffect(welcomeElement, {
  text: '欢迎使用 MeowOS！',
  speed: 100,
  cursor: true
})

await typeEffect.start()

// 多行文本效果
const introEffect = new TypeEffect(document.getElementById('intro'), {
  text: [
    '这是一个现代化的Web桌面系统',
    '支持多窗口、主题切换',
    '以及丰富的应用生态'
  ],
  speed: { min: 50, max: 150 },
  cursor: true,
  loop: true,
  loopDelay: 2000
})

// 实际应用场景
class WelcomeScreen {
  private typeEffect: TypeEffect
  
  async showWelcome(userName: string) {
    const messages = [
      `你好，${userName}！`,
      '欢迎回到 MeowOS',
      '让我们开始今天的工作吧'
    ]
    
    const element = document.querySelector('.welcome-message')
    this.typeEffect = new TypeEffect(element, {
      text: messages,
      speed: 80,
      cursor: true,
      onComplete: () => {
        setTimeout(() => this.hideWelcome(), 3000)
      }
    })
    
    await this.typeEffect.start()
  }
  
  hideWelcome() {
    this.typeEffect.stop()
    // 隐藏欢迎界面
  }
}

// 高级用法：交互式终端效果
class TerminalEffect {
  private container: HTMLElement
  private currentLine: HTMLElement
  private typeEffect: TypeEffect
  
  constructor(container: HTMLElement) {
    this.container = container
  }
  
  async executeCommand(command: string, output: string[]) {
    // 显示命令
    await this.typeCommand(command)
    
    // 显示输出
    for (const line of output) {
      await this.typeLine(line)
    }
    
    // 创建新的输入行
    this.createNewLine()
  }
  
  private async typeCommand(command: string) {
    const line = this.createLine('$ ')
    this.typeEffect = new TypeEffect(line, {
      text: command,
      speed: { min: 30, max: 80 },
      cursor: false
    })
    
    await this.typeEffect.start()
  }
  
  private async typeLine(text: string) {
    const line = this.createLine('')
    this.typeEffect = new TypeEffect(line, {
      text,
      speed: { min: 10, max: 30 },
      cursor: false
    })
    
    await this.typeEffect.start()
  }
  
  private createLine(prefix: string): HTMLElement {
    const line = document.createElement('div')
    line.className = 'terminal-line'
    line.textContent = prefix
    this.container.appendChild(line)
    return line
  }
  
  private createNewLine() {
    this.currentLine = this.createLine('$ ')
    // 添加光标
    const cursor = document.createElement('span')
    cursor.className = 'terminal-cursor'
    cursor.textContent = '_'
    this.currentLine.appendChild(cursor)
  }
}
```

## API请求工具 (apiFetch.ts)

### ApiFetch类

提供统一的API请求接口和常用API封装。

#### 核心方法

```typescript
class ApiFetch {
  // 通用请求方法
  static async request<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>
  
  // GET请求
  static async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>
  
  // POST请求
  static async post<T>(url: string, data?: any): Promise<ApiResponse<T>>
  
  // 常用API
  static async getHitokoto(type?: string): Promise<ApiResponse<HitokotoResponse>>
  static async getRandomACGIMG(): Promise<ApiResponse<{url: string}>>
  static async getWeather(city: string): Promise<ApiResponse<WeatherResponse>>
  static async getBingWallpaper(): Promise<ApiResponse<WallpaperResponse>>
  
  // 请求拦截器
  static addRequestInterceptor(interceptor: RequestInterceptor): void
  static addResponseInterceptor(interceptor: ResponseInterceptor): void
  
  // 错误处理
  static setErrorHandler(handler: ErrorHandler): void
  
  // 请求缓存
  static cache(key: string, ttl?: number): MethodDecorator
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
  message?: string;
}
```

#### 实际使用示例

```typescript
import { ApiFetch } from '@/utils/apiFetch'

// 基础API调用
const hitokoto = await ApiFetch.getHitokoto('a') // 动画类型
if (hitokoto.success) {
  console.log('一言:', hitokoto.data.hitokoto)
  console.log('来源:', hitokoto.data.from)
}

// 获取随机图片
const randomImg = await ApiFetch.getRandomACGIMG()
if (randomImg.success) {
  document.getElementById('bg').style.backgroundImage = 
    `url(${randomImg.data.url})`
}

// 自定义API请求
const customApi = await ApiFetch.request('/api/user/profile', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token'
  }
})

// 实际应用场景
class WeatherWidget {
  private city = '北京'
  
  async updateWeather() {
    try {
      const weather = await ApiFetch.getWeather(this.city)
      if (weather.success) {
        this.displayWeather(weather.data)
      } else {
        this.showError('获取天气信息失败')
      }
    } catch (error) {
      this.showError('网络请求错误')
    }
  }
  
  private displayWeather(data: WeatherResponse) {
    document.getElementById('temperature').textContent = `${data.temperature}°C`
    document.getElementById('description').textContent = data.description
    document.getElementById('humidity').textContent = `湿度: ${data.humidity}%`
  }
  
  private showError(message: string) {
    console.error('Weather Widget Error:', message)
  }
}

// 带缓存的API调用
class DataService {
  @ApiFetch.cache('user-data', 5 * 60 * 1000) // 缓存5分钟
  async getUserData(userId: string) {
    return await ApiFetch.get(`/api/users/${userId}`)
  }
  
  @ApiFetch.cache('app-config', 30 * 60 * 1000) // 缓存30分钟
  async getAppConfig() {
    return await ApiFetch.get('/api/config')
  }
}

// 请求拦截器示例
ApiFetch.addRequestInterceptor((config) => {
  // 添加认证头
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 添加时间戳防缓存
  if (config.method === 'GET') {
    const url = new URL(config.url)
    url.searchParams.set('_t', Date.now().toString())
    config.url = url.toString()
  }
  
  return config
})

// 响应拦截器示例
ApiFetch.addResponseInterceptor((response) => {
  // 统一错误处理
  if (!response.success && response.code === 401) {
    // 清除认证信息
    localStorage.removeItem('auth_token')
    // 跳转到登录页面
    window.location.href = '/login'
  }
  
  return response
})
```

## 通用工具函数 (index.ts)

### 实用工具函数集合

```typescript
// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void

// 深拷贝
export function deepClone<T>(obj: T): T

// 对象合并
export function merge<T extends object>(target: T, ...sources: Partial<T>[]): T

// 格式化文件大小
export function formatFileSize(bytes: number): string

// 生成唯一ID
export function generateId(prefix?: string): string

// 类型检查
export function isObject(value: any): value is object
export function isArray(value: any): value is any[]
export function isFunction(value: any): value is Function
export function isString(value: any): value is string
export function isNumber(value: any): value is number

// 数组工具
export function chunk<T>(array: T[], size: number): T[][]
export function unique<T>(array: T[]): T[]
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]>

// 字符串工具
export function capitalize(str: string): string
export function camelCase(str: string): string
export function kebabCase(str: string): string
export function truncate(str: string, length: number, ellipsis?: string): string

// 数字工具
export function random(min: number, max: number): number
export function clamp(value: number, min: number, max: number): number
export function formatNumber(num: number, decimals?: number): string

// DOM工具
export function $(selector: string): HTMLElement | null
export function $$(selector: string): NodeListOf<HTMLElement>
export function addClass(element: HTMLElement, className: string): void
export function removeClass(element: HTMLElement, className: string): void
export function toggleClass(element: HTMLElement, className: string): void

// 存储工具
export function setStorage(key: string, value: any): void
export function getStorage(key: string): any
export function removeStorage(key: string): void

// 事件工具
export function on(element: EventTarget, event: string, handler: EventListener): void
export function off(element: EventTarget, event: string, handler: EventListener): void
export function once(element: EventTarget, event: string, handler: EventListener): void

// 异步工具
export function sleep(ms: number): Promise<void>
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T>
export function retry<T>(fn: () => Promise<T>, times: number): Promise<T>
```

#### 实际使用示例

```typescript
import {
  debounce, throttle, deepClone, formatFileSize,
  generateId, chunk, capitalize, random, sleep
} from '@/utils'

// 防抖搜索
class SearchBox {
  private searchInput: HTMLInputElement
  
  constructor(input: HTMLInputElement) {
    this.searchInput = input
    this.setupSearch()
  }
  
  private setupSearch() {
    const debouncedSearch = debounce(this.performSearch.bind(this), 300)
    this.searchInput.addEventListener('input', debouncedSearch)
  }
  
  private async performSearch() {
    const query = this.searchInput.value.trim()
    if (query) {
      console.log('搜索:', query)
      // 执行搜索逻辑
    }
  }
}

// 节流滚动
class ScrollManager {
  constructor() {
    const throttledScroll = throttle(this.handleScroll.bind(this), 100)
    window.addEventListener('scroll', throttledScroll)
  }
  
  private handleScroll() {
    const scrollPercent = window.scrollY / 
      (document.body.scrollHeight - window.innerHeight)
    console.log('滚动进度:', Math.round(scrollPercent * 100) + '%')
  }
}

// 文件处理示例
class FileManager {
  displayFileInfo(file: File) {
    return {
      id: generateId('file'),
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      lastModified: new Date(file.lastModified)
    }
  }
  
  async processFiles(files: File[]) {
    // 按大小分组
    const fileGroups = chunk(files, 10) // 每组10个文件
    
    for (const group of fileGroups) {
      await this.processFileGroup(group)
      await sleep(100) // 避免阻塞UI
    }
  }
  
  private async processFileGroup(files: File[]) {
    const promises = files.map(file => this.processFile(file))
    await Promise.all(promises)
  }
  
  private async processFile(file: File): Promise<void> {
    console.log(`处理文件: ${file.name} (${formatFileSize(file.size)})`)
    // 处理逻辑
  }
}

// 数据处理示例
class DataProcessor {
  processUserData(users: any[]) {
    // 按部门分组
    const usersByDept = groupBy(users, 'department')
    
    // 处理每个部门的数据
    const result = Object.entries(usersByDept).map(([dept, deptUsers]) => ({
      department: capitalize(dept),
      count: deptUsers.length,
      users: deptUsers.map(user => ({
        ...user,
        displayName: capitalize(user.name)
      }))
    }))
    
    return result
  }
  
  generateReport(data: any[]) {
    const reportId = generateId('report')
    const summary = {
      id: reportId,
      totalRecords: data.length,
      generatedAt: new Date(),
      statistics: this.calculateStatistics(data)
    }
    
    return summary
  }
  
  private calculateStatistics(data: any[]) {
    // 统计计算逻辑
    return {
      average: data.reduce((sum, item) => sum + item.value, 0) / data.length,
      min: Math.min(...data.map(item => item.value)),
      max: Math.max(...data.map(item => item.value))
    }
  }
}

// 配置管理示例
class ConfigManager {
  private defaultConfig = {
    theme: 'default',
    language: 'zh-CN',
    autoSave: true,
    debugMode: false
  }
  
  loadConfig() {
    const savedConfig = getStorage('app-config') || {}
    return merge(deepClone(this.defaultConfig), savedConfig)
  }
  
  saveConfig(config: any) {
    const mergedConfig = merge(this.loadConfig(), config)
    setStorage('app-config', mergedConfig)
    return mergedConfig
  }
  
  resetConfig() {
    removeStorage('app-config')
    return deepClone(this.defaultConfig)
  }
}
```

## 工具函数最佳实践

### 1. 性能优化

```typescript
// 使用防抖优化频繁操作
const optimizedResize = debounce(() => {
  // 重新计算布局
  recalculateLayout()
}, 250)

window.addEventListener('resize', optimizedResize)

// 使用节流优化滚动事件
const optimizedScroll = throttle(() => {
  // 更新滚动位置指示器
  updateScrollIndicator()
}, 16) // 60fps

window.addEventListener('scroll', optimizedScroll)
```

### 2. 错误处理

```typescript
// 带错误处理的工具函数
const safeParseJSON = (str: string, defaultValue: any = null) => {
  try {
    return JSON.parse(str)
  } catch (error) {
    console.warn('JSON解析失败:', error)
    return defaultValue
  }
}

// 异步操作的错误处理
const safeAsyncOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    console.error('异步操作失败:', error)
    return fallback
  }
}
```

### 3. 类型安全

```typescript
// 类型安全的工具函数
function typedLocalStorage<T>(key: string, defaultValue: T) {
  return {
    get(): T {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    },
    
    set(value: T): void {
      localStorage.setItem(key, JSON.stringify(value))
    },
    
    remove(): void {
      localStorage.removeItem(key)
    }
  }
}

// 使用示例
const userSettings = typedLocalStorage('user-settings', {
  theme: 'default' as 'default' | 'dark',
  fontSize: 14,
  autoSave: true
})

const settings = userSettings.get() // 类型安全
userSettings.set({ theme: 'dark', fontSize: 16, autoSave: false })
```

这份工具函数详解基于MeowOS的实际工具代码编写，提供了完整的函数说明和实用示例。
