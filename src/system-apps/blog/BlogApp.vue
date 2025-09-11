<template>
  <div class="blog-app">
    <!-- 顶部工具栏 -->
    <div class="blog-toolbar">
      <div class="toolbar-left">
        <button @click="toggleSidebar" class="sidebar-toggle" :title="sidebarVisible ? '隐藏侧边栏' : '显示侧边栏'">
          {{ sidebarVisible ? '◀' : '▶' }}
        </button>
        <div class="breadcrumbs">
          <span 
            v-for="(crumb, index) in breadcrumbs" 
            :key="crumb.path"
            class="breadcrumb-item"
            @click="navigateToPath(crumb.path)"
          >
            {{ crumb.name }}
            <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">/</span>
          </span>
        </div>
      </div>
      <div class="toolbar-right">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索文档..." 
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>
    </div>

    <div class="blog-content">
      <!-- 侧边栏 -->
      <div v-if="sidebarVisible" class="blog-sidebar">
        <!-- 统计信息 -->
        <div class="stats-card">
          <h3>📊 文档统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ stats.fileCount }}</span>
              <span class="stat-label">文档</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.directoryCount }}</span>
              <span class="stat-label">目录</span>
            </div>
          </div>
        </div>

        <!-- 推荐文档 -->
        <div class="sidebar-section">
          <h3>⭐ 推荐阅读</h3>
          <div class="recommended-list">
            <div 
              v-for="doc in recommendedDocs" 
              :key="doc.id"
              class="recommended-item"
              @click="loadDocument(doc)"
            >
              <span class="doc-icon">{{ getFileIcon(doc) }}</span>
              <span class="doc-name">{{ doc.name }}</span>
            </div>
          </div>
        </div>

        <!-- 最近文档 -->
        <div class="sidebar-section">
          <h3>📝 最近文档</h3>
          <div class="recent-list">
            <div 
              v-for="doc in recentDocs" 
              :key="doc.id"
              class="recent-item"
              @click="loadDocument(doc)"
            >
              <span class="doc-icon">{{ getFileIcon(doc) }}</span>
              <span class="doc-name">{{ doc.name }}</span>
            </div>
          </div>
        </div>

        <!-- 文档树 -->
        <div class="sidebar-section">
          <h3>📚 文档目录</h3>
          <div v-if="currentPath !== '/'" class="nav-item" @click="navigateUp">
            <span class="nav-icon">⬆️</span>
            <span class="nav-label">返回上级</span>
          </div>
          <div class="document-tree">
            <div 
              v-for="doc in documents" 
              :key="doc.id"
              class="tree-item"
              :class="{ active: currentDocument?.id === doc.id }"
              @click="loadDocument(doc)"
            >
              <span class="tree-icon">{{ getFileIcon(doc) }}</span>
              <span class="tree-label">{{ doc.name }}</span>
              <span v-if="doc.type === 'file'" class="tree-meta">
                {{ formatDate(doc.modified) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="blog-main" :class="{ 'full-width': !sidebarVisible }">
        <!-- 搜索结果 -->
        <div v-if="searchQuery && searchResults.length > 0" class="search-results">
          <h2>🔍 搜索结果</h2>
          <div class="search-list">
            <div 
              v-for="result in searchResults" 
              :key="result.id"
              class="search-result-item"
              @click="loadDocument(result)"
            >
              <span class="result-icon">{{ getFileIcon(result) }}</span>
              <div class="result-info">
                <div class="result-name">{{ result.name }}</div>
                <div class="result-path">{{ result.path }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 文档内容 -->
        <div v-else-if="currentDocument" class="document-content">
          <div class="document-header">
            <h1 class="document-title">{{ currentDocument.name }}</h1>
            <div class="document-meta">
              <span class="meta-item">📅 {{ formatDate(currentDocument.modified) }}</span>
              <span v-if="currentDocument.size" class="meta-item">📄 {{ formatFileSize(currentDocument.size) }}</span>
            </div>
          </div>
          
          <div v-if="isLoading" class="loading">
            <div class="loading-spinner">⏳</div>
            <div class="loading-text">加载中...</div>
          </div>
          
          <div 
            v-else 
            class="document-body markdown-content"
            v-html="renderMarkdown(documentContent)"
          ></div>
        </div>

        <!-- 欢迎页面 -->
        <div v-else class="welcome-page">
          <div class="welcome-header">
            <h1>📚 文档博客</h1>
            <p>探索 MeowOS 的完整文档和教程</p>
          </div>

          <div class="welcome-sections">
            <div class="welcome-section">
              <h2>🚀 快速开始</h2>
              <p>新手？从这里开始了解 MeowOS</p>
              <div class="quick-links">
                <button 
                  v-for="doc in recommendedDocs.slice(0, 3)" 
                  :key="doc.id"
                  class="quick-link"
                  @click="loadDocument(doc)"
                >
                  {{ doc.name }}
                </button>
              </div>
            </div>

            <div class="welcome-section">
              <h2>📖 浏览文档</h2>
              <p>按分类浏览所有可用文档</p>
              <div class="category-grid">
                <div 
                  v-for="doc in documents.filter(d => d.type === 'directory')" 
                  :key="doc.id"
                  class="category-card"
                  @click="loadDocument(doc)"
                >
                  <div class="category-icon">{{ getFileIcon(doc) }}</div>
                  <div class="category-name">{{ doc.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./BlogApp.ts"></script>

<style scoped>
.blog-app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
  color: var(--text-color);
}

/* 工具栏 */
.blog-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-color-light);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-toggle {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  color: var(--text-color);
  font-size: 14px;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background: var(--primary-color);
  color: white;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.breadcrumb-item {
  cursor: pointer;
  color: var(--text-color-light);
  transition: color 0.2s ease;
}

.breadcrumb-item:hover {
  color: var(--primary-color);
}

.breadcrumb-item:last-child {
  color: var(--text-color);
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 4px;
  color: var(--text-color-lighter);
}

.search-box {
  position: relative;
}

.search-input {
  padding: 8px 32px 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
  width: 200px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 74, 144, 226), 0.2);
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-color-lighter);
}

/* 主内容区 */
.blog-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.blog-sidebar {
  width: 300px;
  background: var(--bg-color-light);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  padding: 16px;
  flex-shrink: 0;
}

.stats-card {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.stats-card h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--text-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-color-light);
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-color);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
}

