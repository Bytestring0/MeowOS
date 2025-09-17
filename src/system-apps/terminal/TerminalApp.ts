/**
 * 终端应用类
 */

export interface TerminalAppConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
}

export class TerminalApp {
  public readonly id = 'terminal';
  public readonly name = '终端';
  public readonly description = '类Linux终端模拟器，支持多种命令操作';
  public readonly version = '1.0.0';
  public readonly icon = 'icons/terminal.svg';
  public readonly type = 'system-app';

  private startTime: number = Date.now();

  constructor() {
    // 初始化终端应用
  }

  // 获取应用启动时间
  getStartTime(): number {
    return this.startTime;
  }

  // 重置启动时间
  resetStartTime(): void {
    this.startTime = Date.now();
  }

  // 应用启动时调用
  async onMount(): Promise<void> {
    console.log('Terminal app mounted');
  }

  // 应用销毁时调用
  async onUnmount(): Promise<void> {
    console.log('Terminal app unmounted');
  }

  // 获取应用配置
  getConfig(): TerminalAppConfig {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      icon: this.icon
    };
  }
}

export default TerminalApp;
