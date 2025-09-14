<template>
  <div class="serial-bluetooth-app">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="tabs">
        <button 
          class="tab"
          :class="{ active: activeTab === 'serial' }"
          @click="activeTab = 'serial'"
        >
          串口调试
        </button>
        <button 
          class="tab"
          :class="{ active: activeTab === 'bluetooth' }"
          @click="activeTab = 'bluetooth'"
        >
          蓝牙调试
        </button>
      </div>
      
      <div class="connection-status">
        <span class="status-indicator" :class="{ connected: isConnected }"></span>
        <span>{{ isConnected ? '已连接' : '未连接' }}</span>
      </div>
    </div>

    <div class="app-content">
      <!-- 左侧设置面板 -->
      <div class="settings-panel">
        <div class="panel-section">
          <h3>{{ activeTab === 'serial' ? '串口设置' : '蓝牙设置' }}</h3>
          
          <!-- 串口设置 -->
          <div v-if="activeTab === 'serial'" class="serial-settings">
            <div v-if="!isSerialSupported" class="warning-message">
              <strong>注意:</strong> 当前浏览器不支持 Web Serial API<br>
              请使用 Chrome/Edge 88+ 版本，并确保启用了串口功能
            </div>
            
            <div class="form-group">
              <label>串口设备:</label>
              <select v-model="selectedSerialDevice" :disabled="isConnected">
                <option :value="-1">选择设备</option>
                <option v-for="(device, index) in serialDevices" :key="index" :value="index">
                  {{ device.name }}
                  <span v-if="device.info?.usbVendorId">
                    ({{ device.info.usbVendorId.toString(16).padStart(4, '0').toUpperCase() }}:{{ device.info.usbProductId?.toString(16).padStart(4, '0').toUpperCase() }})
                  </span>
                </option>
              </select>
              <div class="button-group">
                <button @click="scanSerialDevices" :disabled="isConnected" class="scan-btn">
                  刷新
                </button>
                <button @click="requestSerialDevice" :disabled="isConnected || !isSerialSupported" class="scan-btn">
                  添加设备
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label>波特率:</label>
              <select v-model="serialBaudRate" :disabled="isConnected">
                <option :value="9600">9600</option>
                <option :value="19200">19200</option>
                <option :value="38400">38400</option>
                <option :value="57600">57600</option>
                <option :value="115200">115200</option>
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>数据位:</label>
                <select v-model="serialDataBits" :disabled="isConnected">
                  <option :value="7">7</option>
                  <option :value="8">8</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>停止位:</label>
                <select v-model="serialStopBits" :disabled="isConnected">
                  <option :value="1">1</option>
                  <option :value="2">2</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label>校验位:</label>
              <select v-model="serialParity" :disabled="isConnected">
                <option value="none">无</option>
                <option value="even">偶校验</option>
                <option value="odd">奇校验</option>
              </select>
            </div>
          </div>
          
          <!-- 蓝牙设置 -->
          <div v-else class="bluetooth-settings">
            <div class="form-group">
              <label>蓝牙设备:</label>
              <select v-model="selectedBluetoothDevice" :disabled="isConnected">
                <option value="">选择设备</option>
                <option v-for="device in bluetoothDevices" :key="device.id" :value="device.id">
                  {{ device.name }}
                </option>
              </select>
              <button 
                @click="scanBluetoothDevices" 
                :disabled="isConnected || bluetoothScanning" 
                class="scan-btn"
              >
                {{ bluetoothScanning ? '扫描中...' : '扫描' }}
              </button>
            </div>
          </div>
          
          <!-- 连接控制 -->
          <div class="connection-controls">
            <button 
              v-if="!isConnected"
              @click="connect"
              :disabled="selectedSerialDevice < 0 && !selectedBluetoothDevice"
              class="connect-btn"
            >
              连接
            </button>
            <button 
              v-else
              @click="disconnect"
              class="disconnect-btn"
            >
              断开连接
            </button>
          </div>
        </div>
        
        <!-- 快捷命令 -->
        <div class="panel-section">
          <h3>快捷命令</h3>
          <div class="quick-commands">
            <button 
              v-for="cmd in quickCommands" 
              :key="cmd.name"
              @click="sendQuickCommand(cmd.command)"
              :disabled="!isConnected"
              class="quick-cmd-btn"
              :title="cmd.description"
            >
              {{ cmd.name }}
            </button>
          </div>
        </div>
        
        <!-- 统计信息 -->
        <div class="panel-section">
          <h3>统计信息</h3>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">总消息:</span>
              <span class="stat-value">{{ stats.totalMessages }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">发送:</span>
              <span class="stat-value">{{ stats.sentMessages }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">接收:</span>
              <span class="stat-value">{{ stats.receivedMessages }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">字节数:</span>
              <span class="stat-value">{{ stats.bytesTransferred }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧消息区域 -->
      <div class="message-area">
        <!-- 消息控制栏 -->
        <div class="message-controls">
          <div class="filter-controls">
            <label class="checkbox-label">
              <input type="checkbox" v-model="messageFilter.showSend">
              显示发送
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="messageFilter.showReceive">
              显示接收
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="showHex">
              十六进制
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="showTimestamp">
              时间戳
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="autoScroll">
              自动滚动
            </label>
          </div>
          
          <div class="action-controls">
            <input 
              type="text" 
              v-model="messageFilter.searchText" 
              placeholder="搜索消息..."
              class="search-input"
            >
            <button @click="clearMessages" class="clear-btn">清空</button>
            <button @click="exportLog" class="export-btn">导出</button>
          </div>
        </div>
        
        <!-- 消息列表 -->
        <div class="message-container">
          <div 
            v-for="message in getFilteredMessages()" 
            :key="message.id"
            class="message"
            :class="{ 
              'message-send': message.type === 'send',
              'message-receive': message.type === 'receive'
            }"
          >
            <div class="message-header">
              <span v-if="showTimestamp" class="timestamp">
                {{ message.timestamp.toLocaleTimeString() }}
              </span>
              <span class="protocol">{{ message.protocol.toUpperCase() }}</span>
              <span class="type">{{ message.type === 'send' ? '发送' : '接收' }}</span>
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.data }}</div>
              <div v-if="showHex && message.hex" class="message-hex">
                HEX: {{ message.hex }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 发送区域 -->
        <div class="send-area">
          <div class="send-controls">
            <label class="radio-label">
              <input type="radio" v-model="sendFormat" value="text">
              文本
            </label>
            <label class="radio-label">
              <input type="radio" v-model="sendFormat" value="hex">
              十六进制
            </label>
          </div>
          
          <div class="send-input">
            <textarea 
              v-model="inputMessage"
              :placeholder="sendFormat === 'hex' ? '输入十六进制数据 (例如: 41 54)' : '输入要发送的消息...'"
              class="message-input"
              @keydown.ctrl.enter="sendMessage"
            ></textarea>
            <button 
              @click="sendMessage"
              :disabled="!inputMessage.trim() || !isConnected"
              class="send-btn"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./SerialBluetoothApp.ts"></script>

<style scoped>
.serial-bluetooth-app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
  color: var(--text-color);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-color-light);
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  background: var(--bg-color-light);
}

