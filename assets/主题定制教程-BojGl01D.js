const r=`# 主题定制教程\r
\r
学习如何为 MeowOS 创建和定制主题。\r
\r
## 主题系统概述\r
\r
MeowOS 使用 CSS 变量来实现主题系统，所有颜色和样式都可以通过变量进行定制。\r
\r
## 创建自定义主题\r
\r
### 1. 在用户配置中添加主题\r
\r
编辑 \`src/config/user-config.ts\` 文件，在 themes 数组中添加新主题：\r
\r
\`\`\`typescript\r
{\r
  id: 'my-theme',\r
  name: '我的主题',\r
  variables: {\r
    '--primary-color': '#your-color',\r
    '--bg-color': '#your-bg-color',\r
    // 更多变量...\r
  }\r
}\r
\`\`\`\r
\r
### 2. 可用的 CSS 变量\r
\r
#### 颜色变量\r
- \`--primary-color\` - 主色调\r
- \`--secondary-color\` - 次要颜色\r
- \`--success-color\` - 成功色\r
- \`--warning-color\` - 警告色\r
- \`--danger-color\` - 危险色\r
- \`--accent-color\` - 强调色\r
\r
#### 背景颜色\r
- \`--bg-color\` - 主背景色\r
- \`--bg-color-light\` - 浅色背景\r
- \`--bg-color-darker\` - 深色背景\r
\r
#### 文本颜色\r
- \`--text-color\` - 主文本色\r
- \`--text-color-light\` - 浅色文本\r
- \`--text-color-lighter\` - 更浅文本色\r
\r
#### 边框和阴影\r
- \`--border-color\` - 边框颜色\r
- \`--box-shadow\` - 阴影效果\r
\r
### 3. 示例主题\r
\r
#### 暗色主题\r
\`\`\`typescript\r
{\r
  id: 'dark',\r
  name: '暗色主题',\r
  variables: {\r
    '--primary-color': '#64b5f6',\r
    '--bg-color': '#1e1e1e',\r
    '--bg-color-light': '#2d2d2d',\r
    '--text-color': '#ffffff',\r
    '--text-color-light': '#cccccc',\r
    '--border-color': '#404040'\r
  }\r
}\r
\`\`\`\r
\r
#### 绿色主题\r
\`\`\`typescript\r
{\r
  id: 'green',\r
  name: '自然绿',\r
  variables: {\r
    '--primary-color': '#4caf50',\r
    '--secondary-color': '#81c784',\r
    '--bg-color': '#f1f8e9',\r
    '--text-color': '#2e7d32'\r
  }\r
}\r
\`\`\`\r
\r
## 高级定制\r
\r
### 动画配置\r
\`\`\`typescript\r
variables: {\r
  '--animation-duration': '0.5s',\r
  '--animation-easing': 'cubic-bezier(0.25, 0.8, 0.25, 1)'\r
}\r
\`\`\`\r
\r
### 窗口效果\r
\`\`\`typescript\r
variables: {\r
  '--window-bg-alpha': '0.95',\r
  '--window-backdrop-filter': 'blur(10px)'\r
}\r
\`\`\`\r
\r
## 测试主题\r
\r
1. 保存配置文件\r
2. 刷新页面\r
3. 打开主题设置应用\r
4. 选择你的主题进行预览\r
\r
## 分享主题\r
\r
你可以将主题配置分享给其他用户，他们只需要复制配置到自己的 \`user-config.ts\` 文件中即可。\r
\r
## 提示\r
\r
- 保持颜色对比度，确保可读性\r
- 测试在不同应用中的效果\r
- 考虑无障碍访问需求\r
- 使用工具验证颜色搭配\r
`;export{r as default};
