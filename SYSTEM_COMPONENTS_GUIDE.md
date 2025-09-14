# 系统组件开发指南

## 概述

系统组件（System Components）是 MeowOS 中一种特殊的组件类型，它们可以在桌面的任何地方显示，而不像普通应用那样在窗口中运行。

## 功能特性

- ✅ 删除了所有右键菜单功能
- ✅ 支持桌面和任务栏两种位置类型
- ✅ 支持拖拽、大小调整等交互
- ✅ 支持自动启动和位置锚定
- ✅ 完整的主题系统集成

## 系统组件类型

### 1. 桌面组件 (desktop)
- 可以放置在桌面的任意位置
- 支持锚点定位（top-left, top-right, bottom-left, bottom-right, center）
- 支持拖拽移动
- 例如：桌面宠物

### 2. 任务栏组件 (taskbar)
- 集成在任务栏中显示
- 支持左、中、右位置
- 支持排序
- 例如：系统时钟

## 已实现的示例组件

### 系统时钟 (system-clock)
- 位置：任务栏右侧
- 功能：显示实时时间和日期
- 交互：点击切换12/24小时制
- 主题：支持所有主题适配

### 桌面宠物 (desktop-pet)
- 位置：桌面右下角
- 功能：可爱的动画宠物
- 交互：支持拖拽、点击互动
- 行为：自动睡眠、移动、开心等状态

## 配置说明

### manifest.json 配置

```json
{
  "id": "component-id",
  "name": "组件名称",
  "type": "system-component",
  "entry": "ComponentName",
  "autoStart": true,
  "systemComponent": {
    "position": {
      "type": "desktop|taskbar",
      "anchor": "top-left|top-right|bottom-left|bottom-right|center",
      "placement": "left|right|center",
      "order": 1
    },
    "display": {
      "always": true,
      "draggable": true,
      "zIndex": 950,
      "opacity": 0.9
    },
    "size": {
      "width": 80,
      "height": 80
    },
    "behavior": {
      "clickThrough": false,
      "showOnHover": false
    }
  }
}
```

## 开发新组件

1. 在 `src/system-components/` 下创建新目录
2. 添加 `manifest.json` 配置文件
3. 创建 Vue 组件文件
4. 组件会自动扫描并加载

## 事件系统

系统组件集成了完整的事件系统：

- `SystemComponentStarted` - 组件启动
- `SystemComponentStopped` - 组件停止  
- `SystemComponentMoved` - 组件移动

## 主题支持

所有系统组件都支持主题系统，通过CSS变量和data-theme属性自动适配：

- `[data-theme="dark"]` - 暗色主题
- `[data-theme="glass"]` - 玻璃主题
- `[data-theme="custom-blue"]` - 自定义蓝色主题

## 技术实现

- 使用 Vue 3 Composition API
- TypeScript 类型安全
- 事件总线通信
- 动态组件加载
- Teleport 技术用于任务栏组件
