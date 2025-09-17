<template>
  <div class="terminal-app" ref="terminalRef" @click="focusInput">
    <!-- 终端内容区域 -->
    <div class="terminal-body" ref="terminalBody">
      <!-- 输出历史 -->
      <div class="terminal-history">
        <div
          v-for="(line, index) in history"
          :key="index"
          :class="['history-line', line.type]"
          v-html="line.content"
        ></div>
      </div>

      <!-- 当前输入行 -->
      <div class="terminal-current-line" v-if="!isTyping">
        <span class="prompt">{{ config.prompt }}</span>
        <span class="input-before-cursor">{{ currentInput.slice(0, cursorPosition) }}</span>
        <span class="cursor" :class="{ blink: showCursor && isFocused }">{{ config.cursor }}</span>
        <span class="input-after-cursor">{{ currentInput.slice(cursorPosition) }}</span>
      </div>

      <!-- 打字机输出区域 -->
      <div class="typewriter-output" ref="typewriterRef" v-show="isTyping"></div>
    </div>

    <!-- 隐藏的实际输入框 -->
    <input
      ref="hiddenInput"
      v-model="currentInput"
      @keydown="handleKeydown"
      @paste="handlePaste"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="handleInput"
      class="hidden-input"
      type="text"
      autocomplete="off"
      spellcheck="false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { TerminalApp } from './TerminalApp';
import defaultTerminalConfig, { type TerminalConfig, type TerminalCommand } from './config';
import { TypeEffect } from '@/utils/typeEffect';
import { system } from '@/core/api/system';
import { documentSystem } from '@/core/api/documents';

// 终端应用实例
const terminalApp = new TerminalApp();

// 响应式数据
const terminalRef = ref<HTMLElement>();
const terminalBody = ref<HTMLElement>();
const hiddenInput = ref<HTMLInputElement>();
const typewriterRef = ref<HTMLElement>();

// 终端状态
const currentInput = ref('');
const history = reactive<Array<{ content: string; type: 'output' | 'error' | 'success' | 'warning' | 'command' }>>([]);
const config = reactive<TerminalConfig>({ ...defaultTerminalConfig });
const commandHistory = reactive<string[]>([]);
const historyIndex = ref(-1);
const isTyping = ref(false);
const showCursor = ref(true);
const cursorPosition = ref(0);
const isFocused = ref(false);

// 光标闪烁
let cursorInterval: number | null = null;

// 初始化终端
onMounted(async () => {
  await initTerminal();
  focusInput();
  startCursorBlink();
  
  // 显示欢迎信息
  await showWelcome();
});

onUnmounted(() => {
  if (cursorInterval) {
    clearInterval(cursorInterval);
  }
});

// 初始化终端
async function initTerminal() {
  // 重置启动时间
  terminalApp.resetStartTime();
  
  // 调用应用挂载钩子
  await terminalApp.onMount();
}

// 显示欢迎信息
async function showWelcome() {
  if (config.welcome) {
    await typeText(config.welcome);
    addToHistory('');
  }
}

// 光标闪烁
function startCursorBlink() {
  if (cursorInterval) {
    clearInterval(cursorInterval);
  }
  
  cursorInterval = setInterval(() => {
    showCursor.value = !showCursor.value;
  }, 500);
}

// 聚焦输入
function focusInput() {
  if (hiddenInput.value && !isTyping.value) {
    hiddenInput.value.focus();
  }
}

// 处理聚焦
function handleFocus() {
  isFocused.value = true;
  showCursor.value = true;
}

// 处理失焦
function handleBlur() {
  isFocused.value = false;
  showCursor.value = false;
}

// 处理输入
function handleInput() {
  // 同步光标位置
  nextTick(() => {
    if (hiddenInput.value) {
      cursorPosition.value = hiddenInput.value.selectionStart || 0;
    }
  });
}

// 移动光标
function moveCursor(direction: number) {
  const newPosition = cursorPosition.value + direction;
  if (newPosition >= 0 && newPosition <= currentInput.value.length) {
    cursorPosition.value = newPosition;
    updateHiddenInputCursor();
  }
}

