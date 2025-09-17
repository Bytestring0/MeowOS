<template>
  <div class="app-creator">
    <div class="header">
      <h2>应用创建器</h2>
      <p>创建自定义网页应用，让您喜欢的网站变成桌面应用</p>
    </div>

    <div class="content">
      <!-- 创建按钮 -->
      <div v-if="!isCreating && customApps.length === 0" class="empty-state">
        <div class="empty-icon" @click="openCreateForm">➕</div>
        <h3>还没有自定义应用</h3>
        <p>点击上方按钮创建您的第一个自定义应用</p>
      </div>

      <!-- 应用列表 -->
      <div v-if="!isCreating && customApps.length > 0" class="app-list">
        <div class="list-header">
          <h3>已创建的应用 ({{ customApps.length }})</h3>
          <button @click="openCreateForm" class="create-btn">
            创建新应用
          </button>
        </div>
        
        <div class="app-grid">
          <div
            v-for="app in customApps"
            :key="app.id"
            class="app-card"
          >
            <div class="app-icon">
              <img :src="app.icon" :alt="app.name" @error="handleIconError" />
            </div>
            <div class="app-info">
              <h4>{{ app.name }}</h4>
              <p>{{ app.url }}</p>
              <small>创建于 {{ formatDate(app.created) }}</small>
            </div>
            <div class="app-actions">
              <button @click="openApp(app)" class="action-btn open">打开</button>
              <button @click="deleteApp(app.id)" class="action-btn delete">删除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 创建表单 -->
      <div v-if="isCreating" class="create-form">
        <div class="form-header">
          <h3>创建新应用</h3>
          <button @click="cancelCreate" class="close-btn">✕</button>
        </div>
        
        <form @submit.prevent="createApp">
          <div class="form-group">
            <label for="app-name">应用名称 *</label>
            <input
              id="app-name"
              v-model="formData.name"
              type="text"
              placeholder="例如：百度搜索"
              :class="{ error: formErrors.name }"
              required
            />
            <span v-if="formErrors.name" class="error-text">{{ formErrors.name }}</span>
          </div>

          <div class="form-group">
            <label for="app-url">网站地址 *</label>
            <input
              id="app-url"
              v-model="formData.url"
              type="url"
              placeholder="https://www.baidu.com"
              :class="{ error: formErrors.url }"
              required
            />
            <span v-if="formErrors.url" class="error-text">{{ formErrors.url }}</span>
            <small class="help-text">请输入完整的网站地址，包含 http:// 或 https://</small>
          </div>

          <div class="form-group">
            <label for="app-description">应用描述（可选）</label>
            <input
              id="app-description"
              v-model="formData.description"
              type="text"
              placeholder="简要描述这个应用的用途"
            />
          </div>

          <div class="form-actions">
            <button type="button" @click="cancelCreate" class="cancel-btn">取消</button>
            <button type="submit" :disabled="isLoading" class="submit-btn">
              <span v-if="isLoading">创建中...</span>
              <span v-else">创建应用</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./AppCreatorApp.ts"></script>

<style scoped>
.app-creator {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  background: var(--bg-color);
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: var(--text-color);
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
}

.header p {
  color: var(--text-color-light);
  font-size: 16px;
}

.content {
  max-width: 800px;
  margin: 0 auto;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}
.empty-icon:hover{
    transition: all 0.2s ease;
  background: var(--bg-color-light);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  transform: scale(1.1);
}
.empty-state h3 {
  color: var(--text-color);
  margin-bottom: 8px;
  font-size: 20px;
}

.empty-state p {
  color: var(--text-color-light);
  margin-bottom: 30px;
}

/* 按钮样式 */
.create-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  background: var(--bg-color-light);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.create-btn.primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.create-btn:hover {
  background: var(--bg-color-lighter);
}

.create-btn.primary:hover {
  background: var(--primary-color-dark);
}

/* 应用列表 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h3 {
  color: var(--text-color);
  font-size: 18px;
  font-weight: 600;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.app-card {
  background: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.app-card:hover {
  border-color: var(--primary-color);
  box-shadow: var(--box-shadow);
}

.app-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
}

.app-icon img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.app-info h4 {
  color: var(--text-color);
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
}

.app-info p {
  color: var(--text-color-light);
  font-size: 14px;
  margin-bottom: 4px;
  word-break: break-all;
}

.app-info small {
  color: var(--text-color-lighter);
  font-size: 12px;
}

.app-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-btn.open {
  background: var(--primary-color);
  color: white;
}

.action-btn.open:hover {
  background: var(--primary-color-dark);
}

.action-btn.delete {
  background: var(--danger-color);
  color: white;
}

.action-btn.delete:hover {
  background: var(--danger-color-dark);
}

/* 创建表单 */
.create-form {
  background: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-header h3 {
  color: var(--text-color);
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-color);
  color: var(--text-color-light);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-color-lighter);
  color: var(--text-color);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-group input.error {
  border-color: var(--danger-color);
}

.error-text {
  color: var(--danger-color);
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.help-text {
  color: var(--text-color-light);
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.cancel-btn:hover {
  background: var(--bg-color-lighter);
}

.submit-btn {
  background: var(--primary-color);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-color-dark);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
