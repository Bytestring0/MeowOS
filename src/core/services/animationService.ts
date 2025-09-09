import { ref, reactive } from 'vue'
import { storage } from '../api/storage'

export interface AnimationConfig {
  duration: number // 毫秒
  easing: string // CSS 缓动函数
  enabled: boolean
}

export interface AnimationPreset {
  id: string
  name: string
  description: string
  windowOpen: AnimationConfig
  windowClose: AnimationConfig
  windowMinimize: AnimationConfig
  windowMaximize: AnimationConfig
  windowMove: AnimationConfig
  windowResize: AnimationConfig
  desktopIconHover: AnimationConfig
  taskbarTransition: AnimationConfig
}

class AnimationService {
  private currentPreset = ref<string>('default')
  private customConfig = reactive<Partial<AnimationPreset>>({})
  
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
      taskbarTransition: { duration: 0, easing: 'linear', enabled: false }
    },
    {
      id: 'default',
      name: '默认动画',
      description: '平衡的动画效果',
      windowOpen: { duration: 300, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', enabled: true },
      windowClose: { duration: 250, easing: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)', enabled: true },
      windowMinimize: { duration: 400, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', enabled: true },
      windowMaximize: { duration: 350, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', enabled: true },
      windowMove: { duration: 100, easing: 'ease-out', enabled: true },
      windowResize: { duration: 100, easing: 'ease-out', enabled: true },
      desktopIconHover: { duration: 200, easing: 'ease-out', enabled: true },
      taskbarTransition: { duration: 200, easing: 'ease-out', enabled: true }
    },
    {
      id: 'smooth',
      name: '流畅动画',
      description: '更长的动画时间，更流畅的效果',
      windowOpen: { duration: 500, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', enabled: true },
      windowClose: { duration: 400, easing: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)', enabled: true },
      windowMinimize: { duration: 600, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', enabled: true },
      windowMaximize: { duration: 500, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', enabled: true },
      windowMove: { duration: 150, easing: 'ease-out', enabled: true },
      windowResize: { duration: 150, easing: 'ease-out', enabled: true },
      desktopIconHover: { duration: 300, easing: 'ease-out', enabled: true },
      taskbarTransition: { duration: 300, easing: 'ease-out', enabled: true }
    },
    {
      id: 'fast',
      name: '快速动画',
      description: '更短的动画时间，快速响应',
      windowOpen: { duration: 150, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', enabled: true },
      windowClose: { duration: 100, easing: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)', enabled: true },
      windowMinimize: { duration: 200, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', enabled: true },
      windowMaximize: { duration: 180, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', enabled: true },
      windowMove: { duration: 50, easing: 'ease-out', enabled: true },
      windowResize: { duration: 50, easing: 'ease-out', enabled: true },
      desktopIconHover: { duration: 100, easing: 'ease-out', enabled: true },
      taskbarTransition: { duration: 100, easing: 'ease-out', enabled: true }
    },
    {
      id: 'bouncy',
      name: '弹性动画',
      description: '带有弹性效果的动画',
      windowOpen: { duration: 600, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true },
      windowClose: { duration: 400, easing: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)', enabled: true },
      windowMinimize: { duration: 700, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true },
      windowMaximize: { duration: 600, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true },
      windowMove: { duration: 200, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true },
      windowResize: { duration: 200, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true },
      desktopIconHover: { duration: 400, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true },
      taskbarTransition: { duration: 300, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true }
    }
  ]

  constructor() {
    this.loadSettings()
  }

  private async loadSettings() {
    const saved = await storage.getSystemSetting('animationSettings')
    if (saved) {
      this.currentPreset.value = saved.preset || 'default'
      this.customConfig = { ...this.customConfig, ...saved.customConfig }
    }
    this.applyAnimations()
  }

  private async saveSettings() {
    await storage.setSystemSetting('animationSettings', {
      preset: this.currentPreset.value,
      customConfig: this.customConfig
    })
  }

  // 获取当前动画配置
  getCurrentConfig(): AnimationPreset {
    const preset = this.presets.find(p => p.id === this.currentPreset.value) || this.presets[1]
    return {
      ...preset,
      ...this.customConfig
    }
  }

  // 设置预设
  async setPreset(presetId: string) {
    const preset = this.presets.find(p => p.id === presetId)
    if (preset) {
      this.currentPreset.value = presetId
      await this.saveSettings()
      this.applyAnimations()
    }
  }

  // 自定义动画配置
  async setCustomConfig(config: Partial<AnimationPreset>) {
    this.customConfig = { ...this.customConfig, ...config }
    await this.saveSettings()
    this.applyAnimations()
  }

  // 应用动画到CSS变量
  private applyAnimations() {
    const config = this.getCurrentConfig()
    const root = document.documentElement

    // 窗口动画
    root.style.setProperty('--window-open-duration', `${config.windowOpen.duration}ms`)
    root.style.setProperty('--window-open-easing', config.windowOpen.easing)
    root.style.setProperty('--window-close-duration', `${config.windowClose.duration}ms`)
    root.style.setProperty('--window-close-easing', config.windowClose.easing)
    root.style.setProperty('--window-minimize-duration', `${config.windowMinimize.duration}ms`)
    root.style.setProperty('--window-minimize-easing', config.windowMinimize.easing)
    root.style.setProperty('--window-maximize-duration', `${config.windowMaximize.duration}ms`)
    root.style.setProperty('--window-maximize-easing', config.windowMaximize.easing)

    // 交互动画
    root.style.setProperty('--icon-hover-duration', `${config.desktopIconHover.duration}ms`)
    root.style.setProperty('--icon-hover-easing', config.desktopIconHover.easing)
    root.style.setProperty('--taskbar-transition-duration', `${config.taskbarTransition.duration}ms`)
    root.style.setProperty('--taskbar-transition-easing', config.taskbarTransition.easing)

    // 启用/禁用标志
    root.style.setProperty('--animations-enabled', config.windowOpen.enabled ? '1' : '0')
  }

  // 获取所有预设
  getPresets(): AnimationPreset[] {
    return this.presets
  }

  // 当前预设ID
  getCurrentPreset(): string {
    return this.currentPreset.value
  }

  // 动画元素的辅助方法
  animateElement(
    element: HTMLElement, 
    type: keyof AnimationPreset,
    keyframes: Keyframe[],
    options?: KeyframeAnimationOptions
  ): Animation {
    const config = this.getCurrentConfig()[type] as AnimationConfig
    
    if (!config.enabled) {
      // 如果动画被禁用，立即跳到最后一帧
      const lastFrame = keyframes[keyframes.length - 1]
      Object.assign(element.style, lastFrame)
      return new Animation() // 返回空动画
    }

    const animationOptions: KeyframeAnimationOptions = {
      duration: config.duration,
      easing: config.easing,
      fill: 'forwards',
      ...options
    }

    return element.animate(keyframes, animationOptions)
  }

  // 窗口打开动画
  animateWindowOpen(element: HTMLElement): Animation {
    return this.animateElement(element, 'windowOpen', [
      { 
        opacity: 0, 
        transform: 'scale(0.8) translateY(-20px)',
        filter: 'blur(4px)'
      },
      { 
        opacity: 1, 
        transform: 'scale(1) translateY(0px)',
        filter: 'blur(0px)'
      }
    ])
  }

  // 窗口关闭动画
  animateWindowClose(element: HTMLElement): Animation {
    return this.animateElement(element, 'windowClose', [
      { 
        opacity: 1, 
        transform: 'scale(1) translateY(0px)',
        filter: 'blur(0px)'
      },
      { 
        opacity: 0, 
        transform: 'scale(0.9) translateY(10px)',
        filter: 'blur(2px)'
      }
    ])
  }

  // 窗口最小化动画
  animateWindowMinimize(element: HTMLElement, targetRect: DOMRect): Animation {
    const elementRect = element.getBoundingClientRect()
    const scaleX = targetRect.width / elementRect.width
    const scaleY = targetRect.height / elementRect.height
    const translateX = targetRect.left - elementRect.left
    const translateY = targetRect.bottom - elementRect.top

    return this.animateElement(element, 'windowMinimize', [
      { 
        opacity: 1, 
        transform: 'scale(1) translate(0px, 0px)'
      },
      { 
        opacity: 0.3, 
        transform: `scale(${scaleX}, ${scaleY}) translate(${translateX}px, ${translateY}px)`
      }
    ])
  }

  // 窗口最大化动画
  animateWindowMaximize(element: HTMLElement, isMaximizing: boolean): Animation {
    if (isMaximizing) {
      return this.animateElement(element, 'windowMaximize', [
        { transform: 'scale(1)' },
        { transform: 'scale(1.02)' },
        { transform: 'scale(1)' }
      ])
    } else {
      return this.animateElement(element, 'windowMaximize', [
        { transform: 'scale(1)' },
        { transform: 'scale(0.98)' },
        { transform: 'scale(1)' }
      ])
    }
  }
}

export const animationService = new AnimationService()
