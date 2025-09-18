<template>
  <div class="text-reader-app">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="document-info">
        <h1 class="document-title">{{ documentName || '文本阅读器' }}</h1>
        <div class="document-meta">
          <span v-if="estimatedReadTime" class="read-time">
            预计阅读时间: {{ estimatedReadTime }} 分钟
          </span>
          <span v-if="content" class="word-count">
            字数: {{ content.length }}
          </span>
        </div>
      </div>
      
      <div class="toolbar-actions">
        <button 
          @click="toggleToc" 
          :class="{ active: showToc }"
          class="toc-toggle"
          title="切换目录"
        >
          {{ showToc ? '隐藏目录' : '显示目录' }}
        </button>
      </div>
    </div>

    <!-- 阅读进度条 -->
    <div class="progress-bar">
      <div class="progress-fill" :style="progressBarStyle"></div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 侧边目录 -->
      <transition name="toc-slide" appear>
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
      </transition>

      <!-- 文档内容 -->
      <div class="content-wrapper">
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  /* 启用文本选择 - 使用 !important 覆盖全局样式 */
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}

/* 强制启用文本选择 - 覆盖可能的全局禁用样式 */
.text-reader-app * {
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}

/* 但是按钮和交互元素应该禁用选择 */
.text-reader-app button,
.text-reader-app .toc-toggle,
.text-reader-app .toolbar-actions > *,
.text-reader-app .toc-list li,
.text-reader-app .code-actions,
.text-reader-app .code-action-btn,
.text-reader-app .progress-bar {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

/* 确保内容区域可以选择文本 */
.text-reader-app .content-body,
.text-reader-app .content-body *:not(button):not(.code-actions):not(.code-action-btn) {
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}

/* 工具栏样式 - 使用系统主题 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--bg-secondary);
  backdrop-filter: var(--window-backdrop-filter, blur(20px));
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  box-shadow: var(--box-shadow-light);
}

.document-info {
  flex: 1;
}

.document-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}

.document-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toc-toggle {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 1rem;
  color: var(--text-color);
  box-shadow: var(--box-shadow-light);
  position: relative;
  overflow: hidden;
  /* 禁用按钮文本选择 */
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

.toc-toggle::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--primary-color-rgb, 59, 130, 246), 0.1), transparent);
  transition: left 0.5s ease;
}

.toc-toggle:hover::before {
  left: 100%;
}

.toc-toggle.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: var(--box-shadow);
  transform: translateY(-1px) scale(1.05);
}

.toc-toggle.active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    width: 100px;
    height: 100px;
    opacity: 0;
  }
}

.divider {
  width: 1px;
  height: 1.5rem;
  background: var(--border-color);
}

.toolbar-actions > button {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--animation-duration) ease;
  font-size: 1rem;
  color: var(--text-color);
  box-shadow: var(--box-shadow-light);
  /* 禁用按钮文本选择 */
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

.toolbar-actions > button:hover {
  background: var(--secondary-color);
  color: white;
  border-color: var(--secondary-color);
  transform: translateY(-1px);
  box-shadow: var(--box-shadow);
}

/* 进度条 - 使用系统主题 */
.progress-bar {
  height: 4px;
  background: var(--border-color-lighter);
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.5s ease;
  position: relative;
}

/* 主内容区域 */
.main-content {
  display: flex;
  flex: 1;
  min-height: 0;
  background: var(--bg-color-light);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 目录侧边栏 - 使用系统主题 */
.toc-sidebar {
  width: 320px;
  background: var(--bg-secondary);
  backdrop-filter: var(--window-backdrop-filter, none);
  border-right: 1px solid var(--border-color);
  padding: 2rem;
  overflow-y: auto;
  flex-shrink: 0;
  box-shadow: var(--box-shadow-light);
}

/* 目录过渡动画 */
.toc-slide-enter-active, .toc-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: left center;
}

.toc-slide-enter-from {
  transform: translateX(-100%) scaleX(0.8);
  opacity: 0;
  box-shadow: none;
}

.toc-slide-leave-to {
  transform: translateX(-100%) scaleX(0.8);
  opacity: 0;
  box-shadow: none;
}

.toc-slide-enter-active .toc-list li {
  transition: all 0.3s ease;
  transition-delay: calc(var(--i, 0) * 0.05s);
}

.toc-slide-enter-from .toc-list li {
  transform: translateX(-30px);
  opacity: 0;
}

