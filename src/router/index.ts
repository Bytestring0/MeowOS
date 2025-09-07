import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 桌面组件
import Desktop from '@/core/desktop/Desktop.vue'

// 系统应用
import NotesApp from '@/system-apps/notes/NotesApp.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/MeowOS',
    name: 'desktop',
    component: Desktop
  },
  {
    // 处理未匹配的路由，重定向到桌面
    path: '/:pathMatch(.*)*',
    redirect: '/MeowOS'
  }
]

// 动态添加系统应用路由
const systemAppRoutes: RouteRecordRaw[] = [
  {
    path: '/apps/notes',
    name: 'notes',
    component: NotesApp
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...routes, ...systemAppRoutes]
})

// 导航守卫：记录最后访问的路由
router.beforeEach((to, from, next) => {
  if (to.name) {
    localStorage.setItem('lastRoute', to.fullPath)
  }
  next()
})

// 恢复上次会话的路由
const lastRoute = localStorage.getItem('lastRoute')
if (lastRoute) {
  router.push(lastRoute).catch(() => {
    router.push('/')
  })
}

export default router
