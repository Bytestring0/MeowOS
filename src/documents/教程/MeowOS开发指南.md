# MeowOS 开发指南

## 项目概述

MeowOS是一个基于Vue3 + TypeScript的Web桌面操作系统，采用模块化架构设计。系统包含核心服务、应用框架、窗口管理、文档系统等组件。

## 核心架构

### 目录结构
```
src/
├── core/
│   ├── api/              # 核心API服务
│   │   ├── system.ts     # 系统服务
│   │   ├── storage.ts    # 存储服务  
│   │   ├── documents.ts  # 文档系统
│   │   ├── systemAudio.ts # 音频服务
│   │   └── event.ts      # 事件总线
│   ├── desktop/          # 桌面组件
│   │   ├── Desktop.vue   # 桌面主界面
│   │   ├── Window.vue    # 窗口组件
│   │   └── Taskbar.vue   # 任务栏
│   └── types/            # 类型定义
├── system-apps/          # 系统应用
├── system-components/    # 系统组件
├── utils/               # 工具函数
└── config/              # 配置文件
```

### 应用自动注册机制

系统使用Vite的`import.meta.glob`自动扫描并注册应用：

```typescript
// Window.ts中的应用注册
const modules = import.meta.glob('../../system-apps/*/*.vue', { eager: true })
const appRegistry: Record<string, any> = {}

for (const path in modules) {
  const mod = modules[path] as any
  const name = path.split('/').pop()!.replace('.vue', '')
  appRegistry[name] = mod.default
}
```

## 核心API详解

### 系统服务 (system)

位置：`src/core/api/system.ts`

主要功能：
- 应用生命周期管理
- 窗口状态管理  
- 主题切换
- 用户配置

核心方法：
```typescript
// 打开应用
await system.openApp(appId: string, options?: Partial<WindowState>)

// 获取应用列表
const apps = system.listApps()

// 获取窗口列表
const windows = system.getWindows()

// 主题管理
await system.setTheme(themeId: string)
```

### 文档系统 (documentSystem)

位置：`src/core/api/documents.ts`

核心特性：
- 自动扫描`src/documents/`目录下的Markdown文件
- 构建虚拟文件树
- 支持内容缓存
- 提供搜索功能

```typescript
// 获取文档列表
const docs = documentSystem.getDocuments(path: string)

// 获取文档内容
const content = await documentSystem.getDocumentContent(path: string)

// 搜索文档
const results = documentSystem.searchDocuments(query: string)

// 获取统计信息
const stats = documentSystem.getStats()
```

文档扫描实现：
```typescript
// 使用Vite glob扫描Markdown文件
const markdownFiles = import.meta.glob('../../documents/**/*.md', { 
  query: '?raw',
  import: 'default',
  eager: false 
});
```

### 存储服务 (storage)

位置：`src/core/api/storage.ts`

支持两种存储方式：
- IndexedDB（主要）
- localStorage（备用）

```typescript
// 基础存储API
await storage.set(key: string, value: any, useIDB?: boolean)
const data = await storage.get(key: string, useIDB?: boolean)

// 应用专用存储
await storage.setAppSetting(appId: string, key: string, value: any)
const setting = await storage.getAppSetting(appId: string, key: string)

// 系统设置存储
await storage.setSystemSetting(key: string, value: any)
```

### 事件系统 (eventBus)

位置：`src/core/api/event.ts`

全局事件总线，支持组件间通信：

```typescript
// 监听事件
eventBus.on(event: string, callback: Function)

// 发布事件  
eventBus.emit(event: string, ...args: any[])

// 取消监听
eventBus.off(event: string, callback: Function)

// 系统预定义事件
SystemEvents.ThemeChanged
SystemEvents.AppOpened
SystemEvents.WindowMinimized
```

## 应用开发详解

### 应用结构

每个应用包含：
1. `AppName.vue` - Vue组件
2. `AppName.ts` - TypeScript逻辑（可选）
3. `manifest.json` - 应用配置
4. 其他资源文件

### 应用清单配置

