# MeowOS 🐱

一个基于Vue3的现代化虚拟桌面系统，提供完整的桌面体验和高度可定制化的功能。

![MeowOS](https://via.placeholder.com/800x400/667eea/ffffff?text=MeowOS)

## ✨ 特性

### 🎨 主题系统
- **默认主题**: 清新明亮的浅色界面
- **深色主题**: 护眼的深色界面  
- **毛玻璃主题**: 半透明的现代玻璃效果
- **自定义主题**: 支持用户自定义CSS变量

### 🖼️ 壁纸系统
- 📁 内置精美壁纸
- 🎨 纯色背景
- 🌈 渐变背景
- 🌐 网络图片URL
- 📱 本地图片上传

### 🖥️ 内置应用
- **🖥️ 终端**: 完整的命令行界面
- **🎨 主题设置**: 可视化主题切换
- **🖼️ 壁纸设置**: 丰富的背景自定义
- **✏️ 绘图板**: 功能完整的绘图工具
- **📝 记事本**: 简单的文本编辑器

### 🏗️ 窗口管理
- 🖱️ 窗口拖拽、调整大小
- 📐 最小化/最大化/关闭
- 📊 智能任务栏管理
- ✨ 流畅的窗口动画

### ⚡ 高性能
- 🚀 基于Vue3 Composition API
- 💾 本地存储系统
- 🔄 响应式状态管理
- 📱 移动端适配

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/Bytestring0/MeowOS.git
cd MeowOS

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🎯 在线体验

访问 [MeowOS Demo](https://bytestring0.github.io/MeowOS/) 在线体验完整功能。

## 📖 使用指南

详细的使用和自定义指南请查看 [USAGE.md](./USAGE.md)

### 基础使用

1. **桌面操作**: 双击应用图标打开应用
2. **窗口管理**: 拖拽移动窗口，点击按钮控制窗口状态
3. **任务栏**: 点击任务栏项目切换窗口，快捷按钮快速访问系统功能
4. **主题切换**: 通过主题设置应用或任务栏快捷按钮
5. **终端命令**: 输入`help`查看所有可用命令

### 自定义配置

```typescript
import { system } from '@/core/api/system';

system.setUserConfig({
  themes: [/* 自定义主题 */],
  wallpapers: [/* 自定义壁纸 */],
  windowAnimations: {/* 自定义动画 */}
});
```

## 🛠️ 技术栈

- **Frontend**: Vue 3 + TypeScript + Vite
- **State Management**: Pinia + Reactive API
- **Styling**: CSS3 + CSS Variables
- **Storage**: IndexedDB
- **Build**: Vite + ESBuild

## 📁 项目结构

```
src/
├── core/                 # 核心系统
│   ├── api/             # 系统API (system.ts, storage.ts)
│   ├── desktop/         # 桌面组件 (Desktop.vue, Window.vue, Taskbar.vue)
│   ├── services/        # 系统服务 (eventBus.ts)
│   └── types/           # 类型定义 (system.ts)
├── system-apps/         # 系统应用
│   ├── terminal/        # 终端应用
│   ├── theme/           # 主题设置
│   ├── wallpaper/       # 壁纸设置
│   ├── paint/           # 绘图板
│   └── notes/           # 记事本
├── config/              # 配置文件 (system.ts)
└── assets/              # 资源文件 (styles/, icons/)
```

## 🔧 开发指南

### 创建新应用

1. 在`src/system-apps/`下创建应用目录
2. 添加`manifest.json`应用清单
3. 创建Vue组件文件
4. 系统会自动扫描并加载

### API参考

#### 系统管理
```typescript
// 窗口管理
system.openApp(appId)
system.closeApp(appId)
system.minimizeWindow(windowId)
system.maximizeWindow(windowId)

// 主题管理
system.setTheme(themeId)
system.applyTheme(themeId)

// 壁纸管理
system.setWallpaper(wallpaper)
```

#### 事件系统
```typescript
import { eventBus, SystemEvents } from '@/core/services/eventBus';

eventBus.on(SystemEvents.ThemeChanged, callback)
eventBus.on(SystemEvents.WindowOpened, callback)
```

## 🎨 主题开发

创建自定义主题：

```typescript
const myTheme = {
  id: 'my-theme',
  name: '我的主题',
  variables: {
    '--primary-color': '#ff6b6b',
    '--bg-color': '#f8f9fa',
    '--text-color': '#333333'
  },
  effects: {
    windowBlur: true,
    translucency: 0.8
  }
};
```

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- Vue.js 团队提供优秀的框架
- 所有为开源社区做出贡献的开发者

---

**Made with ❤️ by [Bytestring0](https://github.com/Bytestring0)**