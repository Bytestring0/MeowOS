// 用户自定义配置示例
// 在应用入口处导入并应用此配置

import { system } from '@/core/api/system';
import type { UserConfig } from '@/config/system';

// 示例：自定义配置
const userConfig: UserConfig = {
  // 自定义主题
  themes: [
    {
      id: 'custom-pink',
      name: '粉色主题',
      variables: {
        '--primary-color': '#ff6b9d',
        '--secondary-color': '#c44569',
        '--bg-color': '#ffeef4',
        '--bg-color-light': '#fff5f8',
        '--bg-color-darker': '#ffe4ec',
        '--text-color': '#2d3436',
        '--text-color-light': '#636e72',
        '--text-color-lighter': '#b2bec3',
        '--border-color': '#ffc8dd',
        '--border-color-light': '#ffb3d1',
        '--border-color-lighter': '#ff9ecf',
        '--window-bg-rgb': '255, 238, 244',
        '--window-bg-alpha': '0.95'
      }
    },
    {
      id: 'custom-cyberpunk',
      name: '赛博朋克',
      variables: {
        '--primary-color': '#00ffff',
        '--secondary-color': '#ff00ff',
        '--bg-color': '#0a0a0a',
        '--bg-color-light': '#1a1a1a',
        '--bg-color-darker': '#050505',
        '--text-color': '#00ffff',
        '--text-color-light': '#00cccc',
        '--text-color-lighter': '#009999',
        '--border-color': '#003333',
        '--border-color-light': '#004444',
        '--border-color-lighter': '#005555',
        '--window-bg-rgb': '10, 10, 10',
        '--window-bg-alpha': '0.9',
        '--window-backdrop-filter': 'blur(10px) saturate(200%)'
      },
      effects: {
        windowBlur: true,
        translucency: 0.9
      }
    }
  ],

  // 自定义壁纸
  wallpapers: [
    {
      id: 'custom-space',
      name: '星空',
      type: 'url',
      value: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
    },
    {
      id: 'custom-gradient-purple',
      name: '紫色梦幻',
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'custom-gradient-ocean',
      name: '海洋蓝',
      type: 'gradient',
      value: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)'
    }
  ],

  // 自定义动画（更快的动画）
  windowAnimations: {
    open: 'fade-in 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    close: 'fade-out 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    minimize: 'scale-down 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    maximize: 'scale-up 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    restore: 'scale-up 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },

  // 任务栏配置
  taskbar: {
    height: 52,
    position: 'bottom'
  },

  // 启用所有效果
  enableWindowShadow: true,
  enableGlassEffect: true
};

// 应用配置的函数
export function applyUserConfig() {
  system.setUserConfig(userConfig);
  console.log('用户配置已应用');
}

// 如果要在应用启动时自动应用，取消注释下面的行
//applyUserConfig();

export default userConfig;
