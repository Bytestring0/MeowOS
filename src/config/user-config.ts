/**
 * 用户配置文件 - 用户只需要修改这个文件来自定义主题和系统设置
 * 这些配置会与系统默认配置合并
 */
import type { UserConfig, AnimationPreset } from '../core/types/system';

export const userConfig: UserConfig = {
  // 默认主题设置
  defaultTheme: 'light',

  // 系统功能开关
  enableWindowShadow: true,
  enableGlassEffect: false,

  // 自定义主题 - 用户可以在这里添加自己的主题
  themes: [
    // 自定义蓝色主题
    {
      id: 'custom-blue',
      name: '深蓝主题',
      variables: {
        '--primary-color': '#1e3a8a',
        '--secondary-color': '#3b82f6',
        '--success-color': '#10b981',
        '--warning-color': '#f59e0b',
        '--danger-color': '#ef4444',
        '--info-color': '#6b7280',
        '--accent-color': '#1e3a8a',
        '--accent-color-rgb': '30, 58, 138',

        '--bg-color': '#f8fafc',
        '--bg-color-light': '#f1f5f9',
        '--bg-color-darker': '#e2e8f0',
        '--bg-primary': '#f8fafc',
        '--bg-secondary': '#f1f5f9',
        '--bg-tertiary': '#e2e8f0',

        '--text-color': '#0f172a',
        '--text-color-light': '#334155',
        '--text-color-lighter': '#64748b',
        '--text-primary': '#0f172a',
        '--text-secondary': '#334155',

        '--border-color': '#cbd5e1',
        '--border-color-light': '#e2e8f0',
        '--border-color-lighter': '#f1f5f9',

        '--box-shadow': '0 2px 12px 0 rgba(30, 58, 138, 0.1)',
        '--box-shadow-light': '0 2px 4px rgba(30, 58, 138, .12), 0 0 6px rgba(30, 58, 138, .04)',
        '--box-shadow-dark': '0 2px 4px rgba(30, 58, 138, .12), 0 0 6px rgba(30, 58, 138, .12)',

        '--window-header-height': '32px',
        '--window-min-width': '200px',
        '--window-min-height': '120px',
        '--window-bg-rgb': '248, 250, 252',
        '--window-bg-alpha': '0.92',
        '--window-backdrop-filter': 'none',

        '--taskbar-bg-rgb': '248, 250, 252',
        '--taskbar-bg-alpha': '0.85',
        '--taskbar-backdrop-filter': 'blur(20px) saturate(150%)',

        '--animation-duration': '0.3s',
        '--animation-easing': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      },
    },

    // Cyberpunk 主题
    {
      id: 'cyberpunk',
      name: 'Cyberpunk 2077',
      variables: {
        '--primary-color': '#00ffff',
        '--secondary-color': '#ff00ff',
        '--success-color': '#00ff00',
        '--warning-color': '#ffff00',
        '--danger-color': '#ff0066',
        '--info-color': '#6666ff',
        '--accent-color': '#00ffff',
        '--accent-color-rgb': '0, 255, 255',

        '--bg-color': '#0a0a0a',
        '--bg-color-light': '#1a1a1a',
        '--bg-color-darker': '#050505',
        '--bg-primary': '#0a0a0a',
        '--bg-secondary': '#1a1a1a',
        '--bg-tertiary': '#050505',

        '--text-color': '#00ffff',
        '--text-color-light': '#00cccc',
        '--text-color-lighter': '#009999',
        '--text-primary': '#00ffff',
        '--text-secondary': '#00cccc',

        '--border-color': '#003333',
        '--border-color-light': '#004444',
        '--border-color-lighter': '#005555',

        '--box-shadow': '0 0 20px rgba(0, 255, 255, 0.3)',
        '--box-shadow-light': '0 0 10px rgba(0, 255, 255, 0.2)',
        '--box-shadow-dark': '0 0 30px rgba(0, 255, 255, 0.4)',

        '--window-header-height': '32px',
        '--window-min-width': '200px',
        '--window-min-height': '120px',
        '--window-bg-rgb': '10, 10, 10',
        '--window-bg-alpha': '0.9',
        '--window-backdrop-filter': 'blur(10px) saturate(200%)',

        '--taskbar-bg-rgb': '10, 10, 10',
        '--taskbar-bg-alpha': '0.9',
        '--taskbar-backdrop-filter': 'blur(10px) saturate(200%)',

        '--animation-duration': '0.2s',
        '--animation-easing': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      effects: {
        windowBlur: true,
        translucency: 0.9,
      },
    },

    // 粉色主题
    {
      id: 'pink',
      name: '樱花粉',
      variables: {
        '--primary-color': '#ff69b4',
        '--secondary-color': '#ffc0cb',
        '--success-color': '#90ee90',
        '--warning-color': '#ffa500',
        '--danger-color': '#ff1493',
        '--info-color': '#dda0dd',
        '--accent-color': '#ff69b4',
        '--accent-color-rgb': '255, 105, 180',

        '--bg-color': '#fff5f8',
        '--bg-color-light': '#ffe4e6',
        '--bg-color-darker': '#ffb6c1',
        '--bg-primary': '#fff5f8',
        '--bg-secondary': '#ffe4e6',
        '--bg-tertiary': '#ffb6c1',

        '--text-color': '#8b0040',
        '--text-color-light': '#cd5c5c',
        '--text-color-lighter': '#dda0dd',
        '--text-primary': '#8b0040',
        '--text-secondary': '#cd5c5c',

        '--border-color': '#ffb6c1',
        '--border-color-light': '#ffc0cb',
        '--border-color-lighter': '#ffe4e6',

        '--box-shadow': '0 2px 12px 0 rgba(255, 105, 180, 0.2)',
        '--box-shadow-light': '0 2px 4px rgba(255, 105, 180, 0.15)',
        '--box-shadow-dark': '0 2px 4px rgba(255, 105, 180, 0.25)',

        '--window-header-height': '32px',
        '--window-min-width': '200px',
        '--window-min-height': '120px',
        '--window-bg-rgb': '255, 245, 248',
        '--window-bg-alpha': '0.92',
        '--window-backdrop-filter': 'none',

        '--taskbar-bg-rgb': '255, 245, 248',
        '--taskbar-bg-alpha': '0.85',
        '--taskbar-backdrop-filter': 'blur(20px) saturate(150%)',

        '--animation-duration': '0.4s',
        '--animation-easing': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  ],

  // 自定义壁纸
  wallpapers: [
    // 用户可以在这里添加自定义壁纸
    {
      id: 'my-wallpaper',
      type: 'url',
      value: 'https://example.com/my-wallpaper.jpg',
      name: '我的壁纸',
    },
  ],

  // 任务栏配置
  taskbar: {
    height: 48,
    position: 'bottom',
    autoHide: true,
    showClock: true,
    showSystemTray: true,
  },

  // 桌面配置
  desktop: {
    showDesktopIcons: true,
    iconSize: 'medium',
    gridSnap: true,
    layout: 'grid',
  },

  // 窗口配置
  window: {
    animationEnabled: true,
    snapToEdge: true,
    transparencyEffects: true,
  },

  // 鼠标配置
  mouse: {
    enableUserSelect: true,
    enableContextMenu: true,
    enableDragSelect: true,
  },
};
export const userAnimationConfig: Partial<AnimationPreset>[] = [
  {
    id: 'bouncy',
    name: '弹性',
    description: '带有弹性效果的动画',
    windowOpen: { duration: 600, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true },
    windowClose: { duration: 400, easing: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)', enabled: true },
    windowMinimize: {
      duration: 700,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
    },
    windowMaximize: {
      duration: 600,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
    },
    windowMove: { duration: 200, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true },
    windowResize: {
      duration: 200,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
    },
    desktopIconHover: {
      duration: 400,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
    },
    taskbarTransition: {
      duration: 300,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      enabled: true,
    },
  },
  {
    id: 'custom-smooth',
    name: '自定义流畅动画',
    description: '带有自定义样式的流畅动画',
    windowOpen: {
      duration: 500,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      enabled: true,
      keyframes: [
        {
          opacity: 0,
          transform: 'scale(0.5) rotateY(90deg)',
          filter: 'blur(10px) brightness(0.5)',
        },
        {
          opacity: 1,
          transform: 'scale(1) rotateY(0deg)',
          filter: 'blur(0px) brightness(1)',
        },
      ],
      options: {
        fill: 'forwards',
      },
    },
    wallpaperChange: {
      duration: 1000,
      easing: 'ease-in-out',
      enabled: true,
      customAnimation: (oldEl: HTMLElement, newEl: HTMLElement) => {
        console.log('执行自定义壁纸更换动画');
        // 自定义翻转动画
        const duration = 1000;

        if (oldEl) {
          oldEl.animate(
            [
              {
                transform: 'scale(1) translate3d(0,0,0) rotate3d(0,0,0,0deg)',
                filter: 'blur(0px) contrast(1) saturate(1)',
                opacity: 1,
              },
              {
                transform: 'scale(1.1) translate3d(-20px,10px,-60px) rotate3d(0.2,0.5,0.1,15deg)',
                filter: 'blur(4px) contrast(0.95) saturate(0.9)',
                opacity: 0.85,
              },
              {
                transform: 'scale(1.3) translate3d(80px,-60px,-180px) rotate3d(0.5,0.9,0.3,45deg)',
                filter: 'blur(12px) contrast(0.85) saturate(0.8)',
                opacity: 0.45,
              },
              {
                transform: 'scale(1.5) translate3d(-180px,140px,-400px) rotate3d(1,1,0,90deg)',
                filter: 'blur(24px) contrast(0.7) saturate(0.6) brightness(0.8)',
                opacity: 0,
              },
            ],
            { duration, easing: 'cubic-bezier(0.6,-0.28,0.735,0.045)', fill: 'forwards' }
          );
        }

        if (newEl) {
          newEl.animate(
            [
              {
                transform: 'scale(0.7) translate3d(120px,-80px,400px) rotate3d(0.6,0.8,0.2,-60deg)',
                filter: 'blur(24px) contrast(0.6) saturate(0.5) brightness(0.5)',
                opacity: 0,
              },
              {
                transform: 'scale(0.85) translate3d(30px,-20px,180px) rotate3d(0.3,0.6,0.1,-25deg)',
                filter: 'blur(12px) contrast(0.8) saturate(0.8) brightness(0.8)',
                opacity: 0.45,
              },
              {
                transform: 'scale(0.95) translate3d(10px,5px,60px) rotate3d(0.1,0.2,0,5deg)',
                filter: 'blur(4px) contrast(0.95) saturate(0.95) brightness(1.05)',
                opacity: 0.85,
              },
              {
                transform: 'scale(1) translate3d(0,0,0) rotate3d(0,0,0,0deg)',
                filter: 'blur(0px) contrast(1) saturate(1) brightness(1)',
                opacity: 1,
              },
            ],
            { duration, easing: 'cubic-bezier(0.25,1,0.5,1)', fill: 'forwards' }
          );
        }

        return new Animation();
      },
    },
  },
];
