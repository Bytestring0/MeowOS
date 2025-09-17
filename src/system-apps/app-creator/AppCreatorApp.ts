import { defineComponent, ref, reactive, onMounted } from 'vue';
import { storage } from '../../core/api/storage';
import { system } from '../../core/api/system';
import type { AppManifest } from '../../core/types/system';
import Swal from 'sweetalert2';
export interface CustomAppData {
  id: string;
  name: string;
  url: string;
  icon: string;
  description?: string;
  created: number;
}

export default defineComponent({
  name: 'AppCreatorApp',
  setup() {
    const isCreating = ref(false);
    const customApps = ref<CustomAppData[]>([]);
    const isLoading = ref(false);
    
    const formData = reactive({
      name: '',
      url: '',
      description: ''
    });

    const formErrors = reactive({
      name: '',
      url: ''
    });

    // 加载已创建的应用
    onMounted(async () => {
      await loadCustomApps();
    });

    async function loadCustomApps() {
      try {
        const stored = await storage.get('custom-apps');
        if (stored) {
          customApps.value = stored;
        }
      } catch (error) {
        console.error('加载自定义应用失败:', error);
      }
    }

    async function saveCustomApps() {
      try {
        await storage.set('custom-apps', customApps.value);
      } catch (error) {
        console.error('保存自定义应用失败:', error);
      }
    }

    function validateForm(): boolean {
      formErrors.name = '';
      formErrors.url = '';

      if (!formData.name.trim()) {
        formErrors.name = '请输入应用名称';
        return false;
      }

      if (!formData.url.trim()) {
        formErrors.url = '请输入网站URL';
        return false;
      }

      try {
        new URL(formData.url);
      } catch {
        formErrors.url = '请输入有效的URL';
        return false;
      }

      return true;
    }

    async function getFaviconUrl(url: string): Promise<string> {
      try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        // 尝试多种方式获取图标
        const faviconUrls = [
          `${urlObj.protocol}//${domain}/favicon.ico`,
          `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
          `https://api.faviconkit.com/${domain}/64`,
          `https://icons.duckduckgo.com/ip3/${domain}.ico`
        ];

        // 测试第一个可用的图标
        for (const faviconUrl of faviconUrls) {
          try {
            const response = await fetch(faviconUrl, { 
              method: 'HEAD',
              mode: 'no-cors'
            });
            return faviconUrl;
          } catch {
            continue;
          }
        }

        // 如果都失败了，使用Google的服务
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch {
        // 如果URL解析失败，返回默认图标
        return '/icons/default-app.svg';
      }
    }

    async function createApp() {
      if (!validateForm()) return;

      isLoading.value = true;
      
      try {
        // 生成唯一ID
        const appId = `custom-${Date.now()}`;
        
        // 获取网站图标
        const iconUrl = await getFaviconUrl(formData.url);
        
        // 创建应用数据
        const newApp: CustomAppData = {
          id: appId,
          name: formData.name.trim(),
          url: formData.url.trim(),
          icon: iconUrl,
          description: formData.description.trim() || `访问 ${formData.name}`,
          created: Date.now()
        };

        // 添加到列表
        customApps.value.push(newApp);
        
        // 保存到存储
        await saveCustomApps();
        
        // 动态添加到系统应用列表
        addToSystemApps(newApp);
        
        // 重置表单
        formData.name = '';
        formData.url = '';
        formData.description = '';
        isCreating.value = false;

        Swal.fire('应用创建成功！');

      } catch (error) {
        console.error('创建应用失败:', error);
        Swal.fire('创建应用失败，请重试');
      } finally {
        isLoading.value = false;
      }
    }

    function addToSystemApps(appData: CustomAppData) {
      // 创建自定义应用的manifest，使用特殊的entry来标识直接打开URL
      const manifest: AppManifest = {
        id: appData.id,
        name: appData.name,
        version: '1.0.0',
        description: appData.description || '',
        icon: appData.icon,
        entry: 'DirectUrl', // 使用特殊标识，不使用WebApp组件
        category: 'custom',
        type: 'app',
        singleInstance: false,
        permissions: ['network'],
        settings: {
          url: appData.url,
          isCustomApp: true,
          openInNewTab: true // 标记需要在新标签页打开
        }
      };

      // 添加到系统应用列表
      system.addCustomApp(manifest);
    }

    async function deleteApp(appId: string) {
      if (confirm('确定要删除这个应用吗？')) {
        customApps.value = customApps.value.filter(app => app.id !== appId);
        await saveCustomApps();
        
        // 从系统中移除应用
        system.removeCustomApp(appId);
      }
    }

    function openCreateForm() {
      isCreating.value = true;
      formData.name = '';
      formData.url = '';
      formData.description = '';
      formErrors.name = '';
      formErrors.url = '';
    }

    function cancelCreate() {
      isCreating.value = false;
    }

    function handleIconError(event: Event) {
      const target = event.target as HTMLImageElement;
      target.src = '/icons/default-app.svg';
    }

    function formatDate(timestamp: number): string {
      return new Date(timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    function openApp(app: CustomAppData) {
      // 直接在新标签页中打开URL
      window.open(app.url, '_blank', 'noopener,noreferrer');
    }

    return {
      isCreating,
      customApps,
      isLoading,
      formData,
      formErrors,
      openCreateForm,
      cancelCreate,
      createApp,
      deleteApp,
      handleIconError,
      formatDate,
      openApp
    };
  }
});
