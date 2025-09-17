const r=`# 主题配置详解\r
\r
完整的主题系统配置和自定义指南。\r
\r
## 主题系统架构\r
\r
MeowOS使用CSS变量驱动的主题系统，支持动态切换和用户自定义。\r
\r
### 核心CSS变量\r
\r
系统定义了以下CSS变量，所有组件都应使用这些变量：\r
\r
\`\`\`css\r
:root {\r
  /* 主色调 */\r
  --primary-color: #1976d2;\r
  --primary-variant-color: #1565c0;\r
  --on-primary-color: #ffffff;\r
\r
  /* 次要色调 */\r
  --secondary-color: #03dac6;\r
  --secondary-variant-color: #018786;\r
  --on-secondary-color: #000000;\r
\r
  /* 表面颜色 */\r
  --surface-color: #ffffff;\r
  --surface-variant-color: #f5f5f5;\r
  --on-surface-color: #000000;\r
  --on-surface-variant-color: #757575;\r
\r
  /* 背景颜色 */\r
  --background-color: #fafafa;\r
  --on-background-color: #000000;\r
\r
  /* 错误色调 */\r
  --error-color: #b00020;\r
  --on-error-color: #ffffff;\r
\r
  /* 边框和分割线 */\r
  --outline-color: #e0e0e0;\r
  --outline-variant-color: #bdbdbd;\r
\r
  /* 阴影 */\r
  --shadow-color: rgba(0, 0, 0, 0.2);\r
  --elevation-1: 0 2px 4px var(--shadow-color);\r
  --elevation-2: 0 4px 8px var(--shadow-color);\r
  --elevation-3: 0 8px 16px var(--shadow-color);\r
\r
  /* 过渡动画 */\r
  --transition-fast: 0.2s ease;\r
  --transition-medium: 0.3s ease;\r
  --transition-slow: 0.5s ease;\r
\r
  /* 字体 */\r
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;\r
  --font-size-small: 0.875rem;\r
  --font-size-medium: 1rem;\r
  --font-size-large: 1.25rem;\r
  --font-size-xlarge: 1.5rem;\r
\r
  /* 圆角 */\r
  --border-radius-small: 4px;\r
  --border-radius-medium: 8px;\r
  --border-radius-large: 16px;\r
\r
  /* 间距 */\r
  --spacing-xs: 4px;\r
  --spacing-sm: 8px;\r
  --spacing-md: 16px;\r
  --spacing-lg: 24px;\r
  --spacing-xl: 32px;\r
}\r
\`\`\`\r
\r
## 内置主题\r
\r
### 默认主题\r
\r
\`\`\`css\r
/* themes/default.css */\r
:root {\r
  --primary-color: #1976d2;\r
  --surface-color: #ffffff;\r
  --background-color: #fafafa;\r
  --on-surface-color: #000000;\r
  /* ... 其他变量 */\r
}\r
\`\`\`\r
\r
### 深色主题\r
\r
\`\`\`css\r
/* themes/dark.css */\r
:root {\r
  --primary-color: #bb86fc;\r
  --surface-color: #1e1e1e;\r
  --background-color: #121212;\r
  --on-surface-color: #ffffff;\r
  --outline-color: #333333;\r
  --shadow-color: rgba(0, 0, 0, 0.5);\r
}\r
\`\`\`\r
\r
### 高对比度主题\r
\r
\`\`\`css\r
/* themes/high-contrast.css */\r
:root {\r
  --primary-color: #ffffff;\r
  --surface-color: #000000;\r
  --background-color: #000000;\r
  --on-surface-color: #ffffff;\r
  --outline-color: #ffffff;\r
  --error-color: #ff0000;\r
}\r
\`\`\`\r
\r
## 主题定义结构\r
\r
### ThemeDefinition接口\r
\r
\`\`\`typescript\r
interface ThemeDefinition {\r
  id: string;                    // 主题唯一标识\r
  name: string;                  // 显示名称\r
  description?: string;          // 描述\r
  author?: string;               // 作者\r
  version?: string;              // 版本\r
  preview?: string;              // 预览图\r
  colors: ThemeColors;           // 颜色配置\r
  properties?: ThemeProperties;  // 扩展属性\r
}\r
\r
interface ThemeColors {\r
  primary: string;\r
  primaryVariant?: string;\r
  onPrimary: string;\r
  secondary: string;\r
  secondaryVariant?: string;\r
  onSecondary: string;\r
  surface: string;\r
  surfaceVariant?: string;\r
  onSurface: string;\r
  onSurfaceVariant?: string;\r
  background: string;\r
  onBackground: string;\r
  error: string;\r
  onError: string;\r
  outline: string;\r
  outlineVariant?: string;\r
  shadow?: string;\r
}\r
\r
interface ThemeProperties {\r
  borderRadius?: {\r
    small: string;\r
    medium: string;\r
    large: string;\r
  };\r
  spacing?: {\r
    xs: string;\r
    sm: string;\r
    md: string;\r
    lg: string;\r
    xl: string;\r
  };\r
  elevation?: {\r
    low: string;\r
    medium: string;\r
    high: string;\r
  };\r
  transitions?: {\r
    fast: string;\r
    medium: string;\r
    slow: string;\r
  };\r
}\r
\`\`\`\r
\r
## 创建自定义主题\r
\r
### 1. 基础主题创建\r
\r
\`\`\`typescript\r
// 创建主题定义\r
const myTheme: ThemeDefinition = {\r
  id: 'cyberpunk',\r
  name: '赛博朋克',\r
  description: '未来科幻风格主题',\r
  author: 'MeowOS Team',\r
  version: '1.0.0',\r
  colors: {\r
    primary: '#00ff9f',\r
    onPrimary: '#000000',\r
    secondary: '#ff0080',\r
    onSecondary: '#ffffff',\r
    surface: '#0a0a0a',\r
    surfaceVariant: '#1a1a1a',\r
    onSurface: '#00ff9f',\r
    onSurfaceVariant: '#80ff80',\r
    background: '#000000',\r
    onBackground: '#00ff9f',\r
    error: '#ff0040',\r
    onError: '#ffffff',\r
    outline: '#008060',\r
    outlineVariant: '#004030',\r
    shadow: 'rgba(0, 255, 159, 0.3)'\r
  },\r
  properties: {\r
    borderRadius: {\r
      small: '2px',\r
      medium: '4px',\r
      large: '8px'\r
    },\r
    elevation: {\r
      low: '0 0 10px rgba(0, 255, 159, 0.2)',\r
      medium: '0 0 20px rgba(0, 255, 159, 0.3)',\r
      high: '0 0 30px rgba(0, 255, 159, 0.5)'\r
    }\r
  }\r
}\r
\`\`\`\r
\r
### 2. 注册主题\r
\r
\`\`\`typescript\r
// 在应用初始化时注册主题\r
import { system } from '@/core/api'\r
\r
const registerCustomTheme = async () => {\r
  // 添加主题到系统\r
  system.themes.push(myTheme)\r
  \r
  // 如果需要持久化\r
  await storage.setSystemSetting('custom-themes', system.themes.filter(t => \r
    !['default', 'dark', 'high-contrast'].includes(t.id)\r
  ))\r
}\r
\`\`\`\r
\r
### 3. 动态生成CSS\r
\r
\`\`\`typescript\r
// 主题应用函数\r
const applyTheme = (theme: ThemeDefinition) => {\r
  const root = document.documentElement\r
  \r
  // 应用颜色\r
  Object.entries(theme.colors).forEach(([key, value]) => {\r
    const cssVar = \`--\${key.replace(/([A-Z])/g, '-$1').toLowerCase()}-color\`\r
    root.style.setProperty(cssVar, value)\r
  })\r
  \r
  // 应用其他属性\r
  if (theme.properties) {\r
    if (theme.properties.borderRadius) {\r
      Object.entries(theme.properties.borderRadius).forEach(([key, value]) => {\r
        root.style.setProperty(\`--border-radius-\${key}\`, value)\r
      })\r
    }\r
    \r
    if (theme.properties.elevation) {\r
      Object.entries(theme.properties.elevation).forEach(([key, value]) => {\r
        root.style.setProperty(\`--elevation-\${key}\`, value)\r
      })\r
    }\r
  }\r
}\r
\`\`\`\r
\r
## 主题管理器\r
\r
### 自定义主题管理器组件\r
\r
\`\`\`vue\r
<template>\r
  <div class="theme-manager">\r
    <h3>主题设置</h3>\r
    \r
    <!-- 内置主题 -->\r
    <div class="theme-section">\r
      <h4>内置主题</h4>\r
      <div class="theme-grid">\r
        <div v-for="theme in builtinThemes" \r
             :key="theme.id"\r
             class="theme-card"\r
             :class="{ active: currentTheme === theme.id }"\r
             @click="setTheme(theme.id)">\r
          <div class="theme-preview" :style="getPreviewStyle(theme)"></div>\r
          <div class="theme-info">\r
            <div class="theme-name">{{ theme.name }}</div>\r
            <div class="theme-desc">{{ theme.description }}</div>\r
          </div>\r
        </div>\r
      </div>\r
    </div>\r
    \r
    <!-- 自定义主题 -->\r
    <div class="theme-section">\r
      <h4>自定义主题</h4>\r
      <div class="theme-grid">\r
        <div v-for="theme in customThemes" \r
             :key="theme.id"\r
             class="theme-card"\r
             :class="{ active: currentTheme === theme.id }">\r
          <div class="theme-preview" :style="getPreviewStyle(theme)"></div>\r
          <div class="theme-info">\r
            <div class="theme-name">{{ theme.name }}</div>\r
            <div class="theme-actions">\r
              <button @click="setTheme(theme.id)">应用</button>\r
              <button @click="editTheme(theme)">编辑</button>\r
              <button @click="deleteTheme(theme.id)">删除</button>\r
            </div>\r
          </div>\r
        </div>\r
        \r
        <!-- 创建新主题 -->\r
        <div class="theme-card create-new" @click="createNewTheme">\r
          <div class="create-icon">+</div>\r
          <div class="create-text">创建主题</div>\r
        </div>\r
      </div>\r
    </div>\r
    \r
    <!-- 主题编辑器 -->\r
    <ThemeEditor v-if="showEditor" \r
                 :theme="editingTheme"\r
                 @save="saveTheme"\r
                 @cancel="showEditor = false" />\r
  </div>\r
</template>\r
\r
<script setup>\r
import { ref, computed, onMounted } from 'vue'\r
import { system, storage } from '@/core/api'\r
import ThemeEditor from './ThemeEditor.vue'\r
\r
const currentTheme = ref(system.theme)\r
const customThemes = ref([])\r
const showEditor = ref(false)\r
const editingTheme = ref(null)\r
\r
const builtinThemes = computed(() => \r
  system.themes.filter(t => ['default', 'dark', 'high-contrast'].includes(t.id))\r
)\r
\r
const setTheme = async (themeId) => {\r
  await system.setTheme(themeId)\r
  currentTheme.value = themeId\r
}\r
\r
const getPreviewStyle = (theme) => ({\r
  background: \`linear-gradient(135deg, \${theme.colors.primary}, \${theme.colors.secondary})\`,\r
  color: theme.colors.onPrimary\r
})\r
\r
const createNewTheme = () => {\r
  editingTheme.value = {\r
    id: '',\r
    name: '新主题',\r
    colors: { ...system.themes[0].colors }\r
  }\r
  showEditor.value = true\r
}\r
\r
const editTheme = (theme) => {\r
  editingTheme.value = { ...theme }\r
  showEditor.value = true\r
}\r
\r
const saveTheme = async (theme) => {\r
  const existingIndex = customThemes.value.findIndex(t => t.id === theme.id)\r
  if (existingIndex >= 0) {\r
    customThemes.value[existingIndex] = theme\r
  } else {\r
    customThemes.value.push(theme)\r
  }\r
  \r
  await storage.setSystemSetting('custom-themes', customThemes.value)\r
  showEditor.value = false\r
}\r
\r
const deleteTheme = async (themeId) => {\r
  customThemes.value = customThemes.value.filter(t => t.id !== themeId)\r
  await storage.setSystemSetting('custom-themes', customThemes.value)\r
}\r
\r
onMounted(async () => {\r
  const saved = await storage.getSystemSetting('custom-themes')\r
  if (saved) customThemes.value = saved\r
})\r
<\/script>\r
\r
<style scoped>\r
.theme-manager {\r
  padding: 20px;\r
  max-width: 800px;\r
}\r
\r
.theme-section {\r
  margin-bottom: 30px;\r
}\r
\r
.theme-grid {\r
  display: grid;\r
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\r
  gap: 16px;\r
  margin-top: 16px;\r
}\r
\r
.theme-card {\r
  border: 2px solid var(--outline-color);\r
  border-radius: var(--border-radius-medium);\r
  overflow: hidden;\r
  cursor: pointer;\r
  transition: all var(--transition-fast);\r
}\r
\r
.theme-card:hover {\r
  border-color: var(--primary-color);\r
  transform: translateY(-2px);\r
}\r
\r
.theme-card.active {\r
  border-color: var(--primary-color);\r
  box-shadow: var(--elevation-2);\r
}\r
\r
.theme-preview {\r
  height: 80px;\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
  font-weight: bold;\r
}\r
\r
.theme-info {\r
  padding: 12px;\r
  background: var(--surface-color);\r
}\r
\r
.theme-name {\r
  font-weight: 600;\r
  margin-bottom: 4px;\r
}\r
\r
.theme-desc {\r
  font-size: var(--font-size-small);\r
  color: var(--on-surface-variant-color);\r
}\r
\r
.theme-actions {\r
  display: flex;\r
  gap: 8px;\r
  margin-top: 8px;\r
}\r
\r
.theme-actions button {\r
  flex: 1;\r
  padding: 4px 8px;\r
  border: 1px solid var(--outline-color);\r
  border-radius: var(--border-radius-small);\r
  background: var(--surface-variant-color);\r
  cursor: pointer;\r
  font-size: var(--font-size-small);\r
}\r
\r
.create-new {\r
  display: flex;\r
  flex-direction: column;\r
  align-items: center;\r
  justify-content: center;\r
  min-height: 140px;\r
  border-style: dashed;\r
  color: var(--on-surface-variant-color);\r
}\r
\r
.create-icon {\r
  font-size: 2rem;\r
  margin-bottom: 8px;\r
}\r
</style>\r
\`\`\`\r
\r
## 主题切换动画\r
\r
### 平滑过渡效果\r
\r
\`\`\`css\r
/* 为所有使用主题变量的元素添加过渡 */\r
* {\r
  transition: \r
    background-color var(--transition-medium),\r
    color var(--transition-medium),\r
    border-color var(--transition-medium),\r
    box-shadow var(--transition-medium);\r
}\r
\r
/* 特殊元素的过渡处理 */\r
.window {\r
  transition: all var(--transition-medium);\r
}\r
\r
.button {\r
  transition: \r
    background-color var(--transition-fast),\r
    transform var(--transition-fast);\r
}\r
\`\`\`\r
\r
### 主题切换钩子\r
\r
\`\`\`typescript\r
// 主题切换时的生命周期钩子\r
export class ThemeManager {\r
  private beforeThemeChange?: () => void\r
  private afterThemeChange?: (themeId: string) => void\r
\r
  async setTheme(themeId: string) {\r
    // 切换前回调\r
    this.beforeThemeChange?.()\r
    \r
    // 应用主题\r
    const theme = this.themes.find(t => t.id === themeId)\r
    if (theme) {\r
      this.applyTheme(theme)\r
      \r
      // 保存设置\r
      await storage.setSystemSetting('theme', themeId)\r
      \r
      // 发送事件\r
      eventBus.emit(SystemEvents.ThemeChanged, themeId)\r
      \r
      // 切换后回调\r
      this.afterThemeChange?.(themeId)\r
    }\r
  }\r
\r
  onBeforeThemeChange(callback: () => void) {\r
    this.beforeThemeChange = callback\r
  }\r
\r
  onAfterThemeChange(callback: (themeId: string) => void) {\r
    this.afterThemeChange = callback\r
  }\r
}\r
\`\`\`\r
\r
## 响应式主题\r
\r
### 自动深色模式\r
\r
\`\`\`typescript\r
// 根据系统设置自动切换主题\r
const setupAutoTheme = () => {\r
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')\r
  \r
  const updateTheme = (e: MediaQueryListEvent) => {\r
    const prefersDark = e.matches\r
    const autoTheme = prefersDark ? 'dark' : 'default'\r
    \r
    // 只在用户设置为自动时切换\r
    const userSetting = getUserConfig().theme\r
    if (userSetting === 'auto') {\r
      system.applyTheme(autoTheme)\r
    }\r
  }\r
  \r
  mediaQuery.addEventListener('change', updateTheme)\r
  \r
  // 初始检查\r
  updateTheme({ matches: mediaQuery.matches } as MediaQueryListEvent)\r
}\r
\`\`\`\r
\r
### 时间基础主题\r
\r
\`\`\`typescript\r
// 根据时间自动切换主题\r
const setupTimeBasedTheme = () => {\r
  const updateThemeByTime = () => {\r
    const hour = new Date().getHours()\r
    \r
    let themeId: string\r
    if (hour >= 6 && hour < 18) {\r
      themeId = 'default'  // 白天主题\r
    } else if (hour >= 18 && hour < 22) {\r
      themeId = 'warm'     // 暖色主题\r
    } else {\r
      themeId = 'dark'     // 深色主题\r
    }\r
    \r
    const userSetting = getUserConfig().themeMode\r
    if (userSetting === 'time-based') {\r
      system.applyTheme(themeId)\r
    }\r
  }\r
  \r
  // 每小时检查一次\r
  setInterval(updateThemeByTime, 60 * 60 * 1000)\r
  updateThemeByTime()\r
}\r
\`\`\`\r
\r
## 主题导入导出\r
\r
### 导出主题\r
\r
\`\`\`typescript\r
const exportTheme = (themeId: string): string => {\r
  const theme = system.themes.find(t => t.id === themeId)\r
  if (!theme) throw new Error('主题不存在')\r
  \r
  return JSON.stringify({\r
    ...theme,\r
    exportedAt: new Date().toISOString(),\r
    exportVersion: '1.0.0'\r
  }, null, 2)\r
}\r
\r
// 下载主题文件\r
const downloadTheme = (themeId: string) => {\r
  const themeData = exportTheme(themeId)\r
  const blob = new Blob([themeData], { type: 'application/json' })\r
  const url = URL.createObjectURL(blob)\r
  \r
  const a = document.createElement('a')\r
  a.href = url\r
  a.download = \`\${themeId}-theme.json\`\r
  a.click()\r
  \r
  URL.revokeObjectURL(url)\r
}\r
\`\`\`\r
\r
### 导入主题\r
\r
\`\`\`typescript\r
const importTheme = (file: File): Promise<ThemeDefinition> => {\r
  return new Promise((resolve, reject) => {\r
    const reader = new FileReader()\r
    \r
    reader.onload = (e) => {\r
      try {\r
        const themeData = JSON.parse(e.target?.result as string)\r
        \r
        // 验证主题格式\r
        if (!validateThemeFormat(themeData)) {\r
          reject(new Error('主题格式不正确'))\r
          return\r
        }\r
        \r
        // 确保唯一ID\r
        if (system.themes.some(t => t.id === themeData.id)) {\r
          themeData.id = \`\${themeData.id}-imported-\${Date.now()}\`\r
        }\r
        \r
        resolve(themeData)\r
      } catch (error) {\r
        reject(new Error('主题文件解析失败'))\r
      }\r
    }\r
    \r
    reader.onerror = () => reject(new Error('文件读取失败'))\r
    reader.readAsText(file)\r
  })\r
}\r
\r
const validateThemeFormat = (theme: any): boolean => {\r
  const requiredFields = ['id', 'name', 'colors']\r
  const requiredColors = ['primary', 'onPrimary', 'surface', 'onSurface', 'background', 'onBackground']\r
  \r
  return requiredFields.every(field => theme[field] !== undefined) &&\r
         requiredColors.every(color => theme.colors[color] !== undefined)\r
}\r
\`\`\`\r
\r
## 主题最佳实践\r
\r
### 1. 颜色对比度\r
\r
确保文本和背景有足够的对比度：\r
\r
\`\`\`typescript\r
// 计算颜色对比度\r
const getContrast = (color1: string, color2: string): number => {\r
  const l1 = getLuminance(color1)\r
  const l2 = getLuminance(color2)\r
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)\r
}\r
\r
// 验证主题可访问性\r
const validateThemeAccessibility = (theme: ThemeDefinition): string[] => {\r
  const issues: string[] = []\r
  \r
  if (getContrast(theme.colors.primary, theme.colors.onPrimary) < 4.5) {\r
    issues.push('主色调对比度不足')\r
  }\r
  \r
  if (getContrast(theme.colors.surface, theme.colors.onSurface) < 4.5) {\r
    issues.push('表面颜色对比度不足')\r
  }\r
  \r
  return issues\r
}\r
\`\`\`\r
\r
### 2. 语义化命名\r
\r
使用语义化的颜色命名而非具体颜色：\r
\r
\`\`\`typescript\r
// 好的做法\r
const colors = {\r
  primary: '#1976d2',      // 主要操作色\r
  error: '#b00020',        // 错误状态色\r
  warning: '#f57c00',      // 警告状态色\r
  success: '#388e3c'       // 成功状态色\r
}\r
\r
// 避免的做法\r
const colors = {\r
  blue: '#1976d2',\r
  red: '#b00020',\r
  orange: '#f57c00',\r
  green: '#388e3c'\r
}\r
\`\`\`\r
\r
### 3. 主题继承\r
\r
支持基于现有主题创建新主题：\r
\r
\`\`\`typescript\r
const createDerivedTheme = (baseThemeId: string, overrides: Partial<ThemeColors>): ThemeDefinition => {\r
  const baseTheme = system.themes.find(t => t.id === baseThemeId)\r
  if (!baseTheme) throw new Error('基础主题不存在')\r
  \r
  return {\r
    ...baseTheme,\r
    id: \`\${baseThemeId}-derived-\${Date.now()}\`,\r
    name: \`\${baseTheme.name} (自定义)\`,\r
    colors: {\r
      ...baseTheme.colors,\r
      ...overrides\r
    }\r
  }\r
}\r
\`\`\`\r
\r
这份主题配置指南基于MeowOS的实际主题系统编写，涵盖了完整的主题开发流程。\r
`;export{r as default};
