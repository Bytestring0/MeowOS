<template>
  <div class="web-app">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在加载...</p>
    </div>
    
    <div v-if="hasError" class="error-overlay">
      <div class="error-content">
        <h3>加载失败</h3>
        <p>无法加载该网页，这可能是由于网络问题或网站安全策略导致的。</p>
        <div class="error-actions">
          <button @click="retry" class="retry-btn">重试</button>
          <button @click="openInNewTab" class="external-btn">在新标签页中打开</button>
        </div>
      </div>
    </div>

    <iframe
      v-if="!hasError"
      ref="iframeRef"
      :src="url"
      class="web-iframe"
      frameborder="0"
      allowfullscreen
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    ></iframe>
  </div>
</template>

<script lang="ts" src="./WebApp.ts"></script>

<style scoped>
.web-app {
  height: 100%;
  position: relative;
  background: var(--bg-color);
}

.web-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: var(--text-color-light);
  font-size: 14px;
}

.error-content {
  text-align: center;
  max-width: 400px;
  padding: 20px;
}

.error-content h3 {
  color: var(--text-color);
  margin-bottom: 12px;
  font-size: 18px;
}

.error-content p {
  color: var(--text-color-light);
  margin-bottom: 20px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.retry-btn,
.external-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.retry-btn {
  background: var(--primary-color);
  color: white;
}

.retry-btn:hover {
  background: var(--primary-color-dark);
}

.external-btn {
  background: var(--bg-color-light);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.external-btn:hover {
  background: var(--bg-color-lighter);
}
</style>
