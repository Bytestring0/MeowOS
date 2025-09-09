<template>
  <div class="system-monitor">
    <!-- 系统概览 -->
    <div class="overview-section">
      <div class="stat-card">
        <div class="stat-header">CPU 使用率</div>
        <div class="stat-value">{{ cpuUsage.toFixed(1) }}%</div>
        <div class="stat-bar">
          <div class="stat-progress" :style="{ width: `${cpuUsage}%` }"></div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">内存使用率</div>
        <div class="stat-value">{{ memoryUsage.toFixed(1) }}%</div>
        <div class="stat-bar">
          <div class="stat-progress memory" :style="{ width: `${memoryUsage}%` }"></div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">磁盘使用率</div>
        <div class="stat-value">{{ diskUsage.toFixed(1) }}%</div>
        <div class="stat-bar">
          <div class="stat-progress disk" :style="{ width: `${diskUsage}%` }"></div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">运行时间</div>
        <div class="stat-value uptime">{{ formatUptime(uptime) }}</div>
      </div>
    </div>

    <!-- 系统信息 -->
    <div class="system-info">
      <h3>系统信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">操作系统:</span>
          <span class="info-value">{{ getSystemInfo().osVersion }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">总内存:</span>
          <span class="info-value">{{ getSystemInfo().totalMemory }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">可用内存:</span>
          <span class="info-value">{{ getSystemInfo().availableMemory }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">CPU 核心:</span>
          <span class="info-value">{{ getSystemInfo().cores }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">屏幕分辨率:</span>
          <span class="info-value">{{ getSystemInfo().screen }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">浏览器:</span>
          <span class="info-value">{{ getSystemInfo().browser }}</span>
        </div>
      </div>
    </div>

    <!-- 进程管理 -->
    <div class="process-section">
      <h3>进程管理</h3>
      <div class="process-controls">
        <span class="process-count">共 {{ processes.length }} 个进程</span>
      </div>
      
      <div class="process-table">
        <div class="table-header">
          <div class="col-name" @click="setSortBy('name')">
            进程名称
            <span v-if="sortBy === 'name'" class="sort-indicator">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
          </div>
          <div class="col-cpu" @click="setSortBy('cpu')">
            CPU %
            <span v-if="sortBy === 'cpu'" class="sort-indicator">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
          </div>
          <div class="col-memory" @click="setSortBy('memory')">
            内存
            <span v-if="sortBy === 'memory'" class="sort-indicator">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
          </div>
          <div class="col-status">状态</div>
          <div class="col-actions">操作</div>
        </div>
        
        <div class="table-body">
          <div
            v-for="process in processes"
            :key="process.id"
            class="table-row"
            :class="{ selected: selectedProcess?.id === process.id }"
            @click="selectedProcess = process"
          >
            <div class="col-name">{{ process.name }}</div>
            <div class="col-cpu">{{ process.cpu.toFixed(1) }}%</div>
            <div class="col-memory">{{ formatMemory(process.memory) }}</div>
            <div class="col-status">
              <span
                class="status-badge"
                :style="{ backgroundColor: getStatusColor(process.status) }"
              >
                {{ process.status }}
              </span>
            </div>
            <div class="col-actions">
              <button
                @click.stop="suspendProcess(process)"
                class="action-btn"
                :title="process.status === 'running' ? '暂停' : '恢复'"
              >
                {{ process.status === 'running' ? '⏸️' : '▶️' }}
              </button>
              <button
                @click.stop="killProcess(process)"
                class="action-btn kill"
                title="结束进程"
              >
                ❌
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 进程详情 -->
    <div v-if="selectedProcess" class="process-details">
      <h4>进程详情</h4>
      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-label">进程ID:</span>
          <span class="detail-value">{{ selectedProcess.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">进程名称:</span>
          <span class="detail-value">{{ selectedProcess.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">CPU使用率:</span>
          <span class="detail-value">{{ selectedProcess.cpu.toFixed(2) }}%</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">内存使用:</span>
          <span class="detail-value">{{ formatMemory(selectedProcess.memory) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态:</span>
          <span class="detail-value">{{ selectedProcess.status }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">启动时间:</span>
          <span class="detail-value">{{ selectedProcess.startTime.toLocaleString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./SystemMonitorApp.ts"></script>
<style scoped>
.system-monitor {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.overview-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.stat-header {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-value.uptime {
  font-family: 'Courier New', monospace;
  font-size: 18px;
}

.stat-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.stat-progress {
  height: 100%;
  background: var(--accent-color);
  transition: width 0.3s ease;
}

.stat-progress.memory {
  background: #4caf50;
}

.stat-progress.disk {
  background: #ff9800;
}

.system-info {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.system-info h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: var(--text-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
}

.info-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 12px;
  font-weight: 500;
}

.process-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.process-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.process-controls {
  margin-bottom: 12px;
}

.process-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.process-table {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.table-header > div {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.table-header > div:hover {
  background: var(--accent-color);
  color: white;
}

.sort-indicator {
  font-size: 10px;
}

.table-body {
  max-height: 300px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.table-row:hover {
  background: var(--bg-tertiary);
}

.table-row.selected {
  background: var(--accent-color);
  color: white;
}

.table-row > div {
  padding: 8px 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.col-cpu, .col-memory {
  font-family: 'Courier New', monospace;
}

.status-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  color: white;
  text-transform: uppercase;
  font-weight: bold;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  margin-right: 4px;
  border-radius: 2px;
  font-size: 12px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.kill:hover {
  background: rgba(255, 0, 0, 0.2);
}

.process-details {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.process-details h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.detail-value {
  font-size: 11px;
  font-weight: 500;
}

/* 滚动条样式 */
.table-body::-webkit-scrollbar,
.system-monitor::-webkit-scrollbar {
  width: 6px;
}

.table-body::-webkit-scrollbar-track,
.system-monitor::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

.table-body::-webkit-scrollbar-thumb,
.system-monitor::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.table-body::-webkit-scrollbar-thumb:hover,
.system-monitor::-webkit-scrollbar-thumb:hover {
  background: var(--accent-color);
}
</style>
