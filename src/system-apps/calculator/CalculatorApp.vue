<template>
  <div class="calculator">
    <!-- 显示屏 -->
    <div class="display-section">
      <div class="display">{{ display }}</div>
      <div class="memory-indicator" v-if="memory !== 0">M</div>
    </div>

    <!-- 历史记录按钮 -->
    <div class="history-toggle">
      <button @click="showHistory = !showHistory" class="history-btn">
        📜 历史记录
      </button>
    </div>

    <!-- 历史记录面板 -->
    <div v-if="showHistory" class="history-panel">
      <div class="history-header">
        <span>计算历史</span>
        <button @click="clearHistory" class="clear-history-btn">清空</button>
      </div>
      <div class="history-list">
        <div
          v-for="(item, index) in history"
          :key="index"
          class="history-item"
        >
          {{ item }}
        </div>
        <div v-if="history.length === 0" class="no-history">
          暂无历史记录
        </div>
      </div>
    </div>

    <!-- 计算器按键 -->
    <div class="calculator-grid">
      <!-- 内存操作行 -->
      <button @click="memoryClear" class="btn memory">MC</button>
      <button @click="memoryRecall" class="btn memory">MR</button>
      <button @click="memoryStore" class="btn memory">MS</button>
      <button @click="memoryAdd" class="btn memory">M+</button>

      <!-- 科学函数行1 -->
      <button @click="performScientificFunction('sin')" class="btn function">sin</button>
      <button @click="performScientificFunction('cos')" class="btn function">cos</button>
      <button @click="performScientificFunction('tan')" class="btn function">tan</button>
      <button @click="performScientificFunction('sqrt')" class="btn function">√</button>

      <!-- 科学函数行2 -->
      <button @click="performScientificFunction('log')" class="btn function">log</button>
      <button @click="performScientificFunction('ln')" class="btn function">ln</button>
      <button @click="performScientificFunction('exp')" class="btn function">exp</button>
      <button @click="performScientificFunction('x2')" class="btn function">x²</button>

      <!-- 基本操作行1 -->
      <button @click="clear" class="btn clear">C</button>
      <button @click="clearEntry" class="btn clear">CE</button>
      <button @click="backspace" class="btn operation">⌫</button>
      <button @click="performOperation('/')" class="btn operation">÷</button>

      <!-- 数字行1 -->
      <button @click="inputNumber('7')" class="btn number">7</button>
      <button @click="inputNumber('8')" class="btn number">8</button>
      <button @click="inputNumber('9')" class="btn number">9</button>
      <button @click="performOperation('*')" class="btn operation">×</button>

      <!-- 数字行2 -->
      <button @click="inputNumber('4')" class="btn number">4</button>
      <button @click="inputNumber('5')" class="btn number">5</button>
      <button @click="inputNumber('6')" class="btn number">6</button>
      <button @click="performOperation('-')" class="btn operation">−</button>

      <!-- 数字行3 -->
      <button @click="inputNumber('1')" class="btn number">1</button>
      <button @click="inputNumber('2')" class="btn number">2</button>
      <button @click="inputNumber('3')" class="btn number">3</button>
      <button @click="performOperation('+')" class="btn operation">+</button>

      <!-- 数字行4 -->
      <button @click="inputNumber('0')" class="btn number zero">0</button>
      <button @click="inputDecimal" class="btn number">.</button>
      <button @click="performCalculation" class="btn equals">=</button>

      <!-- 常数和其他函数 -->
      <button @click="performScientificFunction('pi')" class="btn constant">π</button>
      <button @click="performScientificFunction('e')" class="btn constant">e</button>
      <button @click="performScientificFunction('1/x')" class="btn function">1/x</button>
      <button @click="performOperation('%')" class="btn operation">%</button>
    </div>
  </div>
</template>
<script src="./CalculatorApp.ts"></script>
<style scoped>
.calculator {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.display-section {
  position: relative;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 16px;
}

.display {
  font-size: 28px;
  font-family: 'Courier New', monospace;
  text-align: right;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 12px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  word-break: break-all;
}

.memory-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--accent-color);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.history-toggle {
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.history-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.history-btn:hover {
  background: var(--accent-color);
  color: white;
}

.history-panel {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  max-height: 200px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  font-size: 12px;
  font-weight: bold;
}

.clear-history-btn {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  font-size: 11px;
  text-decoration: underline;
}

.history-list {
  max-height: 150px;
  overflow-y: auto;
}

.history-item {
  padding: 6px 16px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.history-item:last-child {
  border-bottom: none;
}

.no-history {
  padding: 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  font-style: italic;
}

.calculator-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border-color);
  padding: 1px;
}

.btn {
  background: var(--bg-secondary);
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 45px;
  transition: all 0.15s ease;
}

.btn:hover {
  background: var(--bg-tertiary);
}

.btn:active {
  transform: scale(0.95);
}

.btn.number {
  background: var(--bg-primary);
  font-size: 16px;
}

.btn.number:hover {
  background: var(--bg-secondary);
}

.btn.operation {
  background: var(--accent-color);
  color: white;
  font-size: 18px;
}

.btn.operation:hover {
  background: var(--accent-color);
  opacity: 0.8;
}

.btn.equals {
  background: var(--accent-color);
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.btn.equals:hover {
  background: var(--accent-color);
  opacity: 0.8;
}

.btn.clear {
  background: #ff6b6b;
  color: white;
}

.btn.clear:hover {
  background: #ff5252;
}

.btn.function {
  background: #4ecdc4;
  color: white;
  font-size: 12px;
}

.btn.function:hover {
  background: #26a69a;
}

.btn.memory {
  background: #9c27b0;
  color: white;
  font-size: 11px;
}

.btn.memory:hover {
  background: #7b1fa2;
}

.btn.constant {
  background: #ff9800;
  color: white;
  font-size: 14px;
}

.btn.constant:hover {
  background: #f57c00;
}

.btn.zero {
  grid-column: span 1;
}

/* 滚动条样式 */
.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

.history-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: var(--accent-color);
}
</style>
