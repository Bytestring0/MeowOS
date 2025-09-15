<template>
  <div class="text-reader-app">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="document-info">
        <h1 class="document-title">{{ documentName || '文本阅读器' }}</h1>
        <div class="document-meta">
          <span v-if="estimatedReadTime" class="read-time">
            📖 预计阅读时间: {{ estimatedReadTime }} 分钟
          </span>
          <span v-if="content" class="word-count">
            📝 字数: {{ content.length }}
          </span>
        </div>
      </div>
      
      <div class="toolbar-actions">
        <div class="font-controls">
          <button @click="adjustFontSize(-1)" title="减小字体">A-</button>
          <span class="font-size-display">{{ fontSize }}px</span>
          <button @click="adjustFontSize(1)" title="增大字体">A+</button>
        </div>
        
        <div class="line-height-controls">
          <button @click="adjustLineHeight(-0.1)" title="减小行高">⇅-</button>
          <span class="line-height-display">{{ lineHeight.toFixed(1) }}</span>
          <button @click="adjustLineHeight(0.1)" title="增大行高">⇅+</button>
        </div>
        
        <button 
          @click="toggleToc" 
          :class="{ active: showToc }"
          class="toc-toggle"
          title="切换目录"
        >
          📋
        </button>
        
        <div class="divider"></div>
        
        <button @click="copyContent" title="复制内容">📋</button>
        <button @click="printDocument" title="打印">🖨️</button>
        <button @click="exportToPdf" title="导出PDF">📄</button>
      </div>
    </div>

    <!-- 阅读进度条 -->
    <div class="progress-bar">
      <div class="progress-fill" :style="progressBarStyle"></div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 侧边目录 -->
      <div v-if="showToc && tocItems.length > 0" class="toc-sidebar">
        <h3>目录</h3>
        <ul class="toc-list">
          <li 
            v-for="(item, index) in tocItems" 
            :key="index"
            :class="`toc-level-${item.level}`"
            @click="scrollToAnchor(item.anchor)"
          >
            {{ item.title }}
          </li>
        </ul>
      </div>

      <!-- 文档内容 -->
      <div class="content-wrapper">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>加载文档中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>加载失败</h3>
          <p>{{ error }}</p>
        </div>

        <!-- 文档内容 -->
        <div 
          v-else-if="htmlContent"
          class="content-body"
          :style="readerStyle"
          @scroll="updateReadingProgress"
          v-html="htmlContent"
        ></div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">📄</div>
          <h3>没有选择文档</h3>
          <p>请从文件阅读器中选择要阅读的文档</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./TextReaderApp.ts"></script>

<style scoped>
.text-reader-app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
  color: var(--text-color);
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--surface-color);
  flex-shrink: 0;
}

.document-info {
  flex: 1;
}

.document-title {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

.document-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.font-controls, .line-height-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--bg-color);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.font-controls button, .line-height-controls button {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--text-color);
  transition: background 0.2s ease;
}

.font-controls button:hover, .line-height-controls button:hover {
  background: var(--hover-color);
}

.font-size-display, .line-height-display {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: center;
}

.toc-toggle {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toc-toggle.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
}

