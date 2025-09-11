<template>
  <div class="terminal-app">
    <div class="terminal-header">
      <span class="terminal-title">MeowOS Terminal</span>
      <div class="terminal-controls">
        <button @click="terminal.clearTerminal()" class="control-btn">清空</button>
      </div>
    </div>
    <div class="terminal-output" ref="outputRef">
      <div v-for="(line, index) in terminal.state.output" :key="index" class="output-line" :class="line.type">
        <span class="prompt" v-if="line.type === 'command'">meow@os:~$ </span>
        <span class="text">{{ line.text }}</span>
      </div>
    </div>
    <div class="terminal-input">
      <span class="prompt">meow@os:~$ </span>
      <input
        ref="inputRef"
        v-model="terminal.state.currentInput"
        @keydown="terminal.handleKeydown"
        class="input-field"
        placeholder="输入命令... (Tab补全, ↑↓历史记录, Ctrl+C取消)"
        autocomplete="off"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import { TerminalApp } from './TerminalApp';

const terminal = new TerminalApp();
const inputRef = ref<HTMLInputElement>();
const outputRef = ref<HTMLDivElement>();

onMounted(async () => {
  await terminal.initialize();
  inputRef.value?.focus();
});

// 监听输出变化，自动滚动到底部
watch(() => terminal.state.output.length, () => {
  nextTick(() => {
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight;
    }
  });
});
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
  white-space: pre-wrap; /* 保持格式化文本的空格和换行 */
}

.output-line.command {
  color: var(--primary-color);
  font-weight: 600;
}

.output-line.error {
  color: var(--danger-color);
  background: rgba(var(--danger-color-rgb, 220, 53, 69), 0.1);
  padding: 2px 4px;
  border-radius: 3px;
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
