import { createRouter, createWebHistory } from 'vue-router'
import todoList from '../testComponent/todoList.vue'
import conventions from '../testComponent/conventions.vue'
const routes = [
  {path: '/', redirect: '/todolist' },
  {path:'/MeowOS/todolist', component: todoList },
  {path:'/MeowOS/conventions', component: conventions },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
