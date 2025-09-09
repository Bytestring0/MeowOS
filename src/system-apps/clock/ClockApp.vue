<template>
  <div class="clock-app">
    <!-- 选项卡 -->
    <div class="tab-bar">
      <button
        @click="activeTab = 'clock'"
        :class="{ active: activeTab === 'clock' }"
        class="tab-btn"
      >
        🕐 时钟
      </button>
      <button
        @click="activeTab = 'timer'"
        :class="{ active: activeTab === 'timer' }"
        class="tab-btn"
      >
        ⏱️ 定时器
      </button>
      <button
        @click="activeTab = 'alarm'"
        :class="{ active: activeTab === 'alarm' }"
        class="tab-btn"
      >
        ⏰ 闹钟
      </button>
    </div>

    <!-- 时钟页面 -->
    <div v-if="activeTab === 'clock'" class="clock-page">
      <div class="digital-clock">
        <div class="time-display">{{ formatTime(currentTime) }}</div>
        <div class="date-display">{{ formatDate(currentTime) }}</div>
      </div>
      
      <div class="analog-clock">
        <div class="clock-face">
          <div class="hour-markers">
            <div v-for="i in 12" :key="i" class="hour-marker" :style="{ transform: `rotate(${i * 30}deg)` }"></div>
          </div>
          <div class="clock-hands">
            <div 
              class="hour-hand" 
              :style="{ transform: `rotate(${(currentTime.getHours() % 12) * 30 + currentTime.getMinutes() * 0.5}deg)` }"
            ></div>
            <div 
              class="minute-hand" 
              :style="{ transform: `rotate(${currentTime.getMinutes() * 6}deg)` }"
            ></div>
            <div 
              class="second-hand" 
              :style="{ transform: `rotate(${currentTime.getSeconds() * 6}deg)` }"
            ></div>
          </div>
          <div class="center-dot"></div>
        </div>
      </div>
    </div>

    <!-- 定时器页面 -->
    <div v-if="activeTab === 'timer'" class="timer-page">
      <div class="add-timer">
        <h3>新建定时器</h3>
        <div class="timer-form">
          <input
            v-model="newTimerName"
            type="text"
            placeholder="定时器名称"
            class="timer-name-input"
          />
          <div class="timer-duration">
            <input
              v-model.number="newTimerMinutes"
              type="number"
              min="0"
              max="59"
              class="duration-input"
            />
            <span>分</span>
            <input
              v-model.number="newTimerSeconds"
              type="number"
              min="0"
              max="59"
              class="duration-input"
            />
            <span>秒</span>
          </div>
          <button @click="addTimer" class="add-btn">添加定时器</button>
        </div>
      </div>
      
      <div class="timer-list">
        <div v-if="timers.length === 0" class="no-timers">
          暂无定时器
        </div>
        <div
          v-for="timer in timers"
          :key="timer.id"
          class="timer-item"
          :class="{ 
            running: timer.isRunning, 
            finished: timer.isFinished,
            paused: !timer.isRunning && !timer.isFinished && timer.remaining < timer.duration 
          }"
        >
          <div class="timer-info">
            <div class="timer-name">{{ timer.name }}</div>
            <div class="timer-time">{{ formatDuration(timer.remaining) }}</div>
            <div class="timer-progress">
              <div 
                class="progress-bar" 
                :style="{ width: `${((timer.duration - timer.remaining) / timer.duration) * 100}%` }"
              ></div>
            </div>
          </div>
          <div class="timer-controls">
            <button
              v-if="!timer.isRunning"
              @click="startTimer(timer)"
              class="control-btn start"
              :disabled="timer.isFinished"
            >
              ▶️
            </button>
            <button
              v-if="timer.isRunning"
              @click="pauseTimer(timer)"
              class="control-btn pause"
            >
              ⏸️
            </button>
            <button
              @click="resetTimer(timer)"
              class="control-btn reset"
            >
              🔄
            </button>
            <button
              @click="removeTimer(timer)"
              class="control-btn remove"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 闹钟页面 -->
    <div v-if="activeTab === 'alarm'" class="alarm-page">
      <div class="add-alarm">
        <h3>新建闹钟</h3>
        <div class="alarm-form">
          <input
            v-model="newAlarmName"
            type="text"
            placeholder="闹钟名称"
            class="alarm-name-input"
          />
          <input
            v-model="newAlarmTime"
            type="time"
            class="alarm-time-input"
          />
          <div class="alarm-repeat">
            <label>
              <input
                v-model="newAlarmRepeat"
                type="checkbox"
              />
              重复闹钟
            </label>
          </div>
          <div v-if="newAlarmRepeat" class="alarm-days">
            <button
              v-for="day in weekDays"
              :key="day.key"
              @click="toggleAlarmDay(day.key)"
              :class="{ active: newAlarmDays.includes(day.key) }"
              class="day-btn"
            >
              {{ day.label }}
            </button>
          </div>
          <button @click="addAlarm" class="add-btn">添加闹钟</button>
        </div>
      </div>
      
      <div class="alarm-list">
        <div v-if="alarms.length === 0" class="no-alarms">
          暂无闹钟
        </div>
        <div
          v-for="alarm in alarms"
          :key="alarm.id"
          class="alarm-item"
          :class="{ disabled: !alarm.enabled }"
        >
          <div class="alarm-info">
            <div class="alarm-name">{{ alarm.name }}</div>
            <div class="alarm-time">{{ alarm.time }}</div>
            <div v-if="alarm.repeat && alarm.days.length > 0" class="alarm-days">
              {{ alarm.days.map(d => weekDays.find(wd => wd.key === d)?.label).join(', ') }}
            </div>
          </div>
          <div class="alarm-controls">
            <button
              @click="toggleAlarm(alarm)"
              :class="{ enabled: alarm.enabled }"
              class="toggle-btn"
            >
              {{ alarm.enabled ? '🔔' : '🔕' }}
            </button>
            <button
              @click="removeAlarm(alarm)"
              class="control-btn remove"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <div v-if="activeTimers.length > 0" class="status-item">
        {{ activeTimers.length }} 个定时器运行中
      </div>
      <div v-if="enabledAlarms.length > 0" class="status-item">
        {{ enabledAlarms.length }} 个闹钟已启用
      </div>
    </div>
  </div>