.tab.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger-color);
  transition: background-color 0.3s;
}

.status-indicator.connected {
  background: var(--success-color);
}

.app-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.settings-panel {
  width: 300px;
  background: var(--bg-color-light);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  padding: 16px;
}

.panel-section {
  margin-bottom: 24px;
}

.panel-section h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color-secondary);
}

.form-group {
  margin-bottom: 12px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--text-color-secondary);
}

.form-group select,
.search-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 12px;
}

.scan-btn {
  margin-top: 6px;
  padding: 4px 8px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
  cursor: pointer;
  font-size: 11px;
}

.scan-btn:hover:not(:disabled) {
  background: var(--bg-color-light);
}

.button-group {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.warning-message {
  background: rgba(var(--warning-color-rgb), 0.1);
  border: 1px solid var(--warning-color);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 12px;
  color: var(--warning-color);
}

.connection-controls {
  margin-top: 16px;
}

.connect-btn,
.disconnect-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.connect-btn {
  background: var(--success-color);
  color: white;
}

.connect-btn:hover:not(:disabled) {
  background: var(--success-color-dark);
}

.disconnect-btn {
  background: var(--danger-color);
  color: white;
}

.disconnect-btn:hover {
  background: var(--danger-color-dark);
}

.quick-commands {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.quick-cmd-btn {
  padding: 6px 8px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.quick-cmd-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.stat-label {
  color: var(--text-color-secondary);
}

.stat-value {
  font-weight: 500;
}

.message-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.message-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-color-light);
  flex-wrap: wrap;
  gap: 12px;
}

.filter-controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.checkbox-label,
.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  cursor: pointer;
}

.action-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  width: 150px;
  padding: 4px 8px;
  font-size: 12px;
}

.clear-btn,
.export-btn {
  padding: 4px 8px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
  cursor: pointer;
  font-size: 11px;
}

.clear-btn:hover {
  background: var(--danger-color);
  color: white;
}

.export-btn:hover {
  background: var(--primary-color);
  color: white;
}

.message-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--bg-color);
}

.message {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 3px solid transparent;
}

.message-send {
  background: rgba(var(--primary-color-rgb), 0.1);
  border-left-color: var(--primary-color);
}

.message-receive {
  background: rgba(var(--success-color-rgb), 0.1);
  border-left-color: var(--success-color);
}

.message-header {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--text-color-secondary);
  margin-bottom: 4px;
}

.timestamp {
  font-family: monospace;
}

.protocol,
.type {
  font-weight: 500;
  padding: 2px 4px;
  border-radius: 2px;
}

.protocol {
  background: rgba(var(--info-color-rgb), 0.2);
  color: var(--info-color);
}

.type {
  background: rgba(var(--warning-color-rgb), 0.2);
  color: var(--warning-color);
}

.message-content {
  font-family: monospace;
  font-size: 13px;
}

.message-text {
  word-break: break-all;
  line-height: 1.4;
}

.message-hex {
  margin-top: 4px;
  padding: 4px 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-color-secondary);
}

.send-area {
  border-top: 1px solid var(--border-color);
  background: var(--bg-color-light);
  padding: 16px;
}

.send-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.send-input {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
  min-height: 60px;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  font-family: monospace;
  font-size: 13px;
  resize: vertical;
}

.send-btn {
  padding: 8px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: var(--primary-color-dark);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-panel {
    width: 250px;
  }
  
  .message-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-controls {
    justify-content: center;
  }
  
  .quick-commands {
    grid-template-columns: 1fr;
  }
}
</style>
