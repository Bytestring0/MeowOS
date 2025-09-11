// MeowOS 彩蛋系统
import { eventBus } from './event';

export class EasterEggService {
  private static instance: EasterEggService
  private keySequence: string[] = []
  private readonly konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
  private readonly meowCode = ['KeyM', 'KeyE', 'KeyO', 'KeyW']
  private catModeActive = false
  
  constructor() {
    this.initializeEasterEggs()
  }
  
  static getInstance(): EasterEggService {
    if (!EasterEggService.instance) {
      EasterEggService.instance = new EasterEggService()
    }
    return EasterEggService.instance
  }
  
  private initializeEasterEggs() {
    document.addEventListener('keydown', (e) => {
      this.handleKeyPress(e.code)
    })
    
    // 点击MeowOS logo彩蛋
    this.setupLogoClickEasterEgg()
    
    // 时间彩蛋
    this.setupTimeEasterEggs()
  }
  
  private handleKeyPress(keyCode: string) {
    this.keySequence.push(keyCode)
    
    // 保持序列长度不超过最长彩蛋代码
    if (this.keySequence.length > Math.max(this.konamiCode.length, this.meowCode.length)) {
      this.keySequence.shift()
    }
    
    this.checkForEasterEggs()
  }
  
  private checkForEasterEggs() {
    // 检查Konami代码
    if (this.sequenceMatches(this.konamiCode)) {
      this.triggerKonamiEasterEgg()
      this.keySequence = []
    }
    
    // 检查MEOW代码
    if (this.sequenceMatches(this.meowCode)) {
      this.triggerMeowEasterEgg()
      this.keySequence = []
    }
  }
  
  private sequenceMatches(targetSequence: string[]): boolean {
    if (this.keySequence.length < targetSequence.length) return false
    
    const recent = this.keySequence.slice(-targetSequence.length)
    return recent.every((key, index) => key === targetSequence[index])
  }
  
  private triggerKonamiEasterEgg() {
    this.showNotification('🎮 Konami Code Activated!', '30 lives granted! (Just kidding, this is an OS 😸)')
    this.startRainbowMode()
    
    // 播放成功音效（如果有音频系统）
    eventBus.emit('audio:play', { sound: 'success' })
  }
  
  private triggerMeowEasterEgg() {
    this.catModeActive = !this.catModeActive
    
    if (this.catModeActive) {
      this.activateCatMode()
      this.showNotification('🐱 Cat Mode Activated!', 'Meow meow! Everything is now extra cute!')
    } else {
      this.deactivateCatMode()
      this.showNotification('😸 Cat Mode Deactivated', 'Back to normal... but still cute!')
    }
  }
  
  private setupLogoClickEasterEgg() {
    let clickCount = 0
    let lastClickTime = 0
    
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('brand') || target.closest('.brand')) {
        const now = Date.now()
        
        if (now - lastClickTime < 500) {
          clickCount++
        } else {
          clickCount = 1
        }
        
        lastClickTime = now
        
        if (clickCount === 5) {
          this.triggerLogoEasterEgg()
          clickCount = 0
        }
      }
    })
  }
  
  private triggerLogoEasterEgg() {
    this.showNotification('🎯 You found the logo easter egg!', 'You really like clicking things, don\'t you? 😹')
    this.spawnFloatingCats()
  }
  
  private setupTimeEasterEggs() {
    setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      
      // 喵喵时间 (11:11 或 22:22)
      if ((hours === 11 || hours === 23) && minutes === 11) {
        this.showNotification('🕐 Meow Time!', 'It\'s 11:11! Make a wish! 🌟')
      }
      
      // 午夜彩蛋
      if (hours === 0 && minutes === 0) {
        this.showNotification('🌙 Midnight Meow', 'Good night from MeowOS! Sweet dreams! 😴')
      }
      
      // 下午茶时间
      if (hours === 15 && minutes === 0) {
        this.showNotification('☕ Tea Time!', 'Time for a break! Even cats need their afternoon nap 😸')
      }
    }, 60000) // 每分钟检查一次
  }
  
  private activateCatMode() {
    document.body.classList.add('cat-mode')
    
    // 添加猫咪主题CSS
    const style = document.createElement('style')
    style.id = 'cat-mode-styles'
    style.textContent = `
      .cat-mode * {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="28" font-size="24">🐾</text></svg>'), auto !important;
      }
      
      .cat-mode .window-header {
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
      }
      
      .cat-mode .taskbar {
        background: linear-gradient(45deg, rgba(255,107,107,0.9), rgba(78,205,196,0.9)) !important;
      }
      
      @keyframes purr {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-2px); }
      }
      
      .cat-mode .desktop-icon {
        animation: purr 2s ease-in-out infinite;
      }
    `
    document.head.appendChild(style)
    
    // 替换所有文本中的句号为喵
    this.replaceTextWithMeow()
  }
  
  private deactivateCatMode() {
    document.body.classList.remove('cat-mode')
    const catModeStyles = document.getElementById('cat-mode-styles')
    if (catModeStyles) {
      catModeStyles.remove()
    }
  }
  
  private replaceTextWithMeow() {
    console.log('🐱 Cat mode activated! Meow meow!')
  }
  
  private startRainbowMode() {
    const style = document.createElement('style')
    style.id = 'rainbow-mode-styles'
    style.textContent = `
      @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
      
      .rainbow-mode {
        animation: rainbow 2s linear infinite;
      }
    `
    document.head.appendChild(style)
    
    document.body.classList.add('rainbow-mode')
    
    setTimeout(() => {
      document.body.classList.remove('rainbow-mode')
      const rainbowStyles = document.getElementById('rainbow-mode-styles')
      if (rainbowStyles) {
        rainbowStyles.remove()
      }
    }, 10000) // 10秒后停止彩虹模式
  }
  
  private spawnFloatingCats() {
    const cats = ['🐱', '😸', '😹', '😻', '🙀', '😿', '😾']
    
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const cat = document.createElement('div')
        cat.textContent = cats[Math.floor(Math.random() * cats.length)]
        cat.style.cssText = `
          position: fixed;
          font-size: 32px;
          pointer-events: none;
          z-index: 10000;
          left: ${Math.random() * window.innerWidth}px;
          top: ${window.innerHeight}px;
          animation: floatUp 3s ease-out forwards;
        `
        
        const floatKeyframes = `
          @keyframes floatUp {
            0% { transform: translateY(0px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-${window.innerHeight + 100}px) rotate(360deg); opacity: 0; }
          }
        `
        
        if (!document.getElementById('float-animation')) {
          const animationStyle = document.createElement('style')
          animationStyle.id = 'float-animation'
          animationStyle.textContent = floatKeyframes
          document.head.appendChild(animationStyle)
        }
        
        document.body.appendChild(cat)
        
        setTimeout(() => {
          cat.remove()
        }, 3000)
      }, i * 200)
    }
  }
  
  private showNotification(title: string, message: string) {
    // 创建通知元素
    const notification = document.createElement('div')
    notification.className = 'easter-egg-notification'
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
    `
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 320px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `
    
    const titleStyle = `
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
    `
    
    const messageStyle = `
      font-size: 12px;
      opacity: 0.9;
      line-height: 1.4;
    `
    
    notification.querySelector('.notification-title')!.setAttribute('style', titleStyle)
    notification.querySelector('.notification-message')!.setAttribute('style', messageStyle)
    
    document.body.appendChild(notification)
    
    // 动画显示
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 100)
    
    // 3秒后隐藏
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 3000)
  }
}

// 全局访问
export const easterEggs = EasterEggService.getInstance()
