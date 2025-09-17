<template>
  <div class="file-reader-app">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="nav-section">
        <button 
          @click="goBack" 
          :disabled="currentPath === '/'"
          class="nav-btn"
        >
          ← 返回
        </button>
        <div class="breadcrumb">
          <span 
            v-for="(crumb, index) in breadcrumbs" 
            :key="index"
            @click="navigateToPath(crumb.path)"
            class="breadcrumb-item"
            :class="{ active: index === breadcrumbs.length - 1 }"
          >
            {{ crumb.name }}
            <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
          </span>
        </div>
      </div>
      
      <div class="search-section">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索文档..."
          class="search-input"
        />
        <div class="view-controls">
          <button 
            @click="viewMode = 'grid'"
            :class="{ active: viewMode === 'grid' }"
            class="view-btn"
          >
            □
          </button>
          <button 
            @click="viewMode = 'list'"
            :class="{ active: viewMode === 'list' }"
            class="view-btn"
          >
            ≡
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载文档中...</p>
    </div>

    <!-- 主内容区域 -->
    <div v-else class="content-area">
      <!-- 推荐文档区域 (仅在根目录显示) -->
      <div v-if="currentPath === '/' && recommendedDocs.length > 0" class="recommended-section">
        <h2 class="section-title">📌 推荐阅读</h2>
        <div class="recommended-grid">
          <div 
            v-for="doc in recommendedDocs"
            :key="doc.id"
            @click="openDocument(doc)"
            class="recommended-card"
          >
            <div class="recommended-cover">
              <img :src="getCoverImage(doc)" :alt="doc.name" />
              <div class="read-badge">READ</div>
            </div>
            <div class="recommended-info">
              <h4>{{ doc.name }}</h4>
              <p>{{ getDocumentSummary(doc) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-bar">
        <span class="stat-item">
          {{ stats.directoryCount }} 个目录
        </span>
        <span class="stat-item">
          {{ stats.fileCount }} 个文档
        </span>
        <span class="stat-item">
          最后更新: {{ formatDate(new Date()) }}
        </span>
      </div>

      <!-- 文档列表 -->
      <div class="documents-section">
        <h2 v-if="currentPath !== '/'" class="section-title">
          {{ currentPath === '/' ? '📚 所有文档' : '📂 ' + currentPath.split('/').pop() }}
        </h2>
        
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="documents-grid">
          <div 
            v-for="doc in filteredDocuments"
            :key="doc.id"
            @click="openDocument(doc)"
            class="document-card"
            :class="{ 'is-directory': doc.type === 'directory' }"
          >
            <div class="card-cover">
              <img 
                v-if="doc.type === 'file'"
                :src="getCoverImage(doc)" 
                :alt="doc.name"
                class="cover-image"
              />
              <div 
                v-else
                class="folder-icon"
              >
                📁
              </div>
              <div v-if="doc.type === 'file'" class="read-decoration">READ</div>
              <div class="card-overlay">
                <div class="overlay-content">
                  <h3>{{ doc.name }}</h3>
                  <div class="document-meta">
                    <span class="category">
                      {{ currentPath.split('/')[1] || '根目录' }}
                    </span>
                    <span class="date">
                      {{ formatDate(doc.modified) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card-content">
              <h4 class="document-title">{{ doc.name }}</h4>
              <p v-if="doc.type === 'file'" class="document-summary">
                {{ getDocumentSummary(doc) }}
              </p>
              <div class="document-footer">
                <span class="document-type">
                  {{ doc.type === 'directory' ? '📁 目录' : '📄 文档' }}
                </span>
                <span class="document-date">
                  {{ formatDate(doc.modified) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="documents-list">
          <div 
            v-for="doc in filteredDocuments"
            :key="doc.id"
            @click="openDocument(doc)"
            class="document-row"
            :class="{ 'is-directory': doc.type === 'directory' }"
          >
            <div class="row-icon">
              {{ doc.type === 'directory' ? '📁' : '📄' }}
            </div>
            <div class="row-content">
              <h4>{{ doc.name }}</h4>
              <p v-if="doc.type === 'file'">{{ getDocumentSummary(doc) }}</p>
            </div>
            <div class="row-meta">
              <span class="category">{{ currentPath.split('/')[1] || '根目录' }}</span>
              <span class="date">{{ formatDate(doc.modified) }}</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredDocuments.length === 0" class="empty-state">
          <div class="empty-icon">📄</div>
          <h3>没有找到文档</h3>
          <p v-if="searchQuery">尝试使用不同的搜索关键词</p>
          <p v-else>这个目录下暂时没有文档</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./FileReaderApp.ts"></script>

<style scoped>
.file-reader-app {
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
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background: var(--primary-hover-color);
  transform: translateY(-1px);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
}

.breadcrumb-item {
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.breadcrumb-item:hover {
  background: var(--hover-color);
}

.breadcrumb-item.active {
  background: var(--primary-color);
  color: white;
}

.separator {
  margin: 0 4px;
  opacity: 0.5;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  width: 200px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.view-controls {
  display: flex;
  gap: 4px;
}

.view-btn {
  padding: 8px;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 推荐文档区域 */
.recommended-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-color);
}

.recommended-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.recommended-card {
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-color);
}

.recommended-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.recommended-cover {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.recommended-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recommended-card:hover .recommended-cover img {
  transform: scale(1.05);
}

.read-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
}

.recommended-info {
  padding: 16px;
}

.recommended-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.recommended-info p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.8;
}

/* 统计信息栏 */
.stats-bar {
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  background: var(--surface-color);
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}

.stat-item {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 文档网格 */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.document-card {
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-color);
  position: relative;
}

.document-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  border-color: var(--primary-color);
}

.card-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.document-card:hover .cover-image {
  transform: scale(1.1);
}

.folder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 48px;
  background: linear-gradient(135deg, var(--warning-color), var(--warning-hover-color));
}

.read-decoration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  background: rgba(255, 255, 255, 0.9);
  color: var(--primary-color);
  padding: 8px 24px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 2px;
  border: 2px solid var(--primary-color);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.document-card:hover .read-decoration {
  opacity: 1;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 16px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.document-card:hover .card-overlay {
  transform: translateY(0);
}

.overlay-content h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.document-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  opacity: 0.9;
}

.card-content {
  padding: 16px;
}

.document-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.document-summary {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.document-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-secondary);
}

/* 列表视图 */
.documents-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-row {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--surface-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border-color);
}

.document-row:hover {
  background: var(--hover-color);
  transform: translateX(4px);
}

.row-icon {
  font-size: 24px;
  margin-right: 16px;
}

.row-content {
  flex: 1;
}

.row-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.row-content p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.row-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--text-color);
}

.empty-state p {
  margin: 0;
  color: var(--text-secondary);
}

/* 目录卡片特殊样式 */
.document-card.is-directory {
  background: linear-gradient(135deg, var(--warning-color), var(--warning-hover-color));
  color: white;
}

.document-card.is-directory .card-content {
  background: var(--surface-color);
  color: var(--text-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .nav-section {
    justify-content: space-between;
  }
  
  .recommended-grid {
    grid-template-columns: 1fr;
  }
  
  .documents-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  
  .stats-bar {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
