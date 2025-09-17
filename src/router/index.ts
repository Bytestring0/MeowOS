import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 桌面组件
import Desktop from '@/core/desktop/Desktop.vue'

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


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...routes]
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
