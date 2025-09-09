import { defineComponent, ref, onMounted, computed } from 'vue';
import { fileSystem } from '../../core/api/filesystem';
import type { FileNode } from '../../core/api/filesystem';

export default defineComponent({
  name: 'FileManagerApp',
  setup() {
    const currentPath = ref('/');
    const files = ref<FileNode[]>([]);
    const selectedFile = ref<FileNode | null>(null);
    const showNewDialog = ref(false);
    const newItemType = ref<'file' | 'directory'>('file');
    const newItemName = ref('');
    const viewMode = ref<'list' | 'grid'>('list');
    const searchQuery = ref('');

    // 加载当前路径下的文件
    const loadFiles = async () => {
      try {
        const node = await fileSystem.getNodeByPath(currentPath.value);
        if (node) {
          files.value = await fileSystem.getChildren(node.id);
        } else {
          files.value = [];
        }
      } catch (error) {
        console.error('Failed to load files:', error);
        files.value = [];
      }
    };

    onMounted(() => {
      loadFiles();
    });

    // 导航到文件夹
    const navigateToFolder = async (folder: FileNode) => {
      if (folder.type === 'directory') {
        currentPath.value = folder.path;
        await loadFiles();
        selectedFile.value = null;
      }
    };

    // 返回上级目录
    const navigateUp = async () => {
      if (currentPath.value !== '/') {
        const pathParts = currentPath.value.split('/').filter(p => p);
        pathParts.pop(); // 移除最后一个部分
        currentPath.value = pathParts.length > 0 ? '/' + pathParts.join('/') : '/';
        await loadFiles();
        selectedFile.value = null;
      }
    };

    // 创建新文件或文件夹
    const createNewItem = async () => {
      if (!newItemName.value.trim()) return;
      
      try {
        const currentNode = await fileSystem.getNodeByPath(currentPath.value);
        if (!currentNode) return;
        
        if (newItemType.value === 'directory') {
          await fileSystem.createDirectory(newItemName.value, currentNode.id);
        } else {
          await fileSystem.createFile(newItemName.value, currentNode.id, '');
        }
        
        await loadFiles();
        showNewDialog.value = false;
        newItemName.value = '';
      } catch (error) {
        console.error('Failed to create item:', error);
      }
    };

    // 删除文件
    const deleteFile = async (file: FileNode) => {
      if (confirm(`确定要删除 ${file.name} 吗？`)) {
        try {
          await fileSystem.deleteNode(file.id);
          await loadFiles();
          if (selectedFile.value?.id === file.id) {
            selectedFile.value = null;
          }
        } catch (error) {
          console.error('Failed to delete file:', error);
        }
      }
    };

    // 打开文件编辑
    const editFile = async (file: FileNode) => {
      if (file.type === 'file') {
        try {
          const content = await fileSystem.readFile(file.id);
          const newContent = prompt('编辑文件内容:', typeof content === 'string' ? content : '');
          if (newContent !== null) {
            await fileSystem.writeFile(file.id, newContent);
            await loadFiles();
          }
        } catch (error) {
          console.error('Failed to edit file:', error);
        }
      }
    };

    // 搜索功能
    const filteredFiles = computed(() => {
      if (!searchQuery.value.trim()) {
        return files.value;
      }
      return files.value.filter(file =>
        file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    // 格式化文件大小
    const formatFileSize = (size?: number) => {
      if (!size) return '-';
      const units = ['B', 'KB', 'MB', 'GB'];
      let index = 0;
      let fileSize = size;
      
      while (fileSize >= 1024 && index < units.length - 1) {
        fileSize /= 1024;
        index++;
      }
      
      return `${fileSize.toFixed(1)} ${units[index]}`;
    };

    // 格式化日期
    const formatDate = (date: Date) => {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return {
      currentPath,
      files: filteredFiles,
      selectedFile,
      showNewDialog,
      newItemType,
      newItemName,
      viewMode,
      searchQuery,
      loadFiles,
      navigateToFolder,
      navigateUp,
      createNewItem,
      deleteFile,
      editFile,
      formatFileSize,
      formatDate,
    };
  },
});
