import { defineComponent, ref, onMounted, nextTick } from 'vue';
import { commandService } from '@/core/services/command';

interface CommandHistory {
  command: string;
  output: string;
  success: boolean;
}

export default defineComponent({
  name: 'Terminal',

  setup() {
    const commandInput = ref('');
    const history = ref<CommandHistory[]>([]);
    const historyIndex = ref(-1);
    const terminalEl = ref<HTMLElement | null>(null);
    const inputEl = ref<HTMLInputElement | null>(null);

    // 显示欢迎信息
    onMounted(() => {
      history.value.push({
        command: '',
        output: 'Welcome to MeowOS Terminal\nType "help" for available commands.',
        success: true,
      });
    });

    // 执行命令
    const executeCommand = async () => {
      const command = commandInput.value.trim();
      if (!command) return;

      // 添加到历史记录
      history.value.push({
        command,
        output: '',
        success: true,
      });

      try {
        // 执行命令
        const result = await commandService.execute(command);
        
        // 更新输出
        const currentHistory = history.value[history.value.length - 1];
        currentHistory.success = result.success;
        currentHistory.output = formatCommandOutput(result);

      } catch (error) {
        // 处理错误
        const currentHistory = history.value[history.value.length - 1];
        currentHistory.success = false;
        currentHistory.output = `Error: ${error}`;
      }

      // 重置输入和历史索引
      commandInput.value = '';
      historyIndex.value = -1;

      // 滚动到底部
      await nextTick();
      if (terminalEl.value) {
        terminalEl.value.scrollTop = terminalEl.value.scrollHeight;
      }
    };

    // 处理按键
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          executeCommand();
          break;
        case 'ArrowUp':
          navigateHistory(-1);
          e.preventDefault();
          break;
        case 'ArrowDown':
          navigateHistory(1);
          e.preventDefault();
          break;
        case 'Tab':
          e.preventDefault();
          // TODO: 实现命令补全
          break;
      }
    };

    // 历史记录导航
    const navigateHistory = (direction: number) => {
      if (!history.value.length) return;

      historyIndex.value = Math.min(
        Math.max(
          historyIndex.value + direction,
          -1
        ),
        history.value.length - 1
      );

      if (historyIndex.value >= 0) {
        commandInput.value = history.value[historyIndex.value].command;
      } else {
        commandInput.value = '';
      }

      // 将光标移到末尾
      nextTick(() => {
        if (inputEl.value) {
          inputEl.value.selectionStart = commandInput.value.length;
          inputEl.value.selectionEnd = commandInput.value.length;
        }
      });
    };

    // 格式化命令输出
    const formatCommandOutput = (result: any): string => {
      if (typeof result.data === 'object') {
        return `${result.message}\n${JSON.stringify(result.data, null, 2)}`;
      }
      return result.message;
    };

    // 聚焦输入框
    const focusInput = () => {
      if (inputEl.value) {
        inputEl.value.focus();
      }
    };

    return {
      commandInput,
      history,
      terminalEl,
      inputEl,
      handleKeyDown,
      focusInput,
    };
  },
});
