const r=`# Utils工具函数详解\r
\r
MeowOS中所有工具函数的详细说明和使用指南。\r
\r
## 时间工具 (time.ts)\r
\r
### TimeUtils类\r
\r
提供时间格式化、计算和处理功能。\r
\r
#### 核心方法\r
\r
\`\`\`typescript\r
class TimeUtils {\r
  // 格式化时间\r
  static format(date: Date | number, format: string): string\r
  \r
  // 相对时间显示\r
  static formatRelative(date: Date | number): string\r
  \r
  // 时间差计算\r
  static diff(date1: Date | number, date2: Date | number, unit: string): number\r
  \r
  // 格式化持续时间\r
  static formatDuration(milliseconds: number): string\r
  \r
  // 获取时间段\r
  static getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night'\r
  \r
  // 时区转换\r
  static toTimezone(date: Date, timezone: string): Date\r
  \r
  // 工作日判断\r
  static isWorkday(date: Date): boolean\r
  \r
  // 获取本周开始时间\r
  static getWeekStart(date: Date): Date\r
  \r
  // 获取月份天数\r
  static getDaysInMonth(year: number, month: number): number\r
}\r
\`\`\`\r
\r
#### 实际使用示例\r
\r
\`\`\`typescript\r
import { TimeUtils } from '@/utils/time'\r
\r
// 基础时间格式化\r
const now = new Date()\r
console.log(TimeUtils.format(now, 'YYYY-MM-DD HH:mm:ss'))\r
// 输出: "2024-01-15 14:30:25"\r
\r
console.log(TimeUtils.format(now, 'MM/DD/YYYY'))\r
// 输出: "01/15/2024"\r
\r
console.log(TimeUtils.format(now, 'HH:mm'))\r
// 输出: "14:30"\r
\r
// 相对时间显示\r
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)\r
console.log(TimeUtils.formatRelative(yesterday))\r
// 输出: "1天前"\r
\r
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)\r
console.log(TimeUtils.formatRelative(oneHourAgo))\r
// 输出: "1小时前"\r
\r
// 时间差计算\r
const startTime = new Date('2024-01-01')\r
const endTime = new Date('2024-01-15')\r
console.log(TimeUtils.diff(endTime, startTime, 'days'))\r
// 输出: 14\r
\r
console.log(TimeUtils.diff(endTime, startTime, 'hours'))\r
// 输出: 336\r
\r
// 持续时间格式化\r
console.log(TimeUtils.formatDuration(75000))\r
// 输出: "1分15秒"\r
\r
console.log(TimeUtils.formatDuration(3661000))\r
// 输出: "1小时1分1秒"\r
\r
// 实际应用场景\r
class DocumentViewer {\r
  private openTime = new Date()\r
  \r
  getReadingTime(): string {\r
    const duration = Date.now() - this.openTime.getTime()\r
    return TimeUtils.formatDuration(duration)\r
  }\r
  \r
  getLastModifiedText(docDate: Date): string {\r
    return \`最后修改: \${TimeUtils.formatRelative(docDate)}\`\r
  }\r
  \r
  formatCreationDate(date: Date): string {\r
    return \`创建于 \${TimeUtils.format(date, 'YYYY年MM月DD日 HH:mm')}\`\r
  }\r
}\r
\`\`\`\r
\r
## 打字机效果 (typeEffect.ts)\r
\r
### TypeEffect类\r
\r
提供文字逐字显示的动画效果。\r
\r
#### 核心方法\r
\r
\`\`\`typescript\r
class TypeEffect {\r
  constructor(element: HTMLElement, options: TypeEffectOptions)\r
  \r
  // 开始动画\r
  async start(): Promise<void>\r
  \r
  // 停止动画\r
  stop(): void\r
  \r
  // 暂停/恢复\r
  pause(): void\r
  resume(): void\r
  \r
  // 重置状态\r
  reset(): void\r
  \r
  // 设置新文本\r
  setText(text: string | string[]): void\r
  \r
  // 获取状态\r
  isRunning(): boolean\r
  isPaused(): boolean\r
}\r
\r
interface TypeEffectOptions {\r
  text: string | string[];           // 要显示的文本\r
  speed: number | SpeedRange;        // 打字速度\r
  cursor?: boolean;                  // 是否显示光标\r
  cursorChar?: string;               // 光标字符\r
  loop?: boolean;                    // 是否循环\r
  loopDelay?: number;                // 循环间隔\r
  deleteSpeed?: number;              // 删除速度\r
  onComplete?: () => void;           // 完成回调\r
  onCharTyped?: (char: string) => void; // 字符回调\r
}\r
\r
interface SpeedRange {\r
  min: number;\r
  max: number;\r
}\r
\`\`\`\r
\r
#### 实际使用示例\r
\r
\`\`\`typescript\r
import { TypeEffect } from '@/utils/typeEffect'\r
\r
// 基础打字机效果\r
const welcomeElement = document.getElementById('welcome')\r
const typeEffect = new TypeEffect(welcomeElement, {\r
  text: '欢迎使用 MeowOS！',\r
  speed: 100,\r
  cursor: true\r
})\r
\r
await typeEffect.start()\r
\r
// 多行文本效果\r
const introEffect = new TypeEffect(document.getElementById('intro'), {\r
  text: [\r
    '这是一个现代化的Web桌面系统',\r
    '支持多窗口、主题切换',\r
    '以及丰富的应用生态'\r
  ],\r
  speed: { min: 50, max: 150 },\r
  cursor: true,\r
  loop: true,\r
  loopDelay: 2000\r
})\r
\r
// 实际应用场景\r
class WelcomeScreen {\r
  private typeEffect: TypeEffect\r
  \r
  async showWelcome(userName: string) {\r
    const messages = [\r
      \`你好，\${userName}！\`,\r
      '欢迎回到 MeowOS',\r
      '让我们开始今天的工作吧'\r
    ]\r
    \r
    const element = document.querySelector('.welcome-message')\r
    this.typeEffect = new TypeEffect(element, {\r
      text: messages,\r
      speed: 80,\r
      cursor: true,\r
      onComplete: () => {\r
        setTimeout(() => this.hideWelcome(), 3000)\r
      }\r
    })\r
    \r
    await this.typeEffect.start()\r
  }\r
  \r
  hideWelcome() {\r
    this.typeEffect.stop()\r
    // 隐藏欢迎界面\r
  }\r
}\r
\r
// 高级用法：交互式终端效果\r
class TerminalEffect {\r
  private container: HTMLElement\r
  private currentLine: HTMLElement\r
  private typeEffect: TypeEffect\r
  \r
  constructor(container: HTMLElement) {\r
    this.container = container\r
  }\r
  \r
  async executeCommand(command: string, output: string[]) {\r
    // 显示命令\r
    await this.typeCommand(command)\r
    \r
    // 显示输出\r
    for (const line of output) {\r
      await this.typeLine(line)\r
    }\r
    \r
    // 创建新的输入行\r
    this.createNewLine()\r
  }\r
  \r
  private async typeCommand(command: string) {\r
    const line = this.createLine('$ ')\r
    this.typeEffect = new TypeEffect(line, {\r
      text: command,\r
      speed: { min: 30, max: 80 },\r
      cursor: false\r
    })\r
    \r
    await this.typeEffect.start()\r
  }\r
  \r
  private async typeLine(text: string) {\r
    const line = this.createLine('')\r
    this.typeEffect = new TypeEffect(line, {\r
      text,\r
      speed: { min: 10, max: 30 },\r
      cursor: false\r
    })\r
    \r
    await this.typeEffect.start()\r
  }\r
  \r
  private createLine(prefix: string): HTMLElement {\r
    const line = document.createElement('div')\r
    line.className = 'terminal-line'\r
    line.textContent = prefix\r
    this.container.appendChild(line)\r
    return line\r
  }\r
  \r
  private createNewLine() {\r
    this.currentLine = this.createLine('$ ')\r
    // 添加光标\r
    const cursor = document.createElement('span')\r
    cursor.className = 'terminal-cursor'\r
    cursor.textContent = '_'\r
    this.currentLine.appendChild(cursor)\r
  }\r
}\r
\`\`\`\r
\r
## API请求工具 (apiFetch.ts)\r
\r
### ApiFetch类\r
\r
提供统一的API请求接口和常用API封装。\r
\r
#### 核心方法\r
\r
\`\`\`typescript\r
class ApiFetch {\r
  // 通用请求方法\r
  static async request<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>\r
  \r
  // GET请求\r
  static async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>\r
  \r
  // POST请求\r
  static async post<T>(url: string, data?: any): Promise<ApiResponse<T>>\r
  \r
  // 常用API\r
  static async getHitokoto(type?: string): Promise<ApiResponse<HitokotoResponse>>\r
  static async getRandomACGIMG(): Promise<ApiResponse<{url: string}>>\r
  static async getWeather(city: string): Promise<ApiResponse<WeatherResponse>>\r
  static async getBingWallpaper(): Promise<ApiResponse<WallpaperResponse>>\r
  \r
  // 请求拦截器\r
  static addRequestInterceptor(interceptor: RequestInterceptor): void\r
  static addResponseInterceptor(interceptor: ResponseInterceptor): void\r
  \r
  // 错误处理\r
  static setErrorHandler(handler: ErrorHandler): void\r
  \r
  // 请求缓存\r
  static cache(key: string, ttl?: number): MethodDecorator\r
}\r
\r
interface ApiResponse<T> {\r
  success: boolean;\r
  data?: T;\r
  error?: string;\r
  code?: number;\r
  message?: string;\r
}\r
\`\`\`\r
\r
#### 实际使用示例\r
\r
\`\`\`typescript\r
import { ApiFetch } from '@/utils/apiFetch'\r
\r
// 基础API调用\r
const hitokoto = await ApiFetch.getHitokoto('a') // 动画类型\r
if (hitokoto.success) {\r
  console.log('一言:', hitokoto.data.hitokoto)\r
  console.log('来源:', hitokoto.data.from)\r
}\r
\r
// 获取随机图片\r
const randomImg = await ApiFetch.getRandomACGIMG()\r
if (randomImg.success) {\r
  document.getElementById('bg').style.backgroundImage = \r
    \`url(\${randomImg.data.url})\`\r
}\r
\r
// 自定义API请求\r
const customApi = await ApiFetch.request('/api/user/profile', {\r
  method: 'GET',\r
  headers: {\r
    'Authorization': 'Bearer token'\r
  }\r
})\r
\r
// 实际应用场景\r
class WeatherWidget {\r
  private city = '北京'\r
  \r
  async updateWeather() {\r
    try {\r
      const weather = await ApiFetch.getWeather(this.city)\r
      if (weather.success) {\r
        this.displayWeather(weather.data)\r
      } else {\r
        this.showError('获取天气信息失败')\r
      }\r
    } catch (error) {\r
      this.showError('网络请求错误')\r
    }\r
  }\r
  \r
  private displayWeather(data: WeatherResponse) {\r
    document.getElementById('temperature').textContent = \`\${data.temperature}°C\`\r
    document.getElementById('description').textContent = data.description\r
    document.getElementById('humidity').textContent = \`湿度: \${data.humidity}%\`\r
  }\r
  \r
  private showError(message: string) {\r
    console.error('Weather Widget Error:', message)\r
  }\r
}\r
\r
// 带缓存的API调用\r
class DataService {\r
  @ApiFetch.cache('user-data', 5 * 60 * 1000) // 缓存5分钟\r
  async getUserData(userId: string) {\r
    return await ApiFetch.get(\`/api/users/\${userId}\`)\r
  }\r
  \r
  @ApiFetch.cache('app-config', 30 * 60 * 1000) // 缓存30分钟\r
  async getAppConfig() {\r
    return await ApiFetch.get('/api/config')\r
  }\r
}\r
\r
// 请求拦截器示例\r
ApiFetch.addRequestInterceptor((config) => {\r
  // 添加认证头\r
  const token = localStorage.getItem('auth_token')\r
  if (token) {\r
    config.headers = {\r
      ...config.headers,\r
      'Authorization': \`Bearer \${token}\`\r
    }\r
  }\r
  \r
  // 添加时间戳防缓存\r
  if (config.method === 'GET') {\r
    const url = new URL(config.url)\r
    url.searchParams.set('_t', Date.now().toString())\r
    config.url = url.toString()\r
  }\r
  \r
  return config\r
})\r
\r
// 响应拦截器示例\r
ApiFetch.addResponseInterceptor((response) => {\r
  // 统一错误处理\r
  if (!response.success && response.code === 401) {\r
    // 清除认证信息\r
    localStorage.removeItem('auth_token')\r
    // 跳转到登录页面\r
    window.location.href = '/login'\r
  }\r
  \r
  return response\r
})\r
\`\`\`\r
\r
## 通用工具函数 (index.ts)\r
\r
### 实用工具函数集合\r
\r
\`\`\`typescript\r
// 防抖函数\r
export function debounce<T extends (...args: any[]) => any>(\r
  func: T,\r
  wait: number\r
): (...args: Parameters<T>) => void\r
\r
// 节流函数\r
export function throttle<T extends (...args: any[]) => any>(\r
  func: T,\r
  limit: number\r
): (...args: Parameters<T>) => void\r
\r
// 深拷贝\r
export function deepClone<T>(obj: T): T\r
\r
// 对象合并\r
export function merge<T extends object>(target: T, ...sources: Partial<T>[]): T\r
\r
// 格式化文件大小\r
export function formatFileSize(bytes: number): string\r
\r
// 生成唯一ID\r
export function generateId(prefix?: string): string\r
\r
// 类型检查\r
export function isObject(value: any): value is object\r
export function isArray(value: any): value is any[]\r
export function isFunction(value: any): value is Function\r
export function isString(value: any): value is string\r
export function isNumber(value: any): value is number\r
\r
// 数组工具\r
export function chunk<T>(array: T[], size: number): T[][]\r
export function unique<T>(array: T[]): T[]\r
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]>\r
\r
// 字符串工具\r
export function capitalize(str: string): string\r
export function camelCase(str: string): string\r
export function kebabCase(str: string): string\r
export function truncate(str: string, length: number, ellipsis?: string): string\r
\r
// 数字工具\r
export function random(min: number, max: number): number\r
export function clamp(value: number, min: number, max: number): number\r
export function formatNumber(num: number, decimals?: number): string\r
\r
// DOM工具\r
export function $(selector: string): HTMLElement | null\r
export function $$(selector: string): NodeListOf<HTMLElement>\r
export function addClass(element: HTMLElement, className: string): void\r
export function removeClass(element: HTMLElement, className: string): void\r
export function toggleClass(element: HTMLElement, className: string): void\r
\r
// 存储工具\r
export function setStorage(key: string, value: any): void\r
export function getStorage(key: string): any\r
export function removeStorage(key: string): void\r
\r
// 事件工具\r
export function on(element: EventTarget, event: string, handler: EventListener): void\r
export function off(element: EventTarget, event: string, handler: EventListener): void\r
export function once(element: EventTarget, event: string, handler: EventListener): void\r
\r
// 异步工具\r
export function sleep(ms: number): Promise<void>\r
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T>\r
export function retry<T>(fn: () => Promise<T>, times: number): Promise<T>\r
\`\`\`\r
\r
#### 实际使用示例\r
\r
\`\`\`typescript\r
import {\r
  debounce, throttle, deepClone, formatFileSize,\r
  generateId, chunk, capitalize, random, sleep\r
} from '@/utils'\r
\r
// 防抖搜索\r
class SearchBox {\r
  private searchInput: HTMLInputElement\r
  \r
  constructor(input: HTMLInputElement) {\r
    this.searchInput = input\r
    this.setupSearch()\r
  }\r
  \r
  private setupSearch() {\r
    const debouncedSearch = debounce(this.performSearch.bind(this), 300)\r
    this.searchInput.addEventListener('input', debouncedSearch)\r
  }\r
  \r
  private async performSearch() {\r
    const query = this.searchInput.value.trim()\r
    if (query) {\r
      console.log('搜索:', query)\r
      // 执行搜索逻辑\r
    }\r
  }\r
}\r
\r
// 节流滚动\r
class ScrollManager {\r
  constructor() {\r
    const throttledScroll = throttle(this.handleScroll.bind(this), 100)\r
    window.addEventListener('scroll', throttledScroll)\r
  }\r
  \r
  private handleScroll() {\r
    const scrollPercent = window.scrollY / \r
      (document.body.scrollHeight - window.innerHeight)\r
    console.log('滚动进度:', Math.round(scrollPercent * 100) + '%')\r
  }\r
}\r
\r
// 文件处理示例\r
class FileManager {\r
  displayFileInfo(file: File) {\r
    return {\r
      id: generateId('file'),\r
      name: file.name,\r
      size: formatFileSize(file.size),\r
      type: file.type,\r
      lastModified: new Date(file.lastModified)\r
    }\r
  }\r
  \r
  async processFiles(files: File[]) {\r
    // 按大小分组\r
    const fileGroups = chunk(files, 10) // 每组10个文件\r
    \r
    for (const group of fileGroups) {\r
      await this.processFileGroup(group)\r
      await sleep(100) // 避免阻塞UI\r
    }\r
  }\r
  \r
  private async processFileGroup(files: File[]) {\r
    const promises = files.map(file => this.processFile(file))\r
    await Promise.all(promises)\r
  }\r
  \r
  private async processFile(file: File): Promise<void> {\r
    console.log(\`处理文件: \${file.name} (\${formatFileSize(file.size)})\`)\r
    // 处理逻辑\r
  }\r
}\r
\r
// 数据处理示例\r
class DataProcessor {\r
  processUserData(users: any[]) {\r
    // 按部门分组\r
    const usersByDept = groupBy(users, 'department')\r
    \r
    // 处理每个部门的数据\r
    const result = Object.entries(usersByDept).map(([dept, deptUsers]) => ({\r
      department: capitalize(dept),\r
      count: deptUsers.length,\r
      users: deptUsers.map(user => ({\r
        ...user,\r
        displayName: capitalize(user.name)\r
      }))\r
    }))\r
    \r
    return result\r
  }\r
  \r
  generateReport(data: any[]) {\r
    const reportId = generateId('report')\r
    const summary = {\r
      id: reportId,\r
      totalRecords: data.length,\r
      generatedAt: new Date(),\r
      statistics: this.calculateStatistics(data)\r
    }\r
    \r
    return summary\r
  }\r
  \r
  private calculateStatistics(data: any[]) {\r
    // 统计计算逻辑\r
    return {\r
      average: data.reduce((sum, item) => sum + item.value, 0) / data.length,\r
      min: Math.min(...data.map(item => item.value)),\r
      max: Math.max(...data.map(item => item.value))\r
    }\r
  }\r
}\r
\r
// 配置管理示例\r
class ConfigManager {\r
  private defaultConfig = {\r
    theme: 'default',\r
    language: 'zh-CN',\r
    autoSave: true,\r
    debugMode: false\r
  }\r
  \r
  loadConfig() {\r
    const savedConfig = getStorage('app-config') || {}\r
    return merge(deepClone(this.defaultConfig), savedConfig)\r
  }\r
  \r
  saveConfig(config: any) {\r
    const mergedConfig = merge(this.loadConfig(), config)\r
    setStorage('app-config', mergedConfig)\r
    return mergedConfig\r
  }\r
  \r
  resetConfig() {\r
    removeStorage('app-config')\r
    return deepClone(this.defaultConfig)\r
  }\r
}\r
\`\`\`\r
\r
## 工具函数最佳实践\r
\r
### 1. 性能优化\r
\r
\`\`\`typescript\r
// 使用防抖优化频繁操作\r
const optimizedResize = debounce(() => {\r
  // 重新计算布局\r
  recalculateLayout()\r
}, 250)\r
\r
window.addEventListener('resize', optimizedResize)\r
\r
// 使用节流优化滚动事件\r
const optimizedScroll = throttle(() => {\r
  // 更新滚动位置指示器\r
  updateScrollIndicator()\r
}, 16) // 60fps\r
\r
window.addEventListener('scroll', optimizedScroll)\r
\`\`\`\r
\r
### 2. 错误处理\r
\r
\`\`\`typescript\r
// 带错误处理的工具函数\r
const safeParseJSON = (str: string, defaultValue: any = null) => {\r
  try {\r
    return JSON.parse(str)\r
  } catch (error) {\r
    console.warn('JSON解析失败:', error)\r
    return defaultValue\r
  }\r
}\r
\r
// 异步操作的错误处理\r
const safeAsyncOperation = async <T>(\r
  operation: () => Promise<T>,\r
  fallback: T\r
): Promise<T> => {\r
  try {\r
    return await operation()\r
  } catch (error) {\r
    console.error('异步操作失败:', error)\r
    return fallback\r
  }\r
}\r
\`\`\`\r
\r
### 3. 类型安全\r
\r
\`\`\`typescript\r
// 类型安全的工具函数\r
function typedLocalStorage<T>(key: string, defaultValue: T) {\r
  return {\r
    get(): T {\r
      const item = localStorage.getItem(key)\r
      return item ? JSON.parse(item) : defaultValue\r
    },\r
    \r
    set(value: T): void {\r
      localStorage.setItem(key, JSON.stringify(value))\r
    },\r
    \r
    remove(): void {\r
      localStorage.removeItem(key)\r
    }\r
  }\r
}\r
\r
// 使用示例\r
const userSettings = typedLocalStorage('user-settings', {\r
  theme: 'default' as 'default' | 'dark',\r
  fontSize: 14,\r
  autoSave: true\r
})\r
\r
const settings = userSettings.get() // 类型安全\r
userSettings.set({ theme: 'dark', fontSize: 16, autoSave: false })\r
\`\`\`\r
\r
这份工具函数详解基于MeowOS的实际工具代码编写，提供了完整的函数说明和实用示例。\r
`;export{r as default};
