import { defineComponent, ref, nextTick, onMounted } from 'vue';
import { system } from '../../core/api/system';
import { storage } from '../../core/api/storage';

export class TerminalApp {
  id = 'system-terminal';
  name = '终端';
  
  private history: string[] = [];
  private historyIndex = -1;
  private systemStartTime = Date.now();
  
  constructor() {
    this.loadHistory();
  }
  
  private async loadHistory() {
    const savedHistory = await storage.getAppSetting('system-terminal', 'history');
    if (savedHistory && Array.isArray(savedHistory)) {
      this.history = savedHistory;
    }
  }
  
  private async saveHistory() {
    // 只保存最近的100条历史记录
    const historyToSave = this.history.slice(-100);
    await storage.setAppSetting('system-terminal', 'history', historyToSave);
  }
  
  addToHistory(command: string) {
    if (command.trim() && this.history[this.history.length - 1] !== command) {
      this.history.push(command);
      this.saveHistory();
    }
    this.historyIndex = this.history.length;
  }
  
  getHistoryCommand(direction: 'up' | 'down'): string {
    if (direction === 'up' && this.historyIndex > 0) {
      this.historyIndex--;
    } else if (direction === 'down' && this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
    } else if (direction === 'down' && this.historyIndex === this.history.length - 1) {
      this.historyIndex = this.history.length;
      return '';
    }
    
    return this.history[this.historyIndex] || '';
  }
  
  getSystemInfo() {
    const uptimeMs = Date.now() - this.systemStartTime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    
    return {
      version: '1.0.0',
      apps: system.listApps().length,
      windows: system.getWindows().length,
      theme: system.theme,
      wallpaper: system.wallpaper,
      uptime: {
        total: uptimeMs,
        formatted: `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`
      },
      memory: `${navigator.hardwareConcurrency || 4} cores`,
      screen: `${screen.width}x${screen.height}`,
      userAgent: navigator.userAgent.split(' ')[0],
      language: navigator.language,
      platform: navigator.platform,
      online: navigator.onLine
    };
  }
  
