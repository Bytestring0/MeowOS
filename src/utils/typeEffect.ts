/**
 * 打字机效果工具类
 * 提供可配置的打字机动画效果
 */

export interface TypeEffectOptions {
  speed?: number; // 打字速度 (ms)
  cursor?: string; // 光标字符
  showCursor?: boolean; // 是否显示光标
  cursorBlinkSpeed?: number; // 光标闪烁速度 (ms)
  autoStart?: boolean; // 是否自动开始
  loop?: boolean; // 是否循环
  loopDelay?: number; // 循环延迟 (ms)
  onComplete?: () => void; // 完成回调
  onChar?: (char: string, index: number) => void; // 每个字符回调
  deleteSpeed?: number; // 删除速度 (ms，用于循环模式)
  pauseOnComplete?: number; // 完成后暂停时间 (ms)
}

export interface TypeEffectInstance {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  destroy: () => void;
  isRunning: () => boolean;
  isPaused: () => boolean;
  getProgress: () => number;
  updateText: (newText: string) => void;
  updateOptions: (options: Partial<TypeEffectOptions>) => void;
}

export class TypeEffect {
  private element: HTMLElement;
  private originalText: string;
  private currentText: string = '';
  private currentIndex: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private typeTimer: number | null = null;
  private cursorTimer: number | null = null;
  private cursorVisible: boolean = true;
  private isDeleting: boolean = false;
  
  private defaultOptions: Required<TypeEffectOptions> = {
    speed: 100,
    cursor: '|',
    showCursor: true,
    cursorBlinkSpeed: 500,
    autoStart: true,
    loop: false,
    loopDelay: 2000,
    onComplete: () => {},
    onChar: () => {},
    deleteSpeed: 50,
    pauseOnComplete: 1000
  };

  private options: Required<TypeEffectOptions>;

  constructor(element: HTMLElement | string, text: string, options: TypeEffectOptions = {}) {
    this.element = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement 
      : element;
    
    if (!this.element) {
      throw new Error('TypeEffect: Element not found');
    }

    this.originalText = text;
    this.options = { ...this.defaultOptions, ...options };
    
    this.init();
  }

  private init(): void {
    this.element.textContent = '';
    this.currentText = '';
    this.currentIndex = 0;
    this.isDeleting = false;
    
    if (this.options.showCursor) {
      this.startCursorBlink();
    }
    
    if (this.options.autoStart) {
      this.start();
    }
  }

