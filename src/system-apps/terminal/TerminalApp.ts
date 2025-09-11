import { reactive, nextTick } from 'vue';
import { system } from '../../core/api/system';
import { storage } from '../../core/api/storage';

export interface OutputLine {
  text: string;
  type: 'command' | 'output' | 'error';
}

export class TerminalApp {
  id = 'system-terminal';
  name = '终端';
  
  // 响应式状态
  public state = reactive({
    output: [
      { text: '欢迎使用 MeowOS Terminal!', type: 'output' },
      { text: '输入 "help" 查看可用命令', type: 'output' },
      { text: '', type: 'output' }
    ] as OutputLine[],
    currentInput: '',
    isLoading: false
  });
  
  private history: string[] = [];
  private historyIndex = -1;
  private systemStartTime = Date.now();
  private commands = [
    'help', 'clear', 'sysinfo', 'neofetch', 'uptime', 'memory', 'history', 
    'date', 'apps', 'windows', 'open', 'theme', 'wallpaper', 'echo',
    'calc', 'calculator', 'files', 'file', 'fm', 'explorer', 'monitor',
    'sysmon', 'task', 'clock', 'time', 'notes', 'note', 'notepad', 'paint',
    'meow', 'whoami', 'pwd', 'ls', 'dir', 'cat', 'fortune', 'cowsay', 'ps', 'top', 'tree'
  ];
  
  constructor() {
    this.loadHistory();
  }
  
  // 初始化方法
  public async initialize() {
    await this.loadHistory();
  }
  
