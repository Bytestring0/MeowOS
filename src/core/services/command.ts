import { system } from '../api/system';
import type { CommandResult } from '../types/system';

class CommandService {
  private commands = new Map<string, (args: string[]) => Promise<CommandResult>>();

  constructor() {
    this.registerBuiltinCommands();
  }

  private registerBuiltinCommands() {
    // 列出所有应用
    this.register('list-apps', async () => {
      const apps = system.listApps();
      return {
        success: true,
        message: '应用列表：',
        data: apps.map(app => ({
          id: app.id,
          name: app.name,
          description: app.description,
          version: app.version,
        })),
      };
    });

    // 打开应用
    this.register('open', async (args: string[]) => {
      if (!args.length) {
        return {
          success: false,
          message: '请指定要打开的应用ID',
        };
      }

      const window = await system.openApp(args[0]);
      return {
        success: !!window,
        message: window ? '应用已打开' : '打开应用失败',
        data: window,
      };
    });

    // 关闭应用
    this.register('close', async (args: string[]) => {
      if (!args.length) {
        return {
          success: false,
          message: '请指定要关闭的应用ID',
        };
      }

      const success = system.closeApp(args[0]);
      return {
        success,
        message: success ? '应用已关闭' : '关闭应用失败',
      };
    });

    // 帮助命令
    this.register('help', async () => {
      return {
        success: true,
        message: '可用命令：',
        data: [
          { command: 'list-apps', description: '列出所有可用应用' },
          { command: 'open <appId>', description: '打开指定应用' },
          { command: 'close <appId>', description: '关闭指定应用' },
          { command: 'help', description: '显示此帮助信息' },
        ],
      };
    });
  }

  register(command: string, handler: (args: string[]) => Promise<CommandResult>) {
    this.commands.set(command, handler);
  }

  async execute(commandLine: string): Promise<CommandResult> {
    const [command, ...args] = commandLine.trim().split(' ');
    const handler = this.commands.get(command);

    if (!handler) {
      return {
        success: false,
        message: `未知命令: ${command}. 输入 'help' 获取帮助.`,
      };
    }

    try {
      return await handler(args);
    } catch (error) {
      return {
        success: false,
        message: `执行命令出错: ${error}`,
      };
    }
  }
}

export const commandService = new CommandService();
