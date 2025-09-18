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

  private startTime: number = Date.now();

  constructor() {
  }


  getStartTime(): number {
    return this.startTime;
  }


  resetStartTime(): void {
    this.startTime = Date.now();
  }


  async onMount(): Promise<void> {
    console.log('Terminal app mounted');
  }


  async onUnmount(): Promise<void> {
    console.log('Terminal app unmounted');
  }

}

export default TerminalApp;
