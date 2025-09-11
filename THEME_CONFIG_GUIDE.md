# MeowOS 主题配置指南

## 📋 概述

MeowOS 现在支持统一的主题配置系统，用户只需要修改一个配置文件就能完全自定义系统的外观和行为。

## 🎨 主题配置

### 用户配置文件位置
`src/config/user-config.ts` - 这是唯一需要修改的配置文件

### 配置结构

```typescript
export const userConfig: UserConfig = {
  // 🎯 基本设置
  defaultTheme: 'light',              // 默认主题
  enableWindowShadow: true,           // 窗口阴影
  enableGlassEffect: false,           // 毛玻璃效果
  
  // 🎨 自定义主题
  themes: [
    {
      id: 'my-theme',                 // 主题ID（唯一）
      name: '我的主题',                // 主题显示名称
      variables: {
        // 完整的CSS变量定义
        '--primary-color': '#ff6b9d',
        '--bg-color': '#fef7f7',
        // ... 更多变量
      },
      effects: {                      // 可选的特效
        windowBlur: true,
        translucency: 0.8
      }
    }
  ],
  
  // ⚙️ 系统配置
  taskbar: { /* 任务栏设置 */ },
  desktop: { /* 桌面设置 */ },
  window: { /* 窗口设置 */ },
  mouse: { /* 鼠标设置 */ }
}
```

## 🎨 可用的CSS变量

### 颜色系统
```css
--primary-color         /* 主色调 */
--secondary-color       /* 次要色调 */
--success-color         /* 成功色 */
--warning-color         /* 警告色 */
--danger-color          /* 危险色 */
--info-color           /* 信息色 */
--accent-color         /* 强调色 */
--accent-color-rgb     /* RGB格式的强调色 */
```

### 背景色
```css
--bg-color             /* 主背景色 */
--bg-color-light       /* 浅背景色 */
--bg-color-darker      /* 深背景色 */
--bg-primary           /* 主要背景 */
--bg-secondary         /* 次要背景 */
--bg-tertiary          /* 第三级背景 */
```

### 文字颜色
```css
--text-color           /* 主要文字色 */
--text-color-light     /* 浅文字色 */
--text-color-lighter   /* 更浅文字色 */
--text-primary         /* 主要文字 */
--text-secondary       /* 次要文字 */
```

### 边框颜色
```css
--border-color         /* 主边框色 */
--border-color-light   /* 浅边框色 */
--border-color-lighter /* 更浅边框色 */
```

### 阴影效果
```css
--box-shadow           /* 主阴影 */
--box-shadow-light     /* 浅阴影 */
--box-shadow-dark      /* 深阴影 */
```

### 窗口和任务栏
```css
--window-bg-rgb        /* 窗口背景RGB */
--window-bg-alpha      /* 窗口透明度 */
--window-backdrop-filter /* 窗口背景滤镜 */
--taskbar-bg-rgb       /* 任务栏背景RGB */
--taskbar-bg-alpha     /* 任务栏透明度 */
--taskbar-backdrop-filter /* 任务栏背景滤镜 */
```

### 动画
```css
--animation-duration   /* 动画持续时间 */
--animation-easing     /* 动画缓动函数 */
```

## 🚀 快速开始

### 1. 创建自定义主题
在 `user-config.ts` 的 `themes` 数组中添加新主题：

```typescript
{
  id: 'my-awesome-theme',
  name: '我的超棒主题',
  variables: {
    '--primary-color': '#ff6b9d',
    '--secondary-color': '#4ecdc4',
    '--bg-color': '#fef7f7',
    '--bg-color-light': '#fff0f0',
    '--text-color': '#2c3e50',
    // ... 更多变量
  }
}
```

### 2. 设置为默认主题
```typescript
defaultTheme: 'my-awesome-theme'
```

### 3. 启用特效
```typescript
enableGlassEffect: true,    // 毛玻璃效果
enableWindowShadow: true,   // 窗口阴影
```

## 🎭 预设主题

### 系统默认主题
- `light` - 默认浅色主题
- `dark` - 深色主题  
- `glass` - 毛玻璃主题

### 用户自定义主题示例
- `custom-blue` - 深蓝商务主题
- `cyberpunk` - 赛博朋克霓虹主题
- `pink` - 樱花粉主题

## ⚙️ 高级配置

### 任务栏配置
```typescript
taskbar: {
  height: 48,                    // 高度
  position: 'bottom',            // 位置: bottom/top/left/right
  autoHide: false,               // 自动隐藏
  showClock: true,               // 显示时钟
  showSystemTray: true           // 显示系统托盘
}
```

### 桌面配置
```typescript
desktop: {
  showDesktopIcons: true,        // 显示桌面图标
  iconSize: 'medium',            // 图标大小: small/medium/large
  gridSnap: true,                // 网格对齐
  layout: 'grid'                 // 布局: grid/list/large-icons
}
```

### 窗口配置
```typescript
window: {
  animationEnabled: true,        // 启用动画
  snapToEdge: true,              // 边缘吸附
  transparencyEffects: true      // 透明效果
}
```

### 动画配置
```typescript
windowAnimations: {
  open: 'fade-in 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  close: 'fade-out 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
  minimize: 'scale-down 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
  maximize: 'scale-up 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  restore: 'scale-up 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
}
```

## 🎨 主题预览

在主题设置应用中，您可以：
1. 查看所有可用主题（包括自定义主题）
2. 实时预览主题效果
3. 一键切换主题
4. 调整系统效果和动画

## 💡 最佳实践

1. **颜色搭配**: 确保文字和背景有足够的对比度
2. **透明度**: 使用适当的透明度值（0.1-0.9）
3. **动画**: 保持动画时长在0.1s-0.5s之间
4. **命名**: 使用有意义的主题ID和名称
5. **测试**: 在不同应用中测试主题效果

## 🔧 故障排除

### 主题没有生效
1. 检查主题ID是否唯一
2. 确保CSS变量格式正确
3. 重启应用或刷新页面

### 预览不正确
1. 确保所有必要的CSS变量都已定义
2. 检查颜色值格式（十六进制、RGB等）

### 性能问题
1. 减少复杂的backdrop-filter效果
2. 优化动画时长和缓动函数

## 📚 参考资源

- [CSS变量文档](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS颜色格式](https://developer.mozilla.org/zh-CN/docs/Web/CSS/color)
- [动画缓动函数](https://cubic-bezier.com/)

---

🎉 现在您可以完全自定义MeowOS的外观了！只需修改一个配置文件即可实现所有定制需求。
