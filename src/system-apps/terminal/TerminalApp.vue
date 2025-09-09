<template>
  <div class="terminal-app">
    <div class="terminal-header">
      <span class="terminal-title">MeowOS Terminal</span>
      <div class="terminal-controls">
        <button @click="clearTerminal" class="control-btn">清空</button>
      </div>
    </div>
    <div class="terminal-output" ref="outputRef">
      <div v-for="(line, index) in output" :key="index" class="output-line" :class="line.type">
        <span class="prompt" v-if="line.type === 'command'">meow@os:~$ </span>
        <span class="text">{{ line.text }}</span>
      </div>
    </div>
    <div class="terminal-input">
      <span class="prompt">meow@os:~$ </span>
      <input
        ref="inputRef"
        v-model="currentInput"
        @keydown="handleKeydown"
        class="input-field"
        placeholder="输入命令..."
        autocomplete="off"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { TerminalApp } from './TerminalApp';

interface OutputLine {
  text: string;
  type: 'command' | 'output' | 'error';
}

const terminal = new TerminalApp();
const output = ref<OutputLine[]>([
  { text: '欢迎使用 MeowOS Terminal!', type: 'output' },
  { text: '输入 "help" 查看可用命令', type: 'output' },
  { text: '', type: 'output' }
]);

const currentInput = ref('');
const inputRef = ref<HTMLInputElement>();
const outputRef = ref<HTMLDivElement>();
const commandHistory = ref<string[]>([]);
const historyIndex = ref(-1);

onMounted(() => {
  inputRef.value?.focus();
});

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    executeCommand();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    navigateHistory(-1);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    navigateHistory(1);
  }
}

function executeCommand() {
  const command = currentInput.value.trim();
  if (!command) return;

  // 添加命令到输出
  output.value.push({ text: command, type: 'command' });
  
  // 添加到历史记录
  commandHistory.value.push(command);
  historyIndex.value = commandHistory.value.length;

  // 执行命令
  try {
    const result = terminal.executeCommand(command);
    
    if (result === 'CLEAR_TERMINAL') {
      output.value = [];
    } else {
      output.value.push({ text: result, type: 'output' });
    }
  } catch (error) {
    output.value.push({ 
      text: `错误: ${error instanceof Error ? error.message : String(error)}`, 
      type: 'error' 
    });
  }

  // 清空输入
  currentInput.value = '';
  
  // 滚动到底部
  nextTick(() => {
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight;
    }
  });
}

function navigateHistory(direction: number) {
  const newIndex = historyIndex.value + direction;
  
  if (newIndex >= 0 && newIndex < commandHistory.value.length) {
    historyIndex.value = newIndex;
    currentInput.value = commandHistory.value[newIndex];
  } else if (newIndex >= commandHistory.value.length) {
    historyIndex.value = commandHistory.value.length;
    currentInput.value = '';
  }
}

function clearTerminal() {
  output.value = [];
}
</script>

<style scoped>
.terminal-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-color);
  color: var(--text-color);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-color-light);
  border-bottom: 1px solid var(--border-color);
}

.terminal-title {
  font-weight: 600;
  color: var(--text-color);
}

.terminal-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  background: var(--bg-color-darker);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background: var(--bg-color);
  border-color: var(--primary-color);
}

.terminal-output {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  line-height: 1.4;
  background: var(--bg-color);
}

.output-line {
  margin-bottom: 2px;
  word-wrap: break-word;
}

.output-line.command {
  color: var(--primary-color);
}

.output-line.error {
  color: var(--danger-color);
}

.output-line.output {
  color: var(--text-color);
}

.terminal-input {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-color-light);
  border-top: 1px solid var(--border-color);
}

.prompt {
  color: var(--secondary-color);
  margin-right: 8px;
  font-weight: 600;
}

.input-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-color);
  font-family: inherit;
  font-size: inherit;
}

.input-field::placeholder {
  color: var(--text-color-lighter);
}

/* 自定义滚动条 */
.terminal-output::-webkit-scrollbar {
  width: 6px;
}

.terminal-output::-webkit-scrollbar-track {
  background: var(--bg-color-darker);
}

.terminal-output::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.terminal-output::-webkit-scrollbar-thumb:hover {
  background: var(--border-color-light);
}
</style>