/* 为目录项添加延迟动画效果 */
.toc-list li:nth-child(1) { --i: 1; }
.toc-list li:nth-child(2) { --i: 2; }
.toc-list li:nth-child(3) { --i: 3; }
.toc-list li:nth-child(4) { --i: 4; }
.toc-list li:nth-child(5) { --i: 5; }
.toc-list li:nth-child(6) { --i: 6; }
.toc-list li:nth-child(7) { --i: 7; }
.toc-list li:nth-child(8) { --i: 8; }
.toc-list li:nth-child(9) { --i: 9; }
.toc-list li:nth-child(10) { --i: 10; }

.toc-sidebar h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  padding: 0.75rem 1rem;
  margin: 0.25rem 0;
  cursor: pointer;
  border-radius: 8px;
  transition: all var(--animation-duration) ease;
  font-size: 0.925rem;
  line-height: 1.5;
  color: var(--text-color);
  font-weight: 500;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
  /* 禁用目录项文本选择 */
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

.toc-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-color);
  transform: scaleY(0);
  transition: transform var(--animation-duration) ease;
}

.toc-list li:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
  transform: translateX(8px);
  color: var(--text-primary);
  box-shadow: var(--box-shadow-light);
}

.toc-list li:hover::before {
  transform: scaleY(1);
}

.toc-level-1 { 
  font-weight: 700; 
  margin-left: 0;
  font-size: 1rem;
  color: var(--text-primary);
}
.toc-level-2 { 
  margin-left: 1rem; 
  font-size: 0.925rem;
  color: var(--text-color);
}
.toc-level-3 { 
  margin-left: 2rem; 
  font-size: 0.875rem;
  color: var(--text-color-light);
}
.toc-level-4 { 
  margin-left: 3rem; 
  font-size: 0.875rem;
  color: var(--text-color-lighter);
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg-color);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.content-body {
  flex: 1;
  padding: 3rem;
  overflow-y: auto;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  background: var(--bg-primary);
  border-radius: 16px 16px 0 0;
  box-shadow: var(--box-shadow);
  position: relative;
  border: 1px solid var(--border-color-lighter);
}

/* 状态页面 - 使用系统主题 */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-color);
  backdrop-filter: var(--window-backdrop-filter, none);
  border-radius: 24px;
  margin: 2rem;
  box-shadow: var(--box-shadow);
  border: 1px solid var(--border-color);
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
  color: var(--text-secondary);
}

.error-state h3, .empty-state h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.5rem;
  color: var(--text-primary);
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-state p, .empty-state p {
  margin: 0;
  color: var(--text-color);
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 400px;
}


/* 滚动条样式 */
.content-body::-webkit-scrollbar {
  width: 8px;
}

.content-body::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

.content-body::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
  transition: background-color var(--animation-duration) ease;
}

.content-body::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

.toc-sidebar::-webkit-scrollbar {
  width: 6px;
}

.toc-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.toc-sidebar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.toc-sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-color);
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-body > * {
  animation: fadeInUp 0.6s ease-out;
}

/* 打印样式 */
@media print {
  .toolbar, .toc-sidebar, .progress-bar {
    display: none !important;
  }
  
  .content-body {
    padding: 0;
    box-shadow: none;
    border-radius: 0;
    background: white;
    color: black;
  }
  
  .content-body h1, .content-body h2, .content-body h3,
  .content-body h4, .content-body h5, .content-body h6 {
    color: black;
    background: none;
    -webkit-text-fill-color: initial;
  }
}

/* 重置 Markdown 元素默认样式 */
.content-body * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Markdown 标题样式 - 使用系统主题 */
.content-body :deep(h1),
.content-body :deep(h2),
.content-body :deep(h3),
.content-body :deep(h4),
.content-body :deep(h5),
.content-body :deep(h6) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 700;
  letter-spacing: -0.025em;
  margin: 2rem 0 1rem 0;
  position: relative;
  color: var(--text-primary);
  line-height: 1.3;
}

.content-body :deep(h1) {
  font-size: 2.5rem;
  margin-top: 0;
  margin-bottom: 2rem;
  color: var(--text-primary);
  font-weight: 800;
  border-bottom: 3px solid var(--border-color);
  padding-bottom: 1rem;
}

.content-body :deep(h1::after) {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 4rem;
  height: 3px;
  background: var(--primary-color);
  border-radius: 2px;
}

.content-body :deep(h2) {
  font-size: 2rem;
  color: var(--primary-color);
  border-left: 4px solid var(--primary-color);
  padding-left: 1.5rem;
  margin-left: -1.5rem;
}

.content-body :deep(h3) {
  font-size: 1.5rem;
  color: var(--text-primary);
  position: relative;
  font-weight: 700;
}

.content-body :deep(h3::before) {
  content: '●';
  position: absolute;
  left: -1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary-color);
  font-size: 0.6em;
}

