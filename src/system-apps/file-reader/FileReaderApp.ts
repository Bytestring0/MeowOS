import { defineComponent, ref, onMounted, computed } from 'vue';
import { documentSystem } from '../../core/api/documents';
import { system } from '../../core/api/system';
import type { DocumentItem } from '../../core/api/documents';

export default defineComponent({
  name: 'FileReaderApp',
  setup() {
    const currentPath = ref('/');
    const documents = ref<DocumentItem[]>([]);
    const searchQuery = ref('');
    const loading = ref(true);
    const viewMode = ref<'grid' | 'list'>('grid');

    // 过滤后的文档
    const filteredDocuments = computed(() => {
      if (!searchQuery.value) return documents.value;
      return documentSystem.searchDocuments(searchQuery.value);
    });

    // 面包屑导航
    const breadcrumbs = computed(() => {
      return documentSystem.getBreadcrumbs(currentPath.value);
    });

    // 统计信息
    const stats = computed(() => {
      return documentSystem.getStats();
    });

    // 推荐文档
    const recommendedDocs = ref<DocumentItem[]>([]);

    // 加载文档
    const loadDocuments = async () => {
      loading.value = true;
      try {
        documents.value = documentSystem.getDocuments(currentPath.value);
        if (currentPath.value === '/') {
          recommendedDocs.value = documentSystem.getRecommendedDocuments();
        }
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        loading.value = false;
      }
    };

    // 导航到指定路径
    const navigateToPath = (path: string) => {
      currentPath.value = path;
      loadDocuments();
    };

    // 打开文档
    const openDocument = async (doc: DocumentItem) => {
      if (doc.type === 'directory') {
        navigateToPath(doc.path);
      } else {
        // 检查是否已经有文本阅读器窗口打开
        const existingWindow = system.getWindows().find(w => w.id.startsWith('system-text-reader'));
        
        if (existingWindow && !existingWindow.isMinimized) {
          // 如果已有窗口打开，直接更新文档内容
          const documentInfo = {
            path: doc.path,
            name: doc.name,
            timestamp: Date.now()
          };
          
          localStorage.setItem('textReader_pendingDocument', JSON.stringify(documentInfo));
          
          // 触发窗口更新事件
          const event = new CustomEvent('updateDocument', { 
            detail: { documentPath: doc.path, documentName: doc.name } 
          });
          window.dispatchEvent(event);
          
          // 聚焦到已存在的窗口
          system.focusWindow(existingWindow.id);
        } else {
          // 打开新的文本阅读器窗口
          const documentInfo = {
            path: doc.path,
            name: doc.name,
            timestamp: Date.now()
          };
          
          localStorage.setItem('textReader_pendingDocument', JSON.stringify(documentInfo));
          
          await system.openApp('system-text-reader', {
            title: `文本阅读器 - ${doc.name}`,
          });
        }
      }
    };

    // 返回上级目录
    const goBack = () => {
      const parts = currentPath.value.split('/').filter(p => p);
      if (parts.length > 0) {
        parts.pop();
        navigateToPath('/' + parts.join('/'));
      }
    };

    // 获取封面图片
    const getCoverImage = (doc: DocumentItem): string => {
      // 为不同类别返回不同的封面图
      const category = currentPath.value.split('/')[1] || 'default';
      const coverMap: Record<string, string> = {
        '开始': '/wallpapers/default.svg',
        '教程': '/wallpapers/geometric_theme.svg', 
        '技术文档': '/wallpapers/cyberpunk.svg',
        '博客': '/wallpapers/pastel_circles.svg',
        'default': '/wallpapers/glass_theme.svg'
      };
      return coverMap[category] || coverMap.default;
    };

    // 获取文档摘要
    const getDocumentSummary = (doc: DocumentItem): string => {
      // 简单的摘要生成逻辑
      const summaries: Record<string, string> = {
        '欢迎': '开始您的MeowOS之旅，了解基本功能和特性',
        '快速入门指南': '学习如何快速上手使用MeowOS系统',
        '应用开发指南': '详细介绍如何为MeowOS开发自定义应用',
        '主题定制教程': '学习如何创建和定制您专属的主题风格',
        '关于': '了解更多关于MeowOS项目的背景和理念',
        '欢迎使用博客系统': '探索内置的博客功能和写作工具'
      };
      return summaries[doc.name] || `${doc.name}的详细内容，包含丰富的信息和实用指导`;
    };

    // 格式化日期
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    onMounted(async () => {
      // 等待文档系统加载完成
      const checkLoaded = () => {
        if (documentSystem.isLoaded()) {
          loadDocuments();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
    });

    return {
      currentPath,
      documents,
      searchQuery,
      loading,
      viewMode,
      filteredDocuments,
      breadcrumbs,
      stats,
      recommendedDocs,
      loadDocuments,
      navigateToPath,
      openDocument,
      goBack,
      getCoverImage,
      getDocumentSummary,
      formatDate
    };
  }
});
