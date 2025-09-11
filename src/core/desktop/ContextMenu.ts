import { defineComponent, ref, reactive, nextTick } from 'vue';
import { contextMenuAPI } from '../api/contextmenu';
import type { ContextMenuOptions, ContextMenuItem } from '../api/contextmenu';

export default defineComponent({
  name: 'ContextMenu',
  
  setup() {
    const visible = ref(false);
    const position = reactive({ x: 0, y: 0 });
    const items = ref<ContextMenuItem[]>([]);
    const menuRef = ref<HTMLElement>();
    
    // 注册右键菜单处理器
    contextMenuAPI.registerHandler('default', (options: ContextMenuOptions) => {
      showMenu(options);
    });
    
    const showMenu = async (options: ContextMenuOptions) => {
      items.value = options.items;
      visible.value = true;
      
      // 等待DOM更新
      await nextTick();
      
      if (menuRef.value) {
        const menuRect = menuRef.value.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 调整位置以防止超出视口
        position.x = Math.min(options.x, viewportWidth - menuRect.width - 10);
        position.y = Math.min(options.y, viewportHeight - menuRect.height - 10);
      } else {
        position.x = options.x;
        position.y = options.y;
      }
    };
    
    const hideMenu = () => {
      visible.value = false;
      items.value = [];
    };
    
    const handleItemClick = (item: ContextMenuItem) => {
      if (item.disabled) return;
      
      if (item.action) {
        item.action();
      }
      
      hideMenu();
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (visible.value && menuRef.value && !menuRef.value.contains(event.target as Node)) {
        hideMenu();
      }
    };
    
    // 监听全局点击事件
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('contextmenu', hideMenu);
    
    // 监听隐藏事件
    contextMenuAPI.registerHandler('hide-all', hideMenu);
    
    return {
      visible,
      position,
      items,
      menuRef,
      handleItemClick,
      hideMenu
    };
  }
});