.content-body :deep(h4) {
  font-size: 1.25rem;
  color: var(--text-primary);
  font-weight: 700;
}

.content-body :deep(h5) {
  font-size: 1.1rem;
  color: var(--text-primary);
  font-weight: 600;
}

.content-body :deep(h6) {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 段落样式 */
.content-body :deep(p) {
  font-size: 1.125rem;
  line-height: 1.75;
  margin: 1.5rem 0;
  color: var(--text-color);
  font-weight: 400;
  text-align: justify;
  word-spacing: 0.05em;
}

.content-body :deep(p:first-of-type) {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-top: 0;
}

/* 链接样式 */
.content-body :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
  position: relative;
  font-weight: 600;
  transition: all var(--animation-duration) ease;
  border-bottom: 2px solid transparent;
}

.content-body :deep(a::after) {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width var(--animation-duration) ease;
}

.content-body :deep(a:hover) {
  color: var(--secondary-color);
}

.content-body :deep(a:hover::after) {
  width: 100%;
}

/* 强调文本样式 */
.content-body :deep(strong) {
  font-weight: 700;
  color: var(--text-primary);
  background: linear-gradient(120deg, transparent 0%, rgba(var(--primary-color-rgb, 59, 130, 246), 0.1) 50%, transparent 100%);
  padding: 0.1em 0.2em;
  border-radius: 3px;
}

.content-body :deep(em) {
  font-style: italic;
  color: var(--primary-color);
  font-weight: 500;
}

/* 引用块样式 */
.content-body :deep(blockquote) {
  margin: 2rem 0;
  padding: 1.5rem 2rem;
  background: var(--bg-secondary);
  border: none;
  border-left: 4px solid var(--primary-color);
  border-radius: 0 12px 12px 0;
  position: relative;
  box-shadow: var(--box-shadow-light);
  backdrop-filter: var(--window-backdrop-filter, none);
}

.content-body :deep(blockquote::before) {
  content: '"';
  position: absolute;
  top: -0.5rem;
  left: 1rem;
  font-size: 4rem;
  color: var(--primary-color);
  opacity: 0.3;
  font-family: Georgia, serif;
  line-height: 1;
}

.content-body :deep(blockquote p) {
  margin: 0;
  font-style: italic;
  color: var(--text-primary);
  font-size: 1.125rem;
  line-height: 1.6;
}

/* 列表样式 */
.content-body :deep(ul) {
  margin: 1.5rem 0;
  padding-left: 0;
  list-style: none;
}

.content-body :deep(ul li) {
  position: relative;
  padding-left: 2rem;
  margin: 0.75rem 0;
  line-height: 1.6;
  color: var(--text-color);
  font-size: 1.125rem;
}

.content-body :deep(ul li::before) {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0.7rem;
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  transform: translateY(-50%);
}

.content-body :deep(ol) {
  margin: 1.5rem 0;
  padding-left: 0;
  counter-reset: list-counter;
  list-style: none;
}

.content-body :deep(ol li) {
  position: relative;
  padding-left: 2.5rem;
  margin: 0.75rem 0;
  line-height: 1.6;
  color: var(--text-color);
  counter-increment: list-counter;
  font-size: 1.125rem;
}

.content-body :deep(ol li::before) {
  content: counter(list-counter);
  position: absolute;
  left: 0;
  top: 0;
  width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.content-body :deep(ul li:hover),
.content-body :deep(ol li:hover) {
  color: var(--text-primary);
  transform: translateX(4px);
  transition: all var(--animation-duration) ease;
}

/* 代码样式 */
.content-body :deep(code:not(pre code)) {
  background: var(--bg-tertiary);
  color: var(--accent-color, var(--primary-color));
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
  font-weight: 600;
  border: 1px solid var(--border-color);
  box-shadow: var(--box-shadow-light);
}

.content-body :deep(pre) {
  background: var(--bg-tertiary);
  color: var(--text-color);
  padding: 3.5rem 2rem 2rem 2rem;
  border-radius: 16px;
  overflow-x: auto;
  margin: 2rem 0;
  position: relative;
  box-shadow: var(--box-shadow);
  border: 1px solid var(--border-color);
}

.content-body :deep(pre::before) {
  content: '';
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--error-color, #ef4444);
  box-shadow: 20px 0 var(--warning-color, #f59e0b), 40px 0 var(--success-color, #10b981);
  z-index: 5;
}

.content-body :deep(pre:hover .code-actions) {
  opacity: 1;
}

/* 代码块按钮组样式 */
.content-body :deep(.code-actions) {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: all var(--animation-duration) ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 0.25rem;
  background: rgba(var(--bg-color-rgb, 255, 255, 255), 0.05);
  backdrop-filter: blur(10px);
  /* 禁用按钮组选择 */
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

.content-body :deep(pre:hover .code-actions) {
  opacity: 1;
}

.content-body :deep(.code-action-btn) {
  background: rgba(var(--bg-color-rgb, 255, 255, 255), 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--border-color-rgb, 229, 231, 235), 0.3);
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-color);
  transition: all var(--animation-duration) ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  /* 禁用按钮文本选择 */
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

.content-body :deep(.code-action-btn:hover) {
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.8);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 59, 130, 246), 0.3);
  transform: translateY(-2px);
}

