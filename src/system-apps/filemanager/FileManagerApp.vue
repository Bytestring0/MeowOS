<template>
  <div class="file-manager">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="nav-buttons">
        <button @click="navigateUp" :disabled="currentPath === '/'" class="nav-btn">
          ↑ 上级
        </button>
        <span class="path">{{ currentPath }}</span>
      </div>
      
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索文件..."
          class="search-input"
        />
      </div>

      <div class="view-controls">
        <button
          @click="viewMode = 'list'"
          :class="{ active: viewMode === 'list' }"
          class="view-btn"
        >
          📋 列表
        </button>
        <button
          @click="viewMode = 'grid'"
          :class="{ active: viewMode === 'grid' }"
          class="view-btn"
        >
          🔲 网格
        </button>
        <button @click="showNewDialog = true" class="new-btn">
          ➕ 新建
        </button>
      </div>
    </div>

    <!-- 文件列表 -->
    <div class="file-list" :class="viewMode">
      <div
        v-for="file in filteredFiles"
        :key="file.id"
        class="file-item"
        :class="{ selected: selectedFile?.id === file.id, folder: file.type === 'folder' }"
        @click="selectedFile = file"
        @dblclick="file.type === 'folder' ? navigateToFolder(file) : editFile(file)"
      >
        <div class="file-icon">
          {{ file.type === 'folder' ? '📁' : '📄' }}
        </div>
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div v-if="viewMode === 'list'" class="file-details">
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <span class="file-date">{{ formatDate(file.modified) }}</span>
          </div>
        </div>
        <div class="file-actions">
          <button
            v-if="file.type === 'file'"
            @click.stop="editFile(file)"
            class="action-btn"
            title="编辑"
          >
            ✏️
          </button>
          <button
            @click.stop="deleteFile(file)"
            class="action-btn delete"
            title="删除"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- 新建对话框 -->
    <div v-if="showNewDialog" class="dialog-overlay" @click="showNewDialog = false">
      <div class="dialog" @click.stop>
        <h3>新建项目</h3>
        <div class="form-group">
          <label>类型:</label>
          <select v-model="newItemType">
            <option value="file">文件</option>
            <option value="folder">文件夹</option>
          </select>
        </div>
        <div class="form-group">
          <label>名称:</label>
          <input
            v-model="newItemName"
            type="text"
            placeholder="输入名称..."
            @keyup.enter="createNewItem"
          />
        </div>
        <div class="dialog-actions">
          <button @click="createNewItem" :disabled="!newItemName.trim()" class="primary">
            创建
          </button>
          <button @click="showNewDialog = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./FileManagerApp.ts"></script>
<style scoped>
.file-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.nav-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
}

.nav-btn:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.path {
  font-family: monospace;
  background: var(--bg-tertiary);
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  font-size: 12px;
}

.search-box {
  flex: 1;
  max-width: 200px;
}

.search-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 12px;
}

.view-controls {
  display: flex;
  gap: 4px;
}

.view-btn, .new-btn {
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 11px;
}

.view-btn.active {
  background: var(--accent-color);
  color: white;
}

.new-btn {
  background: var(--accent-color);
  color: white;
}

.view-btn:hover, .new-btn:hover {
  opacity: 0.8;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.file-list.list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-list.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  background: var(--bg-secondary);
}

.file-list.grid .file-item {
  flex-direction: column;
  text-align: center;
  aspect-ratio: 1;
  justify-content: center;
}

.file-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

.file-item.selected {
  background: var(--accent-color);
  color: white;
}

.file-item.folder {
  font-weight: 500;
}

.file-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-details {
  display: flex;
  gap: 12px;
  font-size: 11px;
  opacity: 0.7;
  margin-top: 2px;
}

.file-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.action-btn {
  padding: 2px 4px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 2px;
  font-size: 12px;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.action-btn.delete:hover {
  background: rgba(255, 0, 0, 0.1);
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  min-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dialog h3 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
}

.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

.dialog-actions button {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
}

.dialog-actions button.primary {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.dialog-actions button:hover {
  opacity: 0.8;
}

.dialog-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
