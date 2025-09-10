import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 导入全局样式
import '@/assets/styles/global.css'

// 导入并应用用户配置
import { system } from '@/core/api/system'
import { easterEggs } from '@/core/services/easterEggs'
import { animationService } from '@/core/services/animationService'


// 初始化彩蛋系统
easterEggs // 触发单例初始化

// 初始化动画系统
animationService // 触发动画服务初始化

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
