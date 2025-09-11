import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { documentSystem } from '../../core/api/documents';
import type { DocumentItem } from '../../core/api/documents';

export default defineComponent({
  name: 'BlogApp',
  
  setup() {
    const currentPath = ref('/');
    const currentDocument = ref<DocumentItem | null>(null);
    const documentContent = ref('');
    const searchQuery = ref('');
    const isLoading = ref(false);
    const sidebarVisible = ref(true);
    const viewMode = ref<'tree' | 'list'>('tree');

    // 获取文档列表
    const documents = computed(() => documentSystem.getDocuments(currentPath.value));
    
    // 获取面包屑导航
    const breadcrumbs = computed(() => 
      currentDocument.value 
        ? documentSystem.getBreadcrumbs(currentDocument.value.path)
        : [{ name: '首页', path: '/' }]
    );

    // 搜索结果
    const searchResults = computed(() => 
      searchQuery.value ? documentSystem.searchDocuments(searchQuery.value) : []
    );

    // 推荐文档
    const recommendedDocs = computed(() => documentSystem.getRecommendedDocuments());

    // 最近文档
    const recentDocs = computed(() => documentSystem.getRecentDocuments());

    // 统计信息
    const stats = computed(() => documentSystem.getStats());

    // 加载文档内容
    const loadDocument = async (doc: DocumentItem) => {
      if (doc.type === 'directory') {
        currentPath.value = doc.path;
        currentDocument.value = null;
        documentContent.value = '';
        return;
      }

      isLoading.value = true;
      try {
        currentDocument.value = doc;
        documentContent.value = await documentSystem.getDocumentContent(doc.path);
      } catch (error) {
        console.error('Failed to load document:', error);
        documentContent.value = '# 加载失败\n\n无法加载该文档。';
      } finally {
        isLoading.value = false;
      }
    };

    // 导航到目录
    const navigateToPath = (path: string) => {
      currentPath.value = path;
      currentDocument.value = null;
      documentContent.value = '';
    };

    // 返回上级目录
    const navigateUp = () => {
      const parts = currentPath.value.split('/').filter(p => p);
      if (parts.length > 0) {
        parts.pop();
        currentPath.value = '/' + parts.join('/');
      } else {
        currentPath.value = '/';
      }
      currentDocument.value = null;
      documentContent.value = '';
    };

    // 切换侧边栏
    const toggleSidebar = () => {
      sidebarVisible.value = !sidebarVisible.value;
    };

    // 格式化文件大小
    const formatFileSize = (size: number = 0) => {
      if (size === 0) return '';
      const units = ['B', 'KB', 'MB', 'GB'];
      let index = 0;
      while (size >= 1024 && index < units.length - 1) {
        size /= 1024;
        index++;
      }
      return `${size.toFixed(1)} ${units[index]}`;
    };

    // 格式化日期
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    // 获取文件图标
    const getFileIcon = (item: DocumentItem) => {
      return item.type === 'directory' ? '📁' : '📄';
    };

    // 处理 Markdown 渲染
    const renderMarkdown = (content: string) => {
      // 简单的 Markdown 渲染（生产环境建议使用专业库如 markdown-it）
      return content
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/^\- (.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[h|u|p|c])(.+)$/gm, '<p>$1</p>');
    };

    // 初始化
    onMounted(() => {
      // 加载欢迎文档
      setTimeout(() => {
        const welcomeDoc = documents.value.find(doc => 
          doc.name === '欢迎' || doc.path.includes('欢迎')
        );
        if (welcomeDoc) {
          loadDocument(welcomeDoc);
        }
      }, 100);
    });

    return {
      currentPath,
      currentDocument,
      documentContent,
      searchQuery,
      isLoading,
      sidebarVisible,
      viewMode,
      documents,
      breadcrumbs,
      searchResults,
      recommendedDocs,
      recentDocs,
      stats,
      loadDocument,
      navigateToPath,
      navigateUp,
      toggleSidebar,
      formatFileSize,
      formatDate,
      getFileIcon,
      renderMarkdown
    };
  }
});
