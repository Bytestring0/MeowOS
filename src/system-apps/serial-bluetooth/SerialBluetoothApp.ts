import { defineComponent, ref, reactive, onMounted, onUnmounted } from 'vue'

export interface SerialDevice {
  port: SerialPort | null
  name: string
  connected: boolean
  info?: SerialPortInfo
}

export interface BluetoothDevice {
  id: string
  name: string
  connected: boolean
}

export interface Message {
  id: string
  timestamp: Date
  type: 'send' | 'receive'
  protocol: 'serial' | 'bluetooth'
  data: string
  hex?: string
}

// Web Serial API 类型定义
interface SerialPortInfo {
  usbVendorId?: number
  usbProductId?: number
}

interface SerialOptions {
  baudRate: number
  dataBits?: 7 | 8
  stopBits?: 1 | 2
  parity?: 'none' | 'even' | 'odd'
  bufferSize?: number
  flowControl?: 'none' | 'hardware'
}

declare global {
  interface Navigator {
    serial: Serial
  }
}

interface Serial extends EventTarget {
  getPorts(): Promise<SerialPort[]>
  requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>
  addEventListener(type: 'connect' | 'disconnect', listener: (event: Event) => void): void
}

interface SerialPortRequestOptions {
  filters?: SerialPortFilter[]
}

interface SerialPortFilter {
  usbVendorId?: number
  usbProductId?: number
}

interface SerialPort extends EventTarget {
  readonly readable: ReadableStream<Uint8Array> | null
  readonly writable: WritableStream<Uint8Array> | null
  open(options: SerialOptions): Promise<void>
  close(): Promise<void>
  getInfo(): SerialPortInfo
  addEventListener(type: 'connect' | 'disconnect', listener: (event: Event) => void): void
}

