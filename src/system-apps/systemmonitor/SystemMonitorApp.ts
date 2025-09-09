import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';

interface ProcessInfo {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  status: 'running' | 'suspended' | 'stopped';
  startTime: Date;
}

export default defineComponent({
  name: 'SystemMonitorApp',
  setup() {
    const cpuUsage = ref(0);
    const memoryUsage = ref(0);
    const diskUsage = ref(0);
    const uptime = ref(0);
    const processes = ref<ProcessInfo[]>([]);
    const refreshInterval = ref<number>();
    const sortBy = ref<'name' | 'cpu' | 'memory'>('cpu');
    const sortOrder = ref<'asc' | 'desc'>('desc');
    const selectedProcess = ref<ProcessInfo | null>(null);

    // 模拟系统信息
    const generateSystemData = () => {
      // 模拟 CPU 使用率 (0-100%)
      cpuUsage.value = Math.random() * 60 + 10; // 10-70%
      
      // 模拟内存使用率 (0-100%)
      memoryUsage.value = Math.random() * 40 + 30; // 30-70%
      
      // 模拟磁盘使用率 (0-100%)
      diskUsage.value = Math.random() * 20 + 45; // 45-65%
      
      // 增加运行时间
      uptime.value += 1;
    };

    // 模拟进程数据
    const generateProcesses = () => {
      const processNames = [
        'MeowOS Kernel', 'Desktop Manager', 'Window Manager', 'File System',
        'Network Service', 'Audio Service', 'Graphics Driver', 'Input Handler',
        'Terminal', 'Notes App', 'Calculator', 'File Manager', 'Paint App',
        'Theme Service', 'Wallpaper Service', 'System Monitor', 'Clock',
        'Storage Service', 'Event Bus', 'App Loader'
      ];

      processes.value = processNames.map((name, index) => ({
        id: `proc_${index}`,
        name,
        cpu: Math.random() * 25,
        memory: Math.random() * 512 + 64, // 64-576 MB
        status: Math.random() > 0.9 ? 'suspended' : 'running',
        startTime: new Date(Date.now() - Math.random() * 3600000), // 0-1小时前启动
      }));
    };

    const formatUptime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatMemory = (mb: number) => {
      if (mb >= 1024) {
        return `${(mb / 1024).toFixed(1)} GB`;
      }
      return `${mb.toFixed(0)} MB`;
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'running': return '#4caf50';
        case 'suspended': return '#ff9800';
        case 'stopped': return '#f44336';
        default: return '#9e9e9e';
      }
    };

    const sortedProcesses = computed(() => {
      const sorted = [...processes.value].sort((a, b) => {
        let aVal: any = a[sortBy.value];
        let bVal: any = b[sortBy.value];

        if (sortBy.value === 'name') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (sortOrder.value === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
      return sorted;
    });

    const setSortBy = (field: 'name' | 'cpu' | 'memory') => {
      if (sortBy.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortBy.value = field;
        sortOrder.value = 'desc';
      }
    };

    const killProcess = (process: ProcessInfo) => {
      if (confirm(`确定要结束进程 "${process.name}" 吗？`)) {
        processes.value = processes.value.filter(p => p.id !== process.id);
        if (selectedProcess.value?.id === process.id) {
          selectedProcess.value = null;
        }
      }
    };

    const suspendProcess = (process: ProcessInfo) => {
      const proc = processes.value.find(p => p.id === process.id);
      if (proc) {
        proc.status = proc.status === 'running' ? 'suspended' : 'running';
      }
    };

    const getSystemInfo = () => {
      return {
        totalMemory: '8.0 GB',
        availableMemory: `${(8192 * (1 - memoryUsage.value / 100)).toFixed(1)} MB`,
        osVersion: 'MeowOS v1.0.0',
        browser: navigator.userAgent.split(' ')[0],
        screen: `${screen.width}x${screen.height}`,
        cores: navigator.hardwareConcurrency || 4,
      };
    };

    onMounted(() => {
      generateProcesses();
      generateSystemData();
      
      refreshInterval.value = window.setInterval(() => {
        generateSystemData();
        // 更新进程CPU使用率
        processes.value.forEach(proc => {
          proc.cpu = Math.random() * 25;
        });
      }, 2000);
    });

    onUnmounted(() => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
      }
    });

    return {
      cpuUsage,
      memoryUsage,
      diskUsage,
      uptime,
      processes: sortedProcesses,
      selectedProcess,
      sortBy,
      sortOrder,
      formatUptime,
      formatMemory,
      getStatusColor,
      setSortBy,
      killProcess,
      suspendProcess,
      getSystemInfo,
    };
  },
});