  private startCursorBlink(): void {
    this.cursorTimer = window.setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      this.updateDisplay();
    }, this.options.cursorBlinkSpeed);
  }

  private stopCursorBlink(): void {
    if (this.cursorTimer) {
      clearInterval(this.cursorTimer);
      this.cursorTimer = null;
    }
  }

  private updateDisplay(): void {
    const cursor = this.options.showCursor && this.cursorVisible ? this.options.cursor : '';
    this.element.textContent = this.currentText + cursor;
  }

  private typeNextChar(): void {
    if (this.isPaused) return;

    if (!this.isDeleting) {
      // 打字模式
      if (this.currentIndex < this.originalText.length) {
        const char = this.originalText[this.currentIndex];
        this.currentText += char;
        this.currentIndex++;
        
        this.updateDisplay();
        this.options.onChar(char, this.currentIndex - 1);
        
        this.typeTimer = window.setTimeout(() => {
          this.typeNextChar();
        }, this.options.speed);
      } else {
        // 打字完成
        this.isRunning = false;
        this.options.onComplete();
        
        if (this.options.loop) {
          // 循环模式：暂停后开始删除
          this.typeTimer = window.setTimeout(() => {
            this.isDeleting = true;
            this.isRunning = true;
            this.typeNextChar();
          }, this.options.pauseOnComplete);
        }
      }
    } else {
      // 删除模式
      if (this.currentText.length > 0) {
        this.currentText = this.currentText.slice(0, -1);
        this.currentIndex--;
        
        this.updateDisplay();
        
        this.typeTimer = window.setTimeout(() => {
          this.typeNextChar();
        }, this.options.deleteSpeed);
      } else {
        // 删除完成，重新开始打字
        this.isDeleting = false;
        this.currentIndex = 0;
        
        this.typeTimer = window.setTimeout(() => {
          this.typeNextChar();
        }, this.options.loopDelay);
      }
    }
  }

  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    this.typeNextChar();
  }

  public pause(): void {
    this.isPaused = true;
    if (this.typeTimer) {
      clearTimeout(this.typeTimer);
      this.typeTimer = null;
    }
  }

  public resume(): void {
    if (!this.isPaused) return;
    
    this.isPaused = false;
    if (this.isRunning) {
      this.typeNextChar();
    }
  }

  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.typeTimer) {
      clearTimeout(this.typeTimer);
      this.typeTimer = null;
    }
  }

  public reset(): void {
    this.stop();
    this.currentText = '';
    this.currentIndex = 0;
    this.isDeleting = false;
    this.updateDisplay();
  }

  public destroy(): void {
    this.stop();
    this.stopCursorBlink();
    this.element.textContent = this.originalText;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public getProgress(): number {
    return this.originalText.length > 0 ? this.currentIndex / this.originalText.length : 0;
  }

  public updateText(newText: string): void {
    const wasRunning = this.isRunning;
    this.stop();
    this.originalText = newText;
    this.reset();
    
    if (wasRunning && this.options.autoStart) {
      this.start();
    }
  }

  public updateOptions(newOptions: Partial<TypeEffectOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    if (this.options.showCursor && !this.cursorTimer) {
      this.startCursorBlink();
    } else if (!this.options.showCursor && this.cursorTimer) {
      this.stopCursorBlink();
      this.updateDisplay();
    }
  }

  public static create(
    element: HTMLElement | string, 
    text: string, 
    options: TypeEffectOptions = {}
  ): TypeEffectInstance {
    const instance = new TypeEffect(element, text, options);
    
    return {
      start: () => instance.start(),
      pause: () => instance.pause(),
      resume: () => instance.resume(),
      stop: () => instance.stop(),
      reset: () => instance.reset(),
      destroy: () => instance.destroy(),
      isRunning: () => instance.getIsRunning(),
      isPaused: () => instance.getIsPaused(),
      getProgress: () => instance.getProgress(),
      updateText: (newText: string) => instance.updateText(newText),
      updateOptions: (options: Partial<TypeEffectOptions>) => instance.updateOptions(options)
    };
  }

  // 便捷方法：在指定元素中创建打字机效果
  public static async type(
    element: HTMLElement | string,
    text: string,
    options: TypeEffectOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      const instance = TypeEffect.create(element, text, {
        ...options,
        onComplete: () => {
          options.onComplete?.();
          resolve();
        }
      });
    });
  }

  // 便捷方法：创建多行打字机效果
  public static async typeLines(
    element: HTMLElement | string,
    lines: string[],
    options: TypeEffectOptions = {}
  ): Promise<void> {
    const el = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement 
      : element;
    
    if (!el) {
      throw new Error('TypeEffect: Element not found');
    }

    for (let i = 0; i < lines.length; i++) {
      await TypeEffect.type(el, lines[i], options);
      
      if (i < lines.length - 1) {
        el.innerHTML += '<br>';
        await new Promise(resolve => setTimeout(resolve, options.speed || 100));
      }
    }
  }

  // 便捷方法：创建实时打字机效果（适用于终端）
  public static createLive(
    element: HTMLElement | string,
    options: TypeEffectOptions = {}
  ): {
    type: (text: string) => Promise<void>;
    typeLine: (text: string) => Promise<void>;
    clear: () => void;
    destroy: () => void;
  } {
    const el = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement 
      : element;
    
    if (!el) {
      throw new Error('TypeEffect: Element not found');
    }

    let currentInstance: TypeEffectInstance | null = null;

    return {
      async type(text: string): Promise<void> {
        if (currentInstance) {
          currentInstance.destroy();
        }
        
        return new Promise((resolve) => {
          currentInstance = TypeEffect.create(el, text, {
            ...options,
            onComplete: () => {
              options.onComplete?.();
              resolve();
            }
          });
        });
      },

      async typeLine(text: string): Promise<void> {
        await this.type(text);
        el.innerHTML += '<br>';
      },

      clear(): void {
        if (currentInstance) {
          currentInstance.destroy();
          currentInstance = null;
        }
        el.innerHTML = '';
      },

      destroy(): void {
        if (currentInstance) {
          currentInstance.destroy();
          currentInstance = null;
        }
      }
    };
  }
}

export default TypeEffect;
