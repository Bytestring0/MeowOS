import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { storage } from '../../core/api/storage';
import sweetAlert from '../../config/sweetAlert';

interface Timer {
  id: string;
  name: string;
  duration: number; // 秒
  remaining: number; // 剩余秒数
  isRunning: boolean;
  isFinished: boolean;
}

interface Alarm {
  id: string;
  name: string;
  time: string; // HH:MM
  enabled: boolean;
  repeat: boolean;
  days: string[]; // ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
}

export default defineComponent({
  name: 'ClockApp',
  setup() {
    const currentTime = ref(new Date());
    const timeInterval = ref<number>();
    const activeTab = ref<'clock' | 'timer' | 'alarm'>('clock');
    
    // 定时器状态
    const timers = ref<Timer[]>([]);
    const newTimerName = ref('');
    const newTimerMinutes = ref(5);
    const newTimerSeconds = ref(0);
    
    // 闹钟状态
    const alarms = ref<Alarm[]>([]);
    const newAlarmName = ref('');
    const newAlarmTime = ref('08:00');
    const newAlarmRepeat = ref(false);
    const newAlarmDays = ref<string[]>([]);
    
    const APP_ID = 'system-clock';
    
    const weekDays = [
      { key: 'sun', label: '周日' },
      { key: 'mon', label: '周一' },
      { key: 'tue', label: '周二' },
      { key: 'wed', label: '周三' },
      { key: 'thu', label: '周四' },
      { key: 'fri', label: '周五' },
      { key: 'sat', label: '周六' },
    ];

    // 格式化时间
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    };

    const formatDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    // 保存和加载数据
    const saveTimers = async () => {
      await storage.setAppSetting(APP_ID, 'timers', timers.value);
    };

    const saveAlarms = async () => {
      await storage.setAppSetting(APP_ID, 'alarms', alarms.value);
    };

    const loadData = async () => {
      const savedTimers = await storage.getAppSetting(APP_ID, 'timers');
      if (savedTimers) {
        timers.value = savedTimers;
      }
      
      const savedAlarms = await storage.getAppSetting(APP_ID, 'alarms');
      if (savedAlarms) {
        alarms.value = savedAlarms;
      }
    };

    // 定时器功能
    const addTimer = async () => {
      if (!newTimerName.value.trim()) return;
      
      const duration = newTimerMinutes.value * 60 + newTimerSeconds.value;
      if (duration <= 0) return;
      
      const timer: Timer = {
        id: `timer_${Date.now()}`,
        name: newTimerName.value.trim(),
        duration,
        remaining: duration,
        isRunning: false,
        isFinished: false,
      };
      
      timers.value.push(timer);
      newTimerName.value = '';
      newTimerMinutes.value = 5;
      newTimerSeconds.value = 0;
      await saveTimers();
    };

    const startTimer = async (timer: Timer) => {
      timer.isRunning = true;
      timer.isFinished = false;
      await saveTimers();
    };

    const pauseTimer = async (timer: Timer) => {
      timer.isRunning = false;
      await saveTimers();
    };

    const resetTimer = async (timer: Timer) => {
      timer.remaining = timer.duration;
      timer.isRunning = false;
      timer.isFinished = false;
      await saveTimers();
    };

    const removeTimer = async (timer: Timer) => {
      timers.value = timers.value.filter(t => t.id !== timer.id);
      await saveTimers();
    };

    // 闹钟功能
    const addAlarm = async () => {
      if (!newAlarmName.value.trim() || !newAlarmTime.value) return;
      
      const alarm: Alarm = {
        id: `alarm_${Date.now()}`,
        name: newAlarmName.value.trim(),
        time: newAlarmTime.value,
        enabled: true,
        repeat: newAlarmRepeat.value,
        days: [...newAlarmDays.value],
      };
      
      alarms.value.push(alarm);
      newAlarmName.value = '';
      newAlarmTime.value = '08:00';
      newAlarmRepeat.value = false;
      newAlarmDays.value = [];
      await saveAlarms();
    };

    const toggleAlarm = async (alarm: Alarm) => {
      alarm.enabled = !alarm.enabled;
      await saveAlarms();
    };

    const removeAlarm = async (alarm: Alarm) => {
      alarms.value = alarms.value.filter(a => a.id !== alarm.id);
      await saveAlarms();
    };

    const toggleAlarmDay = (day: string) => {
      const index = newAlarmDays.value.indexOf(day);
      if (index === -1) {
        newAlarmDays.value.push(day);
      } else {
        newAlarmDays.value.splice(index, 1);
      }
    };

    // 检查闹钟
    const checkAlarms = () => {
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      const currentDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];

      alarms.value.forEach(alarm => {
        if (!alarm.enabled) return;
        
        if (alarm.time === currentTimeStr) {
          if (!alarm.repeat || alarm.days.length === 0 || alarm.days.includes(currentDay)) {
            // 触发闹钟
            sweetAlert.alert(`闹钟响了：${alarm.name}`, '⏰ 闹钟提醒');
            
            // 如果不是重复闹钟，则禁用它
            if (!alarm.repeat) {
              alarm.enabled = false;
              saveAlarms();
            }
          }
        }
      });
    };

    // 计算属性
    const activeTimers = computed(() => {
      return timers.value.filter(t => t.isRunning);
    });

    const enabledAlarms = computed(() => {
      return alarms.value.filter(a => a.enabled);
    });

    onMounted(async () => {
      await loadData();
      
      // 更新时间
      timeInterval.value = window.setInterval(() => {
        currentTime.value = new Date();
        
        // 更新定时器
        timers.value.forEach(timer => {
          if (timer.isRunning && timer.remaining > 0) {
            timer.remaining--;
            if (timer.remaining === 0) {
              timer.isRunning = false;
              timer.isFinished = true;
              sweetAlert.alert(`定时器结束：${timer.name}`, '⏲️ 定时器提醒');
            }
          }
        });
        
        // 检查闹钟（每分钟检查一次）
        if (currentTime.value.getSeconds() === 0) {
          checkAlarms();
        }
      }, 1000);
    });

    onUnmounted(() => {
      if (timeInterval.value) {
        clearInterval(timeInterval.value);
      }
      saveTimers();
      saveAlarms();
    });

    return {
      currentTime,
      activeTab,
      timers,
      newTimerName,
      newTimerMinutes,
      newTimerSeconds,
      alarms,
      newAlarmName,
      newAlarmTime,
      newAlarmRepeat,
      newAlarmDays,
      weekDays,
      activeTimers,
      enabledAlarms,
      formatTime,
      formatDate,
      formatDuration,
      addTimer,
      startTimer,
      pauseTimer,
      resetTimer,
      removeTimer,
      addAlarm,
      toggleAlarm,
      removeAlarm,
      toggleAlarmDay,
    };
  },
});