.content-body :deep(.copy-btn.copied) {
  background: rgba(var(--success-color-rgb, 16, 185, 129), 0.8);
  color: white;
  border-color: var(--success-color, #10b981);
  box-shadow: 0 4px 12px rgba(var(--success-color-rgb, 16, 185, 129), 0.3);
}

.content-body :deep(.code-action-btn svg) {
  transition: transform var(--animation-duration) ease;
}

.content-body :deep(.code-action-btn:hover svg) {
  transform: scale(1.1);
}

/* 代码块展开状态 */
.content-body :deep(pre.expanded) {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.content-body :deep(pre.expanded code) {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}



.content-body :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
  border: none;
  box-shadow: none;
  font-size: 0.925rem;
  line-height: 1.7;
  font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Menlo', monospace;
}

/* 表格样式 */
.content-body :deep(table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 2rem 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--box-shadow);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
}

.content-body :deep(thead) {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

.content-body :deep(th) {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 700;
  color: white;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
}

.content-body :deep(td) {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
  border: none;
}

.content-body :deep(tbody tr) {
  transition: all var(--animation-duration) ease;
}

.content-body :deep(tbody tr:hover) {
  background: var(--bg-secondary);
  transform: scale(1.005);
}

.content-body :deep(tbody tr:nth-child(even)) {
  background: var(--bg-tertiary);
}

.content-body :deep(tbody tr:last-child td) {
  border-bottom: none;
}

/* 图片样式 */
.content-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  margin: 2rem auto;
  display: block;
  box-shadow: var(--box-shadow);
  transition: transform var(--animation-duration) ease, box-shadow var(--animation-duration) ease;
  border: 1px solid var(--border-color);
}

.content-body :deep(img:hover) {
  transform: scale(1.02);
  box-shadow: var(--box-shadow-strong);
}
.content-body :deep(hr) {
        border: none;
        height: 60px;
        position: relative;
        margin: 3em 0;
        overflow: hidden;

        background: linear-gradient(
              to right,
              #fbbe24 0%,
              #fbbe24 calc(50% - 30px),
              transparent calc(50% - 30px),
              transparent calc(50% + 30px),
              #fbbe24 calc(50% + 30px),
              #fbbe24 100%
            )
            no-repeat center / 100% 3px,
          linear-gradient(
              to right,
              #ffffff 0%,
              #ffffff calc(50% - 30px),
              transparent calc(50% - 30px),
              transparent calc(50% + 30px),
              #ffffff calc(50% + 30px),
              #ffffff 100%
            )
            no-repeat center / 100% 2px;

        background-position: center calc(50% - 10px), center calc(50% + 10px);
      }

.content-body :deep(hr)::before {
  content: "";
  position: absolute;
  left: 50.1%;
  top: 40%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;

  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1304 1024"><path d="M0 446.49054a171.094255 145.438963 90 1 0 290.877927 0 171.094255 145.438963 90 1 0-290.877927 0Z" fill="%23f7999f"></path><path d="M1126.923945 768.927392a140.307905 171.094255 12.07 1 0 71.553865-334.6237 140.307905 171.094255 12.07 1 0-71.553865 334.6237Z" fill="%23f7999f"></path><path d="M353.069892 190.999222a190.999222 149.508423 90 1 0 299.016847 0 190.999222 149.508423 90 1 0-299.016847 0Z" fill="%23f7999f"></path><path d="M887.858242 431.109679a149.508423 190.999222 6.71 1 0 44.634256-379.38186 149.508423 190.999222 6.71 1 0-44.634256 379.38186Z" fill="%23f7999f"></path><path d="M962.073434 786.025054c-10.704449 162.07067-167.201728 249.033261-352.36216 236.736415s-328.918531-118.899006-318.479481-281.058143 173.305918-264.957235 354.662289-271.415291c187.549028 37.686739 326.883801 153.577883 316.179352 315.737019z" fill="%23f7999f"></path></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 1;
}
.content-body :deep(hr:hover::before) {
  /* 启动动画（名字可以改）*/
  animation: pawChargeSpin 2s both;
  /* 如果你之前有 pulse 动画，想同时保留可以把它取消或合并；这里以覆盖为准 */
}

