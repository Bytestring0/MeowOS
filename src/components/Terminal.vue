<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

const commandHistory = ref<string[]>([]);
const currentCommand = ref('');
const terminalOutput = ref<Array<{type: 'command' | 'output', content: string}>>([
  { type: 'output', content: 'Welcome to MeowOS Terminal v1.0.0' },
  { type: 'output', content: 'Type "help" for available commands.' },
]);
const terminalRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();

const commands = {
  help: () => 'Available commands: help, clear, echo, date, ls',
  clear: () => {
    terminalOutput.value = [];
    return '';
  },
  echo: (args: string[]) => args.join(' '),
  date: () => new Date().toLocaleString(),
  ls: () => 'Documents  Downloads  Pictures  Music  Videos',
};

const executeCommand = async () => {
  const cmd = currentCommand.value.trim();
  if (!cmd) return;

  // 记录命令历史
  commandHistory.value.push(cmd);
  terminalOutput.value.push({ type: 'command', content: `$ ${cmd}` });

  // 解析命令
  const [command, ...args] = cmd.split(' ');
  const output = commands[command as keyof typeof commands]?.(args) || `Command not found: ${command}`;
  
  if (output) {
    terminalOutput.value.push({ type: 'output', content: output });
  }

  currentCommand.value = '';
  await nextTick();
  scrollToBottom();
};

const scrollToBottom = () => {
  terminalRef.value?.scrollTo({
    top: terminalRef.value.scrollHeight,
    behavior: 'smooth'
  });
};

onMounted(() => {
  inputRef.value?.focus();
});
</script>

<template>
  <div class="terminal" ref="terminalRef" @click="inputRef?.focus()">
    <div class="terminal-content">
      <div v-for="(line, index) in terminalOutput" :key="index" 
           :class="['terminal-line', line.type]">
        <template v-if="line.type === 'command'">{{ line.content }}</template>
        <template v-else>{{ line.content }}</template>
      </div>
      <div class="input-line">
        <span class="prompt">$</span>
        <input
          ref="inputRef"
          v-model="currentCommand"
          @keyup.enter="executeCommand"
          type="text"
          spellcheck="false"
          autocomplete="off"
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.terminal {
  width: 100vw;
  height: 100vh;
  background-color: #1e1e1e;
  color: #ffffff;
  font-family: 'Consolas', monospace;
  padding: 1rem;
  overflow-y: auto;
  box-sizing: border-box;
}

.terminal-content {
  display: flex;
  flex-direction: column;
}

.terminal-line {
  margin: 0.2rem 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.command {
  color: #63c5da;
}

.input-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.prompt {
  color: #50fa7b;
}

input {
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-family: 'Consolas', monospace;
  font-size: 1rem;
  outline: none;
  caret-color: #ffffff;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1e1e1e;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>