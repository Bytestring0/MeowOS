/**
 * 终端配置文件
 * 包含命令定义、主题设置等
 */

import { TimeUtils } from '@/utils/time';
import { ApiFetch } from '@/utils/apiFetch';

export interface TerminalCommand {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  category: 'system' | 'file' | 'app' | 'network' | 'fun' | 'info';
  handler: (args: string[], terminal: any) => Promise<void> | void;
  hidden?: boolean; // 隐藏命令，不在help中显示
}

export interface TerminalConfig {
  prompt: string;
  welcome: string;
  commands: TerminalCommand[];
  typeSpeed: number;
  cursor: string;
}

// 基础命令
const baseCommands: TerminalCommand[] = [
  // 系统命令
  {
    name: 'help',
    description: '显示帮助信息',
    usage: 'help [命令名]',
    aliases: ['h', '?'],
    category: 'system',
    handler: async (args, terminal) => {
      if (args.length === 0) {
        // 显示所有命令
        const categories = {
          system: '系统命令',
          file: '文件操作',
          app: '应用管理',
          network: '网络工具',
          info: '信息查询',
          fun: '娱乐功能',
        };

        let output = '\n可用命令列表：\n\n';

        Object.entries(categories).forEach(([category, title]) => {
          const commands = terminal.config.commands.filter(
            (cmd: TerminalCommand) => cmd.category === category && !cmd.hidden
          );

          if (commands.length > 0) {
            output += `${title}：\n`;
            commands.forEach((cmd: TerminalCommand) => {
              const aliases = cmd.aliases ? ` (${cmd.aliases.join(', ')})` : '';
              output += `  ${cmd.name}${aliases} - ${cmd.description}\n`;
            });
            output += '\n';
          }
        });

        output += '输入 "help <命令名>" 查看具体命令的使用方法\n';
        terminal.output(output);
      } else {
        // 显示特定命令的帮助
        const cmdName = args[0].toLowerCase();
        const command = terminal.config.commands.find(
          (cmd: TerminalCommand) =>
            cmd.name === cmdName || (cmd.aliases && cmd.aliases.includes(cmdName))
        );

        if (command) {
          let output = `\n命令：${command.name}\n`;
          output += `描述：${command.description}\n`;
          output += `用法：${command.usage}\n`;
          if (command.aliases && command.aliases.length > 0) {
            output += `别名：${command.aliases.join(', ')}\n`;
          }
          terminal.output(output);
        } else {
          terminal.error(`命令 '${cmdName}' 不存在。输入 'help' 查看所有可用命令。`);
        }
      }
    },
  },

  {
    name: 'clear',
    description: '清空终端屏幕',
    usage: 'clear',
    aliases: ['cls'],
    category: 'system',
    handler: (args, terminal) => {
      terminal.clear();
    },
  },

  {
    name: 'echo',
    description: '输出文本',
    usage: 'echo <文本>',
    category: 'system',
    handler: (args, terminal) => {
      terminal.output(args.join(' '));
    },
  },

  {
    name: 'type',
    description: '以打字机效果输出文本',
    usage: 'type <文本>',
    category: 'system',
    handler: async (args, terminal) => {
      const text = args.join(' ');
      if (text) {
        await terminal.typeText(text);
      } else {
        terminal.error('请提供要输出的文本');
      }
    },
  },

  // 文件系统命令
  {
    name: 'ls',
    description: '列出文件和目录',
    usage: 'ls [目录名]',
    aliases: ['dir'],
    category: 'file',
    handler: async (args, terminal) => {
      const target = args[0] || '';

      if (target === '' || target === 'apps') {
        // 列出所有应用
        const apps = await terminal.getInstalledApps();
        terminal.output('\n已安装的应用：\n');
        apps.forEach((app: any) => {
          terminal.output(`  ${app.name} - ${app.description}`);
        });
        terminal.output('');
      } else if (target === 'documents' || target === 'docs') {
        // 列出文档文件
        try {
          const docs = await terminal.getDocuments();
          terminal.output('\n文档文件：\n');

          // 按分类组织文档
          const categories = new Map<string, any[]>();
          docs.forEach((doc: any) => {
            const category = doc.category || '其他';
            if (!categories.has(category)) {
              categories.set(category, []);
            }
            categories.get(category)!.push(doc);
          });

          // 输出分类文档
          categories.forEach((files, category) => {
            terminal.output(`\n  ${category}:`);
            files.forEach(file => {
              terminal.output(`    ${file.name}`);
            });
          });

          terminal.output('');
        } catch (error) {
          terminal.error('无法获取文档列表: ' + error);
        }
      } else {
        terminal.error(`目录 '${target}' 不存在`);
      }
    },
  },

  {
    name: 'pwd',
    description: '显示当前工作目录',
    usage: 'pwd',
    category: 'file',
    handler: (args, terminal) => {
      terminal.output('/home/user\n');
    },
  },

  // 应用管理命令
  {
    name: 'open',
    description: '打开应用或文档',
    usage: 'open <应用名/文档名>',
    category: 'app',
    handler: async (args, terminal) => {
      if (args.length === 0) {
        terminal.error('请指定要打开的应用或文档名');
        return;
      }

      const name = args.join(' ');
      const success = await terminal.openApp(name);

      if (success) {
        terminal.success(`已打开：${name}`);
      } else {
        terminal.error(`找不到应用或文档：${name}`);
      }
    },
  },

  // 信息查询命令
  {
    name: 'date',
    description: '显示当前日期和时间',
    usage: 'date',
    category: 'info',
    handler: (args, terminal) => {
      const now = new Date();
      const formatted = TimeUtils.formatTime(now, { showSeconds: true });
      const weekday = TimeUtils.getWeekday(now);
      const holidays = TimeUtils.getTodayHolidays(now);
      const lunar = TimeUtils.getLunarInfo(now);
      const zodiac = TimeUtils.getZodiacSign(now);

      let output = `\n当前时间：${formatted} ${weekday}\n`;
      output += `农历：${lunar.year} ${lunar.month}${lunar.day}\n`;
      output += `星座：${zodiac}\n`;

      if (holidays.length > 0) {
        output += `今日节日：${holidays.map(h => h.name).join('、')}\n`;
      }

      terminal.output(output);
    },
  },

  {
    name: 'calendar',
    description: '显示日历信息',
    usage: 'calendar',
    aliases: ['cal'],
    category: 'info',
    handler: (args, terminal) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const today = now.getDate();

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = TimeUtils.getDaysInMonth(year, month + 1);

      const monthNames = [
        '一月',
        '二月',
        '三月',
        '四月',
        '五月',
        '六月',
        '七月',
        '八月',
        '九月',
        '十月',
        '十一月',
        '十二月',
      ];

      let calendar = `\n${year}年 ${monthNames[month]}\n`;
      calendar += '日 一 二 三 四 五 六\n';

      // 添加空格对齐第一周
      for (let i = 0; i < firstDay; i++) {
        calendar += '   ';
      }

      // 添加日期
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr =
          day === today ? `[${day.toString().padStart(2)}]` : day.toString().padStart(2) + ' ';
        calendar += dayStr + ' ';

        if ((firstDay + day) % 7 === 0) {
          calendar += '\n';
        }
      }

      terminal.output(calendar + '\n');

      // 显示节日信息
      const holidays = TimeUtils.getTodayHolidays(now);
      if (holidays.length > 0) {
        terminal.output(`今日节日：${holidays.map(h => h.name).join('、')}\n`);
      }

      const nextHoliday = TimeUtils.getNextHoliday(now);
      if (nextHoliday) {
        const daysUntil = TimeUtils.getDaysBetween(now, new Date(nextHoliday.date));
        terminal.output(`下个节日：${nextHoliday.name}（还有 ${daysUntil} 天）\n`);
      }
    },
  },

  {
    name: 'lunar',
    description: '显示农历信息',
    usage: 'lunar',
    category: 'info',
    handler: (args, terminal) => {
      const now = new Date();
      const lunar = TimeUtils.getLunarInfo(now);
      const zodiac = TimeUtils.getZodiacSign(now);

      let output = '\n农历信息：\n';
      output += `农历：${lunar.year}\n`;
      output += `月份：${lunar.month}\n`;
      output += `日期：${lunar.day}\n`;
      output += `星座：${zodiac}\n`;

      terminal.output(output);
    },
  },

  {
    name: 'whoami',
    description: '显示当前用户',
    usage: 'whoami',
    category: 'info',
    handler: (args, terminal) => {
      terminal.output('user');
    },
  },

  {
    name: 'uname',
    description: '显示系统信息',
    usage: 'uname [-a]',
    category: 'info',
    handler: (args, terminal) => {
      const showAll = args.includes('-a');

      if (showAll) {
        terminal.output('MeowOS 1.0.0 Web x86_64 Vue TypeScript');
      } else {
        terminal.output('MeowOS');
      }
    },
  },

  {
    name: 'uptime',
    description: '显示系统运行时间',
    usage: 'uptime',
    category: 'info',
    handler: (args, terminal) => {
      const startTime = terminal.getStartTime();
      const now = Date.now();
      const uptime = Math.floor((now - startTime) / 1000);

      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;

      terminal.output(`系统运行时间：${hours}小时 ${minutes}分钟 ${seconds}秒`);
    },
  },

  {
    name: 'hitokoto',
    description: '获取一言（随机句子）',
    usage: 'hitokoto [类型]',
    aliases: ['quote'],
    category: 'network',
    handler: async (args, terminal) => {
      terminal.output('正在获取一言...\n');

      const type = args[0];
      const result = await ApiFetch.getHitokoto(type);

      if (result.success && result.data) {
        const quote = result.data;
        let output = `\n"${quote.hitokoto}"\n`;
        if (quote.from) {
          output += `—— ${quote.from}`;
          if (quote.from_who) {
            output += ` · ${quote.from_who}`;
          }
        }
        output += '\n';

        terminal.output(output);
      } else {
        terminal.error(`获取一言失败：${result.error}`);
      }
    },
  },

  {
    name: 'ip',
    description: '显示本机IP信息',
    usage: 'ip',
    category: 'network',
    handler: async (args, terminal) => {
      terminal.output('正在获取IP信息...\n');

      const result = await ApiFetch.getIpInfo();
      if (result.success && result.data) {
        const info = result.data;
        let output = '\nIP 信息：\n';
        output += `IP 地址：${info.ip || '未知'}\n`;
        output += `城市：${info.city || '未知'}\n`;
        output += `地区：${info.region || '未知'}\n`;
        output += `国家：${info.country_name || '未知'}\n`;
        output += `ISP：${info.org || '未知'}\n`;
        terminal.output(output);
      } else {
        terminal.error('获取IP信息失败');
      }
    },
  },

  {
    name: 'qr',
    description: '生成二维码',
    usage: 'qr <文本>',
    category: 'network',
    handler: (args, terminal) => {
      const text = args.join(' ');
      if (!text) {
        terminal.error('请提供要生成二维码的文本');
        return;
      }

      const qrUrl = ApiFetch.generateQRCode(text);
      terminal.output(`\n二维码已生成：\n${qrUrl}\n`);
      terminal.output('请在浏览器中打开上述链接查看二维码\n');
    },
  },
  {
    name: 'fortune',
    description: '显示运势',
    usage: 'fortune <星座> <时间>',
    category: 'fun',
    handler: async (args, terminal) => {
      if (args.length === 0) {
        terminal.output('请提供星座和时间');
        return;
      }
      if (
        [
          'aries',
          'taurus',
          'gemini',
          'cancer',
          'leo',
          'virgo',
          'libra',
          'scorpio',
          'sagittarius',
          'capricorn',
          'aquarius',
          'pisces',
        ].indexOf(args[0]) === -1
      ) {
        terminal.output(
          '无效的星座, 可选值：aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces'
        );
        return;
      }
      if (args.length === 1 || ['today', 'week', 'month', 'year'].indexOf(args[1]) === -1) {
        terminal.output('请提供时间, 可选值：today, week, month, year');
        return;
      }
      terminal.output('正在获取运势...\n');
      const response = await ApiFetch.getFortune(args[0], args[1]);
      const result = await response.json();
      if (result?.code == 200) {
        // 生成状态条
        function makeStatusBar(score: number, total = 5): string {
          const n = Math.max(0, Math.min(Math.floor(score), total));
          return '■'.repeat(n) + '□'.repeat(total - n);
        }

        // 定义各项显示标题
        const titles: Record<string, string> = {
          all: '当前运势：总体',
          health: '健康',
          love: '爱情',
          money: '财运',
          work: '工作',
        };

        // 从 JSON 中提取数据
        const fortune = result.data.fortune;
        const fortunetext = result.data.fortunetext;
        const todo = result.data.todo;
        const luckycolor = result.data.luckycolor;
        const luckyconstellation = result.data.luckyconstellation;
        const luckynumber = result.data.luckynumber;
        const shortcomment = result.data.shortcomment;
        const time = result.data.time;
        const title = result.data.title;
        const type = result.data.type;

        // 构建输出文本
        let output = '';

        for (const key of ['all', 'health', 'love', 'money', 'work']) {
          output += `${titles[key]}\n`;
          output += `${makeStatusBar(fortune[key])} ${fortunetext[key]}\n\n`;
        }

        output += `今日宜\n✔️ ${todo.yi}\n\n`;
        output += `今日忌\n❌ ${todo.ji}\n\n`;
        output += `幸运颜色：${luckycolor}\n`;
        output += `幸运星座：${luckyconstellation}\n`;
        output += `幸运数字：${luckynumber}\n`;
        output += `短评：${shortcomment}\n`;
        output += `日期：${time}\n`;
        output += `星座：${title}\n`;
        output += `类型：${type}\n`;

        terminal.output(output);
      }
    },
  },

  // 系统工具
  {
    name: 'theme',
    description: '主题管理工具',
    usage: 'theme [list|dark|light]',
    category: 'system',
    handler: (args, terminal) => {
      const action = args[0];

      switch (action) {
        case 'list':
          terminal.output('\n可用主题：\n');
          terminal.output('  dark  - 暗色主题\n');
          terminal.output('  light - 亮色主题\n');
          break;

        case 'dark':
          terminal.output('已切换到暗色主题\n');
          break;

        case 'light':
          terminal.output('已切换到亮色主题\n');
          break;

        default:
          terminal.output('用法：theme [list|dark|light]\n');
          break;
      }
    },
  },

  {
    name: 'config',
    description: '配置管理',
    usage: 'config [get|set] [key] [value]',
    category: 'system',
    handler: (args, terminal) => {
      const action = args[0];
      const key = args[1];
      const value = args.slice(2).join(' ');

      switch (action) {
        case 'get':
          if (key) {
            const configValue = terminal.config[key as keyof typeof terminal.config];
            terminal.output(`${key}: ${JSON.stringify(configValue, null, 2)}\n`);
          } else {
            terminal.output('请指定配置项名称\n');
          }
          break;

        case 'set':
          if (key && value) {
            try {
              const parsedValue = JSON.parse(value);
              (terminal.config as any)[key] = parsedValue;
              terminal.success(`已设置 ${key} = ${value}\n`);
            } catch (error) {
              terminal.error('配置值格式错误，请使用有效的 JSON 格式\n');
            }
          } else {
            terminal.output('请指定配置项名称和值\n');
          }
          break;

        case 'list':
        default:
          terminal.output('\n当前配置：\n');
          terminal.output(`提示符：${terminal.config.prompt}\n`);
          terminal.output(`打字速度：${terminal.config.typewriterConfig.speed}ms\n`);
          terminal.output(`显示光标：${terminal.config.typewriterConfig.showCursor}\n`);
          break;
      }
    },
  },
];

// 默认终端配置
export const defaultTerminalConfig: TerminalConfig = {
  prompt: 'user@meowos:~$',
  welcome: `
欢迎使用 MeowOS 终端！

这是一个基于 Vue 3 + TypeScript 开发的操作系统模拟器
作者：Bytestring0
项目地址：https://github.com/Bytestring0/MeowOS

输入 'help' 查看所有可用命令
输入 'help <命令名>' 查看具体命令的使用方法

让我们开始探索吧！`,

  commands: baseCommands,
  typeSpeed: 3,
  cursor: '▊',
};

export default defaultTerminalConfig;