.recommended-list,
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommended-item,
.recent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.recommended-item:hover,
.recent-item:hover {
  background: var(--bg-color);
}

.document-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tree-item:hover {
  background: var(--bg-color);
}

.tree-item.active {
  background: var(--primary-color);
  color: white;
}

.tree-icon,
.doc-icon {
  font-size: 16px;
}

.tree-label,
.doc-name {
  flex: 1;
  font-size: 14px;
}

.tree-meta {
  font-size: 11px;
  color: var(--text-color-lighter);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 8px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--primary-color);
  color: white;
}

/* 主内容 */
.blog-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.blog-main.full-width {
  padding: 24px 48px;
}

/* 搜索结果 */
.search-results h2 {
  margin: 0 0 20px 0;
  color: var(--text-color);
}

.search-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-result-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--box-shadow-light);
}

.result-icon {
  font-size: 20px;
}

.result-info {
  flex: 1;
}

.result-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
}

.result-path {
  font-size: 14px;
  color: var(--text-color-light);
}

/* 文档内容 */
.document-content {
  max-width: 800px;
  margin: 0 auto;
}

.document-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.document-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 12px 0;
}

.document-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--text-color-light);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.loading-spinner {
  font-size: 32px;
  margin-bottom: 12px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-color-light);
}

/* Markdown 内容样式 */
.markdown-content {
  line-height: 1.6;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  color: var(--text-color);
  font-weight: 600;
  margin: 24px 0 16px 0;
}

.markdown-content h1 {
  font-size: 28px;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 8px;
}

.markdown-content h2 {
  font-size: 24px;
}

.markdown-content h3 {
  font-size: 20px;
}

.markdown-content p {
  margin: 0 0 16px 0;
  color: var(--text-color);
}

.markdown-content strong {
  font-weight: 600;
  color: var(--text-color);
}

.markdown-content em {
  font-style: italic;
  color: var(--text-color-light);
}

.markdown-content code {
  background: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 2px 6px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  color: var(--primary-color);
}

.markdown-content pre {
  background: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
}

.markdown-content pre code {
  background: none;
  border: none;
  padding: 0;
  color: var(--text-color);
}

.markdown-content ul {
  margin: 16px 0;
  padding-left: 24px;
}

.markdown-content li {
  margin: 8px 0;
  color: var(--text-color);
}

/* 欢迎页面 */
.welcome-page {
  max-width: 1000px;
  margin: 0 auto;
}

.welcome-header {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 12px 0;
}

.welcome-header p {
  font-size: 18px;
  color: var(--text-color-light);
  margin: 0;
}

.welcome-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.welcome-section {
  background: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
}

.welcome-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.welcome-section p {
  color: var(--text-color-light);
  margin: 0 0 20px 0;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-link {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;
  color: var(--text-color);
  transition: all 0.2s ease;
}

.quick-link:hover {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.category-card {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-light);
}

.category-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .blog-sidebar {
    width: 280px;
  }
  
  .welcome-sections {
    grid-template-columns: 1fr;
  }
  
  .search-input {
    width: 150px;
  }
  
  .blog-main {
    padding: 16px;
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
