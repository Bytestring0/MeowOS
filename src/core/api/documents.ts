export interface DocumentItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  content?: string;
  size?: number;
  modified: Date;
  created: Date;
  children?: DocumentItem[];
}

export interface DocumentSystemState {
  currentPath: string;
  documents: DocumentItem[];
  loaded: boolean;
}

class DocumentSystemAPI {
  private state: DocumentSystemState = {
    currentPath: '/',
    documents: [],
    loaded: false
  };

  private cache = new Map<string, string>();

  constructor() {
    this.loadDocuments();
  }

  private async loadDocuments() {
    try {
      // 使用 Vite 的 glob 功能扫描文档目录
      const markdownFiles = import.meta.glob('../../documents/**/*.md', { 
        query: '?raw',
        import: 'default',
        eager: false 
      });

      console.log('Available markdown files:', Object.keys(markdownFiles));

      const documents: DocumentItem[] = [];
      const pathMap = new Map<string, DocumentItem>();

      // 创建目录结构
      for (const path in markdownFiles) {
        const relativePath = path.replace('../../documents', '');
        const parts = relativePath.split('/').filter(p => p);
        const fileName = parts.pop() || '';
        const dirPath = '/' + parts.join('/');

        // 创建目录结构
        let currentPath = '';
        for (let i = 0; i < parts.length; i++) {
          currentPath += '/' + parts[i];
          if (!pathMap.has(currentPath)) {
            const dirItem: DocumentItem = {
              id: currentPath,
              name: parts[i],
              type: 'directory',
              path: currentPath,
              children: [],
              modified: new Date(),
              created: new Date()
            };
            pathMap.set(currentPath, dirItem);
            
            if (i === 0) {
              documents.push(dirItem);
            } else {
              const parentPath = '/' + parts.slice(0, i).join('/');
              const parent = pathMap.get(parentPath);
              if (parent) {
                parent.children = parent.children || [];
                parent.children.push(dirItem);
              }
            }
          }
        }

        // 创建文件
        const fileItem: DocumentItem = {
          id: relativePath,
          name: fileName.replace('.md', ''),
          type: 'file',
          path: relativePath, // 保留完整路径包括.md后缀
          modified: new Date(),
          created: new Date(),
          size: 0
        };

        if (dirPath === '/') {
          documents.push(fileItem);
        } else {
          const parent = pathMap.get(dirPath);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(fileItem);
          }
        }
      }

      this.state.documents = documents;
      this.state.loaded = true;
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  }

  // 获取文档列表
  getDocuments(path: string = '/'): DocumentItem[] {
    if (path === '/') {
      return this.state.documents;
    }

    const findByPath = (items: DocumentItem[], targetPath: string): DocumentItem | null => {
      for (const item of items) {
        if (item.path === targetPath) {
          return item;
        }
        if (item.children) {
          const found = findByPath(item.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const item = findByPath(this.state.documents, path);
    return item?.children || [];
  }

  // 获取文档内容
  async getDocumentContent(path: string): Promise<string> {
    
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    try {
      // 动态导入文档内容
      const markdownFiles = import.meta.glob('../../documents/**/*.md', { 
        query: '?raw',
        import: 'default',
        eager: false 
      });
      
      // 找到对应的文件路径 - 不需要添加.md后缀，因为path已经包含了
      const fullPath = `../../documents${path}`;
      
      const moduleLoader = markdownFiles[fullPath];
      
      if (moduleLoader) {
        const content = await moduleLoader();
        this.cache.set(path, content as string);
        return content as string;
      } else {
        console.error('No module loader found for:', fullPath);
        console.log('Available paths:', Object.keys(markdownFiles));
        throw new Error(`Document not found: ${path}`);
      }
    } catch (error) {
      console.error(`Failed to load document: ${path}`, error);
      return `# 文档加载失败\n\n无法加载文档：${path}\n\n错误信息：${error}`;
    }
  }

  // 搜索文档
  searchDocuments(query: string): DocumentItem[] {
    const results: DocumentItem[] = [];
    
    const search = (items: DocumentItem[]) => {
      for (const item of items) {
        if (item.name.toLowerCase().includes(query.toLowerCase())) {
          results.push(item);
        }
        if (item.children) {
          search(item.children);
        }
      }
    };

    search(this.state.documents);
    return results;
  }

  // 获取面包屑导航
  getBreadcrumbs(path: string): { name: string; path: string }[] {
    const parts = path.split('/').filter(p => p);
    const breadcrumbs = [{ name: '首页', path: '/' }];
    
    let currentPath = '';
    for (const part of parts) {
      currentPath += '/' + part;
      breadcrumbs.push({
        name: part,
        path: currentPath
      });
    }
    
    return breadcrumbs;
  }

  // 获取文档统计信息
  getStats() {
    let fileCount = 0;
    let directoryCount = 0;

    const count = (items: DocumentItem[]) => {
      for (const item of items) {
        if (item.type === 'file') {
          fileCount++;
        } else {
          directoryCount++;
        }
        if (item.children) {
          count(item.children);
        }
      }
    };

    count(this.state.documents);

    return {
      fileCount,
      directoryCount,
      totalItems: fileCount + directoryCount,
      loaded: this.state.loaded
    };
  }

  // 获取最近文档
  getRecentDocuments(limit: number = 5): DocumentItem[] {
    const allFiles: DocumentItem[] = [];
    
    const collect = (items: DocumentItem[]) => {
      for (const item of items) {
        if (item.type === 'file') {
          allFiles.push(item);
        }
        if (item.children) {
          collect(item.children);
        }
      }
    };

    collect(this.state.documents);
    
    return allFiles
      .sort((a, b) => b.modified.getTime() - a.modified.getTime())
      .slice(0, limit);
  }

  // 获取推荐文档
  getRecommendedDocuments(): DocumentItem[] {
    const recommended = [
      '/开始/欢迎',
      '/教程/快速入门指南',
      '/技术文档/应用开发指南'
    ];

    const results: DocumentItem[] = [];
    
    const findByPath = (items: DocumentItem[], targetPath: string): DocumentItem | null => {
      for (const item of items) {
        if (item.path === targetPath) {
          return item;
        }
        if (item.children) {
          const found = findByPath(item.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    for (const path of recommended) {
      const item = findByPath(this.state.documents, path);
      if (item) {
        results.push(item);
      }
    }

    return results;
  }

  // 检查是否已加载
  isLoaded(): boolean {
    return this.state.loaded;
  }
}

export const documentSystem = new DocumentSystemAPI();
