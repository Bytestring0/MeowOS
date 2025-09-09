import { storage } from './storage'

export interface FileNode {
  id: string
  name: string
  type: 'file' | 'directory'
  path: string
  parentId?: string
  size?: number
  mimeType?: string
  content?: string | Uint8Array
  createdAt: Date
  modifiedAt: Date
  permissions: {
    read: boolean
    write: boolean
    execute: boolean
  }
  metadata?: Record<string, any>
}

export interface FileSystemStats {
  totalSize: number
  usedSize: number
  freeSize: number
  totalFiles: number
  totalDirectories: number
}

class FileSystemAPI {
  private readonly ROOT_ID = 'root'
  private readonly STORAGE_KEY = 'filesystem'
  private readonly PUBLIC_ROOT = '/root/'
  
  constructor() {
    this.initializeFileSystem()
  }
  
  private async initializeFileSystem() {
    const existing = await storage.get(this.STORAGE_KEY)
    if (!existing) {
      // 先尝试从public/root加载真实文件，如果失败则创建默认结构
      try {
        await this.loadFromPublicRoot()
      } catch (error) {
        console.warn('Failed to load from public/root, creating default structure:', error)
        await this.createDefaultStructure()
      }
    }
  }
  
  private async loadFromPublicRoot() {
    // 创建根目录
    const rootDir: FileNode = {
      id: this.ROOT_ID,
      name: 'root',
      type: 'directory',
      path: '/',
      createdAt: new Date(),
      modifiedAt: new Date(),
      permissions: { read: true, write: true, execute: true }
    }
    
    const nodes: Record<string, FileNode> = { [this.ROOT_ID]: rootDir }
    
    // 尝试加载public/root下的文件和目录
    try {
      await this.scanDirectory('/', nodes, this.ROOT_ID)
    } catch (error) {
      console.error('Error scanning directory:', error)
    }
    
    await storage.set(this.STORAGE_KEY, nodes)
  }
  
