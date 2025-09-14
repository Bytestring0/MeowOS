import { ref, reactive } from 'vue';
import { storage } from './storage';
import type { AnimationPreset, AnimationConfig } from '../types/system';
import { userAnimationConfig } from '@/config/user-config';
class AnimationService {
  private currentPreset = ref<string>('default');
  // 预设动画配置
  private presets: AnimationPreset[] = [
    {
      id: 'none',
      name: '无动画',
      description: '关闭所有动画效果',
      windowOpen: { duration: 0, easing: 'linear', enabled: false },
      windowClose: { duration: 0, easing: 'linear', enabled: false },
      windowMinimize: { duration: 0, easing: 'linear', enabled: false },
      windowMaximize: { duration: 0, easing: 'linear', enabled: false },
      windowMove: { duration: 0, easing: 'linear', enabled: false },
      windowResize: { duration: 0, easing: 'linear', enabled: false },
      desktopIconHover: { duration: 0, easing: 'linear', enabled: false },
      taskbarTransition: { duration: 0, easing: 'linear', enabled: false },
    },
    {
      id: 'default',
      name: '默认动画',
      description: '平衡的动画效果',
      windowOpen: { duration: 300, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', enabled: true },
      windowClose: { duration: 250, easing: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)', enabled: true },
      windowMinimize: {
        duration: 400,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        enabled: true,
      },
      windowMaximize: {
        duration: 350,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        enabled: true,
      },
      windowMove: { duration: 100, easing: 'ease-out', enabled: true },
      windowResize: { duration: 100, easing: 'ease-out', enabled: true },
      desktopIconHover: { duration: 200, easing: 'ease-out', enabled: true },
      taskbarTransition: { duration: 200, easing: 'ease-out', enabled: true },
      wallpaperChange: {
        duration: 1000,
        easing: 'ease-in-out',
        enabled: true,
        description: '翻页动画',
        customAnimation: (oldEl: HTMLElement, newEl: HTMLElement) => {
          // 自定义翻转动画
          const duration = 1000;

          if (oldEl) {
            oldEl.animate(
              [
                {
                  transform: 'perspective(1200px) translate3d(0,0,0) rotate3d(0,1,0,0deg) scale(1)',
                  filter: 'blur(0px)',
                  opacity: 1,
                },
                {
                  transform:
                    'perspective(1200px) translate3d(-30%,0,-200px) rotate3d(0,1,0,-45deg) scale(0.8)',
                  filter: 'blur(4px)',
                  opacity: 0.5,
                },
                {
                  transform:
                    'perspective(1200px) translate3d(-100%,0,-600px) rotate3d(0,1,0,-90deg) scale(0.6)',
                  filter: 'blur(10px)',
                  opacity: 0,
                },
              ],
              { duration, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards' }
            );
          }

          if (newEl) {
            newEl.style.opacity = '0';
            newEl.animate(
              [
                {
                  transform:
                    'perspective(1200px) translate3d(100%,0,-600px) rotate3d(0,1,0,90deg) scale(0.6)',
                  filter: 'blur(10px)',
                  opacity: 0,
                },
                {
                  transform:
                    'perspective(1200px) translate3d(30%,0,-200px) rotate3d(0,1,0,45deg) scale(1.1)',
                  filter: 'blur(4px)',
                  opacity: 0.7,
                },
                {
                  transform: 'perspective(1200px) translate3d(0,0,0) rotate3d(0,1,0,0deg) scale(1)',
                  filter: 'blur(0px)',
                  opacity: 1,
                },
              ],
              { duration, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards' }
            );
          }

          return new Animation();
        },
      }
    },
    {
      id: 'smooth',
      name: '流畅动画',
      description: '更长的动画时间，更流畅的效果',
      windowOpen: { duration: 500, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', enabled: true },
      windowClose: { duration: 400, easing: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)', enabled: true },
      windowMinimize: {
        duration: 600,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        enabled: true,
      },
      windowMaximize: {
        duration: 500,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        enabled: true,
      },
      windowMove: { duration: 150, easing: 'ease-out', enabled: true },
      windowResize: { duration: 150, easing: 'ease-out', enabled: true },
      desktopIconHover: { duration: 300, easing: 'ease-out', enabled: true },
      taskbarTransition: { duration: 300, easing: 'ease-out', enabled: true },
    },
    {
      id: 'fast',
      name: '快速动画',
      description: '更短的动画时间，快速响应',
      windowOpen: { duration: 150, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', enabled: true },
      windowClose: { duration: 100, easing: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)', enabled: true },
      windowMinimize: {
        duration: 200,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        enabled: true,
      },
      windowMaximize: {
        duration: 180,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        enabled: true,
      },
      windowMove: { duration: 50, easing: 'ease-out', enabled: true },
      windowResize: { duration: 50, easing: 'ease-out', enabled: true },
      desktopIconHover: { duration: 100, easing: 'ease-out', enabled: true },
      taskbarTransition: { duration: 100, easing: 'ease-out', enabled: true },
    },
  ];

  constructor() {
    this.presets = [...this.presets, ...(userAnimationConfig as AnimationPreset[])];
    this.loadSettings();
  }

  private async loadSettings() {
    const saved = await storage.getSystemSetting('animationSettings');
    if (saved) {
      this.currentPreset.value = saved.preset || 'default';
    }
    this.applyAnimations();
  }

  private async saveSettings() {
    await storage.setSystemSetting('animationSettings', {
      preset: this.currentPreset.value,
    });
  }

  // 获取当前动画配置
  getCurrentConfig(): AnimationPreset {
    const preset = this.presets.find(p => p.id === this.currentPreset.value) || this.presets[1];
    return {
      ...preset,
    };
  }

  // 设置预设
  async setPreset(presetId: string) {
    const preset = this.presets.find(p => p.id === presetId);
    if (preset) {
      this.currentPreset.value = presetId;
      await this.saveSettings();
      this.applyAnimations();
    }
  }

  // 应用动画到CSS变量
  private applyAnimations() {
    const config = this.getCurrentConfig();
    const root = document.documentElement;

    // 安全地获取动画配置
    const getAnimConfig = (key: string): AnimationConfig => {
      const animConfig = config[key] as AnimationConfig;
      return animConfig || { duration: 0, easing: 'linear', enabled: false };
    };

    // 窗口动画
    const windowOpen = getAnimConfig('windowOpen');
    const windowClose = getAnimConfig('windowClose');
    const windowMinimize = getAnimConfig('windowMinimize');
    const windowMaximize = getAnimConfig('windowMaximize');
    const desktopIconHover = getAnimConfig('desktopIconHover');
    const taskbarTransition = getAnimConfig('taskbarTransition');

    root.style.setProperty('--window-open-duration', `${windowOpen.duration}ms`);
    root.style.setProperty('--window-open-easing', windowOpen.easing);
    root.style.setProperty('--window-close-duration', `${windowClose.duration}ms`);
    root.style.setProperty('--window-close-easing', windowClose.easing);
    root.style.setProperty('--window-minimize-duration', `${windowMinimize.duration}ms`);
    root.style.setProperty('--window-minimize-easing', windowMinimize.easing);
    root.style.setProperty('--window-maximize-duration', `${windowMaximize.duration}ms`);
    root.style.setProperty('--window-maximize-easing', windowMaximize.easing);

    // 交互动画
    root.style.setProperty('--icon-hover-duration', `${desktopIconHover.duration}ms`);
    root.style.setProperty('--icon-hover-easing', desktopIconHover.easing);
    root.style.setProperty('--taskbar-transition-duration', `${taskbarTransition.duration}ms`);
    root.style.setProperty('--taskbar-transition-easing', taskbarTransition.easing);

    // 启用/禁用标志
    root.style.setProperty('--animations-enabled', windowOpen.enabled ? '1' : '0');
  }

  // 获取所有预设
  getPresets(): AnimationPreset[] {
    return this.presets;
  }

  // 当前预设ID
  getCurrentPreset(): string {
    return this.currentPreset.value;
  }

  // 动画元素的辅助方法
  animateElement(
    element: HTMLElement,
    type: string,
    defaultKeyframes?: Keyframe[],
    options?: KeyframeAnimationOptions,
    ...args: any[]
  ): Animation {
    const config = this.getCurrentConfig()[type] as AnimationConfig;
    
    if (!config || !config.enabled) {
      // 如果动画被禁用，立即跳到最后一帧
 const keyframes = defaultKeyframes || [];

    const animationOptions: KeyframeAnimationOptions = {
      fill: 'forwards',
      ...options,
    };

    return element.animate(keyframes, animationOptions);
    }

    // 如果有自定义动画函数，优先使用
    if (config.customAnimation) {
      return config.customAnimation(element, ...args);
    }
    // 使用配置中的 keyframes 或默认的 keyframes
    const keyframes = config.keyframes || defaultKeyframes || [];

    const animationOptions: KeyframeAnimationOptions = {
      duration: config.duration,
      easing: config.easing,
      fill: 'forwards',
      ...config.options,
      ...options,
    };

    return element.animate(keyframes, animationOptions);
  }

  // 窗口打开动画 - 现在支持自定义样式
  animateWindowOpen(element: HTMLElement): Animation {
    return this.animateElement(element, 'windowOpen', [
      {
        opacity: 0,
        transform: 'scale(0.8) translateY(-20px)',
        filter: 'blur(4px)',
      },
      {
        opacity: 1,
        transform: 'scale(1) translateY(0px)',
        filter: 'blur(0px)',
      },
    ]);
  }

  // 窗口关闭动画
  animateWindowClose(element: HTMLElement): Animation {
    return this.animateElement(element, 'windowClose', [
      {
        opacity: 1,
        transform: 'scale(1) translateY(0px)',
        filter: 'blur(0px)',
      },
      {
        opacity: 0,
        transform: 'scale(0.9) translateY(10px)',
        filter: 'blur(2px)',
      },
    ]);
  }

  // 窗口最小化动画
  animateWindowMinimize(element: HTMLElement, targetRect: DOMRect): Animation {
    const elementRect = element.getBoundingClientRect();
    const scaleX = targetRect.width / elementRect.width;
    const scaleY = targetRect.height / elementRect.height;
    const translateX = targetRect.left - elementRect.left;
    const translateY = targetRect.bottom - elementRect.top;

    return this.animateElement(element, 'windowMinimize', [
      {
        opacity: 1,
        transform: 'scale(1) translate(0px, 0px)',
      },
      {
        opacity: 0.3,
        transform: `scale(${scaleX}, ${scaleY}) translate(${translateX}px, ${translateY}px)`,
      },
    ]);
  }

  // 窗口最大化动画
  animateWindowMaximize(element: HTMLElement, isMaximizing: boolean): Animation {
    if (isMaximizing) {
      return this.animateElement(element, 'windowMaximize', [
        { transform: 'scale(1)' },
        { transform: 'scale(1.02)' },
        { transform: 'scale(1)' },
      ]);
    } else {
      return this.animateElement(element, 'windowMaximize', [
        { transform: 'scale(1)' },
        { transform: 'scale(0.98)' },
        { transform: 'scale(1)' },
      ]);
    }
  }
  animateWallpaperChange(oldEl: HTMLElement, newEl: HTMLElement): number {
    const config =
      (this.getCurrentConfig()['wallpaperChange'] as AnimationConfig) ||
      (this.getCurrentConfig().taskbarTransition as AnimationConfig);
    console.log(config);
    if (!config.enabled) {
      if (oldEl) oldEl.style.opacity = '0';
      if (newEl) newEl.style.opacity = '1';
      return 0;
    }

    // 如果有自定义动画，使用自定义动画
    if (config.customAnimation) {
      config.customAnimation(oldEl, newEl);
      return config.duration;
    }

    // 默认旋转动画
    const options: KeyframeAnimationOptions = {
      duration: config.duration * 10 || 1000,
      easing: config.easing || 'ease-in-out',
      fill: 'forwards',
      ...config.options,
    };

    const transformOrigin = '50% 300%';

    if (oldEl) {
      oldEl.style.transformOrigin = transformOrigin;
      const oldKeyframes = config.keyframes || [
        { opacity: 1, transform: 'rotate(0deg)' },
        { opacity: 0, transform: 'rotate(-90deg)' },
      ];
      oldEl.animate(oldKeyframes, options);
    }

    if (newEl) {
      newEl.style.transformOrigin = transformOrigin;
      const newKeyframes = [
        { opacity: 0, transform: 'rotate(90deg) scale(1.5)' },
        { opacity: 1, transform: 'rotate(0deg) scale(1)' },
      ];
      newEl.animate(newKeyframes, options);
    }

    return config.duration * 10 || 1000;
  }
}

export const animationService = new AnimationService();
