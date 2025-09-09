# MeowOS 系统配置指南

MeowOS是一个高度可定制的虚拟桌面系统，基于Vue.js构建。

## 功能特性

### 🎨 主题系统
- **默认主题**: 清新明亮的浅色界面
- **深色主题**: 护眼的深色界面  
- **毛玻璃主题**: 半透明的现代玻璃效果

### 🖼️ 壁纸系统
- 内置壁纸
- 纯色背景
- 渐变背景
- 网络图片URL
- 本地图片上传

### 🖥️ 系统应用
- **终端**: 完整的命令行界面，支持系统命令
- **主题设置**: 可视化主题切换和窗口效果配置
- **壁纸设置**: 丰富的背景自定义选项
- **绘图板**: 功能完整的绘图工具
- **记事本**: 简单的文本编辑器

### 🏗️ 窗口管理
- 窗口拖拽、调整大小
- 最小化/最大化/关闭
- 任务栏管理
- 窗口动画效果

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 系统自定义

### 1. 用户配置

在你的应用入口文件中，你可以通过`system.setUserConfig()`来自定义系统行为：

```typescript
import { system } from '@/core/api/system';

// 自定义配置
system.setUserConfig({
  // 自定义主题
  themes: [
    {
      id: 'my-theme',
      name: '我的主题',
      variables: {
        '--primary-color': '#ff6b6b',
        '--bg-color': '#f8f9fa'
      }
    }
  ],
  
  // 自定义壁纸
  wallpapers: [
    {
      id: 'my-wallpaper',
      name: '我的壁纸',
      type: 'url',
      value: 'https://example.com/my-wallpaper.jpg'
    }
  ],
  
  // 自定义动画
  windowAnimations: {
    open: 'fade-in 0.5s ease-out',
    close: 'fade-out 0.3s ease-in'
  },
  
  // 任务栏配置
  taskbar: {
    height: 60,
    position: 'bottom'
  }
});
```

### 2. 创建自定义应用

在`src/system-apps/`目录下创建新的应用：

```
src/system-apps/my-app/
├── manifest.json      # 应用清单
├── MyApp.vue         # 主组件
└── MyApp.ts          # 业务逻辑（可选）
```

#### manifest.json 示例：
```json
{
  "id": "my-app",
  "name": "我的应用",
  "description": "这是一个自定义应用",
  "version": "1.0.0",
  "icon": "/icons/my-app.svg",
  "type": "app",
  "entry": "MyApp"
}
```

#### MyApp.vue 示例：
```vue
<template>
  <div class="my-app">
    <h1>我的自定义应用</h1>
    <p>这里是应用内容</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 你的应用逻辑
const message = ref('Hello MeowOS!');
</script>

<style scoped>
.my-app {
  padding: 20px;
  height: 100%;
  background: var(--bg-color);
  color: var(--text-color);
}
</style>
```

### 3. 系统API

#### 窗口管理
```typescript
import { system } from '@/core/api/system';

// 打开应用
system.openApp('my-app');

// 关闭应用
system.closeApp('my-app');

// 聚焦窗口
system.focusWindow('window-id');

// 最小化/最大化
system.minimizeWindow('window-id');
system.maximizeWindow('window-id');
```

#### 主题管理
```typescript
// 切换主题
system.setTheme('dark');

// 获取当前主题
const currentTheme = system.theme;

// 应用主题
system.applyTheme('glass');
```

#### 壁纸管理
```typescript
// 设置壁纸
system.setWallpaper('/path/to/wallpaper.jpg');
system.setWallpaper('#ff6b6b'); // 纯色
system.setWallpaper('linear-gradient(45deg, #ff6b6b, #4ecdc4)'); // 渐变
```

### 4. 事件系统

```typescript
import { eventBus, SystemEvents } from '@/core/services/eventBus';

// 监听系统事件
eventBus.on(SystemEvents.ThemeChanged, (themeId) => {
  console.log('主题已切换到:', themeId);
});

eventBus.on(SystemEvents.WindowOpened, (window) => {
  console.log('窗口已打开:', window);
});

// 发送自定义事件
eventBus.emit('my-custom-event', data);
```

## 终端命令

MeowOS内置终端支持以下命令：

- `help` - 显示帮助信息
- `clear` - 清空终端
- `sysinfo` - 显示系统信息
- `apps` - 列出所有应用
- `windows` - 列出所有窗口
- `open <app-id>` - 打开应用
- `theme <theme-id>` - 切换主题
- `wallpaper <value>` - 设置壁纸
- `echo <text>` - 输出文本

## 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的构建工具
- **Pinia** - Vue状态管理
- **CSS Variables** - 动态主题系统

## 开发指南

### 项目结构
```
src/
├── core/                 # 核心系统
│   ├── api/             # 系统API
│   ├── desktop/         # 桌面组件
│   ├── services/        # 系统服务
│   └── types/           # 类型定义
├── system-apps/         # 系统应用
├── config/              # 配置文件
└── assets/              # 资源文件
```

### 最佳实践

1. **组件设计**: 使用Vue3 Composition API
2. **状态管理**: 通过system service统一管理
3. **样式系统**: 使用CSS变量支持主题切换
4. **类型安全**: 充分利用TypeScript类型系统
5. **模块化**: 每个应用独立开发和部署

## 部署

```bash
# 构建项目
npm run build

# 部署到GitHub Pages
npm run deploy
```

## 贡献

欢迎提交Issue和Pull Request来改进MeowOS！

## 许可证

MIT License
