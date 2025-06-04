import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/main.css'
import { ElMessage } from 'element-plus'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(`ElIcon${key}`, component)
}

// 全局对象
app.config.globalProperties.$message = ElMessage

app.use(router)
app.use(ElementPlus)
app.mount('#app') 