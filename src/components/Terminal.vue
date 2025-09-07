<template>
  <div
    ref="terminalEl"
    class="terminal"
    @click="focusInput"
  >
    <div class="terminal-history">
      <div
        v-for="(entry, index) in history"
        :key="index"
        class="history-entry"
      >
        <template v-if="entry.command">
          <div class="command-line">
            <span class="prompt">$</span>
            <span class="command">{{ entry.command }}</span>
          </div>
        </template>
        <div
          class="output"
          :class="{ error: !entry.success }"
          v-html="entry.output.replace(/\n/g, '<br>')"
        ></div>
      </div>
    </div>

    <div class="command-input">
      <span class="prompt">$</span>
      <input
        ref="inputEl"
        v-model="commandInput"
        type="text"
        @keydown="handleKeyDown"
        spellcheck="false"
        autocomplete="off"
      />
    </div>
  </div>
</template>

<script lang="ts" src="./Terminal.ts"></script>

<style scoped>
.terminal {
  height: 100%;
  background-color: var(--bg-color-darker);
  color: var(--text-color);
  font-family: 'Consolas', 'Monaco', monospace;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.terminal-history {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}

.history-entry {
  margin-bottom: 8px;
}

.command-line {
  display: flex;
  gap: 8px;
  padding: 2px 0;
}

.prompt {
  color: var(--secondary-color);
  user-select: none;
}

.command {
  color: var(--text-color);
}

.output {
  padding: 2px 0 2px 20px;
  white-space: pre-wrap;
  color: var(--text-color-light);
}

.output.error {
  color: var(--danger-color);
}

.command-input {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  align-items: center;
}

.command-input input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-color);
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  margin: 0;
  outline: none;
}

:deep(br) {
  content: '';
  display: block;
  margin: 2px 0;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-color-darker);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-color-light);
}
</style>