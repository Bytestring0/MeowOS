import { eventBus } from '../services/eventBus'

export interface ContextMenuItem {
  label?: string
  icon?: string
  action?: () => void
  disabled?: boolean
  danger?: boolean
  shortcut?: string
  submenu?: ContextMenuItem[]
  type?: 'separator'
}

export interface ContextMenuOptions {
  x: number
  y: number
  items: ContextMenuItem[]
  title?: string
  target?: HTMLElement
}

class ContextMenuAPI {
  private registeredHandlers = new Map<string, (options: ContextMenuOptions) => void>()
  
  constructor() {
    this.setupGlobalEvents()
  }
  
  private setupGlobalEvents() {
    // 监听右键菜单显示请求
    eventBus.on('contextmenu:show', (options: ContextMenuOptions) => {
      this.showContextMenu(options)
    })
    
    // 监听右键菜单隐藏请求
    eventBus.on('contextmenu:hide', () => {
      this.hideContextMenu()
    })
  }
  
  // 注册右键菜单处理器（例如右键菜单应用）
  registerHandler(id: string, handler: (options: ContextMenuOptions) => void) {
    this.registeredHandlers.set(id, handler)
  }
  
  // 注销右键菜单处理器
  unregisterHandler(id: string) {
    this.registeredHandlers.delete(id)
  }
  
  // 显示右键菜单
  showContextMenu(options: ContextMenuOptions) {
    // 优先使用注册的处理器，如果没有则使用默认处理
    const handler = this.registeredHandlers.values().next().value
    if (handler) {
      handler(options)
    } else {
      // 如果没有注册的处理器，发送到默认系统处理
      console.warn('No context menu handler registered')
    }
  }
  
  // 隐藏右键菜单
  hideContextMenu() {
    eventBus.emit('contextmenu:hide-all')
  }
  
  // 为元素添加右键菜单支持
  addContextMenu(
    element: HTMLElement, 
    menuProvider: (event: MouseEvent) => ContextMenuItem[]
  ) {
    const handler = (event: MouseEvent) => {
      event.preventDefault()
      const items = menuProvider(event)
      this.showContextMenu({
        x: event.clientX,
        y: event.clientY,
        items,
        target: element
      })
    }
    
    element.addEventListener('contextmenu', handler)
    
    // 返回清理函数
    return () => {
      element.removeEventListener('contextmenu', handler)
    }
  }
  
  // 创建标准的文件/文件夹右键菜单
  createFileContextMenu(
    file: { id: string; name: string; type: 'file' | 'directory' },
    actions: {
      onOpen?: () => void
      onRename?: () => void
      onDelete?: () => void
      onCopy?: () => void
      onCut?: () => void
      onProperties?: () => void
    } = {}
  ): ContextMenuItem[] {
    return [
      {
        label: '打开',
        icon: file.type === 'directory' ? '📁' : '📄',
        action: actions.onOpen
      },
      { type: 'separator' },
      {
        label: '重命名',
        icon: '✏️',
        action: actions.onRename
      },
      {
        label: '复制',
        icon: '📋',
        action: actions.onCopy
      },
      {
        label: '剪切',
        icon: '✂️',
        action: actions.onCut
      },
      { type: 'separator' },
      {
        label: '删除',
        icon: '🗑️',
        danger: true,
        action: actions.onDelete
      },
      { type: 'separator' },
      {
        label: '属性',
        icon: '⚙️',
        action: actions.onProperties
      }
    ]
  }
  
  // 创建桌面右键菜单
  createDesktopContextMenu(actions: {
    onRefresh?: () => void
    onNewFolder?: () => void
    onNewFile?: () => void
    onPaste?: () => void
    onPersonalize?: () => void
    onDisplaySettings?: () => void
    onSystemInfo?: () => void
  } = {}): ContextMenuItem[] {
    return [
      {
        label: '刷新',
        icon: '🔄',
        action: actions.onRefresh
      },
      { type: 'separator' },
      {
        label: '新建',
        icon: '➕',
        submenu: [
          {
            label: '文件夹',
            icon: '📁',
            action: actions.onNewFolder
          },
          {
            label: '文本文件',
            icon: '📄',
            action: actions.onNewFile
          }
        ]
      },
      {
        label: '粘贴',
        icon: '📋',
        action: actions.onPaste,
        disabled: true // 根据剪贴板状态动态设置
      },
      { type: 'separator' },
      {
        label: '个性化',
        icon: '🎨',
        action: actions.onPersonalize
      },
      {
        label: '显示设置',
        icon: '🖥️',
        action: actions.onDisplaySettings
      },
      { type: 'separator' },
      {
        label: '系统信息',
        icon: 'ℹ️',
        action: actions.onSystemInfo
      }
    ]
  }
}

export const contextMenuAPI = new ContextMenuAPI()

// 全局API - 供应用使用
export const showContextMenu = (options: ContextMenuOptions) => {
  contextMenuAPI.showContextMenu(options)
}

export const hideContextMenu = () => {
  contextMenuAPI.hideContextMenu()
}

export const addContextMenu = (
  element: HTMLElement,
  menuProvider: (event: MouseEvent) => ContextMenuItem[]
) => {
  return contextMenuAPI.addContextMenu(element, menuProvider)
}