  executeCommand(command: string): string {
    const cmd = command.trim().toLowerCase();
    const args = cmd.split(' ').slice(1);
    
    switch (cmd.split(' ')[0]) {
      case 'help':
        return `可用命令:
help - 显示帮助信息
clear - 清空终端
sysinfo - 显示系统信息
neofetch - 显示系统信息(美化版)
uptime - 显示系统运行时间
memory - 显示内存使用情况
history - 显示命令历史
date - 显示当前时间
apps - 列出所有应用
windows - 列出所有窗口
open <app-id> - 打开应用
theme <theme-id> - 切换主题
wallpaper <value> - 设置壁纸
echo <text> - 输出文本
calc - 打开计算器
files - 打开文件管理器
monitor - 打开系统监视器
clock - 打开时钟应用
notes - 打开记事本
paint - 打开绘图板`;
      
      case 'clear':
        return 'CLEAR_TERMINAL';
      
      case 'neofetch':
        const neoInfo = this.getSystemInfo();
        return `
       ___           ___           ___           ___     
      /\\__\\         /\\  \\         /\\  \\         /\\__\\    
     /::|  |       /::\\  \\       /::\\  \\       /:/  /    
    /:|:|  |      /:/\\:\\  \\     /:/\\:\\  \\     /:/  /     
   /:/|:|__|__   /::\\~\\:\\  \\   /:/  \\:\\  \\   /:/  /  ___ 
  /:/ |::::\\__\\ /:/\\:\\ \\:\\__\\ /:/__/ \\:\\__\\ /:/__/  /\\__\\
  \\/__/~~/:/  / \\:\\~\\:\\ \\/__/ \\:\\  \\ /:/  / \\:\\  \\ /:/  /
        /:/  /   \\:\\ \\:\\__\\    \\:\\  /:/  /   \\:\\  /:/  / 
       /:/  /     \\:\\ \\/__/     \\:\\/:/  /     \\:\\/:/  /  
      /:/  /       \\:\\__\\        \\::/  /       \\::/  /   
      \\/__/         \\/__/         \\/__/         \\/__/    

╭─────────────────────────────────────────────────────╮
│  OS: MeowOS v${neoInfo.version}                     │
│  Host: ${neoInfo.userAgent}                        │
│  Theme: ${neoInfo.theme}                           │
│  Uptime: ${neoInfo.uptime.formatted}               │
│  Apps: ${neoInfo.apps} installed                   │
│  Windows: ${neoInfo.windows} open                  │
│  Resolution: ${neoInfo.screen}                     │
│  CPU Cores: ${navigator.hardwareConcurrency || 'Unknown'}    │
│  Language: ${neoInfo.language}                     │
│  Platform: ${neoInfo.platform}                     │
│  Network: ${neoInfo.online ? 'Online' : 'Offline'} │
╰─────────────────────────────────────────────────────╯`;
      
      case 'sysinfo':
        const info = this.getSystemInfo();
        return `MeowOS 系统信息
═══════════════════════════════════════════════
版本          : ${info.version}
运行时间      : ${info.uptime.formatted}
已安装应用    : ${info.apps}
打开的窗口    : ${info.windows}
当前主题      : ${info.theme}
屏幕分辨率    : ${info.screen}
CPU核心数     : ${navigator.hardwareConcurrency || '未知'}
浏览器        : ${info.userAgent}
系统语言      : ${info.language}
操作系统      : ${info.platform}
网络状态      : ${info.online ? '已连接' : '离线'}`;
      
      case 'uptime':
        const uptimeInfo = this.getSystemInfo().uptime;
        return `系统运行时间: ${uptimeInfo.formatted}`;
      
      case 'memory':
        if ((performance as any).memory) {
          const mem = (performance as any).memory;
          return `内存使用情况:
已使用: ${Math.round(mem.usedJSHeapSize / 1024 / 1024)}MB
总计: ${Math.round(mem.totalJSHeapSize / 1024 / 1024)}MB
限制: ${Math.round(mem.jsHeapSizeLimit / 1024 / 1024)}MB`;
        }
        return '内存信息不可用';
      
      case 'history':
        if (this.history.length === 0) {
          return '历史记录为空';
        }
        return `命令历史 (最近${Math.min(this.history.length, 20)}条):
${this.history.slice(-20).map((cmd, i) => `  ${this.history.length - 20 + i + 1}. ${cmd}`).join('\n')}`;
      
      case 'date':
        return new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      
      case 'apps':
        return system.listApps().map(app => `${app.id} - ${app.name}`).join('\n');
      
      case 'windows':
        return system.getWindows().map(w => `${w.id} - ${w.title} (${w.isMinimized ? '最小化' : '显示'})`).join('\n');
      
      case 'open':
        if (args[0]) {
          system.openApp(args[0]);
          return `正在打开应用: ${args[0]}`;
        }
        return '用法: open <app-id>';
      
      case 'theme':
        if (args[0]) {
          system.setTheme(args[0]);
          return `主题已切换到: ${args[0]}`;
        }
        return '用法: theme <theme-id> (light/dark/glass)';
      
      case 'wallpaper':
        if (args[0]) {
          system.setWallpaper(args.join(' '));
          return `壁纸已设置为: ${args.join(' ')}`;
        }
        return '用法: wallpaper <url-or-color>';
      
      case 'echo':
        return args.join(' ');
      
      // 快捷命令
      case 'calc':
      case 'calculator':
        system.openApp('system-calculator');
        return '正在打开计算器...';
      
      case 'files':
      case 'file':
      case 'fm':
      case 'explorer':
        system.openApp('system-filemanager');
        return '正在打开文件管理器...';
      
      case 'monitor':
      case 'sysmon':
      case 'task':
        system.openApp('system-monitor');
        return '正在打开系统监视器...';
      
      case 'clock':
      case 'time':
        system.openApp('system-clock');
        return '正在打开时钟应用...';
      
      case 'notes':
      case 'note':
      case 'notepad':
        system.openApp('system-notes');
        return '正在打开记事本...';
      
      case 'paint':
        system.openApp('system-paint');
        return '正在打开绘图板...';
      
      default:
        return `未知命令: ${cmd.split(' ')[0]}. 输入 'help' 查看可用命令`;
    }
  }
}