// 更新隐藏输入框的光标位置
function updateHiddenInputCursor() {
  if (hiddenInput.value) {
    hiddenInput.value.setSelectionRange(cursorPosition.value, cursorPosition.value);
  }
}

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
  if (isTyping.value) {
    event.preventDefault();
    return;
  }

  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      executeCommand();
      break;
      
    case 'ArrowUp':
      event.preventDefault();
      navigateHistory(-1);
      break;
      
    case 'ArrowDown':
      event.preventDefault();
      navigateHistory(1);
      break;
      
    case 'ArrowLeft':
      event.preventDefault();
      moveCursor(-1);
      break;
      
    case 'ArrowRight':
      event.preventDefault();
      moveCursor(1);
      break;
      
    case 'Home':
      event.preventDefault();
      cursorPosition.value = 0;
      updateHiddenInputCursor();
      break;
      
    case 'End':
      event.preventDefault();
      cursorPosition.value = currentInput.value.length;
      updateHiddenInputCursor();
      break;
      
    case 'Tab':
      event.preventDefault();
      autocompleteCommand();
      break;
      
    case 'l':
      if (event.ctrlKey) {
        event.preventDefault();
        clearTerminal();
      }
      break;
      
    case 'c':
      if (event.ctrlKey) {
        event.preventDefault();
        interruptCommand();
      }
      break;
  }
  
  // 在其他按键后更新光标位置
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    nextTick(() => {
      if (hiddenInput.value) {
        cursorPosition.value = hiddenInput.value.selectionStart || 0;
      }
      scrollToBottom();
    });
  }
}

// 处理粘贴
function handlePaste(event: ClipboardEvent) {
  if (isTyping.value) {
    event.preventDefault();
  }
}

// 执行命令
async function executeCommand() {
  const input = currentInput.value.trim();
  
  if (input) {
    // 添加到历史记录
    commandHistory.unshift(input);
    if (commandHistory.length > 100) {
      commandHistory.splice(100);
    }
    
    // 显示命令
    addToHistory(`${config.prompt} ${input}`, 'command');
    
    // 解析命令
    const [cmdName, ...args] = input.split(/\s+/);
    const command = findCommand(cmdName);
    
    if (command) {
      try {
        await command.handler(args, getTerminalInterface());
      } catch (error) {
        addToHistory(`命令执行错误: ${error}`, 'error');
      }
    } else {
      addToHistory(`命令未找到: ${cmdName}。输入 'help' 查看所有可用命令。`, 'error');
    }
  } else {
    addToHistory(config.prompt, 'command');
  }
  
  // 重置输入和历史索引
  currentInput.value = '';
  cursorPosition.value = 0;
  historyIndex.value = -1;
  
  // 滚动到底部
  await nextTick();
  scrollToBottom();
}

// 查找命令
function findCommand(name: string): TerminalCommand | undefined {
  return config.commands.find(cmd => 
    cmd.name === name.toLowerCase() || 
    (cmd.aliases && cmd.aliases.includes(name.toLowerCase()))
  );
}

// 命令历史导航
function navigateHistory(direction: number) {
  const newIndex = historyIndex.value - direction; // 修复方向反了的问题
  
  if (newIndex >= 0 && newIndex < commandHistory.length) {
    historyIndex.value = newIndex;
    currentInput.value = commandHistory[newIndex];
    cursorPosition.value = currentInput.value.length;
    updateHiddenInputCursor();
  } else if (newIndex < 0) {
    historyIndex.value = -1;
    currentInput.value = '';
    cursorPosition.value = 0;
    updateHiddenInputCursor();
  }
}

// 命令自动补全
function autocompleteCommand() {
  const input = currentInput.value.toLowerCase().trim();
  if (!input) return;
  
  // 查找匹配的命令
  const matches = config.commands
    .filter(cmd => cmd.name.startsWith(input) && !cmd.hidden)
    .map(cmd => cmd.name);
  
  // 查找匹配的别名
  const aliasMatches = config.commands
    .filter(cmd => cmd.aliases && cmd.aliases.some(alias => alias.startsWith(input)) && !cmd.hidden)
    .map(cmd => cmd.name);
  
  // 合并并去重
  const allMatches = [...new Set([...matches, ...aliasMatches])];
  
  if (allMatches.length === 1) {
    // 只有一个匹配，直接补全
    currentInput.value = allMatches[0] + ' ';
    cursorPosition.value = currentInput.value.length;
    updateHiddenInputCursor();
  } else if (allMatches.length > 1) {
    // 多个匹配，显示选项
    addToHistory(`可能的命令: ${allMatches.join(', ')}`, 'output');
    
    // 找到共同前缀
    const commonPrefix = findCommonPrefix(allMatches);
    if (commonPrefix.length > input.length) {
      currentInput.value = commonPrefix;
      cursorPosition.value = currentInput.value.length;
      updateHiddenInputCursor();
    }
  }
}

