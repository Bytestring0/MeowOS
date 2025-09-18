import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import type { PropType } from 'vue';
import { system } from '../api/system';
import type { WindowState } from '../types/system';
import { eventBus, SystemEvents } from '../api/event';
import { animationService } from '../api/animationService';


const modules = import.meta.glob('../../system-apps/*/*.vue', { eager: true })
const appRegistry: Record<string, any> = {}

for (const path in modules) {
  const mod = modules[path] as any
  const name = path.split('/').pop()!.replace('.vue', '') // 提取文件名作为组件名
  appRegistry[name] = mod.default
}

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
        
        const taskbarRect = new DOMRect(0, window.innerHeight - 50, 200, 50);
        const animation = animationService.animateWindowMinimize(windowRef.value, taskbarRect);
        
        await animation.finished;
      }
      
      props.window.isMinimized = true;
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

    const close = async() => {
      // 直接通过窗口ID关闭特定窗口
      const windowIndex = system.getWindows().findIndex(w => w.id === props.window.id);
      if (windowIndex !== -1) {        
        animationService.animateWindowClose(windowRef.value!).finished;
        system.getWindows().splice(windowIndex, 1);
        eventBus.emit(SystemEvents.WindowClosed, props.window);

      }

    };

    // 置顶功能
    const togglePin = () => {
      props.window.isPinned = !props.window.isPinned;
      
      if (props.window.isPinned) {
        props.window.zIndex = 9999;
      } else {
        system.focusWindow(props.window.id);
      }
      
      eventBus.emit(SystemEvents.WindowFocused, props.window);
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
    const resizeStartMouse = ref({ x: 0, y: 0 });
    const resizeStartSize = ref({ width: 0, height: 0 });
    const resizeStartPos = ref({ x: 0, y: 0 });
    
    const startResize = (e: MouseEvent, direction: string = 'se') => {
      if (props.window.isMaximized) return;
      
      isResizing.value = true;
      currentResizeDirection.value = direction;
      resizeStartMouse.value = { x: e.clientX, y: e.clientY };
      resizeStartSize.value = { width: props.window.size.width, height: props.window.size.height };
      resizeStartPos.value = { x: props.window.position.x, y: props.window.position.y };
      document.addEventListener('mousemove', onResize);
      document.addEventListener('mouseup', stopResize);
    };

    const onResize = (e: MouseEvent) => {
      if (!isResizing.value || !windowRef.value) return;

      const direction = currentResizeDirection.value;
      const deltaX = e.clientX - resizeStartMouse.value.x;
      const deltaY = e.clientY - resizeStartMouse.value.y;
      
      let newWidth = resizeStartSize.value.width;
      let newHeight = resizeStartSize.value.height;
      let newX = resizeStartPos.value.x;
      let newY = resizeStartPos.value.y;

      // 根据方向调整大小和位置
      if (direction.includes('e')) {
        newWidth = resizeStartSize.value.width + deltaX;
      }
      if (direction.includes('s')) {
        newHeight = resizeStartSize.value.height + deltaY;
      }
      if (direction.includes('w')) {
        newWidth = resizeStartSize.value.width - deltaX;
        newX = resizeStartPos.value.x + deltaX;
      }
      if (direction.includes('n')) {
        newHeight = resizeStartSize.value.height - deltaY;
        newY = resizeStartPos.value.y + deltaY;
      }

      // 限制最小尺寸
      const minWidth = 200;
      const minHeight = 150;
      
      if (direction.includes('w') && newWidth < minWidth) {
        const diff = minWidth - newWidth;
        newX = newX - diff;
        newWidth = minWidth;
      } else {
        newWidth = Math.max(minWidth, newWidth);
      }
      

      if (direction.includes('n') && newHeight < minHeight) {
        const diff = minHeight - newHeight;
        newY = newY - diff;
        newHeight = minHeight;
      } else {
        newHeight = Math.max(minHeight, newHeight);
      }
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

    onMounted(async () => {
      if (windowRef.value) {
        animationService.animateWindowOpen(windowRef.value);
        focus();
      }

      // 监听窗口恢复事件
      const onWindowRestore = (restoredWindow: any) => {
        if (restoredWindow.id === props.window.id && windowRef.value) {
          animationService.animateWindowRestore(windowRef.value);
        }
      };

      eventBus.on(SystemEvents.WindowRestored, onWindowRestore);

      // 组件卸载时移除事件监听
      onUnmounted(() => {
        eventBus.off(SystemEvents.WindowRestored, onWindowRestore);
      });
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
      togglePin,
      startDrag,
      startResize,
      focus,
      onWindowEnter,
      onWindowLeave,
      appRegistry, 
    };
  },
});