export default defineComponent({
  name: 'SerialBluetoothApp',
  setup() {
    // 状态管理
    const activeTab = ref<'serial' | 'bluetooth'>('serial')
    const isConnected = ref(false)
    const autoScroll = ref(true)
    const showHex = ref(false)
    const showTimestamp = ref(true)
    
    // 串口相关
    const serialDevices = ref<SerialDevice[]>([])
    const selectedSerialDevice = ref<number>(-1)
    const currentSerialPort = ref<SerialPort | null>(null)
    const serialReader = ref<ReadableStreamDefaultReader<Uint8Array> | null>(null)
    const serialWriter = ref<WritableStreamDefaultWriter<Uint8Array> | null>(null)
    const serialBaudRate = ref<number>(9600)
    const serialDataBits = ref<7 | 8>(8)
    const serialStopBits = ref<1 | 2>(1)
    const serialParity = ref<'none' | 'even' | 'odd'>('none')
    const isSerialSupported = ref(false)
    
    // 蓝牙相关
    const bluetoothDevices = ref<BluetoothDevice[]>([])
    const selectedBluetoothDevice = ref<string>('')
    const bluetoothScanning = ref(false)
    
    // 消息相关
    const messages = ref<Message[]>([])
    const inputMessage = ref('')
    const sendFormat = ref<'text' | 'hex'>('text')
    
    // 过滤器
    const messageFilter = reactive({
      showSend: true,
      showReceive: true,
      showSerial: true,
      showBluetooth: true,
      searchText: ''
    })
    
    // 统计信息
    const stats = reactive({
      totalMessages: 0,
      sentMessages: 0,
      receivedMessages: 0,
      bytesTransferred: 0
    })

    // 检查 Web Serial API 支持
    const checkSerialSupport = () => {
      isSerialSupported.value = 'serial' in navigator
      if (!isSerialSupported.value) {
        addMessage('system', 'serial', '浏览器不支持 Web Serial API，请使用 Chrome/Edge 88+ 版本')
      }
    }

    // 扫描串口设备 - 使用真实的 Web Serial API
    const scanSerialDevices = async () => {
      if (!isSerialSupported.value) {
        addMessage('system', 'serial', '浏览器不支持 Web Serial API')
        return
      }

      try {
        // 获取已授权的串口
        const ports = await navigator.serial.getPorts()
        serialDevices.value = ports.map((port, index) => {
          const info = port.getInfo()
          let deviceName = '未知设备'
          
          // 根据 USB VID/PID 识别常见设备
          if (info.usbVendorId && info.usbProductId) {
            const vid = info.usbVendorId.toString(16).padStart(4, '0').toUpperCase()
            const pid = info.usbProductId.toString(16).padStart(4, '0').toUpperCase()
            deviceName = `USB 设备 (${vid}:${pid})`
            
            // 识别常见的开发板
            if (info.usbVendorId === 0x2341) { // Arduino
              deviceName = 'Arduino 开发板'
            } else if (info.usbVendorId === 0x10C4) { // Silicon Labs
              deviceName = 'ESP32/ESP8266 开发板'
            } else if (info.usbVendorId === 0x0403) { // FTDI
              deviceName = 'FTDI USB-Serial 转换器'
            } else if (info.usbVendorId === 0x1A86) { // CH340
              deviceName = 'CH340 USB-Serial 转换器'
            }
          }
          
          return {
            port,
            name: deviceName,
            connected: false,
            info
          }
        })
        
        addMessage('system', 'serial', `扫描完成，找到 ${serialDevices.value.length} 个串口设备`)
      } catch (error) {
        console.error('扫描串口设备失败:', error)
        addMessage('system', 'serial', `扫描失败: ${error}`)
      }
    }

    // 请求新的串口设备
    const requestSerialDevice = async () => {
      if (!isSerialSupported.value) {
        addMessage('system', 'serial', '浏览器不支持 Web Serial API')
        return
      }

      try {
        const port = await navigator.serial.requestPort()
        await scanSerialDevices() // 重新扫描以包含新设备
        addMessage('system', 'serial', '新设备已添加，请从列表中选择')
      } catch (error: any) {
        if (error?.name !== 'NotFoundError') { // 用户取消不显示错误
          console.error('请求串口设备失败:', error)
          addMessage('system', 'serial', `添加设备失败: ${error?.message || error}`)
        }
      }
    }

    // 读取串口数据
    const readSerialData = async () => {
      if (!currentSerialPort.value || !currentSerialPort.value.readable) return
      
      try {
        serialReader.value = currentSerialPort.value.readable.getReader()
        
        while (true) {
          const { value, done } = await serialReader.value.read()
          if (done) break
          
          // 将 Uint8Array 转换为字符串
          const text = new TextDecoder().decode(value)
          if (text.trim()) {
            addMessage('receive', 'serial', text.trim())
          }
        }
      } catch (error) {
        console.error('读取串口数据失败:', error)
        addMessage('system', 'serial', `读取数据失败: ${error}`)
      } finally {
        if (serialReader.value) {
          serialReader.value.releaseLock()
          serialReader.value = null
        }
      }
    }

    // 写入串口数据
    const writeSerialData = async (data: string) => {
      if (!currentSerialPort.value || !currentSerialPort.value.writable) {
        addMessage('system', 'serial', '串口未连接或不可写')
        return false
      }

      try {
        if (!serialWriter.value) {
          serialWriter.value = currentSerialPort.value.writable.getWriter()
        }
        
        const encoder = new TextEncoder()
        await serialWriter.value.write(encoder.encode(data))
        return true
      } catch (error) {
        console.error('写入串口数据失败:', error)
        addMessage('system', 'serial', `写入数据失败: ${error}`)
        return false
      }
    }

    // 模拟蓝牙设备扫描
    const scanBluetoothDevices = async () => {
      bluetoothScanning.value = true
      try {
        // 在实际应用中，这里会调用 Web Bluetooth API
        await new Promise(resolve => setTimeout(resolve, 2000))
        bluetoothDevices.value = [
          { id: 'bt001', name: 'HC-05 Bluetooth Module', connected: false },
          { id: 'bt002', name: 'ESP32 DevKit', connected: false },
          { id: 'bt003', name: 'Arduino Nano 33 BLE', connected: false }
        ]
      } finally {
        bluetoothScanning.value = false
      }
    }

    // 连接设备
    const connect = async () => {
      if (activeTab.value === 'serial' && selectedSerialDevice.value >= 0) {
        // 连接串口设备
        const device = serialDevices.value[selectedSerialDevice.value]
        if (!device || !device.port) {
          addMessage('system', 'serial', '请选择有效的串口设备')
          return
        }

        try {
          await device.port.open({
            baudRate: serialBaudRate.value,
            dataBits: serialDataBits.value,
            stopBits: serialStopBits.value,
            parity: serialParity.value
          })
          
          currentSerialPort.value = device.port
          device.connected = true
          isConnected.value = true
          
          addMessage('system', 'serial', `已连接到串口设备: ${device.name}`)
          addMessage('system', 'serial', `配置: ${serialBaudRate.value}bps, ${serialDataBits.value}N${serialStopBits.value}, ${serialParity.value}`)
          
          // 开始读取数据
          readSerialData()
          
        } catch (error) {
          console.error('连接串口失败:', error)
          addMessage('system', 'serial', `连接失败: ${error}`)
        }
      } else if (activeTab.value === 'bluetooth' && selectedBluetoothDevice.value) {
        // 模拟蓝牙连接
        const device = bluetoothDevices.value.find(d => d.id === selectedBluetoothDevice.value)
        if (device) {
          device.connected = true
          isConnected.value = true
          addMessage('system', 'bluetooth', `已连接到蓝牙设备: ${device.name}`)
        }
      }
    }

    // 断开连接
    const disconnect = async () => {
      if (activeTab.value === 'serial' && currentSerialPort.value) {
        try {
          // 停止读取
          if (serialReader.value) {
            await serialReader.value.cancel()
            serialReader.value.releaseLock()
            serialReader.value = null
          }
          
          // 释放写入器
          if (serialWriter.value) {
            serialWriter.value.releaseLock()
            serialWriter.value = null
          }
          
          // 关闭串口
          await currentSerialPort.value.close()
          
          const device = serialDevices.value[selectedSerialDevice.value]
          if (device) {
            device.connected = false
            addMessage('system', 'serial', `已断开串口连接: ${device.name}`)
          }
          
          currentSerialPort.value = null
          isConnected.value = false
        } catch (error) {
          console.error('断开串口连接失败:', error)
          addMessage('system', 'serial', `断开连接失败: ${error}`)
        }
      } else if (activeTab.value === 'bluetooth') {
        const device = bluetoothDevices.value.find(d => d.id === selectedBluetoothDevice.value)
        if (device) {
          device.connected = false
          addMessage('system', 'bluetooth', `已断开蓝牙连接: ${device.name}`)
        }
        isConnected.value = false
      }
    }

    // 添加消息
    const addMessage = (type: 'send' | 'receive' | 'system', protocol: 'serial' | 'bluetooth', data: string) => {
      const message: Message = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: type === 'system' ? 'receive' : type,
        protocol,
        data,
        hex: type !== 'system' ? stringToHex(data) : undefined
      }
      
      messages.value.push(message)
      stats.totalMessages++
      if (type === 'send') stats.sentMessages++
      else stats.receivedMessages++
      stats.bytesTransferred += data.length
      
      // 自动滚动
      if (autoScroll.value) {
        setTimeout(() => {
          const container = document.querySelector('.message-container')
          if (container) {
            container.scrollTop = container.scrollHeight
          }
        }, 10)
      }
    }

    // 发送消息
    const sendMessage = async () => {
      if (!inputMessage.value.trim() || !isConnected.value) return
      
      let dataToSend = inputMessage.value
      if (sendFormat.value === 'hex') {
        // 验证十六进制格式
        if (!/^[0-9A-Fa-f\s]+$/.test(dataToSend)) {
          addMessage('system', activeTab.value, '无效的十六进制格式')
          return
        }
        dataToSend = hexToString(dataToSend.replace(/\s+/g, ''))
      }
      
      // 添加换行符（常见的串口通信需求）
      if (activeTab.value === 'serial') {
        dataToSend += '\r\n'
      }
      
      addMessage('send', activeTab.value, inputMessage.value) // 显示原始输入
      inputMessage.value = ''
      
      if (activeTab.value === 'serial') {
        // 真实的串口发送
        const success = await writeSerialData(dataToSend)
        if (!success) {
          addMessage('system', 'serial', '发送失败')
        }
      } else if (activeTab.value === 'bluetooth') {
        // 模拟蓝牙发送和接收回复
        setTimeout(() => {
          const replies = [
            'OK',
            'ACK',
            'Data received',
            'Command executed',
            'Status: Ready',
            `Echo: ${dataToSend.trim()}`
          ]
          const reply = replies[Math.floor(Math.random() * replies.length)]
          addMessage('receive', activeTab.value, reply)
        }, 100 + Math.random() * 500)
      }
    }

    // 清空消息
    const clearMessages = () => {
      messages.value = []
      stats.totalMessages = 0
      stats.sentMessages = 0
      stats.receivedMessages = 0
      stats.bytesTransferred = 0
    }

    // 导出日志
    const exportLog = () => {
      const filteredMessages = getFilteredMessages()
      const logContent = filteredMessages.map(msg => {
        const timestamp = showTimestamp.value ? `[${msg.timestamp.toLocaleTimeString()}] ` : ''
        const protocol = `[${msg.protocol.toUpperCase()}] `
        const type = `[${msg.type.toUpperCase()}] `
        return `${timestamp}${protocol}${type}${msg.data}`
      }).join('\n')
      
      const blob = new Blob([logContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `debug-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    // 工具函数
    const stringToHex = (str: string): string => {
      return Array.from(str).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ').toUpperCase()
    }

    const hexToString = (hex: string): string => {
      return hex.match(/.{1,2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join('') || ''
    }

    // 获取过滤后的消息
    const getFilteredMessages = () => {
      return messages.value.filter(msg => {
        if (!messageFilter.showSend && msg.type === 'send') return false
        if (!messageFilter.showReceive && msg.type === 'receive') return false
        if (!messageFilter.showSerial && msg.protocol === 'serial') return false
        if (!messageFilter.showBluetooth && msg.protocol === 'bluetooth') return false
        if (messageFilter.searchText && !msg.data.toLowerCase().includes(messageFilter.searchText.toLowerCase())) return false
        return true
      })
    }

    // 快捷命令
    const quickCommands = [
      { name: 'AT', command: 'AT', description: 'AT命令测试' },
      { name: 'Reset', command: 'AT+RST', description: '重置设备' },
      { name: 'Version', command: 'AT+GMR', description: '查询版本' },
      { name: 'Status', command: 'AT+CIFSR', description: '查询状态' }
    ]

    // 快捷命令发送
    const sendQuickCommand = (command: string) => {
      inputMessage.value = command
      sendMessage()
    }

    // 清理资源
    const cleanup = async () => {
      if (isConnected.value && activeTab.value === 'serial') {
        await disconnect()
      }
    }

    // 生命周期
    onMounted(() => {
      checkSerialSupport()
      if (isSerialSupported.value) {
        scanSerialDevices()
      }
    })

    onUnmounted(() => {
      cleanup()
    })

    return {
      // 状态
      activeTab,
      isConnected,
      autoScroll,
      showHex,
      showTimestamp,
      isSerialSupported,
      
      // 串口
      serialDevices,
      selectedSerialDevice,
      serialBaudRate,
      serialDataBits,
      serialStopBits,
      serialParity,
      
      // 蓝牙
      bluetoothDevices,
      selectedBluetoothDevice,
      bluetoothScanning,
      
      // 消息
      messages,
      inputMessage,
      sendFormat,
      messageFilter,
      stats,
      
      // 方法
      scanSerialDevices,
      requestSerialDevice,
      scanBluetoothDevices,
      connect,
      disconnect,
      sendMessage,
      clearMessages,
      exportLog,
      getFilteredMessages,
      quickCommands,
      sendQuickCommand,
      stringToHex,
      hexToString
    }
  }
})
