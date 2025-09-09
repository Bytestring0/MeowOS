import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import type { PropType } from 'vue';
import { system } from '../api/system';
import type { WindowState } from '../types/system';
import { eventBus, SystemEvents } from '../services/eventBus';
import { showContextMenu } from '../api/contextmenu';
import type { ContextMenuItem } from '../api/contextmenu';
import { animationService } from '../services/animationService';

// 自动扫描 system-apps 目录下的所有 .vue 组件
const modules = import.meta.glob('../../system-apps/*/*.vue', { eager: true })
const appRegistry: Record<string, any> = {}

for (const path in modules) {
  const mod = modules[path] as any
  const name = path.split('/').pop()!.replace('.vue', '') // 提取文件名作为组件名
  appRegistry[name] = mod.default
}
console.log(appRegistry)
export default defineComponent({
  name: 'Window',
  
  props: {
    window: {
      type: Object as PropType<WindowState>,
      required: true,
    },
  },

  setup(props) {
    const isDragging = ref(false);
    const isResizing = ref(false);
    const dragOffset = ref({ x: 0, y: 0 });
    const windowRef = ref<HTMLElement | null>(null);
    const isAnimating = ref(false);

    // 动画事件处理
    const onWindowEnter = (el: Element) => {
      if (el instanceof HTMLElement) {
        animationService.animateWindowOpen(el);
      }
    };

    const onWindowLeave = (el: Element) => {
      if (el instanceof HTMLElement) {
        animationService.animateWindowClose(el);
      }
    };

    // 窗口控制
    const minimize = async () => {
      if (windowRef.value) {
        // 获取任务栏按钮位置（简化版）
        const taskbarRect = new DOMRect(0, window.innerHeight - 50, 200, 50);
        const animation = animationService.animateWindowMinimize(windowRef.value, taskbarRect);
        
        await animation.finished;
      }
      
      props.window.isMinimized = true;
      props.window.isHidden = true;
      system.minimizeWindow(props.window.id);
      eventBus.emit(SystemEvents.WindowMinimized, props.window);
    };

    const maximize = async () => {
      isAnimating.value = true;
      
      if (windowRef.value) {
        await animationService.animateWindowMaximize(windowRef.value, !props.window.isMaximized).finished;
      }

      if (props.window.isMaximized) {
        // 恢复窗口
        if (props.window.previousPosition) {
          props.window.position = { x: props.window.previousPosition.x, y: props.window.previousPosition.y };
          props.window.size = { width: props.window.previousPosition.width, height: props.window.previousPosition.height };
        }
        props.window.isMaximized = false;
      } else {
        // 保存当前位置和大小
        props.window.previousPosition = {
          x: props.window.position.x,
          y: props.window.position.y,
          width: props.window.size.width,
          height: props.window.size.height
        };
        props.window.isMaximized = true;
      }
      
      system.maximizeWindow(props.window.id);
      eventBus.emit(SystemEvents.WindowMaximized, props.window);
      
      setTimeout(() => {
        isAnimating.value = false;
      }, 100);
    };

    const close = () => {
      // 直接通过窗口ID关闭特定窗口
      const windowIndex = system.getWindows().findIndex(w => w.id === props.window.id);
      if (windowIndex !== -1) {
        system.getWindows().splice(windowIndex, 1);
        eventBus.emit(SystemEvents.WindowClosed, props.window);
      }
    };

    // 拖拽相关
    const startDrag = (e: MouseEvent) => {
      if (props.window.isMaximized) return;
      
      isDragging.value = true;
      const rect = windowRef.value!.getBoundingClientRect();
      dragOffset.value = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
    };

    const onDrag = (e: MouseEvent) => {
      if (!isDragging.value) return;

      const x = e.clientX - dragOffset.value.x;
      const y = e.clientY - dragOffset.value.y;

      Object.assign(props.window.position, { x, y });
    };

    const stopDrag = () => {
      isDragging.value = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    // 调整大小相关
    const currentResizeDirection = ref<string>('');
    
    const startResize = (e: MouseEvent, direction: string = 'se') => {
      if (props.window.isMaximized) return;
      
      isResizing.value = true;
      currentResizeDirection.value = direction;
      document.addEventListener('mousemove', onResize);
      document.addEventListener('mouseup', stopResize);
    };

    const onResize = (e: MouseEvent) => {
      if (!isResizing.value || !windowRef.value) return;

      const rect = windowRef.value.getBoundingClientRect();
      const direction = currentResizeDirection.value;
      
      let newWidth = props.window.size.width;
      let newHeight = props.window.size.height;
      let newX = props.window.position.x;
      let newY = props.window.position.y;

      // 根据方向调整大小和位置
      if (direction.includes('e')) {
        newWidth = e.clientX - rect.left;
      }
      if (direction.includes('s')) {
        newHeight = e.clientY - rect.top;
      }
      if (direction.includes('w')) {
        const deltaX = e.clientX - rect.left;
        newWidth = props.window.size.width - deltaX;
        newX = props.window.position.x + deltaX;
      }
      if (direction.includes('n')) {
        const deltaY = e.clientY - rect.top;
        newHeight = props.window.size.height - deltaY;
        newY = props.window.position.y + deltaY;
      }

      // 限制最小尺寸
      newWidth = Math.max(200, newWidth);
      newHeight = Math.max(150, newHeight);

      // 应用新的尺寸和位置
      props.window.size.width = newWidth;
      props.window.size.height = newHeight;
      props.window.position.x = newX;
      props.window.position.y = newY;
    };

    const stopResize = () => {
      isResizing.value = false;
      document.removeEventListener('mousemove', onResize);
      document.removeEventListener('mouseup', stopResize);
    };

    // 焦点处理
    const focus = () => {
      system.focusWindow(props.window.id);
      eventBus.emit(SystemEvents.WindowFocused, props.window);
    };

    // 窗口标题栏右键菜单
    const handleHeaderContextMenu = (event: MouseEvent) => {
      const items: ContextMenuItem[] = [
        {
          label: '还原',
          icon: '🔄',
          disabled: !props.window.isMaximized && !props.window.isMinimized,
          action: () => {
            if (props.window.isMaximized) {
              maximize(); // 切换最大化状态
            } else if (props.window.isMinimized) {
              minimize(); // 切换最小化状态
            }
          }
        },
        {
          label: '移动',
          icon: '↔️',
          disabled: props.window.isMaximized,
          action: () => {
            // 进入移动模式
            console.log('进入移动模式');
          }
        },
        {
          label: '大小',
          icon: '📏',
          disabled: props.window.isMaximized,
          action: () => {
            // 进入调整大小模式
            console.log('进入调整大小模式');
          }
        },
        {
          label: '最小化',
          icon: '➖',
          disabled: props.window.isMinimized,
          action: minimize
        },
        {
          label: props.window.isMaximized ? '还原' : '最大化',
          icon: props.window.isMaximized ? '🔻' : '🔺',
          action: maximize
        },
        { type: 'separator' },
        {
          label: '关闭',
          icon: '✖️',
          danger: true,
          shortcut: 'Alt+F4',
          action: close
        }
      ];

      showContextMenu({
        x: event.clientX,
        y: event.clientY,
        items,
        title: props.window.title
      });
    };

    onMounted(() => {
      if (windowRef.value) {
        focus();
      }
    });

    onUnmounted(() => {
      stopDrag();
      stopResize();
    });

    return {
      windowRef,
      isAnimating,
      minimize,
      maximize,
      close,
      startDrag,
      startResize,
      focus,
      onWindowEnter,
      onWindowLeave,
      appRegistry, // 暴露给模板
      handleHeaderContextMenu, // 暴露右键菜单处理函数
    };
  },
});