以文件阅读器为例：
```json
{
  "id": "system-file-reader",
  "name": "文件阅读器", 
  "description": "浏览和管理文档文件",
  "version": "1.0.0",
  "icon": "icons/notes.svg",
  "type": "app",
  "entry": "FileReaderApp"
}
```

字段说明：
- `id`: 应用唯一标识
- `name`: 显示名称
- `entry`: Vue组件名（必须与文件名匹配）
- `type`: 应用类型（app/widget/system-component等）

### 应用开发模板

基础Vue组件结构：
```vue
<template>
  <div class="my-app">
    <!-- 应用内容 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storage } from '@/core/api/storage'
import { eventBus, SystemEvents } from '@/core/api/event'

const APP_ID = 'my-app'

onMounted(async () => {
  // 初始化逻辑
})

// 响应式样式，使用CSS变量
</script>

<style scoped>
.my-app {
  height: 100%;
  background: var(--bg-color);
  color: var(--text-color);
}
</style>
```

### 实际案例分析：文件阅读器

核心功能实现：
1. **文档加载**：
```typescript
const loadDocuments = async () => {
  documents.value = documentSystem.getDocuments(currentPath.value)
  if (currentPath.value === '/') {
    recommendedDocs.value = documentSystem.getRecommendedDocuments()
  }
}
```

2. **文档打开**：
```typescript
const openDocument = async (doc: DocumentItem) => {
  if (doc.type === 'directory') {
    navigateToPath(doc.path)
  } else {
    // 检查现有窗口或打开新窗口
    const existingWindow = system.getWindows().find(w => 
      w.id.startsWith('system-text-reader')
    )
    
    if (existingWindow && !existingWindow.isMinimized) {
      // 复用窗口
      localStorage.setItem('textReader_pendingDocument', 
        JSON.stringify({ path: doc.path, name: doc.name }))
      system.focusWindow(existingWindow.id)
    } else {
      // 打开新窗口
      await system.openApp('system-text-reader', {
        title: `文本阅读器 - ${doc.name}`
      })
    }
  }
}
```

## 主题系统

### CSS变量体系

使用CSS变量实现主题切换：
```css
:root {
  --primary-color: #3b82f6;
  --bg-color: #ffffff;
  --text-color: #1f2937;
  --border-color: #e5e7eb;
  --surface-color: #f9fafb;
}
```

### 主题配置

在`src/config/user-config.ts`中定义：
```typescript
export const userConfig: UserConfig = {
  defaultTheme: 'light',
  themes: [
    {
      id: 'custom-theme',
      name: '自定义主题',
      variables: {
        '--primary-color': '#ff6b6b',
        // 其他变量...
      }
    }
  ]
}
```

## 工具函数

### 时间工具 (TimeUtils)
位置：`src/utils/time.ts`

### 类型效果 (TypeEffect)  
位置：`src/utils/typeEffect.ts`

### API请求 (ApiFetch)
位置：`src/utils/apiFetch.ts`

## 开发最佳实践

### 1. 组件设计
- 使用CSS变量保证主题兼容
- 响应式布局适配不同屏幕
- 合理的生命周期管理

### 2. 状态管理
- 使用Vue3响应式API
- 配合存储服务持久化数据
- 通过事件总线解耦组件

### 3. 性能优化
- 组件懒加载
- 内容缓存
- 避免不必要的重渲染

### 4. 错误处理
```typescript
try {
  const data = await storage.get('key')
  // 处理数据
} catch (error) {
  console.error('操作失败:', error)
  // 用户友好的错误提示
}
```

## 调试技巧

### 1. 开发者工具
- 使用Vue DevTools查看组件状态
- 浏览器控制台检查存储数据
- Network面板监控资源加载

### 2. 日志调试
系统提供详细的控制台日志：
```typescript
console.log('Available markdown files:', Object.keys(markdownFiles))
```

### 3. 状态检查
```javascript
// 控制台直接访问系统服务
window.system = system
window.documentSystem = documentSystem
```

## 部署说明

### 构建命令
```bash
npm run build
```

### 文件结构
构建后的文件会输出到`dist/`目录，可直接部署到静态文件服务器。

这份文档基于实际的代码结构编写，准确反映了MeowOS的真实架构和开发方式。