  // 处理键盘事件
  public handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.navigateHistory('down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.autoComplete();
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      this.cancelCommand();
    }
  }
  
  // 执行命令
  public executeCommand() {
    const command = this.state.currentInput.trim();
    if (!command) return;

    // 添加命令到输出
    this.state.output.push({ text: command, type: 'command' });
    
    // 添加到历史记录
    this.addToHistory(command);

    // 执行命令
    try {
      const result = this.processCommand(command);
      
      if (result === 'CLEAR_TERMINAL') {
        this.clearTerminal();
      } else {
        // 处理多行输出
        const lines = result!.split('\n');
        lines.forEach((line: string) => {
          this.state.output.push({ text: line, type: 'output' });
        });
      }
    } catch (error) {
      this.state.output.push({ 
        text: `错误: ${error instanceof Error ? error.message : String(error)}`, 
        type: 'error' 
      });
    }

    // 清空输入
    this.state.currentInput = '';
  }
  
  // 历史记录导航
  public navigateHistory(direction: 'up' | 'down') {
    const command = this.getHistoryCommand(direction);
    this.state.currentInput = command;
  }
  
  // 自动补全
  public autoComplete() {
    const input = this.state.currentInput.trim();
    if (!input) return;
    
    const matches = this.commands.filter(cmd => cmd.startsWith(input.toLowerCase()));
    
    if (matches.length === 1) {
      this.state.currentInput = matches[0] + ' ';
    } else if (matches.length > 1) {
      this.state.output.push({ text: `可能的命令: ${matches.join(', ')}`, type: 'output' });
    }
  }
  
  // 取消命令
  public cancelCommand() {
    this.state.output.push({ text: '^C', type: 'output' });
    this.state.currentInput = '';
  }
  
  // 清空终端
  public clearTerminal() {
    this.state.output = [];
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
  
  processCommand(command: string): string {
    const cmd = command.trim().toLowerCase();
    const args = cmd.split(' ').slice(1);
    
    switch (cmd.split(' ')[0]) {
      case 'help':
        return `MeowOS Terminal - 可用命令:
═══════════════════════════════════════════════
系统信息:
  help          - 显示帮助信息
  sysinfo       - 显示系统信息
  neofetch      - 显示系统信息(美化版)
  uptime        - 显示系统运行时间
  memory        - 显示内存使用情况
  date          - 显示当前时间
  
应用管理:
  apps          - 列出所有应用
  windows       - 列出所有窗口
  open <app>    - 打开指定应用
  calc          - 打开计算器
  files         - 打开文件管理器
  monitor       - 打开系统监视器
  clock         - 打开时钟应用
  notes         - 打开记事本
  paint         - 打开绘图板
  
系统设置:
  theme <id>    - 切换主题 (light/dark/glass)
  wallpaper <v> - 设置壁纸
  
文件系统 (模拟):
  pwd           - 显示当前目录
  ls / dir      - 列出目录内容
  cat <file>    - 显示文件内容
  tree          - 显示目录树
  
系统监控:
  ps            - 显示进程列表
  top           - 显示系统监视器
  whoami        - 显示当前用户
  
实用工具:
  history       - 显示命令历史
  clear         - 清空终端
  echo <text>   - 输出文本
  fortune       - 显示随机格言
  cowsay <text> - ASCII 艺术
  
特殊功能:
  meow          - 🐱 猫咪彩蛋
  数学表达式     - 直接计算 (如: 2+2*3)
  
提示: 使用 Tab 键自动补全命令，上下箭头浏览历史`;
      
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
      
      // 隐藏命令和彩蛋
      case 'meow':
        return `
    /\\_/\\  
   ( o.o ) 
    > ^ <   Meow! 🐱
        
欢迎来到 MeowOS！这是一个为猫咪爱好者设计的操作系统`;
      
      case 'whoami':
        return '你是一只聪明的猫咪用户 🐾';
      
      case 'pwd':
        return '/home/meow';
      
      case 'ls':
      case 'dir':
        return `Desktop/    Documents/    Downloads/    Pictures/    Music/    Videos/
应用程序/   系统设置/     壁纸/        主题/`;
      
      case 'cat':
        if (args[0]) {
          return `正在显示文件内容: ${args[0]}
这是一个模拟的文件内容显示。
在真实的系统中，这里会显示实际的文件内容。`;
        }
        return `
    |\\   /|
   | \\_v_/ |
   \\  ___  /
    \\_____/
      
喵！你调用了 cat 命令 🐱`;
      
      case 'fortune':
        const fortunes = [
          '今天是写代码的好日子 🌟',
          '记住：代码如诗，优雅至上',
          '错误只是成功路上的垫脚石',
          '每一个 bug 都是学习的机会',
          '保持好奇心，永远学习新技术',
          '代码可以改变世界 🚀'
        ];
        return fortunes[Math.floor(Math.random() * fortunes.length)];
      
      case 'cowsay':
        const message = args.join(' ') || 'Hello MeowOS!';
        return `
 ${'_'.repeat(message.length + 2)}
< ${message} >
 ${'-'.repeat(message.length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
      
      case 'ps':
        return `PID  COMMAND
1    MeowOS Kernel
2    Desktop Manager
3    Window Manager
4    System Monitor
${system.getWindows().map((w, i) => `${5 + i}    ${w.title}`).join('\n')}`;
      
      case 'top':
        return `系统进程监视器
═══════════════════════════════════════════════
PID    NAME           CPU%    MEMORY
1      kernel         2.1%    45MB
2      desktop        1.5%    32MB
3      windowmgr      0.8%    28MB
4      terminal       0.3%    15MB
${system.getWindows().map((w, i) => `${5 + i}      ${w.title.substring(0, 10).padEnd(10)}    0.${Math.floor(Math.random() * 9)}%    ${Math.floor(Math.random() * 50) + 10}MB`).join('\n')}
  
按 q 退出 (这是模拟输出)`;
      
      case 'tree':
        return `MeowOS 文件系统结构
├── Desktop/
│   ├── 应用快捷方式/
│   └── 用户文件/
├── Documents/
│   ├── 系统文档/
│   └── 用户文档/
├── System/
│   ├── Apps/
│   ├── Config/
│   └── Themes/
└── Users/
    └── meow/
        ├── Desktop/
        ├── Documents/
        └── Settings/`;
      
      default:
        // 检查是否是数学表达式
        if (/^[\d+\-*/().\s]+$/.test(cmd)) {
          try {
            const result = Function(`"use strict"; return (${cmd})`)();
            return `${cmd} = ${result}`;
          } catch {
            return `无效的数学表达式: ${cmd}`;
          }
        }
        
        return `未知命令: ${cmd.split(' ')[0]}. 输入 'help' 查看可用命令`;
    }
  }
}
