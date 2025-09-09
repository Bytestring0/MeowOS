// 默认图标服务
export class DefaultIconService {
  private static readonly DEFAULT_ICONS = {
    app: '/icons/default-app.svg',
    service: '/icons/default-app.svg',
    widget: '/icons/default-app.svg',
    cli: '/icons/default-app.svg',
    system: '/icons/default-app.svg',
    unknown: '/icons/default-app.svg'
  }
  
  private static readonly CATEGORY_ICONS = {
    productivity: '📝',
    utilities: '🛠️',
    entertainment: '🎮',
    development: '👨‍💻',
    system: '⚙️',
    media: '🎬',
    communication: '💬',
    graphics: '🎨',
    education: '📚',
    finance: '💰',
    health: '🏥',
    travel: '✈️',
    sports: '⚽',
    news: '📰',
    weather: '🌤️',
    social: '👥',
    shopping: '🛒',
    food: '🍔',
    music: '🎵',
    photo: '📷'
  }
  
  static getDefaultIcon(manifest: {
    type?: string
    category?: string
    name?: string
    icon?: string
  }): string {
    // 如果已有图标，直接返回
    if (manifest.icon && manifest.icon.trim()) {
      return manifest.icon
    }
    
    // 根据分类返回图标
    if (manifest.category && this.CATEGORY_ICONS[manifest.category as keyof typeof this.CATEGORY_ICONS]) {
      return this.CATEGORY_ICONS[manifest.category as keyof typeof this.CATEGORY_ICONS]
    }
    
    // 根据类型返回图标
    if (manifest.type && this.DEFAULT_ICONS[manifest.type as keyof typeof this.DEFAULT_ICONS]) {
      return this.DEFAULT_ICONS[manifest.type as keyof typeof this.DEFAULT_ICONS]
    }
    
    // 根据名称猜测图标
    if (manifest.name) {
      const name = manifest.name.toLowerCase()
      
      if (name.includes('note') || name.includes('text') || name.includes('editor')) return '/icons/default-app.svg'
      if (name.includes('calc') || name.includes('math')) return '/icons/default-app.svg'
      if (name.includes('file') || name.includes('manager') || name.includes('explorer')) return '/icons/default-app.svg'
      if (name.includes('terminal') || name.includes('console') || name.includes('cmd')) return '/icons/default-app.svg'
      if (name.includes('clock') || name.includes('time')) return '/icons/default-app.svg'
      if (name.includes('monitor') || name.includes('system') || name.includes('task')) return '/icons/default-app.svg'
      if (name.includes('setting') || name.includes('config') || name.includes('preference')) return '/icons/default-app.svg'
      if (name.includes('paint') || name.includes('draw') || name.includes('image')) return '/icons/default-app.svg'
      if (name.includes('music') || name.includes('audio') || name.includes('sound')) return '/icons/default-app.svg'
      if (name.includes('video') || name.includes('movie') || name.includes('player')) return '/icons/default-app.svg'
      if (name.includes('game')) return '/icons/default-app.svg'
      if (name.includes('chat') || name.includes('message')) return '/icons/default-app.svg'
      if (name.includes('mail') || name.includes('email')) return '/icons/default-app.svg'
      if (name.includes('browser') || name.includes('web')) return '/icons/default-app.svg'
      if (name.includes('camera') || name.includes('photo')) return '/icons/default-app.svg'
      if (name.includes('weather')) return '/icons/default-app.svg'
      if (name.includes('calendar')) return '/icons/default-app.svg'
      if (name.includes('contact') || name.includes('phone')) return '/icons/default-app.svg'
      if (name.includes('map') || name.includes('location')) return '/icons/default-app.svg'
    }
    
    // 默认图标
    return this.DEFAULT_ICONS.unknown
  }
  
  // 生成主题相关的SVG图标
  static generateThemeIcon(type: string, color: string = '#4A90E2'): string {
    const svgIcons: Record<string, string> = {
      app: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="${color}" stroke="${color}" stroke-width="2"/>
        <rect x="8" y="8" width="16" height="16" rx="4" fill="white" opacity="0.9"/>
        <circle cx="16" cy="16" r="4" fill="${color}"/>
      </svg>`,
      service: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="${color}" stroke="${color}" stroke-width="2"/>
        <path d="M16 8v8l6 4" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      system: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4l-3 3H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-5l-3-3z" fill="${color}"/>
        <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
        <circle cx="16" cy="16" r="3" fill="${color}"/>
      </svg>`
    }
    
    return svgIcons[type] || svgIcons.app
  }
  
  // MeowOS主题的猫咪图标
  static getMeowOSIcon(variant: 'happy' | 'sleepy' | 'playful' | 'cool' = 'happy'): string {
    const variants = {
      happy: '😸',
      sleepy: '😴',
      playful: '😹',
      cool: '😎'
    }
    return variants[variant]
  }
}

export const defaultIcons = DefaultIconService
