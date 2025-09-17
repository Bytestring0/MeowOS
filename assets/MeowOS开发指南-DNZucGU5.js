const n=`# MeowOS 开发指南\r
\r
## 项目概述\r
\r
MeowOS是一个基于Vue3 + TypeScript的Web桌面操作系统，采用模块化架构设计。系统包含核心服务、应用框架、窗口管理、文档系统等组件。\r
\r
## 核心架构\r
\r
### 目录结构\r
\`\`\`\r
src/\r
├── core/\r
│   ├── api/              # 核心API服务\r
│   │   ├── system.ts     # 系统服务\r
│   │   ├── storage.ts    # 存储服务  \r
│   │   ├── documents.ts  # 文档系统\r
│   │   ├── systemAudio.ts # 音频服务\r
│   │   └── event.ts      # 事件总线\r
│   ├── desktop/          # 桌面组件\r
│   │   ├── Desktop.vue   # 桌面主界面\r
│   │   ├── Window.vue    # 窗口组件\r
│   │   └── Taskbar.vue   # 任务栏\r
│   └── types/            # 类型定义\r
├── system-apps/          # 系统应用\r
├── system-components/    # 系统组件\r
├── utils/               # 工具函数\r
└── config/              # 配置文件\r
\`\`\`\r
\r
### 应用自动注册机制\r
\r
系统使用Vite的\`import.meta.glob\`自动扫描并注册应用：\r
\r
\`\`\`typescript\r
// Window.ts中的应用注册\r
const modules = import.meta.glob('../../system-apps/*/*.vue', { eager: true })\r
const appRegistry: Record<string, any> = {}\r
\r
for (const path in modules) {\r
  const mod = modules[path] as any\r
  const name = path.split('/').pop()!.replace('.vue', '')\r
  appRegistry[name] = mod.default\r
}\r
\`\`\`\r
\r
## 核心API详解\r
\r
### 系统服务 (system)\r
\r
位置：\`src/core/api/system.ts\`\r
\r
主要功能：\r
- 应用生命周期管理\r
- 窗口状态管理  \r
- 主题切换\r
- 用户配置\r
\r
核心方法：\r
\`\`\`typescript\r
// 打开应用\r
await system.openApp(appId: string, options?: Partial<WindowState>)\r
\r
// 获取应用列表\r
const apps = system.listApps()\r
\r
// 获取窗口列表\r
const windows = system.getWindows()\r
\r
// 主题管理\r
await system.setTheme(themeId: string)\r
\`\`\`\r
\r
### 文档系统 (documentSystem)\r
\r
位置：\`src/core/api/documents.ts\`\r
\r
核心特性：\r
- 自动扫描\`src/documents/\`目录下的Markdown文件\r
- 构建虚拟文件树\r
- 支持内容缓存\r
- 提供搜索功能\r
\r
\`\`\`typescript\r
// 获取文档列表\r
const docs = documentSystem.getDocuments(path: string)\r
\r
// 获取文档内容\r
const content = await documentSystem.getDocumentContent(path: string)\r
\r
// 搜索文档\r
const results = documentSystem.searchDocuments(query: string)\r
\r
// 获取统计信息\r
const stats = documentSystem.getStats()\r
\`\`\`\r
\r
文档扫描实现：\r
\`\`\`typescript\r
// 使用Vite glob扫描Markdown文件\r
const markdownFiles = import.meta.glob('../../documents/**/*.md', { \r
  query: '?raw',\r
  import: 'default',\r
  eager: false \r
});\r
\`\`\`\r
\r
### 存储服务 (storage)\r
\r
位置：\`src/core/api/storage.ts\`\r
\r
支持两种存储方式：\r
- IndexedDB（主要）\r
- localStorage（备用）\r
\r
\`\`\`typescript\r
// 基础存储API\r
await storage.set(key: string, value: any, useIDB?: boolean)\r
const data = await storage.get(key: string, useIDB?: boolean)\r
\r
// 应用专用存储\r
await storage.setAppSetting(appId: string, key: string, value: any)\r
const setting = await storage.getAppSetting(appId: string, key: string)\r
\r
// 系统设置存储\r
await storage.setSystemSetting(key: string, value: any)\r
\`\`\`\r
\r
### 事件系统 (eventBus)\r
\r
位置：\`src/core/api/event.ts\`\r
\r
全局事件总线，支持组件间通信：\r
\r
\`\`\`typescript\r
// 监听事件\r
eventBus.on(event: string, callback: Function)\r
\r
// 发布事件  \r
eventBus.emit(event: string, ...args: any[])\r
\r
// 取消监听\r
eventBus.off(event: string, callback: Function)\r
\r
// 系统预定义事件\r
SystemEvents.ThemeChanged\r
SystemEvents.AppOpened\r
SystemEvents.WindowMinimized\r
\`\`\`\r
\r
## 应用开发详解\r
\r
### 应用结构\r
\r
每个应用包含：\r
1. \`AppName.vue\` - Vue组件\r
2. \`AppName.ts\` - TypeScript逻辑（可选）\r
3. \`manifest.json\` - 应用配置\r
4. 其他资源文件\r
\r
### 应用清单配置\r
\r
以文件阅读器为例：\r
\`\`\`json\r
{\r
  "id": "system-file-reader",\r
  "name": "文件阅读器", \r
  "description": "浏览和管理文档文件",\r
  "version": "1.0.0",\r
  "icon": "icons/notes.svg",\r
  "type": "app",\r
  "entry": "FileReaderApp"\r
}\r
\`\`\`\r
\r
字段说明：\r
- \`id\`: 应用唯一标识\r
- \`name\`: 显示名称\r
- \`entry\`: Vue组件名（必须与文件名匹配）\r
- \`type\`: 应用类型（app/widget/system-component等）\r
\r
### 应用开发模板\r
\r
基础Vue组件结构：\r
\`\`\`vue\r
<template>\r
  <div class="my-app">\r
    <!-- 应用内容 -->\r
  </div>\r
</template>\r
\r
<script setup lang="ts">\r
import { ref, onMounted } from 'vue'\r
import { storage } from '@/core/api/storage'\r
import { eventBus, SystemEvents } from '@/core/api/event'\r
\r
const APP_ID = 'my-app'\r
\r
onMounted(async () => {\r
  // 初始化逻辑\r
})\r
\r
// 响应式样式，使用CSS变量\r
<\/script>\r
\r
<style scoped>\r
.my-app {\r
  height: 100%;\r
  background: var(--bg-color);\r
  color: var(--text-color);\r
}\r
</style>\r
\`\`\`\r
\r
### 实际案例分析：文件阅读器\r
\r
核心功能实现：\r
1. **文档加载**：\r
\`\`\`typescript\r
const loadDocuments = async () => {\r
  documents.value = documentSystem.getDocuments(currentPath.value)\r
  if (currentPath.value === '/') {\r
    recommendedDocs.value = documentSystem.getRecommendedDocuments()\r
  }\r
}\r
\`\`\`\r
\r
2. **文档打开**：\r
\`\`\`typescript\r
const openDocument = async (doc: DocumentItem) => {\r
  if (doc.type === 'directory') {\r
    navigateToPath(doc.path)\r
  } else {\r
    // 检查现有窗口或打开新窗口\r
    const existingWindow = system.getWindows().find(w => \r
      w.id.startsWith('system-text-reader')\r
    )\r
    \r
    if (existingWindow && !existingWindow.isMinimized) {\r
      // 复用窗口\r
      localStorage.setItem('textReader_pendingDocument', \r
        JSON.stringify({ path: doc.path, name: doc.name }))\r
      system.focusWindow(existingWindow.id)\r
    } else {\r
      // 打开新窗口\r
      await system.openApp('system-text-reader', {\r
        title: \`文本阅读器 - \${doc.name}\`\r
      })\r
    }\r
  }\r
}\r
\`\`\`\r
\r
## 主题系统\r
\r
### CSS变量体系\r
\r
使用CSS变量实现主题切换：\r
\`\`\`css\r
:root {\r
  --primary-color: #3b82f6;\r
  --bg-color: #ffffff;\r
  --text-color: #1f2937;\r
  --border-color: #e5e7eb;\r
  --surface-color: #f9fafb;\r
}\r
\`\`\`\r
\r
### 主题配置\r
\r
在\`src/config/user-config.ts\`中定义：\r
\`\`\`typescript\r
export const userConfig: UserConfig = {\r
  defaultTheme: 'light',\r
  themes: [\r
    {\r
      id: 'custom-theme',\r
      name: '自定义主题',\r
      variables: {\r
        '--primary-color': '#ff6b6b',\r
        // 其他变量...\r
      }\r
    }\r
  ]\r
}\r
\`\`\`\r
\r
## 工具函数\r
\r
### 时间工具 (TimeUtils)\r
位置：\`src/utils/time.ts\`\r
\r
### 类型效果 (TypeEffect)  \r
位置：\`src/utils/typeEffect.ts\`\r
\r
### API请求 (ApiFetch)\r
位置：\`src/utils/apiFetch.ts\`\r
\r
## 开发最佳实践\r
\r
### 1. 组件设计\r
- 使用CSS变量保证主题兼容\r
- 响应式布局适配不同屏幕\r
- 合理的生命周期管理\r
\r
### 2. 状态管理\r
- 使用Vue3响应式API\r
- 配合存储服务持久化数据\r
- 通过事件总线解耦组件\r
\r
### 3. 性能优化\r
- 组件懒加载\r
- 内容缓存\r
- 避免不必要的重渲染\r
\r
### 4. 错误处理\r
\`\`\`typescript\r
try {\r
  const data = await storage.get('key')\r
  // 处理数据\r
} catch (error) {\r
  console.error('操作失败:', error)\r
  // 用户友好的错误提示\r
}\r
\`\`\`\r
\r
## 调试技巧\r
\r
### 1. 开发者工具\r
- 使用Vue DevTools查看组件状态\r
- 浏览器控制台检查存储数据\r
- Network面板监控资源加载\r
\r
### 2. 日志调试\r
系统提供详细的控制台日志：\r
\`\`\`typescript\r
console.log('Available markdown files:', Object.keys(markdownFiles))\r
\`\`\`\r
\r
### 3. 状态检查\r
\`\`\`javascript\r
// 控制台直接访问系统服务\r
window.system = system\r
window.documentSystem = documentSystem\r
\`\`\`\r
\r
## 部署说明\r
\r
### 构建命令\r
\`\`\`bash\r
npm run build\r
\`\`\`\r
\r
### 文件结构\r
构建后的文件会输出到\`dist/\`目录，可直接部署到静态文件服务器。\r
\r
这份文档基于实际的代码结构编写，准确反映了MeowOS的真实架构和开发方式。\r
`;export{n as default};