.toolbar-actions > button {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-actions > button:hover {
  background: var(--hover-color);
  transform: translateY(-1px);
}

/* 进度条 */
.progress-bar {
  height: 3px;
  background: var(--border-color);
  position: relative;
  flex-shrink: 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}

/* 主内容区域 */
.main-content {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* 目录侧边栏 */
.toc-sidebar {
  width: 280px;
  background: var(--surface-color);
  border-right: 1px solid var(--border-color);
  padding: 20px;
  overflow-y: auto;
  flex-shrink: 0;
}

.toc-sidebar h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  padding: 6px 12px;
  margin: 2px 0;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 14px;
  line-height: 1.4;
}

.toc-list li:hover {
  background: var(--hover-color);
  transform: translateX(4px);
}

.toc-level-1 { 
  font-weight: 600; 
  margin-left: 0;
}
.toc-level-2 { 
  margin-left: 16px; 
  font-size: 13px;
}
.toc-level-3 { 
  margin-left: 32px; 
  font-size: 12px;
  opacity: 0.8;
}
.toc-level-4 { 
  margin-left: 48px; 
  font-size: 12px;
  opacity: 0.7;
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-body {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* 状态页面 */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.error-state h3, .empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--text-color);
}

.error-state p, .empty-state p {
  margin: 0;
  color: var(--text-secondary);
}

/* Markdown内容样式 */
.content-body :deep(h1),
.content-body :deep(h2),
.content-body :deep(h3),
.content-body :deep(h4),
.content-body :deep(h5),
.content-body :deep(h6) {
  color: var(--text-color);
  margin-top: 2em;
  margin-bottom: 1em;
  font-weight: 600;
  line-height: 1.3;
}

.content-body :deep(h1) {
  font-size: 2.2em;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5em;
}

.content-body :deep(h2) {
  font-size: 1.8em;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3em;
}

.content-body :deep(h3) {
  font-size: 1.5em;
}

.content-body :deep(h4) {
  font-size: 1.3em;
}

.content-body :deep(p) {
  margin-bottom: 1.2em;
  color: var(--text-color);
}

.content-body :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.content-body :deep(a:hover) {
  border-bottom-color: var(--primary-color);
}

.content-body :deep(blockquote) {
  margin: 1.5em 0;
  padding: 1em 1.5em;
  background: var(--surface-color);
  border-left: 4px solid var(--primary-color);
  border-radius: 0 6px 6px 0;
}

.content-body :deep(blockquote p) {
  margin: 0;
  font-style: italic;
}

.content-body :deep(ul),
.content-body :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.content-body :deep(li) {
  margin: 0.5em 0;
}

.content-body :deep(code) {
  background: var(--surface-color);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.content-body :deep(pre) {
  background: var(--surface-color);
  padding: 1.5em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5em 0;
  border: 1px solid var(--border-color);
}

.content-body :deep(pre code) {
  background: none;
  padding: 0;
  font-size: 0.85em;
  line-height: 1.6;
}

.content-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.content-body :deep(th),
.content-body :deep(td) {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.content-body :deep(th) {
  background: var(--surface-color);
  font-weight: 600;
}

.content-body :deep(tr:hover) {
  background: var(--hover-color);
}

.content-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.content-body :deep(hr) {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  margin: 2em 0;
}

/* 任务列表样式 */
.content-body :deep(.task-list-item) {
  list-style: none;
  position: relative;
}

.content-body :deep(.task-list-item input) {
  margin-right: 8px;
}

/* 脚注样式 */
.content-body :deep(.footnote-ref) {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.8em;
  vertical-align: super;
}

.content-body :deep(.footnotes) {
  margin-top: 3em;
  padding-top: 1em;
  border-top: 2px solid var(--border-color);
}

/* 标记文本样式 */
.content-body :deep(mark) {
  background: linear-gradient(120deg, transparent 0%, rgba(255, 193, 7, 0.3) 50%, transparent 100%);
  padding: 0.1em 0.2em;
  border-radius: 2px;
}

/* 上标下标样式 */
.content-body :deep(sup),
.content-body :deep(sub) {
  font-size: 0.8em;
}

/* 打印样式 */
@media print {
  .toolbar,
  .toc-sidebar,
  .progress-bar {
    display: none !important;
  }
  
  .content-body {
    padding: 0;
    max-width: none;
    box-shadow: none;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .toc-sidebar {
    width: 240px;
  }
  
  .content-body {
    padding: 30px;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .toolbar-actions {
    justify-content: space-between;
    flex-wrap: wrap;
  }
  
  .toc-sidebar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 10;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .toc-sidebar.show {
    transform: translateX(0);
  }
  
  .content-body {
    padding: 20px;
  }
}
</style>
