import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import type { PropType } from 'vue';
import { system } from '../api/system';
import type { WindowState } from '../types/system';
import { eventBus, SystemEvents } from '../services/eventBus';

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

    // 窗口控制
    const minimize = () => {
      system.minimizeWindow(props.window.id);
      eventBus.emit(SystemEvents.WindowMinimized, props.window);
    };

    const maximize = () => {
      system.maximizeWindow(props.window.id);
      eventBus.emit(SystemEvents.WindowMaximized, props.window);
    };

    const close = () => {
      system.closeApp(props.window.id.split('-')[0]);
      eventBus.emit(SystemEvents.WindowClosed, props.window);
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

      // 更新窗口位置
      Object.assign(props.window.position, { x, y });
    };

    const stopDrag = () => {
      isDragging.value = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    // 调整大小相关
    const startResize = (e: MouseEvent) => {
      if (props.window.isMaximized) return;
      
      isResizing.value = true;
      document.addEventListener('mousemove', onResize);
      document.addEventListener('mouseup', stopResize);
    };

    const onResize = (e: MouseEvent) => {
      if (!isResizing.value || !windowRef.value) return;

      const rect = windowRef.value.getBoundingClientRect();
      const width = e.clientX - rect.left;
      const height = e.clientY - rect.top;

      // 限制最小尺寸
      props.window.size.width = Math.max(200, width);
      props.window.size.height = Math.max(150, height);
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
      minimize,
      maximize,
      close,
      startDrag,
      startResize,
      focus,
    };
  },
});
