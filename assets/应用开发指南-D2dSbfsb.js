const n=`# 应用开发指南\r
\r
本文档介绍如何为 MeowOS 开发新的应用程序。\r
\r
## 应用结构\r
\r
每个应用都应该包含以下文件：\r
\r
\`\`\`\r
app-name/\r
├── AppName.vue      # 主组件\r
├── AppName.ts       # 逻辑文件（可选）\r
└── manifest.json    # 应用清单\r
\`\`\`\r
\r
## 清单文件格式\r
\r
\`\`\`json\r
{\r
  "id": "app-id",\r
  "name": "应用名称",\r
  "description": "应用描述",\r
  "version": "1.0.0",\r
  "icon": "icons/app-icon.svg",\r
  "type": "app",\r
  "entry": "AppName",\r
  "singleInstance": false,\r
  "showOnDesktop": true,\r
  "commands": {\r
    "command-name": {\r
      "description": "命令描述",\r
      "alias": ["alias1", "alias2"]\r
    }\r
  }\r
}\r
\`\`\`\r
\r
## Vue 组件开发\r
\r
应用组件应该遵循以下规范：\r
\r
\`\`\`vue\r
<template>\r
  <div class="app-container">\r
    <!-- 应用内容 -->\r
  </div>\r
</template>\r
\r
<script setup lang="ts">\r
import { ref, onMounted } from 'vue';\r
\r
// 组件逻辑\r
<\/script>\r
\r
<style scoped>\r
.app-container {\r
  height: 100%;\r
  padding: 16px;\r
  background: var(--bg-color);\r
  color: var(--text-color);\r
}\r
</style>\r
\`\`\`\r
\r
## 系统 API\r
\r
应用可以使用以下系统 API：\r
\r
- \`system.openApp(appId)\` - 打开其他应用\r
- \`system.setTheme(themeId)\` - 设置主题\r
- \`storage.get(key)\` / \`storage.set(key, value)\` - 本地存储\r
- \`eventBus.emit(event, data)\` - 发送事件\r
\r
## 最佳实践\r
\r
1. 使用 CSS 变量来适配主题\r
2. 合理使用响应式设计\r
3. 提供良好的用户体验\r
4. 遵循系统设计规范\r
\r
## 调试技巧\r
\r
- 使用浏览器开发者工具\r
- 查看控制台输出\r
- 使用 Vue DevTools\r
`;export{n as default};
