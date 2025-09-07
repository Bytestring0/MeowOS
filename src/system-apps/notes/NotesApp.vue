<template>
  <div class="notes-app">
    <div class="toolbar">
      <button @click="saveContent">保存</button>
    </div>
    <textarea
      v-model="content"
      class="notes-content"
      placeholder="在此输入内容..."
    />
  </div>
</template>

<script lang="ts" src="./NotesApp.ts"></script>

<style scoped>
.notes-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
}

.toolbar {
  margin-bottom: 10px;
}

.toolbar button {
  padding: 5px 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.toolbar button:hover {
  opacity: 0.9;
}

.notes-content {
  flex: 1;
  resize: none;
  padding: 10px;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.notes-content:focus {
  outline: none;
  border-color: var(--primary-color);
}
</style>
