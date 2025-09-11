import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/assets/styles/global.css'

import { system } from '@/core/api/system'
import { easterEggs } from '@/core/api/easterEggs'
import { animationService } from '@/core/api/animationService'



//easterEggs


animationService 

const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  console.error("捕获到全局错误：", err);
  console.error("出错的组件实例：", instance);
  console.error("错误信息：", info);

};

app.use(createPinia())
app.use(router)

app.mount('#app')