// 查找共同前缀
function findCommonPrefix(words: string[]): string {
  if (words.length === 0) return '';
  if (words.length === 1) return words[0];
  
  let prefix = '';
  const firstWord = words[0];
  
  for (let i = 0; i < firstWord.length; i++) {
    const char = firstWord[i];
    if (words.every(word => word[i] === char)) {
      prefix += char;
    } else {
      break;
    }
  }
  
  return prefix;
}

// 添加到历史记录
function addToHistory(content: string, type: 'output' | 'error' | 'success' | 'warning' | 'command' = 'output') {
  history.push({ content, type });
  
  // 限制历史记录长度
  if (history.length > 1000) {
    history.splice(0, 100);
  }
  
  nextTick(() => {
    scrollToBottom();
  });
}

// 滚动到底部
function scrollToBottom() {
  if (terminalBody.value) {
    terminalBody.value.scrollTop = terminalBody.value.scrollHeight;
  }
}

// 打字机效果
async function typeText(text: string): Promise<void> {
  if (!typewriterRef.value) return;
  
  isTyping.value = true;
  
  return new Promise((resolve) => {
    TypeEffect.create(typewriterRef.value!, text, {
      speed: config.typeSpeed,
      showCursor: true,
      cursor: config.cursor,
      onComplete: () => {
        if (typewriterRef.value) {
          addToHistory(typewriterRef.value.innerHTML, 'output');
          typewriterRef.value.innerHTML = '';
        }
        isTyping.value = false;
        resolve();
      }
    });
  });
}

// 清空终端
function clearTerminal() {
  history.splice(0);
}

// 中断命令
function interruptCommand() {
  if (isTyping.value) {
    isTyping.value = false;
    if (typewriterRef.value) {
      typewriterRef.value.innerHTML = '';
    }
  }
  addToHistory('^C', 'warning');
}

// 获取终端接口
function getTerminalInterface() {
  return {
    output: (text: string) => addToHistory(text, 'output'),
    error: (text: string) => addToHistory(text, 'error'),
    success: (text: string) => addToHistory(text, 'success'),
    warning: (text: string) => addToHistory(text, 'warning'),
    clear: clearTerminal,
    typeText,
    config,
    getStartTime: () => terminalApp.getStartTime(),
    
    // 应用相关方法
    async getInstalledApps() {
      return system.listApps().map((app: any) => ({
        name: app.name,
        description: app.description || '无描述'
      }));
    },
    
    async getDocuments() {
      const docs = await documentSystem.getDocuments('/');
      return docs.map((doc: any) => ({
        name: doc.name,
        category: doc.path.split('/')[1] || '根目录'
      }));
    },
    
    async openApp(name: string) {
      const apps = system.listApps();
      const app = apps.find((a: any) => a.name.includes(name) || name.includes(a.name));
      if (app) {
        system.openApp(app.id);
        return true;
      }
      return false;
    }
  };
}
</script>

<style scoped>
.terminal-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #1a1a1a;
  color: #ffffff;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  user-select: text !important; /* 允许文本选择 */
}

.terminal-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  cursor: text;
  user-select: text; /* 允许文本选择 */
}

.terminal-history {
  margin-bottom: 8px;
  user-select: text; /* 允许文本选择 */
}

.history-line {
  margin: 2px 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  user-select: text; /* 允许文本选择 */
}

.history-line.command {
  color: #00ff00;
}

.history-line.error {
  color: #ff6b6b;
}

.history-line.success {
  color: #51cf66;
}

.history-line.warning {
  color: #ffd43b;
}

.terminal-current-line {
  display: flex;
  align-items: baseline;
  margin: 2px 0;
  user-select: none; /* 当前输入行不允许选择 */
}

.prompt {
  color: #00ff00;
  margin-right: 8px;
  white-space: nowrap;
  user-select: none;
}

.input-display {
  white-space: pre;
  user-select: none;
}

.input-before-cursor {
  white-space: pre;
  user-select: none;
}

.input-after-cursor {
  white-space: pre;
  user-select: none;
}

.cursor {
  color: #ffffff;
  animation: blink 1s infinite;
  user-select: none;
}

.cursor.blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.typewriter-output {
  margin: 2px 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.hidden-input {
  position: absolute;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
}

/* 滚动条样式 */
.terminal-body::-webkit-scrollbar {
  width: 8px;
}

.terminal-body::-webkit-scrollbar-track {
  background: transparent;
}

.terminal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.terminal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 选择文本样式 */
::selection {
  background-color: #74c0fc;
  color: #1a1a1a;
}
</style>