/* ---------- 下面是必须的 keyframes（放在 CSS 任意位置） ---------- */
@keyframes pawChargeSpin {

  /* 早期（蓄力）：瞬间向右位移并略向后摆（像蓄力向右），持续很短的时间 */
  10% {
    transform: translate(-50%, -50%) rotate(-25deg);
    /* 蓄力用带回弹的曲线（表现“向右用力”） */
    animation-timing-function: cubic-bezier(0.68, -0.6, 0.32, 1.6);
  }

  /* 终点：完整一圈，回到居中 */
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}



/* 任务列表样式 */
.content-body :deep(.task-list-item) {
  list-style: none;
  position: relative;
  padding-left: 2.5rem;
}

.content-body :deep(.task-list-item::before) {
  display: none;
}

.content-body :deep(.task-list-item input[type="checkbox"]) {
  position: absolute;
  left: 0;
  top: 0.1rem;
  width: 1.25rem;
  height: 1.25rem;
  appearance: none;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color);
  cursor: pointer;
  transition: all var(--animation-duration) ease;
}

.content-body :deep(.task-list-item input[type="checkbox"]:checked) {
  background: linear-gradient(135deg, var(--success-color, #10b981), var(--primary-color));
  border-color: var(--success-color, #10b981);
}

.content-body :deep(.task-list-item input[type="checkbox"]:checked::after) {
  content: '✓';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

/* 标记文本样式 */
.content-body :deep(mark) {
  background: linear-gradient(120deg, transparent 0%, rgba(var(--warning-color-rgb, 251, 191, 36), 0.4) 0%, rgba(var(--warning-color-rgb, 251, 191, 36), 0.4) 100%, transparent 100%);
  color: var(--text-primary);
  padding: 0.1em 0.3em;
  border-radius: 4px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

/* 上标下标样式 */
.content-body :deep(sup) {
  font-size: 0.75em;
  color: var(--primary-color);
  font-weight: 600;
}

.content-body :deep(sub) {
  font-size: 0.75em;
  color: var(--secondary-color);
  font-weight: 600;
}

/* 脚注样式 */
.content-body :deep(.footnote-ref) {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.8em;
  vertical-align: super;
  font-weight: 600;
  background: var(--bg-secondary);
  padding: 0.1em 0.3em;
  border-radius: 3px;
  margin-left: 0.1em;
}

.content-body :deep(.footnotes) {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 2px solid var(--border-color);
  position: relative;
}

.content-body :deep(.footnotes::before) {
  content: 'References';
  position: absolute;
  top: -1rem;
  left: 0;
  background: var(--bg-color);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 键盘按键样式 */
.content-body :deep(kbd) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 0.85em;
  font-weight: 600;
  border: 1px solid var(--border-color);
  box-shadow: var(--box-shadow-light);
  text-transform: uppercase;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .content-body :deep(h1) {
    font-size: 2rem;
  }
  
  .content-body :deep(h2) {
    font-size: 1.75rem;
    margin-left: 0;
    padding-left: 1rem;
  }
  
  .content-body :deep(h3) {
    font-size: 1.25rem;
  }
  
  .content-body :deep(h3::before) {
    left: -1rem;
  }
  
  .content-body :deep(pre) {
    padding: 1rem;
    border-radius: 8px;
  }
  
  .content-body :deep(table) {
    font-size: 0.9rem;
  }
  
  .content-body :deep(th),
  .content-body :deep(td) {
    padding: 0.75rem;
  }
  
  .content-body :deep(p) {
    font-size: 1rem;
  }
  
  .content-body :deep(ul li) {
    padding-left: 1.5rem;
  }
  
  .content-body :deep(ol li) {
    padding-left: 2rem;
  }
  
  .content-body :deep(blockquote) {
    padding: 1rem 1.25rem;
    margin: 1.5rem 0;
  }
}

/* 动画增强 */
.content-body :deep(h1:hover),
.content-body :deep(h2:hover),
.content-body :deep(h3:hover) {
  transform: translateX(8px);
  transition: transform var(--animation-duration) ease;
}

/* 特殊效果 */
.content-body :deep(blockquote:hover) {
  transform: translateX(4px);
  transition: transform var(--animation-duration) ease;
}

.content-body :deep(table:hover) {
  box-shadow: var(--box-shadow-strong);
  transition: box-shadow var(--animation-duration) ease;
}

</style>