  private async scanDirectory(relativePath: string, nodes: Record<string, FileNode>, parentId: string) {
    const publicPath = this.PUBLIC_ROOT + relativePath.substring(1) // 移除开头的 /
    
    try {
      // 尝试读取目录内容
      const response = await fetch(publicPath)
      if (response.ok) {
        const html = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const links = doc.querySelectorAll('a[href]')
        
        for (const link of links) {
          const href = link.getAttribute('href')
          if (!href || href === '../' || href.startsWith('?') || href.startsWith('#')) continue
          
          const name = decodeURIComponent(href.replace(/\/$/, ''))
          if (name === '.' || name === '..') continue
          
          const isDirectory = href.endsWith('/')
          const childPath = relativePath === '/' ? `/${name}` : `${relativePath}/${name}`
          const id = this.generateId()
          
          const node: FileNode = {
            id,
            name,
            type: isDirectory ? 'directory' : 'file',
            path: childPath,
            parentId,
            createdAt: new Date(),
            modifiedAt: new Date(),
            permissions: { read: true, write: true, execute: isDirectory }
          }
          
          if (!isDirectory) {
            // 对于文件，尝试获取内容
            try {
              const fileResponse = await fetch(publicPath + href)
              if (fileResponse.ok) {
                const content = await fileResponse.text()
                node.content = content
                node.size = content.length
                node.mimeType = this.getMimeType(name)
              }
            } catch (error) {
              console.warn(`Failed to load file content for ${name}:`, error)
            }
          }
          
          nodes[id] = node
          
          // 递归扫描子目录
          if (isDirectory) {
            await this.scanDirectory(childPath, nodes, id)
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to scan directory ${publicPath}:`, error)
    }
  }
  
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      'txt': 'text/plain',
      'md': 'text/markdown',
      'json': 'application/json',
      'js': 'text/javascript',
      'ts': 'text/typescript',
      'html': 'text/html',
      'css': 'text/css',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf'
    }
    return mimeTypes[ext || ''] || 'application/octet-stream'
  }
  
  private async createDefaultStructure() {
    // 创建根目录
    const rootDir: FileNode = {
      id: this.ROOT_ID,
      name: 'root',
      type: 'directory',
      path: '/',
      createdAt: new Date(),
      modifiedAt: new Date(),
      permissions: { read: true, write: true, execute: true }
    }
    
    // 创建默认目录结构
    const defaultDirs = [
      { name: 'Desktop', path: '/Desktop' },
      { name: 'Documents', path: '/Documents' },
      { name: 'Downloads', path: '/Downloads' },
      { name: 'Pictures', path: '/Pictures' },
      { name: 'Music', path: '/Music' },
      { name: 'Videos', path: '/Videos' },
      { name: 'Applications', path: '/Applications' },
      { name: 'System', path: '/System' }
    ]
    
    const nodes: Record<string, FileNode> = { [this.ROOT_ID]: rootDir }
    
    defaultDirs.forEach(dir => {
      const id = this.generateId()
      nodes[id] = {
        id,
        name: dir.name,
        type: 'directory',
        path: dir.path,
        parentId: this.ROOT_ID,
        createdAt: new Date(),
        modifiedAt: new Date(),
        permissions: { read: true, write: true, execute: true }
      }
    })
    
    await storage.set(this.STORAGE_KEY, nodes)
  }
  
  private generateId(): string {
    return `fs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private async getNodes(): Promise<Record<string, FileNode>> {
    return await storage.get(this.STORAGE_KEY) || {}
  }
  
  private async saveNodes(nodes: Record<string, FileNode>) {
    await storage.set(this.STORAGE_KEY, nodes)
  }
  
  // 获取根目录
  async getRoot(): Promise<FileNode> {
    const nodes = await this.getNodes()
    return nodes[this.ROOT_ID]
  }
  
  // 根据路径获取节点
  async getNodeByPath(path: string): Promise<FileNode | null> {
    const nodes = await this.getNodes()
    const node = Object.values(nodes).find(n => n.path === path)
    return node || null
  }
  
  // 根据ID获取节点
  async getNodeById(id: string): Promise<FileNode | null> {
    const nodes = await this.getNodes()
    return nodes[id] || null
  }
  
  // 获取目录的子节点
  async getChildren(parentId: string): Promise<FileNode[]> {
    const nodes = await this.getNodes()
    return Object.values(nodes).filter(node => node.parentId === parentId)
  }
  
  // 创建目录
  async createDirectory(name: string, parentId: string): Promise<FileNode> {
    const nodes = await this.getNodes()
    const parent = nodes[parentId]
    
    if (!parent || parent.type !== 'directory') {
      throw new Error('Parent directory not found')
    }
    
    const path = parent.path === '/' ? `/${name}` : `${parent.path}/${name}`
    const id = this.generateId()
    
    const newDir: FileNode = {
      id,
      name,
      type: 'directory',
      path,
      parentId,
      createdAt: new Date(),
      modifiedAt: new Date(),
      permissions: { read: true, write: true, execute: true }
    }
    
    nodes[id] = newDir
    await this.saveNodes(nodes)
    
    return newDir
  }
  
  // 创建文件
  async createFile(
    name: string, 
    parentId: string, 
    content: string | Uint8Array = '', 
    mimeType?: string
  ): Promise<FileNode> {
    const nodes = await this.getNodes()
    const parent = nodes[parentId]
    
    if (!parent || parent.type !== 'directory') {
      throw new Error('Parent directory not found')
    }
    
    const path = parent.path === '/' ? `/${name}` : `${parent.path}/${name}`
    const id = this.generateId()
    
    const newFile: FileNode = {
      id,
      name,
      type: 'file',
      path,
      parentId,
      content,
      mimeType,
      size: typeof content === 'string' ? content.length : content.length,
      createdAt: new Date(),
      modifiedAt: new Date(),
      permissions: { read: true, write: true, execute: false }
    }
    
    nodes[id] = newFile
    await this.saveNodes(nodes)
    
    return newFile
  }
  
  // 读取文件内容
  async readFile(id: string): Promise<string | Uint8Array | null> {
    const node = await this.getNodeById(id)
    if (!node || node.type !== 'file') {
      return null
    }
    return node.content || null
  }
  
  // 写入文件内容
  async writeFile(id: string, content: string | Uint8Array): Promise<void> {
    const nodes = await this.getNodes()
    const node = nodes[id]
    
    if (!node || node.type !== 'file') {
      throw new Error('File not found')
    }
    
    node.content = content
    node.size = typeof content === 'string' ? content.length : content.length
    node.modifiedAt = new Date()
    
    await this.saveNodes(nodes)
  }
  
  // 删除节点
  async deleteNode(id: string): Promise<void> {
    const nodes = await this.getNodes()
    const node = nodes[id]
    
    if (!node) {
      throw new Error('Node not found')
    }
    
    // 如果是目录，递归删除子节点
    if (node.type === 'directory') {
      const children = await this.getChildren(id)
      for (const child of children) {
        await this.deleteNode(child.id)
      }
    }
    
    delete nodes[id]
    await this.saveNodes(nodes)
  }
  
  // 重命名节点
  async renameNode(id: string, newName: string): Promise<void> {
    const nodes = await this.getNodes()
    const node = nodes[id]
    
    if (!node) {
      throw new Error('Node not found')
    }
    
    const parent = node.parentId ? nodes[node.parentId] : null
    const newPath = parent && parent.path !== '/' 
      ? `${parent.path}/${newName}` 
      : `/${newName}`
    
    node.name = newName
    node.path = newPath
    node.modifiedAt = new Date()
    
    // 更新子节点路径
    if (node.type === 'directory') {
      await this.updateChildrenPaths(nodes, id, newPath)
    }
    
    await this.saveNodes(nodes)
  }
  
  // 移动节点
  async moveNode(id: string, newParentId: string): Promise<void> {
    const nodes = await this.getNodes()
    const node = nodes[id]
    const newParent = nodes[newParentId]
    
    if (!node || !newParent || newParent.type !== 'directory') {
      throw new Error('Invalid move operation')
    }
    
    const newPath = newParent.path === '/' 
      ? `/${node.name}` 
      : `${newParent.path}/${node.name}`
    
    node.parentId = newParentId
    node.path = newPath
    node.modifiedAt = new Date()
    
    // 更新子节点路径
    if (node.type === 'directory') {
      await this.updateChildrenPaths(nodes, id, newPath)
    }
    
    await this.saveNodes(nodes)
  }
  
  private async updateChildrenPaths(
    nodes: Record<string, FileNode>, 
    parentId: string, 
    newParentPath: string
  ) {
    const children = Object.values(nodes).filter(n => n.parentId === parentId)
    
    for (const child of children) {
      child.path = newParentPath === '/' 
        ? `/${child.name}` 
        : `${newParentPath}/${child.name}`
      
      if (child.type === 'directory') {
        await this.updateChildrenPaths(nodes, child.id, child.path)
      }
    }
  }
  
  // 获取文件系统统计信息
  async getStats(): Promise<FileSystemStats> {
    const nodes = await this.getNodes()
    const allNodes = Object.values(nodes)
    
    let totalSize = 0
    let totalFiles = 0
    let totalDirectories = 0
    
    allNodes.forEach(node => {
      if (node.type === 'file') {
        totalFiles++
        totalSize += node.size || 0
      } else {
        totalDirectories++
      }
    })
    
    return {
      totalSize,
      usedSize: totalSize,
      freeSize: Number.MAX_SAFE_INTEGER - totalSize, // 虚拟的剩余空间
      totalFiles,
      totalDirectories
    }
  }
  
  // 搜索文件
  async search(query: string, parentId?: string): Promise<FileNode[]> {
    const nodes = await this.getNodes()
    let searchNodes = Object.values(nodes)
    
    if (parentId) {
      // 只在指定目录及其子目录中搜索
      const getDescendants = (id: string): string[] => {
        const children = searchNodes.filter(n => n.parentId === id)
        const result = children.map(c => c.id)
        children.forEach(child => {
          if (child.type === 'directory') {
            result.push(...getDescendants(child.id))
          }
        })
        return result
      }
      
      const descendantIds = getDescendants(parentId)
      searchNodes = searchNodes.filter(n => descendantIds.includes(n.id))
    }
    
    return searchNodes.filter(node => 
      node.name.toLowerCase().includes(query.toLowerCase())
    )
  }
}

export const fileSystem = new FileSystemAPI()
