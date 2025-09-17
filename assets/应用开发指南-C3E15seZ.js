const r=`# 应用开发指南\r
\r
详细的应用开发流程和窗口适配指南。\r
\r
## 应用架构\r
\r
### 基础应用结构\r
\r
MeowOS应用由三部分组成：\r
\r
1. **Vue组件**：应用的界面实现\r
2. **TypeScript类**：应用的业务逻辑 \r
3. **manifest.json**：应用配置清单\r
\r
### 项目结构\r
\r
\`\`\`\r
src/system-apps/my-app/\r
├── manifest.json        # 应用配置\r
├── MyApp.vue           # 界面组件\r
└── MyApp.ts            # 业务逻辑\r
\`\`\`\r
\r
## 创建新应用\r
\r
### 1. 创建应用目录\r
\r
在\`src/system-apps/\`下创建应用文件夹：\r
\r
\`\`\`\r
mkdir src/system-apps/my-calculator\r
cd src/system-apps/my-calculator\r
\`\`\`\r
\r
### 2. 编写manifest.json\r
\r
\`\`\`json\r
{\r
  "id": "my-calculator",\r
  "name": "计算器",\r
  "description": "简单的计算器应用",\r
  "version": "1.0.0",\r
  "icon": "icons/calculator.svg",\r
  "type": "app",\r
  "entry": "MyCalculator",\r
  "singleInstance": true,\r
  "showOnDesktop": true,\r
  "permissions": ["storage"]\r
}\r
\`\`\`\r
\r
配置说明：\r
- \`id\`: 唯一标识，建议使用kebab-case\r
- \`singleInstance\`: 是否单例模式，推荐设为true\r
- \`entry\`: 组件名，必须与Vue组件的name一致\r
- \`permissions\`: 权限列表，可选值：storage、audio、network\r
\r
### 3. 创建Vue组件\r
\r
**MyCalculator.vue:**\r
\r
\`\`\`vue\r
<template>\r
  <div class="calculator">\r
    <div class="display">{{ display }}</div>\r
    <div class="buttons">\r
      <button v-for="btn in buttons" :key="btn"\r
              @click="handleInput(btn)"\r
              :class="getButtonClass(btn)">\r
        {{ btn }}\r
      </button>\r
    </div>\r
  </div>\r
</template>\r
\r
<script lang="ts">\r
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'\r
import { MyCalculatorApp } from './MyCalculator'\r
\r
export default defineComponent({\r
  name: 'MyCalculator',\r
  setup() {\r
    const calculator = new MyCalculatorApp()\r
    const display = ref('0')\r
    \r
    const buttons = [\r
      'C', '±', '%', '÷',\r
      '7', '8', '9', '×',\r
      '4', '5', '6', '-',\r
      '1', '2', '3', '+',\r
      '0', '.', '='\r
    ]\r
    \r
    const handleInput = (input: string) => {\r
      const result = calculator.handleInput(input)\r
      display.value = result\r
    }\r
    \r
    const getButtonClass = (btn: string) => {\r
      if (['C', '±', '%'].includes(btn)) return 'btn-function'\r
      if (['÷', '×', '-', '+', '='].includes(btn)) return 'btn-operator'\r
      return 'btn-number'\r
    }\r
    \r
    // 键盘支持\r
    const handleKeydown = (event: KeyboardEvent) => {\r
      const keyMap: Record<string, string> = {\r
        'Enter': '=',\r
        'Escape': 'C',\r
        '/': '÷',\r
        '*': '×'\r
      }\r
      \r
      const key = keyMap[event.key] || event.key\r
      if (buttons.includes(key)) {\r
        handleInput(key)\r
      }\r
    }\r
    \r
    onMounted(() => {\r
      calculator.init()\r
      window.addEventListener('keydown', handleKeydown)\r
    })\r
    \r
    onUnmounted(() => {\r
      window.removeEventListener('keydown', handleKeydown)\r
      calculator.destroy()\r
    })\r
    \r
    return {\r
      display,\r
      buttons,\r
      handleInput,\r
      getButtonClass\r
    }\r
  }\r
})\r
<\/script>\r
\r
<style scoped>\r
.calculator {\r
  width: 100%;\r
  height: 100%;\r
  display: flex;\r
  flex-direction: column;\r
  background: var(--surface-color);\r
  border-radius: 8px;\r
  overflow: hidden;\r
}\r
\r
.display {\r
  flex: 1;\r
  display: flex;\r
  align-items: center;\r
  justify-content: flex-end;\r
  padding: 20px;\r
  font-size: 2rem;\r
  font-weight: 300;\r
  background: var(--surface-variant-color);\r
  color: var(--on-surface-color);\r
  min-height: 60px;\r
}\r
\r
.buttons {\r
  display: grid;\r
  grid-template-columns: repeat(4, 1fr);\r
  gap: 1px;\r
  background: var(--outline-color);\r
}\r
\r
button {\r
  height: 60px;\r
  border: none;\r
  background: var(--surface-color);\r
  color: var(--on-surface-color);\r
  font-size: 1.2rem;\r
  cursor: pointer;\r
  transition: background-color 0.2s;\r
}\r
\r
button:hover {\r
  background: var(--surface-variant-color);\r
}\r
\r
button:active {\r
  background: var(--primary-color);\r
  color: var(--on-primary-color);\r
}\r
\r
.btn-function {\r
  background: var(--secondary-color);\r
  color: var(--on-secondary-color);\r
}\r
\r
.btn-operator {\r
  background: var(--primary-color);\r
  color: var(--on-primary-color);\r
}\r
\r
.btn-number:nth-child(17) {\r
  grid-column: span 2;\r
}\r
</style>\r
\`\`\`\r
\r
### 4. 创建业务逻辑类\r
\r
**MyCalculator.ts:**\r
\r
\`\`\`typescript\r
import { storage, eventBus, SystemEvents } from '@/core/api'\r
\r
export class MyCalculatorApp {\r
  private currentValue: number = 0\r
  private previousValue: number = 0\r
  private operator: string | null = null\r
  private waitingForNewValue: boolean = false\r
  private history: string[] = []\r
\r
  constructor() {\r
    this.loadHistory()\r
  }\r
\r
  async init() {\r
    // 监听主题变化\r
    eventBus.on(SystemEvents.ThemeChanged, this.onThemeChanged)\r
    \r
    // 恢复上次的计算状态\r
    const lastState = await storage.getAppSetting('my-calculator', 'lastState')\r
    if (lastState) {\r
      this.currentValue = lastState.currentValue || 0\r
      this.previousValue = lastState.previousValue || 0\r
      this.operator = lastState.operator || null\r
    }\r
  }\r
\r
  destroy() {\r
    eventBus.off(SystemEvents.ThemeChanged, this.onThemeChanged)\r
    this.saveState()\r
  }\r
\r
  handleInput(input: string): string {\r
    switch (input) {\r
      case 'C':\r
        return this.clear()\r
      case '±':\r
        return this.toggleSign()\r
      case '%':\r
        return this.percentage()\r
      case '=':\r
        return this.calculate()\r
      case '+':\r
      case '-':\r
      case '×':\r
      case '÷':\r
        return this.setOperator(input)\r
      case '.':\r
        return this.addDecimal()\r
      default:\r
        if (/^\\d$/.test(input)) {\r
          return this.addDigit(input)\r
        }\r
        break\r
    }\r
    return this.getDisplayValue()\r
  }\r
\r
  private clear(): string {\r
    this.currentValue = 0\r
    this.previousValue = 0\r
    this.operator = null\r
    this.waitingForNewValue = false\r
    return '0'\r
  }\r
\r
  private toggleSign(): string {\r
    this.currentValue = -this.currentValue\r
    return this.getDisplayValue()\r
  }\r
\r
  private percentage(): string {\r
    this.currentValue = this.currentValue / 100\r
    return this.getDisplayValue()\r
  }\r
\r
  private addDigit(digit: string): string {\r
    if (this.waitingForNewValue) {\r
      this.currentValue = parseFloat(digit)\r
      this.waitingForNewValue = false\r
    } else {\r
      const current = this.getDisplayValue()\r
      this.currentValue = parseFloat(current === '0' ? digit : current + digit)\r
    }\r
    return this.getDisplayValue()\r
  }\r
\r
  private addDecimal(): string {\r
    const current = this.getDisplayValue()\r
    if (current.indexOf('.') === -1) {\r
      return this.waitingForNewValue ? '0.' : current + '.'\r
    }\r
    return current\r
  }\r
\r
  private setOperator(op: string): string {\r
    if (this.operator && !this.waitingForNewValue) {\r
      this.calculate()\r
    }\r
    \r
    this.previousValue = this.currentValue\r
    this.operator = op\r
    this.waitingForNewValue = true\r
    \r
    return this.getDisplayValue()\r
  }\r
\r
  private calculate(): string {\r
    if (!this.operator || this.waitingForNewValue) {\r
      return this.getDisplayValue()\r
    }\r
\r
    let result: number\r
    const prev = this.previousValue\r
    const current = this.currentValue\r
\r
    switch (this.operator) {\r
      case '+':\r
        result = prev + current\r
        break\r
      case '-':\r
        result = prev - current\r
        break\r
      case '×':\r
        result = prev * current\r
        break\r
      case '÷':\r
        result = current !== 0 ? prev / current : 0\r
        break\r
      default:\r
        return this.getDisplayValue()\r
    }\r
\r
    // 记录计算历史\r
    const expression = \`\${prev} \${this.operator} \${current} = \${result}\`\r
    this.addToHistory(expression)\r
\r
    this.currentValue = result\r
    this.operator = null\r
    this.waitingForNewValue = true\r
\r
    return this.getDisplayValue()\r
  }\r
\r
  private getDisplayValue(): string {\r
    const value = this.currentValue.toString()\r
    \r
    // 处理小数位数\r
    if (value.includes('.')) {\r
      const [integer, decimal] = value.split('.')\r
      if (decimal.length > 8) {\r
        return parseFloat(this.currentValue.toFixed(8)).toString()\r
      }\r
    }\r
    \r
    // 处理大数显示\r
    if (Math.abs(this.currentValue) >= 1e10) {\r
      return this.currentValue.toExponential(3)\r
    }\r
    \r
    return value\r
  }\r
\r
  private async addToHistory(expression: string) {\r
    this.history.unshift(expression)\r
    if (this.history.length > 50) {\r
      this.history = this.history.slice(0, 50)\r
    }\r
    await storage.setAppSetting('my-calculator', 'history', this.history)\r
  }\r
\r
  private async loadHistory() {\r
    const saved = await storage.getAppSetting('my-calculator', 'history')\r
    if (saved && Array.isArray(saved)) {\r
      this.history = saved\r
    }\r
  }\r
\r
  private async saveState() {\r
    await storage.setAppSetting('my-calculator', 'lastState', {\r
      currentValue: this.currentValue,\r
      previousValue: this.previousValue,\r
      operator: this.operator\r
    })\r
  }\r
\r
  private onThemeChanged = (theme: string) => {\r
    console.log(\`计算器适配新主题: \${theme}\`)\r
    // 这里可以添加主题适配逻辑\r
  }\r
\r
  getHistory(): string[] {\r
    return [...this.history]\r
  }\r
}\r
\`\`\`\r
\r
## 窗口适配指南\r
\r
### 父窗口通信\r
\r
所有应用都运行在Window组件内，可以通过以下方式与父窗口通信：\r
\r
#### 1. 窗口标题更新\r
\r
\`\`\`typescript\r
// 在应用内更新窗口标题\r
const updateTitle = (newTitle: string) => {\r
  const windowElement = document.querySelector('.window')\r
  if (windowElement) {\r
    const titleElement = windowElement.querySelector('.window-title')\r
    if (titleElement) {\r
      titleElement.textContent = newTitle\r
    }\r
  }\r
}\r
\`\`\`\r
\r
#### 2. 窗口状态监听\r
\r
\`\`\`typescript\r
// 监听窗口变化\r
onMounted(() => {\r
  const observer = new MutationObserver((mutations) => {\r
    mutations.forEach((mutation) => {\r
      if (mutation.attributeName === 'class') {\r
        const target = mutation.target as HTMLElement\r
        if (target.classList.contains('minimized')) {\r
          console.log('窗口被最小化')\r
        }\r
        if (target.classList.contains('maximized')) {\r
          console.log('窗口被最大化')\r
        }\r
      }\r
    })\r
  })\r
  \r
  const windowElement = document.querySelector('.window')\r
  if (windowElement) {\r
    observer.observe(windowElement, { attributes: true })\r
  }\r
  \r
  onUnmounted(() => {\r
    observer.disconnect()\r
  })\r
})\r
\`\`\`\r
\r
#### 3. 响应式布局\r
\r
\`\`\`vue\r
<template>\r
  <div class="app-container" :class="{ \r
    'is-maximized': isMaximized,\r
    'is-mobile': isMobile \r
  }">\r
    <!-- 应用内容 -->\r
  </div>\r
</template>\r
\r
<script setup>\r
import { ref, onMounted, onUnmounted } from 'vue'\r
\r
const isMaximized = ref(false)\r
const isMobile = ref(false)\r
\r
const updateLayout = () => {\r
  const windowElement = document.querySelector('.window')\r
  if (windowElement) {\r
    isMaximized.value = windowElement.classList.contains('maximized')\r
    const rect = windowElement.getBoundingClientRect()\r
    isMobile.value = rect.width < 600\r
  }\r
}\r
\r
onMounted(() => {\r
  updateLayout()\r
  window.addEventListener('resize', updateLayout)\r
})\r
\r
onUnmounted(() => {\r
  window.removeEventListener('resize', updateLayout)\r
})\r
<\/script>\r
\r
<style scoped>\r
.app-container {\r
  width: 100%;\r
  height: 100%;\r
  display: flex;\r
  flex-direction: column;\r
}\r
\r
.is-maximized {\r
  padding: 20px;\r
}\r
\r
.is-mobile {\r
  padding: 10px;\r
}\r
\r
.is-mobile .toolbar {\r
  flex-wrap: wrap;\r
}\r
</style>\r
\`\`\`\r
\r
### 窗口生命周期\r
\r
\`\`\`typescript\r
export class MyApp {\r
  private isActive: boolean = true\r
  private windowObserver?: MutationObserver\r
\r
  init() {\r
    this.setupWindowObserver()\r
  }\r
\r
  destroy() {\r
    this.windowObserver?.disconnect()\r
  }\r
\r
  private setupWindowObserver() {\r
    const windowElement = document.querySelector('.window')\r
    if (!windowElement) return\r
\r
    this.windowObserver = new MutationObserver((mutations) => {\r
      mutations.forEach((mutation) => {\r
        if (mutation.attributeName === 'class') {\r
          const classList = (mutation.target as HTMLElement).classList\r
          \r
          if (classList.contains('minimized')) {\r
            this.onWindowMinimized()\r
          } else if (classList.contains('focused')) {\r
            this.onWindowFocused()\r
          } else {\r
            this.onWindowBlurred()\r
          }\r
        }\r
      })\r
    })\r
\r
    this.windowObserver.observe(windowElement, { \r
      attributes: true, \r
      attributeFilter: ['class'] \r
    })\r
  }\r
\r
  private onWindowMinimized() {\r
    this.isActive = false\r
    // 暂停动画、停止计时器等\r
  }\r
\r
  private onWindowFocused() {\r
    this.isActive = true\r
    // 恢复动画、重启计时器等\r
  }\r
\r
  private onWindowBlurred() {\r
    this.isActive = false\r
    // 可选：减少资源使用\r
  }\r
}\r
\`\`\`\r
\r
## 应用注册\r
\r
应用会被系统自动发现和注册，只需要：\r
\r
1. 在\`src/system-apps/\`下创建应用目录\r
2. 包含有效的\`manifest.json\`\r
3. 系统会通过Vite的\`import.meta.glob\`自动扫描\r
\r
### 自动发现机制\r
\r
系统使用以下模式扫描应用：\r
\r
\`\`\`typescript\r
// system.ts中的自动发现代码\r
const manifestModules = import.meta.glob('/src/system-apps/*/manifest.json')\r
const componentModules = import.meta.glob('/src/system-apps/*/*.vue')\r
\`\`\`\r
\r
确保：\r
- 应用目录直接在\`system-apps\`下\r
- \`manifest.json\`在应用根目录\r
- Vue组件文件名与\`entry\`字段匹配\r
\r
## 应用间通信\r
\r
### 事件总线\r
\r
\`\`\`typescript\r
// 发送方\r
eventBus.emit('custom-message', { \r
  from: 'my-calculator',\r
  data: '计算结果：42'\r
})\r
\r
// 接收方\r
eventBus.on('custom-message', (message) => {\r
  console.log('收到消息:', message)\r
})\r
\`\`\`\r
\r
### 共享存储\r
\r
\`\`\`typescript\r
// 应用A：保存共享数据\r
await storage.set('shared-clipboard', {\r
  type: 'text',\r
  content: 'Hello World',\r
  timestamp: Date.now()\r
})\r
\r
// 应用B：读取共享数据\r
const clipboardData = await storage.get('shared-clipboard')\r
if (clipboardData) {\r
  console.log('剪贴板内容:', clipboardData.content)\r
}\r
\`\`\`\r
\r
### LocalStorage桥接\r
\r
\`\`\`typescript\r
// 用于简单的应用间通信\r
const sendToApp = (targetApp: string, data: any) => {\r
  localStorage.setItem(\`app-message-\${targetApp}\`, JSON.stringify({\r
    from: 'my-app',\r
    data,\r
    timestamp: Date.now()\r
  }))\r
  \r
  window.dispatchEvent(new CustomEvent('app-message', {\r
    detail: { target: targetApp, data }\r
  }))\r
}\r
\r
// 监听来自其他应用的消息\r
window.addEventListener('app-message', (event) => {\r
  if (event.detail.target === 'my-app') {\r
    console.log('收到消息:', event.detail.data)\r
  }\r
})\r
\`\`\`\r
\r
## 性能优化\r
\r
### 懒加载\r
\r
\`\`\`vue\r
<script setup>\r
import { defineAsyncComponent } from 'vue'\r
\r
// 重型组件懒加载\r
const HeavyChart = defineAsyncComponent(() => \r
  import('./components/HeavyChart.vue')\r
)\r
\r
const showChart = ref(false)\r
<\/script>\r
\r
<template>\r
  <div>\r
    <button @click="showChart = true">显示图表</button>\r
    <HeavyChart v-if="showChart" />\r
  </div>\r
</template>\r
\`\`\`\r
\r
### 内存管理\r
\r
\`\`\`typescript\r
export class MyApp {\r
  private timers: number[] = []\r
  private eventListeners: Array<{\r
    element: EventTarget;\r
    event: string;\r
    handler: EventListener;\r
  }> = []\r
\r
  addTimer(callback: () => void, delay: number): number {\r
    const id = window.setTimeout(callback, delay)\r
    this.timers.push(id)\r
    return id\r
  }\r
\r
  addEventListener(element: EventTarget, event: string, handler: EventListener) {\r
    element.addEventListener(event, handler)\r
    this.eventListeners.push({ element, event, handler })\r
  }\r
\r
  destroy() {\r
    // 清理定时器\r
    this.timers.forEach(id => clearTimeout(id))\r
    this.timers = []\r
    \r
    // 清理事件监听器\r
    this.eventListeners.forEach(({ element, event, handler }) => {\r
      element.removeEventListener(event, handler)\r
    })\r
    this.eventListeners = []\r
  }\r
}\r
\`\`\`\r
\r
这份指南基于实际的MeowOS架构编写，所有示例代码都可以直接使用。\r
`;export{r as default};
