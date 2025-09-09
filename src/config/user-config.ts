// 用户自定义配置
// 基于 user-config.example.ts 的示例

import type { UserConfig } from '@/config/system';

export const userConfig: UserConfig = {
  // 默认主题
  defaultTheme: 'light',
  
  // 自定义主题（可选）
  themes: [
    {
      id: 'custom-blue',
      name: '深蓝主题',
      variables: {
        '--primary-color': '#1e3a8a',
        '--secondary-color': '#3b82f6',
        '--bg-color': '#f8fafc',
        '--bg-color-light': '#f1f5f9',
        '--bg-color-darker': '#e2e8f0',
        '--text-color': '#0f172a',
        '--text-color-light': '#334155',
        '--text-color-lighter': '#64748b',
        '--border-color': '#cbd5e1',
        '--border-color-light': '#e2e8f0',
        '--border-color-lighter': '#f1f5f9',
        '--window-bg-rgb': '248, 250, 252',
        '--window-bg-alpha': '0.95'
      }
    }
  ],
  
  // 桌面设置
  desktop: {
    showDesktopIcons: true,
    iconSize: 'medium',
    gridSnap: true,
    layout: 'grid' // 新增布局选项: 'grid' | 'list' | 'large-icons'
  },
  
  // 任务栏设置
  taskbar: {
    position: 'bottom',
    autoHide: true,
    showClock: true,
    showSystemTray: true
  },
  
  // 窗口设置
  window: {
    animationEnabled: true,
    snapToEdge: true,
    transparencyEffects: true
  }
};