</template>
<script src="./ClockApp.ts"></script>
<style scoped>
.clock-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.tab-bar {
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
  background: var(--bg-tertiary);
}

.tab-btn:hover {
  background: var(--bg-tertiary);
}

/* 时钟页面 */
.clock-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 30px;
}

.digital-clock {
  text-align: center;
}

.time-display {
  font-size: 48px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  color: var(--accent-color);
  margin-bottom: 8px;
}

.date-display {
  font-size: 18px;
  color: var(--text-secondary);
}

.analog-clock {
  position: relative;
}

.clock-face {
  width: 200px;
  height: 200px;
  border: 4px solid var(--border-color);
  border-radius: 50%;
  position: relative;
  background: var(--bg-secondary);
}

.hour-markers {
  position: absolute;
  width: 100%;
  height: 100%;
}

.hour-marker {
  position: absolute;
  width: 2px;
  height: 20px;
  background: var(--text-secondary);
  left: 50%;
  top: 0;
  transform-origin: 50% 100px;
  margin-left: -1px;
}

.clock-hands {
  position: absolute;
  width: 100%;
  height: 100%;
}

.hour-hand, .minute-hand, .second-hand {
  position: absolute;
  left: 50%;
  bottom: 50%;
  transform-origin: 50% 100%;
  border-radius: 2px;
}

.hour-hand {
  width: 4px;
  height: 60px;
  background: var(--text-primary);
  margin-left: -2px;
}

.minute-hand {
  width: 2px;
  height: 80px;
  background: var(--text-primary);
  margin-left: -1px;
}

.second-hand {
  width: 1px;
  height: 90px;
  background: var(--accent-color);
  margin-left: -0.5px;
}

.center-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--accent-color);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 定时器和闹钟页面共用样式 */
.timer-page, .alarm-page {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.add-timer, .add-alarm {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.add-timer h3, .add-alarm h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
}

.timer-form, .alarm-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timer-name-input, .alarm-name-input, .alarm-time-input {
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 14px;
}

.timer-duration {
  display: flex;
  align-items: center;
  gap: 8px;
}

.duration-input {
  width: 60px;
  padding: 6px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  text-align: center;
}

.alarm-repeat {
  display: flex;
  align-items: center;
}

.alarm-repeat label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.alarm-days {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.day-btn {
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
}

.day-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.add-btn {
  padding: 10px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-btn:hover {
  opacity: 0.8;
}

/* 列表样式 */
.timer-list, .alarm-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-timers, .no-alarms {
  text-align: center;
  color: var(--text-secondary);
  padding: 20px;
  font-style: italic;
}

.timer-item, .alarm-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
}

.timer-item.running {
  border-color: var(--accent-color);
  background: rgba(var(--accent-color-rgb), 0.1);
}

.timer-item.finished {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.timer-item.paused {
  border-color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
}

.alarm-item.disabled {
  opacity: 0.5;
}

.timer-info, .alarm-info {
  flex: 1;
}

.timer-name, .alarm-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.timer-time, .alarm-time {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  color: var(--accent-color);
  margin-bottom: 4px;
}

.timer-progress {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--accent-color);
  transition: width 0.3s ease;
}

.alarm-days {
  font-size: 12px;
  color: var(--text-secondary);
}

.timer-controls, .alarm-controls {
  display: flex;
  gap: 6px;
}

.control-btn {
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.control-btn:hover {
  background: var(--accent-color);
  color: white;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.remove:hover {
  background: #f44336;
}

.toggle-btn {
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.toggle-btn.enabled {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.status-bar {
  display: flex;
  gap: 12px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 滚动条样式 */
.timer-page::-webkit-scrollbar,
.alarm-page::-webkit-scrollbar {
  width: 6px;
}

.timer-page::-webkit-scrollbar-track,
.alarm-page::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

.timer-page::-webkit-scrollbar-thumb,
.alarm-page::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.timer-page::-webkit-scrollbar-thumb:hover,
.alarm-page::-webkit-scrollbar-thumb:hover {
  background: var(--accent-color);
}
</style>
